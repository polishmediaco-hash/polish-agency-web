const puppeteer = require('puppeteer');
const path = require('path');

async function verifyElevation() {
  console.log('🚀 Verifying WhatsApp Elevation & Sonar Ripple Animation...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Mobile Test
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await page.goto('http://127.0.0.1:3000?lang=en', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 750));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'wa_elevation_mobile_en.png') });

  // Mobile Arabic Test
  await page.goto('http://127.0.0.1:3000?lang=ar', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 750));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'wa_elevation_mobile_ar.png') });

  // Desktop Test
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:3000?lang=en', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 800));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'wa_elevation_desktop_en.png') });

  await browser.close();
  console.log('Elevation verification complete.');
}

verifyElevation().catch(console.error);
