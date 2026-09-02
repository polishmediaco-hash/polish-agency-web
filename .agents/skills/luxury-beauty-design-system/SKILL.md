---
name: luxury-beauty-design-system
description: >-
  Autonomous Architectural & UI Design Skill for POLISH Media Co web application.
  Specializes in high-converting luxury beauty/cosmetics agency aesthetics, editorial elegance,
  fintech glassmorphism, fluid multi-view adaptation, and trilingual RTL engineering.
---

# POLISH Luxury Beauty & Architectural UI Design Skill

The **POLISH Media Co.** design system represents an ultra-premium beauty accelerator—where high-fashion editorial elegance (Rhode, Chanel Beauté, Byredo, Apple Pro) meets aggressive, high-converting direct-response architecture.

---

## 1. Core Directives & Non-Negotiable Guardrails

### 🔒 1. Preserve Code Architecture & State
* **Zero Functional Regressions**: Never remove or alter existing functional state management, routing, language toggle bindings (`polishI18n`), or form submission logic (Telegram Bot API, WhatsApp Fast-Track triggers, multi-step wizards).
* **Surgical Refactoring**: Strictly avoid destructive full-file rewrites when localized refactoring is sufficient. Preserve all HTML `data-i18n`, `data-cms`, `id`, and form name attributes.

### 🎨 2. The Luxury Glassmorphic Design System
* **Color Palette**: Deep luxury dark mode (`#06080C`, `#08090C`, `#0F1218`), subtle slate specular borders (`#1F2532`, `rgba(255, 255, 255, 0.08)`), accented with ethereal electric cyan and sky glow highlights (`#00E5FF`, `#38BDF8`, `#0EA5E9`) and crisp diamond typography.
* **Refined Glassmorphic Language**:
  - True multi-layer frosted glass: `backdrop-filter: blur(28px) saturate(180%)`.
  - Semi-transparent dark surfaces: `rgba(10, 14, 24, 0.68)`.
  - Delicate sub-pixel specular rim borders: `1px solid rgba(255, 255, 255, 0.08)`.
  - Inner top specular highlight: `inset 0 1px 1px rgba(255, 255, 255, 0.18)`.
* **🚫 Anti-Patterns**:
  - **No generic flat SaaS cards or bright opaque white containers**.
  - **No macOS terminal window dots**: Replace software window dots with luxury editorial micro-badges and subtle pulsing status indicators.
  - **No unblended rectangular cutouts or hard border images**.
  - **No element clashing**: Floating elements (WhatsApp FAB) must always have dedicated spatial offsets (`bottom: 24px; right: 24px`) and z-index isolation so they never overlap primary CTAs or text on mobile.

---

## 2. Multi-Language & RTL Standards (EN / FR / AR)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ 🌐 TRILINGUAL & BIDIRECTIONAL SYMMETRY                                    │
│ • English (EN): Modern Direct-Response, Tight Tracking (-0.028em), '→'     │
│ • French (FR): Haute Parfumerie Luxury, Balanced Accents, '→'              │
│ • Arabic (AR - RTL): Native Cairo Font Stack, Line-Height 1.4, '←'        │
├───────────────────────────────────────────────────────────────────────────┤
│ 📐 AUTOMATIC RTL LAYOUT TRANSFORMATIONS                                   │
│ When lang="ar" or dir="rtl" is active:                                    │
│ 1. Directional Margins/Paddings flip automatically (margin-left/right).   │
│ 2. Flex Containers mirror (flex-direction: row-reverse or natural start). │
│ 3. Arrow Vectors flip to match reading direction (→ becomes ←).           │
│ 4. Badges, tags, and status dots mirror to top-right/top-left naturally.  │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Editorial Typography & Visual Hierarchy

* **Editorial Display Headlines**: High-fashion display contrast (*Cormorant Garamond* / *Cinzel* / *Plus Jakarta Sans* 800) with generous optical rhythm, tight kerning, and radiant cyan gradient accents on key positioning terms.
* **Scannable Micro-Components**: Transform dense copy into scannable editorial micro-components (numbered service pillars: `01 / CREATIVE FATIGUE`, `02 / CONVERSION PROOF`, `03 / RETENTION LOOPS`).
* **Micro-Badges with Live Status Indicators**: Subtle glass pills with pulsing emerald/cyan status dots (`.pulse-dot`) indicating active intake cohorts.
* **Ambient Lighting**: Hardware-accelerated, diffuse optical caustic meshes (`filter: blur(120px); pointer-events: none; will-change: transform;`) behind glass panels.

---

## 4. Fluid Multi-View Viewport Standards

* **Mobile-First Responsive Testing**:
  - Micro-Mobile (`320px` - `375px`, iPhone SE / Mini)
  - Standard Mobile (`390px` - `430px`, iPhone 14/15/16 Pro Max, Samsung Galaxy)
  - Tablet Portrait (`768px` - `834px`, iPad)
  - Desktop & Wide (`1280px` - `1440px`+)
* **Viewport Golden Ratio**: Above-the-fold hero clearance on mobile with zero accidental double-scrollbars and minimum 48px touch targets (Apple HIG compliance).

---

## 5. Execution Workflow for Optimization Tasks

1. **Audit & Plan**: Scan the target component/view, verify active language keys, breakpoints, and interactive bindings.
2. **Surgical Refactoring**: Apply precise CSS and semantic HTML adjustments to typography, spatial padding, and glass borders.
3. **Responsive & RTL Verification**: Verify rendering in LTR (EN/FR) and RTL (AR) across mobile (393px) and desktop (1440px) via Puppeteer.
4. **Deploy & Document**: Push clean commits to `origin/main` for instant Vercel production deployment and provide clear diff summaries.
