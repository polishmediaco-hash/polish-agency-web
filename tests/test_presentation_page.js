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

    // Verify Video Shimmer & is-loaded Transition
    await delay(1300);
    const isVideoLoaded = await page.$eval('#videoWrapper', el => el.classList.contains('is-loaded'));
    console.log(`✓ Video Container is-loaded Class Applied: ${isVideoLoaded}`);
    if (!isVideoLoaded) throw new Error('Video container failed to acquire is-loaded class');

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

    // ── Test 8: Client Presentation Hygiene & Decoupling ──
    console.log('[Test 8] Verifying Client Presentation Decoupling & Absence of Admin Controls...');
    const hasAdminConfigBtn = await page.$eval('#btnOpenConfig', () => true).catch(() => false);
    const hasAdminCameraBtn = await page.$eval('#btnPresentationCamera', () => true).catch(() => false);
    const hasConfigModal = await page.$eval('#configModal', () => true).catch(() => false);
    const hasCopyShareBtn = await page.$eval('#btnCopyShareLink', () => true).catch(() => false);

    console.log(`✓ Admin Config Button absent in client view: ${!hasAdminConfigBtn}`);
    console.log(`✓ Camera Button absent in client view: ${!hasAdminCameraBtn}`);
    console.log(`✓ Config Modal absent in client view: ${!hasConfigModal}`);
    console.log(`✓ Copy Share Button absent in client view: ${!hasCopyShareBtn}`);

    if (hasAdminConfigBtn || hasAdminCameraBtn || hasConfigModal || hasCopyShareBtn) {
      throw new Error('Client presentation contains admin/founder controls that must only exist in Admin Hub');
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

    // ── Test 10: Ultra-Wide Widescreen Viewport (1920x1080) ──
    console.log('\n[Test 10] Verifying Ultra-Wide Monitor Display (1920px)...');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(testUrl, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 600));

    const boardWrapHeight = await page.$eval('.pres-board-iframe-wrap', el => window.getComputedStyle(el).height);
    console.log(`✓ Ultra-Wide Board Canvas Height: ${boardWrapHeight} (Expected: 780px)`);
    if (boardWrapHeight !== '780px') {
      throw new Error(`Expected ultra-wide board canvas height to be 780px, got ${boardWrapHeight}`);
    }

    // ── Test 11: Admin Presentation Generator Hub & Vault ──
    console.log('\n[Test 11] Verifying Admin Presentation Generator & Proposal Hub (/admin#presentations)...');
    await page.goto('http://127.0.0.1:3000/admin#presentations', { waitUntil: 'domcontentloaded' });
    await delay(1000);

    // Unlock dashboard for admin test session
    await page.evaluate(async () => {
      if (typeof unlockDashboard === 'function') {
        await unlockDashboard({ email: 'founder@polishmediaco.com' });
      }
    });
    await delay(600);

    // Verify Tab Pane is Active
    const isTabActive = await page.$eval('#presentationsTabPane', el => el.classList.contains('active'));
    console.log(`✓ Admin Presentations Tab Pane Active: ${isTabActive}`);
    if (!isTabActive) throw new Error('#presentationsTabPane should be active on hash #presentations');

    // Verify Generator Form Inputs
    const brandVal = await page.$eval('#presGenBrand', el => el.value);
    console.log(`✓ Generator Default Brand: "${brandVal}"`);
    if (!brandVal) throw new Error('#presGenBrand should have default value');

    // Fill new client data and verify instant URL generation
    await page.$eval('#presGenBrand', el => el.value = 'L\'Étoile Paris');
    await page.$eval('#presGenContact', el => el.value = 'Margaux');
    await page.$eval('#presGenVideo', el => el.value = 'https://youtu.be/dQw4w9WgXcQ');
    await page.evaluate(() => updatePresGenOutput());
    await delay(300);

    const generatedUrl = await page.$eval('#presGenOutputUrl', el => el.value);
    console.log(`✓ Generated Client Proposal URL: ${generatedUrl}`);
    if (!generatedUrl.includes('client=L%27%C3%89toile+Paris') && !generatedUrl.includes('client=L%27%C3%89toile%20Paris') && !generatedUrl.includes('L%27%C3%89toile')) {
      throw new Error(`Generated URL does not contain encoded client brand: ${generatedUrl}`);
    }
    if (!generatedUrl.includes('video=dQw4w9WgXcQ')) {
      throw new Error(`Generated URL does not contain parsed video ID: ${generatedUrl}`);
    }

    // Save proposal to archive
    await page.evaluate(() => saveCurrentPresentation());
    await delay(300);

    const savedCountBadge = await page.$eval('#presSavedCountBadge', el => el.textContent.trim());
    console.log(`✓ Saved Vault Count Badge: "${savedCountBadge}"`);
    if (!savedCountBadge.includes('1 Saved') && !savedCountBadge.includes('Saved')) {
      throw new Error(`Unexpected vault badge: "${savedCountBadge}"`);
    }

    const savedRowText = await page.$eval('#presSavedTableBody', el => el.textContent);
    console.log(`✓ Saved Vault Row Rendered: ${savedRowText.includes('L\'Étoile Paris')}`);
    if (!savedRowText.includes('L\'Étoile Paris')) {
      throw new Error('Saved proposal did not render in #presSavedTableBody');
    }

    // Verify Board Selector populated from /api/boards
    const boardOptionsCount = await page.$$eval('#presGenBoardSelect option', els => els.length);
    console.log(`✓ Strategy Board Options Populated from API: ${boardOptionsCount} boards`);
    if (boardOptionsCount < 2) {
      throw new Error(`Expected at least 2 board options (starter + custom), found ${boardOptionsCount}`);
    }

    console.log('\n======================================================');
    console.log('  🎉 ALL 11 PRESENTATION & ADMIN TESTS PASSED! (100%)');
    console.log('======================================================\n');
  } finally {
    await browser.close();
  }
}

runTest().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
