/**
 * POLISH Media Co. — Phone App & Mobile Bottom Dock E2E Verification Suite
 * Tests:
 * 1. PWA Manifest & Service Worker Cache Version (polish-admin-v2.0)
 * 2. Mobile viewport (393px iPhone 15 Pro) Admin Dock visibility (5 tabs)
 * 3. Mobile Dock Navigation & Tab Switching to Proposals Hub
 * 4. 1-Column Responsive Collapsed Layout for Proposals Hub
 * 5. Saved Proposals 7-Column Table Hidden on Mobile
 * 6. Luxury Mobile Proposal Card Stream (award-winning-luxury-cards tokens)
 * 7. Proposal Card Touch Action Buttons (Copy, Preview, WhatsApp, Delete)
 * 8. Dynamic Dock Badge Counter (#dockPresCount)
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function runPhoneAppTest() {
  console.log('📱 Starting POLISH Phone App & Mobile Dock Test Suite...\n');
  const delay = ms => new Promise(r => setTimeout(r, ms));

  // 1. Verify Service Worker & Manifest
  console.log('[Step 1] Checking PWA manifest and Service Worker...');
  const swContent = fs.readFileSync(path.join(__dirname, '../public/sw-admin.js'), 'utf8');
  if (!swContent.includes("const CACHE_NAME = 'polish-admin-v2.0';")) {
    throw new Error('sw-admin.js does not have CACHE_NAME polish-admin-v2.0');
  }
  console.log('✓ Service Worker cache version is polish-admin-v2.0');

  const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../public/manifest-admin.json'), 'utf8'));
  const hasProposalShortcut = manifest.shortcuts && manifest.shortcuts.some(s => s.name === 'Proposals');
  if (!hasProposalShortcut) {
    throw new Error('manifest-admin.json is missing Proposals shortcut');
  }
  console.log('✓ PWA manifest has Proposals shortcut configured');

  // 2. Launch Puppeteer in Mobile Viewport
  console.log('\n[Step 2] Launching Mobile Viewport (393x852 iPhone 15 Pro)...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({
      width: 393,
      height: 852,
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true
    });

    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }

    // Navigate to admin
    await page.goto('http://127.0.0.1:3000/admin?key=polish_admin_secure_key_2026', {
      waitUntil: 'domcontentloaded',
      timeout: 15000
    });
    await delay(1200);

    // 3. Verify Mobile Bottom Dock
    console.log('\n[Step 3] Verifying Mobile Bottom Dock (#mobileBottomDock)...');
    const dockDisplay = await page.$eval('#mobileBottomDock', el => window.getComputedStyle(el).display);
    console.log(`✓ Mobile Bottom Dock display: ${dockDisplay} (expected flex)`);
    if (dockDisplay !== 'flex') {
      throw new Error(`Expected #mobileBottomDock display to be 'flex', got '${dockDisplay}'`);
    }

    const dockTabs = await page.$$eval('#mobileBottomDock .dock-tab', tabs => tabs.map(t => ({
      pane: t.getAttribute('data-pane'),
      label: t.querySelector('.dock-tab-label')?.textContent?.trim()
    })));

    console.log('✓ Dock tabs found:', dockTabs);
    if (dockTabs.length !== 5) {
      throw new Error(`Expected 5 dock tabs, got ${dockTabs.length}`);
    }

    const presTab = dockTabs.find(t => t.pane === 'presentationsTabPane');
    if (!presTab || presTab.label !== 'Proposals') {
      throw new Error('Proposals tab missing from mobile bottom dock');
    }
    console.log('✓ Proposals tab properly positioned in bottom dock');

    // 4. Tap Proposals Tab in Dock
    console.log('\n[Step 4] Tapping Proposals Tab in Bottom Dock...');
    await page.click('.dock-tab[data-pane="presentationsTabPane"]');
    await delay(600);

    const isPresPaneActive = await page.$eval('#presentationsTabPane', el => el.classList.contains('active'));
    const isDockTabActive = await page.$eval('.dock-tab[data-pane="presentationsTabPane"]', el => el.classList.contains('active'));
    console.log(`✓ Presentations Tab Active: ${isPresPaneActive}`);
    console.log(`✓ Dock Tab Proposals Active: ${isDockTabActive}`);

    if (!isPresPaneActive || !isDockTabActive) {
      throw new Error('Tapping Proposals dock tab did not activate presentationsTabPane or dock-tab');
    }

    // 5. Verify 1-Column Responsive Grid Layout
    console.log('\n[Step 5] Verifying Responsive Layout on Mobile...');
    const presHubGridCols = await page.$eval('.pres-hub-layout', el => window.getComputedStyle(el).gridTemplateColumns);
    console.log(`✓ .pres-hub-layout grid-template-columns: "${presHubGridCols}"`);
    const colCount = presHubGridCols.trim().split(/\s+/).length;
    if (colCount !== 1) {
      throw new Error(`Expected 1 column layout on mobile, got ${colCount} columns (${presHubGridCols})`);
    }
    console.log('✓ .pres-hub-layout successfully collapsed to 1 column');

    // 6. Verify Table is Hidden and Mobile Card Stream is Active
    console.log('\n[Step 6] Verifying Table is Hidden & Mobile Cards Stream Active...');
    const tableWrapDisplay = await page.$eval('.pres-saved-table-wrap', el => window.getComputedStyle(el).display);
    const mobileListDisplay = await page.$eval('.pres-mobile-list', el => window.getComputedStyle(el).display);
    console.log(`✓ .pres-saved-table-wrap display: "${tableWrapDisplay}" (expected none)`);
    console.log(`✓ .pres-mobile-list display: "${mobileListDisplay}" (expected flex)`);

    if (tableWrapDisplay !== 'none') {
      throw new Error('Desktop table wrapper should be hidden on mobile');
    }
    if (mobileListDisplay !== 'flex') {
      throw new Error('Mobile card stream should be display: flex on mobile');
    }

    // 7. Verify Mobile Card Content and Action Buttons
    console.log('\n[Step 7] Inspecting Luxury Mobile Proposal Cards...');
    const cardsCount = await page.$$eval('#presSavedMobileList .pres-mob-card', cards => cards.length);
    console.log(`✓ Mobile proposal cards rendered: ${cardsCount}`);
    if (cardsCount < 1) {
      throw new Error('Expected at least 1 saved mobile proposal card');
    }

    const firstCard = await page.$eval('#presSavedMobileList .pres-mob-card', card => {
      return {
        brand: card.querySelector('.pres-mob-brand')?.textContent?.trim(),
        slug: card.querySelector('.pres-mob-slug-pill')?.textContent?.trim(),
        actionsCount: card.querySelectorAll('.pres-mob-actions button, .pres-mob-actions a').length,
        hasWhatsApp: !!card.querySelector('.btn-wa-direct'),
        hasCopy: !!card.querySelector('.pres-mob-actions button')
      };
    });
    console.log('✓ First proposal mobile card details:', firstCard);

    if (!firstCard.brand || !firstCard.slug || firstCard.actionsCount < 4 || !firstCard.hasWhatsApp) {
      throw new Error('Proposal card is missing critical brand, slug pill, or 1-tap touch actions');
    }

    // 8. Verify Dock Badge Counter
    console.log('\n[Step 8] Checking Dock Badge Counter (#dockPresCount)...');
    const badgeText = await page.$eval('#dockPresCount', el => el.textContent.trim());
    const badgeDisplay = await page.$eval('#dockPresCount', el => window.getComputedStyle(el).display);
    console.log(`✓ Dock Proposals Badge: "${badgeText}", display: "${badgeDisplay}"`);

    if (parseInt(badgeText, 10) !== cardsCount) {
      throw new Error(`Expected dock badge to match cards count (${cardsCount}), got ${badgeText}`);
    }

    // 9. Capture High-Res Mobile Screenshot of Top Hub
    const screenshotPath = path.join(screenshotsDir, 'admin_phone_app_proposals.png');
    await page.screenshot({ path: screenshotPath });
    console.log(`✓ Mobile phone app top screenshot captured: ${screenshotPath}`);

    // 10. Scroll to Saved Proposals and Capture Mobile Card Stream Screenshot
    await page.$eval('#presSavedMobileList', el => el.scrollIntoView({ behavior: 'instant', block: 'center' }));
    await delay(500);
    const cardsScreenshotPath = path.join(screenshotsDir, 'admin_phone_app_proposal_cards.png');
    await page.screenshot({ path: cardsScreenshotPath });
    console.log(`✓ Mobile phone app cards screenshot captured: ${cardsScreenshotPath}`);

    console.log('\n======================================================');
    console.log('🎉 ALL PHONE APP VERIFICATION CHECKS PASSED 100%!');
    console.log('======================================================\n');

  } finally {
    await browser.close();
  }
}

runPhoneAppTest().catch(err => {
  console.error('\n❌ PHONE APP TEST FAILED:', err.message);
  process.exit(1);
});
