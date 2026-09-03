const puppeteer = require('puppeteer');
const path = require('path');

async function capture() {
  const browser = await puppeteer.launch({
    headless: 'new',
    pipe: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--no-zygote']
  });

  const applyPage = await browser.newPage();
  await applyPage.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  await applyPage.goto('http://localhost:3000/apply.html', { waitUntil: 'domcontentloaded' });
  await applyPage.evaluate(() => {
    if (window.polishI18n) window.polishI18n.setLanguage('ar');
  });
  await new Promise(r => setTimeout(r, 400));
  await applyPage.screenshot({ path: path.join(__dirname, 'phone_apply_step1_ar.png') });
  await applyPage.close();

  const creatorPage = await browser.newPage();
  await creatorPage.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  await creatorPage.goto('http://localhost:3000/creators.html', { waitUntil: 'domcontentloaded' });
  await creatorPage.evaluate(() => {
    if (window.polishI18n) window.polishI18n.setLanguage('ar');
  });
  await new Promise(r => setTimeout(r, 400));
  await creatorPage.screenshot({ path: path.join(__dirname, 'phone_creators_ar.png') });
  await creatorPage.close();

  await browser.close();
  console.log('✓ Arabic Phone Native screenshots captured successfully!');
}

capture().catch(console.error);
