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

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false // Allows OAuth popups (Firebase/Google) to communicate with opener
  })
);

// Compression
app.use(compression());
app.use(cors());

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// High-performance intelligent caching policy
app.use((req, res, next) => {
  // HTML documents & dynamic boards: never cache so updates appear immediately
  if (req.path === '/' || !req.path.includes('.') || req.path.endsWith('.html')) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  } else {
    // Static assets (CSS, JS, WebP, PNG, SVG): cache on edge CDN and browser with stale-while-revalidate
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  }
  next();
});

// Rate limiter
const intakeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, error: 'Too many requests. Please wait a moment.' }
});

// Public Firebase Client Config Endpoint (Always unthrottled)
app.get('/api/config/firebase', (req, res) => {
  res.json({
    apiKey: process.env.FIREBASE_API_KEY || '',
    authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
    appId: process.env.FIREBASE_APP_ID || '',
    isConfigured: !!(process.env.FIREBASE_API_KEY && process.env.FIREBASE_PROJECT_ID)
  });
});

app.use('/api', apiRoutes);
app.use('/api/boards', boardsRoutes);

// Subdomain & Virtual Host Routing (app.polishmediaco.com)
app.use((req, res, next) => {
  const host = (req.headers.host || '').toLowerCase();
  if (host.startsWith('app.')) {
    // Pass through API calls, static files, and assets with extensions to express.static
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
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(path.join(__dirname, '../public/studio/dashboard.html'));
    }
    if (req.path === '/login') {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(path.join(__dirname, '../public/studio/login.html'));
    }
    if (req.path.startsWith('/b/') || req.path.startsWith('/view/')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      return res.sendFile(path.join(__dirname, '../public/studio/view.html'));
    }
    // Any alias on app. subdomain redirects cleanly to root builder
    if (['/app', '/builder', '/board-builder', '/studio'].includes(req.path)) {
      return res.redirect(301, '/');
    }
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(path.join(__dirname, '../public/studio/index.html'));
  }
  next();
});

// Canonical 301 Redirects for Studio & Builder Aliases on Main Domain
app.get(['/app', '/builder', '/board-builder'], (req, res) => {
  const host = (req.headers.host || '').toLowerCase();
  const isProd = !host.includes('localhost') && !host.includes('127.0.0.1');
  const target = isProd ? `https://app.${DOMAIN}/` : '/studio';
  return res.redirect(301, target);
});


// Studio Dashboard Aliases (301 Redirect to canonical /boards or app subdomain)
app.get(['/studio/dashboard', '/app/dashboard'], (req, res) => {
  const host = (req.headers.host || '').toLowerCase();
  const isProd = !host.includes('localhost') && !host.includes('127.0.0.1');
  const target = isProd ? `https://app.${DOMAIN}/dashboard` : '/boards';
  return res.redirect(301, target);
});

// Primary Studio Routes (Available on standard domain & dev)
app.get('/studio', (req, res) => {
  const host = (req.headers.host || '').toLowerCase();
  const isProd = !host.includes('localhost') && !host.includes('127.0.0.1');
  if (isProd) {
    const query = req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : '';
    return res.redirect(301, `https://app.${DOMAIN}/${query}`);
  }
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/studio/index.html'));
});

app.get('/login', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/studio/login.html'));
});

app.get('/boards', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/studio/dashboard.html'));
});

// Client Board Presentation Route (Zero builder clutter, read-only luxury presentation)
app.get(['/b/:id', '/view/:id'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/studio/view.html'));
});

// Serve static assets with Edge & browser caching
app.use(
  express.static(path.join(__dirname, '../public'), {
    maxAge: '1d',
    etag: true
  })
);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/apply', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/apply.html'));
});

// Canonical Booking Route & 301 Aliases (Calendly Integration)
app.get('/book', (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/book.html'));
});

app.get(['/schedule', '/meeting', '/call', '/calendar'], (req, res) => {
  res.redirect(301, '/book');
});

// Component Catalog & Standard Page Template
app.get(['/template', '/_template'], (req, res) => {
  res.sendFile(path.join(__dirname, '../public/_template.html'));
});

app.get('/creators', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/creators.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/admin.html'));
});

app.get('/palette-preview', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/palette-preview.html'));
});

app.get('/font-preview', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/font-preview.html'));
});

app.get('/brand-pack', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/brand-pack.html'));
});

app.get('/brand-guidelines', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/brand-pack.html'));
});

app.get('/logo-preview', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/logo-preview.html'));
});

// Strategic Whiteboard & Proposal Routes (Namespaced & Legacy Bookmarks)
app.get(['/p/eman-alkatheeri', '/eman', '/eman-alkatheeri', '/board', '/dubai', '/strategy'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/eman-alkatheeri.html'));
});

// Standalone Executive Discovery & Offer Calibration Portal (Dual Night / Day Mode)
app.get(['/intake', '/calibration', '/eman-intake', '/discovery', '/intake.html'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/intake.html'));
});

app.get(['/p/makeup-filmmaking', '/makeup-filmmaking'], (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(__dirname, '../public/makeup-filmmaking.html'));
});

app.get(['/makeup', '/filmmaking'], (req, res) => {
  res.redirect(301, '/p/makeup-filmmaking');
});

app.get(['/pdf', '/eman-pdf', '/options-pdf', '/partnership-options'], (req, res) => {
  res.sendFile(path.join(__dirname, '../public/POLISH_MEDIA_Eman_Partnership_Options.pdf'));
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development', ts: Date.now() });
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
