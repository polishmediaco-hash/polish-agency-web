const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

(async () => {
  console.log('🚀 Starting E2E Puppeteer test for Slide Sequencer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    page.on('console', msg => {
      const text = msg.text();
      if (!text.includes('Download the React DevTools') && !text.includes('[vite]')) {
        console.log(`[Browser Console] ${text}`);
      }
    });

    page.on('pageerror', err => {
      console.error(`[Browser Page Error] ${err.message}`);
    });

    await page.evaluateOnNewDocument(() => {
      localStorage.setItem('polish_studio_user', JSON.stringify({
        id: 'test-advisor',
        displayName: 'Executive Advisor',
        email: 'advisor@polishmediaco.com'
      }));
    });

    console.log('Navigating to http://localhost:3000/studio/?mode=personal...');
    await page.goto('http://localhost:3000/studio/?mode=personal', { waitUntil: 'domcontentloaded' });

    await page.waitForFunction(() => !!window.StudioPresentation && !!window.StudioCore, { timeout: 8000 });
    console.log('✅ StudioPresentation and StudioCore initialized.');

    await new Promise(r => setTimeout(r, 1200));

    // 1. Open the Sequencer modal
    console.log('Testing openSequencer()...');
    await page.evaluate(() => {
      window.StudioPresentation.openSequencer();
    });

    // Check modal visibility
    const modalVisible = await page.$eval('#presentationOrderModal', el => {
      return el.style.display === 'flex' && !el.classList.contains('hidden');
    });
    console.log(`Modal visible: ${modalVisible}`);
    if (!modalVisible) throw new Error('Sequencer modal is not displayed!');

    // Read sequencer items
    const initialItems = await page.evaluate(() => {
      const items = window.StudioPresentation.getSequencerItems();
      const domItems = Array.from(document.querySelectorAll('#pomList .pom-item')).map(el => ({
        id: el.dataset.id,
        index: el.dataset.index,
        title: el.querySelector('.pom-item-title')?.textContent?.trim(),
        badge: el.querySelector('.pom-badge-pill')?.textContent?.trim()
      }));
      return { items, domItems };
    });

    console.log(`Found ${initialItems.domItems.length} slides/cards in sequencer:`);
    initialItems.domItems.forEach((item, i) => {
      console.log(`  [${String(i + 1).padStart(2, '0')}] [${item.badge}] ${item.title}`);
    });

    if (initialItems.domItems.length === 0) {
      throw new Error('No items populated in sequencer list!');
    }

    // Save screenshot
    const screenshotDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotDir)) fs.mkdirSync(screenshotDir, { recursive: true });
    const modalScreenshotPath = path.join(screenshotDir, 'slide-sequencer-modal.png');
    await page.screenshot({ path: modalScreenshotPath });
    console.log(`📸 Screenshot saved: ${modalScreenshotPath}`);

    // 2. Test Reordering: Move item 0 down to index 1
    const firstItemId = initialItems.domItems[0].id;
    const secondItemId = initialItems.domItems[1] ? initialItems.domItems[1].id : null;

    if (secondItemId) {
      console.log(`Testing moveStep(0, 1) to swap item 0 (${firstItemId}) and item 1 (${secondItemId})...`);
      await page.evaluate(() => {
        window.StudioPresentation.moveStep(0, 1);
      });

      const afterMove = await page.evaluate(() => {
        const items = window.StudioPresentation.getSequencerItems();
        return {
          firstId: items[0]?.id,
          secondId: items[1]?.id
        };
      });

      console.log(`After move: [0]=${afterMove.firstId}, [1]=${afterMove.secondId}`);
      if (afterMove.firstId !== secondItemId || afterMove.secondId !== firstItemId) {
        throw new Error('moveStep did not swap items correctly!');
      }
      console.log('✅ Reordering verified successfully!');
    }

    // 3. Test Visibility Toggle
    console.log(`Testing toggleStepVisibility('${firstItemId}')...`);
    await page.evaluate(id => {
      window.StudioPresentation.toggleStepVisibility(id);
    }, firstItemId);

    const isSkipped = await page.evaluate(id => {
      const items = window.StudioPresentation.getSequencerItems();
      const item = items.find(i => i.id === id);
      const button = document.querySelector(`.pom-item[data-id="${id}"] .pom-toggle-btn`);
      return {
        itemSkipped: item?.skipped,
        btnHasOffClass: button?.classList.contains('is-off')
      };
    }, firstItemId);

    console.log('Skipped state:', isSkipped);
    if (!isSkipped.itemSkipped || !isSkipped.btnHasOffClass) {
      throw new Error('toggleStepVisibility failed to mark item as skipped!');
    }
    console.log('✅ Visibility toggle verified successfully!');

    // 4. Test starting presentation from sequencer
    console.log('Testing startFromSequencer()...');
    await page.evaluate(() => {
      window.StudioPresentation.startFromSequencer();
    });

    const isPresenting = await page.evaluate(() => {
      const modal = document.getElementById('presentationOrderModal');
      return {
        modalHidden: modal.style.display === 'none',
        bodyPresenting: document.body.classList.contains('is-presenting'),
        activePresenting: window.StudioPresentation.isPresenting(),
        stepCount: window.StudioPresentation.getSteps().length
      };
    });

    console.log('Presentation state after startFromSequencer:', isPresenting);
    if (!isPresenting.modalHidden || !isPresenting.bodyPresenting || !isPresenting.activePresenting) {
      throw new Error('startFromSequencer did not initiate presentation mode properly!');
    }
    console.log(`✅ Presentation started smoothly with ${isPresenting.stepCount} active slides!`);

    // 5. Test opening Sequencer from Presentation Bar
    console.log('Testing opening sequencer from within presentation mode...');
    await page.evaluate(() => {
      window.StudioPresentation.openSequencer();
    });

    const modalReopened = await page.$eval('#presentationOrderModal', el => el.style.display === 'flex');
    if (!modalReopened) throw new Error('Sequencer did not reopen from presentation bar!');
    console.log('✅ Sequencer successfully reopened from within presentation!');

    // Close presentation cleanly
    await page.evaluate(() => {
      window.StudioPresentation.closeSequencer();
      window.StudioPresentation.stop();
    });

    console.log('\n🎉 ALL TESTS PASSED! Slide Sequencer is fully functional and verified.');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();