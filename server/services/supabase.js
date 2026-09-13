/**
 * POLISH Media Co — Supabase Service Layer
 * 
 * Provides durable cloud persistence for Inbound Leads, Whiteboard Studio Boards,
 * Live CMS copy, and Keep-Alive health monitoring.
 * 
 * Includes automatic local filesystem fallback for offline development.
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const isConfigured = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

let supabase = null;
if (isConfigured) {
  supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false }
  });
  console.log('[Supabase] Connected to live cloud PostgreSQL:', SUPABASE_URL);
} else {
  console.log('[Supabase] Credentials not set — running with local filesystem fallback.');
}

// ── Local Fallback File Paths ────────────────────────────────────────────────
const IS_VERCEL = process.env.VERCEL === '1' || process.env.VERCEL_ENV !== undefined;
const LOCAL_LEADS_FILE = IS_VERCEL ? path.join('/tmp', 'leads.json') : path.join(__dirname, '../db/leads.json');
const LOCAL_CMS_FILE = IS_VERCEL ? path.join('/tmp', 'content.json') : path.join(__dirname, '../db/content.json');
const LOCAL_BOARDS_DIR = IS_VERCEL ? path.join('/tmp', 'boards') : path.join(__dirname, '../db/boards');
const LOCAL_INVOICES_FILE = IS_VERCEL ? path.join('/tmp', 'invoices.json') : path.join(__dirname, '../db/invoices.json');
const LOCAL_PRESENTATIONS_FILE = IS_VERCEL ? path.join('/tmp', 'presentations.json') : path.join(__dirname, '../db/presentations.json');
const BUNDLED_PRESENTATIONS_FILE = path.join(__dirname, '../db/presentations.json');


// ── Entity Mappers: camelCase (JS) <-> snake_case (Postgres) ─────────────────
function mapDbLeadToLead(row) {
  if (!row) return null;
  return {
    id: row.id,
    type: row.type,
    fullName: row.full_name,
    brandName: row.brand_name,
    brand: row.metadata?.brand || (row.brand_name && row.brand_name !== 'Brand' ? row.brand_name : null),
    email: row.email,
    phone: row.phone,
    websiteUrl: row.website_url,
    socialLink: row.social_link,
    role: row.role,
    businessCategory: row.business_category,
    monthlyRevenue: row.monthly_revenue || row.metadata?.monthlyRevenue || null,
    marketingHistory: row.marketing_history,
    primaryGoal: row.primary_goal,
    status: row.status,
    notes: row.notes,
    startTime: row.metadata?.startTime || row.start_time || null,
    joinUrl: row.metadata?.joinUrl || row.join_url || null,
    eventName: row.metadata?.eventName || row.event_name || null,
    eventUri: row.metadata?.eventUri || row.event_uri || null,
    portfolio: row.metadata?.portfolio || null,
    name: row.metadata?.name || row.full_name,
    answers: row.metadata?.answers || {},
    answersStructured: row.metadata?.answersStructured || {},
    tags: row.metadata?.tags || [],
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    metadata: row.metadata || {}
  };
}

function mapLeadToDbRow(lead) {
  return {
    id: lead.id,
    type: lead.type || 'BRAND_APPLICATION',
    full_name: (lead.fullName || lead.name || lead.clientName || 'Anonymous').trim(),
    brand_name: (lead.brandName || lead.brand || lead.storeName || 'Brand').trim(),
    email: (lead.email || 'not-provided@polishmediaco.com').trim().toLowerCase(),
    phone: (lead.phone || lead.clientWhatsapp || '').trim() || null,
    website_url: (lead.websiteUrl || lead.storeUrl || '').trim() || null,
    social_link: (lead.socialLink || '').trim() || null,
    role: lead.role || null,
    business_category: lead.businessCategory || null,
    monthly_revenue: lead.monthlyRevenue || null,
    marketing_history: lead.marketingHistory || null,
    primary_goal: lead.primaryGoal || null,
    status: lead.status || 'NEW_APPLICATION',
    notes: lead.notes || lead.clientNotes || null,
    metadata: {
      monthlyRevenue: lead.monthlyRevenue || null,
      startTime: lead.startTime || null,
      joinUrl: lead.joinUrl || null,
      eventName: lead.eventName || null,
      brand: lead.brand || null,
      eventUri: lead.eventUri || null,
      portfolio: lead.portfolio || null,
      name: lead.name || null,
      answers: lead.answers || {},
      answersStructured: lead.answersStructured || {},
      tags: lead.tags || [],
      ...lead.metadata
    },
    ip_address: lead.ipAddress || null,
    user_agent: lead.userAgent || null,
    submitted_at: lead.submittedAt || new Date().toISOString()
  };
}

function mapDbBoardToBoard(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    client: row.client,
    ownerId: row.owner_id,
    ownerEmail: row.owner_email,
    viewport: row.viewport,
    elements: row.elements,
    metadata: row.metadata || {},
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapBoardToDbRow(board) {
  return {
    id: board.id,
    slug: board.slug || board.id,
    title: board.title || 'Untitled Strategy Board',
    client: board.client || 'Private Advisory Client',
    owner_id: board.ownerId || 'admin',
    owner_email: board.ownerEmail || null,
    viewport: board.viewport || { panX: 0, panY: 0, scale: 1 },
    elements: board.elements || [],
    metadata: board.metadata || {},
    is_published: board.isPublished !== undefined ? board.isPublished : true,
    updated_at: new Date().toISOString()
  };
}

// ── LEADS SERVICE ────────────────────────────────────────────────────────────
const leadsService = {
  async getAllLeads() {
    if (isConfigured) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .neq('type', 'INVOICE')
        .order('submitted_at', { ascending: false });

      if (!error && data) {
        return data.map(mapDbLeadToLead);
      }
      console.warn('[Supabase leadsService.getAllLeads error, falling back]:', error?.message);
    }

    // Local Fallback
    try {
      if (fs.existsSync(LOCAL_LEADS_FILE)) {
        const leads = JSON.parse(fs.readFileSync(LOCAL_LEADS_FILE, 'utf8') || '[]');
        return leads.filter(l => l.type !== 'INVOICE');
      }
    } catch (e) {
      console.error('Local leads read error:', e);
    }
    return [];
  },

  async createLead(lead) {
    if (isConfigured) {
      const row = mapLeadToDbRow(lead);
      const { data, error } = await supabase
        .from('leads')
        .insert(row)
        .select()
        .single();

      if (!error && data) {
        return mapDbLeadToLead(data);
      }
      console.warn('[Supabase leadsService.createLead error, falling back]:', error?.message);
    }

    // Local Fallback
    try {
      let leads = [];
      if (fs.existsSync(LOCAL_LEADS_FILE)) {
        leads = JSON.parse(fs.readFileSync(LOCAL_LEADS_FILE, 'utf8') || '[]');
      }
      leads.unshift(lead);
      const dir = path.dirname(LOCAL_LEADS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(LOCAL_LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
      return lead;
    } catch (e) {
      console.error('Local leads write error:', e);
      return lead;
    }
  },

  async updateLead(id, updates) {
    if (isConfigured) {
      const payload = {};
      if (updates.status) payload.status = updates.status;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.tags) payload.metadata = { tags: updates.tags };

      const { data, error } = await supabase
        .from('leads')
        .update(payload)
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        return mapDbLeadToLead(data);
      }
      console.warn('[Supabase leadsService.updateLead error, falling back]:', error?.message);
    }

    // Local Fallback
    try {
      if (fs.existsSync(LOCAL_LEADS_FILE)) {
        const leads = JSON.parse(fs.readFileSync(LOCAL_LEADS_FILE, 'utf8') || '[]');
        const idx = leads.findIndex(l => l.id === id);
        if (idx !== -1) {
          leads[idx] = { ...leads[idx], ...updates, updatedAt: new Date().toISOString() };
          fs.writeFileSync(LOCAL_LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
          return leads[idx];
        }
      }
    } catch (e) {
      console.error('Local leads update error:', e);
    }
    return null;
  },

  async deleteLead(id) {
    if (isConfigured) {
      const { error } = await supabase.from('leads').delete().eq('id', id);
      if (!error) return true;
      console.warn('[Supabase leadsService.deleteLead error, falling back]:', error?.message);
    }

    // Local Fallback
    try {
      if (fs.existsSync(LOCAL_LEADS_FILE)) {
        let leads = JSON.parse(fs.readFileSync(LOCAL_LEADS_FILE, 'utf8') || '[]');
        leads = leads.filter(l => l.id !== id);
        fs.writeFileSync(LOCAL_LEADS_FILE, JSON.stringify(leads, null, 2), 'utf8');
        return true;
      }
    } catch (e) {
      console.error('Local leads delete error:', e);
    }
    return false;
  }
};

// ── BOARDS SERVICE ───────────────────────────────────────────────────────────
const boardsService = {
  async listBoards(userId) {
    if (isConfigured) {
      let query = supabase.from('boards').select('*').order('updated_at', { ascending: false });
      if (userId && userId !== 'admin') {
        query = query.or(`owner_id.eq.${userId},owner_id.eq.admin,is_published.eq.true`);
      }
      const { data, error } = await query;
      if (!error && data) {
        return data.map(mapDbBoardToBoard);
      }
      console.warn('[Supabase boardsService.listBoards error, falling back]:', error?.message);
    }

    // Local Fallback
    try {
      if (fs.existsSync(LOCAL_BOARDS_DIR)) {
        const files = fs.readdirSync(LOCAL_BOARDS_DIR).filter(f => f.endsWith('.json'));
        return files.map(f => {
          try {
            return JSON.parse(fs.readFileSync(path.join(LOCAL_BOARDS_DIR, f), 'utf8'));
          } catch (_) {
            return null;
          }
        }).filter(Boolean);
      }
    } catch (e) {
      console.error('Local boards list error:', e);
    }
    return [];
  },

  async getBoardById(id) {
    if (isConfigured) {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .or(`id.eq.${id},slug.eq.${id}`)
        .maybeSingle();

      if (!error && data) {
        return mapDbBoardToBoard(data);
      }
      console.warn('[Supabase boardsService.getBoardById error, falling back]:', error?.message);
    }

    // Local Fallback
    try {
      const sanitized = id.replace(/[^a-zA-Z0-9_-]/g, '');
      const filePath = path.join(LOCAL_BOARDS_DIR, `${sanitized}.json`);
      if (fs.existsSync(filePath)) {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
      }
    } catch (e) {
      console.error('Local board get error:', e);
    }
    return null;
  },

  async saveBoard(board) {
    if (isConfigured) {
      const row = mapBoardToDbRow(board);
      const { data, error } = await supabase
        .from('boards')
        .upsert(row, { onConflict: 'id' })
        .select()
        .single();

      if (!error && data) {
        return mapDbBoardToBoard(data);
      }
      console.warn('[Supabase boardsService.saveBoard error, falling back]:', error?.message);
    }

    // Local Fallback
    try {
      if (!fs.existsSync(LOCAL_BOARDS_DIR)) fs.mkdirSync(LOCAL_BOARDS_DIR, { recursive: true });
      const sanitized = board.id.replace(/[^a-zA-Z0-9_-]/g, '');
      const filePath = path.join(LOCAL_BOARDS_DIR, `${sanitized}.json`);
      fs.writeFileSync(filePath, JSON.stringify(board, null, 2), 'utf8');
      return board;
    } catch (e) {
      console.error('Local board save error:', e);
      return board;
    }
  },

  async deleteBoard(id) {
    if (isConfigured) {
      const { error } = await supabase.from('boards').delete().eq('id', id);
      if (!error) return true;
      console.warn('[Supabase boardsService.deleteBoard error, falling back]:', error?.message);
    }

    // Local Fallback
    try {
      const sanitized = id.replace(/[^a-zA-Z0-9_-]/g, '');
      const filePath = path.join(LOCAL_BOARDS_DIR, `${sanitized}.json`);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
    } catch (e) {
      console.error('Local board delete error:', e);
    }
    return false;
  }
};

// ── CMS SERVICE ──────────────────────────────────────────────────────────────
const cmsService = {
  async getContent() {
    if (isConfigured) {
      const { data, error } = await supabase
        .from('cms_content')
        .select('*')
        .eq('id', 'live_dictionary')
        .maybeSingle();

      if (!error && data && data.content && Object.keys(data.content).length > 0) {
        return data.content;
      }
      console.warn('[Supabase cmsService.getContent error/empty, falling back]:', error?.message);
    }

    // Local Fallback
    try {
      if (fs.existsSync(LOCAL_CMS_FILE)) {
        return JSON.parse(fs.readFileSync(LOCAL_CMS_FILE, 'utf8') || '{}');
      }
    } catch (e) {
      console.error('Local CMS read error:', e);
    }
    return {};
  },

  async saveContent(content, updatedBy = 'Admin') {
    if (isConfigured) {
      const { error } = await supabase
        .from('cms_content')
        .upsert({
          id: 'live_dictionary',
          content: content,
          updated_by: updatedBy,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (!error) return true;
      console.warn('[Supabase cmsService.saveContent error, falling back]:', error?.message);
    }

    // Local Fallback
    try {
      const dir = path.dirname(LOCAL_CMS_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(LOCAL_CMS_FILE, JSON.stringify(content, null, 2), 'utf8');
      return true;
    } catch (e) {
      console.error('Local CMS write error:', e);
      return false;
    }
  }
};

// ── KEEP-ALIVE SERVICE (Prevent 7-Day Inactivity Pause) ───────────────────────
const keepAliveService = {
  async recordPing(source = 'vercel_cron') {
    if (isConfigured) {
      try {
        const { error } = await supabase.from('keep_alive').insert({
          ping_source: source,
          metadata: { timestamp: new Date().toISOString() }
        });
        if (!error) return { success: true, cloud: 'supabase' };
      } catch (e) {
        console.warn('[Keep-Alive] Ping record error:', e.message);
      }
    }
    return { success: true, cloud: 'local' };
  }
};

// ── INVOICES SERVICE ─────────────────────────────────────────────────────────
function mapDbRowToInvoice(row) {
  if (!row) return null;
  const meta = row.metadata || {};
  return {
    id: row.id,
    invoiceNumber: row.id,
    clientName: row.brand_name || meta.clientName || 'Client',
    clientContact: row.full_name || meta.clientContact || '',
    clientEmail: row.email || meta.clientEmail || '',
    clientPhone: row.phone || meta.clientPhone || '',
    totalAmount: row.monthly_revenue || meta.totalAmount || 0,
    currency: meta.currency || 'DA',
    issueDate: meta.issueDate || '',
    dueDate: meta.dueDate || '',
    status: row.status || 'ISSUED',
    itemsCount: Array.isArray(meta.items) ? meta.items.length : 0,
    items: meta.items || [],
    state: meta,
    createdAt: row.created_at || meta.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || meta.updatedAt || new Date().toISOString()
  };
}

const invoicesService = {
  async listInvoices() {
    if (isConfigured) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('type', 'INVOICE')
        .order('updated_at', { ascending: false });

      if (!error && data) {
        return data.map(mapDbRowToInvoice);
      }
      console.warn('[Supabase invoicesService.listInvoices error, falling back]:', error?.message);
    }

    // Local Fallback
    try {
      if (fs.existsSync(LOCAL_INVOICES_FILE)) {
        return JSON.parse(fs.readFileSync(LOCAL_INVOICES_FILE, 'utf8') || '[]');
      }
    } catch (e) {
      console.error('Local invoices read error:', e);
    }
    return [];
  },

  async getInvoiceById(id) {
    if (isConfigured) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('id', id)
        .eq('type', 'INVOICE')
        .maybeSingle();

      if (!error && data) {
        return mapDbRowToInvoice(data);
      }
      console.warn('[Supabase invoicesService.getInvoiceById error, falling back]:', error?.message);
    }

    // Local Fallback
    try {
      if (fs.existsSync(LOCAL_INVOICES_FILE)) {
        const invoices = JSON.parse(fs.readFileSync(LOCAL_INVOICES_FILE, 'utf8') || '[]');
        return invoices.find(inv => inv.id === id || inv.invoiceNumber === id) || null;
      }
    } catch (e) {
      console.error('Local invoice get error:', e);
    }
    return null;
  },

  async saveInvoice(invoiceData) {
    const id = (invoiceData.invoiceNumber || invoiceData.id || `POL-${new Date().getFullYear()}-094`).trim();
    const now = new Date().toISOString();
    const enrichedData = {
      ...invoiceData,
      id,
      invoiceNumber: id,
      updatedAt: now
    };
    if (!enrichedData.createdAt) enrichedData.createdAt = now;

    if (isConfigured) {
      const row = {
        id,
        type: 'INVOICE',
        full_name: (enrichedData.clientContact || 'Client Contact').trim(),
        brand_name: (enrichedData.clientName || 'Client Brand').trim(),
        email: (enrichedData.clientEmail || 'billing@polishmediaco.com').trim().toLowerCase(),
        phone: (enrichedData.clientPhone || '').trim() || null,
        monthly_revenue: String(enrichedData.totalAmount || enrichedData.grandTotal || ''),
        status: enrichedData.status || 'ISSUED',
        notes: enrichedData.terms || null,
        metadata: enrichedData,
        submitted_at: enrichedData.issueDate ? new Date().toISOString() : now,
        updated_at: now
      };

      const { data, error } = await supabase
        .from('leads')
        .upsert(row, { onConflict: 'id' })
        .select()
        .single();

      if (!error && data) {
        // Also update local cache for instant offline fallback
        try {
          let localInvs = [];
          if (fs.existsSync(LOCAL_INVOICES_FILE)) {
            localInvs = JSON.parse(fs.readFileSync(LOCAL_INVOICES_FILE, 'utf8') || '[]');
          }
          const idx = localInvs.findIndex(inv => inv.id === id);
          const mapped = mapDbRowToInvoice(data);
          if (idx >= 0) localInvs[idx] = mapped;
          else localInvs.unshift(mapped);
          const dir = path.dirname(LOCAL_INVOICES_FILE);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(LOCAL_INVOICES_FILE, JSON.stringify(localInvs, null, 2), 'utf8');
        } catch (_) {}

        return mapDbRowToInvoice(data);
      }
      console.warn('[Supabase invoicesService.saveInvoice error, falling back]:', error?.message);
    }

    // Local Fallback
    try {
      let localInvs = [];
      if (fs.existsSync(LOCAL_INVOICES_FILE)) {
        localInvs = JSON.parse(fs.readFileSync(LOCAL_INVOICES_FILE, 'utf8') || '[]');
      }
      const idx = localInvs.findIndex(inv => inv.id === id);
      const invoiceObj = {
        id,
        invoiceNumber: id,
        clientName: enrichedData.clientName || 'Client',
        clientContact: enrichedData.clientContact || '',
        clientEmail: enrichedData.clientEmail || '',
        clientPhone: enrichedData.clientPhone || '',
        totalAmount: enrichedData.totalAmount || enrichedData.grandTotal || 0,
        currency: enrichedData.currency || 'DA',
        issueDate: enrichedData.issueDate || '',
        dueDate: enrichedData.dueDate || '',
        status: enrichedData.status || 'ISSUED',
        itemsCount: Array.isArray(enrichedData.items) ? enrichedData.items.length : 0,
        items: enrichedData.items || [],
        state: enrichedData,
        createdAt: enrichedData.createdAt,
        updatedAt: now
      };

      if (idx >= 0) localInvs[idx] = invoiceObj;
      else localInvs.unshift(invoiceObj);

      const dir = path.dirname(LOCAL_INVOICES_FILE);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(LOCAL_INVOICES_FILE, JSON.stringify(localInvs, null, 2), 'utf8');
      return invoiceObj;
    } catch (e) {
      console.error('Local invoice save error:', e);
      return enrichedData;
    }
  },

  async deleteInvoice(id) {
    if (isConfigured) {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)
        .eq('type', 'INVOICE');

      if (!error) {
        // Also remove from local cache
        try {
          if (fs.existsSync(LOCAL_INVOICES_FILE)) {
            let localInvs = JSON.parse(fs.readFileSync(LOCAL_INVOICES_FILE, 'utf8') || '[]');
            localInvs = localInvs.filter(inv => inv.id !== id);
            fs.writeFileSync(LOCAL_INVOICES_FILE, JSON.stringify(localInvs, null, 2), 'utf8');
          }
        } catch (_) {}
        return true;
      }
      console.warn('[Supabase invoicesService.deleteInvoice error, falling back]:', error?.message);
    }

    // Local Fallback
    try {
      if (fs.existsSync(LOCAL_INVOICES_FILE)) {
        let localInvs = JSON.parse(fs.readFileSync(LOCAL_INVOICES_FILE, 'utf8') || '[]');
        localInvs = localInvs.filter(inv => inv.id !== id);
        fs.writeFileSync(LOCAL_INVOICES_FILE, JSON.stringify(localInvs, null, 2), 'utf8');
        return true;
      }
    } catch (e) {
      console.error('Local invoice delete error:', e);
    }
    return false;
  }
};

function mapDbRowToPresentation(row) {
  if (!row) return null;
  const meta = row.metadata || {};
  return {
    id: row.id,
    slug: meta.slug || row.id,
    brandName: row.brand_name || meta.brandName || '',
    contactName: row.full_name || meta.contactName || '',
    email: row.email || meta.email || '',
    phone: row.phone || meta.phone || '',
    title: meta.title || 'Growth Strategy Walkthrough',
    video: meta.video || '',
    boardId: meta.boardId || 'polish-cosmetics-launch',
    chapters: Array.isArray(meta.chapters) ? meta.chapters : [],
    deliverables: Array.isArray(meta.deliverables) ? meta.deliverables : [],
    url: meta.url || `/p/${meta.slug || row.id}`,
    status: row.status || 'ACTIVE',
    createdAt: row.submitted_at || row.created_at || meta.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || meta.updatedAt || new Date().toISOString()
  };
}

function slugifyProposal(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readLocalPresentations() {
  try {
    if (fs.existsSync(LOCAL_PRESENTATIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(LOCAL_PRESENTATIONS_FILE, 'utf8') || '[]');
      if (Array.isArray(data) && data.length > 0) return data;
    }
    if (fs.existsSync(BUNDLED_PRESENTATIONS_FILE)) {
      const content = fs.readFileSync(BUNDLED_PRESENTATIONS_FILE, 'utf8');
      if (IS_VERCEL) {
        try {
          const dir = path.dirname(LOCAL_PRESENTATIONS_FILE);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(LOCAL_PRESENTATIONS_FILE, content, 'utf8');
        } catch (_) {}
      }
      return JSON.parse(content || '[]');
    }
  } catch (e) {
    console.error('Local presentations read error:', e);
  }
  return [];
}

function writeLocalPresentations(list) {
  try {
    const dir = path.dirname(LOCAL_PRESENTATIONS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(LOCAL_PRESENTATIONS_FILE, JSON.stringify(list, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Local presentations write error:', e);
    return false;
  }
}

const presentationsService = {
  async listPresentations() {
    if (isConfigured) {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('type', 'PRESENTATION')
        .order('updated_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map(mapDbRowToPresentation);
      }
      if (error) {
        console.warn('[Supabase presentationsService.listPresentations error, falling back]:', error?.message);
      }
    }

    // Local Fallback (or when cloud has no rows yet)
    return readLocalPresentations();
  },

  async getPresentationBySlug(slugOrId) {
    if (!slugOrId) return null;
    const clean = String(slugOrId).trim().toLowerCase();

    if (isConfigured) {
      // 1. Try by ID first
      const { data: byId, error: errId } = await supabase
        .from('leads')
        .select('*')
        .eq('id', clean)
        .eq('type', 'PRESENTATION')
        .maybeSingle();

      if (!errId && byId) {
        return mapDbRowToPresentation(byId);
      }

      // 2. Try by metadata->>slug
      const { data: bySlug, error: errSlug } = await supabase
        .from('leads')
        .select('*')
        .eq('type', 'PRESENTATION');

      if (!errSlug && bySlug && bySlug.length > 0) {
        const found = bySlug.find(r => {
          const s = (r.metadata?.slug || r.id || '').toLowerCase();
          return s === clean;
        });
        if (found) return mapDbRowToPresentation(found);
      }
    }

    // Local Fallback (checked if not in cloud Supabase or if Supabase is offline)
    const localPresentations = readLocalPresentations();
    const foundLocal = localPresentations.find(p => 
      (p.slug && p.slug.toLowerCase() === clean) || 
      (p.id && p.id.toLowerCase() === clean)
    );

    if (foundLocal) {
      // If found in local seed while cloud is configured, sync in background
      if (isConfigured) {
        presentationsService.savePresentation(foundLocal).catch(err => {
          console.warn('[Supabase auto-seed presentation error]:', err?.message);
        });
      }
      return foundLocal;
    }

    return null;
  },

  async savePresentation(presData) {
    const rawBrand = (presData.brandName || presData.brand || 'Client Brand').trim();
    const rawSlug = (presData.slug || slugifyProposal(rawBrand) || `pres-${Date.now().toString(36)}`).trim().toLowerCase();
    const id = (presData.id || rawSlug).trim().toLowerCase();
    const now = new Date().toISOString();

    const enriched = {
      ...presData,
      id,
      slug: rawSlug,
      brandName: rawBrand,
      contactName: (presData.contactName || presData.contact || '').trim(),
      email: (presData.email || '').trim().toLowerCase(),
      phone: (presData.phone || '').trim(),
      title: (presData.title || 'Growth Strategy Walkthrough').trim(),
      video: (presData.video || '').trim(),
      boardId: (presData.boardId || presData.board || 'polish-cosmetics-launch').trim(),
      chapters: Array.isArray(presData.chapters) && presData.chapters.length ? presData.chapters : [
        { time: '00:00', seconds: 0, title: '01 • Diagnostic & Market Positioning' },
        { time: '03:15', seconds: 195, title: '02 • Revenue Velocity & CAC Compression' },
        { time: '06:40', seconds: 400, title: '03 • Creative & UGC Performance Matrix' },
        { time: '09:50', seconds: 590, title: '04 • 90-Day Roadmap & Retainer Scope' }
      ],
      deliverables: Array.isArray(presData.deliverables) && presData.deliverables.length ? presData.deliverables : [
        {
          num: '01',
          title: 'Diagnostic Bottlenecks Solved',
          desc: 'Systematic eradication of creative fatigue, breaking past historical ad ceiling barriers, and reducing blended CAC through angle diversification.'
        },
        {
          num: '02',
          title: '90-Day Scaling Levers',
          desc: 'Proprietary daily regimen bundling to expand basket AOV, lamellar barrier replenishment loops for recurring LTV, and creator video seeding.'
        },
        {
          num: '03',
          title: 'Retainer Scope & Milestones',
          desc: 'Dedicated creative director, weekly strategy calibration sprints, ongoing high-converting performance asset drops, and VIP founder communication.'
        }
      ],
      url: presData.url || `/p/${rawSlug}`,
      status: presData.status || 'ACTIVE',
      updatedAt: now
    };
    if (!enriched.createdAt) enriched.createdAt = now;

    if (isConfigured) {
      const row = {
        id,
        type: 'PRESENTATION',
        full_name: enriched.contactName || 'Founder',
        brand_name: enriched.brandName,
        email: enriched.email || 'client@polishmediaco.com',
        phone: enriched.phone || null,
        monthly_revenue: enriched.title,
        status: enriched.status,
        notes: enriched.url,
        metadata: enriched,
        submitted_at: enriched.createdAt,
        updated_at: now
      };

      const { data, error } = await supabase
        .from('leads')
        .upsert(row, { onConflict: 'id' })
        .select()
        .single();

      if (!error && data) {
        // Update local file cache for instant offline access
        try {
          const localList = readLocalPresentations();
          const mapped = mapDbRowToPresentation(data);
          const idx = localList.findIndex(p => p.id === id || p.slug === rawSlug);
          if (idx >= 0) localList[idx] = mapped;
          else localList.unshift(mapped);
          writeLocalPresentations(localList);
        } catch (_) {}

        return mapDbRowToPresentation(data);
      }
      console.warn('[Supabase presentationsService.savePresentation error, falling back]:', error?.message);
    }

    // Local Fallback
    const localList = readLocalPresentations();
    const idx = localList.findIndex(p => p.id === id || p.slug === rawSlug);
    if (idx >= 0) localList[idx] = enriched;
    else localList.unshift(enriched);
    writeLocalPresentations(localList);
    return enriched;
  },

  async deletePresentation(idOrSlug) {
    if (!idOrSlug) return false;
    const clean = String(idOrSlug).trim().toLowerCase();

    if (isConfigured) {
      const { error } = await supabase
        .from('leads')
        .delete()
        .or(`id.eq.${clean},metadata->>slug.eq.${clean}`)
        .eq('type', 'PRESENTATION');

      if (!error) {
        const localList = readLocalPresentations();
        const filtered = localList.filter(p => p.id !== clean && p.slug !== clean);
        writeLocalPresentations(filtered);
        return true;
      }
      console.warn('[Supabase presentationsService.deletePresentation error, falling back]:', error?.message);
    }

    // Local Fallback
    const localList = readLocalPresentations();
    const filtered = localList.filter(p => p.id !== clean && p.slug !== clean);
    writeLocalPresentations(filtered);
    return true;
  }
};

module.exports = {
  supabase,
  isConfigured,
  leadsService,
  boardsService,
  cmsService,
  invoicesService,
  presentationsService,
  keepAliveService
};

