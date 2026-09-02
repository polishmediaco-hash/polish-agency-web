const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runMobileAudit() {
  console.log('📱 Starting Deep Mobile & Phone View Audit (iPhone 393x852)...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });

  const pagesToTest = [
    { name: 'Landing (EN)', url: 'https://www.polishmediaco.com?lang=en', shot: 'mobile_landing_en.png' },
    { name: 'Landing (FR)', url: 'https://www.polishmediaco.com?lang=fr', shot: 'mobile_landing_fr.png' },
    { name: 'Landing (AR - RTL)', url: 'https://www.polishmediaco.com?lang=ar', shot: 'mobile_landing_ar.png' },
    { name: 'Apply Funnel (EN)', url: 'https://www.polishmediaco.com/apply?lang=en', shot: 'mobile_apply_en.png' },
    { name: 'Creators UGC (EN)', url: 'https://www.polishmediaco.com/creators?lang=en', shot: 'mobile_creators_en.png' }
  ];

  const results = [];

  for (const item of pagesToTest) {
    console.log(`Checking ${item.name}...`);
    const t0 = Date.now();
    await page.goto(item.url, { waitUntil: 'networkidle2', timeout: 30000 });
    const loadMs = Date.now() - t0;

    // Check horizontal overflow (crucial for mobile)
    const overflow = await page.evaluate(() => {
      const docWidth = document.documentElement.scrollWidth;
      const winWidth = window.innerWidth;
      const hasOverflow = docWidth > winWidth;
      
      // Check small touch targets (<40px)
      const buttons = Array.from(document.querySelectorAll('button, a, input, select')).map(el => {
        const rect = el.getBoundingClientRect();
        return {
          tag: el.tagName,
          text: (el.textContent || el.placeholder || '').trim().slice(0, 20),
          width: Math.round(rect.width),
          height: Math.round(rect.height),
          isSmall: rect.height > 0 && rect.height < 40 && rect.width > 0 && rect.width < 40
        };
      });

      return {
        docWidth,
        winWidth,
        hasHorizontalScroll: hasOverflow,
        smallTargetsCount: buttons.filter(b => b.isSmall).length,
        totalInteractive: buttons.length
      };
    });

    const shotPath = path.join(__dirname, item.shot);
    await page.screenshot({ path: shotPath, fullPage: false });

    results.push({
      page: item.name,
      loadMs,
      horizontalOverflow: overflow.hasHorizontalScroll ? `FAIL (${overflow.docWidth}px > ${overflow.winWidth}px)` : 'PASS (0px overflow)',
      touchTargets: `${overflow.totalInteractive - overflow.smallTargetsCount} / ${overflow.totalInteractive} compliant (>=40px)`,
      screenshot: shotPath
    });
  }

  await browser.close();
  console.log('=== MOBILE AUDIT REPORT ===');
  console.log(JSON.stringify(results, null, 2));
}

runMobileAudit().catch(err => {
  console.error('Mobile audit error:', err);
  process.exit(1);
});
