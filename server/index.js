require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');
const boardsRoutes = require('./routes/boards');
const { requireAdminAuth } = require('./middleware/auth');
const { startCalendlyPoller } = require('./services/calendlySync');

const app = express();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'polishmediaco.com';

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",                    // Required for inline scripts in existing HTML pages
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
          "https://7105.api.greenapi.com",
          "https://api.telegram.org",
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
        baseUri:   ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false, // Allows OAuth popups (Firebase/Google) to communicate with opener
  })
);

// Compression
app.use(compression());
// CORS — restricted to known POLISH Media domains
const ALLOWED_ORIGINS = [
  'https://polishmediaco.com',
  'https://www.polishmediaco.com',
  'https://app.polishmediaco.com',
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:3000', 'http://localhost:8080'] : []),
];
app.use(cors({
  origin: (origin, callback) => {
    // Allow same-origin / server-to-server (no Origin header) and whitelisted origins
    if (!origin || ALLOWED_ORIGINS.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) return callback(null, true);
    callback(new Error('CORS: Origin not allowed'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// High-performance intelligent caching policy
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
    // HTML documents & dynamic routes: no-cache, must-revalidate
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  } else {
    // Other assets
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  }
  next();
});

// Rate limiters
const intakeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,                   // Tightened from 30 — form submissions only
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please wait a moment.' }
});

const configLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Too many requests.' }
});

// ── Route Registration ───────────────────────────────────────────────────────

// Firebase config — rate limited (safe to be public, but throttle abuse)
app.get('/api/config/firebase', configLimiter, (req, res) => {
  const apiKey = process.env.FIREBASE_API_KEY || 'AIzaSyAdtvlrJwmTGMe6JbMCSdEQCKC7eAle-TM';
  const projectId = process.env.FIREBASE_PROJECT_ID || 'polishmediacocom';
  res.json({
    apiKey,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'polishmediacocom.firebaseapp.com',
    projectId,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'polishmediacocom.firebasestorage.app',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '70668280388',
    appId: process.env.FIREBASE_APP_ID || '1:70668280388:web:455f906c6fbca8ce701211',
    isConfigured: true
  });
});

// Form submission routes — rate limited tightly to prevent spam/relay abuse
app.use('/api/apply', intakeLimiter);
app.use('/api/creators/apply', intakeLimiter);
app.use('/api/intake', intakeLimiter);
app.use('/api/calendly-webhook', intakeLimiter);

// General API routes
app.use('/api', apiRoutes);

// Boards API — ultra-fast atomic JSON persistence
app.use('/api/boards', boardsRoutes);

// ── Virtual Host Routing for app.polishmediaco.com ─────────────────────────────
// Subdomain & Virtual Host Routing (app.polishmediaco.com)
app.use((req, res, next) => {
  const host = (req.headers.host || '').toLowerCase();
  if (host.startsWith('app.')) {
    // Pass through API calls, static files, and assets with extensions to express.static / router
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

    // 1. Board Studio Management Dashboard
    if (req.path === '/dashboard' || req.path === '/boards') {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      return res.sendFile(path.join(__dirname, '../public/studio/dashboard.html'));
    }

    // 2. Studio Workspace Authentication
    if (req.path === '/login') {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      return res.sendFile(path.join(__dirname, '../public/studio/login.html'));
    }

    // 3. Client Read-Only Board Presentation Mode
    if (req.path.startsWith('/b/') || req.path.startsWith('/view/') || req.path === '/view') {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      return res.sendFile(path.join(__dirname, '../public/studio/view.html'));
    }

    // 4. Infinite Whiteboard Canvas (Root & all builder aliases)
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    return res.sendFile(path.join(__dirname, '../public/studio/index.html'));
  }
  next();
});

// ── Main Domain Redirects: Forward Board Access to app.polishmediaco.com ─────
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

// Serve static assets with Edge & browser caching (immutable 1 year for static assets, no-cache for html)
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

// ── Canonical Main Website Pages ─────────────────────────────────────────────
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
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/brand-pack', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/brand-pack.html'));
});

// ── Client Proposal & Intake ──────────────────────────────────────────────────
app.get('/eman-alkatheeri', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/eman-alkatheeri.html'));
});

app.get('/intake', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/intake.html'));
});

app.get('/pdf', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/POLISH_MEDIA_Eman_Partnership_Options.pdf'));
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', ts: Date.now() });
});

// 404 Fallback
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '../public/index.html'));
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`  🚀 POLISH Engine LIVE (Cache-Busting Enabled)     `);
    console.log(`  🌐 Local URL:       http://localhost:${PORT}        `);
    console.log(`  🎯 Target Domain:   https://${DOMAIN}            `);
    console.log(`  💬 WhatsApp Link:   +${process.env.WHATSAPP_NUMBER} `);
    console.log(`====================================================`);

    // Start background auto-poller for Calendly meetings (No paid webhook plan needed!)
    startCalendlyPoller(60);
  });
}

module.exports = app;
