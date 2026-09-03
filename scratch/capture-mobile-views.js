const puppeteer = require('puppeteer');
const path = require('path');

async function capture() {
  const browser = await puppeteer.launch({
    headless: 'new',
    pipe: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--single-process', '--no-zygote']
  });

  const pagesToTest = [
    { url: 'http://localhost:3000/apply.html', name: 'apply_mobile' },
    { url: 'http://localhost:3000/creators.html', name: 'creators_mobile' },
    { url: 'http://localhost:3000/index.html', name: 'home_mobile' }
  ];

  for (const p of pagesToTest) {
    const page = await browser.newPage();
    await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 2 });
    await page.goto(p.url, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(__dirname, `${p.name}_screen.png`) });
    await page.close();
  }

  await browser.close();
  console.log('✓ Captured current mobile views!');
}

capture().catch(console.error);
