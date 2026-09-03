const puppeteer = require('puppeteer');
const path = require('path');

async function capture() {
  const browser = await puppeteer.launch({
    headless: 'new',
    pipe: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--no-zygote']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  await page.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(__dirname, 'home_mobile_full.png'), fullPage: true });

  // Also capture apply.html Step 1, Step 2, Step 3 on mobile
  const applyPage = await browser.newPage();
  await applyPage.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  await applyPage.goto('http://localhost:3000/apply.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 300));
  await applyPage.screenshot({ path: path.join(__dirname, 'apply_mobile_step1.png') });

  // Move to Step 2
  await applyPage.evaluate(() => {
    document.getElementById('brandName').value = 'Test Brand';
    document.getElementById('primaryContact').value = 'test@example.com';
    document.getElementById('socialLink').value = 'https://instagram.com/test';
    if (window.polishWizard) window.polishWizard.nextStep();
  });
  await new Promise(r => setTimeout(r, 300));
  await applyPage.screenshot({ path: path.join(__dirname, 'apply_mobile_step2.png') });

  // Move to Step 3
  await applyPage.evaluate(() => {
    if (window.polishWizard) window.polishWizard.nextStep();
  });
  await new Promise(r => setTimeout(r, 300));
  await applyPage.screenshot({ path: path.join(__dirname, 'apply_mobile_step3.png') });

  await browser.close();
  console.log('✓ Captured full mobile suite!');
}

capture().catch(console.error);
