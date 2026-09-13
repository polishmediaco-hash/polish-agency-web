/**
 * POLISH Board Studio — Interactive Spatial Mini-Map
 * Real-time spatial radar, element footprint silhouettes, and click/drag viewport navigation.
 */

window.MiniMap = (function () {
  let hudContainer = null;
  let canvasEl = null;
  let ctx = null;
  let isNavigating = false;
  let isCollapsed = false;

  const MAP_WIDTH = 180;
  const MAP_HEIGHT = 110;

  function init() {
    hudContainer = document.getElementById('minimapHud');
    if (!hudContainer) {
      createMiniMapDOM();
    }
    canvasEl = document.getElementById('minimapCanvas');
    if (canvasEl) {
      canvasEl.width = MAP_WIDTH * window.devicePixelRatio;
      canvasEl.height = MAP_HEIGHT * window.devicePixelRatio;
      ctx = canvasEl.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    bindInteractions();
    bindEvents();
    update();
  }

  let updateRaf = null;
  function scheduleUpdate() {
    if (updateRaf) return;
    updateRaf = requestAnimationFrame(() => {
      updateRaf = null;
      update();
    });
  }

  function bindEvents() {
    if (!window.StudioEvents) return;
    const Ev = window.StudioEvents.Events;
    [
      Ev.VIEWPORT_CHANGED,
      Ev.MINIMAP_UPDATE,
      Ev.ELEMENT_MOVED,
      Ev.ELEMENT_RESIZED,
      Ev.ELEMENT_CREATED,
      Ev.ELEMENT_DELETED,
      Ev.THEME_CHANGED,
      Ev.BOARD_LOADED
    ].forEach(event => {
      window.StudioEvents.on(event, scheduleUpdate);
    });
  }

  function createMiniMapDOM() {
    hudContainer = document.createElement('div');
    hudContainer.id = 'minimapHud';
    hudContainer.className = 'minimap-hud';
    hudContainer.innerHTML = `
      <div class="minimap-header">
        <span class="minimap-title">NAV RADAR</span>
        <button id="btnToggleMinimap" class="minimap-toggle" title="Collapse / Expand Radar" aria-label="Toggle Radar">
          <svg class="minimap-toggle-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transition:transform 0.2s ease;">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
      <div class="minimap-body">
        <canvas id="minimapCanvas" width="${MAP_WIDTH}" height="${MAP_HEIGHT}"></canvas>
      </div>
    `;

    document.body.appendChild(hudContainer);

    const toggleBtn = document.getElementById('btnToggleMinimap');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isCollapsed = !isCollapsed;
        hudContainer.classList.toggle('is-collapsed', isCollapsed);
        const icon = toggleBtn.querySelector('svg');
        if (icon) icon.style.transform = isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)';
      });
    }
  }

  function bindInteractions() {
    if (!canvasEl) return;

    function handleMapPointer(e) {
      if (!window.CanvasEngine) return;
      const rect = canvasEl.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const bounds = window.CanvasEngine.getCanvasBounds();
      const mapScale = Math.min(MAP_WIDTH / bounds.width, MAP_HEIGHT / bounds.height);
      const offsetX = (MAP_WIDTH - bounds.width * mapScale) / 2;
      const offsetY = (MAP_HEIGHT - bounds.height * mapScale) / 2;

      // Canvas target coord
      const targetCanvasX = bounds.minX + (clickX - offsetX) / mapScale;
      const targetCanvasY = bounds.minY + (clickY - offsetY) / mapScale;

      const curScale = window.CanvasEngine.getScale();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      const targetPanX = vw / 2 - targetCanvasX * curScale;
      const targetPanY = vh / 2 - targetCanvasY * curScale;

      window.CanvasEngine.setTransform(curScale, targetPanX, targetPanY);
    }

    canvasEl.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      isNavigating = true;
      try { canvasEl.setPointerCapture(e.pointerId); } catch (_) {}
      handleMapPointer(e);
    });

    canvasEl.addEventListener('pointermove', (e) => {
      if (!isNavigating) return;
      e.stopPropagation();
      e.preventDefault();
      handleMapPointer(e);
    });

    const endNav = (e) => {
      if (isNavigating) {
        isNavigating = false;
        try { canvasEl.releasePointerCapture(e.pointerId); } catch (_) {}
      }
    };

    canvasEl.addEventListener('pointerup', endNav);
    canvasEl.addEventListener('pointercancel', endNav);
  }

  function update() {
    if (!ctx || isCollapsed || !window.CanvasEngine) return;

    ctx.clearRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    const bounds = window.CanvasEngine.getCanvasBounds();
    const mapScale = Math.min(MAP_WIDTH / bounds.width, MAP_HEIGHT / bounds.height);
    const offsetX = (MAP_WIDTH - bounds.width * mapScale) / 2;
    const offsetY = (MAP_HEIGHT - bounds.height * mapScale) / 2;

    const isDark = document.body.classList.contains('theme-dark');

    // Background dot radar
    ctx.fillStyle = isDark ? '#12100E' : '#FFFFFF';
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Grid border
    ctx.strokeStyle = isDark ? 'rgba(226, 199, 153, 0.2)' : 'rgba(26, 23, 21, 0.08)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, MAP_WIDTH - 1, MAP_HEIGHT - 1);

    // Draw element silhouettes
    const elements = document.querySelectorAll('.studio-element');
    elements.forEach(el => {
      const left = parseFloat(el.style.left) || 0;
      const top = parseFloat(el.style.top) || 0;
      const width = el.offsetWidth || 200;
      const height = el.offsetHeight || 150;

      const elX = offsetX + (left - bounds.minX) * mapScale;
      const elY = offsetY + (top - bounds.minY) * mapScale;
      const elW = Math.max(3, width * mapScale);
      const elH = Math.max(2, height * mapScale);

      // Color coding based on element type
      const type = el.dataset.type || '';
      if (type === 'frame') {
        ctx.fillStyle = isDark ? 'rgba(226, 199, 153, 0.28)' : 'rgba(197, 168, 128, 0.28)';
        ctx.strokeStyle = isDark ? '#E2C799' : '#C5A880';
        ctx.lineWidth = 1;
        ctx.fillRect(elX, elY, elW, elH);
        ctx.strokeRect(elX, elY, elW, elH);
      } else if (['pipeline-node', 'diagnostic-protocol', 'prescription', 'belief-triad', 'cadence-timeline', 'sprint-swimlane', 'ldj-matrix', 'unbundling-tree', 'flywheel-rings', 'table', 'metric'].includes(type)) {
        ctx.fillStyle = isDark ? 'rgba(226, 199, 153, 0.16)' : 'rgba(197, 168, 128, 0.2)';
        ctx.strokeStyle = isDark ? 'rgba(226, 199, 153, 0.45)' : 'rgba(197, 168, 128, 0.5)';
        ctx.lineWidth = 1;
        ctx.fillRect(elX, elY, elW, elH);
        ctx.strokeRect(elX, elY, elW, elH);
      } else if (type === 'sticky') {
        ctx.fillStyle = el.classList.contains('sticky-rose') ? '#F43F5E' : (el.classList.contains('sticky-blue') ? '#0284C7' : '#EAB308');
        ctx.fillRect(elX, elY, elW, elH);
      } else if (type === 'shape') {
        ctx.fillStyle = isDark ? 'rgba(245, 230, 211, 0.5)' : 'rgba(26, 23, 21, 0.4)';
        ctx.fillRect(elX, elY, elW, elH);
      } else if (type === 'text') {
        ctx.fillStyle = isDark ? '#E2C799' : '#1A1715';
        ctx.fillRect(elX, elY, elW, Math.max(2, elH));
      } else {
        ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.35)' : 'rgba(26, 23, 21, 0.2)';
        ctx.fillRect(elX, elY, elW, elH);
      }
    });

    // Draw Viewport Box (where current user camera is located)
    const curPan = window.CanvasEngine.getPan();
    const curScale = window.CanvasEngine.getScale();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const visibleMinX = (0 - curPan.x) / curScale;
    const visibleMinY = (0 - curPan.y) / curScale;
    const visibleMaxX = (vw - curPan.x) / curScale;
    const visibleMaxY = (vh - curPan.y) / curScale;

    const vpX = offsetX + (visibleMinX - bounds.minX) * mapScale;
    const vpY = offsetY + (visibleMinY - bounds.minY) * mapScale;
    const vpW = (visibleMaxX - visibleMinX) * mapScale;
    const vpH = (visibleMaxY - visibleMinY) * mapScale;

    ctx.fillStyle = isDark ? 'rgba(226, 199, 153, 0.12)' : 'rgba(197, 168, 128, 0.14)';
    ctx.fillRect(vpX, vpY, vpW, vpH);

    ctx.strokeStyle = isDark ? '#E2C799' : '#8A6B3D';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(vpX, vpY, vpW, vpH);
  }

  return {
    init,
    update
  };
})();
