const puppeteer = require('puppeteer');
const path = require('path');

async function testStickyCTA() {
  console.log('🚀 Testing Clean Header & Smart-Blending Sticky Glowing CTA...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  // 1. Check Top of Page (y = 0)
  await page.goto('http://127.0.0.1:3000?lang=en', { waitUntil: 'networkidle2' });
  const topState = await page.evaluate(() => {
    const headerCta = document.querySelector('.site-header .btn-cta');
    const sticky = document.querySelector('#stickyCtaDock');
    return {
      hasHeaderCta: !!headerCta,
      stickyVisible: sticky ? sticky.classList.contains('is-visible') : false
    };
  });
  console.log('Top of page state:', topState);
  await page.screenshot({ path: path.join(__dirname, 'sticky_test_1_top.png') });

  // 2. Scroll to Middle Section (y = 750px)
  await page.evaluate(() => window.scrollTo(0, 750));
  await new Promise(r => setTimeout(r, 600)); // wait for transition
  const midState = await page.evaluate(() => {
    const sticky = document.querySelector('#stickyCtaDock');
    return {
      stickyVisible: sticky ? sticky.classList.contains('is-visible') : false,
      scrollY: window.scrollY
    };
  });
  console.log('Middle section state (y=750):', midState);
  await page.screenshot({ path: path.join(__dirname, 'sticky_test_2_mid.png') });

  // 3. Scroll to Bottom Creator CTA Section
  await page.evaluate(() => {
    const creatorBox = document.querySelector('.creator-cta-box');
    if (creatorBox) creatorBox.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));
  const bottomState = await page.evaluate(() => {
    const sticky = document.querySelector('#stickyCtaDock');
    return {
      stickyVisible: sticky ? sticky.classList.contains('is-visible') : false,
      scrollY: window.scrollY
    };
  });
  console.log('Bottom creator section state:', bottomState);
  await page.screenshot({ path: path.join(__dirname, 'sticky_test_3_bottom.png') });

  // 4. Test Arabic RTL at middle
  await page.goto('http://127.0.0.1:3000?lang=ar', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo(0, 750));
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: path.join(__dirname, 'sticky_test_4_ar_mid.png') });

  await browser.close();
  console.log('=== STICKY CTA AUDIT COMPLETE ===');
}

testStickyCTA().catch(console.error);
