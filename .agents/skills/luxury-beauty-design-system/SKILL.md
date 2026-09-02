---
name: luxury-beauty-design-system
description: >-
  Official Luxury Beauty & High-Fashion Direct-Response Design System for POLISH Media Co.
  Guides aesthetic art direction, atmospheric glassmorphism, typography rhythm, color palettes,
  and conversion UX across all pages and viewports.
---

# POLISH Luxury Beauty & Direct-Response Design System

The **POLISH Media Co.** design system unifies high-fashion luxury art direction (Rhode, Chanel Beauté, Byredo, Apple Pro) with aggressive direct-response conversion architecture.

---

## 1. Core Visual Principles & Aesthetic Rules

### 🚫 Anti-Patterns (What NEVER to do)
* **Never use scattered perimeter floating product stickers**: Never paste floating product cutouts or random PNGs around card borders. They look like amateur clipart.
* **Never use harsh or unblended edges**: All background light and textures must fade softly into the obsidian canvas with radial gradients and cubic smoothsteps.
* **Never overcrowd negative space**: Luxury is defined by breathing room and generous negative margins.

### ✨ Luxury Aesthetic Tenets
1. **Obsidian Smoked Canvas (`#06080C` to `#0A0E17`)**:
   Deep, velvety, high-contrast dark space that allows cyan glows, diamond highlights, and crisp typography to pop with optical brilliance.
2. **Atmospheric Optical Caustics & Volumetric Auroras**:
   Soft, ambient background lighting using large, diffuse radial blurs and caustic cyan meshes that gently breathe behind frosted glass panels.
3. **True Frosted Glassmorphism**:
   `backdrop-filter: blur(40px) saturate(190%)` with a razor-thin specular top highlight `inset 0 1.5px 1.5px rgba(255, 255, 255, 0.35)` and deep diffuse drop shadows `0 24px 60px rgba(0, 0, 0, 0.8)`.
4. **Editorial Typography Hierarchy**:
   - Primary Headline: Bold, tight letter-spacing (`-0.028em`), generous line-height (`1.15` to `1.2`), and cyan gradient text accents.
   - Body & Micro-Copy: Soft muted white (`rgba(255, 255, 255, 0.72)`), high readability line-height (`1.65`), never cluttered.

---

## 2. Color Palette & Optical Specs

| Token | Value | Purpose |
| :--- | :--- | :--- |
| `--bg-void` | `#06080C` | Deepest background void canvas |
| `--bg-surface` | `rgba(10, 14, 23, 0.72)` | Frosted glass panel surface |
| `--accent-cyan` | `#00E5FF` | Primary electric brand accent & active state |
| `--accent-blue` | `#0088FF` | Secondary depth glow & gradient terminal |
| `--border-specular` | `rgba(255, 255, 255, 0.14)` | Diamond-cut top edge highlight |
| `--border-specular-hover`| `rgba(0, 229, 255, 0.45)` | Interactive hover rim highlight |
| `--text-main` | `#FFFFFF` | Primary high-contrast typography |
| `--text-muted` | `rgba(255, 255, 255, 0.72)` | Editorial supporting body text |

---

## 3. Layout & Section Spacing Standards

* **Sticky Floating Header**: Floating capsule with `top: 20px` (desktop) / `top: 12px` (mobile) and generous bottom margin (`24px`).
* **Hero Glass Frame**: Centered focal star of the page with `padding: 42px 48px 54px` (desktop) and `26px 20px 32px` (mobile).
* **Section Rhythm**: Generous vertical padding (`80px` desktop / `52px` mobile) between major content zones.
* **Direct-Response Interactive Elements**: 48px+ minimum touch targets (Apple HIG compliance), high-contrast glowing CTA pills, and non-intrusive floating docks.

---

## 4. Multi-Language & RTL Symmetry (EN / FR / AR)
* All font families, line heights, directional arrows, and badge alignments must mirror seamlessly between English/French (`LTR`) and Arabic (`RTL`, `Cairo` font).
