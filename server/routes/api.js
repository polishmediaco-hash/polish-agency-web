const express = require('express');
const fs = require('fs');
const path = require('path');
const { notifyNewLead, notifyNewMeeting, sendWhatsAppMessage } = require('../services/notification');
const { requireAdminAuth } = require('../middleware/auth');

const router = express.Router();
// On Vercel serverless the project root is read-only; use /tmp which is writable.
// Locally, use the committed db/ directory for persistence across restarts.
const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
const DB_FILE = IS_VERCEL
  ? path.join('/tmp', 'leads.json')
  : path.join(__dirname, '../db/leads.json');
const CONTENT_FILE_PATH = IS_VERCEL
  ? path.join('/tmp', 'content.json')
  : path.join(__dirname, '../db/content.json');
const INTAKE_FILE = IS_VERCEL
  ? path.join('/tmp', 'intake_latest.json')
  : path.join(__dirname, '../db/intake_latest.json');

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

// Helper to write DB safely — atomic rename prevents race condition data loss
function writeLeads(leads) {
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = DB_FILE + '.tmp.' + Date.now();
    fs.writeFileSync(tmp, JSON.stringify(leads, null, 2), 'utf8');
    fs.renameSync(tmp, DB_FILE); // atomic on same filesystem
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

// GET /api/admin/verify (Validate Firebase Bearer token or API key and return admin profile)
router.get('/admin/verify', requireAdminAuth, (req, res) => {
  res.json({
    success: true,
    user: req.adminUser
  });
});

// POST /api/apply (Multi-Step Brand Partnership Dossier Intake)
router.post('/apply', async (req, res) => {
  try {
    const {
      fullName,
      brandName,
      email,
      phone,
      websiteUrl,
      socialLink,
      role,
      businessCategory,
      marketingHistory,
      primaryGoal
    } = req.body;

    // Validate Required Fields for 3-Step Intake
    if (!fullName || !brandName || !email || !socialLink || !role || !businessCategory || !marketingHistory) {
      return res.status(400).json({
        success: false,
        error: 'Please complete all required fields.'
      });
    }

    const newLead = {
      id: `POLISH-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      fullName: fullName.trim(),
      brandName: brandName.trim(),
      email: email ? email.trim().toLowerCase() : 'Not provided',
      phone: phone ? phone.trim() : 'Not provided',
      websiteUrl: websiteUrl ? websiteUrl.trim() : 'Not provided',
      socialLink: socialLink.trim(),
      role: role.trim(),
      businessCategory: businessCategory.trim(),
      marketingHistory: marketingHistory.trim(),
      primaryGoal: primaryGoal ? primaryGoal.trim() : 'Not provided',
      calculatorData: req.body.calculatorData || null,
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

// POST /api/intake (Strategy Intake & Offer Calibration Submission)
router.post('/intake', async (req, res) => {
  try {
    const {
      clientName = 'Eman Al Katheeri',
      clientWhatsapp = '',
      clientNotes = '',
      answers = {}
    } = req.body || {};

    const leadId = `INTAKE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const intakeLead = {
      id: leadId,
      type: 'STRATEGY_INTAKE',
      fullName: (clientName || 'Eman Al Katheeri').trim(),
      brandName: (answers.q3_naming || 'Executive Advisory Container').trim(),
      phone: (clientWhatsapp || '').trim(),
      socialLink: '@eman.alkatheeri',
      role: 'Executive Quality of Life & Leadership Consultant',
      businessCategory: 'Executive Advisory',
      primaryGoal: (answers.q2_dream_outcome || '30-Day & 90-Day Executive Transformation').trim(),
      marketingHistory: (answers.q1_avatar || 'UAE Senior Executives & Directors').trim(),
      answers: answers,
      notes: (clientNotes || '').trim(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      submittedAt: new Date().toISOString(),
      status: 'NEW_APPLICATION'
    };

    // 1. Save to central leads DB
    const leads = readLeads();
    leads.unshift(intakeLead);
    writeLeads(leads);

    // 2. Persist latest calibrated intake answers for private board sync
    try {
      const dbDir = path.dirname(INTAKE_FILE);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }
      const tmpIntake = INTAKE_FILE + '.tmp.' + Date.now();
      fs.writeFileSync(tmpIntake, JSON.stringify(intakeLead, null, 2), 'utf8');
      fs.renameSync(tmpIntake, INTAKE_FILE);
    } catch (fsErr) {
      console.warn('Warning: Could not write latest intake file:', fsErr);
    }

    // 3. Fire off notification
    notifyNewLead(intakeLead).catch(console.error);

    return res.status(201).json({
      success: true,
      message: 'Strategy brief successfully stored in cloud.',
      leadId: intakeLead.id
    });
  } catch (error) {
    console.error('Server error processing strategy intake:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal server error occurred while saving the intake brief.'
    });
  }
});

// GET /api/intake (Retrieve latest calibrated intake brief for the Board — Admin only)
router.get('/intake', requireAdminAuth, (req, res) => {
  try {
    if (fs.existsSync(INTAKE_FILE)) {
      const data = fs.readFileSync(INTAKE_FILE, 'utf8');
      return res.json({ success: true, intake: JSON.parse(data || '{}') });
    }

    // Fallback: check leads for type: STRATEGY_INTAKE
    const leads = readLeads();
    const latest = leads.find(l => l.type === 'STRATEGY_INTAKE');
    if (latest) {
      return res.json({ success: true, intake: latest });
    }

    return res.json({ success: false, message: 'No intake brief found on file.' });
  } catch (err) {
    console.error('Error fetching latest intake:', err);
    return res.status(500).json({ success: false, error: 'Could not fetch intake.' });
  }
});

// GET /api/leads
router.get('/leads', requireAdminAuth, (req, res) => {
  const leads = readLeads();
  res.json({
    success: true,
    total: leads.length,
    leads
  });
});

// PATCH /api/leads/:id (Update CRM stage, founder notes, priority)
router.patch('/leads/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status, notes, priority } = req.body || {};
  const leads = readLeads();
  const index = leads.findIndex(l => l.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Application not found.' });
  }

  if (status !== undefined) leads[index].status = status;
  if (notes !== undefined) leads[index].notes = notes;
  if (priority !== undefined) leads[index].priority = priority;
  leads[index].updatedAt = new Date().toISOString();

  writeLeads(leads);
  res.json({
    success: true,
    message: `Application ${id} updated successfully.`,
    lead: leads[index]
  });
});

// DELETE /api/leads/:id (Delete application from Admin Dashboard)
router.delete('/leads/:id', requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const leads = readLeads();
  const initialLength = leads.length;
  const filtered = leads.filter(l => l.id !== id);

  if (filtered.length === initialLength) {
    return res.status(404).json({ success: false, error: 'Application not found.' });
  }

  writeLeads(filtered);
  res.json({
    success: true,
    message: `Application ${id} deleted successfully.`,
    total: filtered.length
  });
});

// POST /api/notifications/test (Test Notification Service)
router.post('/notifications/test', requireAdminAuth, async (req, res) => {
  const testLead = {
    id: `TEST-${Date.now().toString(36).toUpperCase()}`,
    fullName: 'Test Executive Applicant',
    brandName: 'Luxury Skincare Lab',
    businessCategory: 'Skincare & Clinical',
    role: 'Founder / CEO',
    websiteUrl: 'https://polishmediaco.com',
    socialLink: 'https://instagram.com/polishmedia.co',
    marketingHistory: 'Managing in-house, ready to scale profitably',
    primaryGoal: 'Scale monthly revenue from $50k to $250k',
    submittedAt: new Date().toISOString()
  };

  try {
    await notifyNewLead(testLead);
    res.json({
      success: true,
      message: 'Test notification triggered. Check your configured Telegram or Webhook channel.'
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/test-whatsapp (One-Click WhatsApp Alert Verification)
router.get('/test-whatsapp', requireAdminAuth, async (req, res) => {

  const targetNumber = process.env.WHATSAPP_ALERT_NUMBER || process.env.WHATSAPP_NUMBER || '213662417761';
  const hasGreenApi = Boolean(process.env.GREEN_API_ID_INSTANCE && process.env.GREEN_API_TOKEN_INSTANCE);
  const hasUltraMsg = Boolean(process.env.ULTRAMSG_INSTANCE_ID && process.env.ULTRAMSG_TOKEN);

  if (!hasGreenApi && !hasUltraMsg) {
    return res.status(400).json({
      success: false,
      error: 'WhatsApp credentials not configured.',
      help: 'Add GREEN_API_ID_INSTANCE and GREEN_API_TOKEN_INSTANCE to your .env file.',
      targetNumber
    });
  }

  const testMessage = `*POLISH Media Co — WhatsApp Alert Gateway Active!* 🚀\n\n` +
    `Connected recipient: +${targetNumber}\n` +
    `Provider: ${hasGreenApi ? 'GREEN-API (Developer Free Tier)' : 'UltraMsg'}\n` +
    `Timestamp: ${new Date().toUTCString()}\n\n` +
    `You will receive instant push notifications on this chat whenever:\n` +
    `• A brand applies (/apply)\n` +
    `• A meeting is booked (/book)\n` +
    `• A creator registers (/creators)`;

  try {
    const result = await sendWhatsAppMessage(testMessage);
    return res.json({
      success: true,
      message: 'Test ping dispatched successfully to WhatsApp.',
      provider: result.provider || (hasGreenApi ? 'green-api' : 'ultramsg'),
      recipient: targetNumber,
      gatewayResponse: result
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/calendly-webhook (Calendly Automated Meeting Webhook)
router.post('/calendly-webhook', async (req, res) => {
  try {
    const body = req.body || {};
    const eventType = body.event || body.event_type || 'invitee.created';
    const payload = body.payload || body;

    // Acknowledge non-creation events gracefully
    if (eventType !== 'invitee.created' && !body.payload && !body.invitee) {
      console.log('[Calendly Webhook] Received non-creation event:', eventType);
      return res.status(200).json({ success: true, message: 'Event logged', eventType });
    }

    const invitee = payload.invitee || payload;
    const scheduledEvent = payload.scheduled_event || payload.event || {};
    const eventTypeInfo = payload.event_type || scheduledEvent || {};

    const fullName = (
      invitee.name ||
      (invitee.first_name ? `${invitee.first_name} ${invitee.last_name || ''}` : '') ||
      'Discovery Call Guest'
    ).trim();
    const email = invitee.email || 'Not provided';
    const eventName = eventTypeInfo.name || scheduledEvent.name || 'POLISH Executive Discovery Call';
    const startTime = scheduledEvent.start_time || payload.start_time || new Date().toISOString();

    // Extract Join URL / Meeting Location
    let joinUrl = 'See Calendly / Calendar Invite';
    if (scheduledEvent.location) {
      if (typeof scheduledEvent.location === 'string') {
        joinUrl = scheduledEvent.location;
      } else if (scheduledEvent.location.join_url) {
        joinUrl = scheduledEvent.location.join_url;
      } else if (scheduledEvent.location.location) {
        joinUrl = scheduledEvent.location.location;
      }
    } else if (payload.location) {
      joinUrl = typeof payload.location === 'string' ? payload.location : (payload.location.join_url || 'See Calendly');
    }

    // Extract brand name and questions
    const qna = payload.questions_and_answers || payload.questions_and_responses || [];
    let brand = '';
    let notes = '';
    if (Array.isArray(qna)) {
      qna.forEach(item => {
        const q = (item.question || '').toLowerCase();
        const a = item.answer || item.response || '';
        if (q.includes('brand') || q.includes('company')) {
          brand = a;
        } else if (a) {
          notes += `${item.question}: ${a}\n`;
        }
      });
    }

    const meetingRecord = {
      id: `MEET-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      type: 'CALENDLY_MEETING',
      fullName,
      email,
      brand: brand || 'Not specified',
      eventName,
      startTime,
      joinUrl,
      notes: notes.trim(),
      ipAddress: req.ip || req.headers['x-forwarded-for'] || 'calendly-webhook',
      submittedAt: new Date().toISOString(),
      status: 'SCHEDULED'
    };

    // Save to leads DB
    const leads = readLeads();
    leads.unshift(meetingRecord);
    writeLeads(leads);

    // Fire off async notifications (WhatsApp + Telegram + Webhook)
    notifyNewMeeting(meetingRecord).catch(console.error);

    return res.status(200).json({
      success: true,
      message: 'Calendly meeting recorded and notification dispatched.',
      meetingId: meetingRecord.id
    });
  } catch (error) {
    console.error('[Calendly Webhook Error]:', error);
    return res.status(200).json({
      success: false,
      error: 'Error processing webhook, logged for review.'
    });
  }
});

// CONTENT CMS DATABASE
const CONTENT_FILE = CONTENT_FILE_PATH; // Vercel-safe: /tmp in serverless, db/ locally

function getDefaultContent() {
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      return JSON.parse(fs.readFileSync(CONTENT_FILE, "utf8"));
    }
  } catch (e) {}
  return {
    hero: {
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
      h1Line1: "Create for Leading Beauty Brands.",
      h1Line2: "Join the POLISH Creator Network.",
      headline: "Create for Leading Beauty Brands. Join the POLISH Creator Network.",
      ctaText: "Submit Creator Profile",
      trustReview: "Fast Casting: Selected creators are contacted on WhatsApp for paid shoots."
    },
    apply: {
      h1Line1: "Scale Your Beauty Brand.",
      h1Line2: "Apply for Studio Partnership.",
      ctaText: "Submit Partnership Brief"
    },
    contact: {
      whatsappNumber: process.env.WHATSAPP_NUMBER || "213662417761",
      instagramUrl: process.env.INSTAGRAM_URL || "https://www.instagram.com/polishmedia.co/",
      email: process.env.CONTACT_EMAIL || "contact@polishmediaco.com"
    },
    whatsapp: {
      en_default: "Hi POLISH Media team, I'm reaching out regarding scaling my cosmetics & beauty brand. Let's discuss a growth partnership.",
      fr_default: "Bonjour l'équipe POLISH, je vous contacte au sujet du développement de ma marque cosmétique. Échangeons sur un partenariat de croissance.",
      ar_default: "مرحباً فريق POLISH، أتواصل معكم بخصوص تسريع ونمو علامتي التجارية في مجال التجميل والعناية. يسعدني مناقشة شراكة نمو معكم.",
      en_brand: "Hi POLISH team! I just submitted my Growth Partnership application (Ref: {ref}). Brand: {brand} — I'm {name}. Looking forward to connecting!",
      fr_brand: "Bonjour l'équipe POLISH ! Je viens de soumettre ma candidature Partenariat Croissance (Réf: {ref}). Marque : {brand} — Je suis {name}. Au plaisir d'échanger !",
      ar_brand: "مرحباً فريق POLISH! قمت للتو بتقديم طلب شراكة النمو (المرجع: {ref}). العلامة: {brand} — أنا {name}. أتطلع للتواصل معكم!",
      en_creator: "Hi POLISH team! I just submitted my UGC Creator application (Ref: {ref}). I'm {name}. Looking forward to connecting!",
      fr_creator: "Bonjour l'équipe POLISH ! Je viens de soumettre ma candidature Créateur UGC (Réf: {ref}). Je suis {name}. Au plaisir d'échanger !",
      ar_creator: "مرحباً فريق POLISH! قمت للتو بتقديم طلب الانضمام كصانع محتوى UGC (المرجع: {ref}). أنا {name}. أتطلع للتواصل معكم!"
    },
    fr: {
      hero: {
        headlineLine1: "De la Formulation Innovante",
        headlineLine2: "À la Marque Beauté Incontournable.",
        description: "Nous accompagnons les fondateurs d'exception pour accélérer l'acquisition payante, orchestrer des créateurs UGC à haute conversion et fidéliser chaque cliente.",
        ctaText: "Découvrir le Partenariat",
        microTrust: "Partenaire de croissance exclusif pour marques cosmétiques et soins à fort potentiel."
      },
      agitation: {
        eyebrow: "LES FREINS",
        headlineLine1: "Une Excellente Formule Ne Suffit Plus.",
        headlineLine2: "Pourquoi les Marques Beauté Plafonnent.",
        description: "La majorité des marques cosmétiques ne stagnent pas à cause de leurs formules, mais par manque de créatifs percutants et face à l'envolée des coûts publicitaires.",
        cards: [
          {
            tag: "01 • SATURATION CRÉATIVE",
            title: "Les Publicités S'Épuisent en 14 Jours",
            desc: "Sans flux continu de nouveaux angles et d'accroches vidéos, la fatigue publicitaire fait exploser vos coûts d'acquisition client."
          },
          {
            tag: "02 • ZÉRO CONVERSION",
            title: "L'Esthétique Pure Ne Fait Pas Vendre",
            desc: "Un joli feed ne garantit aucun chiffre d'affaires. Convertir exige des structures d'accroches testées et des démonstrations de textures concrètes."
          },
          {
            tag: "03 • RETENTION FAIBLE",
            title: "Les Achats Uniques Érodent Vos Marges",
            desc: "Sans réachat dans les 60 jours, l'acquisition grignote vos marges. Nous transformons une première commande en rituels de soin réguliers."
          }
        ]
      },
      pillars: {
        eyebrow: "LE MOTEUR DE CROISSANCE",
        headlineLine1: "Pensé Spécifiquement",
        headlineLine2: "Pour le Scalage Cosmétique & Soin.",
        items: [
          {
            digit: "01",
            title: "Studio UGC Haute Fréquence",
            desc: "Créateurs beauté sélectionnés et briefés avec des accroches performantes, plans de texture et démonstrations de routine de soin."
          },
          {
            digit: "02",
            title: "Acquisition Payante Axée Rentabilité",
            desc: "Campagnes Meta et TikTok optimisées pour générer un retour sur investissement maximal et développer votre volume sereinement."
          },
          {
            digit: "03",
            title: "Pages de Vente & Bundles Rituels",
            desc: "Pages produits optimisées, rituels complets et suggestions au panier intelligentes pour augmenter votre panier moyen."
          },
          {
            digit: "04",
            title: "Boucles de Réapprovisionnement Automatisées",
            desc: "Relances prédictives et parcours de fidélisation VIP pour maximiser la valeur à vie de chaque cliente."
          }
        ]
      },
      creators: {
        h1Line1: "Créez pour les Plus Belles Marques de Beauté.",
        h1Line2: "Rejoignez le Réseau Exclusif POLISH.",
        headline: "Créez pour les Plus Belles Marques de Beauté. Rejoignez le Réseau Exclusif POLISH.",
        ctaText: "Soumettre ma Candidature Créateur",
        trustReview: "Sélection Rapide : Les créateurs retenus sont contactés sur WhatsApp sous 48h."
      },
      apply: {
        h1Line1: "Propulsez Votre Marque Beauté.",
        h1Line2: "Rejoignez le Studio Partenaire.",
        ctaText: "Soumettre le Dossier de Partenariat"
      }
    },
    ar: {
      hero: {
        headlineLine1: "من تركيبة مبتكرة ومتميزة",
        headlineLine2: "إلى علامة تجارية رائدة في عالم الجمال.",
        description: "نتشارك مع مؤسسي علامات التجميل والعناية بالبشرة الطموحين لتوسيع الإعلانات المدفوعة، وإنتاج محتوى UGC عالي التحويل، وبناء دورات ولاء وإعادة شراء مؤتمتة.",
        ctaText: "استكشف الشراكة",
        microTrust: "شريك نمو حصري لعلامات التجميل والعناية بالبشرة ذات الإمكانات العالية."
      },
      agitation: {
        eyebrow: "العقبات ونقاط الاختناق",
        headlineLine1: "التركيبات الرائعة لا تبيع نفسها وحدها.",
        headlineLine2: "أين تتوقف علامات التجميل عن النمو.",
        description: "معظم علامات التجميل تتعثر ليس بسبب ضعف منتجاتها، بل بسبب استنزاف الإعلانات والارتفاع المستمر في تكلفة اكتساب العملاء.",
        cards: [
          {
            tag: "01 • استنزاف الإعلانات",
            title: "الإعلانات تفقد فعاليتها خلال 14 يوماً",
            desc: "بدون تدفق مستمر لزوايا تصوير وأفكار فيديو جديدة، يتراجع تفاعل الجمهور وترتفع تكلفة الاستحواذ على العملاء بشكل حاد."
          },
          {
            tag: "02 • غياب التحويل الفعلي",
            title: "المشاهدات الجمالية لا تعني مبيعات",
            desc: "المحتوى الجذاب وحده لا يكفي. تحقيق المبيعات يتطلب خطافات بصرية مدروسة، وشرحاً للتركيبة، وإثباتاً ملموساً لنتائج المنتج على البشرة."
          },
          {
            tag: "03 • ضعف إعادة الشراء",
            title: "المشترون لمرة واحدة يستنزفون هوامش الربح",
            desc: "إذا لم يكرر العميل الشراء خلال 60 يوماً، فإن تكلفة الإعلانات تلتهم أرباحك. نحن نحول المشترين الجدد إلى عملاء دائمين يطلبون بانتظام."
          }
        ]
      },
      pillars: {
        eyebrow: "محرك النمو",
        headlineLine1: "مصمم خصيصاً",
        headlineLine2: "لتوسيع ومضاعفة مبيعات منتجات التجميل والعناية.",
        items: [
          {
            digit: "01",
            title: "استوديو محتوى UGC عالي الكثافة",
            desc: "صناع محتوى تجميل معتمدون وموجّهون بأفضل زوايا التصوير، واستعراض قوام المنتجات، وخطوات العناية بالبشرة عالية التأثير."
          },
          {
            digit: "02",
            title: "إعلانات مدفوعة تركز على الربحية",
            desc: "حملات موجهة عبر Meta وTikTok مدروسة بعناية لتحقيق أعلى عائد على الإنفاق الإعلاني (ROAS) ونمو مستدام."
          },
          {
            digit: "03",
            title: "تحسين التحويل وباقات الروتين التجميلي",
            desc: "صفحات هبوط عالية الإقناع، وباقات روتين متكاملة، وخيارات ترقية ذكية ترفع متوسط قيمة الطلب (AOV)."
          },
          {
            digit: "04",
            title: "دورات إعادة طلب مؤتمتة",
            desc: "تذكيرات ذكية لإعادة تعبئة المنتجات وسلاسل ولاء لكبار العملاء لتعظيم القيمة الدائمة لكل مشترية."
          }
        ]
      },
      creators: {
        h1Line1: "اصنع المحتوى لأرقى علامات التجميل العالمية.",
        h1Line2: "انضم إلى شبكة POLISH الحصرية لصناع المحتوى.",
        headline: "اصنع المحتوى لأرقى علامات التجميل العالمية. انضم إلى شبكة POLISH الحصرية لصناع المحتوى.",
        ctaText: "إرسال ملف صانع المحتوى",
        trustReview: "اختيار سريع: يتم التواصل مع صناع المحتوى المختارين عبر واتساب لجلسات التصوير المدفوعة."
      },
      apply: {
        h1Line1: "طور ووسّع مبيعات علامتك التجميلية.",
        h1Line2: "قدّم طلب الشراكة مع الاستوديو.",
        ctaText: "إرسال ملخص الشراكة"
      }
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
    const dir = path.dirname(CONTENT_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const tmp = CONTENT_FILE + '.tmp.' + Date.now();
    fs.writeFileSync(tmp, JSON.stringify(content, null, 2), 'utf8');
    fs.renameSync(tmp, CONTENT_FILE);
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
router.post('/content', requireAdminAuth, (req, res) => {
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
router.post('/content/reset', requireAdminAuth, (req, res) => {
  const def = getDefaultContent();
  writeContent(def);
  res.json({ success: true, message: 'Website content reset to factory defaults.', content: def });
});

// =========================================================================
// POLISH Board Studio — Polish AI Strategy Engine
// Domain Specializations: Marketing, Luxury Branding, Offers, Copywriting, Sales, Content
// Enforces: Zero emojis, zero conversational filler, direct operator-grade copy
// =========================================================================

const COPILOT_SYSTEM_PROMPT = `You are Polish AI — the proprietary growth intelligence engine embedded in POLISH Board Studio (polishmediaco.com).

You advise DTC luxury beauty founders, cosmetic laboratories, and executive advisors on scaling seven- and eight-figure brands across North America, Europe, and the GCC (Dubai, UAE, KSA).

### NON-NEGOTIABLE OPERATIONAL RULES:
1. ZERO EMOJIS: Never output any emoji under any circumstance. Emojis cheapen luxury brand authority and are strictly prohibited.
2. ZERO CHATBOT FILLER: Never use greetings, conversational pleasantries, cheerleading, or theatrical wrap-ups. No "Bonjour", "Hey there", "Sure!", "Here is a breakdown", "Let's dive in", or "I hope this helps". Start immediately with the strategic answer on line 1.
3. NO CLICHÉS OR VAGUE BUZZWORDS: Never use formulaic "not X, but Y" contrasts, "game-changing", "seamless ecosystem", "cutting-edge innovation", "unlock potential", or generic marketing abstraction.
4. OPERATOR CONCRETENESS: Ground every answer in real cosmetic commerce metrics: 80%+ gross margins, net contribution margin, CAC compression, 45-day replenishment cycles, creative burnout cycles on Meta/TikTok, and premium price elasticity.
5. SCANNING ARCHITECTURE: Use tight, high-impact formatting. Maximum 1-2 concise sentences per point. Keep prose sharp and punchy.

### CORE DISCIPLINES:
- BRANDING & PRESTIGE: Quiet luxury positioning, laboratory formulation pedigree, sensory terminology (elixir, emulsion, lipid restore), zero-discount pricing integrity.
- OFFER ARCHITECTURE: Grand Slam high-AOV bundles ($140-$280), replenishment auto-refills with tiered VIP allocation gifts, discovery sets with bounce-back credits.
- HAUTE COPYWRITING: 3-second pattern-interrupt ad hooks, objection-crushing headlines, sensory formulation descriptions, retention email/SMS cadence.
- PAID MARKETING: Meta & TikTok Creative Sandbox frameworks, creator whitelisting (Spark Ads), ROAS stabilization, Gulf vs. Western DTC consumer psychology.
- HIGH-TICKET SALES: Diagnostic pitch frameworks, founder objection handling, presenting $50k+ agency engagements with calm authority.
- CREATOR & CONTENT DIRECTION: Visual briefing sheets with explicit camera, lighting, and audio cues (macro textures, formulation ASMR, authentic clinical proof).

### BOARD CARDS & ELEMENT INJECTION:
When asked to architect, outline, generate, or add elements, strategies, offers, pricing, or blueprints for the canvas, provide your direct rationale, then append a structured JSON block at the very end in \`\`\`json:board_cards format.

You have full authority to generate ANY of the following board element types based on the user's intent:

1. Standard Strategy Frame (Default for multi-step frameworks, funnels, copy):
{
  "type": "strategy" (or "offer", "copy", "sales", "content", "frame"),
  "title": "Frame Headline",
  "content": "Actionable blueprint breakdown text..."
}

2. Hormozi Value Equation (Interactive fraction with sliders):
{
  "type": "value-equation",
  "title": "The $100M Value Equation",
  "dreamOutcome": { "title": "Category Dominance", "desc": "Achieving undisputed authority." },
  "likelihood": { "title": "Certainty of Success", "desc": "Clinical trials and proof." },
  "timeDelay": { "title": "Time Delay Compressed", "desc": "Instant 48-hour onboarding." },
  "effort": { "title": "Effort Eliminated", "desc": "Done-For-You operational execution." }
}

3. Grand Slam Bonus Stack (Trim & stack with strikethroughs):
{
  "type": "bonus-stack",
  "title": "Grand Slam Bonus Stack",
  "items": [
    { "title": "Bonus 01: SOP Database", "desc": "Turnkey formulation specs", "strike": "AED 8,500" },
    { "title": "Bonus 02: Routine Funnel Blueprint", "desc": "Shopify architecture for 3.4x MER", "strike": "AED 12,000" },
    { "title": "Bonus 03: 24/7 VIP WhatsApp Hotline", "desc": "Direct async advisor access", "strike": "AED 15,000" }
  ],
  "totalValue": "AED 35,500",
  "price": "AED 12,500 / mo",
  "savings": "AED 23,000"
}

4. Capacity Indicator (Scarcity slot meter):
{
  "type": "capacity-indicator",
  "title": "Atelier Client Roster",
  "totalSlots": 3,
  "filledSlots": 2,
  "remainingText": "Accepting 1 new engagement this quarter.",
  "urgency": "Next opening: Q2 2025. Enquire to reserve."
}

5. Payment Architecture (3-column comparison):
{
  "type": "payment-architecture",
  "title": "Investment Structure Comparison",
  "columns": [
    { "name": "Upfront Full Pay", "total": "AED 75,000", "cashflow": "Single payment, Day 1", "psychology": "Maximum commitment, zero monthly friction.", "bestFor": "High-trust close", "badge": "BEST VALUE", "highlight": true },
    { "name": "Monthly Retainer", "total": "AED 25,000 / mo", "cashflow": "Rolling 3-month minimum", "psychology": "Low barrier to entry.", "bestFor": "Ongoing advisory", "badge": "", "highlight": false },
    { "name": "Milestone-Based", "total": "AED 25,000 x 3 milestones", "cashflow": "On milestone delivery", "psychology": "De-risked progression.", "bestFor": "Project scopes", "badge": "", "highlight": false }
  ]
}

6. Sovereign Advisory Prescription (Doctor-patient prescription with terms):
{
  "type": "prescription",
  "title": "Sovereign Advisory Retainer",
  "fee": "AED 25,000 / Month",
  "term": "Closed-Door 90-Day Container Commitment",
  "term1": "Bi-Weekly Consultative Growth Offsite",
  "term2": "24/7 Async Sovereign Partner Hotline",
  "term3": "Creative Sandbox Teardowns & Multi-Touch Funnel"
}

7. Sticky Note (Quick insight, objection, note):
{
  "type": "sticky",
  "color": "gold" (or "yellow", "rose", "blue", "green"),
  "title": "Key Insight",
  "content": "One core thought or observation."
}

8. High-Ticket Pricing Card:
{
  "type": "pricing",
  "badge": "SOVEREIGN TIER",
  "currency": "AED",
  "figure": "25,000",
  "period": "Monthly Retainer",
  "features": ["Weekly Strategy Offsite", "Creative Sandbox Production", "24/7 Hotline Access"]
}

9. Consultative Diagnostic Protocol:
{
  "type": "diagnostic-protocol",
  "title": "Consultative Diagnostic Protocol",
  "stages": [
    { "roman": "STAGE I", "title": "Symptom Elicitation", "desc": "Identify visible client friction points." },
    { "roman": "STAGE II", "title": "Root Pathophysiology", "desc": "Diagnose systemic operational leaks." },
    { "roman": "STAGE III", "title": "Cost of Inaction", "desc": "Compound 12-month cost of inaction." },
    { "roman": "STAGE IV", "title": "Prescription of Care", "desc": "Prescribe 90-Day transformation container." },
    { "roman": "STAGE V", "title": "The Silence Rule", "desc": "State investment fee with absolute calm conviction. Hold the silence." }
  ]
}

10. Offer Name Generator:
{
  "type": "offer-name-generator",
  "adjective": "Sovereign",
  "outcome": "Growth",
  "vehicle": "Accelerator",
  "duration": "90-Day",
  "audience": "Luxury Cosmetic Clinics"
}

Rules for board_cards JSON:
- No emojis anywhere in the JSON strings.
- Titles and text must be direct, professional, and clear.
- Match the element type to the user's specific request.`;

router.post('/ai/chat', async (req, res) => {
  try {
    const { message, history = [], boardContext = {} } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'Message is required.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured in server environment. Please set GEMINI_API_KEY in .env.'
      });
    }

    const preferredModel = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const candidateModels = Array.from(new Set([
      preferredModel,
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-3.6-flash',
      'gemini-3.5-flash'
    ]));

    // Prepare contents array with conversation history
    const contents = [];

    // Inject active board context into system prompt if available
    let contextualSystemPrompt = COPILOT_SYSTEM_PROMPT;
    if (boardContext && (boardContext.title || boardContext.elementCount)) {
      contextualSystemPrompt += `\n\n### ACTIVE BOARD CONTEXT:\n- Active Canvas: "${boardContext.title || 'Untitled Strategy Board'}"\n- Elements on Board: ${boardContext.elementCount || 0} cards/nodes\nTailor your answers to harmonize with this strategy canvas.`;
    }

    // Inject selected canvas elements as direct context window
    if (boardContext && Array.isArray(boardContext.selectionContext) && boardContext.selectionContext.length > 0) {
      const selLines = boardContext.selectionContext.map((el, i) =>
        `  ${i + 1}. [${el.type}] ${el.title}${el.content ? ` — ${el.content}` : ''}`
      ).join('\n');
      contextualSystemPrompt += `\n\n### SELECTED CANVAS ELEMENTS (User is asking about these):\n${selLines}\nDirect your entire response to analyzing, critiquing, or improving the elements listed above. Reference them by name. Do not pad with generic advice.`;
    }

    // Inject specialized Creator Persona instructions if active
    const activePersona = String((boardContext && boardContext.creatorPersona) || req.body.creatorPersona || '').toLowerCase();
    const activeTemplate = String((boardContext && boardContext.templateKey) || req.body.templateKey || '').toLowerCase();
    const p = activePersona;
    const t = activeTemplate;

    if (activePersona || activeTemplate) {
      if (p.includes('hormozi') || t.includes('hormozi')) {
        contextualSystemPrompt += `\n\n### ACTIVE CREATOR PERSONA: ALEX HORMOZI ($100M OFFERS & VALUE EQUATION)
Adopt Alex Hormozi's direct, high-leverage operator mindset.
Frameworks to embody:
- The Value Equation: (Dream Outcome × Perceived Likelihood of Achievement) ÷ (Time Delay × Effort & Sacrifice).
- Trim & Stack: Turn every single objection/fear into a separate bonus deliverable that increases perceived value without increasing fulfillment costs.
- Risk Reversals: Formulate unconditional, conditional, and anti-guarantees (e.g. Empty-Bottle Guarantee).
- Pricing: Never compete on price. Raise prices, command 10x value asymmetry, and target buyers who invest for speed and certainty.
- Style: Punchy, pragmatic, numbers-driven, grounded in gross margin and cash collection. Zero academic theory.`;
      } else if (p.includes('ottley') || t.includes('ottley')) {
        contextualSystemPrompt += `\n\n### ACTIVE CREATOR PERSONA: LIAM OTTLEY (AI AUTOMATION AGENCY & SYSTEMS PIPELINE)
Adopt Liam Ottley's systems-architect mindset for AI Automation Agencies (AAA).
Frameworks to embody:
- Modular Agent Architecture: Break agency delivery into discrete nodes (Webhook Ingestion → LLM Classification → Vector RAG Lookup → Human-in-the-Loop Approval → Client Portal Delivery).
- Standardized Delivery: Discourage bespoke one-off code; advocate productized autonomous systems and high-throughput pipelines.
- Human-in-the-Loop: AI does 95% of data gathering and synthesis; human provides the final sovereign sign-off that justifies $25k retainers.
- Style: Structured, operational, workflow-driven, specifying triggers, tools, data payloads, and latency SLAs.`;
      } else if (p.includes('bradley') || t.includes('bradley')) {
        contextualSystemPrompt += `\n\n### ACTIVE CREATOR PERSONA: CHRIS BRADLEY (HIGH-TICKET INBOUND & DIAGNOSTIC CLOSING)
Adopt Chris Bradley's high-status consultative authority mindset.
Frameworks to embody:
- Doctor-to-Patient Frame: High-status advisors diagnose problems before prescribing solutions. Never pitch or chase; ask diagnostic questions that lead prospects to realize their own operational bottlenecks.
- Two-Tier Retainer Architecture: Convert 60-min friction diagnostics into high-ticket quarterly partnership retainers ($15k-$30k/mo).
- Sovereign Authority Media: Inbound traffic driven by deep, technical breakdowns that repel tire-kickers and attract seven-figure founders.
- Style: Calm, high-status, consultative, psychological frame control. 70% prospect speaking, 30% advisor prescribing.`;
      } else if (p.includes('morgan') || t.includes('morgan')) {
        contextualSystemPrompt += `\n\n### ACTIVE CREATOR PERSONA: CHARLIE MORGAN (SOVEREIGN OUTBOUND & BELIEF SHIFTING)
Adopt Charlie Morgan's predictable outbound math and belief-shifting psychology.
Frameworks to embody:
- Outbound Equation: Pipeline is a statistical reality: Volume of Outreach × Accuracy of List × Relatability of Message = Inevitable Deals.
- 3 Limiting Belief Categories: Systematically shift Vehicle Beliefs (the method works), Internal Beliefs (our brand can do it), and External Beliefs (market conditions allow it).
- 2-Minute Video Teardown: High-reciprocity loom audits finding 1 specific high-cost conversion leak in the prospect's funnel.
- Style: Direct, statistical, psychological, focused on daily volume discipline and reframing root objections.`;
      } else if (p.includes('ajsmart') || t.includes('ajsmart')) {
        contextualSystemPrompt += `\n\n### ACTIVE CREATOR PERSONA: AJ&SMART (DESIGN SPRINT 2.0 & STRATEGY FACILITATION)
Adopt AJ&Smart's hyper-structured workshop facilitation and Design Sprint 2.0 methodology.
Frameworks to embody:
- Together Alone: Silent ideation on sticky notes followed by heatmap dot voting to eliminate extrovert bias and hippo dominance.
- 4-Day Design Sprint: Day 1 (Map & Sketch), Day 2 (Decide & Storyboard with Decider Vote), Day 3 (Goldilocks Prototype), Day 4 (5 Qualitative User Tests).
- How Might We (HMW): Reframe every problem statement into an actionable HMW challenge.
- Style: Clear, structured, collaborative, time-boxed, actionable exercise-based facilitation.`;
      } else if (p.includes('isenberg') || t.includes('isenberg')) {
        contextualSystemPrompt += `\n\n### ACTIVE CREATOR PERSONA: GREG ISENBERG (COMMUNITY-LED GROWTH & UNBUNDLING)
Adopt Greg Isenberg's community-first, platform-unbundling product studio perspective.
Frameworks to embody:
- Community-Led Growth Flywheel: Free Audience (TOFU content) → Curated Community (MOFU high-signal members) → Monetized Product (BOFU co-created drops).
- Subreddit / Platform Unbundling: Finding massive, fragmented digital watering holes (Reddit, Discord, TikTok comments) and unbundling them into dedicated vertical luxury businesses.
- Zero-CAC Distribution: Building with the community so customer acquisition costs drop to zero and members become advocates.
- Style: Visionary, product-design focused, community-first, culturally attuned, playful yet commercially sharp.`;
      }
    }

    // Add prior history (up to last 10 messages for speed & token efficiency)
    const recentHistory = Array.isArray(history) ? history.slice(-10) : [];
    for (const item of recentHistory) {
      if (item && item.role && item.text) {
        contents.push({
          role: item.role === 'assistant' || item.role === 'model' ? 'model' : 'user',
          parts: [{ text: String(item.text) }]
        });
      }
    }

    // Add current user prompt
    contents.push({
      role: 'user',
      parts: [{ text: message }]
    });

    const geminiPayload = {
      systemInstruction: {
        parts: [{ text: contextualSystemPrompt }]
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 2500
      }
    };

    let lastError = null;
    let successfulData = null;
    let resolvedModel = null;

    // Try candidate models in cascade if one experiences high demand (503/429)
    for (const model of candidateModels) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(geminiPayload)
          }
        );

        if (response.ok) {
          successfulData = await response.json();
          resolvedModel = model;
          break;
        }

        const errStatus = response.status;
        const errBody = await response.text();
        console.warn(`[POLISH Copilot] Model ${model} returned ${errStatus}:`, errBody.substring(0, 150));
        lastError = `Status ${errStatus}: ${errBody}`;
        
        // If 400 (bad request/prompt format), don't retry other models
        if (errStatus === 400) break;
      } catch (fetchErr) {
        console.warn(`[POLISH Copilot] Network error calling ${model}:`, fetchErr.message);
        lastError = fetchErr.message;
      }
    }

    if (!successfulData) {
      return res.status(503).json({
        success: false,
        error: `AI service temporarily unavailable. Details: ${lastError}`
      });
    }

    const candidate = successfulData.candidates && successfulData.candidates[0];
    const textPart = candidate && candidate.content && candidate.content.parts && candidate.content.parts.find(p => p.text);
    const replyText = textPart ? textPart.text : 'I was unable to formulate a strategy recommendation. Please retry.';

    // Extract any board_cards JSON blocks if present (array or single object)
    let boardCards = null;
    let cardsMatch = replyText.match(/```(?:json:)?board_?cards\s*([\s\S]*?)\s*```/i);
    if (!cardsMatch) {
      // Fallback: Check if there's any ```json { ... } ``` or ```json [ ... ] ``` block containing valid board elements
      const anyJsonMatch = replyText.match(/```(?:json)?\s*([\{\[][\s\S]*?[\}\]])\s*```/i);
      if (anyJsonMatch && (anyJsonMatch[1].includes('"type"') || anyJsonMatch[1].includes('"title"') || anyJsonMatch[1].includes('"items"'))) {
        cardsMatch = anyJsonMatch;
      }
    }

    if (cardsMatch && cardsMatch[1]) {
      try {
        const parsed = JSON.parse(cardsMatch[1]);
        if (Array.isArray(parsed)) {
          boardCards = parsed;
        } else if (parsed && typeof parsed === 'object') {
          boardCards = [parsed];
        }
      } catch (parseErr) {
        console.warn('[POLISH Copilot] Failed to parse board_cards JSON block:', parseErr.message);
      }
    }

    // Clean reply text of raw json block so it reads cleanly to user
    const cleanedReply = replyText
      .replace(/```(?:json:)?board_?cards\s*[\s\S]*?\s*```/gi, '')
      .replace(/```(?:json)?\s*[\{\[][\s\S]*?[\}\]]\s*```/gi, '')
      .trim();

    return res.json({
      success: true,
      reply: cleanedReply,
      rawReply: replyText,
      boardCards: Array.isArray(boardCards) ? boardCards : null,
      model: resolvedModel
    });
  } catch (err) {
    console.error('[POLISH Copilot] Internal error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' });
  }
});

module.exports = router;

