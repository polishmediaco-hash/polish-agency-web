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
    if (!logoInfo.imgSrc || !logoInfo.imgSrc.includes('logo-gold-mark.svg')) {
      throw new Error('Floating logo mark image source is incorrect!');
    }
    if (logoInfo.hasOldHud || logoInfo.oldPillCount > 0) {
      throw new Error('Old bulky text pills were not removed!');
    }
    console.log('✅ Floating animated brand logo verified! Zero bulky pills or text walls.');

    // 3. Test Laser Activation
    console.log('Testing Laser activation...');
    await page.evaluate(() => {
      window.StudioPresentation.toggleLaser();
    });

    const laserState = await page.evaluate(() => {
      const isLaser = window.StudioPresentation.isLaserActive();
      const bodyHasClass = document.body.classList.contains('is-laser-active');
      const dot = document.querySelector('.presentation-laser-dot');
      const dotActive = dot?.classList.contains('is-active');
      const canvas = document.querySelector('.presentation-laser-canvas');
      const canvasVisible = canvas ? window.getComputedStyle(canvas).display !== 'none' : false;
      const btnActive = document.querySelector('.btn-laser')?.classList.contains('active');
      return { isLaser, bodyHasClass, dotActive, canvasVisible, btnActive };
    });

    console.log('Laser State:', laserState);
    if (!laserState.isLaser || !laserState.bodyHasClass || !laserState.dotActive || !laserState.canvasVisible || !laserState.btnActive) {
      throw new Error('Laser did not activate correctly!');
    }
    console.log('✅ Laser Pointer active with custom beam dot and trail canvas!');

    // 4. Simulate Mouse Movement & Laser Drawing
    console.log('Simulating laser movement and strokes across cards...');
    await page.mouse.move(720, 450);
    await page.mouse.down();
    for (let i = 0; i <= 20; i++) {
      const angle = (i / 20) * Math.PI * 2;
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
    // Draw golden laser circle
    await page.mouse.move(680, 400);
    await page.mouse.down();
    for (let i = 0; i <= 15; i++) {
      const angle = (i / 15) * Math.PI * 2;
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
    const brainDir = '/Users/Macbook Pro/.gemini/antigravity/brain/dae08dfc-7362-4886-9219-1e2edfe91e4f';
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