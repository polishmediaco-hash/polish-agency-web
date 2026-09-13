-- ==============================================================================
-- POLISH Media Co — Supabase PostgreSQL Schema & Security Policies
-- Run this script in your Supabase Project: SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. Helper Function: Automatic `updated_at` Timestamp Trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. Inbound Leads & Applications (`leads`)
-- Consolidates /apply (Brands), /creators (Talent), /intake (Briefs), /book (Calendly)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.leads (
    id TEXT PRIMARY KEY,                                      -- e.g. 'POLISH-LN4K2P-9A8B'
    type TEXT NOT NULL DEFAULT 'BRAND_APPLICATION',          -- 'BRAND_APPLICATION' | 'CREATOR_TALENT' | 'CALENDLY_MEETING' | 'STRATEGY_INTAKE'
    full_name TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    website_url TEXT,
    social_link TEXT,
    role TEXT,
    business_category TEXT,
    monthly_revenue TEXT,
    marketing_history TEXT,
    primary_goal TEXT,
    status TEXT NOT NULL DEFAULT 'NEW_APPLICATION',          -- 'NEW_APPLICATION' | 'REVIEWING' | 'QUALIFIED' | 'CALL_BOOKED' | 'CLOSED_WON' | 'ARCHIVED'
    metadata JSONB DEFAULT '{}'::jsonb,                       -- Dynamic answers, creator stats, Calendly meeting details
    notes TEXT,
    ip_address TEXT,
    user_agent TEXT,
    submitted_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_leads_type_status ON public.leads(type, status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_email ON public.leads(email);

DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON public.leads
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 3. Whiteboard Studio Boards (`boards`)
-- Powers app.polishmediaco.com/boards and client presentation links (/b/:id)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.boards (
    id TEXT PRIMARY KEY,                                      -- e.g. 'starter-strategy-board'
    slug TEXT UNIQUE,                                         -- e.g. 'executive-strategy-template'
    title TEXT NOT NULL,
    client TEXT NOT NULL DEFAULT 'Private Advisory Client',
    owner_id TEXT,                                            -- Supabase Auth UID or 'admin'
    owner_email TEXT,
    viewport JSONB NOT NULL DEFAULT '{"panX": 0, "panY": 0, "scale": 1}'::jsonb,
    elements JSONB NOT NULL DEFAULT '[]'::jsonb,              -- Visual frames, cards, sticky notes, connectors, drawings
    metadata JSONB DEFAULT '{}'::jsonb,                       -- Extended attributes, comments, connections
    is_published BOOLEAN DEFAULT true,                        -- Allows read-only presentation access
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_boards_slug ON public.boards(slug);
CREATE INDEX IF NOT EXISTS idx_boards_owner ON public.boards(owner_id);
CREATE INDEX IF NOT EXISTS idx_boards_updated_at ON public.boards(updated_at DESC);

DROP TRIGGER IF EXISTS trg_boards_updated_at ON public.boards;
CREATE TRIGGER trg_boards_updated_at
    BEFORE UPDATE ON public.boards
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 4. Live Trilingual CMS (`cms_content`)
-- Powers instant website copy translations (EN, FR, AR) managed in /admin.html
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.cms_content (
    id TEXT PRIMARY KEY DEFAULT 'live_dictionary',
    content JSONB NOT NULL DEFAULT '{}'::jsonb,               -- Key-value trilingual dictionary
    updated_by TEXT,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

DROP TRIGGER IF EXISTS trg_cms_updated_at ON public.cms_content;
CREATE TRIGGER trg_cms_updated_at
    BEFORE UPDATE ON public.cms_content
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- ==============================================================================
-- 5. Executive Invoices (`invoices`)
-- Secured billing records managed in /admin/invoice and /admin.html
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
    id TEXT PRIMARY KEY,                                      -- e.g. 'POL-2026-094'
    invoice_number TEXT NOT NULL,
    client_name TEXT NOT NULL,
    client_contact TEXT,
    client_email TEXT,
    client_phone TEXT,
    currency TEXT NOT NULL DEFAULT 'DA',
    total_amount NUMERIC NOT NULL DEFAULT 0,
    issue_date TEXT,
    due_date TEXT,
    status TEXT NOT NULL DEFAULT 'ISSUED',                   -- 'DRAFT' | 'ISSUED' | 'PAID' | 'CANCELLED'
    state JSONB NOT NULL DEFAULT '{}'::jsonb,                 -- Complete invoice state (items, tax, deposit, payable)
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_name);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_updated_at ON public.invoices(updated_at DESC);

DROP TRIGGER IF EXISTS trg_invoices_updated_at ON public.invoices;
CREATE TRIGGER trg_invoices_updated_at
    BEFORE UPDATE ON public.invoices
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 6. Keep-Alive Heartbeat (`keep_alive`)
-- Used by the automated Vercel Cron ping every 48h to prevent 7-day auto-pausing
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.keep_alive (
    id BIGSERIAL PRIMARY KEY,
    ping_source TEXT DEFAULT 'vercel_cron',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_keep_alive_created_at ON public.keep_alive(created_at DESC);

-- ==============================================================================
-- 7. Row Level Security (RLS) Configuration
-- ==============================================================================
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.keep_alive ENABLE ROW LEVEL SECURITY;

-- Invoices: Strictly Service Role Only (Zero Public Exposure)
DROP POLICY IF EXISTS "Service role full access to invoices" ON public.invoices;
CREATE POLICY "Service role full access to invoices"
    ON public.invoices
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Leads: Service Role has full access; Public anon can submit
DROP POLICY IF EXISTS "Service role full access to leads" ON public.leads;
CREATE POLICY "Service role full access to leads"
    ON public.leads
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can submit leads" ON public.leads;
CREATE POLICY "Public can submit leads"
    ON public.leads
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Boards: Public can view published presentation boards; Service role has full access
DROP POLICY IF EXISTS "Service role full access to boards" ON public.boards;
CREATE POLICY "Service role full access to boards"
    ON public.boards
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view published boards" ON public.boards;
CREATE POLICY "Public can view published boards"
    ON public.boards
    FOR SELECT
    TO anon, authenticated
    USING (is_published = true);

-- CMS Content: Public can read live site text; Service role updates
DROP POLICY IF EXISTS "Public can read live CMS content" ON public.cms_content;
CREATE POLICY "Public can read live CMS content"
    ON public.cms_content
    FOR SELECT
    TO anon, authenticated
    USING (true);

DROP POLICY IF EXISTS "Service role full access to CMS" ON public.cms_content;
CREATE POLICY "Service role full access to CMS"
    ON public.cms_content
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Keep-Alive: Service role only
DROP POLICY IF EXISTS "Service role full access to keep_alive" ON public.keep_alive;
CREATE POLICY "Service role full access to keep_alive"
    ON public.keep_alive
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
