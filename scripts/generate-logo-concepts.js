/**
 * POLISH Media Co. — Logo Redesign Exploration Generator
 * Generates vector SVGs and retina PNGs for 5 distinct Haute Atelier logo concepts,
 * complete with wordmark lockups, scale tests, and cosmetic packaging mockups.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const BASE_DIR = path.resolve(__dirname, '..');
const CONCEPTS_DIR = path.join(BASE_DIR, 'public', 'logo-concepts');
const MOCKUPS_DIR = path.join(CONCEPTS_DIR, 'mockups');

// Ensure directories exist
['concept-1', 'concept-2', 'concept-3', 'concept-4', 'concept-5'].forEach(c => {
  fs.mkdirSync(path.join(CONCEPTS_DIR, c), { recursive: true });
});
fs.mkdirSync(MOCKUPS_DIR, { recursive: true });

// Shared SVG Definitions (Haute Atelier Champagne Gold Gradients & Luxury Specular Lighting)
const SVG_DEFS = `
  <defs>
    <!-- Primary Haute Champagne Gold Gradient -->
    <linearGradient id="goldGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#C5A880"/>
      <stop offset="35%" stop-color="#E2C799"/>
      <stop offset="70%" stop-color="#F5E6D3"/>
      <stop offset="100%" stop-color="#E2C799"/>
    </linearGradient>

    <!-- Specular Highlight Sheen Gradient -->
    <linearGradient id="goldGradSheen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.95"/>
      <stop offset="25%" stop-color="#F5E6D3"/>
      <stop offset="70%" stop-color="#E2C799"/>
      <stop offset="100%" stop-color="#A88B60"/>
    </linearGradient>

    <!-- Deep Atelier Bronze for Shading / Under-ribbon -->
    <linearGradient id="bronzeShade" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#A88B60"/>
      <stop offset="50%" stop-color="#806742"/>
      <stop offset="100%" stop-color="#544328"/>
    </linearGradient>

    <!-- Multi-Angle Facet Gradients for Concept 3 -->
    <linearGradient id="facetTop" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E2C799"/>
    </linearGradient>
    <linearGradient id="facetLeft" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#E2C799"/>
      <stop offset="100%" stop-color="#9C7F56"/>
    </linearGradient>
    <linearGradient id="facetRight" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F5E6D3"/>
      <stop offset="100%" stop-color="#C5A880"/>
    </linearGradient>
    <linearGradient id="facetCenter" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FBF3E8"/>
      <stop offset="50%" stop-color="#E2C799"/>
      <stop offset="100%" stop-color="#B89668"/>
    </linearGradient>

    <!-- Obsidian Surface Gradient -->
    <linearGradient id="obsidianSurface" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#161412"/>
      <stop offset="100%" stop-color="#080706"/>
    </linearGradient>

    <!-- Fonts -->
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@700;800&amp;family=Cormorant+Garamond:ital,wght@1,600&amp;display=swap');
      .brand-title { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 800; }
      .brand-sub { font-family: 'Plus Jakarta Sans', sans-serif; font-weight: 600; }
    </style>
  </defs>
`;

// ============================================================================
// CONCEPT MARK GEOMETRY DEFINITIONS (Centered in 100x100 viewBox)
// ============================================================================

/**
 * Concept 1: The Golden Ratio Pipette (Precision Evolution)
 * Refined 45° upward velocity vector with golden-ratio continuous taper and an optically locked diamond droplet.
 */
function getMarkConcept1(fill = 'url(#goldGrad1)') {
  return `
    <!-- Concept 1: The Golden Ratio Pipette -->
    <g id="mark-c1">
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
      <rect x="18.5" y="77.5" width="5.5" height="5.5" rx="1.2" transform="rotate(45 21.25 80.25)" fill="#F5E6D3"/>
    </g>
  `;
}

/**
 * Concept 2: The Maison "P" Monogram Crest (Architectural Atelier)
 * Capital letter 'P' with 45° ascending growth vector stem, enclosing a suspended diamond droplet in the loop.
 */
function getMarkConcept2(fill = 'url(#goldGrad1)') {
  return `
    <!-- Concept 2: The Maison 'P' Crest -->
    <g id="mark-c2">
      <!-- Architectural Monogram 'P' with 45° Velocity Apex -->
      <path d="M 26 78 
               L 26 44 
               C 26 42 27 40 29 38 
               L 56 16 
               C 58 14 62 15 63 18 
               L 64 26 
               C 66 26 70 27 74 30 
               C 80 35 83 43 82 51 
               C 81 59 75 66 66 68 
               C 62 69 58 69 54 69 
               L 36 69 
               L 36 78 
               C 36 81 33 83 31 83 
               C 28 83 26 81 26 78 Z 
               M 36 34 
               L 36 59 
               L 54 59 
               C 60 59 65 57 69 53 
               C 72 49 72 43 70 39 
               C 67 35 63 33 58 33 
               L 42 33 
               C 39 33 37 33 36 34 Z" 
            fill="${fill}" fill-rule="evenodd"/>
      
      <!-- Suspended Faceted Diamond Droplet in Counter-Space -->
      <g transform="translate(52, 46)">
        <polygon points="0,-9 7,0 0,9 -7,0" fill="url(#goldGradSheen)"/>
        <!-- Inner Specular Core -->
        <polygon points="0,-4 3,0 0,4 -3,0" fill="#FFFFFF" opacity="0.9"/>
      </g>
    </g>
  `;
}

/**
 * Concept 3: The Solitaire Diamond Facet (Crystalline & Perfume Flacon)
 * Geometric diamond facets that ascend upward into a crystal prism and perfume stopper silhouette.
 */
function getMarkConcept3() {
  return `
    <!-- Concept 3: Solitaire Facet & Flacon Stopper -->
    <g id="mark-c3">
      <!-- Outer Hexagonal / Solitaire Prism Contour -->
      <!-- Top Apex Triangle -->
      <polygon points="50,14 74,36 26,36" fill="url(#facetTop)"/>
      
      <!-- Left Specular Facet -->
      <polygon points="26,36 50,54 18,66 18,52" fill="url(#facetLeft)"/>
      
      <!-- Right Specular Facet -->
      <polygon points="74,36 82,52 82,66 50,54" fill="url(#facetRight)"/>
      
      <!-- Center Brilliant Table Facet -->
      <polygon points="50,36 74,36 50,54 26,36" fill="url(#facetCenter)"/>
      
      <!-- Lower Ascending Pavilion (Growth Vector) -->
      <polygon points="50,54 82,66 50,86 18,66" fill="url(#goldGrad1)"/>
      
      <!-- Central Floating Diamond Star Sparkle -->
      <polygon points="50,44 53,52 61,54 53,56 50,64 47,56 39,54 47,52" fill="#FFFFFF" opacity="0.9"/>
    </g>
  `;
}

/**
 * Concept 4: The Liquid Silk Möbius Ribbon (Kinetic Elegance)
 * 3D continuous loop evoking cosmetic formulation, liquid silk emulsion, and infinite growth.
 */
function getMarkConcept4() {
  return `
    <!-- Concept 4: Liquid Silk Möbius Ribbon -->
    <g id="mark-c4">
      <!-- Shadow / Underside Ribbon Layer -->
      <path d="M 28 66 
               C 34 52 46 38 60 26 
               C 66 21 74 20 78 24 
               C 82 28 81 36 76 44 
               C 69 54 58 64 46 72 
               L 36 78 
               L 28 66 Z" 
            fill="url(#bronzeShade)"/>
      
      <!-- Front Fluid Ribbon Layer (Light-Catching Surface) -->
      <path d="M 22 76 
               C 26 70 34 58 44 46 
               C 54 34 68 22 76 18 
               C 80 16 83 18 84 22 
               C 85 26 82 32 78 38 
               C 70 48 58 60 48 70 
               C 42 76 36 82 30 84 
               C 24 86 20 82 22 76 Z" 
            fill="url(#goldGradSheen)"/>

      <!-- Ascending Growth Pipette Tip -->
      <path d="M 76 18 L 84 22 L 80 30 L 72 26 Z" fill="#FFFFFF" opacity="0.8"/>
      
      <!-- Liquid Droplet Essence -->
      <ellipse cx="62" cy="48" rx="5" ry="7" transform="rotate(35 62 48)" fill="url(#goldGrad1)"/>
    </g>
  `;
}

/**
 * Concept 5: The Celestial Cosmetic Eclipse (Quiet Luxury)
 * Two precision concentric crescent blades converging along a 45° trajectory around a radiant diamond droplet.
 */
function getMarkConcept5() {
  return `
    <!-- Concept 5: Celestial Cosmetic Eclipse -->
    <g id="mark-c5">
      <!-- Outer Concentric Precision Crescent Blade -->
      <path d="M 20 76 
               C 16 66 18 52 26 38 
               C 36 22 52 14 68 14 
               C 76 14 82 16 84 20 
               C 85 23 82 26 78 26 
               C 64 26 50 34 40 46 
               C 32 56 28 68 30 76 
               C 30 80 26 82 23 81 
               C 21 80 20 78 20 76 Z" 
            fill="url(#goldGrad1)"/>
      
      <!-- Inner Dynamic Crescent Blade -->
      <path d="M 38 78 
               C 36 72 38 64 44 54 
               C 50 44 60 38 72 36 
               C 76 35 80 37 81 40 
               C 82 43 79 45 76 46 
               C 66 48 58 54 52 62 
               C 48 68 46 74 46 78 
               C 46 81 43 83 40 82 
               C 38 81 38 80 38 78 Z" 
            fill="url(#goldGradSheen)"/>

      <!-- Radiant Diamond Core -->
      <g transform="translate(64, 52)">
        <polygon points="0,-10 7,0 0,10 -7,0" fill="url(#goldGradSheen)"/>
        <circle cx="0" cy="0" r="2.5" fill="#FFFFFF"/>
      </g>
    </g>
  `;
}

// ============================================================================
// SVG TEMPLATES (Standalone Mark, Horizontal Lockup, Vertical Stacked)
// ============================================================================

function createStandaloneMarkSvg(conceptNum, hasDarkBg = false) {
  const bg = hasDarkBg ? `<rect width="100%" height="100%" fill="#080706"/>` : '';
  let markSnippet = '';
  if (conceptNum === 1) markSnippet = getMarkConcept1();
  if (conceptNum === 2) markSnippet = getMarkConcept2();
  if (conceptNum === 3) markSnippet = getMarkConcept3();
  if (conceptNum === 4) markSnippet = getMarkConcept4();
  if (conceptNum === 5) markSnippet = getMarkConcept5();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="500" height="500">
  ${SVG_DEFS}
  ${bg}
  ${markSnippet}
</svg>`;
}

function createHorizontalLockupSvg(conceptNum, hasDarkBg = false) {
  const bg = hasDarkBg ? `<rect width="100%" height="100%" fill="#080706"/>` : '';
  let markSnippet = '';
  if (conceptNum === 1) markSnippet = getMarkConcept1();
  if (conceptNum === 2) markSnippet = getMarkConcept2();
  if (conceptNum === 3) markSnippet = getMarkConcept3();
  if (conceptNum === 4) markSnippet = getMarkConcept4();
  if (conceptNum === 5) markSnippet = getMarkConcept5();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 180" width="760" height="180">
  ${SVG_DEFS}
  ${bg}
  <!-- Mark on Left -->
  <g transform="translate(40, 25) scale(1.3)">
    ${markSnippet}
  </g>
  <!-- Architectural Wordmark POLISH -->
  <text x="210" y="105" 
        class="brand-title"
        font-size="62" 
        letter-spacing="9" 
        fill="url(#goldGradSheen)">POLISH</text>
  <!-- Subtitle MEDIA CO -->
  <text x="212" y="142" 
        class="brand-sub"
        font-size="14" 
        letter-spacing="8.5" 
        fill="#C5A880">MEDIA CO</text>
</svg>`;
}

function createVerticalLockupSvg(conceptNum, hasDarkBg = false) {
  const bg = hasDarkBg ? `<rect width="100%" height="100%" fill="#080706"/>` : '';
  let markSnippet = '';
  if (conceptNum === 1) markSnippet = getMarkConcept1();
  if (conceptNum === 2) markSnippet = getMarkConcept2();
  if (conceptNum === 3) markSnippet = getMarkConcept3();
  if (conceptNum === 4) markSnippet = getMarkConcept4();
  if (conceptNum === 5) markSnippet = getMarkConcept5();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 520" width="600" height="520">
  ${SVG_DEFS}
  ${bg}
  <!-- Centered Mark on Top -->
  <g transform="translate(180, 50) scale(2.4)">
    ${markSnippet}
  </g>
  <!-- Architectural Wordmark POLISH -->
  <text x="300" y="375" 
        class="brand-title"
        font-size="76" 
        letter-spacing="12" 
        text-anchor="middle"
        fill="url(#goldGradSheen)">POLISH</text>
  <!-- Subtitle MEDIA CO -->
  <text x="300" y="435" 
        class="brand-sub"
        font-size="16" 
        letter-spacing="12" 
        text-anchor="middle"
        fill="#C5A880">MEDIA CO</text>
</svg>`;
}

// ============================================================================
// COSMETIC PACKAGING MOCKUP GENERATOR
// ============================================================================

/**
 * Generates a realistic vector SVG mockup of a luxury amber cosmetic dropper bottle with gold foil branding.
 */
function createDropperBottleMockupSvg(conceptNum) {
  let markSnippet = '';
  if (conceptNum === 1) markSnippet = getMarkConcept1();
  if (conceptNum === 2) markSnippet = getMarkConcept2();
  if (conceptNum === 3) markSnippet = getMarkConcept3();
  if (conceptNum === 4) markSnippet = getMarkConcept4();
  if (conceptNum === 5) markSnippet = getMarkConcept5();

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  ${SVG_DEFS}
  <!-- Luxury Noir Atelier Studio Backdrop -->
  <rect width="800" height="800" fill="#0A0908"/>
  <circle cx="400" cy="450" r="320" fill="#E2C799" opacity="0.04" filter="blur(60px)"/>
  
  <!-- Studio Floor Shadow Reflection -->
  <ellipse cx="400" cy="710" rx="180" ry="24" fill="#040303" filter="blur(16px)"/>

  <!-- Amber Glass Dropper Bottle Body -->
  <defs>
    <linearGradient id="amberGlass" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1F150A"/>
      <stop offset="25%" stop-color="#4A2F12"/>
      <stop offset="50%" stop-color="#2D1A07"/>
      <stop offset="75%" stop-color="#543615"/>
      <stop offset="100%" stop-color="#140C04"/>
    </linearGradient>
    <linearGradient id="goldCollar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#A88B60"/>
      <stop offset="30%" stop-color="#F5E6D3"/>
      <stop offset="70%" stop-color="#E2C799"/>
      <stop offset="100%" stop-color="#806742"/>
    </linearGradient>
  </defs>

  <!-- Bottle Shoulder & Cylinder -->
  <path d="M 280 700 
           L 280 340 
           C 280 290 330 265 370 260 
           L 370 230 
           L 430 230 
           L 430 260 
           C 470 265 520 290 520 340 
           L 520 700 
           C 520 715 505 725 400 725 
           C 295 725 280 715 280 700 Z" 
        fill="url(#amberGlass)" stroke="rgba(226, 199, 153, 0.2)" stroke-width="1.5"/>

  <!-- Specular Glass Highlights (Vertical Sheen) -->
  <path d="M 300 350 L 300 680" stroke="rgba(255, 255, 255, 0.12)" stroke-width="6" stroke-linecap="round" filter="blur(2px)"/>
  <path d="M 500 350 L 500 680" stroke="rgba(255, 255, 255, 0.08)" stroke-width="3" stroke-linecap="round"/>

  <!-- Metallic Gold Dropper Collar -->
  <rect x="360" y="195" width="80" height="40" rx="3" fill="url(#goldCollar)"/>
  <line x1="360" y1="215" x2="440" y2="215" stroke="rgba(0,0,0,0.4)" stroke-width="1"/>

  <!-- Silicone Bulb Pipette -->
  <path d="M 375 195 C 375 140 425 140 425 195 Z" fill="#141210" stroke="#25211D" stroke-width="2"/>

  <!-- Label Surface: Matte Frosted Obsidian Label -->
  <rect x="310" y="380" width="180" height="260" rx="8" fill="#12100E" stroke="rgba(226, 199, 153, 0.25)" stroke-width="1"/>

  <!-- Gold Foil Logo Imprint on Label -->
  <g transform="translate(365, 415) scale(0.7)">
    ${markSnippet}
  </g>
  <text x="400" y="525" class="brand-title" font-size="20" letter-spacing="4" text-anchor="middle" fill="url(#goldGradSheen)">POLISH</text>
  <text x="400" y="545" class="brand-sub" font-size="7" letter-spacing="3" text-anchor="middle" fill="#C5A880">MEDIA CO</text>

  <!-- Label Subtext -->
  <line x1="350" y1="565" x2="450" y2="565" stroke="rgba(226, 199, 153, 0.2)" stroke-width="0.75"/>
  <text x="400" y="585" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="600" letter-spacing="2" text-anchor="middle" fill="rgba(245, 230, 211, 0.7)">ELIXIR D'ÉCHELLE</text>
  <text x="400" y="605" font-family="'Cormorant Garamond', serif" font-style="italic" font-size="11" text-anchor="middle" fill="#E2C799">Haute Beauté &amp; Growth</text>
  <text x="400" y="625" font-family="'Plus Jakarta Sans', sans-serif" font-size="6" letter-spacing="1.5" text-anchor="middle" fill="rgba(245, 230, 211, 0.4)">50 ML  •  1.7 FL. OZ.</text>
</svg>`;
}

// ============================================================================
// MAIN GENERATOR EXECUTION
// ============================================================================

async function generateAllConcepts() {
  console.log('✨ [Logo Suite] Initializing 5 Haute Atelier Logo Redesign Concepts...');

  const concepts = [
    { id: 1, name: 'Golden Ratio Pipette', folder: 'concept-1' },
    { id: 2, name: 'Maison P Monogram', folder: 'concept-2' },
    { id: 3, name: 'Solitaire Facet', folder: 'concept-3' },
    { id: 4, name: 'Liquid Silk Möbius', folder: 'concept-4' },
    { id: 5, name: 'Celestial Eclipse', folder: 'concept-5' }
  ];

  for (const c of concepts) {
    console.log(`\n🎨 Generating Concept ${c.id}: ${c.name}...`);
    const cDir = path.join(CONCEPTS_DIR, c.folder);

    // 1. Standalone Mark (SVG + PNG 1024px, 512px, 64px, 32px)
    const markSvg = createStandaloneMarkSvg(c.id);
    const markDarkSvg = createStandaloneMarkSvg(c.id, true);
    fs.writeFileSync(path.join(cDir, `mark-${c.folder}.svg`), markSvg, 'utf8');
    fs.writeFileSync(path.join(cDir, `mark-${c.folder}-dark-bg.svg`), markDarkSvg, 'utf8');

    await sharp(Buffer.from(markSvg)).resize(1024, 1024).png().toFile(path.join(cDir, `mark-${c.folder}-1024px.png`));
    await sharp(Buffer.from(markSvg)).resize(512, 512).png().toFile(path.join(cDir, `mark-${c.folder}-512px.png`));
    await sharp(Buffer.from(markSvg)).resize(64, 64).png().toFile(path.join(cDir, `mark-${c.folder}-64px.png`));
    await sharp(Buffer.from(markSvg)).resize(32, 32).png().toFile(path.join(cDir, `mark-${c.folder}-32px.png`));

    // 2. Horizontal Lockup (SVG + PNG 2000px, 1000px)
    const horizSvg = createHorizontalLockupSvg(c.id);
    fs.writeFileSync(path.join(cDir, `logo-horizontal-${c.folder}.svg`), horizSvg, 'utf8');
    await sharp(Buffer.from(horizSvg)).resize(2000, null).png().toFile(path.join(cDir, `logo-horizontal-${c.folder}-2000px.png`));
    await sharp(Buffer.from(horizSvg)).resize(1000, null).png().toFile(path.join(cDir, `logo-horizontal-${c.folder}-1000px.png`));

    // 3. Vertical Stacked Lockup (SVG + PNG 2000px, 1000px)
    const vertSvg = createVerticalLockupSvg(c.id);
    fs.writeFileSync(path.join(cDir, `logo-vertical-${c.folder}.svg`), vertSvg, 'utf8');
    await sharp(Buffer.from(vertSvg)).resize(2000, null).png().toFile(path.join(cDir, `logo-vertical-${c.folder}-2000px.png`));

    // 4. Cosmetic Packaging Mockup (Dropper Bottle)
    const mockupSvg = createDropperBottleMockupSvg(c.id);
    fs.writeFileSync(path.join(MOCKUPS_DIR, `mockup-dropper-${c.folder}.svg`), mockupSvg, 'utf8');
    await sharp(Buffer.from(mockupSvg)).resize(800, 800).png().toFile(path.join(MOCKUPS_DIR, `mockup-dropper-${c.folder}.png`));

    console.log(`  ✓ Created vector SVGs, retina PNGs, and cosmetic dropper bottle mockup for ${c.name}`);
  }

  console.log('\n🎉 [Logo Suite] All 5 Logo Concepts & Mockups Successfully Generated!');
}

generateAllConcepts().catch(err => {
  console.error('Fatal Logo Generator error:', err);
  process.exit(1);
});
