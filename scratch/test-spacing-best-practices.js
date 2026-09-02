const puppeteer = require('puppeteer');
const path = require('path');

async function testSpacingBestPractices() {
  console.log('🚀 Auditing Hero Spacing, Rhythm & Typography Best Practices...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const viewports = [
    { name: 'desktop_1440', width: 1440, height: 900, isMobile: false },
    { name: 'tablet_768', width: 768, height: 1024, isMobile: true },
    { name: 'mobile_393', width: 393, height: 852, isMobile: true },
    { name: 'micro_320', width: 320, height: 650, isMobile: true },
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height, isMobile: vp.isMobile, deviceScaleFactor: 2 });
    
    await page.goto('http://127.0.0.1:3000?lang=en', { waitUntil: 'networkidle2' });
    const metrics = await page.evaluate(() => {
      const header = document.querySelector('.floating-header-glass');
      const heroCard = document.querySelector('.hero-glass-card');
      const topbar = document.querySelector('.glass-card-topbar');
      const h1 = document.querySelector('.hero-h1');
      const desc = document.querySelector('.hero-desc');
      const cta = document.querySelector('.hero-actions .btn-cta');

      const headerRect = header ? header.getBoundingClientRect() : null;
      const cardRect = heroCard ? heroCard.getBoundingClientRect() : null;
      const topbarRect = topbar ? topbar.getBoundingClientRect() : null;
      const h1Rect = h1 ? h1.getBoundingClientRect() : null;

      const gapHeaderToCard = (headerRect && cardRect) ? Math.round(cardRect.top - headerRect.bottom) : 0;
      const gapTopbarToH1 = (topbarRect && h1Rect) ? Math.round(h1Rect.top - topbarRect.bottom) : 0;

      return {
        gapHeaderToCard,
        gapTopbarToH1,
        h1FontSize: h1 ? window.getComputedStyle(h1).fontSize : '',
        h1LineHeight: h1 ? window.getComputedStyle(h1).lineHeight : '',
        cardPadding: heroCard ? window.getComputedStyle(heroCard).padding : '',
      };
    });
    console.log(`[${vp.name}] Rhythm Metrics:`, metrics);
    await page.screenshot({ path: path.join(__dirname, `spacing_${vp.name}_en.png`) });

    // Also screenshot Arabic
    await page.goto('http://127.0.0.1:3000?lang=ar', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(__dirname, `spacing_${vp.name}_ar.png`) });

    await page.close();
  }

  await browser.close();
  console.log('=== SPACING AUDIT COMPLETE ===');
}

testSpacingBestPractices().catch(console.error);
