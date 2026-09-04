---
name: award-winning-luxury-cards
description: >-
  Expert guidelines, mathematical physics, and implementation procedures for designing and coding award-winning luxury cards, dynamic cursor spotlight borders, frosted spatial glassmorphism, and phone-native card UI inspired by Awwwards Site of the Day, Linear, Raycast, and Apple Design. Use whenever creating or upgrading card components, bento grids, or glass containers.
---

# Award-Winning Luxury Cards: Architectural & Design Guide

This skill provides the definitive engineering and design principles for building world-class luxury web cards recognized by **Awwwards (Site of the Day / Site of the Year)**, **FWA**, and modern design leaders (**Linear, Raycast, Apple VisionOS, Studio Freight, Locomotive**).

---

## 1. The 5 Pillars of Award-Winning Cards

1. **Dynamic Cursor Spotlight (Radial Gradient Tracking)**:
   - Cards should never be static boxes. As the cursor glides across the grid, a soft, high-fidelity light cone illuminates the card surface and highlights the border at the exact point of proximity.
   - Formula: `radial-gradient(circle at var(--mouse-x) var(--mouse-y), rgba(0, 229, 255, 0.15), transparent 70%)`.

2. **Refractive Dual-Rim Specular Borders**:
   - Never use flat `1px solid #333` or generic borders.
   - Use stacked multi-layered borders:
     - Base: `1px solid rgba(255, 255, 255, 0.08)`.
     - Inset specular highlight: `inset 0 1px 1px rgba(255, 255, 255, 0.2)`.
     - Hover spotlight border: Injected via a pseudo-element mask or dynamic custom property.

3. **Multi-Depth Smoked Acrylic Glass**:
   - Deep obsidian base: `linear-gradient(135deg, rgba(20, 26, 40, 0.72) 0%, rgba(8, 11, 20, 0.88) 100%)`.
   - Advanced optical blur: `backdrop-filter: blur(32px) saturate(190%)`.
   - Spatial shadow: Stack ambient occlusion with colored rim radiance: `0 14px 40px rgba(0, 0, 0, 0.7), 0 0 24px rgba(0, 229, 255, 0.08)`.

4. **Editorial Micro-Typography & Badges**:
   - Numbering: Large, ultra-refined gradient accents (e.g. `font-family: var(--font-heading); font-size: 32px; font-weight: 800; background: var(--grad-brand); -webkit-background-clip: text;`).
   - Micro-tags: Pill badges with hairline cyan borders (`rgba(0, 229, 255, 0.28)`), monospaced tracking (`letter-spacing: 0.08em;`), and inset glass highlights.
   - Hierarchy: High contrast between crisp white headers (`#F5F9FD`) and legible secondary text (`#94A3B8`).

5. **Phone-Native Ergonomics (Zero-Scroll & Adaptive Density)**:
   - On screens `<= 768px`, cards must shed excess desktop padding:
     - Desktop: `padding: 38px 32px; border-radius: 24px;`
     - Mobile: `padding: 16px 14px; border-radius: 16px;`
   - Touch devices must disable heavy JS mouse tracking and use lightweight, GPU-composited CSS touch feedback (`:active { transform: scale(0.985); }`).

---

## 2. Technical Implementation Architecture

### A. CSS Custom Property Setup
```css
.luxury-card {
  --spotlight-color: rgba(0, 229, 255, 0.16);
  --spotlight-border: rgba(0, 229, 255, 0.45);
  position: relative;
  background: linear-gradient(135deg, rgba(18, 24, 38, 0.72) 0%, rgba(8, 11, 20, 0.88) 100%);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(32px) saturate(190%);
  -webkit-backdrop-filter: blur(32px) saturate(190%);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.7), inset 0 1px 1.5px rgba(255, 255, 255, 0.2);
  overflow: hidden;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              box-shadow 0.35s cubic-bezier(0.16, 1, 0.3, 1),
              border-color 0.35s ease;
}

/* Spotlight Illumination Cone */
.luxury-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(
    450px circle at var(--mouse-x, -500px) var(--mouse-y, -500px),
    var(--spotlight-color),
    transparent 80%
  );
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s ease;
  z-index: 1;
}

.luxury-card:hover::before {
  opacity: 1;
}

/* Inset Highlight / Rim Glow */
.luxury-card:hover {
  transform: translateY(-4px);
  border-color: rgba(0, 229, 255, 0.32);
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.82), 0 0 32px rgba(0, 229, 255, 0.15), inset 0 1px 2px rgba(255, 255, 255, 0.3);
}

.luxury-card > * {
  position: relative;
  z-index: 2;
}
```

### B. Ultra-Performant Spotlight Mouse Tracking (RAF Throttle)
```javascript
(function initSpotlightCards() {
  const cards = document.querySelectorAll('.pro-card, .hero-glass-card, .form-container-shell');
  if (cards.length === 0 || window.matchMedia('(pointer: coarse)').matches) return;

  cards.forEach(card => {
    let raf = null;

    card.addEventListener('mousemove', (e) => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
        card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
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

## 3. Mobile Phone-Native Rules

1. **Card Padding**:
   - Strictly cap mobile card padding at `14px-16px` on screens `<= 768px`.
   - Never let desktop `padding: 38px 32px` leak into mobile media queries.
2. **Grid Spacing**:
   - `gap: 12px;` on mobile instead of `24px-32px`.
3. **Typography**:
   - Headlines: `clamp(16px, 4.5vw, 18px)`.
   - Descriptions: `13px` with `1.45` line-height.
   - Badges: `9px` with `padding: 3px 8px`.
4. **Form Viewports**:
   - Form container cards must fit 100% within the mobile viewport without triggering vertical page scrolling.
