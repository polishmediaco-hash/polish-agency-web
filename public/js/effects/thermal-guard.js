/**
 * POLISH Luxury Web UI Engine — Mobile Thermal & Battery Guard Module
 * 
 * Provides hardware concurrency and touch-device detection, viewport adaptation,
 * and dynamic prefers-reduced-motion reactive policy enforcement to prevent GPU
 * saturation and preserve battery life on constrained devices.
 */

(function () {
  'use strict';

  function detectMobileThermalGuard() {
    const isSmallScreen = window.innerWidth <= 768;
    const isLowConcurrency = (typeof navigator !== 'undefined' && Number(navigator.hardwareConcurrency) <= 4);
    const isTouchDevice = ('ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0));
    return isSmallScreen || isLowConcurrency || isTouchDevice;
  }

  let isMobileThermalGuard = detectMobileThermalGuard();
  const isTouch = ('ontouchstart' in window || (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) || window.innerWidth <= 768);
  let prefersReducedMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
  const motionListeners = new Set();

  function applyReducedMotionPolicy() {
    if (!prefersReducedMotion) return;
    const bottleWrap = document.getElementById('heroBottleWrap');
    if (bottleWrap) {
      bottleWrap.style.transform = 'none';
      bottleWrap.style.opacity = '1';
      bottleWrap.style.willChange = 'auto';
    }
    const heroTitle = document.querySelector('.couture-h1.kinetic-title, .hero-h1.kinetic-title');
    if (heroTitle) {
      heroTitle.style.transform = 'none';
      heroTitle.style.willChange = 'auto';
      heroTitle.classList.add('is-revealed', 'is-settled');
      heroTitle.classList.remove('is-revealing');
    }
    document.querySelectorAll('.kinetic-title').forEach(t => {
      t.classList.add('is-revealed', 'is-settled');
      t.classList.remove('is-revealing');
      t.style.willChange = 'auto';
      t.querySelectorAll('.kinetic-line, .kinetic-text').forEach(el => {
        el.style.willChange = 'auto';
      });
    });
  }

  try {
    if (window.matchMedia) {
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const handleMotionChange = (e) => {
        prefersReducedMotion = e.matches;
        applyReducedMotionPolicy();
        motionListeners.forEach(fn => {
          try { fn(prefersReducedMotion); } catch (_) {}
        });
      };
      if (motionQuery.addEventListener) {
        motionQuery.addEventListener('change', handleMotionChange);
      } else if (motionQuery.addListener) {
        motionQuery.addListener(handleMotionChange);
      }
    }
  } catch (e) {}

  window.addEventListener('resize', () => {
    isMobileThermalGuard = detectMobileThermalGuard();
  }, { passive: true });

  window.PolishThermalGuard = {
    isMobile: () => isMobileThermalGuard,
    isTouch: () => isTouch,
    isReducedMotion: () => prefersReducedMotion,
    detectMobileThermalGuard,
    applyReducedMotionPolicy,
    onReducedMotionChange: (fn) => {
      if (typeof fn === 'function') {
        motionListeners.add(fn);
        return () => motionListeners.delete(fn);
      }
    }
  };
})();
