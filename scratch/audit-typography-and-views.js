const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:3000';
const VIEWPORTS = [
  { name: 'desktop_1440', width: 1440, height: 900 },
  { name: 'tablet_768', width: 768, height: 1024 },
  { name: 'mobile_393', width: 393, height: 852 },
  { name: 'micro_320', width: 320, height: 568 }
];

const PAGES = [
  { path: '/index.html', name: 'home' },
  { path: '/apply.html', name: 'apply' },
  { path: '/creators.html', name: 'creators' }
];

const LANGS = ['en', 'fr', 'ar'];

async function runAudit() {
  console.log('🚀 Starting Full Typography, Size, Color & Multi-View Audit...\n');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const fullReport = [];

  for (const pageInfo of PAGES) {
    for (const vp of VIEWPORTS) {
      for (const lang of LANGS) {
        const page = await browser.newPage();
        await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 2 });
        await page.goto(`${BASE_URL}${pageInfo.path}`, { waitUntil: 'domcontentloaded', timeout: 10000 });

        // Switch language via official polishI18n engine
        await page.evaluate((l) => {
          if (window.polishI18n && window.polishI18n.setLanguage) {
            window.polishI18n.setLanguage(l);
          } else {
            document.documentElement.lang = l;
            document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
          }
        }, lang);

        await new Promise(r => setTimeout(r, 200));

        // Scan typography metrics
        const metrics = await page.evaluate(() => {
          const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4')).map(el => {
            const style = window.getComputedStyle(el);
            const rect = el.getBoundingClientRect();
            return {
              tag: el.tagName.toLowerCase(),
              text: (el.innerText || '').trim().slice(0, 50),
              fontFamily: style.fontFamily,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              lineHeight: style.lineHeight,
              letterSpacing: style.letterSpacing,
              color: style.color,
              textAlign: style.textAlign,
              direction: style.direction,
              width: Math.round(rect.width),
              height: Math.round(rect.height),
              hasOverflow: el.scrollWidth > el.clientWidth + 2
            };
          });

          const bodyTexts = Array.from(document.querySelectorAll('p, .hero-desc, .micro-trust, .btn')).slice(0, 10).map(el => {
            const style = window.getComputedStyle(el);
            return {
              tag: el.tagName.toLowerCase(),
              className: el.className,
              fontSize: style.fontSize,
              lineHeight: style.lineHeight,
              color: style.color,
              fontFamily: style.fontFamily
            };
          });

          return {
            headings,
            bodyTexts,
            overflowCount: headings.filter(h => h.hasOverflow).length
          };
        });

        const shotPath = path.join(__dirname, `audit_${pageInfo.name}_${vp.name}_${lang}.png`);
        await page.screenshot({ path: shotPath, fullPage: false });

        fullReport.push({
          page: pageInfo.name,
          viewport: vp.name,
          lang,
          metrics,
          shotPath
        });

        const h1 = metrics.headings.find(h => h.tag === 'h1');
        console.log(`✓ [${pageInfo.name}] [${vp.name}] [${lang.toUpperCase()}]: H1 ${h1?.fontSize || 'N/A'} (Line-Height: ${h1?.lineHeight || 'N/A'}) - Overflows: ${metrics.overflowCount}`);
        await page.close();
      }
    }
  }

  await browser.close();
  console.log('\n=== FULL SCAN COMPLETE ===\n');
  fs.writeFileSync(path.join(__dirname, 'audit_report.json'), JSON.stringify(fullReport, null, 2));
}

runAudit().catch(console.error);
