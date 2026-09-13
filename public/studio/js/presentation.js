/**
 * POLISH Board Studio — Presentation & Pitch Engine 2.0
 * Universal 60fps camera sequencing with custom pitch deck slide ordering.
 * Features:
 *  - Slide Order Sequencer Modal: Drag or tap ▲/▼ to order frames & elements.
 *  - Persistent custom pitch deck sequence per board.
 *  - Slide visibility toggle (skip secondary elements from pitch without deleting).
 *  - Universal slide sequence: presents frames, child cards, and standalone elements.
 *  - Interactive champagne gold laser pointer (L)
 *  - Live pitch presentation timer with emerald status dot
 *  - Progressive card spotlighting with golden halo luminescence
 *  - Macro God View overview (G)
 *  - Fullscreen immersive pitch mode (F)
 *  - Hierarchical step selector with tree markers
 */

window.StudioPresentation = (function () {
  let isPresenting = false;
  let currentStepIndex = 0;
  let steps = [];
  let isGodView = false;
  let sequencerItems = [];
  let draggedIndex = null;

  // Laser Pointer & Dynamic Light Trail State
  let isLaserActive = false;
  let laserDotEl = null;
  let laserCanvasEl = null;
  let laserCtx = null;
  let laserPoints = [];
  let laserAnimFrame = null;
  let isLaserDrawing = false;

  // Pitch Timer State
  let timerInterval = null;
  let timerSeconds = 0;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function initLaser() {
    if (!laserDotEl) {
      laserDotEl = document.querySelector('.presentation-laser-dot');
      if (!laserDotEl) {
        laserDotEl = document.createElement('div');
        laserDotEl.className = 'presentation-laser-dot';
        document.body.appendChild(laserDotEl);
      }
    }

    if (!laserCanvasEl) {
      laserCanvasEl = document.querySelector('.presentation-laser-canvas');
      if (!laserCanvasEl) {
        laserCanvasEl = document.createElement('canvas');
        laserCanvasEl.className = 'presentation-laser-canvas';
        document.body.appendChild(laserCanvasEl);
      }
      laserCtx = laserCanvasEl.getContext('2d');
      resizeLaserCanvas();
      window.removeEventListener('resize', resizeLaserCanvas);
      window.addEventListener('resize', resizeLaserCanvas);
    }

    window.removeEventListener('pointermove', onLaserPointerMove);
    window.addEventListener('pointermove', onLaserPointerMove, { passive: true });

    window.removeEventListener('pointerdown', onLaserPointerDown);
    window.addEventListener('pointerdown', onLaserPointerDown);

    window.removeEventListener('pointerup', onLaserPointerUp);
    window.addEventListener('pointerup', onLaserPointerUp);
  }

  function resizeLaserCanvas() {
    if (!laserCanvasEl) return;
    const dpr = window.devicePixelRatio || 1;
    laserCanvasEl.width = window.innerWidth * dpr;
    laserCanvasEl.height = window.innerHeight * dpr;
    laserCanvasEl.style.width = `${window.innerWidth}px`;
    laserCanvasEl.style.height = `${window.innerHeight}px`;
    if (laserCtx) {
      laserCtx.scale(dpr, dpr);
    }
  }

  function onLaserPointerMove(e) {
    if (!isPresenting || !isLaserActive) return;
    if (laserDotEl) {
      laserDotEl.style.left = `${e.clientX}px`;
      laserDotEl.style.top = `${e.clientY}px`;
    }

    const now = performance.now();
    laserPoints.push({
      x: e.clientX,
      y: e.clientY,
      time: now,
      isDown: isLaserDrawing
    });

    if (!laserAnimFrame) {
      laserAnimFrame = requestAnimationFrame(renderLaserLoop);
    }
  }

  function onLaserPointerDown(e) {
    if (!isPresenting || !isLaserActive) return;
    if (e.target.closest('.presentation-bar, .presentation-floating-logo, #presentationOrderModal')) return;

    isLaserDrawing = true;
    e.preventDefault();
    e.stopPropagation();

    const now = performance.now();
    laserPoints.push({
      x: e.clientX,
      y: e.clientY,
      time: now,
      isDown: true
    });

    if (!laserAnimFrame) {
      laserAnimFrame = requestAnimationFrame(renderLaserLoop);
    }
  }

  function onLaserPointerUp(e) {
    if (!isPresenting || !isLaserActive) return;
    isLaserDrawing = false;
  }

  function renderLaserLoop() {
    if (!laserCtx || !laserCanvasEl) {
      laserAnimFrame = null;
      return;
    }

    const now = performance.now();
    const TRAIL_LIFETIME = 850;

    laserPoints = laserPoints.filter(pt => now - pt.time < TRAIL_LIFETIME);

    const dpr = window.devicePixelRatio || 1;
    laserCtx.clearRect(0, 0, laserCanvasEl.width / dpr, laserCanvasEl.height / dpr);

    if (laserPoints.length > 1) {
      for (let i = 1; i < laserPoints.length; i++) {
        const p0 = laserPoints[i - 1];
        const p1 = laserPoints[i];
        const age = now - p1.time;
        const alpha = Math.max(0, 1 - (age / TRAIL_LIFETIME));

        const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
        if (dist > 180) continue;

        // Outer Champagne Gold Glow Beam
        laserCtx.save();
        laserCtx.beginPath();
        laserCtx.moveTo(p0.x, p0.y);
        laserCtx.lineTo(p1.x, p1.y);
        laserCtx.strokeStyle = `rgba(226, 199, 153, ${alpha * 0.85})`;
        laserCtx.lineWidth = (p1.isDown ? 7 : 4) * alpha;
        laserCtx.lineCap = 'round';
        laserCtx.lineJoin = 'round';
        laserCtx.shadowColor = '#E2C799';
        laserCtx.shadowBlur = 18 * alpha;
        laserCtx.stroke();
        laserCtx.restore();

        // Inner Incandescent White Beam Core
        laserCtx.save();
        laserCtx.beginPath();
        laserCtx.moveTo(p0.x, p0.y);
        laserCtx.lineTo(p1.x, p1.y);
        laserCtx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
        laserCtx.lineWidth = (p1.isDown ? 3 : 1.8) * alpha;
        laserCtx.lineCap = 'round';
        laserCtx.lineJoin = 'round';
        laserCtx.stroke();
        laserCtx.restore();
      }
    }

    if (laserPoints.length > 0 && isLaserActive && isPresenting) {
      laserAnimFrame = requestAnimationFrame(renderLaserLoop);
    } else {
      laserAnimFrame = null;
    }
  }

  function toggleLaser() {
    if (!isPresenting) return;
    isLaserActive = !isLaserActive;
    if (!laserDotEl || !laserCanvasEl) initLaser();

    document.body.classList.toggle('is-laser-active', isLaserActive);

    if (laserDotEl) {
      if (isLaserActive) {
        laserDotEl.classList.add('is-active');
      } else {
        laserDotEl.classList.remove('is-active');
      }
    }

    if (!isLaserActive) {
      laserPoints = [];
      if (laserCtx && laserCanvasEl) {
        const dpr = window.devicePixelRatio || 1;
        laserCtx.clearRect(0, 0, laserCanvasEl.width / dpr, laserCanvasEl.height / dpr);
      }
    }

    const laserBtn = document.querySelector('.btn-laser');
    if (laserBtn) {
      laserBtn.classList.toggle('active', isLaserActive);
    }
  }

  function updateBrandHud() {
    const badgeEl = document.getElementById('presentBoardTitleBadge');
    const boardTitleInput = document.getElementById('boardTitleInput');
    if (badgeEl) {
      let title = '';
      if (window.StudioCore && window.StudioCore.getCurrentBoard) {
        const board = window.StudioCore.getCurrentBoard();
        if (board && board.title) title = board.title;
      }
      if (!title && boardTitleInput && boardTitleInput.value) {
        title = boardTitleInput.value;
      }
      badgeEl.textContent = title || 'Haute Strategy Briefing';
    }
  }

  function findStepIndexByElement(el) {
    if (!el) return -1;
    return steps.findIndex(s => s.el === el || (s.el && s.el.id === el.id));
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

  function buildPresentationSequence(forceAuto = false) {
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

    const candidateSteps = [];

    if (framesWithBounds.length > 0) {
      framesWithBounds.forEach((fb, fIdx) => {
        const frameId = fb.el.id || `frame-${fIdx}`;
        fb.el.id = frameId;
        candidateSteps.push({
          id: frameId,
          type: 'frame',
          el: fb.el,
          title: getSlideTitle(fb.el),
          subtitle: `${fb.children.length} enclosed cards`,
          frameIndex: fIdx,
          hasChildren: fb.children.length > 0,
          childrenCount: fb.children.length,
          skipped: false
        });

        fb.children.forEach((childEl, cIdx) => {
          const childId = childEl.id || `child-${fIdx}-${cIdx}`;
          childEl.id = childId;
          candidateSteps.push({
            id: childId,
            type: 'element',
            el: childEl,
            parentFrame: fb.el,
            siblings: fb.children,
            title: getSlideTitle(childEl),
            subtitle: `Inside: ${getSlideTitle(fb.el)}`,
            frameIndex: fIdx,
            childIndex: cIdx,
            skipped: false
          });
        });
      });

      standaloneElements.forEach((el, sIdx) => {
        const elId = el.id || `standalone-${sIdx}`;
        el.id = elId;
        candidateSteps.push({
          id: elId,
          type: 'element',
          el: el,
          parentFrame: null,
          siblings: standaloneElements,
          title: getSlideTitle(el),
          subtitle: 'Standalone Canvas Element',
          frameIndex: -1,
          childIndex: -1,
          skipped: false
        });
      });
    } else {
      // No frames exist: Every element is a presentable slide
      standaloneElements.forEach((el, idx) => {
        const elId = el.id || `elem-${idx}`;
        el.id = elId;
        candidateSteps.push({
          id: elId,
          type: 'element',
          el: el,
          parentFrame: null,
          siblings: standaloneElements,
          title: getSlideTitle(el),
          subtitle: 'Standalone Canvas Element',
          frameIndex: -1,
          childIndex: idx,
          skipped: false
        });
      });
    }

    if (forceAuto) {
      return candidateSteps;
    }

    // Reconcile with saved custom order if present
    let savedOrder = null;
    if (window.StudioCore && window.StudioCore.getCurrentBoard) {
      const board = window.StudioCore.getCurrentBoard();
      if (board && Array.isArray(board.presentationOrder) && board.presentationOrder.length > 0) {
        savedOrder = board.presentationOrder;
      }
    }

    if (!savedOrder) {
      try {
        const boardId = (window.StudioCore && window.StudioCore.getCurrentBoardId) ?
          window.StudioCore.getCurrentBoardId() : 'starter-strategy-board';
        const cached = localStorage.getItem(`polish_pitch_order_${boardId}`);
        if (cached) savedOrder = JSON.parse(cached);
      } catch (_) {}
    }

    if (savedOrder && Array.isArray(savedOrder)) {
      const stepMap = new Map();
      candidateSteps.forEach(s => stepMap.set(s.id, s));

      const reconciled = [];
      savedOrder.forEach(entry => {
        const step = stepMap.get(entry.id);
        if (step) {
          step.skipped = !!entry.skipped;
          reconciled.push(step);
          stepMap.delete(entry.id);
        }
      });

      stepMap.forEach(newStep => {
        reconciled.push(newStep);
      });

      return reconciled;
    }

    return candidateSteps;
  }

  // ==========================================================
  // SLIDE SEQUENCER & ORDERING MODAL
  // ==========================================================

  function openSequencer() {
    sequencerItems = buildPresentationSequence(false);
    renderSequencerList();

    const modal = document.getElementById('presentationOrderModal');
    if (modal) {
      modal.style.display = 'flex';
    }

    window.addEventListener('keydown', onSequencerKeydown);
  }

  function closeSequencer() {
    const modal = document.getElementById('presentationOrderModal');
    if (modal) {
      modal.style.display = 'none';
    }
    window.removeEventListener('keydown', onSequencerKeydown);
  }

  function onSequencerKeydown(e) {
    const modal = document.getElementById('presentationOrderModal');
    if (!modal || modal.style.display === 'none') return;

    if (e.key === 'Escape') {
      closeSequencer();
      e.preventDefault();
    } else if (e.key === 'Enter') {
      startFromSequencer();
      e.preventDefault();
    }
  }

  function renderSequencerList() {
    const listEl = document.getElementById('pomList');
    const totalPill = document.getElementById('pomTotalSteps');
    const durSub = document.getElementById('pomTotalDuration');
    if (!listEl) return;

    listEl.innerHTML = '';

    const activeCount = sequencerItems.filter(i => !i.skipped).length;
    const skippedCount = sequencerItems.length - activeCount;

    if (totalPill) {
      totalPill.textContent = `${activeCount} Active ${skippedCount > 0 ? `(${skippedCount} Hidden)` : ''}`;
    }
    if (durSub) {
      durSub.textContent = `~${Math.max(1, Math.ceil(activeCount * 0.75))} min pitch`;
    }

    if (sequencerItems.length === 0) {
      listEl.innerHTML = `
        <li style="padding: 2.2rem; text-align: center; color: #8C827A; font-size: 0.85rem;">
          No frames or cards found on canvas.<br>Add strategy cards from the dock to sequence your pitch deck.
        </li>
      `;
      return;
    }

    sequencerItems.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = `pom-item ${item.skipped ? 'is-skipped' : ''}`;
      li.draggable = true;
      li.dataset.id = item.id;
      li.dataset.index = idx;

      const badgeType = item.type === 'frame' ? 'FRAME' : (item.parentFrame ? 'CARD' : 'SLIDE');
      const badgeClass = item.type === 'frame' ? 'badge-frame' : (item.parentFrame ? 'badge-card' : 'badge-slide');

      li.innerHTML = `
        <div class="pom-drag-handle" title="Drag to reorder">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>
        </div>

        <div class="pom-reorder-arrows">
          <button type="button" class="pom-arrow-btn pom-btn-up" onclick="StudioPresentation.moveStep(${idx}, -1)" title="Move up" ${idx === 0 ? 'disabled' : ''}>▲</button>
          <button type="button" class="pom-arrow-btn pom-btn-down" onclick="StudioPresentation.moveStep(${idx}, 1)" title="Move down" ${idx === sequencerItems.length - 1 ? 'disabled' : ''}>▼</button>
        </div>

        <span class="pom-step-num">${String(idx + 1).padStart(2, '0')}</span>

        <span class="pom-badge-pill ${badgeClass}">${badgeType}</span>

        <div class="pom-item-content">
          <div class="pom-item-title">${escapeHtml(item.title)}</div>
          <div class="pom-item-sub">${escapeHtml(item.subtitle)}</div>
        </div>

        <button type="button" class="pom-toggle-btn ${item.skipped ? 'is-off' : 'is-on'}" onclick="StudioPresentation.toggleStepVisibility('${item.id}')" title="${item.skipped ? 'Include in pitch' : 'Skip during pitch'}">
          ${item.skipped ?
            `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>` :
            `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
          }
        </button>
      `;

      // Drag and Drop listeners
      li.addEventListener('dragstart', (e) => {
        draggedIndex = idx;
        li.classList.add('is-dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', idx);
      });

      li.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      li.addEventListener('drop', (e) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === idx) return;
        const movedItem = sequencerItems.splice(draggedIndex, 1)[0];
        sequencerItems.splice(idx, 0, movedItem);
        saveCustomOrder();
        renderSequencerList();
      });

      li.addEventListener('dragend', () => {
        li.classList.remove('is-dragging');
        draggedIndex = null;
      });

      listEl.appendChild(li);
    });
  }

  function moveStep(fromIdx, delta) {
    const toIdx = fromIdx + delta;
    if (toIdx < 0 || toIdx >= sequencerItems.length) return;
    const item = sequencerItems.splice(fromIdx, 1)[0];
    sequencerItems.splice(toIdx, 0, item);
    saveCustomOrder();
    renderSequencerList();
  }

  function toggleStepVisibility(id) {
    const item = sequencerItems.find(i => i.id === id);
    if (!item) return;
    item.skipped = !item.skipped;
    saveCustomOrder();
    renderSequencerList();
  }

  function resetToAutoOrder() {
    if (window.StudioCore && window.StudioCore.getCurrentBoard) {
      const board = window.StudioCore.getCurrentBoard();
      if (board) {
        delete board.presentationOrder;
        if (window.StudioCore.triggerAutoSave) window.StudioCore.triggerAutoSave();
      }
    }

    try {
      const boardId = (window.StudioCore && window.StudioCore.getCurrentBoardId) ?
        window.StudioCore.getCurrentBoardId() : 'starter-strategy-board';
      localStorage.removeItem(`polish_pitch_order_${boardId}`);
    } catch (_) {}

    sequencerItems = buildPresentationSequence(true);
    renderSequencerList();

    if (window.StudioCore && window.StudioCore.showToast) {
      window.StudioCore.showToast('Pitch deck reset to natural reading order', 'info');
    }
  }

  function saveCustomOrder() {
    const orderData = sequencerItems.map(item => ({
      id: item.id,
      skipped: !!item.skipped
    }));

    if (window.StudioCore && window.StudioCore.getCurrentBoard) {
      const board = window.StudioCore.getCurrentBoard();
      if (board) {
        board.presentationOrder = orderData;
        if (window.StudioCore.triggerAutoSave) {
          window.StudioCore.triggerAutoSave();
        }
      }
    }

    try {
      const boardId = (window.StudioCore && window.StudioCore.getCurrentBoardId) ?
        window.StudioCore.getCurrentBoardId() : 'starter-strategy-board';
      localStorage.setItem(`polish_pitch_order_${boardId}`, JSON.stringify(orderData));
    } catch (_) {}
  }

  function startFromSequencer() {
    saveCustomOrder();
    closeSequencer();

    const activeSteps = sequencerItems.filter(s => !s.skipped);
    if (activeSteps.length === 0) {
      if (window.StudioCore && window.StudioCore.showToast) {
        window.StudioCore.showToast('All slides are hidden. Click the eye icon to enable at least one slide.', 'warning');
      }
      return;
    }

    startWithSteps(activeSteps);
  }

  // ==========================================================
  // PRESENTATION RUNTIME ENGINE
  // ==========================================================

  function start() {
    const activeSteps = buildPresentationSequence(false).filter(s => !s.skipped);

    if (activeSteps.length === 0) {
      if (window.StudioCore && window.StudioCore.showToast) {
        window.StudioCore.showToast('Add strategy cards or frames to enter Presentation Mode', 'warning');
      }
      return;
    }

    startWithSteps(activeSteps);
  }

  function startWithSteps(newSteps) {
    steps = newSteps;
    isPresenting = true;
    document.body.classList.add('is-presenting');
    currentStepIndex = 0;
    isGodView = false;

    updateBrandHud();
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
    document.body.classList.remove('is-laser-active');

    stopTimer();
    clearSpotlight();

    if (isLaserActive) {
      toggleLaser();
    }
    if (laserDotEl) {
      laserDotEl.classList.remove('is-active');
    }
    if (laserCtx && laserCanvasEl) {
      const dpr = window.devicePixelRatio || 1;
      laserCtx.clearRect(0, 0, laserCanvasEl.width / dpr, laserCanvasEl.height / dpr);
    }
    laserPoints = [];

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
    const idxEl = document.getElementById('presentStepIndex');
    const totalEl = document.getElementById('presentStepTotal');
    if (idxEl) {
      idxEl.textContent = String(currentStepIndex + 1).padStart(2, '0');
    }
    if (totalEl) {
      totalEl.textContent = String(steps.length).padStart(2, '0');
    }

    const prevBtn = document.querySelector('.btn-prev');
    const nextBtn = document.querySelector('.btn-next');
    if (prevBtn) prevBtn.disabled = (currentStepIndex === 0);
    if (nextBtn) nextBtn.disabled = (currentStepIndex === steps.length - 1);

    // If slide sequencer modal is visible, re-highlight active item
    const modal = document.getElementById('presentationOrderModal');
    if (modal && modal.style.display === 'flex') {
      renderSequencerList();
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
      const idxEl = document.getElementById('presentStepIndex');
      if (idxEl) {
        idxEl.textContent = 'ALL';
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

    // Modal open check
    const modal = document.getElementById('presentationOrderModal');
    if (modal && modal.style.display === 'flex') {
      return;
    }

    if (!isPresenting) {
      if (e.key === 'p' || e.key === 'P') {
        if (e.shiftKey) {
          start();
        } else {
          openSequencer();
        }
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
    } else if (e.key === 'g' || e.key === 'G') {
      toggleGodView();
      e.preventDefault();
    } else if (e.key === 'o' || e.key === 'O') {
      openSequencer();
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
    openSequencer,
    closeSequencer,
    moveStep,
    toggleStepVisibility,
    resetToAutoOrder,
    startFromSequencer,
    toggleGodView,
    toggleLaser,
    toggleFullscreen,
    clearSpotlight,
    updateBrandHud,
    findStepIndexByElement,
    isPresenting: () => isPresenting,
    isLaserActive: () => isLaserActive,
    getSteps: () => steps,
    getSequencerItems: () => sequencerItems
  };
})();
