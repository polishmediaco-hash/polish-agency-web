const express = require('express');
const fs = require('fs');
const path = require('path');
const { notifyNewLead } = require('../services/notification');

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

// PATCH /api/leads/:id (Update CRM stage, founder notes, priority)
router.patch('/leads/:id', (req, res) => {
  const authKey = req.headers['x-api-key'] || req.query.key;
  const expectedKey = process.env.ADMIN_API_KEY || 'polish_admin_secure_key_2026';

  if (authKey !== expectedKey) {
    return res.status(401).json({ success: false, error: 'Unauthorized access.' });
  }

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
router.delete('/leads/:id', (req, res) => {
  const authKey = req.headers['x-api-key'] || req.query.key;
  const expectedKey = process.env.ADMIN_API_KEY || 'polish_admin_secure_key_2026';

  if (authKey !== expectedKey) {
    return res.status(401).json({ success: false, error: 'Unauthorized access.' });
  }

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
router.post('/notifications/test', async (req, res) => {
  const authKey = req.headers['x-api-key'] || req.query.key;
  const expectedKey = process.env.ADMIN_API_KEY || 'polish_admin_secure_key_2026';

  if (authKey !== expectedKey) {
    return res.status(401).json({ success: false, error: 'Unauthorized access.' });
  }

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

