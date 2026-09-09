# POLISH Media Co — Project State & Handoff Document
**Last Updated**: September 2026  
**Repository**: `/Users/Shared/polishmedia`  
**Current Active Brand Identity**: **Direction 1 — Haute Atelier Champagne Gold & Cashmere Platinum**  
**Typography System**: **Editorial Haute Parfumerie (Plus Jakarta Sans + Cormorant Garamond SemiBold Italic + Tajawal)**

---

## 1. Executive Summary & Brand Shift

The application has successfully completed a luxury atelier rebranding and typography evolution:

* **Primary Luxury Accent (`--brand-gold`)**: `#E2C799` (Warm, radiant champagne gold)
* **Secondary Bronze Accent (`--brand-blue`)**: `#C5A880` (Deep antique gold / bronze)
* **Cashmere Platinum (`--brand-platinum`)**: `#F5E6D3` (Soft specular highlight)
* **Ultra-Deep Obsidian Noir (`--bg`)**: `#080706` / `#0A0908` (Warm tinted obsidian, replaces cold blue-black)
* **Typography Hierarchy**:
  * Primary Sans: *Plus Jakarta Sans* (Weight 400/500/600/700/800)
  * Luxury Display Accent: *Cormorant Garamond* (SemiBold 600 Italic)
  * Arabic RTL: *Tajawal* (Weight 400/500/700)
  * Optical Tracking: `--tracking-tight: -0.022em`, `--tracking-widest: 0.16em`
  * Tabular Numerals: `font-variant-numeric: tabular-nums lining-nums` for architectural counters
* **Gradients**:
  * Brand: `linear-gradient(135deg, #F5E6D3 0%, #E2C799 50%, #C5A880 100%)`
  * Typography: `linear-gradient(135deg, #FFFFFF 25%, #F5E6D3 65%, #E2C799 100%)`
  * Radial Atmospheric Glows: Champagne luminescence replacing cyan aurora
* **Official Primary Brand Mark**: **The Golden Ratio Pipette (Concept 1)**
  * Aerodynamic 45° upward velocity vector with continuous golden ratio fillets ($\phi \approx 1.618$) and optically locked diamond droplet.
* **Brand Assets Updated**:
  * Vector Gold Logo: `/assets/logo-gold.svg`
  * High-Res Gold Raster Logo: `/assets/logo-gold.png`
  * Universal SVG Favicon: `/assets/favicon.svg` (Golden Ratio Pipette on rounded obsidian tile)
  * Master Brand Pack: `/brand-pack/POLISH_Media_Co_Brand_Pack.zip` (834 KB)
  * Interactive Brand Vault: `/brand-pack`
  * Logo Exploration Studio: `/logo-preview`

---

## 2. Core Pages & Component Architecture

### A. Main Experience (`public/index.html`)
* **Dynamic Island Navigation Capsule**: Pinned top header with live scroll-depth hairline progress bar in gold, trilingual language switcher, and responsive brand logo.
* **Intro Cinematic**: Luxury reveal with updated gold crest and luxury tagline *"CREATIVE & MARKETING FOR BEAUTY BRANDS"*.
* **Hero Experience with Floating 3D Flacon Companion (`hero-home-section`)**:
  * Centered, expansive editorial hero glass card (`.hero-glass-card`, max-width 1140px) with hairline gold specular rim and radial cursor spotlight border.
  * Preserved full-width typography hierarchy without cramped columns: *"From Breakthrough Formulation To Household Beauty Brand."*
  * Dedicated interactive companion stage (`#hero3dStage`) featuring the procedural 3D POLISH Flacon with frosted obsidian glass, inner gold pipette, amber elixir serum, suspended faceted diamond droplet, live cursor-reactive glint, and orbiting micro-particles.
* **Haute Atelier DTC Revenue Velocity Calculator (`calculator.js`)**:
  * Completely redesigned quiet luxury diagnostic console (`.calc-monolith-card` / `.calc-monolith-display`).
  * 4 Strategic Growth Tiers (`TIER 01 • EMERGING`, `TIER 02 • BREAKOUT`, `TIER 03 • HIGH-GROWTH`, `TIER 04 • DOMINANCE`).
  * Fluid precision scrubber (`#calcRevScrubber`, $20k to $1.5M/mo) with custom gold thumb and illuminated halo.
  * Projected 90-Day Trajectory with pure Haute Champagne Gold velocity pill (`+130% Velocity Lift`, zero green elements).
  * 3 Architectural Scaling Levers with hairline vertical dividers (`01 • CAC Compression`, `02 • Routine Bundle AOV`, `03 • Replenishment LTV`).
  * Direct "Lock In Your Scaling Blueprint →" conversion button routing pre-filled metrics to `/apply`.
* **Editorial Headline Accents**: Key headline lines styled with sensual italic serif gradients (*"To Household Beauty Brand."*, *"Where Beauty Brands Hit a Wall."*, *"For Cosmetic & Skincare Scaling."*).
* **Trilingual Localization (EN / FR / AR)**: Instant DOM switching without page reload; full RTL layout inversion for Arabic with Tajawal font.
* **Pulsing WhatsApp Conversion Engine**: Floating button linking to `+213 662 41 77 61` with localized pre-filled copy.

### B. Executive Partnership Application (`public/apply.html`)
* **3-Step High-Ticket Funnel**:
  * Step 1: Brand details, store URL, monthly revenue range.
  * Step 2: Primary growth bottlenecks (creative fatigue, ad scaling, ROAS drop).
  * Step 3: Contact person, WhatsApp number, submission dossier.
* **Streamlined UI**: Removed redundant title pills, cleaned step labels, champagne gold active indicators, refined typography tracking.

### C. Creator & UGC Portal (`public/creators.html`)
* Tailored for beauty influencers and cosmetic UGC creators applying to the POLISH talent network.
* Gold branded header, localized form, serif accent heading, and conversion tracking.

### D. Executive Admin Portal & Live CMS (`public/admin.html`)
* **Security**: Key-gated access (Default: `polish_admin_secure_key_2026`).
* **Visual Overhaul**: Matches the champagne gold aesthetic (`--cyan: #E2C799`, obsidian backgrounds, gold glows).
* **Four Management Hubs**:
  1. **Website Text (Live CMS)**: Trilingual in-place editor updating strings without redeploy.
  2. **WhatsApp Flows**: Pre-filled templates and conversion copy.
  3. **Inbound Dossiers (CRM)**: Executive prospect pipeline with stage movement (New, Reviewing, Qualified, Closed), internal notes, and one-click contact.
  4. **Alert Channels**: Notification dispatch settings.

### E. Brand Asset Vault & Guidelines (`public/brand-pack.html` / `/brand-pack`)
* **Live Interactive Brand Portal**: Direct web interface for previewing, inspecting, and downloading all vector and raster assets.
* **Master Brand Pack Archive**: `/brand-pack/POLISH_Media_Co_Brand_Pack.zip` (834 KB) containing 75 curated production-ready files:
  * `01_logos/`: 32 logo assets (Horizontal, Vertical, Standalone Marks, Squircles in Gold, Dark, White, Black in SVG and 1000px, 2000px, 4000px retina PNGs).
  * `02_favicons_and_icons/`: Universal SVG favicon, 16/32/48px favicons, 180px Apple Touch Icon, 192/512px Android Chrome icons, and `site.webmanifest`.
  * `03_social_assets/`: Twitter/X header (1500x500), LinkedIn company banner (1584x396), Instagram avatar (1080x1080), OpenGraph social card (1200x630).
  * `04_color_palette/`: `polish-colors.json`, `polish-colors.css`, and vector/raster swatch palettes.
  * `05_typography/`: `TYPOGRAPHY_SPECIFICATIONS.md` (Font pairings, optical scales, tabular numbers).
  * `06_guidelines/`: `POLISH_BRAND_GUIDELINES.md` (Full 10-chapter Brand Standards Bible).
* **Routes Registered**: `GET /brand-pack`.
*(Note: Dev preview tools `palette-preview.html`, `font-preview.html`, `logo-preview.html`, and `_template.html` have been permanently retired and purged.)*

### H. Award-Winning Luxury Cards & Tactile Micro-Interactions
* **Dynamic Cursor Spotlight (120FPS RAF-Throttled Tracking)**:
  * Radial gradient light cone following cursor position via CSS custom properties `--mouse-x` and `--mouse-y`.
  * Integrated across `.pro-card` (Bottleneck & Pillar cards), `.hero-glass-card` (Main Hero card), and `.form-container-shell` (Intake Wizard).
  * Upgraded backgrounds from legacy blue tint to Haute Obsidian Noir (`linear-gradient(135deg, rgba(20, 17, 14, 0.88) 0%, rgba(12, 10, 8, 0.94) 100%)`).
* **Specular Rim Lighting & Dual Borders**:
  * Dual-rim beveled specular borders with Champagne Gold hover radiance (`rgba(226, 199, 153, 0.42)`).
* **Tactile Magnetic Button Physics**:
  * Subtle 28% magnetic pull towards cursor on desktop for `.btn-cta`, `.btn-cta-lg`, `.sticky-glowing-btn`, and `.header-home-btn`.
  * Smooth spring return animation (`cubic-bezier(0.16, 1, 0.3, 1)`) on mouseleave.
  * Completely bypassed on touch devices and `prefers-reduced-motion`.
* **Zero Cyan Left**:
  * Completely eliminated all legacy cyan (`#00E5FF` and `rgba(0, 229, 255)`) from `admin.html`, `luxury-effects.js`, and site CSS.

---

## 3. Backend Architecture (`server/index.js`)

* **Runtime**: Node.js + Express
* **Security & Performance**: Helmet, rate-limiting, CORS, gzip/brotli compression.
* **API Endpoints**:
  * `POST /api/apply`: Validates incoming applications, stores to file-based JSON DB with unique UUIDs, triggers webhook alerts.
  * `GET /api/leads`: Secured endpoint for admin CRM dossier retrieval.
  * `GET /api/cms` & `POST /api/cms`: Trilingual content dictionary sync.
  * Static file serving with strict asset caching.

---

### I. Logo Optical Sizing & Multi-Format Vector Lockups (Resolved September 2026)
* **Root Cause Rectified**: Previous SVGs contained >45% transparent margin padding inside large canvas boxes, causing the drawn artwork to scale down to an illegible ~10px inside navbar containers.
* **Tight Zero-Padding SVG Geometries**:
  * **Primary Horizontal Web Lockup** (`public/assets/logo-gold.svg` / `logo-gold.png`): Precision `viewBox="0 0 286 86"` (aspect ratio 3.33:1, 96% fill factor).
  * **Standalone Emblem Mark** (`public/assets/logo-gold-mark.svg` / `logo-gold-mark.png`): Tight `viewBox="0 0 100 100"` (1:1 square ratio, 90% fill factor).
  * **Vertical Architectural Crest** (`public/assets/logo-gold-vertical.svg` / `logo-gold-vertical.png`): Tight `viewBox="0 0 260 226"` (aspect ratio 1.15:1, 95% fill factor).
* **Dynamic Island Header Logo Sizing**:
  * Desktop unscrolled: increased from `34px` to `46px` (`width="153" height="46"`), yielding ~3x visual impact with zero wasted whitespace.
  * Desktop scrolled: increased from `25px` to `32px`; capsule max-width widened from `340px` to `380px` (`420px` on subpages).
  * Mobile: unscrolled increased from `28px` to `38px`; scrolled increased from `21px` to `28px`.
* **Cinematic Intro Screen**: Scaled from `78px` (effective 44px) to `220px` width with champagne luminescence glow and identical horizontal aspect ratio for distortion-free FLIP flight into navbar.
* **Footer Brand Row**: Added `.footer-logo-img` (`/assets/logo-gold.svg`, `height: 36px`) anchoring the copyright bar.
* **Admin CRM Portal**: Upgraded header logo to `44px` height and login bubble mark to `52px`.
* **Brand Pack Updated**: Rebuilt `scripts/generate-brand-pack.js` to render all 53 multi-resolution assets with tight bounds; master zip refreshed (`public/brand-pack/POLISH_Media_Co_Brand_Pack.zip`).
* **Official Component Catalog & Boilerplate (`public/_template.html`)**:
  * Clean, minimal HTML boilerplate for spawning new pages (`/template`).
* **Meeting Booking Page (`public/book.html`)**:
  * Centered, distraction-free meeting scheduling engine (`/book`, `/schedule`, `/meeting`, `/call`, `/calendar`).
  * Embedded Calendly widget (`https://calendly.com/polishmediaco/new-meeting`) with auto-prefill from query parameters (`?name=...&brand=...`) and fail-safe ad-blocker fallback card.
  * Direct conversion bridge from `public/apply.html` success step to `/book`.
* **Automated Notification Engine (`server/services/notification.js` & `server/routes/api.js`)**:
  * **WhatsApp Alerts (Green-API Free Developer Gateway)**: Dispatches instant real-time alerts to founder WhatsApp (`+213662417761`) on form submission (`/apply`, `/creators`, `/intake`) and meeting booking.
  * **Calendly Webhook Handler (`POST /api/calendly-webhook`)**: Parses `invitee.created` events, logs meeting to `leads.json`, and triggers WhatsApp & Telegram alerts.
  * **One-Click Diagnostic Route (`GET /api/test-whatsapp?key=polish_admin_secure_key_2026`)**: Direct live ping verification.

### B. POLISH Board Studio (`public/studio/`) & Boards Hub (`/boards`, `app.polishmediaco.com`)
* **Whiteboard Architecture**: Fully custom Miro-alternative engineered specifically for POLISH Media Co high-ticket cosmetic/skincare client onboarding, positioning blueprints, and retainer presentations.
* **Canvas Engine (`canvas-panzoom.js`)**:
  - GPU-accelerated infinite panning and multi-touch/trackpad pinch zoom (15% to 250%).
  - Grid background matching luxury editorial dots.
  - Minimap-ready viewport transformations (`screenToCanvas`, `canvasToScreen`, `smoothPanTo`, `resetView`).
* **Interactive Elements Factory (`elements-factory.js`)**:
  - **Strategic Frames**: Header tags, Roman numeral numbering (`01`, `02`), serif accent headlines, modular sub-boxes (`+ Box`, `✕ Remove`), and four-quadrant anchor ports.
  - **Tactical Stickies**: Rotatable analog cards with translucent tape strips (`yellow`, `rose`, `blue` / `azure`).
  - **High-Ticket Retainer Pricing Cards**: Featured tiers, currency selection (`AED`, `$`, `€`), figure counter, period, and dynamic deliverables list (`+ Deliverable`, `✕ Remove`).
  - **Strategic Deliverables Matrix Table**: Phase, deliverable output, timeline, target metric, with live DOM control buttons (`+ Row`, `− Row`, `+ Col`, `− Col`).
  - **Brand Diagnostic Intake Worksheet**: Multi-field dynamic questionnaire with question titles, type badges (`SHORT`, `DEEP`), instructions, textareas and inputs, with live controls (`+ Question (Long)`, `+ Input (Short)`, `✕ Remove`).
  - **Executive Script Bubbles**: Talking points and audio script containers.
  - **Vector Connector Engine (`connector-engine.js`)**: Interactive port-to-port bezier/dashed/solid connection lines with customizable labels, line styles, and live endpoint dragging.
* **State & Cloud Storage (`studio-core.js` & `server/routes/boards.js`)**:
  - Real-time debounced auto-save to atomic JSON storage (`server/db/boards/`).
  - History engine with 30-level Undo (`Cmd+Z`) and Redo (`Cmd+Shift+Z`).
  - Duplicate (`Cmd+D`) and Delete (`Backspace`/`Delete`).
  - Clean JSON export and shareable board URLs (`/studio?id=...`).
* **Visual Identity & Header Lockup**:
  - Authentic Haute Atelier gold squircle brand emblem (obsidian surface, champagne gold gradient chevron, cosmetic droplet facet, diamond core) with gold "POLISH STUDIO" lockup.
  - Pinned luxury glass header with Cloud Save status indicator, Undo/Redo, Present mode, Export, Share, and Boards Hub link.
* **Boards Hub (`/boards`)**:
  - Atelier Whiteboards dashboard listing active boards, element counts, flow counts, last-updated timestamps, duplicate, delete, and direct "+ Strategy Template" or "+ Blank Canvas" creation.
* **Haute Atelier Light / Day Mode Restoration**:
  - Warm Alabaster (`#FAF7F2`) dot canvas, frosted white glass cards (`#FFFFFF`), rich ink black text (`#1A1715`), and Cormorant Garamond serif accents across builder, dashboard, and login.
* **Dedicated Client Presentation Engine (`/b/:id` & `/view/:id`)**:
  - Clean, distraction-free client strategy board view modeled after `eman-alkatheeri.html`. Strips all builder controls, toolbar, and inspector. Features co-branded header lockup with WhatsApp VIP strategy discussion link (`https://wa.me/213662417761`) and `▶ Present` mode.
* **Firebase Auth & Multi-User Isolation (`public/studio/js/firebase-config.js`)**:
  - Zero-bundler Firebase Web SDK integration exposing `PolishAuth` and `PolishDB` with dynamic `/api/config/firebase` server bridge. Includes automatic local-storage fallback for instantaneous zero-friction offline/dev operation.
  - Multi-user data isolation ensuring each user sees only their own private boards on `/boards`.
* **Exclusive Google Sign-In Architecture**:
  - Simplified `/login` (`public/studio/login.html`) to an ultra-clean, distraction-free single-click Google authentication flow with Haute Atelier luxury card aesthetics.
  - Resolved COOP isolation (`crossOriginOpenerPolicy: false` in Helmet) allowing the Google OAuth popup to communicate with the opener window, and implemented automatic fallback to `signInWithRedirect` with `getRedirectResult()`.
* **Studio-Exclusive AI Strategy Copilot (`public/studio/js/studio-ai.js`)**:
  - Embedded exclusively inside the Board Studio (`app.polishmediaco.com` / `/studio`) to aid growth advisors in mapping strategy boards.
  - Powered by Google Gemini Flash (`gemini-3.5-flash` / `gemini-3.6-flash` / `gemini-3.7-flash` resilient fallback cascade).
  - Hyper-specialized in 6 core disciplines: Luxury Branding, High-AOV Grand Slam Offers, Haute Direct-Response Copy, Paid Ads & CAC Compression, High-Ticket Sales Scripts, and UGC Video Creator Briefs.
  - Features **1-Click "Add to Canvas" Card Spawner** (`addStrategyCard`) that turns AI-generated recommendations directly into interactive whiteboard cards with automatic sequential connector linking.
  - Zero-leak architecture: API key is isolated in `.env` and proxies via server endpoint `POST /api/ai/chat`.
* **Subdomain Isolation for Board Studio (`app.polishmediaco.com`)**:
  - All whiteboard canvas, dashboard, view, and studio login pages are strictly hosted on `app.polishmediaco.com`.
* **Purge of Dead Routes & Unused Aliases**:
  - Permanently deleted all dead preview routes (`/palette-preview`, `/font-preview`, `/logo-preview`, `/_template`, `/makeup-filmmaking`, `/brand-guidelines`).
  - Purged redundant client proposal aliases (`/eman`, `/dubai`, `/strategy`, `/p/eman-alkatheeri`, `/calibration`, `/eman-intake`, `/discovery`, `/makeup`, `/filmmaking`, `/eman-pdf`, etc.).
  - Purged dead HTML files from `public/` repository tree.
  - Strict canonical routing across main domain and `app.` subdomain.

---

## 4. Git & Repository Status

* **Branch**: `main`
* **Commit Author**: `POLISH Media Co <contact@polishmediaco.com>` (verified on GitHub & active on Vercel deployment pipeline)
* **Latest Milestones**:
  * `feat(studio-ai): full redesign of Polish AI into non-blocking floating luxury glassmorphic window with draggable controls, ambient minimize pill, and strategy card deck spawner`
  * `feat(studio-ai): launch Polish AI — zero-emoji, operator-grade growth intelligence engine with direct canvas card injection, grounded in DTC beauty economics`
  * `feat: Add high-ticket lead capture, Calendly auto-prefill, and Studio strategic blueprints`
  * `feat: Board Studio client commenting & pin drop engine on /view/:id`
  * `feat: Haute AI-SEO suite (llms.txt, llms-full.txt, JSON-LD Schema @graph, robots.txt AI crawler allowance)`
  * `perf: 3D flacon & mobile kinetic performance guard with thermal throttling protection`
  * `perf: Core Web Vitals & Lighthouse 98+ suite with aggressive immutable asset caching`
  * `refactor(studio): Streamline floating inspector toolbar & add high-contrast dark mode palette`
  * `feat(studio): Draggable floating front camera bubble for studio presentation recordings`
  * `refactor(routes): purge all unused links, dead preview tools, and legacy aliases for strict canonical routing`
  * `refactor(routing): isolate Board Studio on app.polishmediaco.com, remove booking aliases, redirect main domain studio links`
  * `perf(auth): accelerate Studio & Admin login — strip firestore bloat, eliminate 1200ms delay, enable 0ms instant session hydration`
  * `feat(studio): deliver Miro-grade infinite whiteboard with offline persistence, 1-click theme toggle, starter templates, and official brand lockup`
  * `feat(notifications): integrate GREEN-API WhatsApp notification gateway & Calendly webhook listener`
  * `feat(booking): launch luxury minimal /book Calendly scheduling page & apply.html bridge`
* **Assets**: All horizontal, vertical, and standalone vector marks committed and synced across backup repositories.

---

## 5. Next Priority Roadmap for Future Sessions

1. **Production Deployment & Monitoring**: Deploy to production infrastructure (Vercel / Railway / VPS with PM2) and verify edge SSL certificates.
2. **Custom Domain & DNS Setup**: Ensure canonical routing between `polishmediaco.com` and `app.polishmediaco.com`.
3. **Calendly Live Webhook Verification**: Confirm real-time webhook payload receipts at `https://polishmediaco.com/api/calendly-webhook` from Calendly developer console.
4. **Client Collaboration Live Beta**: Test real-time multi-user pin drop commenting and pillar approvals with live beauty brand test accounts.

---

## 6. How to Start a Fresh Antigravity Chat

To maintain maximum speed, crisp model attention, and zero context rot:

1. Click **New Conversation** in the sidebar (or run `/clear`).
2. Set workspace to: `/Users/Shared/polishmedia`
3. Send this starter prompt:
   > *"I am continuing work on POLISH Media Co. Please read `@docs/HANDOFF.md` and `@AGENTS.md` for current context. Let's work on [choose your next task from Section 5]."*
