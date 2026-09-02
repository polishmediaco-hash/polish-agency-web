const puppeteer = require('puppeteer');
const path = require('path');

async function testLogoSizes() {
  console.log('🚀 Auditing Brand Logo Size & Best Practices across all views...');
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
    
    // Test English (LTR)
    await page.goto('http://127.0.0.1:3000?lang=en', { waitUntil: 'networkidle2' });
    const metricsEn = await page.evaluate(() => {
      const bubble = document.querySelector('.header-logo-bubble');
      const img = document.querySelector('.header-logo-img');
      const header = document.querySelector('.floating-header-glass');
      return {
        headerHeight: header ? header.offsetHeight : 0,
        bubbleHeight: bubble ? bubble.offsetHeight : 0,
        bubbleWidth: bubble ? bubble.offsetWidth : 0,
        imgHeight: img ? img.offsetHeight : 0,
        imgWidth: img ? img.offsetWidth : 0,
      };
    });
    console.log(`[EN] Viewport ${vp.name}:`, metricsEn);
    await page.screenshot({ path: path.join(__dirname, `logo_${vp.name}_en.png`) });

    // Test Arabic (RTL)
    await page.goto('http://127.0.0.1:3000?lang=ar', { waitUntil: 'networkidle2' });
    await page.screenshot({ path: path.join(__dirname, `logo_${vp.name}_ar.png`) });

    await page.close();
  }

  await browser.close();
  console.log('=== LOGO AUDIT COMPLETE ===');
}

testLogoSizes().catch(console.error);
