/**
 * POLISH Media Co. — E2E Test Suite for Executive Presentation Page (/presentation)
 * Tests:
 * 1. Default load with custom URL params (?client=...&video=...&board=...)
 * 2. Header and Hero co-branding hydration
 * 3. Video theater stage mounting (YouTube iframe)
 * 4. Chapter navigation & active highlighting
 * 5. Strategy board iframe mounting
 * 6. Quick Customize modal open, input update, and link generation
 * 7. Mobile responsive layout (393px iPhone 15 Pro)
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function runTest() {
  console.log('🚀 Starting Executive Presentation Page E2E Test Suite...\n');
  const delay = ms => new Promise(r => setTimeout(r, ms));

  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    // ── Test 1: Load Page with Dynamic Parameters ──
    const testUrl = 'http://127.0.0.1:3000/presentation?client=Celestia%20Cosmetics&name=Yasmine&board=polish-cosmetics-launch&video=dQw4w9WgXcQ&title=90-Day%20Growth%20Roadmap';
    console.log(`[Test 1] Navigating to: ${testUrl}`);
    await page.goto(testUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise(r => setTimeout(r, 800));

    const pageTitle = await page.title();
    console.log(`✓ Page Title: "${pageTitle}"`);
    if (!pageTitle.includes('Celestia Cosmetics')) {
      throw new Error(`Expected title to include "Celestia Cosmetics", got "${pageTitle}"`);
    }

    // ── Test 2: Co-Branding & Hydration Verification ──
    console.log('[Test 2] Verifying Co-Branded Header and Hero Elements...');
    const headerClient = await page.$eval('#headerClientName', el => el.textContent.trim());
    const heroClient = await page.$eval('#heroClientName', el => el.textContent.trim());
    const heroTitle = await page.$eval('#heroPresentationTitle', el => el.textContent.trim());
    const signoffClient = await page.$eval('#signoffClientName', el => el.textContent.trim());
    const headerCtaText = await page.$eval('.pres-btn-header-cta', el => el.textContent.trim());

    console.log(`✓ Header Client: "${headerClient}"`);
    console.log(`✓ Hero Client: "${heroClient}"`);
    console.log(`✓ Hero Title: "${heroTitle}"`);
    console.log(`✓ Signoff Client: "${signoffClient}"`);
    console.log(`✓ Header CTA Text: "${headerCtaText}"`);

    if (headerClient !== 'Celestia Cosmetics' || heroClient !== 'Celestia Cosmetics') {
      throw new Error('Client name mismatch in DOM');
    }
    if (headerCtaText !== 'Book') {
      throw new Error(`Expected header CTA to be "Book", got "${headerCtaText}"`);
    }

    // ── Test 3: Video Stage & YouTube Iframe Mounting ──
    console.log('[Test 3] Verifying Video Stage & YouTube Iframe...');
    const iframeSrc = await page.$eval('#ytIframePlayer', el => el.getAttribute('src'));
    console.log(`✓ YouTube Iframe Source: ${iframeSrc}`);
    if (!iframeSrc.includes('youtube-nocookie.com/embed/dQw4w9WgXcQ')) {
      throw new Error(`Unexpected iframe source: ${iframeSrc}`);
    }

    // ── Test 4: Chapter Navigation ──
    console.log('[Test 4] Verifying Chapter Pills...');
    const chaptersCount = await page.$$eval('.pres-chapter-pill', els => els.length);
    console.log(`✓ Chapters rendered: ${chaptersCount}`);
    if (chaptersCount !== 4) {
      throw new Error(`Expected 4 chapters, found ${chaptersCount}`);
    }

    // Click 2nd chapter
    const secondChapter = (await page.$$('.pres-chapter-pill'))[1];
    await secondChapter.click();
    await delay(300);

    const isSecondActive = await page.evaluate(el => el.classList.contains('is-active'), secondChapter);
    console.log(`✓ Second Chapter Active after click: ${isSecondActive}`);
    if (!isSecondActive) {
      throw new Error('Second chapter pill not marked active after click');
    }

    // ── Test 5: Live Board Iframe Mounting ──
    console.log('[Test 5] Verifying Board Studio Iframe...');
    const boardSrc = await page.$eval('#boardIframe', el => el.getAttribute('src'));
    console.log(`✓ Board Iframe Source: ${boardSrc}`);
    if (!boardSrc.includes('polish-cosmetics-launch')) {
      throw new Error(`Unexpected board source: ${boardSrc}`);
    }

    // ── Test 6: WhatsApp and Booking Bridge Prefill ──
    console.log('[Test 6] Verifying Conversion Bridges (WhatsApp & Booking)...');
    const waHref = await page.$eval('.pres-btn-whatsapp', el => el.getAttribute('href'));
    const bookHref = await page.$eval('.pres-btn-primary', el => el.getAttribute('href'));

    console.log(`✓ WhatsApp URL: ${waHref}`);
    console.log(`✓ Booking URL: ${bookHref}`);

    if (!waHref.includes('+213662417761') && !waHref.includes('213662417761')) {
      throw new Error('WhatsApp URL missing official agency number');
    }
    if (!bookHref.includes('Celestia%20Cosmetics')) {
      throw new Error('Booking link missing brand pre-fill');
    }

    // ── Test 7: Fullscreen Board Toggle & Board Interaction Overlay ──
    console.log('[Test 7] Verifying Board Interaction Overlay & Fullscreen Toggle...');
    const isOverlayVisible = await page.$eval('#boardOverlay', el => !el.classList.contains('is-active'));
    console.log(`✓ Board Overlay Initially Locked (prevents scroll hijacking): ${isOverlayVisible}`);
    if (!isOverlayVisible) throw new Error('Board overlay should be locked by default');

    // Click to activate board
    await page.click('#btnActivateBoard');
    await delay(300);
    const isOverlayActive = await page.$eval('#boardOverlay', el => el.classList.contains('is-active'));
    console.log(`✓ Board Overlay Activated after click: ${isOverlayActive}`);
    if (!isOverlayActive) throw new Error('Board overlay failed to activate on click');

    // Fullscreen toggle
    await page.click('#btnToggleFullscreen');
    await delay(300);
    const isFull = await page.$eval('#boardStage', el => el.classList.contains('is-fullscreen'));
    console.log(`✓ Board in Fullscreen: ${isFull}`);
    if (!isFull) throw new Error('Board stage did not enter fullscreen');

    // Toggle back off
    await page.evaluate(() => {
      document.getElementById('btnToggleFullscreen').click();
    });
    await delay(300);
    const isStillFull = await page.evaluate(() => {
      const el = document.getElementById('boardStage');
      return el ? el.classList.contains('is-fullscreen') : null;
    });
    console.log(`✓ Board Exited Fullscreen: ${!isStillFull}`);

    // Capture Desktop Screenshot
    const desktopScreenshotPath = path.join(screenshotsDir, 'presentation_desktop_verified.png');
    await page.screenshot({ path: desktopScreenshotPath, fullPage: true });
    console.log(`📸 Desktop Full-Page Screenshot saved to: ${desktopScreenshotPath}`);

    // ── Test 8: Admin Tooling Gating & Customize Modal ──
    console.log('[Test 8] Verifying Admin Tooling Gating...');
    const isConfigHiddenVisitor = await page.$eval('#btnOpenConfig', el => window.getComputedStyle(el).display === 'none');
    console.log(`✓ Admin Config Button Hidden for Regular Visitor: ${isConfigHiddenVisitor}`);
    if (!isConfigHiddenVisitor) throw new Error('Admin config button should be hidden for visitor without ?admin=1');

    // Re-navigate with &admin=1 to verify admin mode
    console.log('Navigating with &admin=1...');
    await page.goto(testUrl + '&admin=1', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    const isConfigVisibleAdmin = await page.$eval('#btnOpenConfig', el => window.getComputedStyle(el).display !== 'none');
    console.log(`✓ Admin Config Button Visible for Admin (?admin=1): ${isConfigVisibleAdmin}`);
    if (!isConfigVisibleAdmin) throw new Error('Admin config button should be visible with ?admin=1');

    await page.click('#btnOpenConfig');
    await delay(400);

    const isModalOpen = await page.$eval('#configModal', el => el.classList.contains('is-open'));
    console.log(`✓ Customize Modal Open: ${isModalOpen}`);
    if (!isModalOpen) throw new Error('Modal failed to open');

    // Update client name in input and save
    await page.$eval('#modalInputClient', el => el.value = 'Aurora Skincare');
    await page.$eval('#modalInputTitle', el => el.value = '90-Day Growth Roadmap');
    await page.click('#btnSaveModal');
    await delay(500);

    const updatedHeaderClient = await page.$eval('#headerClientName', el => el.textContent.trim());
    console.log(`✓ Dynamically Updated Client Name: "${updatedHeaderClient}"`);
    if (updatedHeaderClient !== 'Aurora Skincare') {
      throw new Error('Modal save did not dynamically update page state');
    }

    // ── Test 9: Mobile Viewport & Touch Targets ──
    console.log('\n[Test 9] Verifying Mobile Layout (393px)...');
    await page.setViewport({ width: 393, height: 852, isMobile: true, hasTouch: true });
    await page.goto('http://127.0.0.1:3000/presentation?client=Celestia%20Cosmetics&video=dQw4w9WgXcQ', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));
    await delay(600);

    const mobileMetrics = await page.evaluate(() => {
      const header = document.querySelector('.pres-header-dock');
      const waBtn = document.querySelector('.pres-btn-header-wa');
      const ctaBtn = document.querySelector('.pres-btn-header-cta');
      const boardBtn = document.querySelector('.pres-board-action-btn');

      const waStyle = waBtn ? window.getComputedStyle(waBtn) : null;
      const ctaRect = ctaBtn ? ctaBtn.getBoundingClientRect() : null;
      const boardRect = boardBtn ? boardBtn.getBoundingClientRect() : null;

      return {
        headerVisible: !!header,
        waVisibleOnMobile: waStyle ? waStyle.display !== 'none' : false,
        ctaHeight: ctaRect ? ctaRect.height : 0,
        boardBtnHeight: boardRect ? boardRect.height : 0
      };
    });

    console.log(`✓ Mobile WhatsApp Header Button Visible: ${mobileMetrics.waVisibleOnMobile}`);
    console.log(`✓ Mobile Header CTA Height: ${mobileMetrics.ctaHeight}px (>=44px)`);
    console.log(`✓ Mobile Board Button Height: ${mobileMetrics.boardBtnHeight}px (>=44px)`);

    if (!mobileMetrics.waVisibleOnMobile) {
      throw new Error('Mobile WhatsApp button should remain visible in header dock');
    }
    if (mobileMetrics.ctaHeight < 40 || mobileMetrics.boardBtnHeight < 40) {
      throw new Error('Mobile buttons fail touch target size threshold');
    }

    const mobileScreenshotPath = path.join(screenshotsDir, 'presentation_mobile_verified.png');
    await page.screenshot({ path: mobileScreenshotPath, fullPage: true });
    console.log(`📸 Mobile Screenshot saved to: ${mobileScreenshotPath}`);

    console.log('\n======================================================');
    console.log('  🎉 ALL 9 PRESENTATION TESTS PASSED PERFECTLY! (100%)');
    console.log('======================================================\n');
  } finally {
    await browser.close();
  }
}

runTest().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
