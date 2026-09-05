# POLISH Media Co. — Typography Hierarchy & Specifications

**Brand Archetype**: Editorial Haute Parfumerie & High-Ticket Cosmetic Growth Accelerator

---

## 1. Font Families

### Primary Structural Sans-Serif: **Plus Jakarta Sans**
- **Designer**: Gumpita Rahayu (Tokotype)
- **Role**: Headlines, architectural brand titles, primary body copy, dynamic island navigation, button CTAs, high-density dashboard metrics.
- **Characteristics**: Modern geometric humanist sans with optical letterforms and ultra-clean horizontal baselines.
- **Active Weights**:
  - Regular (400) — Descriptive editorial body copy
  - Medium (500) — Form labels, subtext
  - SemiBold (600) — Buttons, navigation, metrics captions
  - Bold (700) — Sub-headlines, card titles
  - ExtraBold (800) — Primary H1 architectural headlines

### Editorial Luxury Serif Accent: **Cormorant Garamond**
- **Designer**: Christian Thalmann (Catharsis Fonts)
- **Role**: Contrast italic accents in hero headlines, narrative section headings, and luxury quotes.
- **Characteristics**: Inspired by Claude Garamont's 16th-century typefaces; razor-sharp serifs, high contrast between thick and thin strokes.
- **Active Weights**:
  - SemiBold (600 Italic) — Gradient shimmer accent lines in hero & problem/solution titles.

### Arabic Script Harmony: **Tajawal**
- **Designer**: Boutros Fonts
- **Role**: All Arabic (RTL) copy, Arabic headings, and form inputs.
- **Characteristics**: Clean, geometric low-contrast Naskh style that mirrors the structural weight of Plus Jakarta Sans.
- **RTL Typography Rule**: Never apply serif italics to Arabic text. Under `[dir="rtl"]`, accent spans automatically render in `Tajawal` normal posture.

---

## 2. Typographic Scale & Cadence

| Token | Desktop Size | Mobile Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `--font-size-hero` | `clamp(52px, 5.8vw, 84px)` | 42px | 800 | 1.06 | `-0.022em` | Main Landing Page Hero |
| `--font-size-h1` | `clamp(38px, 4.2vw, 56px)` | 32px | 800 | 1.12 | `-0.018em` | Major Section Headlines |
| `--font-size-h2` | `clamp(28px, 3.0vw, 40px)` | 24px | 700 | 1.20 | `-0.012em` | Card Headings, Agitation Bottlenecks |
| `--font-size-h3` | `clamp(20px, 2.2vw, 26px)` | 19px | 600 | 1.28 | `-0.008em` | Pillar Names, Case Study Titles |
| `--font-size-body` | `16px` | 15px | 400 | 1.68 | `0em` | Body copy, narrative paragraphs |
| `--font-size-small` | `13px` | 12px | 500 | 1.50 | `+0.02em` | Captions, footnotes, table headers |
| `--font-size-eyebrow` | `12px` | 11px | 700 | 1.00 | `+0.16em` | Uppercase section badges and tags |

---

## 3. Tabular Numerals Requirement

For all revenue figures, ROI multiples, and step counters:
```css
font-variant-numeric: tabular-nums lining-nums;
letter-spacing: -0.02em;
```
This prevents horizontal jitter when values transition and maintains strict vertical alignment.

---

## 4. Google Fonts Embed Code
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
```
