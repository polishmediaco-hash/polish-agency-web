const puppeteer = require('puppeteer');
const path = require('path');

async function capture() {
  const browser = await puppeteer.launch({
    headless: 'new',
    pipe: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--no-zygote']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));

  // Desktop Top (Ghost)
  await page.screenshot({ path: path.join(__dirname, 'decoupled_desktop_top_en.png') });

  // Desktop Scrolled (Mist)
  await page.evaluate(() => {
    window.scrollTo(0, 300);
    const h = document.getElementById('siteHeader') || document.querySelector('.site-header');
    if (h) h.classList.add('is-scrolled');
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(__dirname, 'decoupled_desktop_scrolled_en.png') });

  // Mobile Top (Ghost)
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  await page.evaluate(() => {
    window.scrollTo(0, 0);
    const h = document.getElementById('siteHeader') || document.querySelector('.site-header');
    if (h) h.classList.remove('is-scrolled');
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(__dirname, 'decoupled_mobile_top_en.png') });

  // Mobile Arabic Top
  await page.evaluate(() => {
    if (window.polishI18n) window.polishI18n.setLanguage('ar');
  });
  await new Promise(r => setTimeout(r, 300));
  await page.screenshot({ path: path.join(__dirname, 'decoupled_mobile_top_ar.png') });

  await browser.close();
  console.log('✓ Captured all decoupled screenshots successfully!');
}

capture().catch(console.error);
