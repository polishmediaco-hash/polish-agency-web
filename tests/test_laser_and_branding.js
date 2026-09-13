const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Running test for Floating Brand Logo & Laser Pointer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('polish_studio_user', JSON.stringify({
        id: 'test-advisor',
        displayName: 'Executive Advisor',
        email: 'advisor@polishmediaco.com'
      }));
    });

    await page.goto('http://localhost:3000/studio/?mode=personal', { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => !!window.StudioPresentation && !!window.StudioCore, { timeout: 8000 });
    await new Promise(r => setTimeout(r, 1000));

    // 1. Enter Presentation Mode
    console.log('Starting presentation mode...');
    await page.evaluate(() => {
      window.StudioPresentation.start();
    });

    // 2. Verify Floating Brand Logo (Zero bulky newspaper pills)
    const logoInfo = await page.evaluate(() => {
      const logoEl = document.getElementById('presentationFloatingLogo');
      const logoVisible = logoEl ? window.getComputedStyle(logoEl).display !== 'none' : false;
      const img = logoEl?.querySelector('img');
      const imgSrc = img?.getAttribute('src');
      const oldHud = document.getElementById('presentationBrandHud');
      const oldPills = document.querySelectorAll('.present-board-pill, .present-status-capsule');
      return { logoVisible, imgSrc, hasOldHud: !!oldHud, oldPillCount: oldPills.length };
    });

    console.log('Floating Logo Check:', logoInfo);
    if (!logoInfo.logoVisible) throw new Error('Floating logo is not visible during presentation mode!');
    if (!logoInfo.imgSrc || (!logoInfo.imgSrc.includes('logo-gold') && !logoInfo.imgSrc.includes('logo-dark'))) {
      throw new Error('Floating logo image source is not an official POLISH brand logo: ' + logoInfo.imgSrc);
    }
    if (logoInfo.hasOldHud || logoInfo.oldPillCount > 0) {
      throw new Error('Old bulky text pills were not removed!');
    }
    console.log('✅ Floating animated brand logo verified! Zero bulky pills or text walls.');

    // 2b. Verify Stepper Controls & Step Pill
    console.log('Verifying Stepper Controls & Step Pill...');
    const stepInfoInitial = await page.evaluate(() => {
      const idx = document.getElementById('presentStepIndex')?.textContent;
      const total = document.getElementById('presentStepTotal')?.textContent;
      const prevDisabled = document.querySelector('.btn-prev')?.disabled;
      return { idx, total, prevDisabled };
    });
    console.log('Initial Step Info:', stepInfoInitial);
    if (stepInfoInitial.idx !== '01' || !stepInfoInitial.prevDisabled) {
      throw new Error(`Step index initial state mismatch: ${JSON.stringify(stepInfoInitial)}`);
    }

    // Advance to next step
    await page.click('.btn-next');
    await new Promise(r => setTimeout(r, 200));
    const stepInfoNext = await page.evaluate(() => {
      return document.getElementById('presentStepIndex')?.textContent;
    });
    console.log('Next Step Info:', stepInfoNext);
    if (stepInfoNext !== '02') {
      throw new Error(`Step index did not advance to 02! Got: ${stepInfoNext}`);
    }

    // Go back to first step
    await page.click('.btn-prev');
    await new Promise(r => setTimeout(r, 200));

    // Test God View Toggle
    await page.evaluate(() => {
      window.StudioPresentation.toggleGodView();
    });
    const godViewIndex = await page.evaluate(() => {
      return document.getElementById('presentStepIndex')?.textContent;
    });
    console.log('God View Index:', godViewIndex);
    if (godViewIndex !== 'ALL') {
      throw new Error(`God view did not display 'ALL' in step pill! Got: ${godViewIndex}`);
    }
    // Restore back from God View
    await page.evaluate(() => {
      window.StudioPresentation.toggleGodView();
    });
    await new Promise(r => setTimeout(r, 200));

    // 3. Test Laser Activation via Direct UI Click on .btn-laser
    console.log('Testing Laser activation via direct click on .btn-laser...');
    await page.click('.btn-laser');
    await new Promise(r => setTimeout(r, 100));

    let laserState = await page.evaluate(() => {
      const isLaser = window.StudioPresentation.isLaserActive();
      const bodyHasClass = document.body.classList.contains('is-laser-active');
      const dot = document.querySelector('.presentation-laser-dot');
      const dotActive = dot?.classList.contains('is-active');
      const canvas = document.querySelector('.presentation-laser-canvas');
      const canvasVisible = canvas ? window.getComputedStyle(canvas).display !== 'none' : false;
      const btnActive = document.querySelector('.btn-laser')?.classList.contains('active');
      return { isLaser, bodyHasClass, dotActive, canvasVisible, btnActive };
    });

    console.log('Laser State after 1st click:', laserState);
    if (!laserState.isLaser || !laserState.bodyHasClass || !laserState.dotActive || !laserState.canvasVisible || !laserState.btnActive) {
      throw new Error('Laser did not activate correctly via direct button click!');
    }
    console.log('✅ Laser Pointer active with custom beam dot and trail canvas!');

    // 3b. Test Deactivating Laser via Direct UI Click on .btn-laser
    console.log('Testing Laser deactivation via 2nd direct click on .btn-laser...');
    await page.click('.btn-laser');
    await new Promise(r => setTimeout(r, 100));

    laserState = await page.evaluate(() => {
      const isLaser = window.StudioPresentation.isLaserActive();
      const bodyHasClass = document.body.classList.contains('is-laser-active');
      const btnActive = document.querySelector('.btn-laser')?.classList.contains('active');
      return { isLaser, bodyHasClass, btnActive };
    });
    console.log('Laser State after 2nd click:', laserState);
    if (laserState.isLaser || laserState.bodyHasClass || laserState.btnActive) {
      throw new Error('Laser did not deactivate upon clicking .btn-laser a second time!');
    }
    console.log('✅ Verified: Laser cleanly toggles OFF when clicked directly from the presentation bar!');

    // 3c. Re-activate laser for stroke testing
    await page.click('.btn-laser');
    await new Promise(r => setTimeout(r, 100));

    // 4. Simulate Mouse Movement & Laser Drawing
    console.log('Simulating laser movement and strokes across cards...');
    const startX = 720 + 120;
    const startY = 450;
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    for (let i = 0; i <= 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const x = 720 + Math.cos(angle) * 120;
      const y = 450 + Math.sin(angle) * 70;
      await page.mouse.move(x, y);
      await new Promise(r => setTimeout(r, 16));
    }
    await page.mouse.up();

    // Verify that NO cards were selected or dragged
    const selectionCheck = await page.evaluate(() => {
      const selected = document.querySelectorAll('.is-selected, .canvas-selection-box');
      const marquee = document.getElementById('selection-marquee');
      const marqueeVisible = marquee && window.getComputedStyle(marquee).display !== 'none';
      return { selectedCount: selected.length, marqueeVisible };
    });

    console.log('Selection check during laser action:', selectionCheck);
    if (selectionCheck.selectedCount > 0 || selectionCheck.marqueeVisible) {
      throw new Error('Laser action caused card/marquee selection! It must act purely as a laser.');
    }
    console.log('✅ Verified: Zero elements selected or dragged during laser action.');

    // Save screenshots
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });

    // Capture Light Mode Presentation with Floating Logo & Laser
    const lightPath = path.join(screenshotDir, 'presentation-branded-laser-light.png');
    await page.screenshot({ path: lightPath });
    console.log(`📸 Light presentation screenshot saved: ${lightPath}`);

    // Capture Dark Mode Presentation with Floating Logo & Laser
    await page.evaluate(() => {
      document.body.classList.add('theme-dark');
    });
    // Draw golden laser circle starting on perimeter
    const darkStartX = 680 + 140;
    const darkStartY = 400;
    await page.mouse.move(darkStartX, darkStartY);
    await page.mouse.down();
    for (let i = 0; i <= 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
      const x = 680 + Math.cos(angle) * 140;
      const y = 400 + Math.sin(angle) * 80;
      await page.mouse.move(x, y);
      await new Promise(r => setTimeout(r, 16));
    }
    await page.mouse.up();

    const darkPath = path.join(screenshotDir, 'presentation-branded-laser-dark.png');
    await page.screenshot({ path: darkPath });
    console.log(`📸 Dark presentation screenshot saved: ${darkPath}`);

    // Copy to brain artifacts
    const brainDir = '/Users/Macbook Pro/.gemini/antigravity/brain/eece1928-74a6-4f17-bb76-aca8f9543d67';
    if (fs.existsSync(brainDir)) {
      fs.copyFileSync(lightPath, path.join(brainDir, 'presentation-branded-laser-light.png'));
      fs.copyFileSync(darkPath, path.join(brainDir, 'presentation-branded-laser-dark.png'));
      console.log('Copied screenshots to artifacts directory');
    }

    // Stop presentation cleanly
    await page.evaluate(() => {
      window.StudioPresentation.stop();
    });

    console.log('\n🎉 ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();