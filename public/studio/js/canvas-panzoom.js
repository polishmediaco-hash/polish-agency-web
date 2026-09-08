/**
 * POLISH Board Studio — Infinite Canvas Pan & Zoom Engine
 * Precise sub-pixel physics with MacBook trackpad pinch & 2-finger pan.
 */

window.CanvasEngine = (function () {
  let scale = 0.75;
  let panX = 100;
  let panY = 80;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let isSpacePressed = false;

  let viewport, boardCanvas, zoomLabel;

  function init() {
    viewport = document.getElementById('viewport');
    boardCanvas = document.getElementById('board-canvas');
    zoomLabel = document.getElementById('zoomLabel');

    if (!viewport || !boardCanvas) return;

    // Pointer Down (Pan Canvas)
    viewport.addEventListener('pointerdown', (e) => {
      // Ignore if clicking inside cards, buttons, docks, inputs, or ports
      if (e.target.closest('.studio-element, .board-frame, .sticky-note, .pricing-card, .table-card, .form-field-card, .script-bubble, button, input, textarea, select, .studio-dock, .creation-toolbar, .viewport-tools, #floating-inspector, .card-port, .resize-handle, .connector-label-pill, .flow-line')) {
        return;
      }

      // Deselect elements when clicking empty canvas
      if (window.StudioCore) {
        window.StudioCore.deselectAll();
      }

      isDragging = true;
      viewport.classList.add('is-dragging');
      startX = e.clientX - panX;
      startY = e.clientY - panY;
      try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      panX = e.clientX - startX;
      panY = e.clientY - startY;
      applyTransform();
    });

    viewport.addEventListener('pointerup', (e) => {
      if (isDragging) {
        isDragging = false;
        viewport.classList.remove('is-dragging');
        try { viewport.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    });

    viewport.addEventListener('pointercancel', (e) => {
      if (isDragging) {
        isDragging = false;
        viewport.classList.remove('is-dragging');
        try { viewport.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    });

    // MacBook Trackpad Gesture Physics (Swipe to pan, pinch to zoom)
    viewport.addEventListener('wheel', (e) => {
      e.preventDefault();

      if (e.ctrlKey || e.metaKey) {
        // PINCH-TO-ZOOM on trackpad
        const zoomIntensity = 0.005;
        const factor = Math.exp(-e.deltaY * zoomIntensity);
        let newScale = scale * factor;
        newScale = Math.min(Math.max(0.15, newScale), 2.5);

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        panX = mouseX - (mouseX - panX) * (newScale / scale);
        panY = mouseY - (mouseY - panY) * (newScale / scale);
        scale = newScale;

        applyTransform();
      } else {
        // TWO-FINGER SWIPE / SCROLL on trackpad
        panX -= e.deltaX;
        panY -= e.deltaY;
        applyTransform();
      }
    }, { passive: false });

    // Spacebar Hand Tool
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) && !document.activeElement?.isContentEditable) {
        isSpacePressed = true;
        viewport.style.cursor = 'grab';
      }
    });

    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space') {
        isSpacePressed = false;
        viewport.style.cursor = '';
      }
    });

    applyTransform();
  }

  function applyTransform() {
    if (!boardCanvas) return;
    boardCanvas.style.transform = `translate3d(${panX}px, ${panY}px, 0) scale(${scale})`;
    if (viewport) {
      viewport.style.backgroundPosition = `${panX}px ${panY}px`;
      viewport.style.backgroundSize = `${34 * scale}px ${34 * scale}px`;
    }
    if (zoomLabel) {
      zoomLabel.textContent = Math.round(scale * 100) + '%';
    }
    if (window.StudioInspector) {
      window.StudioInspector.updatePosition();
    }
  }

  function zoomDelta(delta) {
    let newScale = Math.min(Math.max(0.15, scale + delta), 2.5);
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    panX = centerX - (centerX - panX) * (newScale / scale);
    panY = centerY - (centerY - panY) * (newScale / scale);
    scale = newScale;
    applyTransform();
  }

  function resetView() {
    scale = 0.75;
    panX = 100;
    panY = 80;
    applyTransform();
  }

  function screenToCanvas(screenX, screenY) {
    return {
      x: (screenX - panX) / scale,
      y: (screenY - panY) / scale
    };
  }

  function canvasToScreen(canvasX, canvasY) {
    return {
      x: canvasX * scale + panX,
      y: canvasY * scale + panY
    };
  }

  function smoothPanTo(targetX, targetY, targetScale, duration = 450) {
    const startScale = scale;
    const startPanX = panX;
    const startPanY = panY;
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // Smooth cubic ease-out

      scale = startScale + (targetScale - startScale) * ease;
      panX = startPanX + (targetX - startPanX) * ease;
      panY = startPanY + (targetY - startPanY) * ease;
      applyTransform();

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }
    requestAnimationFrame(step);
  }

  return {
    init,
    getScale: () => scale,
    getPan: () => ({ x: panX, y: panY }),
    setTransform: (s, x, y) => { scale = s; panX = x; panY = y; applyTransform(); },
    zoomDelta,
    resetView,
    screenToCanvas,
    canvasToScreen,
    smoothPanTo
  };
})();
