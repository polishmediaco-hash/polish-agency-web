---
name: production-security
description: >-
  Production web security, Express hardening, and threat modeling skill tailored for POLISH Media Co.
  Covers OWASP Top 10 defenses, HTTP security headers, Supabase authentication, rate limiting, and safe
  atomic file storage for lead dossiers and CMS data.
---

# Production Web Security & Server Hardening Guide

This skill provides the security audit checklist, threat model, and defensive countermeasures specifically tailored for the **POLISH Media Co** full-stack architecture (Node.js + Express, Supabase, and atomic JSON persistence).

---

## 1. The Core Security Mandate

**Never trust the client.** Every permission, role, API access, and submission payload must be validated and enforced server-side.

---

## 2. POLISH Media Co Threat Surface & Mitigations

| Asset / Endpoint | Threat | Mitigation |
| :--- | :--- | :--- |
| **`server/db/leads.json`** | Unauthorized read / PII data leak | Server-side auth guard on `/api/leads`; file never served statically. |
| **Admin Portal (`/admin.html`)** | Unauthorized CRM access | Multi-tier auth (WebAuthn biometric / PIN / Supabase OAuth / master key). |
| **Intake API (`POST /api/apply`)** | Spam injection & DoS | Body size caps (1MB), strict rate limiting (100 req/15min), input sanitization. |
| **CMS Sync (`/api/cms`)** | Content defacement | Write operations (`POST /api/cms`) restricted to authenticated admin sessions. |
| **Supabase Client Keys** | Scope escalation | Ensure only `anon_key` is in client JS; enforce Supabase Row-Level Security (RLS). |

---

## 3. OWASP Top 10 Audit Protocol

### A01: Broken Access Control
- Admin routes (`/api/leads`, `/api/cms` write) must be protected by server-side middleware, not just client-side JavaScript redirects.
- Verify sensitive files (`.env`, `.git`, `server/db/*.json`) return `403` or `404` when requested over HTTP:
  ```bash
  curl -s -o /dev/null -w "%{http_code}\n" https://polishmediaco.com/.env
  curl -s -o /dev/null -w "%{http_code}\n" https://polishmediaco.com/server/db/leads.json
  ```

### A02: Security Headers & Transport Encryption
- Verify production responses include standard security headers:
  ```bash
  curl -I https://polishmediaco.com | grep -i "strict-transport\|x-frame\|x-content-type"
  ```
- Standard configuration:
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
  - `X-Frame-Options: SAMEORIGIN` (or `DENY`)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`

### A03: Input Validation & Injection Defense
- Validate all incoming fields in `POST /api/apply` (brand name, email, WhatsApp, revenue range).
- Sanitize strings before persisting to JSON to prevent stored XSS when rendered in `admin.html`.

### A04: Atomic File Storage & Race Condition Defense
- Never write directly to `leads.json` with synchronous, unbuffered streams during concurrent requests.
- Always write to a temporary file (`leads.tmp.json`) and atomically rename (`fs.renameSync`) to guarantee database consistency.

---

## 4. Express Hardening Blueprint

```javascript
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// 1. Security headers via Helmet
app.use(helmet({
  contentSecurityPolicy: false // Configure custom CSP if scripts require external CDNs
}));

// 2. Strict CORS
const allowedOrigins = ['https://polishmediaco.com', 'https://www.polishmediaco.com'];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('CORS origin unauthorized'));
  }
}));

// 3. Rate limiting on public API endpoints
app.use('/api/', rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
}));

// 4. Disable server footprint
app.disable('x-powered-by');
app.use(express.json({ limit: '1mb' }));
```
