const puppeteer = require('puppeteer');
const path = require('path');

async function capture() {
  const browser = await puppeteer.launch({
    headless: 'new',
    pipe: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--no-zygote']
  });

  // Test apply.html (Step 1, 2, 3)
  const applyPage = await browser.newPage();
  await applyPage.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  await applyPage.goto('http://localhost:3000/apply.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));
  await applyPage.screenshot({ path: path.join(__dirname, 'phone_apply_step1.png') });

  // Move to Step 2
  await applyPage.evaluate(() => {
    document.getElementById('fullName').value = 'Elena Vance';
    document.getElementById('brandName').value = 'Aurora Skincare';
    document.getElementById('socialLink').value = 'instagram.com/aurora';
    const nextBtn = document.getElementById('wizardBtnNext');
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await applyPage.screenshot({ path: path.join(__dirname, 'phone_apply_step2.png') });

  // Move to Step 3
  await applyPage.evaluate(() => {
    document.getElementById('role').value = 'Founder / CEO / Co-Founder';
    const nextBtn = document.getElementById('wizardBtnNext');
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));
  await applyPage.screenshot({ path: path.join(__dirname, 'phone_apply_step3.png') });
  await applyPage.close();

  // Test creators.html
  const creatorPage = await browser.newPage();
  await creatorPage.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  await creatorPage.goto('http://localhost:3000/creators.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));
  await creatorPage.screenshot({ path: path.join(__dirname, 'phone_creators.png') });
  await creatorPage.close();

  // Test index.html
  const homePage = await browser.newPage();
  await homePage.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
  await homePage.goto('http://localhost:3000/index.html', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));
  await homePage.screenshot({ path: path.join(__dirname, 'phone_home.png') });
  await homePage.close();

  await browser.close();
  console.log('✓ All Phone Native screenshots captured successfully!');
}

capture().catch(console.error);
