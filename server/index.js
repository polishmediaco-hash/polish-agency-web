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

const apiRoutes = require('./routes/api');
const boardsRoutes = require('./routes/boards');
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
      console.error('\x1b[31m[CRITICAL SECURITY ALERT] Production ADMIN_API_KEY is using default example key! Rotate immediately in .env!\x1b[0m');
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
          "https://cdn.jsdelivr.net",           // Supabase client SDK
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
          "https://*.googleusercontent.com",
          "https://assets.calendly.com",
          "https://images.unsplash.com"
        ],
        connectSrc: [
          "'self'",
          "https://*.supabase.co",
          "wss://*.supabase.co",
          "https://api.calendly.com",
          "https://7105.api.greenapi.com"
        ],
        frameSrc: [
          "'self'",
          "https://calendly.com",
          "https://accounts.google.com",
          "https://*.supabase.co"
        ],
        objectSrc: ["'none'"],
        workerSrc: ["'self'"],
        manifestSrc: ["'self'"],
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

    // Development and local execution: Allow strictly verified localhost ports (no substring matching!)
    if ((!IS_PROD || !process.env.VERCEL) && DEV_ORIGIN_REGEX.test(origin)) {
      return callback(null, true);
    }

    callback(new Error('CORS: Origin unauthorized by security policy.'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-admin-key', 'Accept']
}));

// ── 5. Body Parsers with Controlled Limits ───────────────────────────────────
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

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

// Supabase public config (Throttled)
app.get('/api/config/supabase', configLimiter, (req, res) => {
  res.json({
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    isConfigured: Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY)
  });
});

// Intake Form Submissions — Tightly rate limited
app.use('/api/apply', intakeLimiter);
app.use('/api/creators/apply', intakeLimiter);
app.use('/api/intake', intakeLimiter);

// Calendly Webhook — Rate limited
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

// ── Secured Executive Invoicing Atelier ──────────────────────────────────────
app.get(['/admin/invoice', '/admin/invoices', '/admin/invoice.html'], (req, res) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/invoice.html'));
});

// Redirect legacy public invoice paths directly to the secured admin suite
app.get(['/invoice', '/invoices', '/invoice.html'], (req, res) => {
  const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
  res.redirect(302, `/admin/invoice${query}`);
});

// ── 11. Static File Serving ──────────────────────────────────────────────────
app.use(
  express.static(path.join(__dirname, '../public'), {
    maxAge: 0,
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html') || filePath.endsWith('.js') || filePath.endsWith('.json')) {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      } else if (filePath.includes('/assets/') || filePath.includes('/brand-pack/')) {
        res.setHeader('Cache-Control', 'public, max-age=86400');
      } else {
        res.setHeader('Cache-Control', 'no-cache, must-revalidate');
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

app.get('/privacy', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/privacy.html'));
});

app.get('/terms', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/terms.html'));
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

    // Supabase Keep-Alive: Ping database every 48h to prevent 7-day auto-pausing on Free Tier
    const { keepAliveService } = require('./services/supabase');
    setInterval(() => {
      keepAliveService.recordPing('standalone_cron').catch(() => {});
    }, 48 * 60 * 60 * 1000);
  });
}

module.exports = app;
