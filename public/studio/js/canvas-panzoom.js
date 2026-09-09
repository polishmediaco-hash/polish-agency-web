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
  let activeTool = 'select'; // 'select' | 'hand' | 'pen' | 'shape' | 'text' | 'sticky' | 'frame'
  let pendingShapeType = 'rect';

  let viewport, boardCanvas, zoomLabel;

  function init() {
    viewport = document.getElementById('viewport');
    boardCanvas = document.getElementById('board-canvas');
    zoomLabel = document.getElementById('zoomLabel');

    if (!viewport || !boardCanvas) return;

    // Pointer Down (Pan or Tool Action)
    viewport.addEventListener('pointerdown', (e) => {
      // Ignore if clicking inside interactive UI elements
      if (e.target.closest('button, input, textarea, select, .studio-dock, .creation-toolbar, .viewport-tools, #floating-inspector, .minimap-hud, .template-modal, .shortcuts-modal')) {
        return;
      }

      // If in Hand mode or holding spacebar, pan canvas from anywhere
      if (activeTool === 'hand' || isSpacePressed || e.button === 1) {
        isDragging = true;
        viewport.classList.add('is-dragging');
        startX = e.clientX - panX;
        startY = e.clientY - panY;
        try { viewport.setPointerCapture(e.pointerId); } catch (_) {}
        return;
      }

      // If clicking inside cards or elements in Select mode, let element factory handle drag
      if (e.target.closest('.studio-element, .card-port, .resize-handle, .connector-label-pill, .flow-line, .freehand-stroke')) {
        return;
      }

      // Deselect elements when clicking empty canvas
      if (window.StudioCore) {
        window.StudioCore.deselectAll();
      }

      // Creation clicks
      const canvasPos = screenToCanvas(e.clientX, e.clientY);
      if (activeTool === 'text') {
        if (window.StudioCore && window.StudioCore.addText) {
          window.StudioCore.addText(canvasPos.x, canvasPos.y);
          setTool('select');
        }
        return;
      }

      if (activeTool === 'shape') {
        if (window.StudioCore && window.StudioCore.addShape) {
          window.StudioCore.addShape(pendingShapeType, canvasPos.x, canvasPos.y);
          setTool('select');
        }
        return;
      }

      // If in Select mode and clicked on empty canvas: Marquee Selection will handle it, or drag canvas if right-click
      if (activeTool === 'select' && window.MarqueeEngine) {
        window.MarqueeEngine.startMarquee(e);
      }
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
    if (window.MiniMap) {
      window.MiniMap.update();
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

  function setTool(tool, subOption) {
    activeTool = tool;
    if (subOption) pendingShapeType = subOption;

    if (viewport) {
      viewport.dataset.tool = tool;
      if (tool === 'hand') {
        viewport.style.cursor = 'grab';
      } else if (tool === 'pen' || tool === 'laser') {
        viewport.style.cursor = 'crosshair';
      } else if (tool === 'text') {
        viewport.style.cursor = 'text';
      } else if (tool === 'shape') {
        viewport.style.cursor = 'crosshair';
      } else {
        viewport.style.cursor = '';
      }
    }

    // Update active class on toolbar buttons
    document.querySelectorAll('.tool-item').forEach(btn => {
      if (btn.dataset.tool === tool) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (window.DrawingEngine) {
      window.DrawingEngine.setEnabled(tool === 'pen' || tool === 'laser');
      if (window.DrawingEngine.setLaserMode) {
        window.DrawingEngine.setLaserMode(tool === 'laser');
      }
    }
  }

  function getCanvasBounds() {
    const elements = document.querySelectorAll('.studio-element');
    const strokes = document.querySelectorAll('.freehand-stroke');

    if (elements.length === 0 && strokes.length === 0) {
      return { minX: 0, minY: 0, maxX: 2000, maxY: 1200, width: 2000, height: 1200 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    elements.forEach(el => {
      const left = parseFloat(el.style.left) || 0;
      const top = parseFloat(el.style.top) || 0;
      const width = el.offsetWidth || 300;
      const height = el.offsetHeight || 200;

      if (left < minX) minX = left;
      if (top < minY) minY = top;
      if (left + width > maxX) maxX = left + width;
      if (top + height > maxY) maxY = top + height;
    });

    strokes.forEach(stroke => {
      try {
        const bbox = stroke.getBBox();
        if (bbox.x < minX) minX = bbox.x;
        if (bbox.y < minY) minY = bbox.y;
        if (bbox.x + bbox.width > maxX) maxX = bbox.x + bbox.width;
        if (bbox.y + bbox.height > maxY) maxY = bbox.y + bbox.height;
      } catch (_) {}
    });

    // Add safe padding
    minX = Math.max(0, minX - 100);
    minY = Math.max(0, minY - 100);
    maxX += 100;
    maxY += 100;

    return {
      minX,
      minY,
      maxX,
      maxY,
      width: Math.max(1200, maxX - minX),
      height: Math.max(800, maxY - minY)
    };
  }

  function fitToContent() {
    const bounds = getCanvasBounds();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const padding = 120;
    const scaleX = (vw - padding * 2) / bounds.width;
    const scaleY = (vh - padding * 2) / bounds.height;
    let targetScale = Math.min(Math.max(0.2, Math.min(scaleX, scaleY)), 1.2);

    const targetPanX = (vw - bounds.width * targetScale) / 2 - bounds.minX * targetScale;
    const targetPanY = (vh - bounds.height * targetScale) / 2 - bounds.minY * targetScale;

    smoothPanTo(targetPanX, targetPanY, targetScale, 400);
  }

  const engine = {
    init,
    getScale: () => scale,
    getPan: () => ({ x: panX, y: panY }),
    setTransform: (s, x, y) => { scale = s; panX = x; panY = y; applyTransform(); },
    zoomDelta,
    resetView,
    fitToContent,
    getCanvasBounds,
    screenToCanvas,
    canvasToScreen,
    smoothPanTo,
    setTool,
    getTool: () => activeTool,
    getPendingShape: () => pendingShapeType
  };

  Object.defineProperty(engine, 'scale', {
    get: () => scale,
    set: (v) => { scale = v; applyTransform(); },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(engine, 'panX', {
    get: () => panX,
    set: (v) => { panX = v; applyTransform(); },
    enumerable: true,
    configurable: true
  });

  Object.defineProperty(engine, 'panY', {
    get: () => panY,
    set: (v) => { panY = v; applyTransform(); },
    enumerable: true,
    configurable: true
  });

  return engine;
})();
