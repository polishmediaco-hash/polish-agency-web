# Secrets & Environment Variables

## Hardcoded Credentials

Never hardcode API keys, tokens, passwords, or credentials in source code. This includes:
- Strings that look like API keys in source files
- Connection strings with embedded passwords
- Private keys or certificates in the repo

If a secret was ever committed to Git history, consider it compromised — deleting the file doesn't remove it from history. The key must be rotated immediately. Run `gitleaks detect` to scan for leaked secrets.

## Client-Side Environment Variable Prefixes

These prefixes cause env vars to be inlined into the client bundle at build time. Everything in the bundle is visible to anyone:

| Framework | Client Prefix | Danger |
|-----------|--------------|--------|
| Next.js | `NEXT_PUBLIC_` | Inlined into browser JS at build time |
| Vite | `VITE_` | Inlined into browser JS at build time |
| Expo / React Native | `EXPO_PUBLIC_` | Baked into the app bundle |
| Create React App | `REACT_APP_` | Inlined into browser JS at build time |

**What belongs client-side:**
- Stripe publishable key (`pk_live_*`, `pk_test_*`)
- Firebase client config (apiKey, authDomain, projectId, etc.) — these are designed to be public, but Firebase Security Rules must be tight
- Google Maps API key — restrict to your domain in the Google Cloud Console

**What must stay server-side:**
- Stripe secret key (`sk_live_*`, `sk_test_*`)
- Any AI API key (OpenAI, Anthropic, Google)
- Database connection strings
- Admin tokens, webhook signing secrets
- Service account credentials

## .env File Hygiene

- `.env` must be in `.gitignore` before the first commit
- `.env.example` (no real values) is safe to commit and should document all required variables
- Use secrets managers (Vercel env vars, AWS Secrets Manager, Railway secrets) for production
- Never commit `.env.local`, `.env.production`, or any file with real credentials

## API Key Exposure via Endpoints

**NEVER** create an endpoint that returns server-side secrets to the client:

```javascript
// BAD: exposes your secret key to anyone who calls this endpoint
app.get('/api/config', (req, res) => {
  res.json({
    stripeKey: process.env.STRIPE_SECRET_KEY, // CRITICAL: this is your secret key
    adminKey: process.env.ADMIN_API_KEY,
  });
});

// For Firebase: the client config IS safe to expose, but still gate it
// The dangerous part is Firebase Security Rules, not the client config
app.get('/api/config/firebase', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY,      // OK — designed to be public
    projectId: process.env.FIREBASE_PROJECT_ID, // OK — designed to be public
  });
  // BUT: rate-limit this endpoint and verify Firebase Security Rules are locked down
});
```
