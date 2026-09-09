/**
 * POLISH Board Studio — Marquee Bounding-Box Multi-Selection Engine
 * Standard Miro bounding-box drag selection, batch movement, batch duplicate, and batch deletion.
 */

window.MarqueeEngine = (function () {
  let isSelecting = false;
  let startScreenX = 0;
  let startScreenY = 0;
  let marqueeEl = null;

  let multiSelectedIds = new Set();
  let isBatchDragging = false;
  let batchDragStart = { x: 0, y: 0 };
  let initialPositions = new Map(); // id -> {x, y}

  function init() {
    const viewport = document.getElementById('viewport');
    if (!viewport) return;

    marqueeEl = document.createElement('div');
    marqueeEl.id = 'selection-marquee';
    marqueeEl.className = 'selection-marquee';
    marqueeEl.style.display = 'none';
    viewport.appendChild(marqueeEl);

    viewport.addEventListener('pointermove', handlePointerMove);
    viewport.addEventListener('pointerup', handlePointerUp);
    viewport.addEventListener('pointercancel', handlePointerUp);
  }

  function startMarquee(e) {
    if (e.button !== 0) return;
    isSelecting = true;
    startScreenX = e.clientX;
    startScreenY = e.clientY;

    if (!e.shiftKey) {
      clearMultiSelection();
    }

    if (marqueeEl) {
      marqueeEl.style.left = `${startScreenX}px`;
      marqueeEl.style.top = `${startScreenY}px`;
      marqueeEl.style.width = '0px';
      marqueeEl.style.height = '0px';
      marqueeEl.style.display = 'block';
    }

    try {
      document.getElementById('viewport').setPointerCapture(e.pointerId);
    } catch (_) {}
  }

  function handlePointerMove(e) {
    if (!isSelecting || !marqueeEl) return;

    const curX = e.clientX;
    const curY = e.clientY;

    const left = Math.min(startScreenX, curX);
    const top = Math.min(startScreenY, curY);
    const width = Math.abs(curX - startScreenX);
    const height = Math.abs(curY - startScreenY);

    marqueeEl.style.left = `${left}px`;
    marqueeEl.style.top = `${top}px`;
    marqueeEl.style.width = `${width}px`;
    marqueeEl.style.height = `${height}px`;

    // Calculate canvas space bounding box of marquee
    if (!window.CanvasEngine) return;
    const canvasTopLeft = window.CanvasEngine.screenToCanvas(left, top);
    const canvasBottomRight = window.CanvasEngine.screenToCanvas(left + width, top + height);

    const mMinX = Math.min(canvasTopLeft.x, canvasBottomRight.x);
    const mMinY = Math.min(canvasTopLeft.y, canvasBottomRight.y);
    const mMaxX = Math.max(canvasTopLeft.x, canvasBottomRight.x);
    const mMaxY = Math.max(canvasTopLeft.y, canvasBottomRight.y);

    // Check intersection with all studio elements
    document.querySelectorAll('.studio-element').forEach(el => {
      const elX = parseFloat(el.style.left) || 0;
      const elY = parseFloat(el.style.top) || 0;
      const elW = el.offsetWidth || 200;
      const elH = el.offsetHeight || 150;

      const intersects = (
        elX < mMaxX &&
        elX + elW > mMinX &&
        elY < mMaxY &&
        elY + elH > mMinY
      );

      if (intersects) {
        multiSelectedIds.add(el.id);
        el.classList.add('is-multi-selected');
      } else if (!e.shiftKey) {
        multiSelectedIds.delete(el.id);
        el.classList.remove('is-multi-selected');
      }
    });
  }

  function handlePointerUp(e) {
    if (!isSelecting) return;
    isSelecting = false;

    if (marqueeEl) {
      marqueeEl.style.display = 'none';
    }

    try {
      document.getElementById('viewport').releasePointerCapture(e.pointerId);
    } catch (_) {}

    // If elements were selected, notify StudioCore and StudioAI
    if (multiSelectedIds.size > 0 && window.StudioCore) {
      window.StudioCore.setMultiSelected(Array.from(multiSelectedIds));
    }
    if (window.StudioAI && window.StudioAI.onCanvasSelectionChange) {
      window.StudioAI.onCanvasSelectionChange(Array.from(multiSelectedIds));
    }
  }

  function clearMultiSelection() {
    multiSelectedIds.clear();
    document.querySelectorAll('.is-multi-selected').forEach(el => el.classList.remove('is-multi-selected'));
    if (window.StudioCore && window.StudioCore.clearMultiSelection) {
      window.StudioCore.clearMultiSelection();
    }
    if (window.StudioAI && window.StudioAI.onCanvasSelectionChange) {
      window.StudioAI.onCanvasSelectionChange([]);
    }
  }

  function startBatchDrag(startClientX, startClientY) {
    if (multiSelectedIds.size === 0) return false;
    isBatchDragging = true;
    batchDragStart = { x: startClientX, y: startClientY };

    initialPositions.clear();
    multiSelectedIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        initialPositions.set(id, {
          x: parseFloat(el.style.left) || 0,
          y: parseFloat(el.style.top) || 0
        });
      }
    });
    return true;
  }

  function moveBatchDrag(curClientX, curClientY) {
    if (!isBatchDragging || !window.CanvasEngine) return;
    const scale = window.CanvasEngine.getScale();
    const deltaX = (curClientX - batchDragStart.x) / scale;
    const deltaY = (curClientY - batchDragStart.y) / scale;

    initialPositions.forEach((initPos, id) => {
      const el = document.getElementById(id);
      if (el) {
        el.style.left = `${Math.round(initPos.x + deltaX)}px`;
        el.style.top = `${Math.round(initPos.y + deltaY)}px`;
      }
    });

    if (window.ConnectorEngine) {
      window.ConnectorEngine.updateAllPositions();
    }
  }

  function endBatchDrag() {
    if (!isBatchDragging) return;
    isBatchDragging = false;

    // Sync positions back to StudioCore board model
    if (window.StudioCore) {
      multiSelectedIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          window.StudioCore.updateElementPosition(id, parseFloat(el.style.left), parseFloat(el.style.top));
        }
      });
      window.StudioCore.saveBoardDebounced();
    }
  }

  return {
    init,
    startMarquee,
    clearMultiSelection,
    hasSelection: () => multiSelectedIds.size > 0,
    getSelectedIds: () => Array.from(multiSelectedIds),
    startBatchDrag,
    moveBatchDrag,
    endBatchDrag
  };
})();
