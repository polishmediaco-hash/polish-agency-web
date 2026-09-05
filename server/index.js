require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;
const DOMAIN = process.env.DOMAIN || 'polishmediaco.com';

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// Compression
app.use(compression());
app.use(cors());

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// High-performance intelligent caching policy
app.use((req, res, next) => {
  // HTML documents: validate on each request so updates appear immediately
  if (req.path === '/' || req.path === '/apply' || req.path === '/creators' || req.path.endsWith('.html')) {
    res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
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

app.use('/api', intakeLimiter, apiRoutes);

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
});
