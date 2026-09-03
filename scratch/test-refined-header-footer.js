const puppeteer = require('puppeteer');
const path = require('path');

async function test() {
  const browser = await puppeteer.launch({
    headless: 'new',
    pipe: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--no-zygote']
  });

  // 1. Desktop apply.html (EN & AR)
  const deskApply = await browser.newPage();
  await deskApply.setViewport({ width: 1280, height: 900 });
  await deskApply.goto('http://localhost:3000/apply.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2600)); // wait for WhatsApp delayed appearance
  await deskApply.screenshot({ path: path.join(__dirname, 'refined_apply_desk_en.png') });
  
  // Switch to AR
  await deskApply.evaluate(() => {
    if (window.polishI18n) window.polishI18n.setLanguage('ar');
  });
  await new Promise(r => setTimeout(r, 400));
  await deskApply.screenshot({ path: path.join(__dirname, 'refined_apply_desk_ar.png') });
  await deskApply.close();

  // 2. Mobile apply.html (EN & AR)
  const mobApply = await browser.newPage();
  await mobApply.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  await mobApply.goto('http://localhost:3000/apply.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2600));
  await mobApply.screenshot({ path: path.join(__dirname, 'refined_apply_mob_en.png') });

  await mobApply.evaluate(() => {
    if (window.polishI18n) window.polishI18n.setLanguage('ar');
  });
  await new Promise(r => setTimeout(r, 400));
  await mobApply.screenshot({ path: path.join(__dirname, 'refined_apply_mob_ar.png') });
  await mobApply.close();

  // 3. Mobile creators.html (EN & AR)
  const mobCreators = await browser.newPage();
  await mobCreators.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  await mobCreators.goto('http://localhost:3000/creators.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2600));
  await mobCreators.screenshot({ path: path.join(__dirname, 'refined_creators_mob_en.png') });

  await mobCreators.evaluate(() => {
    if (window.polishI18n) window.polishI18n.setLanguage('ar');
  });
  await new Promise(r => setTimeout(r, 400));
  await mobCreators.screenshot({ path: path.join(__dirname, 'refined_creators_mob_ar.png') });
  await mobCreators.close();

  // 4. Mobile homepage (EN & AR)
  const mobHome = await browser.newPage();
  mobHome.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  await mobHome.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2600));
  await mobHome.screenshot({ path: path.join(__dirname, 'refined_home_mob_en.png') });

  await mobHome.evaluate(() => {
    if (window.polishI18n) window.polishI18n.setLanguage('ar');
  });
  await new Promise(r => setTimeout(r, 400));
  await mobHome.screenshot({ path: path.join(__dirname, 'refined_home_mob_ar.png') });
  await mobHome.close();

  await browser.close();
  console.log('✓ All screenshots captured successfully!');
}

test().catch(console.error);
