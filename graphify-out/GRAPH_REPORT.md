# Graph Report - polishmedia  (2026-09-13)

## Corpus Check
- 85 files · ~900,681 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 998 nodes · 1710 edges · 74 communities (65 shown, 7 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 51 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `887ec014`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- studio-core.js
- inspector.js
- boards.js
- comments-engine.js
- elements-factory.js
- studio-ai.js
- generate-brand-pack.js
- luxury-effects.js
- generate-logo-concepts.js
- generate-social-avatars.js
- package.json
- index.js
- firebase-config.js
- POLISH Media Co — Security, API Boundary & Backend Hardening Audit
- camera-bubble.js
- canvas-panzoom.js
- PolishI18n
- connector-engine.js
- marquee-selection.js
- sw-admin.js
- dependencies
- drawing-engine.js
- presentation.js
- supabase.js
- app.js
- minimap.js
- whatsapp.js
- vercel.json
- presentation-page.js
- 4. Prioritized Refactoring Recommendations
- 6. Next Priority Roadmap (Ready for Next Conversation)
- 3. OWASP Top 10 Audit Protocol
- 3. The 8-Zone Strategic Architecture
- POLISH Media Co. — Official Brand Guidelines & Standards Book (v2.0)
- POLISH Media Co. — Official Brand Guidelines & Standards Book (v2.0)
- test_presentation_page.js
- capture_presentation_views.js
- POLISH Luxury Beauty Design System & UI Architecture
- POLISH Media Co. — Typography Hierarchy & Specifications
- POLISH Media Agency — Web & Lead Engine (`polishmediaco.com`)
- test-miro-suite.js
- 🛠️ Automated Execution Workflow
- puppeteer
- test-liquid-browser.js
- test_mobile_phone_app.js
- Luxury Design Critic Rubric (Awwwards & Haute Parfumerie Standards)
- test-scroll-views.js
- test_auth_flow.js
- test_logo_render.js
- test_sequencer_e2e.js
- POLISH Media Co — Agent Guidelines & Context
- Clean Code & Production Performance Optimization Skill
- 2. The Direct-Response Beauty Audit Gates
- POLISH Media Co. — Official Social Media Profile Picture Suite (2026 Specifications)
- rules/graphify.md
- workflows/graphify.md
- supabase-config.js
- calendlySync.js
- capture-live-views.js
- auth.js
- seed-supabase.js
- templates-vault.js
- currency-engine.js
- luxury-scroll.js
- particle-canvas.js
- studio-events.js
- initLuxuryOpeningAnimation
- spotlight-cards.js
- kinetic-typography.js
- invoice.js
- POLISH Media Co. — Luxury Invoicing Suite Standards (v2.2)
- Zero-Fluff & Anti-Filler Rule

## God Nodes (most connected - your core abstractions)
1. `triggerAutoSave()` - 45 edges
2. `pushHistory()` - 36 edges
3. `renderElement()` - 32 edges
4. `6. Next Priority Roadmap (Ready for Next Conversation)` - 29 edges
5. `pushHistory()` - 19 edges
6. `selectElement()` - 19 edges
7. `renderInvoiceSheet()` - 18 edges
8. `setupToolbar()` - 18 edges
9. `getCanvasCenter()` - 16 edges
10. `bindKeyboardShortcuts()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `checkNewCalendlyMeetings()` --calls--> `notifyNewMeeting()`  [EXTRACTED]
  server/services/calendlySync.js → server/services/notification.js

## Import Cycles
- None detected.

## Communities (74 total, 7 thin omitted)

### Community 0 - "studio-core.js"
Cohesion: 0.10
Nodes (67): addCallout(), addClinicalProof(), addConnection(), addDrawingStroke(), addForm(), addFormField(), addFrame(), addFrameBox() (+59 more)

### Community 1 - "inspector.js"
Cohesion: 0.16
Nodes (31): addBoxToFrame(), applyCoverBanner(), closeCoverModal(), cycleAlign(), handleDeviceCoverUpload(), hide(), init(), openCoverModal() (+23 more)

### Community 2 - "boards.js"
Cohesion: 0.15
Nodes (13): express, { boardsService }, BUNDLED_BOARDS_DIR, express, fs, getStarterBoard(), path, readBoardFile() (+5 more)

### Community 3 - "comments-engine.js"
Cohesion: 0.20
Nodes (29): addReply(), bindEventListeners(), cancelDraftPin(), closePopover(), deleteComment(), escapeHtml(), formatTimeAgo(), getInitials() (+21 more)

### Community 4 - "elements-factory.js"
Cohesion: 0.12
Nodes (32): applyElementStyles(), attachElementInteractions(), createBeliefTriadDOM(), createBonusStackDOM(), createCadenceTimelineDOM(), createCalloutDOM(), createCapacityIndicatorDOM(), createClinicalProofDOM() (+24 more)

### Community 5 - "studio-ai.js"
Cohesion: 0.15
Nodes (28): appendMessage(), applyCreatorPersona(), applySavedState(), auditCurrentBoard(), clearChat(), clearSelectionContext(), close(), getSelectionContext() (+20 more)

### Community 6 - "generate-brand-pack.js"
Cohesion: 0.14
Nodes (23): BASE_DIR, buildBrandPack(), COLOR_DIR, COLORS, createHorizontalLogoSvg(), createInstagramAvatarSvg(), createLinkedInBannerSvg(), createMarkSvg() (+15 more)

### Community 7 - "luxury-effects.js"
Cohesion: 0.15
Nodes (29): animateParticles(), applyFluidViscosity(), applyReducedMotionPolicy(), cacheScrollElements(), getScrollVelocity(), initAll(), initCardReveal(), initHeroIntersectionObserver() (+21 more)

### Community 8 - "generate-logo-concepts.js"
Cohesion: 0.30
Nodes (16): BASE_DIR, CONCEPTS_DIR, createDropperBottleMockupSvg(), createHorizontalLockupSvg(), createStandaloneMarkSvg(), createVerticalLockupSvg(), fs, generateAllConcepts() (+8 more)

### Community 9 - "generate-social-avatars.js"
Cohesion: 0.15
Nodes (16): ASSET_SPECS, AVATAR_DIR, COLORS, createAvatarSvg(), EDITIONS_DIR, { execSync }, fs, generateAll() (+8 more)

### Community 10 - "package.json"
Cohesion: 0.10
Nodes (19): author, description, devDependencies, puppeteer, license, main, name, overrides (+11 more)

### Community 11 - "index.js"
Cohesion: 0.11
Nodes (17): aiLimiter, ALLOWED_ORIGINS, apiRoutes, app, boardsRoutes, boardsWriteLimiter, compression, configLimiter (+9 more)

### Community 12 - "firebase-config.js"
Cohesion: 0.23
Nodes (11): deleteBoard(), getAuthHeaders(), init(), _initLocalFallback(), login(), loginOffline(), loginWithGoogle(), logout() (+3 more)

### Community 13 - "POLISH Media Co — Security, API Boundary & Backend Hardening Audit"
Cohesion: 0.06
Nodes (32): 1.1 Ingestion Endpoints (`POST /api/apply`, `POST /api/creators/apply`, `POST /api/intake`), 1.2 Status of `POST /api/leads` vs. Architectural Ingestion, 1.3 Webhook Integrity: `POST /api/calendly-webhook`, 1.4 Polish AI Strategy Engine: `POST /api/ai/chat`, 1.5 CMS Endpoints (`GET /api/content`, `POST /api/content`, `POST /api/content/reset`), 1.6 Strategy Boards API (`/api/boards`), 1. API Endpoint Security & Validation, 2.1 File-Based Atomic JSON Storage & Concurrency Hazards (+24 more)

### Community 14 - "camera-bubble.js"
Cohesion: 0.33
Nodes (12): clampAndApplyPos(), handlePointerDown(), onPointerMove(), onPointerUp(), init(), notifyToast(), start(), stop() (+4 more)

### Community 15 - "canvas-panzoom.js"
Cohesion: 0.29
Nodes (10): applyTransform(), fitToContent(), getCanvasBounds(), init(), resetView(), screenToCanvas(), setTool(), smoothPanTo() (+2 more)

### Community 17 - "connector-engine.js"
Cohesion: 0.50
Nodes (7): calculateBezierPath(), endDrawing(), getAnchorCoords(), getPortCenterInCanvas(), init(), renderAllConnections(), updateConnectedLines()

### Community 18 - "marquee-selection.js"
Cohesion: 0.31
Nodes (5): clearMultiSelection(), handlePointerMove(), handlePointerUp(), init(), startMarquee()

### Community 20 - "dependencies"
Cohesion: 0.25
Nodes (8): dependencies, compression, cors, dotenv, express, express-rate-limit, helmet, @supabase/supabase-js

### Community 21 - "drawing-engine.js"
Cohesion: 0.48
Nodes (5): attachStrokeEvents(), bindEvents(), getSmoothSvgPath(), init(), renderAllStrokes()

### Community 22 - "presentation.js"
Cohesion: 0.11
Nodes (38): buildPresentationSequence(), clearSpotlight(), closeSequencer(), escapeHtml(), focusOnElement(), getSlideTitle(), goToStep(), initLaser() (+30 more)

### Community 23 - "supabase.js"
Cohesion: 0.08
Nodes (18): express, fs, getDefaultContent(), { leadsService, cmsService, keepAliveService, invoicesService, presentationsService }, { notifyNewLead, notifyNewMeeting, sendWhatsAppMessage }, path, readContent(), { requireAdminAuth } (+10 more)

### Community 24 - "app.js"
Cohesion: 0.67
Nodes (5): hideAlert(), markFieldError(), showAlert(), updateStepUI(), validateCurrentStep()

### Community 25 - "minimap.js"
Cohesion: 0.46
Nodes (6): bindEvents(), bindInteractions(), createMiniMapDOM(), init(), scheduleUpdate(), update()

### Community 26 - "whatsapp.js"
Cohesion: 0.50
Nodes (3): initWhatsAppWidget(), POLISH_WHATSAPP_CONFIG, renderWhatsAppContent()

### Community 27 - "vercel.json"
Cohesion: 0.33
Nodes (5): builds, crons, headers, rewrites, version

### Community 28 - "presentation-page.js"
Cohesion: 0.22
Nodes (16): escapeHtml(), extractSlugFromPath(), getParams(), hydratePage(), init(), initYouTubeApi(), mountBoard(), mountVideo() (+8 more)

### Community 30 - "4. Prioritized Refactoring Recommendations"
Cohesion: 0.08
Nodes (23): 1.1 `public/studio/js/studio-core.js`, 1.2 `public/js/luxury-effects.js`, 1.3 `public/js/three.min.js` & `public/studio/js/html2canvas.min.js`, 1. God Nodes Analysis, 2.1 Cohesion Scores (< 0.10), 2.2 Cross-Module Coupling Topology, 2. Modularity & Community Cohesion, 3.1 Unreferenced Symbols & Leaky Interfaces (+15 more)

### Community 31 - "6. Next Priority Roadmap (Ready for Next Conversation)"
Cohesion: 0.04
Nodes (48): 1. Executive Summary & Brand Shift, 2. Core Pages & Component Architecture, 3. Backend Architecture (`server/index.js`), 4. Git & Repository Status, 5. Major Milestones & Integrations (September 2026 Session), 6. Next Priority Roadmap (Ready for Next Conversation), 7. How to Start a Fresh Antigravity Chat, A. Agent Reach & Internet Capabilities (`agent-reach`) (+40 more)

### Community 32 - "3. OWASP Top 10 Audit Protocol"
Cohesion: 0.20
Nodes (9): 1. The Core Security Mandate, 2. POLISH Media Co Threat Surface & Mitigations, 3. OWASP Top 10 Audit Protocol, 4. Express Hardening Blueprint, A01: Broken Access Control, A02: Security Headers & Transport Encryption, A03: Input Validation & Injection Defense, A04: Atomic File Storage & Race Condition Defense (+1 more)

### Community 33 - "3. The 8-Zone Strategic Architecture"
Cohesion: 0.11
Nodes (17): 1. Executive Context & Opportunity Blueprint, 2. Asset & Technical Repository Map, 3. The 8-Zone Strategic Architecture, 4. How to Continue in the `polishmedia` Project, POLISH MEDIA CO. — CLIENT HANDOFF & STRATEGY SPECIFICATION, Presenting Live to Eman, Private Advisory Architecture: Eman Al Katheeri (@eman.alkatheeri), Running the Whiteboard Locally in `polish-agency-web` (+9 more)

### Community 34 - "POLISH Media Co. — Official Brand Guidelines & Standards Book (v2.0)"
Cohesion: 0.12
Nodes (16): 1. Brand Essence & Strategic Positioning, 2. Logo System & Architecture, 3. Color Hierarchy & Specifications, 4. Typography Rules & Hierarchy, 5. Trilingual Code of Excellence, 6. Asset Directory Inventory, Arabic (Gulf Prestige & Private Office Voice), Brand Archetype: The Elite Cosmetic Architect (+8 more)

### Community 35 - "POLISH Media Co. — Official Brand Guidelines & Standards Book (v2.0)"
Cohesion: 0.12
Nodes (16): 1. Brand Essence & Strategic Positioning, 2. Logo System & Architecture, 3. Color Hierarchy & Specifications, 4. Typography Rules & Hierarchy, 5. Trilingual Code of Excellence, 6. Asset Directory Inventory, Arabic (Gulf Prestige & Private Office Voice), Brand Archetype: The Elite Cosmetic Architect (+8 more)

### Community 36 - "test_presentation_page.js"
Cohesion: 0.33
Nodes (6): apiRequest(), fs, http, path, puppeteer, runTest()

### Community 37 - "capture_presentation_views.js"
Cohesion: 0.33
Nodes (4): fs, path, puppeteer, VIEWPORTS

### Community 38 - "POLISH Luxury Beauty Design System & UI Architecture"
Cohesion: 0.22
Nodes (8): 1. Master Brand Tokens & Color Palette, 2. Award-Winning Luxury Cards & Glassmorphism, 3. Phone-Native Mobile Ergonomics (Screens <= 768px), 4. Trilingual & RTL Architecture (EN / FR / AR), 5. Visual Audit & Inspection Checklist, A. Dynamic Cursor Spotlight (RAF-Throttled Tracking), B. JavaScript Cursor Tracking Implementation, POLISH Luxury Beauty Design System & UI Architecture

### Community 39 - "POLISH Media Co. — Typography Hierarchy & Specifications"
Cohesion: 0.22
Nodes (8): 1. Font Families, 2. Typographic Scale & Cadence, 3. Tabular Numerals Requirement, 4. Google Fonts Embed Code, Arabic Script Harmony: **Tajawal**, Editorial Luxury Serif Accent: **Cormorant Garamond**, POLISH Media Co. — Typography Hierarchy & Specifications, Primary Structural Sans-Serif: **Plus Jakarta Sans**

### Community 40 - "POLISH Media Agency — Web & Lead Engine (`polishmediaco.com`)"
Cohesion: 0.22
Nodes (8): 1. Install & Run Locally, 🌐 Deploying to `polishmediaco.com`, ⚡ Key Capabilities & Architecture, Option A: Railway / Render / DigitalOcean (Recommended), Option B: VPS (Ubuntu with PM2 & NGINX), POLISH Media Agency — Web & Lead Engine (`polishmediaco.com`), 🚀 Quickstart, 💬 WhatsApp Customization

### Community 41 - "test-miro-suite.js"
Cohesion: 0.33
Nodes (5): fs, http, path, puppeteer, runMiroSuite()

### Community 42 - "🛠️ Automated Execution Workflow"
Cohesion: 0.25
Nodes (7): 🛠️ Automated Execution Workflow, 📋 Critique Output Format, Live Visual Design Critic & Multi-Viewport Audit Skill, 🎯 Purpose, Step 1: Run the Visual Capture Engine, Step 2: Inspect Generated Visual Evidence, Step 3: Conduct Structured Visual Design Critique

### Community 43 - "puppeteer"
Cohesion: 0.40
Nodes (4): puppeteer, fs, path, puppeteer

### Community 44 - "test-liquid-browser.js"
Cohesion: 0.40
Nodes (3): fs, path, puppeteer

### Community 45 - "test_mobile_phone_app.js"
Cohesion: 0.40
Nodes (3): fs, path, puppeteer

### Community 46 - "Luxury Design Critic Rubric (Awwwards & Haute Parfumerie Standards)"
Cohesion: 0.29
Nodes (6): 1. Spatial Rhythm & Monolith Presence (Weight: 20%), 2. Haute Luxury Typography (Weight: 25%), 3. Glassmorphism & Caustic Depth (Weight: 20%), 4. Conversion Architecture & Ergonomics (Weight: 20%), 5. Multilingual Polish (Weight: 15%), Luxury Design Critic Rubric (Awwwards & Haute Parfumerie Standards)

### Community 48 - "test_auth_flow.js"
Cohesion: 0.50
Nodes (3): fs, path, puppeteer

### Community 49 - "test_logo_render.js"
Cohesion: 0.50
Nodes (3): fs, path, puppeteer

### Community 50 - "test_sequencer_e2e.js"
Cohesion: 0.50
Nodes (3): fs, path, puppeteer

### Community 51 - "POLISH Media Co — Agent Guidelines & Context"
Cohesion: 0.33
Nodes (5): Key Files, POLISH Media Co — Agent Guidelines & Context, Project Overview, Tech Stack & Architecture, Workflow Rules for Agents

### Community 52 - "Clean Code & Production Performance Optimization Skill"
Cohesion: 0.33
Nodes (5): 1. Static Code Cleanup Protocol, 2. Runtime & Rendering Performance Optimization, 3. Automated Performance Verification Checklist, 4. Production Deployment Verification, Clean Code & Production Performance Optimization Skill

### Community 55 - "2. The Direct-Response Beauty Audit Gates"
Cohesion: 0.18
Nodes (10): 1. Core Philosophy: Humanized Authority over AI Slop, 2. The Direct-Response Beauty Audit Gates, 3. Trilingual Precision Matrix (EN / FR / AR), Gate A: The 3-Second Founder Value Test, Gate B: The Agitation & Mirror Test, Gate C: The 4-Pillar Growth Engine (Mechanism of Action), Gate D: Funnel Friction & Momentum Equation, POLISH Luxury Beauty Copywriting & Funnel Architecture (+2 more)

### Community 57 - "POLISH Media Co. — Official Social Media Profile Picture Suite (2026 Specifications)"
Cohesion: 0.40
Nodes (4): 1. Platform-Specific Master Suite (`01_platform_specific/`), 2. Style Editions & Master Assets (`02_style_editions/`), 3. Engineering & Safe Zone Specifications, POLISH Media Co. — Official Social Media Profile Picture Suite (2026 Specifications)

### Community 60 - "supabase-config.js"
Cohesion: 0.26
Nodes (12): _formatUser(), getAuthHeaders(), getBoard(), getIdToken(), init(), listBoards(), loginOffline(), loginWithGoogle() (+4 more)

### Community 61 - "calendlySync.js"
Cohesion: 0.23
Nodes (13): checkNewCalendlyMeetings(), fs, initNotifiedCache(), notifiedEventUris, { notifyNewMeeting }, path, startCalendlyPoller(), escapeTg() (+5 more)

### Community 62 - "capture-live-views.js"
Cohesion: 0.29
Nodes (5): AUDIT_VIEWPORTS, fs, LANGUAGES, path, puppeteer

### Community 64 - "auth.js"
Cohesion: 0.31
Nodes (8): crypto, getAdminEmails(), requireAdminAuth(), requireUserOrAdminAuth(), { supabase, isConfigured }, tokenCache, verifySupabaseToken(), isConfigured

### Community 65 - "seed-supabase.js"
Cohesion: 0.33
Nodes (4): @supabase/supabase-js, { createClient }, fs, path

### Community 68 - "luxury-scroll.js"
Cohesion: 0.36
Nodes (13): applyFluidViscosity(), cacheScrollElements(), initHeroIntersectionObserver(), initLuxuryScroll(), initStickyDockObservers(), isMobileGuard(), isReducedMotion(), measureScrollMetrics() (+5 more)

### Community 69 - "particle-canvas.js"
Cohesion: 0.48
Nodes (5): animateParticles(), getScrollVelocity(), initParticleCanvas(), isGuardActive(), resume()

### Community 70 - "studio-events.js"
Cohesion: 0.38
Nodes (3): off(), on(), once()

### Community 71 - "initLuxuryOpeningAnimation"
Cohesion: 0.60
Nodes (5): initLuxuryOpeningAnimation(), doFlipExit(), skipIntro(), isReducedMotion(), revealHeroTitle()

### Community 72 - "spotlight-cards.js"
Cohesion: 0.67
Nodes (5): initAll(), initCardReveal(), initMagneticButtons(), initSpotlightCards(), isGuardActive()

### Community 73 - "kinetic-typography.js"
Cohesion: 1.00
Nodes (3): initKineticTypography(), isReducedMotion(), revealKineticTitle()

### Community 75 - "invoice.js"
Cohesion: 0.15
Nodes (41): addServiceItem(), attachInlineEditListeners(), checkAdminAuth(), cleanContactName(), closeArchiveDrawer(), computeTotals(), downloadCurrentInvoicePDF(), escapeHTML() (+33 more)

### Community 76 - "POLISH Media Co. — Luxury Invoicing Suite Standards (v2.2)"
Cohesion: 0.29
Nodes (6): 1. Overview & Rebranding Evolution, 2. Standard Client & Payment Profile (Verified Defaults), 3. How to Use the Invoicing Studio (`/invoice`), A. Agency Credentials, B. Settlement & Banking Rails, POLISH Media Co. — Luxury Invoicing Suite Standards (v2.2)

### Community 82 - "Zero-Fluff & Anti-Filler Rule"
Cohesion: 0.33
Nodes (5): 1. Core Mandate, 2. Strictly Banned Vocabulary & Tropes, 3. UI Copy Standard, 4. Output Structure, Zero-Fluff & Anti-Filler Rule

## Knowledge Gaps
- **317 isolated node(s):** `puppeteer`, `path`, `fs`, `AUDIT_VIEWPORTS`, `LANGUAGES` (+312 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 392 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `puppeteer` connect `puppeteer` to `test_presentation_page.js`, `capture_presentation_views.js`, `generate-social-avatars.js`, `package.json`, `test-miro-suite.js`, `test-liquid-browser.js`, `test_mobile_phone_app.js`, `test-scroll-views.js`, `test_auth_flow.js`, `test_logo_render.js`, `test_sequencer_e2e.js`, `capture-live-views.js`?**
  _High betweenness centrality (0.022) - this node is a cross-community bridge._
- **Why does `express` connect `boards.js` to `package.json`, `index.js`, `supabase.js`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Why does `@supabase/supabase-js` connect `seed-supabase.js` to `package.json`, `supabase.js`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `puppeteer`, `path`, `fs` to the rest of the system?**
  _317 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `studio-core.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09552017771195853 - nodes in this community are weakly interconnected._
- **Should `elements-factory.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11931818181818182 - nodes in this community are weakly interconnected._
- **Should `studio-ai.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14532019704433496 - nodes in this community are weakly interconnected._