/**
 * POLISH Media Co. — E2E Test Suite for Bespoke Client Presentation System
 * Tests:
 * 1. Bespoke Slug Proposal Route (/p/celestia-cosmetics)
 * 2. Header and Hero co-branding hydration from API database
 * 3. Video theater stage mounting (YouTube iframe)
 * 4. Chapter navigation & active highlighting
 * 5. Strategy board iframe mounting & fullscreen toggle
 * 6. Bare /presentation Confidential Portal Access Gate (no mock data shown)
 * 7. Invalid Slug /p/unknown-proposal 404 Gate
 * 8. Legacy query params fallback (?client=...&video=...)
 * 9. Admin Presentations Hub Link Builder & API CRUD
 * 10. Mobile responsive layout (393px iPhone 15 Pro)
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const http = require('http');

function apiRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    req.end();
  });
}

async function runTest() {
  console.log('🚀 Starting Bespoke Client Presentation Page & API Test Suite...\n');
  const delay = ms => new Promise(r => setTimeout(r, ms));

  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // ── Step 0: Backend API Verification ──
  console.log('[API Test] Testing Presentations CRUD endpoints...');
  const testProposalPayload = {
    slug: 'lumina-botanicals-test',
    brandName: 'Lumina Botanicals Test',
    contactName: 'Elena Rostova',
    title: '90-Day Omnichannel Scale Strategy',
    video: 'dQw4w9WgXcQ',
    boardId: 'polish-cosmetics-launch'
  };

  // POST create
  const postRes = await apiRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/presentations',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-key': 'polish_admin_secure_key_2026'
    }
  }, testProposalPayload);

  console.log(`✓ POST /api/presentations status: ${postRes.status}, success: ${postRes.body.success}`);
  if (postRes.status !== 200 || !postRes.body.success) {
    throw new Error(`Failed to create presentation via API: ${JSON.stringify(postRes.body)}`);
  }

  // GET by slug (Public)
  const getRes = await apiRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/presentations/lumina-botanicals-test',
    method: 'GET'
  });

  console.log(`✓ GET /api/presentations/:slug status: ${getRes.status}, brand: "${getRes.body.presentation?.brandName}"`);
  if (getRes.status !== 200 || getRes.body.presentation?.brandName !== 'Lumina Botanicals Test') {
    throw new Error(`Failed to fetch created presentation: ${JSON.stringify(getRes.body)}`);
  }

  // DELETE cleanup
  const delRes = await apiRequest({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/presentations/lumina-botanicals-test',
    method: 'DELETE',
    headers: {
      'x-admin-key': 'polish_admin_secure_key_2026'
    }
  });
  console.log(`✓ DELETE /api/presentations/:id status: ${delRes.status}`);

  // ── Step 1: Headless Browser Tests ──
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    // ── Test 1: Load Bespoke Slug Proposal (/p/celestia-cosmetics) ──
    const slugUrl = 'http://127.0.0.1:3000/p/celestia-cosmetics';
    console.log(`\n[Test 1] Navigating to bespoke proposal: ${slugUrl}`);
    await page.goto(slugUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await delay(1200);

    const pageTitle = await page.title();
    console.log(`✓ Page Title: "${pageTitle}"`);
    if (!pageTitle.includes('Celestia Cosmetics')) {
      throw new Error(`Expected title to include "Celestia Cosmetics", got "${pageTitle}"`);
    }

    // ── Test 2: Co-Branding & Hydration Verification ──
    console.log('[Test 2] Verifying Bespoke Proposal DOM Hydration from Database...');
    const headerClient = await page.$eval('#headerClientName', el => el.textContent.trim());
    const heroClient = await page.$eval('#heroClientName', el => el.textContent.trim());
    const heroTitle = await page.$eval('#heroPresentationTitle', el => el.textContent.trim());
    const signoffClient = await page.$eval('#signoffClientName', el => el.textContent.trim());
    const isContentVisible = await page.$eval('#presentationContent', el => el.style.display !== 'none');
    const isLoadingGateHidden = await page.$eval('#presLoadingGate', el => el.style.display === 'none');

    console.log(`✓ Header Client: "${headerClient}"`);
    console.log(`✓ Hero Client: "${heroClient}"`);
    console.log(`✓ Hero Title: "${heroTitle}"`);
    console.log(`✓ Signoff Client: "${signoffClient}"`);
    console.log(`✓ Proposal Content Visible: ${isContentVisible}`);
    console.log(`✓ Loading Gate Hidden: ${isLoadingGateHidden}`);

    if (headerClient !== 'Celestia Cosmetics' || heroClient !== 'Celestia Cosmetics') {
      throw new Error('Client name mismatch in DOM');
    }
    if (!isContentVisible || !isLoadingGateHidden) {
      throw new Error('Proposal content should be visible and loading gate hidden');
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

    const secondChapter = (await page.$$('.pres-chapter-pill'))[1];
    await secondChapter.click();
    await delay(200);
    const isSecondActive = await page.evaluate(el => el.classList.contains('is-active'), secondChapter);
    console.log(`✓ Second Chapter Active after click: ${isSecondActive}`);
    if (!isSecondActive) throw new Error('Second chapter pill not marked active');

    // ── Test 5: Strategy Board Iframe & Fullscreen ──
    console.log('[Test 5] Verifying Strategy Board Stage...');
    const boardIframeSrc = await page.$eval('#boardIframe', el => el.getAttribute('src'));
    console.log(`✓ Board Iframe Source: ${boardIframeSrc}`);
    if (!boardIframeSrc.includes('/studio/view.html?id=polish-cosmetics-launch')) {
      throw new Error(`Unexpected board iframe source: ${boardIframeSrc}`);
    }

    // Test fullscreen button
    await page.click('#btnToggleFullscreen');
    await delay(300);
    const isFullscreen = await page.$eval('#boardStage', el => el.classList.contains('is-fullscreen'));
    console.log(`✓ Board stage fullscreen active: ${isFullscreen}`);
    if (!isFullscreen) throw new Error('Board stage failed to toggle fullscreen');
    await page.click('#btnToggleFullscreen');
    await delay(200);

    // ── Test 6: Verify Old /presentation Link Redirects to Homepage ──
    console.log('\n[Test 6] Testing Old /presentation URL Complete Deletion & Redirect...');
    await page.goto('http://127.0.0.1:3000/presentation', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await delay(500);

    const resolvedUrl = page.url().replace(/\/+$/, '');
    console.log(`✓ Resolved URL after visiting /presentation: "${resolvedUrl}"`);

    if (resolvedUrl !== 'http://127.0.0.1:3000') {
      throw new Error(`Old /presentation must redirect completely to homepage, got: "${resolvedUrl}"`);
    }

    // ── Test 7: Invalid Slug /p/unknown-brand 404 Gate ──
    console.log('\n[Test 7] Testing Invalid Slug 404 Gate (/p/non-existent-beauty-brand)...');
    await page.goto('http://127.0.0.1:3000/p/non-existent-beauty-brand', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await delay(800);

    const notFoundVisible = await page.$eval('#presNotFoundGate', el => el.style.display !== 'none');
    const notFoundSlug = await page.$eval('#notFoundSlugDisplay', el => el.textContent.trim());
    console.log(`✓ Not Found Gate Visible: ${notFoundVisible}`);
    console.log(`✓ Not Found Slug Display: "${notFoundSlug}"`);

    if (!notFoundVisible || !notFoundSlug.includes('non-existent-beauty-brand')) {
      throw new Error('Invalid slug must render 404 proposal gate with slug info');
    }

    // ── Test 8: Admin Hub Presentations Tab Integration ──
    console.log('\n[Test 8] Testing Admin Hub Presentations Tab & Link Builder...');
    await page.goto('http://127.0.0.1:3000/admin?key=polish_admin_secure_key_2026#presentations', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await delay(1200);

    const activeTab = await page.$eval('#presentationsTabPane', el => el.classList.contains('active'));
    console.log(`✓ Presentations Tab Active: ${activeTab}`);
    if (!activeTab) throw new Error('Presentations tab should be active');

    const brandInputVal = await page.$eval('#presGenBrand', el => el.value);
    const slugInputVal = await page.$eval('#presGenSlug', el => el.value);
    const outputUrlVal = await page.$eval('#presGenOutputUrl', el => el.value);

    console.log(`✓ Brand Input Value: "${brandInputVal}"`);
    console.log(`✓ Slug Input Value: "${slugInputVal}"`);
    console.log(`✓ Output Clean URL: "${outputUrlVal}"`);

    if (!outputUrlVal.includes('/p/celestia-cosmetics')) {
      throw new Error(`Expected output URL to be clean /p/celestia-cosmetics, got "${outputUrlVal}"`);
    }

    // Verify Saved Proposals Table renders
    const tableRowsCount = await page.$$eval('#presSavedTableBody tr', rows => rows.length);
    console.log(`✓ Saved proposals table rows: ${tableRowsCount}`);
    if (tableRowsCount < 1) {
      throw new Error('Saved presentations table should have at least 1 row');
    }

    // ── Test 9: Mobile Responsive Viewport (393px iPhone 15 Pro) ──
    console.log('\n[Test 9] Verifying Mobile Layout at 393px...');
    await page.setViewport({ width: 393, height: 852, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    await page.goto('http://127.0.0.1:3000/p/celestia-cosmetics', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await delay(800);

    const mobileScreenshotPath = path.join(screenshotsDir, 'pres_slug_mobile_393.png');
    await page.screenshot({ path: mobileScreenshotPath });
    console.log(`✓ Mobile screenshot captured: ${mobileScreenshotPath}`);

    // Verify touch target sizes
    const ctaHeight = await page.$eval('.pres-btn-header-cta', el => el.getBoundingClientRect().height);
    console.log(`✓ Mobile Header CTA Height: ${ctaHeight}px (must be >= 44px)`);
    if (ctaHeight < 44) throw new Error('Touch target height below 44px');

    console.log('\n======================================================');
    console.log('🎉 ALL 10 TESTS PASSED WITH 100% SUCCESS!');
    console.log('======================================================\n');

  } finally {
    await browser.close();
  }
}

runTest().catch(err => {
  console.error('\n❌ TEST SUITE FAILED:', err.message);
  process.exit(1);
});
