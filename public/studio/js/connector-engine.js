/**
 * POLISH Board Studio — Dynamic SVG Connector & Port Engine
 * Calculates cubic bezier pathways and renders interactive connector pills.
 */

window.ConnectorEngine = (function () {
  let svgLayer = null;
  let isDrawingLine = false;
  let activeStartPort = null;
  let tempLine = null;

  function init() {
    svgLayer = document.getElementById('svg-connections');
    if (!svgLayer) return;

    // Pointer move across viewport when drawing a connection
    const viewport = document.getElementById('viewport');
    viewport.addEventListener('pointermove', (e) => {
      if (!isDrawingLine || !tempLine) return;

      const scale = window.CanvasEngine.getScale();
      const canvasPos = window.CanvasEngine.screenToCanvas(e.clientX, e.clientY);

      const startPos = getPortCenterInCanvas(activeStartPort);
      const d = calculateBezierPath(startPos.x, startPos.y, activeStartPort.dataset.port, canvasPos.x, canvasPos.y, 'free');
      tempLine.setAttribute('d', d);
    });

    viewport.addEventListener('pointerup', (e) => {
      if (!isDrawingLine) return;

      // Check if dropped onto another port
      const targetPort = document.elementFromPoint(e.clientX, e.clientY)?.closest('.card-port');

      if (targetPort && targetPort !== activeStartPort) {
        const fromParent = activeStartPort.dataset.parent;
        const toParent = targetPort.dataset.parent;

        if (fromParent && toParent && fromParent !== toParent) {
          const newConnection = {
            id: `conn-${Date.now()}`,
            from: fromParent,
            fromAnchor: activeStartPort.dataset.port,
            to: toParent,
            toAnchor: targetPort.dataset.port,
            label: 'Connection Step',
            style: 'dashed',
            color: 'slate'
          };

          if (window.StudioCore) {
            window.StudioCore.addConnection(newConnection);
          }
        }
      }

      endDrawing();
    });
  }

  function startDrawing(portEl) {
    isDrawingLine = true;
    activeStartPort = portEl;
    document.getElementById('viewport').classList.add('is-connecting');

    if (!tempLine) {
      tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      tempLine.setAttribute('class', 'temp-flow-line');
      svgLayer.appendChild(tempLine);
    }
  }

  function endDrawing() {
    isDrawingLine = false;
    activeStartPort = null;
    document.getElementById('viewport').classList.remove('is-connecting');
    if (tempLine) {
      tempLine.remove();
      tempLine = null;
    }
  }

  function renderAllConnections(connections) {
    if (!svgLayer) return;

    // Clear existing rendered lines and label pills
    svgLayer.querySelectorAll('.flow-group').forEach(el => el.remove());
    document.querySelectorAll('.connector-label-pill').forEach(el => el.remove());

    const canvas = document.getElementById('board-canvas');

    connections.forEach(conn => {
      const fromEl = document.getElementById(conn.from);
      const toEl = document.getElementById(conn.to);
      if (!fromEl || !toEl) return;

      const start = getAnchorCoords(fromEl, conn.fromAnchor || 'right');
      const end = getAnchorCoords(toEl, conn.toAnchor || 'left');

      const d = calculateBezierPath(start.x, start.y, conn.fromAnchor || 'right', end.x, end.y, conn.toAnchor || 'left');

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'flow-group');
      g.dataset.id = conn.id;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', `flow-line color-${conn.color || 'slate'}`);
      path.setAttribute('d', d);

      path.addEventListener('click', (e) => {
        if (window.StudioCore) {
          window.StudioCore.selectConnection(conn, path);
        }
        e.stopPropagation();
      });

      g.appendChild(path);
      svgLayer.appendChild(g);

      // Midpoint Label Pill
      if (conn.label) {
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;

        const pill = document.createElement('div');
        pill.className = 'connector-label-pill';
        pill.id = `label-${conn.id}`;
        pill.contentEditable = 'true';
        pill.innerText = conn.label;
        pill.style.left = `${midX}px`;
        pill.style.top = `${midY}px`;

        pill.addEventListener('input', () => {
          conn.label = pill.innerText;
          if (window.StudioCore) window.StudioCore.triggerAutoSave();
        });

        pill.addEventListener('click', (e) => {
          if (window.StudioCore) window.StudioCore.selectConnection(conn, path);
          e.stopPropagation();
        });

        canvas.appendChild(pill);
      }
    });
  }

  function updateConnectedLines(elementId) {
    if (!window.StudioCore) return;
    const connections = window.StudioCore.getConnections();
    const relevant = connections.filter(c => c.from === elementId || c.to === elementId);

    relevant.forEach(conn => {
      const fromEl = document.getElementById(conn.from);
      const toEl = document.getElementById(conn.to);
      if (!fromEl || !toEl) return;

      const start = getAnchorCoords(fromEl, conn.fromAnchor || 'right');
      const end = getAnchorCoords(toEl, conn.toAnchor || 'left');

      const d = calculateBezierPath(start.x, start.y, conn.fromAnchor || 'right', end.x, end.y, conn.toAnchor || 'left');

      const g = svgLayer.querySelector(`.flow-group[data-id="${conn.id}"]`);
      if (g) {
        const path = g.querySelector('path');
        if (path) path.setAttribute('d', d);
      }

      // Update Pill Position
      const pill = document.getElementById(`label-${conn.id}`);
      if (pill) {
        pill.style.left = `${(start.x + end.x) / 2}px`;
        pill.style.top = `${(start.y + end.y) / 2}px`;
      }
    });
  }

  function getAnchorCoords(el, anchor) {
    const left = parseFloat(el.style.left) || 0;
    const top = parseFloat(el.style.top) || 0;
    const width = el.offsetWidth;
    const height = el.offsetHeight;

    switch (anchor) {
      case 'right':
        return { x: left + width, y: top + height * 0.45 };
      case 'bottom':
        return { x: left + width / 2, y: top + height };
      case 'top':
        return { x: left + width / 2, y: top };
      case 'left':
      default:
        return { x: left, y: top + height * 0.45 };
    }
  }

  function getPortCenterInCanvas(portEl) {
    const parent = portEl.closest('.studio-element, .board-frame, .sticky-note, .pricing-card, .table-card, .form-field-card, .script-bubble');
    if (!parent) return { x: 0, y: 0 };
    return getAnchorCoords(parent, portEl.dataset.port);
  }

  function calculateBezierPath(sx, sy, sAnchor, ex, ey, eAnchor) {
    const dx = Math.abs(ex - sx);
    const dy = Math.abs(ey - sy);

    let cp1x = sx, cp1y = sy, cp2x = ex, cp2y = ey;

    if (sAnchor === 'right' && eAnchor === 'left') {
      cp1x = sx + Math.max(dx * 0.55, 60);
      cp1y = sy;
      cp2x = ex - Math.max(dx * 0.55, 60);
      cp2y = ey;
    } else if (sAnchor === 'bottom' && eAnchor === 'top') {
      cp1x = sx;
      cp1y = sy + Math.max(dy * 0.55, 60);
      cp2x = ex;
      cp2y = ey - Math.max(dy * 0.55, 60);
    } else if (sAnchor === 'right' && eAnchor === 'top') {
      cp1x = sx + Math.max(dx * 0.6, 60);
      cp1y = sy;
      cp2x = ex;
      cp2y = ey - Math.max(dy * 0.6, 60);
    } else if (sAnchor === 'bottom' && eAnchor === 'left') {
      cp1x = sx;
      cp1y = sy + Math.max(dy * 0.6, 60);
      cp2x = ex - Math.max(dx * 0.6, 60);
      cp2y = ey;
    } else {
      cp1x = sx + (ex - sx) * 0.5;
      cp1y = sy;
      cp2x = sx + (ex - sx) * 0.5;
      cp2y = ey;
    }

    return `M ${sx} ${sy} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${ex} ${ey}`;
  }

  return {
    init,
    startDrawing,
    renderAllConnections,
    updateConnectedLines
  };
})();
