/**
 * POLISH Board Studio — Presentation & Pitch Engine 2.0
 * Universal 60fps camera sequencing for client closing meetings.
 * Features:
 *  - Universal slide sequence: presents frames, internal cards, AND standalone elements.
 *  - Never blocks if no frames exist: seamlessly presents all canvas elements in sequence.
 *  - Interactive champagne gold laser pointer (L)
 *  - Live pitch presentation timer with emerald status dot
 *  - Progressive card spotlighting with golden halo luminescence
 *  - Macro God View overview (G / O)
 *  - Fullscreen immersive pitch mode (F)
 *  - Jump-to-step dropdown selector with hierarchy tree
 */

window.StudioPresentation = (function () {
  let isPresenting = false;
  let currentStepIndex = 0;
  let steps = [];
  let isGodView = false;

  // Laser Pointer State
  let isLaserActive = false;
  let laserDotEl = null;

  // Pitch Timer State
  let timerInterval = null;
  let timerSeconds = 0;

  function initLaser() {
    if (!laserDotEl) {
      laserDotEl = document.querySelector('.presentation-laser-dot');
      if (!laserDotEl) {
        laserDotEl = document.createElement('div');
        laserDotEl.className = 'presentation-laser-dot';
        document.body.appendChild(laserDotEl);
      }
    }

    window.removeEventListener('mousemove', onLaserMove);
    window.addEventListener('mousemove', onLaserMove);
  }

  function onLaserMove(e) {
    if (!isPresenting || !isLaserActive || !laserDotEl) return;
    laserDotEl.style.left = `${e.clientX}px`;
    laserDotEl.style.top = `${e.clientY}px`;
  }

  function toggleLaser() {
    if (!isPresenting) return;
    isLaserActive = !isLaserActive;
    if (!laserDotEl) initLaser();

    if (laserDotEl) {
      if (isLaserActive) {
        laserDotEl.classList.add('is-active');
      } else {
        laserDotEl.classList.remove('is-active');
      }
    }

    const laserBtn = document.querySelector('.btn-laser');
    if (laserBtn) {
      laserBtn.classList.toggle('active', isLaserActive);
    }
  }

  function startTimer() {
    stopTimer();
    timerSeconds = 0;
    updateTimerDisplay();
    timerInterval = setInterval(() => {
      timerSeconds++;
      updateTimerDisplay();
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function updateTimerDisplay() {
    const el = document.getElementById('presentTimer');
    if (!el) return;
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    el.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  }

  function updateFullscreenBtn() {
    const btn = document.querySelector('.btn-fullscreen');
    if (btn) {
      btn.classList.toggle('active', !!document.fullscreenElement);
    }
  }

  document.addEventListener('fullscreenchange', updateFullscreenBtn);

  function isValidSlideElement(el) {
    if (!el || !(el instanceof HTMLElement)) return false;
    if (el.tagName.toLowerCase() === 'svg') return false;
    if (el.classList.contains('freehand-svg') || el.classList.contains('connector-svg')) return false;
    if (el.classList.contains('card-port') || el.classList.contains('resize-handle')) return false;
    if (el.classList.contains('presentation-laser-dot') || el.classList.contains('canvas-selection-box')) return false;
    if (el.classList.contains('flow-line') || el.classList.contains('freehand-stroke')) return false;

    const w = el.offsetWidth || parseFloat(el.style.width) || 0;
    const h = el.offsetHeight || parseFloat(el.style.height) || 0;
    if (w < 80 || h < 40) return false;
    if (el.style.display === 'none') return false;

    return true;
  }

  function getSlideTitle(el) {
    if (!el) return 'Slide';

    // 1. Frame Headline
    if (el.classList.contains('board-frame')) {
      const headline = el.querySelector('.frame-headline')?.innerText?.trim();
      if (headline) return headline;
      const num = el.querySelector('.frame-number')?.innerText?.trim();
      return num ? `Frame ${num}` : 'Board Frame';
    }

    // 2. Specific card titles
    const titleEl = el.querySelector(
      '.crs-title, .op-title, .ugc-brief-title, .pricing-title, .metric-title, ' +
      '.table-title, .ve-equation-title, .bs-card-title, .pipeline-node-title, ' +
      '.diagnostic-title, .rx-title, .bt-title, .cadence-title, .swimlane-title, ' +
      '.callout-text, .card-title, .element-title, h2, h3, h4'
    );
    if (titleEl && titleEl.innerText?.trim()) {
      return titleEl.innerText.trim();
    }

    // 3. Clinical Proof Metric
    if (el.classList.contains('element-clinical-proof') || el.dataset.type === 'clinical-proof') {
      const val = el.querySelector('.cp-metric-val')?.innerText?.trim();
      const desc = el.querySelector('.cp-metric-desc')?.innerText?.trim();
      if (val && desc) return `${val} • ${desc}`;
      return val || desc || 'Clinical Proof';
    }

    // 4. Sticky Note
    if (el.classList.contains('sticky-note') || el.dataset.type === 'sticky') {
      const text = el.querySelector('.sticky-content, [contenteditable], textarea')?.innerText?.trim() || el.innerText?.trim();
      if (text) return text.split('\n')[0].substring(0, 24);
      return 'Sticky Note';
    }

    // 5. Friendly Type Name
    const type = el.dataset.type || '';
    if (type === 'routine-step' || el.classList.contains('element-routine-step')) return 'Routine Step';
    if (type === 'olfactory-pyramid' || el.classList.contains('element-olfactory-pyramid')) return 'Olfactory Pyramid';
    if (type === 'ugc-brief' || el.classList.contains('element-ugc-brief')) return 'UGC Brief';
    if (type === 'pricing' || el.classList.contains('pricing-card')) return 'Retainer Offer';
    if (type === 'metric' || el.classList.contains('metric-kpi-card')) return 'Metric KPI';
    if (type === 'table' || el.classList.contains('table-card')) return 'Strategy Table';
    if (type === 'callout') return 'Callout Ribbon';
    if (type === 'form') return 'Intake Form';

    const text = el.innerText?.trim()?.split('\n')[0];
    if (text && text.length > 2 && text.length < 32) return text;

    return 'Strategy Element';
  }

  function buildPresentationSequence() {
    const frameEls = Array.from(document.querySelectorAll('.board-frame')).filter(isValidSlideElement);

    // Compute bounding boxes of frames
    const framesWithBounds = frameEls.map((frame, fIdx) => {
      const fLeft = parseFloat(frame.style.left) || frame.offsetLeft || 0;
      const fTop = parseFloat(frame.style.top) || frame.offsetTop || 0;
      const fWidth = frame.offsetWidth || parseFloat(frame.style.width) || 800;
      const fHeight = frame.offsetHeight || parseFloat(frame.style.height) || 600;
      const num = parseInt(frame.querySelector('.frame-number')?.innerText || String(fIdx + 1), 10);
      return {
        el: frame,
        left: fLeft,
        top: fTop,
        right: fLeft + fWidth,
        bottom: fTop + fHeight,
        width: fWidth,
        height: fHeight,
        num: isNaN(num) ? fIdx + 1 : num,
        children: []
      };
    });

    framesWithBounds.sort((a, b) => {
      if (a.num !== b.num) return a.num - b.num;
      if (Math.abs(a.top - b.top) > 120) return a.top - b.top;
      return a.left - b.left;
    });

    // Find all candidate non-frame elements
    const candidateEls = Array.from(document.querySelectorAll(
      '#board-canvas > .studio-element, .board-canvas > .studio-element, .studio-element, .board-element, .sticky-note, .pricing-card, .table-card, .form-field-card, .script-bubble, .element-routine-step, .element-olfactory-pyramid, .element-ugc-brief, .element-clinical-proof'
    )).filter(el => {
      if (!isValidSlideElement(el)) return false;
      if (el.classList.contains('board-frame')) return false;
      return true;
    });

    const nonFrameElements = Array.from(new Set(candidateEls));

    nonFrameElements.sort((a, b) => {
      const topA = parseFloat(a.style.top) || a.offsetTop || 0;
      const topB = parseFloat(b.style.top) || b.offsetTop || 0;
      const leftA = parseFloat(a.style.left) || a.offsetLeft || 0;
      const leftB = parseFloat(b.style.left) || b.offsetLeft || 0;
      if (Math.abs(topA - topB) > 80) return topA - topB;
      return leftA - leftB;
    });

    const standaloneElements = [];

    nonFrameElements.forEach(el => {
      const eLeft = parseFloat(el.style.left) || el.offsetLeft || 0;
      const eTop = parseFloat(el.style.top) || el.offsetTop || 0;
      const eW = el.offsetWidth || parseFloat(el.style.width) || 100;
      const eH = el.offsetHeight || parseFloat(el.style.height) || 60;
      const eCenterX = eLeft + eW / 2;
      const eCenterY = eTop + eH / 2;

      const parentFrame = framesWithBounds.find(fb =>
        eCenterX >= fb.left && eCenterX <= fb.right &&
        eCenterY >= fb.top && eCenterY <= fb.bottom
      );

      if (parentFrame) {
        parentFrame.children.push(el);
      } else {
        standaloneElements.push(el);
      }
    });

    const sequence = [];

    if (framesWithBounds.length > 0) {
      framesWithBounds.forEach((fb, fIdx) => {
        sequence.push({
          type: 'frame',
          el: fb.el,
          title: getSlideTitle(fb.el),
          frameIndex: fIdx,
          hasChildren: fb.children.length > 0,
          childrenCount: fb.children.length
        });

        fb.children.forEach((childEl, cIdx) => {
          sequence.push({
            type: 'element',
            el: childEl,
            parentFrame: fb.el,
            siblings: fb.children,
            title: getSlideTitle(childEl),
            frameIndex: fIdx,
            childIndex: cIdx
          });
        });
      });

      // Also append standalone elements
      standaloneElements.forEach(el => {
        sequence.push({
          type: 'element',
          el: el,
          parentFrame: null,
          siblings: standaloneElements,
          title: getSlideTitle(el),
          frameIndex: -1,
          childIndex: -1
        });
      });
    } else {
      // No frames exist: Every element is a presentable slide
      standaloneElements.forEach((el, idx) => {
        sequence.push({
          type: 'element',
          el: el,
          parentFrame: null,
          siblings: standaloneElements,
          title: getSlideTitle(el),
          frameIndex: -1,
          childIndex: idx
        });
      });
    }

    return sequence;
  }

  function start() {
    steps = buildPresentationSequence();

    if (steps.length === 0) {
      if (window.StudioCore && window.StudioCore.showToast) {
        window.StudioCore.showToast('Add strategy cards or frames to enter Presentation Mode', 'warning');
      }
      return;
    }

    isPresenting = true;
    document.body.classList.add('is-presenting');
    currentStepIndex = 0;
    isGodView = false;

    initLaser();
    startTimer();

    if (window.StudioInspector) window.StudioInspector.hide();
    if (window.StudioCore) window.StudioCore.deselectAll();

    populateSlideSelect();
    goToStep(0);
  }

  function stop() {
    isPresenting = false;
    document.body.classList.remove('is-presenting');

    stopTimer();
    clearSpotlight();

    if (isLaserActive) {
      toggleLaser();
    }
    if (laserDotEl) {
      laserDotEl.classList.remove('is-active');
    }

    document.querySelectorAll('.board-frame, .studio-element').forEach(f => {
      f.classList.remove('active-presentation-frame', 'active-presentation-slide', 'spotlight-dimmed', 'spotlight-active');
    });

    const godBtn = document.querySelector('.btn-godview');
    if (godBtn) godBtn.classList.remove('active');
  }

  function next() {
    if (!isPresenting) return;
    if (currentStepIndex < steps.length - 1) {
      goToStep(currentStepIndex + 1);
    }
  }

  function prev() {
    if (!isPresenting) return;
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  }

  function nextMajorSection() {
    if (!isPresenting) return;
    for (let i = currentStepIndex + 1; i < steps.length; i++) {
      if (steps[i].type === 'frame' || !steps[i].parentFrame) {
        goToStep(i);
        return;
      }
    }
    goToStep(steps.length - 1);
  }

  function prevMajorSection() {
    if (!isPresenting) return;
    for (let i = currentStepIndex - 1; i >= 0; i--) {
      if (steps[i].type === 'frame' || !steps[i].parentFrame) {
        goToStep(i);
        return;
      }
    }
    goToStep(0);
  }

  function populateSlideSelect() {
    const select = document.getElementById('presentSlideSelect');
    if (!select) return;

    select.innerHTML = '';
    steps.forEach((step, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      if (step.type === 'frame') {
        opt.textContent = `${idx + 1}. ▣ ${step.title.substring(0, 24)}`;
        opt.style.fontWeight = '700';
      } else if (step.parentFrame) {
        opt.textContent = `${idx + 1}.   ↳ ${step.title.substring(0, 22)}`;
      } else {
        opt.textContent = `${idx + 1}. ✦ ${step.title.substring(0, 24)}`;
      }
      select.appendChild(opt);
    });

    select.onchange = (e) => {
      const targetIdx = parseInt(e.target.value, 10);
      if (!isNaN(targetIdx) && targetIdx >= 0 && targetIdx < steps.length) {
        goToStep(targetIdx);
      }
    };
  }

  function focusOnElement(el, isChild = false) {
    if (!el) return;

    const isFrame = el.classList.contains('board-frame');
    const eLeft = parseFloat(el.style.left) || el.offsetLeft || 0;
    const eTop = parseFloat(el.style.top) || el.offsetTop || 0;
    const eWidth = el.offsetWidth || parseFloat(el.style.width) || 400;
    const eHeight = el.offsetHeight || parseFloat(el.style.height) || 300;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let targetScale;
    if (isFrame) {
      targetScale = Math.min((vw * 0.82) / eWidth, (vh * 0.82) / eHeight);
      targetScale = Math.min(Math.max(0.35, targetScale), 1.0);
    } else if (isChild) {
      targetScale = Math.min((vw * 0.72) / eWidth, (vh * 0.72) / eHeight);
      targetScale = Math.min(Math.max(0.48, targetScale), 0.95);
    } else {
      targetScale = Math.min((vw * 0.75) / eWidth, (vh * 0.75) / eHeight);
      targetScale = Math.min(Math.max(0.48, targetScale), 1.0);
    }

    const targetPanX = (vw - eWidth * targetScale) / 2 - eLeft * targetScale;
    const targetPanY = (vh - eHeight * targetScale) / 2 - eTop * targetScale;

    if (window.CanvasEngine && window.CanvasEngine.smoothPanTo) {
      window.CanvasEngine.smoothPanTo(targetPanX, targetPanY, targetScale, 450);
    }
  }

  function goToStep(index) {
    if (index < 0 || index >= steps.length) return;
    currentStepIndex = index;
    const step = steps[index];

    clearSpotlight();

    document.querySelectorAll('.board-frame, .studio-element').forEach(el => {
      el.classList.remove('active-presentation-frame', 'active-presentation-slide');
    });

    isGodView = false;
    const godBtn = document.querySelector('.btn-godview');
    if (godBtn) godBtn.classList.remove('active');

    if (step.type === 'frame') {
      step.el.classList.add('active-presentation-frame', 'active-presentation-slide');
      focusOnElement(step.el, false);
    } else if (step.parentFrame) {
      step.parentFrame.classList.add('active-presentation-frame');
      step.el.classList.add('active-presentation-slide', 'spotlight-active');

      const siblings = step.siblings || [];
      siblings.forEach(sib => {
        if (sib !== step.el) {
          sib.classList.add('spotlight-dimmed');
        }
      });

      focusOnElement(step.el, true);
    } else {
      step.el.classList.add('active-presentation-slide', 'spotlight-active');

      steps.forEach(s => {
        if (s.el !== step.el) {
          s.el.classList.add('spotlight-dimmed');
        }
      });

      focusOnElement(step.el, false);
    }

    updateSlideInfo();
  }

  function updateSlideInfo() {
    const info = document.getElementById('presentSlideInfo');
    if (!info) return;

    const step = steps[currentStepIndex];
    if (!step) return;

    const stepNum = `${currentStepIndex + 1} of ${steps.length}`;
    const badge = step.type === 'frame' ? 'FRAME' : (step.parentFrame ? 'CARD' : 'SLIDE');

    info.innerHTML = `<span class="slide-count">Step ${stepNum}</span><span class="slide-sep">•</span><span class="slide-badge-pill">${badge}</span><span class="slide-title">${step.title.substring(0, 28)}</span>`;

    const select = document.getElementById('presentSlideSelect');
    if (select) {
      select.value = currentStepIndex;
    }
  }

  function clearSpotlight() {
    document.querySelectorAll('.spotlight-active, .spotlight-dimmed').forEach(el => {
      el.classList.remove('spotlight-active', 'spotlight-dimmed');
    });
  }

  function toggleGodView() {
    if (!isPresenting) return;
    isGodView = !isGodView;
    const godBtn = document.querySelector('.btn-godview');

    clearSpotlight();

    if (isGodView) {
      if (godBtn) godBtn.classList.add('active');
      document.querySelectorAll('.board-frame, .studio-element').forEach(f => {
        f.classList.remove('active-presentation-frame', 'active-presentation-slide');
      });
      if (window.CanvasEngine && window.CanvasEngine.fitToContent) {
        window.CanvasEngine.fitToContent();
      }
      const info = document.getElementById('presentSlideInfo');
      if (info) {
        info.innerHTML = `<span class="slide-count">Overview</span><span class="slide-sep">•</span><span class="slide-badge-pill">GOD VIEW</span><span class="slide-title">Master System Blueprint</span>`;
      }
    } else {
      if (godBtn) godBtn.classList.remove('active');
      goToStep(currentStepIndex);
    }
  }

  // Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName) || document.activeElement?.isContentEditable) {
      return;
    }

    if (!isPresenting) {
      if (e.key === 'P' && e.shiftKey) {
        start();
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
      if (e.shiftKey) {
        nextMajorSection();
      } else {
        next();
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      if (e.shiftKey) {
        prevMajorSection();
      } else {
        prev();
      }
      e.preventDefault();
    } else if (e.key === 'PageDown') {
      nextMajorSection();
      e.preventDefault();
    } else if (e.key === 'PageUp') {
      prevMajorSection();
      e.preventDefault();
    } else if (e.key === 'l' || e.key === 'L') {
      toggleLaser();
      e.preventDefault();
    } else if (e.key === 'f' || e.key === 'F') {
      toggleFullscreen();
      e.preventDefault();
    } else if (e.key === 'g' || e.key === 'G' || e.key === 'o' || e.key === 'O') {
      toggleGodView();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      stop();
      e.preventDefault();
    }
  });

  return {
    start,
    stop,
    next,
    prev,
    nextMajorSection,
    prevMajorSection,
    goToStep,
    toggleGodView,
    toggleLaser,
    toggleFullscreen,
    clearSpotlight,
    isPresenting: () => isPresenting,
    getSteps: () => steps
  };
})();
