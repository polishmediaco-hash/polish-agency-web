const puppeteer = require('puppeteer');
const path = require('path');

async function testDesktop() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://127.0.0.1:3000?lang=en', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 800));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'sticky_desktop_mid.png') });

  await browser.close();
  console.log('Desktop screenshot saved.');
}

testDesktop().catch(console.error);
