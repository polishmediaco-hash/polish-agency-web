/**
 * POLISH Media Co. — Comprehensive Haute Atelier Brand Pack Generator
 * Generates all vector SVGs, high-res transparent PNGs, favicons, social banners,
 * color tokens, typography guides, and packages the complete ZIP archive.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { execSync } = require('child_process');

const BASE_DIR = path.resolve(__dirname, '..');
const PACK_DIR = path.join(BASE_DIR, 'public', 'brand-pack');
const LOGOS_DIR = path.join(PACK_DIR, '01_logos');
const ICONS_DIR = path.join(PACK_DIR, '02_favicons_and_icons');
const SOCIAL_DIR = path.join(PACK_DIR, '03_social_assets');
const COLOR_DIR = path.join(PACK_DIR, '04_color_palette');
const TYPO_DIR = path.join(PACK_DIR, '05_typography');
const GUIDE_DIR = path.join(PACK_DIR, '06_guidelines');

// Ensure directories exist
[LOGOS_DIR, ICONS_DIR, SOCIAL_DIR, COLOR_DIR, TYPO_DIR, GUIDE_DIR].forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
});

// Color Constants
const COLORS = {
  gold: '#E2C799',
  goldLight: '#F5E6D3',
  bronze: '#C5A880',
  noir: '#080706',
  charcoal: '#161412',
  white: '#FFFFFF',
  black: '#000000',
  alabaster: '#FAF7F2',
  ink: '#1A1715'
};

// Common SVG Gradients & Filters
const SVG_DEFS = `
  <defs>
    <linearGradient id="champagneGoldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C5A880"/>
      <stop offset="45%" stop-color="#E2C799"/>
      <stop offset="70%" stop-color="#F5E6D3"/>
      <stop offset="100%" stop-color="#E2C799"/>
    </linearGradient>
    <linearGradient id="champagneGoldSubtle" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5E6D3" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#C5A880" stop-opacity="0.9"/>
    </linearGradient>
    <linearGradient id="obsidianSurface" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181614"/>
      <stop offset="100%" stop-color="#080706"/>
    </linearGradient>
    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&amp;family=Cormorant+Garamond:ital,wght@1,600&amp;display=swap');
      .font-brand-title { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 800; }
      .font-brand-sub { font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-weight: 600; }
      .font-serif-luxury { font-family: 'Cormorant Garamond', Didot, 'Playfair Display', Georgia, serif; font-style: italic; }
    </style>
  </defs>
`;

/**
 * Concept 1: The Golden Ratio Pipette (Official Primary Brand Mark)
 * Continuous golden-ratio (phi ~ 1.618) fillets, aerodynamic taper, and optically locked diamond droplet.
 * Centered around (50, 50) when wrapped in <g transform="translate(3.5, -5.5)">
 */
function getMarkSnippet(fill = 'url(#champagneGoldGrad)') {
  const innerDiamondColor = (fill.includes('champagne') || fill.includes('gold')) ? '#F5E6D3' : fill;
  return `
    <g transform="translate(3.5, -5.5)">
      <!-- Upward Kinetic Chevron with Golden Ratio Taper -->
      <path d="M 34 68 
               C 30 64 30 58 34 54 
               L 56 32 
               L 48 32 
               C 45 32 43 30 43 27 
               C 43 24 45 22 48 22 
               L 75 22 
               C 77 22 79 24 79 26 
               L 79 53 
               C 79 56 77 58 74 58 
               C 71 58 69 56 69 53 
               L 69 45 
               L 47 68 
               C 43 72 38 72 34 68 Z" 
            fill="${fill}"/>
      
      <!-- Optically Locked Cosmetic Droplet with Facet Angle -->
      <path d="M 24 72 
               C 27 75 29 79 28 83 
               C 27 87 23 89 19 88 
               C 15 87 13 83 14 79 
               C 15 75 21 69 24 72 Z" 
            fill="${fill}" opacity="0.95"/>
      <!-- Inner Diamond Droplet Core -->
      <rect x="18.5" y="77.5" width="5.5" height="5.5" rx="1.2" transform="rotate(45 21.25 80.25)" fill="${innerDiamondColor}"/>
    </g>
  `;
}

// -------------------------------------------------------------
// 1. LOGOS & MARKS GENERATION
// -------------------------------------------------------------

// Standalone Mark SVG template
function createMarkSvg(fill, isSquircle = false) {
  if (isSquircle) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  ${SVG_DEFS}
  <!-- Squircle Obsidian Base -->
  <rect x="16" y="16" width="480" height="480" rx="120" fill="url(#obsidianSurface)" stroke="rgba(226, 199, 153, 0.28)" stroke-width="3"/>
  <g transform="translate(256, 256) scale(3.2) translate(-50, -50)">
    ${getMarkSnippet(fill)}
  </g>
</svg>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 500" width="500" height="500">
  ${SVG_DEFS}
  <g transform="translate(250, 250) scale(4.4) translate(-50, -50)">
    ${getMarkSnippet(fill)}
  </g>
</svg>`;
}

// Horizontal Logo Lockup SVG template
function createHorizontalLogoSvg({ fillTitle, fillSub, fillMark, hasDarkBg = false }) {
  const bg = hasDarkBg ? `<rect width="100%" height="100%" fill="${COLORS.noir}"/>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 180" width="760" height="180">
  ${SVG_DEFS}
  ${bg}
  <!-- Left Aligned Mark -->
  <g transform="translate(75, 90) scale(1.6) translate(-50, -50)">
    ${getMarkSnippet(fillMark)}
  </g>
  <!-- Architectural Wordmark POLISH -->
  <text x="175" y="105" 
        class="font-brand-title"
        font-size="64" 
        letter-spacing="9" 
        fill="${fillTitle}">POLISH</text>
  <!-- Subtitle MEDIA CO -->
  <text x="178" y="142" 
        class="font-brand-sub"
        font-size="14" 
        letter-spacing="8.5" 
        fill="${fillSub}">MEDIA CO</text>
</svg>`;
}

// Vertical / Stacked Logo Lockup SVG template
function createVerticalLogoSvg({ fillTitle, fillSub, fillMark, hasDarkBg = false }) {
  const bg = hasDarkBg ? `<rect width="100%" height="100%" fill="${COLORS.noir}"/>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 520" width="600" height="520">
  ${SVG_DEFS}
  ${bg}
  <!-- Centered Mark -->
  <g transform="translate(300, 150) scale(2.3) translate(-50, -50)">
    ${getMarkSnippet(fillMark)}
  </g>
  <!-- Architectural Wordmark POLISH -->
  <text x="300" y="375" 
        class="font-brand-title"
        font-size="78" 
        letter-spacing="12" 
        text-anchor="middle"
        fill="${fillTitle}">POLISH</text>
  <!-- Subtitle MEDIA CO -->
  <text x="300" y="435" 
        class="font-brand-sub"
        font-size="16" 
        letter-spacing="12" 
        text-anchor="middle"
        fill="${fillSub}">MEDIA CO</text>
</svg>`;
}

// -------------------------------------------------------------
// 2. SOCIAL BANNERS & ASSETS GENERATION
// -------------------------------------------------------------

// Twitter / X Header Banner (1500x500)
function createTwitterBannerSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 500" width="1500" height="500">
  ${SVG_DEFS}
  <!-- Obsidian Base Background -->
  <rect width="1500" height="500" fill="#080706"/>
  
  <!-- Subtle Radial Luxury Ambient Glows -->
  <circle cx="250" cy="250" r="320" fill="#E2C799" opacity="0.04" filter="blur(60px)"/>
  <circle cx="1250" cy="150" r="380" fill="#C5A880" opacity="0.03" filter="blur(80px)"/>
  
  <!-- Architectural Grid Lines (Beveled Luxury Specular) -->
  <line x1="80" y1="0" x2="80" y2="500" stroke="rgba(226, 199, 153, 0.08)" stroke-width="1"/>
  <line x1="1420" y1="0" x2="1420" y2="500" stroke="rgba(226, 199, 153, 0.08)" stroke-width="1"/>
  <line x1="0" y1="440" x2="1500" y2="440" stroke="rgba(226, 199, 153, 0.08)" stroke-width="1"/>
  
  <!-- Left Decorative Mark Watermark -->
  <g transform="translate(1300, 260) scale(4.5) translate(-50, -50)" opacity="0.06">
    ${getMarkSnippet('url(#champagneGoldGrad)')}
  </g>
  
  <!-- Brand Monogram in Frosted Squircle -->
  <g transform="translate(180, 210) scale(1.1) translate(-50, -50)">
    <rect x="0" y="0" width="100" height="100" rx="26" fill="#141210" stroke="rgba(226, 199, 153, 0.3)" stroke-width="1.5"/>
    <g transform="translate(50, 50) scale(0.9) translate(-50, -50)">
      ${getMarkSnippet('url(#champagneGoldGrad)')}
    </g>
  </g>

  <!-- Typography Content -->
  <!-- Eyebrow -->
  <text x="320" y="180" class="font-brand-sub" font-size="13" letter-spacing="6" fill="#C5A880">THE HAUTE ATELIER OF COSMETIC GROWTH</text>
  
  <!-- Main Title -->
  <text x="320" y="240" class="font-brand-title" font-size="52" letter-spacing="6" fill="url(#champagneGoldGrad)">POLISH <tspan font-size="28" letter-spacing="8" fill="#F5E6D3">MEDIA CO.</tspan></text>
  
  <!-- Editorial Tagline with Cormorant Italic -->
  <text x="320" y="295" class="font-serif-luxury" font-size="24" fill="#F5E6D3">Haute Parfumerie, Clinical Formulations &amp; Algorithmic DTC Scaling.</text>
  
  <!-- Key Metros Bar -->
  <text x="320" y="350" class="font-brand-sub" font-size="12" letter-spacing="5" fill="rgba(245, 230, 211, 0.5)">PARIS  •  NEW YORK  •  DUBAI  •  TOKYO  •  ZÜRICH</text>

  <!-- High-Ticket Credential Pill -->
  <rect x="1100" y="200" width="260" height="70" rx="35" fill="rgba(20, 18, 16, 0.8)" stroke="rgba(226, 199, 153, 0.25)" stroke-width="1"/>
  <text x="1230" y="232" class="font-brand-title" font-size="18" text-anchor="middle" fill="#E2C799">$85M+ SCALED</text>
  <text x="1230" y="254" class="font-brand-sub" font-size="10" letter-spacing="2" text-anchor="middle" fill="rgba(245, 230, 211, 0.6)">PRESTIGE BEAUTY DTC</text>
</svg>`;
}

// LinkedIn Company Banner (1584x396)
function createLinkedInBannerSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1584 396" width="1584" height="396">
  ${SVG_DEFS}
  <rect width="1584" height="396" fill="#080706"/>
  <circle cx="200" cy="200" r="280" fill="#E2C799" opacity="0.04" filter="blur(50px)"/>
  <circle cx="1400" cy="200" r="300" fill="#C5A880" opacity="0.03" filter="blur(60px)"/>
  
  <!-- Subtle Border Lines -->
  <line x1="60" y1="0" x2="60" y2="396" stroke="rgba(226, 199, 153, 0.08)" stroke-width="1"/>
  <line x1="1524" y1="0" x2="1524" y2="396" stroke="rgba(226, 199, 153, 0.08)" stroke-width="1"/>

  <!-- Logo Mark Lockup -->
  <g transform="translate(140, 198) scale(1.4) translate(-50, -50)">
    ${getMarkSnippet('url(#champagneGoldGrad)')}
  </g>

  <!-- Typography -->
  <text x="240" y="165" class="font-brand-sub" font-size="12" letter-spacing="6" fill="#C5A880">PRESTIGE COSMETIC ACCELERATOR</text>
  <text x="240" y="220" class="font-brand-title" font-size="46" letter-spacing="6" fill="url(#champagneGoldGrad)">POLISH <tspan font-size="24" letter-spacing="8" fill="#F5E6D3">MEDIA CO</tspan></text>
  <text x="240" y="265" class="font-serif-luxury" font-size="21" fill="#F5E6D3">Precision-Engineered Growth for Fragrance, Clinical Skincare &amp; Luxury Aesthetics</text>
  
  <!-- Metrics Badge -->
  <g transform="translate(1220, 150)">
    <rect x="0" y="0" width="240" height="96" rx="16" fill="rgba(22, 20, 18, 0.7)" stroke="rgba(226, 199, 153, 0.2)" stroke-width="1"/>
    <text x="120" y="42" class="font-brand-title" font-size="24" text-anchor="middle" fill="#E2C799">3.4x — 5.8x</text>
    <text x="120" y="70" class="font-brand-sub" font-size="10" letter-spacing="3" text-anchor="middle" fill="rgba(245, 230, 211, 0.7)">AVERAGE MER VELOCITY</text>
  </g>
</svg>`;
}

// OpenGraph Social Share Card (1200x630)
function createOpenGraphCardSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  ${SVG_DEFS}
  <!-- Noir Background with Velvet Gradient -->
  <rect width="1200" height="630" fill="#080706"/>
  <circle cx="600" cy="220" r="360" fill="#E2C799" opacity="0.05" filter="blur(80px)"/>
  
  <!-- Outer Beveled Specular Border -->
  <rect x="30" y="30" width="1140" height="570" rx="24" fill="none" stroke="rgba(226, 199, 153, 0.2)" stroke-width="1.5"/>

  <!-- Centered Mark -->
  <g transform="translate(600, 175) scale(2.0) translate(-50, -50)">
    ${getMarkSnippet('url(#champagneGoldGrad)')}
  </g>

  <!-- Typography Lockup -->
  <text x="600" y="340" class="font-brand-title" font-size="64" letter-spacing="14" text-anchor="middle" fill="url(#champagneGoldGrad)">POLISH</text>
  <text x="600" y="385" class="font-brand-sub" font-size="16" letter-spacing="12" text-anchor="middle" fill="#C5A880">MEDIA CO</text>

  <!-- Tagline -->
  <text x="600" y="455" class="font-serif-luxury" font-size="28" text-anchor="middle" fill="#F5E6D3">The Haute Atelier of High-Ticket Beauty &amp; Cosmetic Scaling</text>
  
  <!-- Trilingual & Metro Footer -->
  <text x="600" y="525" class="font-brand-sub" font-size="12" letter-spacing="6" text-anchor="middle" fill="rgba(245, 230, 211, 0.45)">PARIS  •  NEW YORK  •  DUBAI  •  POLISHMEDIACO.COM</text>
</svg>`;
}

// Instagram Square Avatar (1080x1080)
function createInstagramAvatarSvg() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1080" width="1080" height="1080">
  ${SVG_DEFS}
  <!-- Dark Obsidian Background -->
  <rect width="1080" height="1080" fill="#080706"/>
  
  <!-- Radial Glow Behind Squircle -->
  <circle cx="540" cy="540" r="400" fill="#E2C799" opacity="0.08" filter="blur(60px)"/>

  <!-- Luxury Frosted Squircle Container -->
  <rect x="140" y="140" width="800" height="800" rx="220" fill="url(#obsidianSurface)" stroke="rgba(226, 199, 153, 0.35)" stroke-width="4"/>
  
  <!-- Inner Subtle Accent Ring -->
  <rect x="160" y="160" width="760" height="760" rx="200" fill="none" stroke="rgba(245, 230, 211, 0.08)" stroke-width="2"/>

  <!-- Centered Signature Mark -->
  <g transform="translate(540, 540) scale(5.4) translate(-50, -50)">
    ${getMarkSnippet('url(#champagneGoldGrad)')}
  </g>
</svg>`;
}

// -------------------------------------------------------------
// 3. COLOR PALETTE SWATCH CARD GENERATION
// -------------------------------------------------------------

function createPaletteSwatchesSvg() {
  const swatches = [
    { name: 'Champagne Gold', role: 'Primary Atelier Metal', hex: '#E2C799', rgb: '226, 199, 153', cmyk: '0, 12, 32, 11', textDark: true },
    { name: 'Cashmere Platinum', role: 'Editorial Highlights', hex: '#F5E6D3', rgb: '245, 230, 211', cmyk: '0, 6, 14, 4', textDark: true },
    { name: 'Atelier Bronze', role: 'Shading &amp; Deep Gradient', hex: '#C5A880', rgb: '197, 168, 128', cmyk: '0, 15, 35, 23', textDark: true },
    { name: 'Deep Obsidian Noir', role: 'Signature Void Ground', hex: '#080706', rgb: '8, 7, 6', cmyk: '0, 14, 25, 97', textDark: false },
    { name: 'Satin Charcoal', role: 'Frosted Glass Surface', hex: '#161412', rgb: '22, 20, 18', cmyk: '0, 9, 18, 91', textDark: false },
    { name: 'Warm Alabaster', role: 'Light Mode Editorial Ground', hex: '#FAF7F2', rgb: '250, 247, 242', cmyk: '0, 1, 3, 2', textDark: true }
  ];

  const swatchWidth = 230;
  const swatchHeight = 360;
  const gap = 30;
  const startX = 60;
  const startY = 180;

  const swatchElements = swatches.map((s, idx) => {
    const x = startX + idx * (swatchWidth + gap);
    const y = startY;
    const textColor = s.textDark ? '#080706' : '#FAF7F2';
    const subColor = s.textDark ? 'rgba(8, 7, 6, 0.7)' : 'rgba(250, 247, 242, 0.7)';
    const borderColor = s.hex === '#080706' ? 'stroke="rgba(226, 199, 153, 0.25)"' : 'stroke="rgba(0, 0, 0, 0.15)"';

    return `
      <g transform="translate(${x}, ${y})">
        <!-- Color Block -->
        <rect width="${swatchWidth}" height="${swatchHeight - 120}" rx="16" fill="${s.hex}" ${borderColor} stroke-width="1"/>
        <!-- Label Area Below -->
        <text x="0" y="${swatchHeight - 85}" class="font-brand-title" font-size="17" fill="#F5E6D3">${s.name}</text>
        <text x="0" y="${swatchHeight - 65}" class="font-brand-sub" font-size="12" fill="#C5A880">${s.role}</text>
        <text x="0" y="${swatchHeight - 40}" class="font-brand-title" font-size="14" fill="#E2C799">${s.hex}</text>
        <text x="0" y="${swatchHeight - 20}" class="font-brand-sub" font-size="11" fill="rgba(245, 230, 211, 0.5)">RGB(${s.rgb})</text>
      </g>
    `;
  }).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1680 640" width="1680" height="640">
  ${SVG_DEFS}
  <rect width="1680" height="640" fill="#080706"/>
  <rect x="24" y="24" width="1632" height="592" rx="20" fill="none" stroke="rgba(226, 199, 153, 0.2)" stroke-width="1.5"/>
  
  <!-- Header Section -->
  <g transform="translate(60, 90)">
    <text x="0" y="0" class="font-brand-sub" font-size="13" letter-spacing="6" fill="#C5A880">POLISH MEDIA CO.  •  COLOR MATRIX SPECIFICATION</text>
    <text x="0" y="38" class="font-brand-title" font-size="38" letter-spacing="2" fill="url(#champagneGoldGrad)">Haute Atelier Champagne Gold &amp; Obsidian Palette</text>
  </g>

  <!-- Swatches Row -->
  ${swatchElements}
</svg>`;
}

// -------------------------------------------------------------
// 4. MAIN ASSET BUILDER FUNCTION
// -------------------------------------------------------------

async function buildBrandPack() {
  console.log('✨ [Brand Pack] Initializing Haute Atelier Brand Asset Suite...');

  // A. Logo Definitions
  const logos = [
    // 1. Horizontal Lockups
    {
      filename: 'polish-logo-horizontal-gold',
      svg: createHorizontalLogoSvg({ fillTitle: 'url(#champagneGoldGrad)', fillSub: '#C5A880', fillMark: 'url(#champagneGoldGrad)' }),
      widths: [4000, 2000, 1000]
    },
    {
      filename: 'polish-logo-horizontal-gold-noir-bg',
      svg: createHorizontalLogoSvg({ fillTitle: 'url(#champagneGoldGrad)', fillSub: '#C5A880', fillMark: 'url(#champagneGoldGrad)', hasDarkBg: true }),
      widths: [4000, 2000]
    },
    {
      filename: 'polish-logo-horizontal-dark',
      svg: createHorizontalLogoSvg({ fillTitle: COLORS.noir, fillSub: '#3A342D', fillMark: COLORS.noir }),
      widths: [4000, 2000]
    },
    {
      filename: 'polish-logo-horizontal-white',
      svg: createHorizontalLogoSvg({ fillTitle: COLORS.white, fillSub: 'rgba(255, 255, 255, 0.75)', fillMark: COLORS.white }),
      widths: [4000, 2000]
    },
    {
      filename: 'polish-logo-horizontal-black',
      svg: createHorizontalLogoSvg({ fillTitle: COLORS.black, fillSub: '#2A2A2A', fillMark: COLORS.black }),
      widths: [4000, 2000]
    },

    // 2. Vertical / Stacked Lockups
    {
      filename: 'polish-logo-vertical-gold',
      svg: createVerticalLogoSvg({ fillTitle: 'url(#champagneGoldGrad)', fillSub: '#C5A880', fillMark: 'url(#champagneGoldGrad)' }),
      widths: [4000, 2000, 1000]
    },
    {
      filename: 'polish-logo-vertical-gold-noir-bg',
      svg: createVerticalLogoSvg({ fillTitle: 'url(#champagneGoldGrad)', fillSub: '#C5A880', fillMark: 'url(#champagneGoldGrad)', hasDarkBg: true }),
      widths: [4000, 2000]
    },
    {
      filename: 'polish-logo-vertical-dark',
      svg: createVerticalLogoSvg({ fillTitle: COLORS.noir, fillSub: '#3A342D', fillMark: COLORS.noir }),
      widths: [4000, 2000]
    },
    {
      filename: 'polish-logo-vertical-white',
      svg: createVerticalLogoSvg({ fillTitle: COLORS.white, fillSub: 'rgba(255, 255, 255, 0.75)', fillMark: COLORS.white }),
      widths: [4000, 2000]
    },
    {
      filename: 'polish-logo-vertical-black',
      svg: createVerticalLogoSvg({ fillTitle: COLORS.black, fillSub: '#2A2A2A', fillMark: COLORS.black }),
      widths: [4000, 2000]
    },

    // 3. Standalone Marks
    {
      filename: 'polish-mark-gold',
      svg: createMarkSvg('url(#champagneGoldGrad)'),
      widths: [2048, 1024, 512]
    },
    {
      filename: 'polish-mark-dark',
      svg: createMarkSvg(COLORS.noir),
      widths: [2048, 1024, 512]
    },
    {
      filename: 'polish-mark-white',
      svg: createMarkSvg(COLORS.white),
      widths: [2048, 1024, 512]
    },
    {
      filename: 'polish-mark-black',
      svg: createMarkSvg(COLORS.black),
      widths: [2048, 1024, 512]
    },
    {
      filename: 'polish-mark-squircle-gold',
      svg: createMarkSvg('url(#champagneGoldGrad)', true),
      widths: [1024, 512]
    }
  ];

  for (const item of logos) {
    const svgPath = path.join(LOGOS_DIR, `${item.filename}.svg`);
    fs.writeFileSync(svgPath, item.svg, 'utf8');
    console.log(`  ✓ Saved SVG: 01_logos/${item.filename}.svg`);

    // Render PNGs with sharp
    for (const w of item.widths) {
      const pngPath = path.join(LOGOS_DIR, `${item.filename}-${w}px.png`);
      await sharp(Buffer.from(item.svg))
        .resize({ width: w, withoutEnlargement: false })
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(pngPath);
    }
  }

  // Also sync primary official logo to public/assets/
  const officialLogoSvg = createVerticalLogoSvg({ fillTitle: 'url(#champagneGoldGrad)', fillSub: '#C5A880', fillMark: 'url(#champagneGoldGrad)' });
  fs.writeFileSync(path.join(BASE_DIR, 'public', 'assets', 'logo-gold.svg'), officialLogoSvg, 'utf8');
  await sharp(Buffer.from(officialLogoSvg))
    .resize(1200, null)
    .png({ quality: 100 })
    .toFile(path.join(BASE_DIR, 'public', 'assets', 'logo-gold.png'));
  console.log('  ✓ Synced official Golden Ratio Pipette logo to public/assets/logo-gold.svg and png');

  // B. Favicons & App Icons
  console.log('✨ [Brand Pack] Generating Favicons & Platform App Icons...');
  const faviconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  ${SVG_DEFS}
  <rect width="100" height="100" rx="22" fill="#0A0908" stroke="rgba(226, 199, 153, 0.25)" stroke-width="1.5"/>
  <g transform="translate(50, 50) scale(0.9) translate(-50, -50)">
    ${getMarkSnippet('url(#champagneGoldGrad)')}
  </g>
</svg>`;

  fs.writeFileSync(path.join(ICONS_DIR, 'favicon.svg'), faviconSvg, 'utf8');
  // Copy to public/assets/favicon.svg and public/favicon.svg
  fs.writeFileSync(path.join(BASE_DIR, 'public', 'assets', 'favicon.svg'), faviconSvg, 'utf8');

  const iconSizes = [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
    { size: 180, name: 'apple-touch-icon-180x180.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 512, name: 'android-chrome-512x512.png' }
  ];

  for (const ic of iconSizes) {
    await sharp(Buffer.from(faviconSvg))
      .resize(ic.size, ic.size)
      .png({ quality: 100 })
      .toFile(path.join(ICONS_DIR, ic.name));
  }

  // Web Manifest
  const manifest = {
    name: "POLISH Media Co.",
    short_name: "POLISH",
    icons: [
      { src: "/brand-pack/02_favicons_and_icons/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { src: "/brand-pack/02_favicons_and_icons/android-chrome-512x512.png", sizes: "512x512", type: "image/png" }
    ],
    theme_color: "#080706",
    background_color: "#080706",
    display: "standalone"
  };
  fs.writeFileSync(path.join(ICONS_DIR, 'site.webmanifest'), JSON.stringify(manifest, null, 2), 'utf8');

  // C. Social Assets
  console.log('✨ [Brand Pack] Generating Social & Digital Assets...');
  const socialAssets = [
    { name: 'twitter-x-header-1500x500', svg: createTwitterBannerSvg(), w: 1500, h: 500 },
    { name: 'linkedin-banner-1584x396', svg: createLinkedInBannerSvg(), w: 1584, h: 396 },
    { name: 'instagram-profile-1080x1080', svg: createInstagramAvatarSvg(), w: 1080, h: 1080 },
    { name: 'og-social-card-1200x630', svg: createOpenGraphCardSvg(), w: 1200, h: 630 }
  ];

  for (const sa of socialAssets) {
    fs.writeFileSync(path.join(SOCIAL_DIR, `${sa.name}.svg`), sa.svg, 'utf8');
    await sharp(Buffer.from(sa.svg))
      .resize(sa.w, sa.h)
      .png({ quality: 95 })
      .toFile(path.join(SOCIAL_DIR, `${sa.name}.png`));
    console.log(`  ✓ Generated Social Asset: 03_social_assets/${sa.name}.png`);
  }

  // D. Color Palette Assets
  console.log('✨ [Brand Pack] Generating Color Tokens & Swatches...');
  const paletteTokens = {
    meta: {
      brand: "POLISH Media Co.",
      version: "2.0.0",
      aesthetic: "Haute Atelier Champagne Gold & Obsidian Noir",
      created: "2026-09-05"
    },
    primary: {
      champagne_gold: {
        hex: "#E2C799",
        rgb: "rgb(226, 199, 153)",
        cmyk: "cmyk(0, 12, 32, 11)",
        pantone: "Pantone 467 C (Approximate)",
        role: "Primary luxury brand metal, CTAs, key accent highlights, primary logo"
      },
      cashmere_platinum: {
        hex: "#F5E6D3",
        rgb: "rgb(245, 230, 211)",
        cmyk: "cmyk(0, 6, 14, 4)",
        pantone: "Pantone 7527 C (Approximate)",
        role: "Primary high-contrast text, specular sheen, refined badges"
      },
      atelier_bronze: {
        hex: "#C5A880",
        rgb: "rgb(197, 168, 128)",
        cmyk: "cmyk(0, 15, 35, 23)",
        pantone: "Pantone 465 C (Approximate)",
        role: "Shading, tertiary typography, gradient anchor depth"
      }
    },
    neutrals: {
      deep_obsidian_noir: {
        hex: "#080706",
        rgb: "rgb(8, 7, 6)",
        role: "Primary background ground, deep luxury obsidian void"
      },
      satin_charcoal: {
        hex: "#161412",
        rgb: "rgb(22, 20, 18)",
        role: "Frosted glass container surface, elevated card backgrounds"
      },
      warm_alabaster: {
        hex: "#FAF7F2",
        rgb: "rgb(250, 247, 242)",
        role: "Light editorial mode, stationery, invoices, print paper stock"
      },
      obsidian_ink: {
        hex: "#1A1715",
        rgb: "rgb(26, 23, 21)",
        role: "Typography on light backgrounds"
      }
    },
    ui_tokens: {
      border_subtle: "rgba(226, 199, 153, 0.16)",
      border_hover: "rgba(226, 199, 153, 0.42)",
      glass_bg: "rgba(22, 20, 18, 0.65)",
      glow_radial: "radial-gradient(ellipse at top, rgba(226, 199, 153, 0.12) 0%, transparent 70%)"
    }
  };

  fs.writeFileSync(path.join(COLOR_DIR, 'polish-colors.json'), JSON.stringify(paletteTokens, null, 2), 'utf8');

  const cssTokens = `:root {
  /* POLISH Media Co. — Haute Atelier Color Tokens v2.0 */
  --brand-gold: #E2C799;
  --brand-platinum: #F5E6D3;
  --brand-bronze: #C5A880;
  
  --bg-noir: #080706;
  --surface-charcoal: #161412;
  --surface-alabaster: #FAF7F2;
  --text-ink: #1A1715;

  /* Specular Borders & Glass */
  --border-specular: 1px solid rgba(226, 199, 153, 0.16);
  --border-specular-active: 1px solid rgba(226, 199, 153, 0.42);
  --glass-card: rgba(22, 20, 18, 0.65);
  --glass-blur: blur(20px);
}
`;
  fs.writeFileSync(path.join(COLOR_DIR, 'polish-colors.css'), cssTokens, 'utf8');

  // Palette Swatches Vector & PNG
  const swatchesSvg = createPaletteSwatchesSvg();
  fs.writeFileSync(path.join(COLOR_DIR, 'polish-palette-swatches.svg'), swatchesSvg, 'utf8');
  await sharp(Buffer.from(swatchesSvg))
    .resize(2400, null)
    .png({ quality: 95 })
    .toFile(path.join(COLOR_DIR, 'polish-palette-swatches.png'));

  // E. Typography Specifications
  console.log('✨ [Brand Pack] Writing Typography Specifications...');
  const typoGuide = `# POLISH Media Co. — Typography Hierarchy & Specifications

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
- **RTL Typography Rule**: Never apply serif italics to Arabic text. Under \`[dir="rtl"]\`, accent spans automatically render in \`Tajawal\` normal posture.

---

## 2. Typographic Scale & Cadence

| Token | Desktop Size | Mobile Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| \`--font-size-hero\` | \`clamp(52px, 5.8vw, 84px)\` | 42px | 800 | 1.06 | \`-0.022em\` | Main Landing Page Hero |
| \`--font-size-h1\` | \`clamp(38px, 4.2vw, 56px)\` | 32px | 800 | 1.12 | \`-0.018em\` | Major Section Headlines |
| \`--font-size-h2\` | \`clamp(28px, 3.0vw, 40px)\` | 24px | 700 | 1.20 | \`-0.012em\` | Card Headings, Agitation Bottlenecks |
| \`--font-size-h3\` | \`clamp(20px, 2.2vw, 26px)\` | 19px | 600 | 1.28 | \`-0.008em\` | Pillar Names, Case Study Titles |
| \`--font-size-body\` | \`16px\` | 15px | 400 | 1.68 | \`0em\` | Body copy, narrative paragraphs |
| \`--font-size-small\` | \`13px\` | 12px | 500 | 1.50 | \`+0.02em\` | Captions, footnotes, table headers |
| \`--font-size-eyebrow\` | \`12px\` | 11px | 700 | 1.00 | \`+0.16em\` | Uppercase section badges and tags |

---

## 3. Tabular Numerals Requirement

For all revenue figures, ROI multiples, and step counters:
\`\`\`css
font-variant-numeric: tabular-nums lining-nums;
letter-spacing: -0.02em;
\`\`\`
This prevents horizontal jitter when values transition and maintains strict vertical alignment.

---

## 4. Google Fonts Embed Code
\`\`\`html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@1,500;1,600;1,700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
\`\`\`
`;
  fs.writeFileSync(path.join(TYPO_DIR, 'TYPOGRAPHY_SPECIFICATIONS.md'), typoGuide, 'utf8');

  // F. Comprehensive Brand Guidelines Document
  console.log('✨ [Brand Pack] Writing Comprehensive Brand Guidelines Book...');
  const brandBook = `# POLISH Media Co. — Official Brand Guidelines & Standards Book (v2.0)

**Entity**: POLISH Media Co. (\`polishmediaco.com\`)  
**Headquarters**: Paris • New York • Dubai • Zürich  
**Version**: 2.0 (Haute Atelier Evolution)  
**Date**: September 2026

---

## 1. Brand Essence & Strategic Positioning

### Mission
To engineer predictable, eight-figure growth for clinical skincare laboratories, haute parfumerie houses, and luxury cosmetic founders through algorithmic direct-to-consumer acquisition, clinical scientific validation, and Parisian aesthetic mastery.

### Brand Archetype: The Elite Cosmetic Architect
POLISH is not a generic digital agency. We operate as a private creative accelerator and mathematical growth atelier. Our aesthetic combines:
1. **Haute Parfumerie Grandeur**: Tactile, editorial elegance inspired by Parisian fragrance salons and vintage botanical compendiums.
2. **Clinical Formulation Precision**: High-contrast, mathematically balanced, scientific typography and tabular data.
3. **Algorithmic Velocity**: Lightning-fast digital interfaces, instant user response, and high-ticket conversion funnels.

---

## 2. Logo System & Architecture

### The Signature Mark (Monogram)
The POLISH emblem fuses two core concepts:
- **Upward 45° Kinetic Arrow**: Velocity, compounding enterprise valuation, and client scale.
- **Faceted Diamond & Cosmetic Dropper**: Precision liquid formulation, purity, and cosmetic polish.

### Clear Space Rule
Always maintain an isolation zone around the logo equal to at least **1X**, where $X$ is the height of the faceted diamond droplet. No text, graphic elements, or borders may intrude into this zone.

### Minimum Reproducible Sizes
- **Digital Screen**:
  - Horizontal Logo: Minimum width **120px**
  - Vertical Logo: Minimum width **80px**
  - Standalone Mark: Minimum width **24px**
- **Physical Print**:
  - Horizontal Logo: Minimum width **35mm**
  - Vertical Logo: Minimum width **22mm**
  - Standalone Mark: Minimum width **8mm**

### Logo Don'ts (Strict Violations)
- ❌ **Do not stretch, squeeze, or skew** the logo in any axis.
- ❌ **Do not place cyan, magenta, or neon colors** on any logo asset (legacy colors are permanently deprecated).
- ❌ **Do not add heavy drop shadows** or outer glow filters outside approved CSS tokens.
- ❌ **Do not place the gold logo on low-contrast light backgrounds** (always use \`polish-logo-*-dark\` or \`*-black\` on light paper).
- ❌ **Do not re-typeset or change the font** of the POLISH wordmark.

---

## 3. Color Hierarchy & Specifications

| Color Name | Hex | RGB | CMYK | Pantone (Approx) | Primary Application |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Haute Champagne Gold** | \`#E2C799\` | \`226, 199, 153\` | \`0, 12, 32, 11\` | Pantone 467 C | Primary metallic mark, CTAs, hero accents |
| **Cashmere Platinum** | \`#F5E6D3\` | \`245, 230, 211\` | \`0, 6, 14, 4\` | Pantone 7527 C | Primary headline text, bright highlights |
| **Atelier Bronze** | \`#C5A880\` | \`197, 168, 128\` | \`0, 15, 35, 23\` | Pantone 465 C | Gradient base, secondary subtitles |
| **Deep Obsidian Noir** | \`#080706\` | \`8, 7, 6\` | \`0, 14, 25, 97\` | Process Black | Dark background canvas, negative space |
| **Satin Charcoal** | \`#161412\` | \`22, 20, 18\` | \`0, 9, 18, 91\` | Pantone Black 7 C | Glassmorphism card surfaces |
| **Warm Alabaster** | \`#FAF7F2\` | \`250, 247, 242\` | \`0, 1, 3, 2\` | Pantone 11-0601 | Stationery, invoice backgrounds, light mode |

---

## 4. Typography Rules & Hierarchy

1. **Dual-Voice Headlines**: Pair structural bold sans-serif with a gold italic serif accent on the climactic phrase:
   - *Example*: \`Architectural Formulas &amp; <span class="hero-serif-accent">Algorithmic Scale.</span>\`
2. **Never Italicize Arabic**: Arabic text utilizes \`Tajawal\` exclusively with standard geometric posture.
3. **Tabular Numeral Enactment**: All numeric metrics must declare \`font-variant-numeric: tabular-nums lining-nums\`.

---

## 5. Trilingual Code of Excellence

### English (Global B2B & Investor Voice)
- Tone: Direct, scientific, authoritative, high-yield.
- Core Vocabulary: *Formulation, Algorithmic Scale, Unit Economics, Clinical Proof, Meridian, Velocity.*

### French (Haute Beauté & Heritage Voice)
- Tone: Poetic, prestigious, uncompromising artisanal standards.
- Core Vocabulary: *Haute Cosmétologie, Savoir-Faire d'Exception, Rétention &amp; Acquisition, Écrin de Luxe.*

### Arabic (Gulf Prestige & Private Office Voice)
- Tone: Honorable, elite, architectural, welcoming.
- Core Vocabulary: *صياغة التميز التجميلي, أرقى علامات الجمال, شراكات النمو الاستراتيجي.*

---

## 6. Asset Directory Inventory

\`\`\`
brand-pack/
├── 01_logos/
│   ├── polish-logo-horizontal-gold.svg / .png
│   ├── polish-logo-horizontal-dark.svg / .png
│   ├── polish-logo-horizontal-white.svg / .png
│   ├── polish-logo-horizontal-black.svg / .png
│   ├── polish-logo-vertical-gold.svg / .png
│   ├── polish-logo-vertical-dark.svg / .png
│   ├── polish-logo-vertical-white.svg / .png
│   ├── polish-logo-vertical-black.svg / .png
│   ├── polish-mark-gold.svg / .png (512, 1024, 2048px)
│   ├── polish-mark-dark.svg / .png
│   ├── polish-mark-white.svg / .png
│   ├── polish-mark-black.svg / .png
│   └── polish-mark-squircle-gold.svg / .png
├── 02_favicons_and_icons/
│   ├── favicon.svg, favicon-16x16, 32x32, 48x48
│   ├── apple-touch-icon-180x180.png
│   ├── android-chrome-192x192, 512x512
│   └── site.webmanifest
├── 03_social_assets/
│   ├── twitter-x-header-1500x500.png
│   ├── linkedin-banner-1584x396.png
│   ├── instagram-profile-1080x1080.png
│   └── og-social-card-1200x630.png
├── 04_color_palette/
│   ├── polish-colors.json
│   ├── polish-colors.css
│   ├── polish-palette-swatches.svg
│   └── polish-palette-swatches.png
├── 05_typography/
│   └── TYPOGRAPHY_SPECIFICATIONS.md
├── 06_guidelines/
│   └── POLISH_BRAND_GUIDELINES.md
└── POLISH_Media_Co_Brand_Pack.zip
\`\`\`
`;

  fs.writeFileSync(path.join(GUIDE_DIR, 'POLISH_BRAND_GUIDELINES.md'), brandBook, 'utf8');
  fs.writeFileSync(path.join(BASE_DIR, 'docs', 'brand-guidelines.md'), brandBook, 'utf8');

  // G. Package Complete ZIP Archive
  console.log('✨ [Brand Pack] Bundling complete POLISH_Media_Co_Brand_Pack.zip...');
  const zipPath = path.join(PACK_DIR, 'POLISH_Media_Co_Brand_Pack.zip');
  if (fs.existsSync(zipPath)) {
    fs.unlinkSync(zipPath);
  }

  // Use macOS zip utility to create clean zip archive
  try {
    execSync(`cd "${PACK_DIR}" && zip -r "POLISH_Media_Co_Brand_Pack.zip" 01_logos 02_favicons_and_icons 03_social_assets 04_color_palette 05_typography 06_guidelines -x "*.DS_Store"`, { stdio: 'inherit' });
    console.log(`  ✓ Successfully built archive: ${zipPath}`);

    // Also copy zip to public/assets for easy web routing
    fs.copyFileSync(zipPath, path.join(BASE_DIR, 'public', 'assets', 'POLISH_Media_Co_Brand_Pack.zip'));
  } catch (err) {
    console.error('Error creating zip bundle:', err);
  }

  console.log('🎉 [Brand Pack] Brand Suite Generation Complete!');
}

buildBrandPack().catch(err => {
  console.error('Fatal Brand Pack generation error:', err);
  process.exit(1);
});
