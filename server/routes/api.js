const express = require('express');
const fs = require('fs');
const path = require('path');
const { notifyNewLead } = require('../services/notification');

const router = express.Router();
const DB_FILE = path.join(__dirname, '../db/leads.json');

// Helper to read DB safely
function readLeads() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (err) {
    console.error('Error reading leads DB:', err);
    return [];
  }
}

// Helper to write DB safely
function writeLeads(leads) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(leads, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing leads DB:', err);
    return false;
  }
}

// GET /api/config
router.get('/config', (req, res) => {
  res.json({
    whatsappNumber: process.env.WHATSAPP_NUMBER || '213662417761',
    instagramUrl: process.env.INSTAGRAM_URL || 'https://www.instagram.com/polishmedia.co/',
    email: process.env.CONTACT_EMAIL || 'contact@polishmediaco.com',
    domain: process.env.DOMAIN || 'polishmediaco.com'
  });
});

// POST /api/apply (Multi-Step Lead Intake - Email removed as requested)
router.post('/apply', async (req, res) => {
  try {
    const {
      fullName,
      brandName,
      websiteUrl,
      socialLink,
      role,
      businessCategory,
      marketingHistory,
      primaryGoal,
      email
    } = req.body;

    // Validate Required Fields for 3-Step Intake
    if (!fullName || !brandName || !socialLink || !role || !businessCategory || !marketingHistory) {
      return res.status(400).json({
        success: false,
        error: 'Please complete all required fields.'
      });
    }

    const newLead = {
      id: `POLISH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      fullName: fullName.trim(),
      email: email ? email.trim().toLowerCase() : 'Not provided',
      brandName: brandName.trim(),
      websiteUrl: websiteUrl ? websiteUrl.trim() : 'Not provided',
      socialLink: socialLink.trim(),
      role: role.trim(),
      businessCategory: businessCategory.trim(),
      marketingHistory: marketingHistory.trim(),
      primaryGoal: primaryGoal ? primaryGoal.trim() : 'Not provided',
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      submittedAt: new Date().toISOString(),
      status: 'NEW_APPLICATION'
    };

    const leads = readLeads();
    leads.unshift(newLead);
    writeLeads(leads);

    // Fire off async notification
    notifyNewLead(newLead).catch(console.error);

    return res.status(201).json({
      success: true,
      message: 'Your Growth Partnership Dossier has been securely registered.',
      leadId: newLead.id
    });
  } catch (error) {
    console.error('Server error processing lead application:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred. Please reach out directly on WhatsApp.'
    });
  }
});

// POST /api/creators/apply (Creator & UGC Partnership Intake)
router.post('/creators/apply', async (req, res) => {
  try {
    const { name, socialLink, portfolio, phone } = req.body;

    if (!name || !socialLink || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in your name, social profile link, and phone number.'
      });
    }

    const creatorApplication = {
      id: `CREATOR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      type: 'CREATOR_PARTNERSHIP',
      name: name.trim(),
      socialLink: socialLink.trim(),
      portfolio: portfolio ? portfolio.trim() : 'Not provided',
      phone: phone.trim(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      submittedAt: new Date().toISOString(),
      status: 'NEW_APPLICATION'
    };

    const leads = readLeads();
    leads.unshift(creatorApplication);
    writeLeads(leads);

    // Fire off async notification
    notifyNewLead(creatorApplication).catch(console.error);

    return res.status(201).json({
      success: true,
      message: 'Creator partnership application successfully logged.',
      applicationId: creatorApplication.id
    });
  } catch (error) {
    console.error('Server error processing creator application:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred. Please reach out directly on WhatsApp.'
    });
  }
});

// GET /api/leads
router.get('/leads', (req, res) => {
  const authKey = req.headers['x-api-key'] || req.query.key;
  const expectedKey = process.env.ADMIN_API_KEY || 'polish_admin_secure_key_2026';

  if (authKey !== expectedKey) {
    return res.status(401).json({ success: false, error: 'Unauthorized access.' });
  }

  const leads = readLeads();
  res.json({
    success: true,
    total: leads.length,
    leads
  });
});

// CONTENT CMS DATABASE
const CONTENT_FILE = path.join(__dirname, '../db/content.json');

function getDefaultContent() {
  return {
    hero: {
      windowTag: "BRAND ACCELERATOR",
      eyebrow: "BEAUTY ACCELERATOR & GROWTH STUDIO",
      headlineLine1: "From Breakthrough Formulation",
      headlineLine2: "To Household Beauty Brand.",
      description: "We partner with visionary cosmetic founders to scale paid acquisition, high-converting UGC creator campaigns, and automated retention loops.",
      ctaText: "Explore Partnership",
      microTrust: "Exclusive growth partner for high-potential cosmetic & skincare brands."
    },
    agitation: {
      eyebrow: "THE BOTTLENECKS",
      headlineLine1: "Great Formulas Don't Sell Themselves.",
      headlineLine2: "Where Beauty Brands Hit a Wall.",
      description: "Most beauty brands plateau not from weak products, but from creative burnout and rising ad costs.",
      cards: [
        {
          tag: "01 • CREATIVE FATIGUE",
          title: "Ads Burn Out in 14 Days",
          desc: "Without a constant pipeline of fresh video hooks and angles, ad fatigue spikes your customer acquisition cost."
        },
        {
          tag: "02 • ZERO CONVERSION",
          title: "Aesthetic Views Don't Drive Sales",
          desc: "Pretty feeds don't guarantee revenue. Conversions require structured hooks, ingredient breakdowns, and clear texture proof."
        },
        {
          tag: "03 • NO RETENTION",
          title: "One-Time Buyers Drain Margins",
          desc: "If customers don't reorder within 60 days, acquisition costs consume your profit. We turn first orders into recurring replenishment."
        }
      ]
    },
    pillars: {
      eyebrow: "THE GROWTH ENGINE",
      headlineLine1: "Engineered Specifically",
      headlineLine2: "For Cosmetic & Skincare Scaling.",
      items: [
        {
          digit: "01",
          title: "High-Velocity UGC Studio",
          desc: "Vetted beauty creators briefed with high-converting hooks, texture shots, and skin-routine demonstrations."
        },
        {
          digit: "02",
          title: "Profit-First Paid Media",
          desc: "Data-driven Meta and TikTok campaigns structured for maximum return on ad spend (ROAS) and scale."
        },
        {
          digit: "03",
          title: "Conversion & Routine Bundling",
          desc: "High-converting product landing pages, multi-step routines, and smart cart upsells that increase Average Order Value."
        },
        {
          digit: "04",
          title: "Automated Replenishment Loops",
          desc: "Predictive replenishment reminders and VIP retention flows that maximize customer lifetime value."
        }
      ]
    },
    creators: {
      eyebrow: "CREATOR & UGC NETWORK",
      headline: "Create for Leading Beauty Brands. Join the POLISH Creator Network.",
      description: "Get cast for paid brand campaigns, product gifting, and monthly creator retainers."
    },
    contact: {
      whatsappNumber: process.env.WHATSAPP_NUMBER || "213662417761",
      instagramUrl: process.env.INSTAGRAM_URL || "https://www.instagram.com/polishmedia.co/",
      email: process.env.CONTACT_EMAIL || "contact@polishmediaco.com"
    }
  };
}

function readContent() {
  try {
    if (!fs.existsSync(CONTENT_FILE)) {
      const def = getDefaultContent();
      fs.writeFileSync(CONTENT_FILE, JSON.stringify(def, null, 2), 'utf8');
      return def;
    }
    const data = fs.readFileSync(CONTENT_FILE, 'utf8');
    return JSON.parse(data || '{}');
  } catch (err) {
    console.error('Error reading content DB:', err);
    return getDefaultContent();
  }
}

function writeContent(content) {
  try {
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(content, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing content DB:', err);
    return false;
  }
}

// GET /api/content (Public - For live website dynamic hydration)
router.get('/content', (req, res) => {
  const content = readContent();
  res.json({ success: true, content });
});

// POST /api/content (Protected - Save website text from Admin Dashboard)
router.post('/content', (req, res) => {
  const authKey = req.headers['x-api-key'] || req.body.key || req.query.key;
  const expectedKey = process.env.ADMIN_API_KEY || 'polish_admin_secure_key_2026';

  if (authKey !== expectedKey) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin Key.' });
  }

  const { content } = req.body;
  if (!content || typeof content !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid content payload.' });
  }

  const saved = writeContent(content);
  if (!saved) {
    return res.status(500).json({ success: false, error: 'Failed to write content to database.' });
  }

  res.json({ success: true, message: 'Website text successfully updated and published live!', content });
});

// POST /api/content/reset (Protected - Reset website text to original defaults)
router.post('/content/reset', (req, res) => {
  const authKey = req.headers['x-api-key'] || req.body.key || req.query.key;
  const expectedKey = process.env.ADMIN_API_KEY || 'polish_admin_secure_key_2026';

  if (authKey !== expectedKey) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid Admin Key.' });
  }

  const def = getDefaultContent();
  writeContent(def);
  res.json({ success: true, message: 'Website content reset to factory defaults.', content: def });
});

module.exports = router;

