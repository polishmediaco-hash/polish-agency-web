# Deployment Security

## Production Configuration

- **Disable debug mode** in production. Debug pages often leak stack traces, environment variables, and internal paths.
- **Disable source maps** in production. Source maps expose your entire source code to anyone who opens DevTools.
- **Verify `.git` directory is not accessible** in production. If `https://yoursite.com/.git/HEAD` returns content, your entire source code and commit history (including any secrets ever committed) are exposed.
- **Set `NODE_ENV=production`** — many libraries (Express, etc.) enable security features and disable verbose errors in production mode.

## Security Headers

Set these headers on all responses. Use `helmet` in Express:

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://apis.google.com", "https://www.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://*.firebaseapp.com", "https://*.googleapis.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
    },
  },
  // Keep these enabled (they're on by default in helmet):
  // X-Frame-Options: DENY
  // X-Content-Type-Options: nosniff
  // X-XSS-Protection: 1; mode=block
  // Referrer-Policy: no-referrer
  // Strict-Transport-Security (HSTS)
}));
```

**Current issue in POLISH Media:** `contentSecurityPolicy: false` disables CSP entirely, leaving the app open to XSS.

## CORS Configuration

`cors()` with no options allows **any origin** to call your API. This should be locked down:

```javascript
// BAD: any domain can call your APIs
app.use(cors());

// GOOD: restrict to your domains
const allowedOrigins = [
  'https://polishmediaco.com',
  'https://www.polishmediaco.com',
  'https://app.polishmediaco.com',
  process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : null,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
```

## Environment Separation (Vercel)

Use separate environment variables for each Vercel environment:

| Environment | Purpose |
|-------------|---------|
| Production | Live users, real keys |
| Preview | PR previews — use test/staging keys ONLY |
| Development | Local dev — use local/test keys |

Preview deployments are often accessible to anyone with the URL. Never use production API keys, database credentials, payment keys, or WhatsApp tokens in Preview deployments.

## Sensitive Files Exposed to Public

Verify these paths return 404 (not file contents) in production:
- `/.env`
- `/.git/HEAD`
- `/server/db/leads.json`
- `/server/db/content.json`
- `/node_modules/`

In Express, `express.static` should only serve the `public/` directory. The `server/db/` directory must never be inside `public/`.

## HTTPS Enforcement

Redirect all HTTP to HTTPS. On Vercel this is automatic. For custom servers:

```javascript
app.use((req, res, next) => {
  if (req.headers['x-forwarded-proto'] !== 'https' && process.env.NODE_ENV === 'production') {
    return res.redirect(301, `https://${req.hostname}${req.url}`);
  }
  next();
});
```
