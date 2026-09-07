/**
 * POLISH Media Co. — Comprehensive Social Media Profile Picture Suite Generator
 * Generates pixel-perfect, platform-calibrated profile pictures with circular safe zones,
 * specular bevel borders, multiple aesthetic editions (Obsidian, Beveled, Alabaster, Transparent),
 * and high-resolution PNG/SVG exports.
 */

const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const { execSync } = require('child_process');

const BASE_DIR = '/Users/Shared/polishmedia';
const SOCIAL_DIR = path.join(BASE_DIR, 'public', 'brand-pack', '03_social_assets');
const AVATAR_DIR = path.join(SOCIAL_DIR, 'profile_pictures');
const PLATFORM_DIR = path.join(AVATAR_DIR, '01_platform_specific');
const EDITIONS_DIR = path.join(AVATAR_DIR, '02_style_editions');

[AVATAR_DIR, PLATFORM_DIR, EDITIONS_DIR].forEach(dir => {
  fs.mkdirSync(dir, { recursive: true });
});

// Brand Palette Tokens
const COLORS = {
  gold: '#E2C799',
  goldLight: '#F5E6D3',
  bronze: '#C5A880',
  noir: '#080706',
  surface: '#0E0C0A',
  alabaster: '#FAF7F2',
  alabasterDark: '#F0EBE1',
  bronzeDark: '#8C6F48'
};

// SVG Definitions for Luxury Shading
function getSvgDefs(isLight = false) {
  if (isLight) {
    return `
      <defs>
        <linearGradient id="bronzeGoldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#8C6F48"/>
          <stop offset="50%" stop-color="#AA8858"/>
          <stop offset="100%" stop-color="#C5A880"/>
        </linearGradient>
        <radialGradient id="ambientGlowLight" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#C5A880" stop-opacity="0.12"/>
          <stop offset="70%" stop-color="#C5A880" stop-opacity="0.03"/>
          <stop offset="100%" stop-color="#C5A880" stop-opacity="0"/>
        </radialGradient>
      </defs>
    `;
  }
  return `
    <defs>
      <linearGradient id="champagneGoldGrad" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#C5A880"/>
        <stop offset="42%" stop-color="#E2C799"/>
        <stop offset="75%" stop-color="#F5E6D3"/>
        <stop offset="100%" stop-color="#E2C799"/>
      </linearGradient>
      <radialGradient id="ambientGlowDark" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#E2C799" stop-opacity="0.18"/>
        <stop offset="55%" stop-color="#E2C799" stop-opacity="0.04"/>
        <stop offset="100%" stop-color="#E2C799" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="beveledBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F5E6D3" stop-opacity="0.65"/>
        <stop offset="50%" stop-color="#E2C799" stop-opacity="0.25"/>
        <stop offset="100%" stop-color="#C5A880" stop-opacity="0.55"/>
      </linearGradient>
    </defs>
  `;
}

// Golden Ratio Pipette Mark
function getPipetteMark(fill, coreFill) {
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
      <rect x="18.5" y="77.5" width="5.5" height="5.5" rx="1.2" transform="rotate(45 21.25 80.25)" fill="${coreFill}"/>
    </g>
  `;
}

/**
 * Generate Avatar SVG
 * @param {Object} options
 * @param {number} options.size - Square dimensions (e.g. 1080)
 * @param {string} options.theme - 'obsidian' | 'beveled' | 'alabaster' | 'transparent'
 * @param {number} options.scale - Mark scale factor
 * @param {boolean} options.hasRing - Include specular border ring
 */
function createAvatarSvg({ size = 1080, theme = 'obsidian', scale = null, hasRing = false }) {
  const isLight = theme === 'alabaster';
  const isTransparent = theme === 'transparent';
  const defs = getSvgDefs(isLight);

  const bgFill = isLight ? COLORS.alabaster : (isTransparent ? 'none' : COLORS.noir);
  const markFill = isLight ? 'url(#bronzeGoldGrad)' : 'url(#champagneGoldGrad)';
  const coreFill = isLight ? '#FDFBF7' : '#F5E6D3';

  // Mark scale: default scale fits nicely within circular crop with ~24% safe margin
  const markScale = scale || (size * 0.0056);
  const half = size / 2;
  const glowRadius = size * 0.44;

  let bgElements = '';
  if (!isTransparent) {
    bgElements += `<rect width="${size}" height="${size}" fill="${bgFill}"/>`;
    if (!isLight) {
      bgElements += `<circle cx="${half}" cy="${half}" r="${glowRadius}" fill="url(#ambientGlowDark)"/>`;
    } else {
      bgElements += `<circle cx="${half}" cy="${half}" r="${glowRadius}" fill="url(#ambientGlowLight)"/>`;
    }
  }

  // Specular Perimeter Bevel Ring (if requested or for beveled theme)
  let ringElement = '';
  if (hasRing || theme === 'beveled') {
    const ringRadius = (size / 2) - Math.max(4, size * 0.02);
    const strokeWidth = Math.max(2, Math.round(size * 0.0035));
    const strokeColor = isLight ? 'rgba(197, 168, 128, 0.45)' : 'url(#beveledBorderGrad)';
    ringElement = `<circle cx="${half}" cy="${half}" r="${ringRadius}" fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}"/>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  ${defs}
  ${bgElements}
  ${ringElement}
  <g transform="translate(${half}, ${half}) scale(${markScale}) translate(-50, -50)">
    ${getPipetteMark(markFill, coreFill)}
  </g>
</svg>`;
}

// Master Asset Definitions with Dimensions & Use Cases
const ASSET_SPECS = [
  // Platform-Specific Suite
  {
    category: 'platform',
    filename: '01_instagram_profile_1080x1080',
    title: 'Instagram Official Profile Picture',
    size: 1080,
    theme: 'beveled',
    hasRing: true,
    platform: 'Instagram',
    spec: '1080 × 1080 px (1:1 Ratio, Circular Crop Safe)',
    usecase: 'Official Instagram profile picture (@polishmedia.co). Formatted at native 1080px upload resolution with circular safe zone and specular gold rim.'
  },
  {
    category: 'platform',
    filename: '02_linkedin_company_logo_800x800',
    title: 'LinkedIn Company Page Logo (High-Res)',
    size: 800,
    theme: 'beveled',
    hasRing: true,
    platform: 'LinkedIn',
    spec: '800 × 800 px (1:1 Square/Squircle Crop)',
    usecase: 'Official LinkedIn Company Page avatar. Calibrated for crisp squircle display on desktop company headers and high-contrast recognition in mobile search.'
  },
  {
    category: 'platform',
    filename: '02_linkedin_company_logo_400x400',
    title: 'LinkedIn Company Page Logo (Standard)',
    size: 400,
    theme: 'beveled',
    hasRing: true,
    platform: 'LinkedIn',
    spec: '400 × 400 px (LinkedIn Minimum 300px+ Requirement)',
    usecase: 'Standard LinkedIn company profile upload. Ultra-sharp rendering at 48×48px and 32×32px in member news feeds.'
  },
  {
    category: 'platform',
    filename: '03_linkedin_executive_avatar_800x800',
    title: 'LinkedIn Executive & Founder Profile',
    size: 800,
    theme: 'obsidian',
    hasRing: true,
    platform: 'LinkedIn Personal',
    spec: '800 × 800 px (1:1 Circular Crop)',
    usecase: 'Personal LinkedIn profiles of agency founders, managing partners, and directors representing POLISH Media Co.'
  },
  {
    category: 'platform',
    filename: '04_x_twitter_profile_800x800',
    title: 'X / Twitter Profile Picture (High-Res)',
    size: 800,
    theme: 'beveled',
    hasRing: true,
    platform: 'X (Twitter)',
    spec: '800 × 800 px (1:1 Circular Crop Safe)',
    usecase: 'Official X (formerly Twitter) profile picture. Features 24% circular safe margin with specular rim so icon never blends into dark-mode X feeds.'
  },
  {
    category: 'platform',
    filename: '04_x_twitter_profile_400x400',
    title: 'X / Twitter Profile Picture (Standard 400px)',
    size: 400,
    theme: 'beveled',
    hasRing: true,
    platform: 'X (Twitter)',
    spec: '400 × 400 px (X Official Recommended Upload)',
    usecase: 'Official native recommendation size for Twitter/X profiles under 2MB.'
  },
  {
    category: 'platform',
    filename: '05_tiktok_profile_1080x1080',
    title: 'TikTok Brand Profile Picture',
    size: 1080,
    theme: 'beveled',
    hasRing: true,
    platform: 'TikTok',
    spec: '1080 × 1080 px (1:1 Circular Mobile View)',
    usecase: 'Official TikTok account profile avatar for POLISH UGC & cosmetics accelerator videos. High-luminance gold mark stands out over vibrant video feeds.'
  },
  {
    category: 'platform',
    filename: '06_youtube_channel_icon_800x800',
    title: 'YouTube Channel Icon',
    size: 800,
    theme: 'beveled',
    hasRing: true,
    platform: 'YouTube',
    spec: '800 × 800 px (1:1 Circular Display at 98×98 px)',
    usecase: 'YouTube brand channel profile picture. Engineered to remain razor-sharp in channel headers and video comment threads.'
  },
  {
    category: 'platform',
    filename: '07_facebook_page_avatar_800x800',
    title: 'Facebook Page Profile Picture',
    size: 800,
    theme: 'beveled',
    hasRing: true,
    platform: 'Facebook / Meta Business Suite',
    spec: '800 × 800 px (1:1 Circular Display on Desktop/Mobile)',
    usecase: 'Meta Business Suite & Facebook agency page avatar. Displays crisply across Meta Ads Manager, Instagram Cross-Post, and Messenger.'
  },
  {
    category: 'platform',
    filename: '08_whatsapp_business_avatar_640x640',
    title: 'WhatsApp Business VIP Concierge Avatar',
    size: 640,
    theme: 'beveled',
    hasRing: true,
    platform: 'WhatsApp Business',
    spec: '640 × 640 px (1:1 Circular Thumbnail at 40×40 px)',
    usecase: 'Official WhatsApp Business profile photo (+213 662 41 77 61). Optimized optical weight so the pipette and droplet are immediately recognized in WhatsApp chat lists.'
  },
  {
    category: 'platform',
    filename: '09_telegram_channel_avatar_640x640',
    title: 'Telegram Channel & Concierge Avatar',
    size: 640,
    theme: 'beveled',
    hasRing: true,
    platform: 'Telegram',
    spec: '640 × 640 px (1:1 Circular Avatar)',
    usecase: 'Official Telegram channel, founder community group, or VIP client support account.'
  },
  {
    category: 'platform',
    filename: '10_threads_profile_1080x1080',
    title: 'Threads Profile Picture',
    size: 1080,
    theme: 'beveled',
    hasRing: true,
    platform: 'Threads',
    spec: '1080 × 1080 px (1:1 Circular Crop)',
    usecase: 'Official Threads app profile photo linked with Instagram.'
  },
  {
    category: 'platform',
    filename: '11_pinterest_profile_800x800',
    title: 'Pinterest Profile Picture',
    size: 800,
    theme: 'beveled',
    hasRing: true,
    platform: 'Pinterest',
    spec: '800 × 800 px (1:1 Circular Crop)',
    usecase: 'Pinterest brand account for beauty packaging moodboards, campaign creative, and editorial curation.'
  },
  {
    category: 'platform',
    filename: '12_slack_discord_avatar_512x512',
    title: 'Slack Connect & Discord Server Icon',
    size: 512,
    theme: 'beveled',
    hasRing: true,
    platform: 'Slack / Discord',
    spec: '512 × 512 px (Square / Rounded Crop)',
    usecase: 'Client-facing Slack Connect channels, Discord founder community, and internal team workspaces.'
  },

  // Style Editions
  {
    category: 'edition',
    filename: 'style_edition_obsidian_noir_1080x1080',
    title: 'Signature Obsidian Noir Edition',
    size: 1080,
    theme: 'obsidian',
    hasRing: false,
    platform: 'Universal Flagship',
    spec: '1080 × 1080 px (Unbordered Pure Obsidian Ground)',
    usecase: 'The canonical brand dark mode avatar. Features pure Obsidian Noir (#080706) with champagne radial luminescence.'
  },
  {
    category: 'edition',
    filename: 'style_edition_specular_beveled_1080x1080',
    title: 'Haute Specular Beveled Edition',
    size: 1080,
    theme: 'beveled',
    hasRing: true,
    platform: 'Universal Dark Mode Safe',
    spec: '1080 × 1080 px (With Hairline Specular Gold Bezel)',
    usecase: 'Engineered specifically for OLED pure-black dark modes. The gold hairline perimeter prevents the avatar from blending into dark UI borders.'
  },
  {
    category: 'edition',
    filename: 'style_edition_warm_alabaster_1080x1080',
    title: 'Warm Alabaster Edition (Light Mode)',
    size: 1080,
    theme: 'alabaster',
    hasRing: true,
    platform: 'Editorial / Press / Light Mode',
    spec: '1080 × 1080 px (Warm Alabaster Ground #FAF7F2)',
    usecase: 'Light mode editorial features, press releases, magazine directories, and white-background media kits.'
  },
  {
    category: 'edition',
    filename: 'style_edition_transparent_badge_1080x1080',
    title: 'Transparent Alpha Cutout Badge',
    size: 1080,
    theme: 'transparent',
    hasRing: false,
    platform: 'Watermarks / Video Overlays / Stories',
    spec: '1080 × 1080 px (100% Transparent PNG)',
    usecase: 'For video reels, Instagram story watermarks, presentation slides, and custom design overlays on any colored background.'
  },
  {
    category: 'edition',
    filename: 'master_social_avatar_2048x2048_ultra_hd',
    title: 'Master Ultra-HD 4K Social Avatar',
    size: 2048,
    theme: 'beveled',
    hasRing: true,
    platform: 'Ultra-HD / Retina / Print',
    spec: '2048 × 2048 px (Double 1080p Retina Fidelity)',
    usecase: 'Master ultra-high-resolution asset for 4K/5K displays, future platform standards, high-density print banners, and brand archive.'
  }
];

async function generateAll() {
  console.log('💎 [Social Avatar Suite] Launching Puppeteer high-res renderer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  for (const asset of ASSET_SPECS) {
    const targetDir = asset.category === 'platform' ? PLATFORM_DIR : EDITIONS_DIR;
    const svgContent = createAvatarSvg({
      size: asset.size,
      theme: asset.theme,
      hasRing: asset.hasRing
    });

    // 1. Write SVG
    const svgPath = path.join(targetDir, `${asset.filename}.svg`);
    fs.writeFileSync(svgPath, svgContent, 'utf8');

    // 2. Render PNG via Puppeteer
    await page.setViewport({ width: asset.size, height: asset.size, deviceScaleFactor: 1 });
    await page.setContent(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { width: ${asset.size}px; height: ${asset.size}px; overflow: hidden; background: transparent; }
          svg { display: block; width: ${asset.size}px; height: ${asset.size}px; }
        </style>
      </head>
      <body>${svgContent}</body>
      </html>
    `, { waitUntil: 'load' });

    const pngPath = path.join(targetDir, `${asset.filename}.png`);
    await page.screenshot({ path: pngPath, type: 'png', omitBackground: asset.theme === 'transparent' });
    console.log(`  ✓ Generated [${asset.category.toUpperCase()}]: ${asset.filename}.png (${asset.size}×${asset.size}px)`);
  }

  await browser.close();
  console.log('✅ [Social Avatar Suite] All SVGs and PNGs successfully rendered.');

  // Generate Comprehensive Documentation (README.md)
  generateReadme();

  // Re-package the master brand zip
  updateMasterZip();
}

function generateReadme() {
  let md = `# POLISH Media Co. — Official Social Media Profile Picture Suite (2026 Specifications)\n\n`;
  md += `Welcome to the official social media profile picture repository for **POLISH Media Co.** (\`polishmediaco.com\`).\n`;
  md += `Every asset in this collection has been mathematically engineered and calibrated to the exact platform display resolutions, circular safe-zone diameters, and aspect ratios of modern digital platforms.\n\n`;
  md += `---\n\n## 1. Platform-Specific Master Suite (\`01_platform_specific/\`)\n\n`;
  md += `| Platform | Recommended File | Dimensions | Native Crop | Specific Usecase |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- |\n`;

  const platforms = ASSET_SPECS.filter(a => a.category === 'platform');
  for (const p of platforms) {
    md += `| **${p.platform}** | \`${p.filename}.png\` | \`${p.spec}\` | Circular / Squircle | ${p.usecase} |\n`;
  }

  md += `\n---\n\n## 2. Style Editions & Master Assets (\`02_style_editions/\`)\n\n`;
  md += `| Edition Name | File Name | Dimensions | Description & Ideal Application |\n`;
  md += `| :--- | :--- | :--- | :--- |\n`;

  const editions = ASSET_SPECS.filter(a => a.category === 'edition');
  for (const e of editions) {
    md += `| **${e.title}** | \`${e.filename}.png\` | \`${e.spec}\` | ${e.usecase} |\n`;
  }

  md += `\n---\n\n## 3. Engineering & Safe Zone Specifications\n\n`;
  md += `1. **Circular Safe Zone (Concentric 80% Rule)**:\n`;
  md += `   - Modern social platforms (Instagram, Twitter/X, TikTok, YouTube, WhatsApp) crop square profile images into circles.\n`;
  md += `   - All POLISH profile pictures feature an optical 20–24% outer margin. When inscribed into a circle, the Golden Ratio Pipette and the diamond droplet are positioned with balanced negative space with zero risk of edge clipping.\n\n`;
  md += `2. **The Specular Bezel Solution for OLED Dark Modes**:\n`;
  md += `   - In modern mobile OS dark modes (pure black #000000 background), borderless black profile avatars blend invisibly into the UI header.\n`;
  md += `   - The **Specular Beveled** edition incorporates a precision hairline rim (\`rgba(226, 199, 153, 0.45)\`) that establishes clean geometric separation across any dark or light application background.\n\n`;
  md += `3. **Color Tokens Applied**:\n`;
  md += `   - **Primary Atelier Gold**: \`#E2C799\`\n`;
  md += `   - **Cashmere Platinum Core**: \`#F5E6D3\`\n`;
  md += `   - **Atelier Bronze Shade**: \`#C5A880\`\n`;
  md += `   - **Deep Obsidian Noir Ground**: \`#080706\`\n`;
  md += `   - **Warm Alabaster Light Ground**: \`#FAF7F2\`\n\n`;
  md += `4. **File Formats Provided**:\n`;
  md += `   - **PNG**: Pre-rendered 32-bit raster with sub-pixel antialiasing and sRGB color profile.\n`;
  md += `   - **SVG**: Infinite resolution scalable vector for direct import into Figma, Adobe Illustrator, or custom code.\n`;

  fs.writeFileSync(path.join(AVATAR_DIR, 'README.md'), md, 'utf8');
  console.log('✅ [Social Avatar Suite] Generated AVATAR_DIR/README.md');
}

function updateMasterZip() {
  console.log('📦 [Brand Pack] Refreshing POLISH_Media_Co_Brand_Pack.zip...');
  const zipFile = path.join(BASE_DIR, 'public', 'brand-pack', 'POLISH_Media_Co_Brand_Pack.zip');
  const targetDir = path.join(BASE_DIR, 'public', 'brand-pack');
  
  try {
    execSync(`cd "${targetDir}" && zip -r -q "${zipFile}" 01_logos 02_favicons_and_icons 03_social_assets 04_color_palette 05_typography 06_guidelines`, { stdio: 'inherit' });
    const stats = fs.statSync(zipFile);
    console.log(`✅ [Brand Pack] Successfully refreshed master zip (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  } catch (err) {
    console.error('⚠️ [Brand Pack] Failed to zip:', err.message);
  }
}

generateAll().catch(err => {
  console.error('❌ Error generating avatars:', err);
  process.exit(1);
});
