# Authentication & Authorization

## JWT Handling

- **Use `jwt.verify()`, never `jwt.decode()` alone.** `decode` reads the payload without checking the signature — an attacker can forge any payload.
- **Explicitly reject `"alg": "none"`.** Some JWT libraries accept unsigned tokens if the algorithm is set to `"none"`. Your verification must reject this.
- **Validate issuer, audience, and expiration** — not just the signature.

```typescript
// BAD: reads token without verifying signature
const payload = jwt.decode(token);

// GOOD: verifies signature, rejects tampered tokens
const payload = jwt.verify(token, secret, {
  algorithms: ['HS256'],
  issuer: 'your-app',
});
```

## Middleware Is Not Enough (Express)

Express middleware is a convenience layer, **not a reliable sole auth guard**. Always verify auth again in:
- Individual route handlers that serve sensitive data
- Any API endpoint that modifies data or accesses private resources

```javascript
// BAD: only middleware check — if routing order changes, admin routes are exposed
app.use('/api/admin', requireAuth);
app.get('/admin', (req, res) => res.sendFile('admin.html')); // No auth check here!

// GOOD: explicit auth check on every sensitive route
app.get('/admin', requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// BETTER: server-side auth middleware that verifies a real session/token
function requireAuth(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1] || req.cookies?.session;
  if (!token) return res.status(401).redirect('/login');
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).redirect('/login');
  }
}
```

## Admin Routes Without Server-Side Auth

The most common critical mistake: serving admin HTML with no auth guard, relying entirely on client-side JavaScript to protect the page.

```javascript
// CRITICAL VULNERABILITY: anyone can access /admin
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// FIX: add server-side middleware that validates a real credential
app.get('/admin', verifyAdminKey, (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

function verifyAdminKey(req, res, next) {
  const key = req.headers['x-admin-key'] || req.query.key;
  if (key !== process.env.ADMIN_API_KEY || !process.env.ADMIN_API_KEY) {
    return res.status(401).send('Unauthorized');
  }
  next();
}
```

**Note:** Static API keys in headers are still weak. The proper fix is a full session/token system (Firebase Auth, JWT, or a session cookie with `httpOnly` + `secure` + `sameSite=strict` flags).

## Static Admin Keys

`ADMIN_API_KEY=polish_admin_secure_key_2026` is guessable and pattern-based. Generate a proper key:

```bash
# Generate a cryptographically random 32-byte hex key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Store this in your Vercel environment variables, not in `.env` committed to version control.

## Firebase Authentication Server-Side Verification

Firebase `getSession()` / `currentUser` on the client can be spoofed. For any server-side operation, always verify the Firebase ID token:

```javascript
const admin = require('firebase-admin');

async function verifyFirebaseToken(req, res, next) {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  try {
    req.user = await admin.auth().verifyIdToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
```
