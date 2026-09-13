/**
 * POLISH Media Co — Admin & Studio Authentication Middleware
 * 
 * Supports dual-factor administrative authentication:
 * 1. Supabase Auth JWT (Google OAuth, Email/Password, or Magic Link)
 *    - Validates signature & validity against Supabase Auth engine
 *    - Enforces ADMIN_EMAILS whitelist (e.g. polishmediaco@gmail.com, choulif.work@gmail.com)
 * 2. Fallback Admin API Key (x-api-key header or ?key= query)
 *    - For CI/CD, curl, or emergency recovery
 * 3. Graceful offline / local development fallback
 */

const crypto = require('crypto');
const { supabase, isConfigured } = require('../services/supabase');
const tokenCache = new Map(); // token -> { user, expiresAt }

function getAdminEmails() {
  const envEmails = process.env.ADMIN_EMAILS || 'polishmediaco@gmail.com,choulif.work@gmail.com,choulifaycal10@gmail.com';
  return envEmails
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Validates a Supabase Auth JWT using the Supabase Admin Auth API.
 * Uses an in-memory 5-minute cache to eliminate external network latency on rapid requests.
 */
async function verifySupabaseToken(token) {
  if (!token || typeof token !== 'string') return null;

  const now = Date.now();
  const cached = tokenCache.get(token);
  if (cached && cached.expiresAt > now) {
    return cached.user;
  }

  if (isConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data && data.user) {
        const u = data.user;
        const user = {
          uid: u.id,
          email: (u.email || '').toLowerCase(),
          displayName: u.user_metadata?.full_name || u.user_metadata?.name || (u.email ? u.email.split('@')[0] : 'Admin'),
          photoUrl: u.user_metadata?.avatar_url || u.user_metadata?.picture || null,
          emailVerified: !!u.email_confirmed_at
        };

        // Cache valid user session for 5 minutes
        tokenCache.set(token, { user, expiresAt: now + 5 * 60 * 1000 });

        // Maintain bounded cache size
        if (tokenCache.size > 200) {
          for (const [k, v] of tokenCache.entries()) {
            if (v.expiresAt <= now) tokenCache.delete(k);
          }
        }

        return user;
      }
    } catch (err) {
      console.error('[Auth] Error verifying Supabase token:', err.message);
    }
  }

  return null;
}

/**
 * Express Middleware: requireAdminAuth
 * Enforces admin authorization via Supabase Bearer Token or valid Admin API Key.
 */
async function requireAdminAuth(req, res, next) {
  const adminEmails = getAdminEmails();

  // 1. Check for Supabase Bearer Token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const user = await verifySupabaseToken(token);
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
        error: 'Invalid or expired Supabase session. Please sign in again.'
      });
    }
  }

  // 2. Check for Fallback Admin API Key (x-api-key header, x-admin-key header, or ?key=)
  const providedKey = req.headers['x-api-key'] || req.headers['x-admin-key'] || req.query.key;
  const expectedKey = process.env.ADMIN_API_KEY;

  if (expectedKey && providedKey && typeof providedKey === 'string') {
    const pBuf = Buffer.from(providedKey);
    const eBuf = Buffer.from(expectedKey);
    if (pBuf.length === eBuf.length && crypto.timingSafeEqual(pBuf, eBuf)) {
      req.adminUser = {
        email: 'service-key@polishmediaco.com',
        displayName: 'Master Key Holder',
        isServiceKey: true
      };
      return next();
    }
  }

  return res.status(401).json({
    success: false,
    error: 'Unauthorized. Please sign in with an authorized administrator account.'
  });
}

/**
 * Express Middleware: requireUserOrAdminAuth
 * Enforces authorization for Studio board operations:
 * Accepts any authenticated Supabase user OR valid Admin API Key.
 * In offline/local dev without Supabase credentials, falls back gracefully.
 */
async function requireUserOrAdminAuth(req, res, next) {
  // 1. Check for Supabase Bearer Token in Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      const user = await verifySupabaseToken(token);
      if (user) {
        req.user = user;
        return next();
      }
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session. Please sign in again.'
      });
    }
  }

  // 2. Check for Fallback Admin API Key (x-api-key or x-admin-key header)
  const providedKey = req.headers['x-api-key'] || req.headers['x-admin-key'] || req.query.key;
  const expectedKey = process.env.ADMIN_API_KEY;

  if (expectedKey && providedKey && typeof providedKey === 'string') {
    const pBuf = Buffer.from(providedKey);
    const eBuf = Buffer.from(expectedKey);
    if (pBuf.length === eBuf.length && crypto.timingSafeEqual(pBuf, eBuf)) {
      req.user = {
        uid: 'admin-key-holder',
        email: 'service-key@polishmediaco.com',
        displayName: 'Master Key Holder'
      };
      return next();
    }
  }

  // 3. In non-production development or local mode, allow offline dev user
  const IS_PROD = process.env.NODE_ENV === 'production';
  if (!IS_PROD || !isConfigured) {
    req.user = {
      uid: 'dev-user',
      email: 'dev@localhost',
      displayName: 'Local Dev User'
    };
    return next();
  }

  return res.status(401).json({
    success: false,
    error: 'Unauthorized. Authentication required to modify boards.'
  });
}

module.exports = {
  getAdminEmails,
  verifySupabaseToken,
  requireAdminAuth,
  requireUserOrAdminAuth
};
