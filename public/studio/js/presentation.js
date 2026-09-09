/**
 * POLISH Board Studio — Presentation & Pitch Engine
 * Smooth 60fps camera fly-to sequencing for client closing meetings.
 */

window.StudioPresentation = (function () {
  let isPresenting = false;
  let currentSlideIndex = 0;
  let slides = [];
  let isGodView = false;

  function start() {
    slides = Array.from(document.querySelectorAll('.board-frame'));
    if (slides.length === 0) {
      if (window.StudioCore && window.StudioCore.showToast) {
        window.StudioCore.showToast('Add at least one Frame to enter Presentation Mode', 'warning');
      }
      return;
    }

    // Sort slides by X coordinate (left to right) or by frameNumber
    slides.sort((a, b) => {
      const numA = parseInt(a.querySelector('.frame-number')?.innerText || '99', 10);
      const numB = parseInt(b.querySelector('.frame-number')?.innerText || '99', 10);
      return numA - numB;
    });

    isPresenting = true;
    document.body.classList.add('is-presenting');
    currentSlideIndex = 0;

    if (window.StudioInspector) window.StudioInspector.hide();
    if (window.StudioCore) window.StudioCore.deselectAll();

    flyToSlide(0);
  }

  function stop() {
    isPresenting = false;
    document.body.classList.remove('is-presenting');
  }

  function next() {
    if (!isPresenting) return;
    if (currentSlideIndex < slides.length - 1) {
      currentSlideIndex++;
      flyToSlide(currentSlideIndex);
    }
  }

  function prev() {
    if (!isPresenting) return;
    if (currentSlideIndex > 0) {
      currentSlideIndex--;
      flyToSlide(currentSlideIndex);
    }
  }

  function flyToSlide(index) {
    const frame = slides[index];
    if (!frame) return;

    const fLeft = parseFloat(frame.style.left) || 0;
    const fTop = parseFloat(frame.style.top) || 0;
    const fWidth = frame.offsetWidth;
    const fHeight = frame.offsetHeight;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Scale so frame fits comfortably within 82% of screen
    let targetScale = Math.min((vw * 0.82) / fWidth, (vh * 0.82) / fHeight);
    targetScale = Math.min(Math.max(0.45, targetScale), 1.0);

    const targetPanX = (vw - fWidth * targetScale) / 2 - fLeft * targetScale;
    const targetPanY = (vh - fHeight * targetScale) / 2 - fTop * targetScale;

    window.CanvasEngine.smoothPanTo(targetPanX, targetPanY, targetScale, 450);

    // Highlight active slide and dim others
    document.querySelectorAll('.board-frame').forEach(f => f.classList.remove('active-presentation-frame'));
    frame.classList.add('active-presentation-frame');

    isGodView = false;
    const godBtn = document.querySelector('.btn-godview');
    if (godBtn) godBtn.classList.remove('active');

    // Update Slide Info in Bar
    const info = document.getElementById('presentSlideInfo');
    const title = frame.querySelector('.frame-headline')?.innerText?.trim() || 'Frame';
    if (info) {
      info.innerHTML = `<span class="slide-count">Slide ${index + 1} of ${slides.length}</span><span class="slide-sep">•</span><span class="slide-title">${title.substring(0, 32)}</span>`;
    }
  }

  function toggleGodView() {
    if (!isPresenting) return;
    isGodView = !isGodView;
    const godBtn = document.querySelector('.btn-godview');

    if (isGodView) {
      if (godBtn) godBtn.classList.add('active');
      document.querySelectorAll('.board-frame').forEach(f => f.classList.remove('active-presentation-frame'));
      if (window.CanvasEngine && window.CanvasEngine.fitToContent) {
        window.CanvasEngine.fitToContent();
      }
      const info = document.getElementById('presentSlideInfo');
      if (info) {
        info.innerHTML = `<span class="slide-count">Overview</span><span class="slide-sep">•</span><span class="slide-title">Master System Blueprint (God View)</span>`;
      }
    } else {
      if (godBtn) godBtn.classList.remove('active');
      flyToSlide(currentSlideIndex);
    }
  }

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!isPresenting) {
      if (e.key === 'P' && e.shiftKey && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName) && !document.activeElement?.isContentEditable) {
        start();
      }
      return;
    }

    if (e.key === 'ArrowRight' || e.key === ' ') {
      next();
      e.preventDefault();
    } else if (e.key === 'ArrowLeft') {
      prev();
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
    toggleGodView,
    isPresenting: () => isPresenting
  };
})();
