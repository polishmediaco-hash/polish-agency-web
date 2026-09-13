# Graph Report - polishmedia  (2026-09-13)

## Corpus Check
- 86 files · ~633,851 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1003 nodes · 1662 edges · 73 communities (66 shown, 5 thin omitted)
- Extraction: 97% EXTRACTED · 3% INFERRED · 0% AMBIGUOUS · INFERRED: 44 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f97396cf`
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
- dependencies
- drawing-engine.js
- presentation.js
- api.js
- app.js
- minimap.js
- whatsapp.js
- vercel.json
- 4. Prioritized Refactoring Recommendations
- 6. Next Priority Roadmap (Ready for Next Conversation)
- OWASP Top 10 — Audit Checklist
- 3. The 8-Zone Strategic Architecture
- POLISH Media Co. — Official Brand Guidelines & Standards Book (v2.0)
- POLISH Media Co. — Official Brand Guidelines & Standards Book (v2.0)
- 1. The Direct-Response Beauty Audit Heuristic
- 🔍 Core Audit Dimensions
- POLISH Luxury Beauty & Architectural UI Design Skill
- POLISH Media Co. — Typography Hierarchy & Specifications
- POLISH Media Agency — Web & Lead Engine (`polishmediaco.com`)
- Core Pillars of High-Converting Luxury Copy & Funnels
- 🛠️ Automated Execution Workflow
- Database Security
- Deployment Security
- Award-Winning Luxury Cards: Architectural & Design Guide
- Luxury Design Critic Rubric (Awwwards & Haute Parfumerie Standards)
- Luxury Web UI Master Skill
- Authentication & Authorization
- Data Access & Input Validation
- Rate Limiting & Abuse Prevention
- POLISH Media Co — Agent Guidelines & Context
- Clean Code & Production Performance Optimization Skill
- AI / LLM Integration Security
- Secrets & Environment Variables
- Luxury Beauty Direct-Response Copywriting Framework
- vibe-security/SKILL.md
- POLISH Media Co. — Official Social Media Profile Picture Suite (2026 Specifications)
- rules/graphify.md
- workflows/graphify.md
- supabase-config.js
- calendlySync.js
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

## God Nodes (most connected - your core abstractions)
1. `triggerAutoSave()` - 45 edges
2. `pushHistory()` - 36 edges
3. `renderElement()` - 32 edges
4. `pushHistory()` - 19 edges
5. `selectElement()` - 19 edges
6. `getCanvasCenter()` - 16 edges
7. `bindKeyboardShortcuts()` - 16 edges
8. `setupToolbar()` - 15 edges
9. `updatePosition()` - 15 edges
10. `renderControls()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `checkNewCalendlyMeetings()` --calls--> `notifyNewMeeting()`  [EXTRACTED]
  server/services/calendlySync.js → server/services/notification.js

## Import Cycles
- None detected.

## Communities (73 total, 5 thin omitted)

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
Cohesion: 0.06
Nodes (33): AUDIT_VIEWPORTS, fs, LANGUAGES, path, puppeteer, puppeteer, ASSET_SPECS, AVATAR_DIR (+25 more)

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
Cohesion: 0.36
Nodes (11): clampAndApplyPos(), handlePointerDown(), onPointerMove(), onPointerUp(), init(), start(), stop(), toggle() (+3 more)

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
Nodes (37): buildPresentationSequence(), clearSpotlight(), closeSequencer(), escapeHtml(), focusOnElement(), getSlideTitle(), goToStep(), initLaser() (+29 more)

### Community 23 - "api.js"
Cohesion: 0.10
Nodes (16): express, fs, getDefaultContent(), { leadsService, cmsService, keepAliveService, invoicesService }, { notifyNewLead, notifyNewMeeting, sendWhatsAppMessage }, path, readContent(), { requireAdminAuth } (+8 more)

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

### Community 30 - "4. Prioritized Refactoring Recommendations"
Cohesion: 0.08
Nodes (23): 1.1 `public/studio/js/studio-core.js`, 1.2 `public/js/luxury-effects.js`, 1.3 `public/js/three.min.js` & `public/studio/js/html2canvas.min.js`, 1. God Nodes Analysis, 2.1 Cohesion Scores (< 0.10), 2.2 Cross-Module Coupling Topology, 2. Modularity & Community Cohesion, 3.1 Unreferenced Symbols & Leaky Interfaces (+15 more)

### Community 31 - "6. Next Priority Roadmap (Ready for Next Conversation)"
Cohesion: 0.06
Nodes (33): 1. Executive Summary & Brand Shift, 2. Core Pages & Component Architecture, 3. Backend Architecture (`server/index.js`), 4. Git & Repository Status, 5. Major Milestones & Integrations (September 2026 Session), 6. Next Priority Roadmap (Ready for Next Conversation), 7. How to Start a Fresh Antigravity Chat, A. Agent Reach & Internet Capabilities (`agent-reach`) (+25 more)

### Community 32 - "OWASP Top 10 — Audit Checklist"
Cohesion: 0.11
Nodes (18): A01: Broken Access Control (Most Critical), A02: Cryptographic Failures, A03: Injection, A04: Insecure Design, A05: Security Misconfiguration, A06: Vulnerable & Outdated Components, A07: Identification & Authentication Failures, A08: Software & Data Integrity Failures (+10 more)

### Community 33 - "3. The 8-Zone Strategic Architecture"
Cohesion: 0.11
Nodes (17): 1. Executive Context & Opportunity Blueprint, 2. Asset & Technical Repository Map, 3. The 8-Zone Strategic Architecture, 4. How to Continue in the `polishmedia` Project, POLISH MEDIA CO. — CLIENT HANDOFF & STRATEGY SPECIFICATION, Presenting Live to Eman, Private Advisory Architecture: Eman Al Katheeri (@eman.alkatheeri), Running the Whiteboard Locally in `polish-agency-web` (+9 more)

### Community 34 - "POLISH Media Co. — Official Brand Guidelines & Standards Book (v2.0)"
Cohesion: 0.12
Nodes (16): 1. Brand Essence & Strategic Positioning, 2. Logo System & Architecture, 3. Color Hierarchy & Specifications, 4. Typography Rules & Hierarchy, 5. Trilingual Code of Excellence, 6. Asset Directory Inventory, Arabic (Gulf Prestige & Private Office Voice), Brand Archetype: The Elite Cosmetic Architect (+8 more)

### Community 35 - "POLISH Media Co. — Official Brand Guidelines & Standards Book (v2.0)"
Cohesion: 0.12
Nodes (16): 1. Brand Essence & Strategic Positioning, 2. Logo System & Architecture, 3. Color Hierarchy & Specifications, 4. Typography Rules & Hierarchy, 5. Trilingual Code of Excellence, 6. Asset Directory Inventory, Arabic (Gulf Prestige & Private Office Voice), Brand Archetype: The Elite Cosmetic Architect (+8 more)

### Community 36 - "1. The Direct-Response Beauty Audit Heuristic"
Cohesion: 0.20
Nodes (9): 1. The Direct-Response Beauty Audit Heuristic, 2. Copy Review Matrix & Redlines, 3. Execution Protocol, Bilingual Copywriting & Funnel Building Critic (EN / FR), Gate A: The 3-Second Founder Value Test, Gate B: The Agitation & Diagnosis Gate (The "Mirror" Test), Gate C: The Proprietary Growth Engine (Mechanism of Action), Gate D: The Funnel Friction & Momentum Equation (+1 more)

### Community 37 - "🔍 Core Audit Dimensions"
Cohesion: 0.20
Nodes (9): 1. Spatial Rhythm, Layout & Proportions, 2. Typography & Text Hierarchy, 3. Color, Lighting & Glassmorphism, 4. Background 3D Cosmetic Ecosystem, 5. Header & Navigation Architecture, 6. Interactive Forms & Conversion Flows, 🔍 Core Audit Dimensions, 🎯 Purpose (+1 more)

### Community 38 - "POLISH Luxury Beauty & Architectural UI Design Skill"
Cohesion: 0.22
Nodes (8): 1. Core Directives & Non-Negotiable Guardrails, 🔒 1. Preserve Code Architecture & State, 2. Multi-Language & RTL Standards (EN / FR / AR), 🎨 2. The Luxury Glassmorphic Design System, 3. Editorial Typography & Visual Hierarchy, 4. Fluid Multi-View Viewport Standards, 5. Execution Workflow for Optimization Tasks, POLISH Luxury Beauty & Architectural UI Design Skill

### Community 39 - "POLISH Media Co. — Typography Hierarchy & Specifications"
Cohesion: 0.22
Nodes (8): 1. Font Families, 2. Typographic Scale & Cadence, 3. Tabular Numerals Requirement, 4. Google Fonts Embed Code, Arabic Script Harmony: **Tajawal**, Editorial Luxury Serif Accent: **Cormorant Garamond**, POLISH Media Co. — Typography Hierarchy & Specifications, Primary Structural Sans-Serif: **Plus Jakarta Sans**

### Community 40 - "POLISH Media Agency — Web & Lead Engine (`polishmediaco.com`)"
Cohesion: 0.22
Nodes (8): 1. Install & Run Locally, 🌐 Deploying to `polishmediaco.com`, ⚡ Key Capabilities & Architecture, Option A: Railway / Render / DigitalOcean (Recommended), Option B: VPS (Ubuntu with PM2 & NGINX), POLISH Media Agency — Web & Lead Engine (`polishmediaco.com`), 🚀 Quickstart, 💬 WhatsApp Customization

### Community 41 - "Core Pillars of High-Converting Luxury Copy & Funnels"
Cohesion: 0.25
Nodes (7): 1. The Ruthless Fluff Elimination Test, 2. Cognitive Load & Scanning Architecture, 3. Funnel Flow & Friction Reduction, 4. Bilingual Precision (EN & FR), Audit Checklist, Copywriting & Funnel Building Critic Skill, Core Pillars of High-Converting Luxury Copy & Funnels

### Community 42 - "🛠️ Automated Execution Workflow"
Cohesion: 0.25
Nodes (7): 🛠️ Automated Execution Workflow, 📋 Critique Output Format, Live Visual Design Critic & Multi-Viewport Audit Skill, 🎯 Purpose, Step 1: Run the Visual Capture Engine, Step 2: Inspect Generated Visual Evidence, Step 3: Conduct Structured Visual Design Critique

### Community 43 - "Database Security"
Cohesion: 0.25
Nodes (7): Atomic Write Pattern (Immediate Fix), Database Security, File-Based JSON Storage (POLISH Media Current State), Firebase Security Rules, Known Risks, Migration Recommendation, Sensitive Data in Boards

### Community 44 - "Deployment Security"
Cohesion: 0.25
Nodes (7): CORS Configuration, Deployment Security, Environment Separation (Vercel), HTTPS Enforcement, Production Configuration, Security Headers, Sensitive Files Exposed to Public

### Community 45 - "Award-Winning Luxury Cards: Architectural & Design Guide"
Cohesion: 0.29
Nodes (6): 1. The 5 Pillars of Award-Winning Cards, 2. Technical Implementation Architecture, 3. Mobile Phone-Native Rules, A. CSS Custom Property Setup, Award-Winning Luxury Cards: Architectural & Design Guide, B. Ultra-Performant Spotlight Mouse Tracking (RAF Throttle)

### Community 46 - "Luxury Design Critic Rubric (Awwwards & Haute Parfumerie Standards)"
Cohesion: 0.29
Nodes (6): 1. Spatial Rhythm & Monolith Presence (Weight: 20%), 2. Haute Luxury Typography (Weight: 25%), 3. Glassmorphism & Caustic Depth (Weight: 20%), 4. Conversion Architecture & Ergonomics (Weight: 20%), 5. Multilingual Polish (Weight: 15%), Luxury Design Critic Rubric (Awwwards & Haute Parfumerie Standards)

### Community 47 - "Luxury Web UI Master Skill"
Cohesion: 0.29
Nodes (6): 1.1 Smoked Obsidian Canvas & Specular Bevels, 1. Core Visual Principles, 2.1 Physics & Movement Guidelines, 2. 3D Liquid Chrome & Caustic Background Engine, 3. High-Ticket B2B Ergonomics, Luxury Web UI Master Skill

### Community 48 - "Authentication & Authorization"
Cohesion: 0.29
Nodes (6): Admin Routes Without Server-Side Auth, Authentication & Authorization, Firebase Authentication Server-Side Verification, JWT Handling, Middleware Is Not Enough (Express), Static Admin Keys

### Community 49 - "Data Access & Input Validation"
Cohesion: 0.29
Nodes (6): Data Access & Input Validation, File Upload Security, Input Validation for Express APIs, JSON File Storage Race Conditions (POLISH Media Specific), SQL Injection (If Using Raw Queries), XSS Prevention

### Community 50 - "Rate Limiting & Abuse Prevention"
Cohesion: 0.29
Nodes (6): Combine Per-IP and Per-User Limiting, Current Issues in POLISH Media Stack, Don't Trust Client-Submitted Counters, Express Rate Limiting with express-rate-limit, Rate Limiting & Abuse Prevention, Where Rate Limiting Is Required

### Community 51 - "POLISH Media Co — Agent Guidelines & Context"
Cohesion: 0.33
Nodes (5): Key Files, POLISH Media Co — Agent Guidelines & Context, Project Overview, Tech Stack & Architecture, Workflow Rules for Agents

### Community 52 - "Clean Code & Production Performance Optimization Skill"
Cohesion: 0.33
Nodes (5): 1. Static Code Cleanup Protocol, 2. Runtime & Rendering Performance Optimization, 3. Automated Performance Verification Checklist, 4. Production Deployment Verification, Clean Code & Production Performance Optimization Skill

### Community 53 - "AI / LLM Integration Security"
Cohesion: 0.33
Nodes (5): AI / LLM Integration Security, API Keys Are Server-Side Only, Prompt Injection, Spending Caps, Third-Party API Credential Security (POLISH Media Specific)

### Community 54 - "Secrets & Environment Variables"
Cohesion: 0.33
Nodes (5): API Key Exposure via Endpoints, Client-Side Environment Variable Prefixes, .env File Hygiene, Hardcoded Credentials, Secrets & Environment Variables

### Community 55 - "Luxury Beauty Direct-Response Copywriting Framework"
Cohesion: 0.40
Nodes (4): 🎯 Core Philosophy: Humanized Authority over AI Slop, Luxury Beauty Direct-Response Copywriting Framework, 💎 The 4 Tenets of POLISH Voice & Tone, 🚫 The Banned "AI Slop" Vocabulary & Patterns:

### Community 56 - "vibe-security/SKILL.md"
Cohesion: 0.40
Nodes (4): Audit Process, For the POLISH Media Co Stack (Node.js + Express + Firebase), Output Format, The Core Principle

### Community 57 - "POLISH Media Co. — Official Social Media Profile Picture Suite (2026 Specifications)"
Cohesion: 0.40
Nodes (4): 1. Platform-Specific Master Suite (`01_platform_specific/`), 2. Style Editions & Master Assets (`02_style_editions/`), 3. Engineering & Safe Zone Specifications, POLISH Media Co. — Official Social Media Profile Picture Suite (2026 Specifications)

### Community 60 - "supabase-config.js"
Cohesion: 0.26
Nodes (12): _formatUser(), getAuthHeaders(), getBoard(), getIdToken(), init(), listBoards(), loginOffline(), loginWithGoogle() (+4 more)

### Community 61 - "calendlySync.js"
Cohesion: 0.26
Nodes (11): checkNewCalendlyMeetings(), fs, initNotifiedCache(), notifiedEventUris, { notifyNewMeeting }, path, startCalendlyPoller(), escapeTg() (+3 more)

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
Cohesion: 0.19
Nodes (33): addServiceItem(), attachInlineEditListeners(), checkAdminAuth(), closeArchiveDrawer(), computeTotals(), escapeHTML(), filterArchiveList(), formatAmount() (+25 more)

### Community 76 - "POLISH Media Co. — Luxury Invoicing Suite Standards (v2.2)"
Cohesion: 0.29
Nodes (6): 1. Overview & Rebranding Evolution, 2. Standard Client & Payment Profile (Verified Defaults), 3. How to Use the Invoicing Studio (`/invoice`), A. Agency Credentials, B. Settlement & Banking Rails, POLISH Media Co. — Luxury Invoicing Suite Standards (v2.2)

## Knowledge Gaps
- **343 isolated node(s):** `puppeteer`, `path`, `fs`, `AUDIT_VIEWPORTS`, `LANGUAGES` (+338 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 419 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `puppeteer` connect `generate-social-avatars.js` to `package.json`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `express` connect `boards.js` to `package.json`, `index.js`, `api.js`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **Why does `@supabase/supabase-js` connect `seed-supabase.js` to `package.json`, `api.js`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `puppeteer`, `path`, `fs` to the rest of the system?**
  _343 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `studio-core.js` be split into smaller, more focused modules?**
  _Cohesion score 0.09552017771195853 - nodes in this community are weakly interconnected._
- **Should `elements-factory.js` be split into smaller, more focused modules?**
  _Cohesion score 0.11931818181818182 - nodes in this community are weakly interconnected._
- **Should `studio-ai.js` be split into smaller, more focused modules?**
  _Cohesion score 0.14532019704433496 - nodes in this community are weakly interconnected._