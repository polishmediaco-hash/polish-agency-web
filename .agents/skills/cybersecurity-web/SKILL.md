---
name: cybersecurity-web
description: Advanced cybersecurity skill for web application security testing, threat modeling, OWASP Top 10 analysis, HTTP security headers, session management, CSRF/XSS defense, API security, and Node.js/Express hardening. Sourced from mukul975/anthropic-cybersecurity-skills (818 skills, 34 domains, mapped to MITRE ATT&CK, NIST CSF 2.0, MITRE D3FEND). Use when auditing web applications, reviewing security posture, analyzing attack vectors, or hardening production Node.js/Express servers. Complements the vibe-security skill with deeper threat intelligence and defensive countermeasures.
license: Apache-2.0
metadata:
  author: Mukul975 (mukul975/anthropic-cybersecurity-skills)
  source: https://github.com/mukul975/anthropic-cybersecurity-skills
  installed: 2026-09-09
  frameworks: [MITRE ATT&CK v19.1, NIST CSF 2.0, MITRE D3FEND v1.4.0]
  domains: [web-application-security, api-security, authentication, session-management, network-security]
---

# Cybersecurity — Web Application Security

This skill provides advanced web security analysis using industry frameworks and threat intelligence. It covers attack techniques (offensive), defensive countermeasures (defensive), and compliance mapping.

> ⚠️ **Authorized & lawful use only.** All offensive techniques are for authorized penetration testing, security research, and defense. Only use against systems you own or have explicit written permission to test.


## OWASP Top 10 — Audit Checklist

When auditing a web application, systematically check for:

### A01: Broken Access Control (Most Critical)
**ATT&CK:** T1190 (Exploit Public-Facing Application) | **D3FEND:** D3-UAM (User Account Management)

- Are admin/protected routes gated server-side (not just client-side JS)?
- Can users access other users' data by changing IDs in URLs/requests?
- Is CORS restricted to known origins?
- Are directory listings disabled?
- Are sensitive files (`.env`, `.git`, `db/*.json`) inaccessible from the web?

```bash
# Test for exposed sensitive files
curl -s https://polishmediaco.com/.env
curl -s https://polishmediaco.com/.git/HEAD
curl -s https://polishmediaco.com/server/db/leads.json
```

### A02: Cryptographic Failures
**ATT&CK:** T1040 (Network Sniffing) | **D3FEND:** D3-ET (Encryption at Transport Layer)

- Is HTTPS enforced everywhere? HTTP redirected to HTTPS?
- Are passwords hashed with bcrypt/argon2 (not MD5/SHA1)?
- Are sensitive data fields encrypted at rest?
- Are API tokens transmitted only over HTTPS?

### A03: Injection
**ATT&CK:** T1059 (Command and Scripting Interpreter)

- SQL injection — parameterized queries used?
- Command injection — `child_process.exec()` with user input?
- Template injection — user data interpolated into server-side templates?
- NoSQL injection — MongoDB `$where`, `$regex` with user data?
- XSS — user input reflected in HTML without sanitization?

### A04: Insecure Design
- Is there threat modeling for high-value flows (auth, payment, admin)?
- Are there rate limits on all abuse-prone endpoints?
- Is sensitive business logic enforced server-side?

### A05: Security Misconfiguration
- Are default credentials changed?
- Is `NODE_ENV=production` set?
- Are unnecessary endpoints (`/admin`, dev routes) protected?
- Are security headers set (CSP, HSTS, X-Frame-Options)?
- Is error handling configured to not leak stack traces?

### A06: Vulnerable & Outdated Components
```bash
# Check for known vulnerabilities in npm dependencies
npm audit
npx better-npm-audit audit
```

### A07: Identification & Authentication Failures
- Session tokens: `httpOnly`, `secure`, `sameSite=strict` cookie flags?
- Are session IDs regenerated after login?
- Is there account lockout after failed attempts?
- Are "Forgot password" flows secure (time-limited tokens, no user enumeration)?

### A08: Software & Data Integrity Failures
- Are npm packages verified (lockfile committed)?
- Are webhook payloads verified with signatures?
- Is CI/CD pipeline protected from tampering?

### A09: Security Logging & Monitoring Failures
- Are authentication failures logged?
- Are admin actions logged with user identity?
- Are suspicious patterns alerted (brute force, mass data access)?

### A10: Server-Side Request Forgery (SSRF)
- Does the app fetch URLs provided by users?
- Are internal network resources accessible via SSRF?
- Is `http://localhost`, `http://127.0.0.1`, `http://169.254.169.254` blocked?


## HTTP Security Headers — Reference

Set and verify these headers on all responses:

| Header | Recommended Value | Purpose |
|--------|------------------|---------|
| `Content-Security-Policy` | See deployment.md | Prevent XSS |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Force HTTPS |
| `X-Frame-Options` | `DENY` | Prevent clickjacking |
| `X-Content-Type-Options` | `nosniff` | Prevent MIME sniffing |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Limit referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restrict browser APIs |
| `Cache-Control` | `no-store` for sensitive endpoints | Prevent caching secrets |

**Test headers:**
```bash
curl -I https://polishmediaco.com | grep -i "content-security\|strict-transport\|x-frame\|x-content-type"
```

Or use: https://securityheaders.com/?q=polishmediaco.com


## Express.js Hardening Checklist (Node.js Specific)

```javascript
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp'); // HTTP Parameter Pollution

// 1. Security headers
app.use(helmet()); // Don't disable CSP

// 2. Restrict CORS
app.use(cors({ origin: ['https://polishmediaco.com', 'https://app.polishmediaco.com'] }));

// 3. Rate limiting on all routes
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// 4. Prevent HTTP Parameter Pollution
app.use(hpp());

// 5. Disable X-Powered-By (reveals Express)
app.disable('x-powered-by');

// 6. Limit request body size (already done: 1mb — good)
app.use(express.json({ limit: '1mb' }));

// 7. Never serve error details in production
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({ error: 'Internal server error' }); // No stack trace
  } else {
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});
```


## Session Management Security

**ATT&CK:** T1539 (Steal Web Session Cookie) | **D3FEND:** D3-SCF (Session Cookie Flags)

For cookie-based sessions:
```javascript
app.use(require('express-session')({
  secret: process.env.SESSION_SECRET, // Cryptographically random, min 32 chars
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,     // Prevent JS access
    secure: true,       // HTTPS only
    sameSite: 'strict', // Prevent CSRF
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  },
  name: 'sessionId',  // Don't use default 'connect.sid'
}));
```


## CSRF Protection

**ATT&CK:** T1185 (Browser Session Hijacking) | **D3FEND:** D3-CSF (Cross-Site Request Forgery Token)

CSRF attacks trick authenticated users into making unintended requests. Mitigations:

1. **SameSite cookie flag** (above) — blocks CSRF for most modern browsers
2. **CSRF tokens** for forms:
```javascript
const csrf = require('csurf');
app.use(csrf());
app.get('/apply', (req, res) => {
  res.render('apply', { csrfToken: req.csrfToken() });
});
```
3. **Check `Origin`/`Referer` headers** on state-changing requests
4. **`X-Requested-With` header check** for AJAX requests


## API Security

**ATT&CK:** T1190 | **D3FEND:** D3-HBPI (HTTP Body Parameter Inspection)

- Authenticate every API endpoint that returns or modifies data
- Use API keys or tokens in headers (`Authorization: Bearer <token>`), not query strings
- Log all API access with timestamp, IP, user agent, and result
- Return `401 Unauthorized` (not `403 Forbidden`) when no credentials are provided
- Return `403 Forbidden` when credentials are valid but insufficient
- Never expose internal IDs — use opaque UUIDs or slugs


## Threat Model: POLISH Media Co

Key assets and their threat surface:

| Asset | Threat | MITRE ATT&CK | Mitigation |
|-------|--------|-------------|------------|
| `leads.json` | Data breach of client PII | T1005 (Data from Local System) | Encrypted DB, access control |
| Admin panel | Unauthorized access | T1078 (Valid Accounts) | Server-side auth guard |
| Firebase keys | Account takeover | T1528 (Steal App Token) | Firebase Security Rules |
| WhatsApp token | Spam/impersonation | T1586 (Compromise Accounts) | Rotate, rate limit |
| Calendly token | Booking manipulation | T1531 (Account Access Removal) | Rotate, monitor |
| Board PDFs | Confidential strategy leak | T1213 (Data from Info Repositories) | Auth gate all board routes |
