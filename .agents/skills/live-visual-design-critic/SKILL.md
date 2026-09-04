---
name: live-visual-design-critic
description: "Takes screenshots from the live website (polishmediaco.com) across all views (Desktop, Tablet, Mobile, Micro) and languages (EN, FR, AR), performs rigorous luxury visual critiques, and provides actionable design advice based on rendered screenshots."
---

# Live Visual Design Critic & Multi-Viewport Audit Skill

## 🎯 Purpose
This skill captures pixel-perfect high-resolution screenshots from the live production website (https://www.polishmediaco.com) across multiple device viewports and all supported languages (en, fr, ar), performs comprehensive aesthetic and UX critiques, and delivers actionable design and conversion advice based on actual rendered visuals.

---

## 🛠️ Automated Execution Workflow

### Step 1: Run the Visual Capture Engine
Execute the automated live screenshot capture script:
```bash
node .agents/skills/live-visual-design-critic/scripts/capture-live-views.js
```
Optional configuration parameters:
- `--url <custom_url>` (default: `https://www.polishmediaco.com`)
- `--routes </, /apply, /creators>` (default: all primary routes)
- `--langs <en,fr,ar>` (default: all 3 languages)
- `--outDir <path>` (default: current conversation artifacts directory)

### Step 2: Inspect Generated Visual Evidence
Use `view_file` to visually inspect the captured screenshots:
- `live_desktop_1440_en.png`, `live_desktop_1440_fr.png`, `live_desktop_1440_ar.png`
- `live_tablet_768_en.png`, `live_tablet_768_fr.png`, `live_tablet_768_ar.png`
- `live_mobile_390_en.png`, `live_mobile_390_fr.png`, `live_mobile_390_ar.png`
- `live_micro_320_en.png`, `live_micro_320_fr.png`, `live_micro_320_ar.png`

### Step 3: Conduct Structured Visual Design Critique
Analyze each viewport and language across 6 core aesthetic dimensions:
1. **Spatial Balance & Proportions**:
   - Is the hero card commanding without suffocating the viewport?
   - Is breathing room consistent (40px–80px desktop, 20px–36px mobile)?
   - Is the next section cleanly below the fold on first entrance?
2. **Typography & Optical Rhythm**:
   - Does the two-font pairing (*Plus Jakarta Sans* bold + *Cormorant Garamond* italic) harmonize optically?
   - Is Arabic RTL typography natural, unitalicized, and aligned cleanly?
   - Are all subtitles, tags, and micro-labels crisp and readable?
3. **Glassmorphism & Depth Quality**:
   - Is the glass translucent enough to showcase background 3D depth products?
   - Are specular rim highlights sharp without banding or glare?
   - Is backdrop blur smooth without visual compression artifacts?
4. **Color Harmony & Specular Contrast**:
   - Contrast ratio between text and glass background (WCAG AA/AAA).
   - Cyan/blue gradient luminance and button glow saturation.
5. **Interactive Controls & Layout**:
   - Dynamic Island header symmetry and unboxed logo clarity.
   - Button padding, hover states, and touch accessibility (>= 44px).
   - Sticky CTA and WhatsApp floating bubble positioning.
6. **Conversion Funnels & Forms**:
   - Step indicator visibility, radio card selection clarity, and zero-distraction form layout.

---

## 📋 Critique Output Format

When invoking this skill, provide:
1. **Screenshot Visual Gallery**: Markdown carousel linking the rendered images.
2. **Per-Viewport Scorecard**: Quantitative rating (1–10) across Desktop, Tablet, Mobile, and RTL.
3. **What is Working Exceptionally Well**: Highlight top luxury aesthetic achievements.
4. **Specific Weaknesses & Friction Points**: Identify visual flaws, spatial imbalances, or contrast issues.
5. **Actionable Design Recommendations**: Step-by-step design upgrades with exact CSS/HTML changes.
