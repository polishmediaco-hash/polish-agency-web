/**
 * POLISH Board Studio — Freehand Pen Vector Drawing Engine
 * High-precision Bézier curve stroke drawing on infinite canvas with undo/redo integration.
 */

window.DrawingEngine = (function () {
  let isEnabled = false;
  let isDrawing = false;
  let currentStroke = null;
  let currentPoints = [];
  let currentSvgPath = null;
  let svgLayer = null;

  let penColor = '#1A1715';
  let penWidth = 4;
  let isLaserMode = false;

  function init() {
    let boardCanvas = document.getElementById('board-canvas');
    if (!boardCanvas) return;

    svgLayer = document.getElementById('svg-drawings');
    if (!svgLayer) {
      svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svgLayer.id = 'svg-drawings';
      svgLayer.setAttribute('class', 'drawings-layer');
      // Place right under connectors
      const connSvg = document.getElementById('svg-connections');
      if (connSvg) {
        boardCanvas.insertBefore(svgLayer, connSvg);
      } else {
        boardCanvas.appendChild(svgLayer);
      }
    }

    bindEvents();
  }

  function bindEvents() {
    const viewport = document.getElementById('viewport');
    if (!viewport) return;

    viewport.addEventListener('pointerdown', (e) => {
      if (!isEnabled || e.button !== 0) return;
      if (e.target.closest('button, input, textarea, select, .studio-dock, .creation-toolbar, .viewport-tools, #floating-inspector, .minimap-hud')) {
        return;
      }

      e.stopPropagation();
      e.preventDefault();

      isDrawing = true;
      try { viewport.setPointerCapture(e.pointerId); } catch (_) {}

      const pos = window.CanvasEngine.screenToCanvas(e.clientX, e.clientY);
      currentPoints = [pos];

      currentSvgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      currentSvgPath.setAttribute('class', isLaserMode ? 'freehand-stroke laser-stroke' : 'freehand-stroke active-stroke');
      currentSvgPath.setAttribute('stroke', isLaserMode ? '#F3D382' : penColor);
      currentSvgPath.setAttribute('stroke-width', isLaserMode ? 6 : penWidth);
      currentSvgPath.setAttribute('stroke-linecap', 'round');
      currentSvgPath.setAttribute('stroke-linejoin', 'round');
      currentSvgPath.setAttribute('fill', 'none');
      currentSvgPath.setAttribute('d', `M ${pos.x} ${pos.y}`);

      svgLayer.appendChild(currentSvgPath);
    });

    viewport.addEventListener('pointermove', (e) => {
      if (!isDrawing || !currentSvgPath) return;
      e.stopPropagation();
      e.preventDefault();

      const pos = window.CanvasEngine.screenToCanvas(e.clientX, e.clientY);
      currentPoints.push(pos);

      const d = getSmoothSvgPath(currentPoints);
      currentSvgPath.setAttribute('d', d);
    });

    const endDrawing = (e) => {
      if (!isDrawing) return;
      isDrawing = false;
      try { viewport.releasePointerCapture(e.pointerId); } catch (_) {}

      // Laser Pointer Mode: Fade and dissolve automatically
      if (isLaserMode) {
        if (currentSvgPath) {
          const laserEl = currentSvgPath;
          laserEl.style.transition = 'opacity 0.85s ease-out, stroke-width 0.85s ease-out';
          laserEl.style.opacity = '0';
          laserEl.style.strokeWidth = '1px';
          setTimeout(() => { laserEl.remove(); }, 900);
        }
        currentSvgPath = null;
        currentPoints = [];
        return;
      }

      if (currentPoints.length > 1 && currentSvgPath) {
        currentSvgPath.classList.remove('active-stroke');
        const strokeId = `stroke-${Date.now()}`;
        currentSvgPath.id = strokeId;
        currentSvgPath.dataset.id = strokeId;

        const strokeData = {
          id: strokeId,
          type: 'stroke',
          color: penColor,
          width: penWidth,
          d: currentSvgPath.getAttribute('d'),
          points: currentPoints
        };

        // Attach click to select
        attachStrokeEvents(currentSvgPath, strokeData);

        if (window.StudioCore && window.StudioCore.addDrawingStroke) {
          window.StudioCore.addDrawingStroke(strokeData);
        }
      } else if (currentSvgPath) {
        currentSvgPath.remove();
      }

      currentSvgPath = null;
      currentPoints = [];
    };

    viewport.addEventListener('pointerup', endDrawing);
    viewport.addEventListener('pointercancel', endDrawing);
  }

  // Smooth Bézier Curve computation
  function getSmoothSvgPath(points) {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y} L ${points[0].x + 0.1} ${points[0].y + 0.1}`;

    let d = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length - 1; i++) {
      const xc = (points[i].x + points[i + 1].x) / 2;
      const yc = (points[i].y + points[i + 1].y) / 2;
      d += ` Q ${points[i].x} ${points[i].y}, ${xc} ${yc}`;
    }

    const last = points[points.length - 1];
    const prev = points[points.length - 2];
    d += ` Q ${prev.x} ${prev.y}, ${last.x} ${last.y}`;

    return d;
  }

  function renderAllStrokes(strokes) {
    if (!svgLayer) return;
    svgLayer.innerHTML = '';

    (strokes || []).forEach(s => {
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.id = s.id;
      path.dataset.id = s.id;
      path.setAttribute('class', 'freehand-stroke');
      path.setAttribute('stroke', s.color || penColor);
      path.setAttribute('stroke-width', s.width || penWidth);
      path.setAttribute('stroke-linecap', 'round');
      path.setAttribute('stroke-linejoin', 'round');
      path.setAttribute('fill', 'none');
      path.setAttribute('d', s.d);

      svgLayer.appendChild(path);
      attachStrokeEvents(path, s);
    });
  }

  function attachStrokeEvents(pathEl, strokeData) {
    pathEl.addEventListener('click', (e) => {
      if (isEnabled) return; // In pen mode, don't select on click
      e.stopPropagation();

      document.querySelectorAll('.freehand-stroke').forEach(el => el.classList.remove('is-selected'));
      pathEl.classList.add('is-selected');

      if (window.StudioCore && window.StudioCore.selectStroke) {
        window.StudioCore.selectStroke(strokeData, pathEl);
      }
    });
  }

  function setPenConfig(color, width) {
    if (color) penColor = color;
    if (width) penWidth = width;
  }

  return {
    init,
    setEnabled: (enabled) => { isEnabled = enabled; },
    getEnabled: () => isEnabled,
    setLaserMode: (laser) => { isLaserMode = laser; },
    isLaserMode: () => isLaserMode,
    renderAllStrokes,
    setPenConfig,
    getPenConfig: () => ({ color: penColor, width: penWidth })
  };
})();
