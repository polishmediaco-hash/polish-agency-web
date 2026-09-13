---
name: luxury-beauty-design-system
description: >-
  Authoritative design system, card physics, and UI engineering skill for POLISH Media Co.
  Covers Haute Atelier Champagne Gold tokens, dynamic cursor spotlight cards, refractive specular borders,
  smoked obsidian glassmorphism, phone-native mobile density, and trilingual RTL layout transformations.
---

# POLISH Luxury Beauty Design System & UI Architecture

The **POLISH Media Co.** design system represents an ultra-premium beauty accelerator—where high-fashion editorial elegance (*Rhode, Chanel Beauté, Byredo, Apple Pro*) meets conversion-focused direct-response architecture.

---

## 1. Master Brand Tokens & Color Palette

Never use legacy cyan (`#00E5FF`) or cold blue tints. All UI components, lighting, and borders must strictly use the Direction 1 Haute Atelier palette:

```css
:root {
  /* Primary Luxury Accents */
  --brand-gold: #E2C799;          /* Radiant champagne gold (primary highlights & CTAs) */
  --brand-blue: #C5A880;          /* Deep antique bronze (secondary depth & shadows) */
  --brand-platinum: #F5E6D3;      /* Cashmere platinum (specular rim highlights) */
  --bg: #080706;                  /* Ultra-deep obsidian noir canvas */
  --bg-surface: #0E0C0A;          /* Raised container surface */

  /* Gradients */
  --grad-brand: linear-gradient(135deg, #F5E6D3 0%, #E2C799 50%, #C5A880 100%);
  --grad-text: linear-gradient(135deg, #FFFFFF 25%, #F5E6D3 65%, #E2C799 100%);
  --grad-card: linear-gradient(135deg, rgba(20, 17, 14, 0.88) 0%, rgba(12, 10, 8, 0.94) 100%);

  /* Typography Stacks */
  --font-sans: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-serif: 'Cormorant Garamond', Georgia, serif;
  --font-arabic: 'Tajawal', sans-serif;
}
```

---

## 2. Award-Winning Luxury Cards & Glassmorphism

### A. Dynamic Cursor Spotlight (RAF-Throttled Tracking)
Cards are dynamic optical stages. As the cursor moves, a subtle champagne gold cone illuminates the card surface:

```css
.luxury-card, .pro-card, .hero-glass-card {
  --spotlight-color: rgba(226, 199, 153, 0.14);
  --spotlight-border: rgba(226, 199, 153, 0.38);
  position: relative;
  background: var(--grad-card);
  border-radius: 24px;
  border: 1px solid rgba(245, 230, 211, 0.08);
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.7), inset 0 1px 1.5px rgba(245, 230, 211, 0.18);
  overflow: hidden;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.35s ease;
}

.luxury-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    480px circle at var(--mouse-x, -500px) var(--mouse-y, -500px),
    var(--spotlight-color),
    transparent 75%
  );
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.35s ease;
  z-index: 1;
}

.luxury-card:hover::before {
  opacity: 1;
}

.luxury-card:hover {
  transform: translateY(-3px);
  border-color: var(--spotlight-border);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.85), 0 0 28px rgba(226, 199, 153, 0.12), inset 0 1px 2px rgba(245, 230, 211, 0.28);
}

.luxury-card > * {
  position: relative;
  z-index: 2;
}
```

### B. JavaScript Cursor Tracking Implementation
```javascript
(function initSpotlightCards() {
  const cards = document.querySelectorAll('.pro-card, .hero-glass-card, .calc-monolith-card');
  if (cards.length === 0 || window.matchMedia('(pointer: coarse)').matches) return;

  cards.forEach(card => {
    let raf = null;
    card.addEventListener('mousemove', (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${(e.clientX - rect.left).toFixed(1)}px`);
        card.style.setProperty('--mouse-y', `${(e.clientY - rect.top).toFixed(1)}px`);
      });
    }, { passive: true });

    card.addEventListener('mouseleave', () => {
      if (raf) cancelAnimationFrame(raf);
      card.style.removeProperty('--mouse-x');
      card.style.removeProperty('--mouse-y');
    });
  });
})();
```

---

## 3. Phone-Native Mobile Ergonomics (Screens <= 768px)

1. **Card Padding & Density**:
   - Desktop: `padding: 36px 32px; border-radius: 24px;`
   - Mobile: `padding: 16px 14px; border-radius: 16px;`
   - Grid spacing: `gap: 12px;` on mobile instead of `24px-32px`.
2. **Touch Targets**:
   - Minimum button height: `48px` (Apple HIG compliance).
   - Touch state: Use GPU-composited `:active { transform: scale(0.985); }`.
   - Disable heavy JS mousemove tracking on touch devices (`pointer: coarse`).
3. **Floating Navigation & Action Clearance**:
   - Detached island headers must have `top: 14px` clearance.
   - Floating elements (WhatsApp FAB) must maintain spatial offset (`bottom: 24px; right: 24px`) and never obscure primary conversion CTAs.

---

## 4. Trilingual & RTL Architecture (EN / FR / AR)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ 🌐 TRILINGUAL & BIDIRECTIONAL STANDARDS                                    │
│ • English (EN): Bold Direct-Response, Tight Tracking (-0.022em), '→'        │
│ • French (FR): Haute Beauté Precision, Cormorant Italic Accents, '→'       │
│ • Arabic (AR - RTL): Native Tajawal Font Stack, Line-Height 1.4, '←'      │
├───────────────────────────────────────────────────────────────────────────┤
│ 📐 AUTOMATIC RTL LAYOUT TRANSFORMATIONS                                   │
│ When lang="ar" or dir="rtl" is active:                                    │
│ 1. Directional Margins/Paddings flip automatically.                       │
│ 2. Flex Containers mirror (flex-direction: row-reverse).                  │
│ 3. Arrow Vectors flip to match reading direction (→ becomes ←).           │
│ 4. Serif italics are disabled in Arabic for natural calligraphy flow.     │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Visual Audit & Inspection Checklist

When designing or reviewing any component:
- [ ] **Zero Cyan**: Confirm `#00E5FF` and cyan RGBAs are nowhere in the code.
- [ ] **Contrast**: Verify text on smoked glass passes WCAG AA (>= 4.5:1).
- [ ] **Specular Highlights**: Ensure 1px top rim highlight uses Cashmere Platinum (`rgba(245, 230, 211, 0.18)`).
- [ ] **RTL Symmetry**: Toggle Arabic and verify natural Tajawal rendering without broken letter clipping.
- [ ] **Performance**: Ensure animations execute strictly on compositor properties (`transform`, `opacity`).
