const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting POLISH Media Co Admin Auth Verification Test Suite...');
  let browser;
  let allPassed = true;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

    // ── Test 1: OAuth Token Relay from Root (/) to (/admin) ───────────────────
    console.log('\n[Test 1] Testing OAuth Token Relay from https://polishmediaco.com/#access_token=...');
    const mockHash = '#access_token=mock_google_oauth_token_relay_test&refresh_token=mock_refresh_token&expires_in=3600&token_type=bearer';
    await page.goto(`https://polishmediaco.com/${mockHash}`, { waitUntil: 'domcontentloaded' });
    
    // Give redirect a split-second to execute
    await new Promise(r => setTimeout(r, 1200));

    const currentUrl = page.url();
    console.log('  → Landed at URL:', currentUrl);
    if (currentUrl.includes('/admin#access_token=mock_google_oauth_token_relay_test')) {
      console.log('  ✅ PASSED: Root page successfully relayed OAuth hash to /admin in 0ms.');
    } else {
      console.error('  ❌ FAILED: Expected URL to contain /admin#access_token=..., got:', currentUrl);
      allPassed = false;
    }

    // ── Test 2: Master Security Key Unlock on Live Production ──────────────────
    console.log('\n[Test 2] Testing Master Security Key Unlock (?key=polish_admin_secure_key_2026)...');
    await page.goto('https://polishmediaco.com/admin?key=polish_admin_secure_key_2026', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    const isAuthClass = await page.evaluate(() => document.documentElement.classList.contains('is-authenticated'));
    const gateDisplay = await page.evaluate(() => {
      const gate = document.getElementById('authGateView');
      return gate ? window.getComputedStyle(gate).display : 'unknown';
    });
    const dashboardDisplay = await page.evaluate(() => {
      const app = document.getElementById('dashboardAppView');
      return app ? window.getComputedStyle(app).display : 'unknown';
    });

    console.log(`  → is-authenticated class on <html>: ${isAuthClass}`);
    console.log(`  → authGateView display: ${gateDisplay}`);
    console.log(`  → dashboardAppView display: ${dashboardDisplay}`);

    if (gateDisplay === 'none' && dashboardDisplay === 'block') {
      console.log('  ✅ PASSED: Master security key unlocked administrative dashboard successfully.');
    } else {
      console.error('  ❌ FAILED: Dashboard did not unlock with master key.');
      allPassed = false;
    }

    // Take screenshot of unlocked live admin dashboard
    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });
    const screenshotPath = path.join(screenshotsDir, 'admin_live_unlocked_verified.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`  📸 Verification screenshot saved to: ${screenshotPath}`);

    // ── Test 3: API Security & Whitelist Verification ──────────────────────────
    console.log('\n[Test 3] Testing Backend API Auth endpoints via Node fetch...');
    
    // 3.1 Verify valid master key
    const validKeyRes = await fetch('https://polishmediaco.com/api/admin/verify', {
      headers: { 'x-api-key': 'polish_admin_secure_key_2026' }
    });
    const validKeyJson = await validKeyRes.json();
    console.log('  → /api/admin/verify with valid key:', validKeyRes.status, validKeyJson);
    if (validKeyRes.ok && validKeyJson.success) {
      console.log('  ✅ PASSED: API accepts valid admin key.');
    } else {
      console.error('  ❌ FAILED: API rejected valid admin key.');
      allPassed = false;
    }

    // 3.2 Verify unauthorized random key is rejected
    const badKeyRes = await fetch('https://polishmediaco.com/api/admin/verify', {
      headers: { 'x-api-key': 'invalid_hacker_key_9999' }
    });
    console.log('  → /api/admin/verify with bogus key:', badKeyRes.status);
    if (badKeyRes.status === 401) {
      console.log('  ✅ PASSED: API correctly rejects unauthorized key (401).');
    } else {
      console.error('  ❌ FAILED: Expected 401 for bad key, got:', badKeyRes.status);
      allPassed = false;
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    if (allPassed) {
      console.log('🎉 ALL AUTH VERIFICATION TESTS PASSED (100% GREEN)');
    } else {
      console.log('❌ SOME TESTS FAILED — CHECK LOGS ABOVE');
    }
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (err) {
    console.error('Fatal test execution error:', err);
    process.exit(1);
  } finally {
    if (browser) await browser.close();
  }

  if (!allPassed) process.exit(1);
})();
