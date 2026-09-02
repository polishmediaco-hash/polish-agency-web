const puppeteer = require('puppeteer');
const path = require('path');

async function verifyUpdates() {
  console.log('🚀 Running visual verification of updated Hero and Header on mobile...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Test iPhone 14/15/16 standard (393x852)
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  
  const pages = [
    { url: 'http://127.0.0.1:3000?lang=en', shot: 'verify_hero_en_mobile.png' },
    { url: 'http://127.0.0.1:3000?lang=fr', shot: 'verify_hero_fr_mobile.png' },
    { url: 'http://127.0.0.1:3000?lang=ar', shot: 'verify_hero_ar_mobile.png' }
  ];

  for (const p of pages) {
    await page.goto(p.url, { waitUntil: 'networkidle2' });
    const shotPath = path.join(__dirname, p.shot);
    await page.screenshot({ path: shotPath, fullPage: false });
    console.log(`Saved screenshot: ${shotPath}`);
  }

  await browser.close();
  console.log('Verification screenshots captured successfully.');
}

verifyUpdates().catch(console.error);
