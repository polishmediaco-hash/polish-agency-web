const puppeteer = require('puppeteer');

async function auditSite() {
  console.log('🚀 Launching Chrome Performance & Lag Audit on https://www.polishmediaco.com ...');
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Track console and error events
  const consoleMessages = [];
  const failedRequests = [];
  page.on('console', msg => consoleMessages.push(`[${msg.type()}] ${msg.text()}`));
  page.on('requestfailed', req => failedRequests.push(`${req.url()} (${req.failure().errorText})`));

  // Test local server
  const targetUrl = 'http://127.0.0.1:3000';
  console.log(`🚀 Auditing ${targetUrl} ...`);
  await page.setViewport({ width: 1440, height: 900 });
  const t0 = Date.now();
  const response = await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
  const loadTimeMs = Date.now() - t0;

  // Extract performance timings
  const metrics = await page.evaluate(() => {
    const timing = performance.timing;
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
    const domNodes = document.querySelectorAll('*').length;
    const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src || 'inline');
    const stylesheets = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(l => l.href);
    
    // Check listener counts
    return {
      fcp: Math.round(fcp),
      domLoading: timing.domLoading - timing.navigationStart,
      domInteractive: timing.domInteractive - timing.navigationStart,
      domComplete: timing.domComplete - timing.navigationStart,
      domNodes,
      scriptsCount: scripts.length,
      stylesheetsCount: stylesheets.length
    };
  });

  // Test Scroll Smoothness / FPS test
  console.log('📜 Testing continuous scroll performance (lag & dropped frames)...');
  const scrollMetrics = await page.evaluate(async () => {
    let frameTimes = [];
    let lastTime = performance.now();
    let isRunning = true;

    function recordFrame(now) {
      if (!isRunning) return;
      frameTimes.push(now - lastTime);
      lastTime = now;
      requestAnimationFrame(recordFrame);
    }
    requestAnimationFrame(recordFrame);

    // Scroll down and up
    for (let i = 0; i < 20; i++) {
      window.scrollBy(0, 150);
      await new Promise(r => setTimeout(r, 40));
    }
    for (let i = 0; i < 20; i++) {
      window.scrollBy(0, -150);
      await new Promise(r => setTimeout(r, 40));
    }

    isRunning = false;
    const droppedFrames = frameTimes.filter(t => t > 33.3).length; // >33.3ms = dropped frame under 30fps
    const avgFps = Math.round(1000 / (frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length));
    return { totalFrames: frameTimes.length, droppedFrames, avgFps };
  });

  // Measure Mobile Profile (iPhone 14 / 393x852)
  console.log('📱 Testing Mobile Profile (iPhone / 393px)...');
  await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
  await page.goto('https://www.polishmediaco.com', { waitUntil: 'networkidle2' });
  
  const mobileMetrics = await page.evaluate(() => {
    const paint = performance.getEntriesByType('paint');
    const fcp = paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0;
    return { fcp: Math.round(fcp), domNodes: document.querySelectorAll('*').length };
  });

  await browser.close();

  const results = {
    url: 'https://www.polishmediaco.com',
    httpStatus: response.status(),
    loadTimeMs,
    desktop: metrics,
    scrollPerformance: scrollMetrics,
    mobile: mobileMetrics,
    consoleMessages,
    failedRequests
  };

  console.log('=== AUDIT COMPLETE ===');
  console.log(JSON.stringify(results, null, 2));
}

auditSite().catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
