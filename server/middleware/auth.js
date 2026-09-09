/**
 * POLISH Media Co — Admin Authentication Middleware
 * 
 * Supports dual-factor administrative authentication:
 * 1. Firebase Auth ID Token (Google Sign-In / Email login)
 *    - Validates signature & validity against Google Identity Toolkit
 *    - Enforces ADMIN_EMAILS whitelist (e.g. polishmediaco@gmail.com, choulif.work@gmail.com)
 * 2. Fallback Admin API Key (x-api-key header or ?key= query)
 *    - For CI/CD, curl, or emergency recovery
 */

const tokenCache = new Map(); // token -> { user, expiresAt }

function getAdminEmails() {
  const envEmails = process.env.ADMIN_EMAILS || 'polishmediaco@gmail.com,choulif.work@gmail.com';
  return envEmails
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Validates a Firebase ID token using Google Identity Toolkit API.
 * Uses an in-memory 5-minute cache to avoid external network latency on rapid calls.
 */
async function verifyFirebaseIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') return null;

  const now = Date.now();
  const cached = tokenCache.get(idToken);
  if (cached && cached.expiresAt > now) {
    return cached.user;
  }

  const apiKey = process.env.FIREBASE_API_KEY;
  if (!apiKey) {
    console.error('[Auth] FIREBASE_API_KEY not configured in environment.');
    return null;
  }

  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken })
    });

    if (!res.ok) {
      tokenCache.delete(idToken);
      return null;
    }

    const data = await res.json();
    if (data && data.users && data.users[0]) {
      const u = data.users[0];
      const user = {
        uid: u.localId,
        email: (u.email || '').toLowerCase(),
        displayName: u.displayName || (u.email ? u.email.split('@')[0] : 'Admin'),
        photoUrl: u.photoUrl || null,
        emailVerified: !!u.emailVerified
      };

      // Cache valid token for 5 minutes
      tokenCache.set(idToken, { user, expiresAt: now + 5 * 60 * 1000 });

      // Clean up old cache entries if Map gets large
      if (tokenCache.size > 100) {
        for (const [k, v] of tokenCache.entries()) {
          if (v.expiresAt <= now) tokenCache.delete(k);
        }
      }

      return user;
    }
  } catch (err) {
    console.error('[Auth] Error verifying Firebase ID token:', err.message);
  }

  return null;
}

/**
 * Express Middleware: requireAdminAuth
 * Enforces admin authorization via Firebase Bearer Token or valid Admin API Key.
 */
async function requireAdminAuth(req, res, next) {
  const adminEmails = getAdminEmails();

  // 1. Check for Firebase Bearer Token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const idToken = authHeader.substring(7).trim();
    if (idToken) {
      const user = await verifyFirebaseIdToken(idToken);
      if (user && user.email) {
        if (adminEmails.includes(user.email)) {
          req.adminUser = user;
          return next();
        }
        // Valid token, but user is NOT an authorized administrator
        console.warn(`[Security Alert] Unauthorized access attempt by authenticated user: ${user.email}`);
        return res.status(403).json({
          success: false,
          error: 'Access Denied: Account not authorized.'
        });
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired Firebase session. Please sign in again.'
      });
    }
  }

  // 2. Check for Fallback Admin API Key (x-api-key header, x-admin-key header, or ?key=)
  const providedKey = req.headers['x-api-key'] || req.headers['x-admin-key'] || req.query.key;
  const expectedKey = process.env.ADMIN_API_KEY;

  if (expectedKey && providedKey && providedKey === expectedKey) {
    req.adminUser = {
      email: 'service-key@polishmediaco.com',
      displayName: 'Master Key Holder',
      isServiceKey: true
    };
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'Unauthorized. Please sign in with an authorized administrator account.'
  });
}

module.exports = {
  getAdminEmails,
  verifyFirebaseIdToken,
  requireAdminAuth
};
