/**
 * POLISH Board Studio — Clean Draggable Camera Bubble
 * Lightweight front camera circle that can be moved anywhere across the screen.
 */

window.StudioCamera = (function () {
  let stream = null;
  let bubbleEl = null;
  let videoEl = null;
  let isActive = false;
  let isMirrored = true;
  let currentSize = 'md'; // 'sm' | 'md' | 'lg'

  // Drag physics state
  let isDragging = false;
  let startX = 0, startY = 0;
  let posX = 32, posY = 100;

  function init() {
    if (bubbleEl) return;

    bubbleEl = document.createElement('div');
    bubbleEl.id = 'cameraBubble';
    bubbleEl.className = 'camera-bubble-wrap size-md';
    bubbleEl.style.display = 'none';

    // Position from saved or default
    const saved = localStorage.getItem('polish_camera_pos');
    if (saved) {
      try {
        const p = JSON.parse(saved);
        posX = p.x;
        posY = p.y;
      } catch (_) {}
    } else {
      posX = 32;
      posY = window.innerHeight - 240;
    }

    bubbleEl.innerHTML = `
      <div class="camera-bubble-circle" id="cameraBubbleCircle">
        <video class="camera-bubble-video" id="cameraBubbleVideo" autoplay playsinline muted></video>
        <div class="camera-bubble-controls">
          <button type="button" class="camera-bubble-btn" onclick="StudioCamera.toggleSize()" title="Toggle Size">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </button>
          <button type="button" class="camera-bubble-btn" onclick="StudioCamera.toggleMirror()" title="Mirror Camera">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="8 21 3 21 3 16"/></svg>
          </button>
          <button type="button" class="camera-bubble-btn btn-close" onclick="StudioCamera.stop()" title="Close Camera">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(bubbleEl);
    videoEl = document.getElementById('cameraBubbleVideo');
    clampAndApplyPos(posX, posY);

    // Attach drag interactions
    const circle = document.getElementById('cameraBubbleCircle');
    circle.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('resize', () => clampAndApplyPos(posX, posY));
  }

  function handlePointerDown(e) {
    if (e.target.closest('.camera-bubble-controls, .camera-bubble-btn')) return;
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
    bubbleEl.classList.add('is-dragging');
    try { e.target.setPointerCapture(e.pointerId); } catch (_) {}

    function onPointerMove(ev) {
      if (!isDragging) return;
      posX = ev.clientX - startX;
      posY = ev.clientY - startY;
      clampAndApplyPos(posX, posY);
    }

    function onPointerUp(ev) {
      if (!isDragging) return;
      isDragging = false;
      bubbleEl.classList.remove('is-dragging');
      try { ev.target.releasePointerCapture(ev.pointerId); } catch (_) {}
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      localStorage.setItem('polish_camera_pos', JSON.stringify({ x: posX, y: posY }));
    }

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
  }

  function clampAndApplyPos(x, y) {
    if (!bubbleEl) return;
    const circle = bubbleEl.querySelector('.camera-bubble-circle');
    const size = circle && circle.offsetWidth ? circle.offsetWidth : (currentSize === 'sm' ? 130 : currentSize === 'lg' ? 270 : 190);
    const maxX = Math.max(10, window.innerWidth - size - 10);
    const maxY = Math.max(10, window.innerHeight - size - 10);

    posX = Math.max(10, Math.min(maxX, x));
    posY = Math.max(10, Math.min(maxY, y));

    bubbleEl.style.left = `${posX}px`;
    bubbleEl.style.top = `${posY}px`;
  }

  function notifyToast(msg) {
    if (window.StudioCore && typeof window.StudioCore.showToast === 'function') {
      window.StudioCore.showToast(msg);
      return;
    }
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
      return;
    }
    let toast = document.getElementById('studioCameraToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'studioCameraToast';
      toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#080706;border:1px solid #E2C799;color:#F5E6D3;padding:10px 20px;border-radius:30px;font-family:"Plus Jakarta Sans",sans-serif;font-size:0.82rem;font-weight:700;z-index:99999;box-shadow:0 8px 30px rgba(0,0,0,0.7);transition:opacity 0.25s ease;pointer-events:none;';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.style.opacity = '1';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.opacity = '0'; }, 3200);
  }

  async function start() {
    init();
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        notifyToast('Camera not supported in this browser.');
        return;
      }

      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      videoEl.srcObject = stream;
      try {
        await videoEl.play();
      } catch (playErr) {
        console.warn('Auto-play attempt error:', playErr);
      }

      bubbleEl.style.display = 'block';
      isActive = true;
      updateHudButtonState(true);
      notifyToast('Camera active — Drag circle anywhere');
    } catch (err) {
      console.warn('Camera access error:', err);
      notifyToast('Could not access camera. Check browser permissions.');
      stop();
    }
  }

  function stop() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
    if (videoEl) {
      videoEl.srcObject = null;
    }
    if (bubbleEl) {
      bubbleEl.style.display = 'none';
    }
    isActive = false;
    updateHudButtonState(false);
  }

  function toggle() {
    if (isActive) {
      stop();
    } else {
      start();
    }
  }

  function toggleSize() {
    if (!bubbleEl) return;
    const sizes = ['sm', 'md', 'lg'];
    let idx = sizes.indexOf(currentSize);
    currentSize = sizes[(idx + 1) % sizes.length];
    bubbleEl.classList.remove('size-sm', 'size-md', 'size-lg');
    bubbleEl.classList.add(`size-${currentSize}`);
    clampAndApplyPos(posX, posY);
  }

  function toggleMirror() {
    if (!bubbleEl) return;
    isMirrored = !isMirrored;
    bubbleEl.classList.toggle('is-unmirrored', !isMirrored);
  }

  function updateHudButtonState(active) {
    const btns = document.querySelectorAll('#btnCameraBubble, #btnPresentationCamera, .js-camera-btn, .vp-btn[onclick*="StudioCamera"], .pres-board-action-btn[onclick*="StudioCamera"]');
    btns.forEach(btn => {
      btn.classList.toggle('camera-active', active);
    });
  }

  return {
    init,
    start,
    stop,
    toggle,
    toggleSize,
    toggleMirror,
    isActive: () => isActive
  };
})();
