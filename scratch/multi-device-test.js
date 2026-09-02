const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const VIEWPORTS = [
  { name: 'Narrow Mobile (Galaxy Fold / SE 1st)', width: 320, height: 640, scale: 2 },
  { name: 'Android Popular (Samsung Galaxy S22/S23/S24)', width: 360, height: 800, scale: 3 },
  { name: 'iPhone Small (iPhone SE / 8 / 13 Mini)', width: 375, height: 667, scale: 2 },
  { name: 'iPhone Standard (iPhone 13/14/15/16)', width: 393, height: 852, scale: 3 },
  { name: 'Android Large (Google Pixel 8 / OnePlus)', width: 412, height: 915, scale: 2.6 },
  { name: 'iPhone Pro Max (iPhone 14/15/16 Pro Max)', width: 430, height: 932, scale: 3 }
];

const ROUTES = [
  { name: 'Landing-EN', path: '/?lang=en' },
  { name: 'Landing-FR', path: '/?lang=fr' },
  { name: 'Landing-AR', path: '/?lang=ar' },
  { name: 'Apply-EN', path: '/apply?lang=en' },
  { name: 'Creators-EN', path: '/creators?lang=en' }
];

async function testAllDevices() {
  console.log('🚀 Starting Comprehensive Multi-Device Screen & Border Audit...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  const summaryReport = [];

  for (const vp of VIEWPORTS) {
    console.log(`\n📱 Testing Viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    await page.setViewport({
      width: vp.width,
      height: vp.height,
      deviceScaleFactor: vp.scale,
      isMobile: true,
      hasTouch: true
    });

    const vpResults = { viewport: vp.name, width: vp.width, height: vp.height, routes: [] };

    for (const route of ROUTES) {
      const targetUrl = `https://www.polishmediaco.com${route.path}`;
      await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      const evaluation = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const overflowPx = docWidth - winWidth;

        // Check header layout & collision
        const header = document.querySelector('.floating-header-glass');
        const logoBubble = document.querySelector('.header-logo-bubble');
        const langToggle = document.querySelector('.lang-toggle');
        const ctaBtn = document.querySelector('.site-header .btn-cta') || document.querySelector('.site-header .btn-ghost');

        const headerRect = header ? header.getBoundingClientRect() : null;
        const logoRect = logoBubble ? logoBubble.getBoundingClientRect() : null;
        const langRect = langToggle ? langToggle.getBoundingClientRect() : null;
        const ctaRect = ctaBtn ? ctaBtn.getBoundingClientRect() : null;

        // Check hero CTA button
        const heroCta = document.querySelector('.hero-actions .btn-cta') || document.querySelector('.btn-wizard-next') || document.querySelector('#btnSubmitCreator');
        const heroCtaRect = heroCta ? heroCta.getBoundingClientRect() : null;

        // Check cards border rendering
        const cards = Array.from(document.querySelectorAll('.hero-glass-card, .pro-card, .form-container-shell')).map(c => {
          const r = c.getBoundingClientRect();
          const style = window.getComputedStyle(c);
          return {
            width: Math.round(r.width),
            border: style.border,
            borderRadius: style.borderRadius,
            boxShadow: style.boxShadow ? 'Active Specular Glow' : 'None'
          };
        });

        return {
          overflowPx,
          hasOverflow: overflowPx > 1,
          header: {
            width: headerRect ? Math.round(headerRect.width) : 0,
            height: headerRect ? Math.round(headerRect.height) : 0,
            logoWidth: logoRect ? Math.round(logoRect.width) : 0,
            langWidth: langRect ? Math.round(langRect.width) : 0,
            ctaWidth: ctaRect ? Math.round(ctaRect.width) : 0,
            ctaHeight: ctaRect ? Math.round(ctaRect.height) : 0
          },
          heroCta: {
            width: heroCtaRect ? Math.round(heroCtaRect.width) : 0,
            height: heroCtaRect ? Math.round(heroCtaRect.height) : 0
          },
          cardsCount: cards.length,
          sampleCard: cards[0] || null
        };
      });

      const shotFileName = `device_${vp.width}_${route.name.toLowerCase()}.png`;
      const shotPath = path.join(__dirname, shotFileName);
      await page.screenshot({ path: shotPath, fullPage: false });

      vpResults.routes.push({
        route: route.name,
        overflow: evaluation.hasOverflow ? `FAIL (+${evaluation.overflowPx}px)` : 'PASS (0px overflow)',
        headerMetrics: evaluation.header,
        heroCtaMetrics: evaluation.heroCta,
        cardMetrics: evaluation.sampleCard,
        screenshot: shotFileName
      });
    }

    summaryReport.push(vpResults);
  }

  await browser.close();

  const reportPath = path.join(__dirname, 'multi_device_audit.json');
  fs.writeFileSync(reportPath, JSON.stringify(summaryReport, null, 2));

  console.log('\n=== MULTI-DEVICE AUDIT COMPLETED ===');
  console.log(JSON.stringify(summaryReport, null, 2));
}

testAllDevices().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
