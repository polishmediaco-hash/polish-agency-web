const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 });

  const svgContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'assets', 'logo-gold-mark.svg'), 'utf8');
  const svgDataUri = 'data:image/svg+xml;base64,' + Buffer.from(svgContent).toString('base64');

  // Craft the new 3D Haute Atelier Specular Gold SVG
  const newLogoSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
    <defs>
      <!-- Rich 24K Polished Bullion Gold Gradient -->
      <linearGradient id="gold24kGrad" x1="15%" y1="85%" x2="85%" y2="15%">
        <stop offset="0%" stop-color="#6E4A14"/>
        <stop offset="18%" stop-color="#9E7227"/>
        <stop offset="38%" stop-color="#DDA94C"/>
        <stop offset="50%" stop-color="#FFF5D6"/>
        <stop offset="54%" stop-color="#FFFFFF"/>
        <stop offset="62%" stop-color="#F2D18B"/>
        <stop offset="82%" stop-color="#C2943E"/>
        <stop offset="100%" stop-color="#5E3A0B"/>
      </linearGradient>

      <!-- Specular Bevel Ridge Highlight Gradient -->
      <linearGradient id="bevelHighlight" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="rgba(255, 255, 255, 0.1)"/>
        <stop offset="45%" stop-color="rgba(255, 255, 255, 0.95)"/>
        <stop offset="70%" stop-color="rgba(255, 245, 220, 0.8)"/>
        <stop offset="100%" stop-color="rgba(212, 175, 55, 0.2)"/>
      </linearGradient>

      <!-- Deep Warm Bronze Rim Outline Gradient -->
      <linearGradient id="bronzeRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8C6322"/>
        <stop offset="50%" stop-color="#54360C"/>
        <stop offset="100%" stop-color="#382104"/>
      </linearGradient>

      <!-- Dynamic Specular Sheen Mask & Gradient -->
      <linearGradient id="liveSheenBeam" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="white" stop-opacity="0"/>
        <stop offset="42%" stop-color="white" stop-opacity="0"/>
        <stop offset="50%" stop-color="white" stop-opacity="0.95"/>
        <stop offset="58%" stop-color="#FFEAA7" stop-opacity="0.8"/>
        <stop offset="66%" stop-color="white" stop-opacity="0"/>
        <stop offset="100%" stop-color="white" stop-opacity="0"/>
      </linearGradient>

      <!-- Filter for Crisp Emboss & Depth -->
      <filter id="crispShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#2D1A04" flood-opacity="0.35"/>
      </filter>
    </defs>

    <g transform="translate(50, 50) scale(1.35) translate(-50, -50)">
      <g transform="translate(3.5, -5.5)">
        
        <!-- Base 3D Extrusion Shadow Layer (Gives physical tactile thickness) -->
        <path d="M 34 68 C 30 64 30 58 34 54 L 56 32 L 48 32 C 45 32 43 30 43 27 C 43 24 45 22 48 22 L 75 22 C 77 22 79 24 79 26 L 79 53 C 79 56 77 58 74 58 C 71 58 69 56 69 53 L 69 45 L 47 68 C 43 72 38 72 34 68 Z" 
              transform="translate(0, 1.8)"
              fill="#3A2205" opacity="0.6"/>

        <!-- Primary Chevron Body: 24K Bullion Gold with Crisp Outer Rim -->
        <path d="M 34 68 C 30 64 30 58 34 54 L 56 32 L 48 32 C 45 32 43 30 43 27 C 43 24 45 22 48 22 L 75 22 C 77 22 79 24 79 26 L 79 53 C 79 56 77 58 74 58 C 71 58 69 56 69 53 L 69 45 L 47 68 C 43 72 38 72 34 68 Z" 
              fill="url(#gold24kGrad)"
              stroke="url(#bronzeRimGrad)"
              stroke-width="1.2"
              stroke-linejoin="round"/>

        <!-- Upper Ridge Bevel Highlight (Light catching the top facets) -->
        <path d="M 34 54 L 56 32 L 48 32 C 46 32 44.5 30.5 44.5 28.5 L 48 23.5 L 75 23 C 76.5 23 78 24.5 78 26 L 78 53"
              fill="none"
              stroke="url(#bevelHighlight)"
              stroke-width="1.1"
              stroke-linecap="round"
              stroke-linejoin="round"/>

        <!-- Bottom Bevel Undercut (Subtle shadow accent along trailing edge) -->
        <path d="M 34 68 L 47 68 C 49.5 68 51.5 66.5 53 65 L 69 47 L 69 45"
              fill="none"
              stroke="#462B07"
              stroke-width="0.9"
              opacity="0.75"
              stroke-linecap="round"/>

        <!-- Droplet 3D Shadow Layer -->
        <path d="M 24 72 C 27 75 29 79 28 83 C 27 87 23 89 19 88 C 15 87 13 83 14 79 C 15 75 21 69 24 72 Z" 
              transform="translate(0, 1.2)"
              fill="#3A2205" opacity="0.6"/>

        <!-- Primary Droplet Body with Rim -->
        <path d="M 24 72 C 27 75 29 79 28 83 C 27 87 23 89 19 88 C 15 87 13 83 14 79 C 15 75 21 69 24 72 Z" 
              fill="url(#gold24kGrad)"
              stroke="url(#bronzeRimGrad)"
              stroke-width="1.1"
              stroke-linejoin="round"/>

        <!-- Droplet Top Light Rim -->
        <path d="M 16 77 C 18 73 22 71 24 72 C 26 74 27.5 77 27 80"
              fill="none"
              stroke="url(#bevelHighlight)"
              stroke-width="0.9"
              stroke-linecap="round"/>

        <!-- Inner Diamond Specular Core -->
        <rect x="18.5" y="77.5" width="5.5" height="5.5" rx="1.2" 
              transform="rotate(45 21.25 80.25)" 
              fill="#FFFFFF"
              stroke="#D4AF37"
              stroke-width="0.6"/>

        <!-- Specular Glint Stars (Delicate 4-Point Diamond Flare) -->
        <!-- Tip of Chevron -->
        <path class="glint-star glint-top" d="M 75 19 L 75.8 21.2 L 78 22 L 75.8 22.8 L 75 25 L 74.2 22.8 L 72 22 L 74.2 21.2 Z" 
              fill="#FFFFFF"/>
        <!-- Droplet Glint -->
        <path class="glint-star glint-drop" d="M 21.25 77.5 L 21.8 79.5 L 23.8 80.25 L 21.8 81 L 21.25 83 L 20.7 81 L 18.7 80.25 L 20.7 79.5 Z" 
              fill="#FFFFFF"/>

        <!-- Animated Specular Sheen Beam Sweeping Across the Mark -->
        <mask id="markClipMask">
          <path d="M 34 68 C 30 64 30 58 34 54 L 56 32 L 48 32 C 45 32 43 30 43 27 C 43 24 45 22 48 22 L 75 22 C 77 22 79 24 79 26 L 79 53 C 79 56 77 58 74 58 C 71 58 69 56 69 53 L 69 45 L 47 68 C 43 72 38 72 34 68 Z" fill="#FFFFFF"/>
          <path d="M 24 72 C 27 75 29 79 28 83 C 27 87 23 89 19 88 C 15 87 13 83 14 79 C 15 75 21 69 24 72 Z" fill="#FFFFFF"/>
        </mask>

        <g mask="url(#markClipMask)">
          <line x1="-30" y1="120" x2="30" y2="-20" stroke="url(#liveSheenBeam)" stroke-width="45" opacity="0.85" class="sheen-sweep-line" />
        </g>
      </g>
    </g>

    <style>
      .sheen-sweep-line {
        animation: sheenSweep 4.6s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      }
      @keyframes sheenSweep {
        0% {
          transform: translate(-90px, 40px);
          opacity: 0;
        }
        10% {
          opacity: 0.9;
        }
        45% {
          transform: translate(90px, -40px);
          opacity: 0.9;
        }
        55%, 100% {
          transform: translate(90px, -40px);
          opacity: 0;
        }
      }

      .glint-top {
        transform-origin: 75px 22px;
        animation: glintApex 4.6s ease-in-out infinite;
      }
      @keyframes glintApex {
        0%, 30% {
          transform: scale(0.3) rotate(0deg);
          opacity: 0.2;
        }
        42% {
          transform: scale(1.4) rotate(45deg);
          opacity: 1;
        }
        52% {
          transform: scale(0.6) rotate(90deg);
          opacity: 0.4;
        }
        60%, 100% {
          transform: scale(0.3) rotate(90deg);
          opacity: 0.2;
        }
      }

      .glint-drop {
        transform-origin: 21.25px 80.25px;
        animation: glintDroplet 4.6s ease-in-out infinite;
      }
      @keyframes glintDroplet {
        0%, 15% {
          transform: scale(0.3) rotate(0deg);
          opacity: 0.2;
        }
        25% {
          transform: scale(1.3) rotate(-30deg);
          opacity: 0.95;
        }
        35% {
          transform: scale(0.5) rotate(0deg);
          opacity: 0.3;
        }
        45%, 100% {
          transform: scale(0.3) rotate(0deg);
          opacity: 0.2;
        }
      }
    </style>
  </svg>
  `;

  const newSvgDataUri = 'data:image/svg+xml;base64,' + Buffer.from(newLogoSvg).toString('base64');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        display: flex;
        height: 100vh;
      }
      .split {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 40px;
        padding: 40px;
      }
      .dark-side {
        background: #080706;
        color: #fff;
      }
      .light-side {
        background: #FAF7F2;
        color: #111;
      }
      .comparison-row {
        display: flex;
        gap: 48px;
        align-items: center;
      }
      .logo-box {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 14px;
      }
      .label {
        font-size: 11px;
        letter-spacing: 0.1em;
        text-transform: uppercase;
        opacity: 0.65;
      }
      .heading {
        font-size: 16px;
        font-weight: 700;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-bottom: -10px;
      }

      /* Refined Dark Mode Styling for New Logo */
      .new-logo-dark {
        filter: drop-shadow(0 6px 16px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 2px rgba(255, 235, 180, 0.4));
      }

      /* Refined Light Mode Styling for New Logo */
      .new-logo-light {
        filter: drop-shadow(0 4px 12px rgba(80, 52, 16, 0.22)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.15));
      }
    </style>
  </head>
  <body>
    <!-- Dark Mode Comparison -->
    <div class="split dark-side">
      <div class="heading">Dark Mode (#080706)</div>
      <div class="comparison-row">
        <div class="logo-box">
          <span class="label">Before (Hazy Blob)</span>
          <img src="${svgDataUri}" width="64" height="64" style="filter: drop-shadow(0 4px 18px rgba(226, 199, 153, 0.45)) drop-shadow(0 0 4px rgba(255, 255, 255, 0.7));" />
        </div>
        <div class="logo-box">
          <span class="label">NEW (3D Polished Gold)</span>
          <img src="${newSvgDataUri}" width="64" height="64" class="new-logo-dark" />
        </div>
      </div>
    </div>

    <!-- Light Mode Comparison -->
    <div class="split light-side">
      <div class="heading">Light Mode (#FAF7F2)</div>
      <div class="comparison-row">
        <div class="logo-box">
          <span class="label">Before (Washed Out)</span>
          <img src="${svgDataUri}" width="64" height="64" style="filter: drop-shadow(0 4px 14px rgba(70, 48, 16, 0.28)) drop-shadow(0 1px 3px rgba(0, 0, 0, 0.22)) contrast(1.18) brightness(0.92);" />
        </div>
        <div class="logo-box">
          <span class="label">NEW (Hot-Stamped Foil)</span>
          <img src="${newSvgDataUri}" width="64" height="64" class="new-logo-light" />
        </div>
      </div>
    </div>
  </body>
  </html>
  `;

  await page.setContent(html);
  // Wait for 1.8s so the animation reaches the specular apex
  await new Promise(r => setTimeout(r, 1800));
  const outPath = path.join(__dirname, 'screenshots', 'logo_test_sheen_apex.png');
  await page.screenshot({ path: outPath });
  console.log('Saved:', outPath);
  await browser.close();
})();
