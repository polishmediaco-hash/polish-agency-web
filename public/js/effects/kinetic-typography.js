/**
 * POLISH Luxury Web UI Engine — Editorial Kinetic Typography Module
 * 
 * Provides smooth, GPU-composited mask reveals for editorial typography,
 * with automatic GPU layer deallocation upon transition settlement to
 * prevent memory leaks and composite layer accumulation.
 */

(function () {
  'use strict';

  function isReducedMotion() {
    if (window.PolishThermalGuard && typeof window.PolishThermalGuard.isReducedMotion === 'function') {
      return window.PolishThermalGuard.isReducedMotion();
    }
    return window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
  }

  function revealKineticTitle(titleEl) {
    if (!titleEl || titleEl.classList.contains('is-revealed')) return;

    const lines = titleEl.querySelectorAll('.kinetic-line, .kinetic-text');

    if (isReducedMotion()) {
      titleEl.classList.add('is-revealed', 'is-settled');
      titleEl.style.willChange = 'auto';
      lines.forEach(el => {
        el.style.willChange = 'auto';
      });
      return;
    }

    // Apply will-change: transform strictly during active entrance
    titleEl.classList.add('is-revealing');
    titleEl.style.willChange = 'transform';
    lines.forEach(el => {
      el.style.willChange = 'transform';
    });

    titleEl.classList.add('is-revealed');

    // Once entrance animation has settled, strip will-change to eliminate GPU layer memory leaks
    let settled = false;
    const settleHandler = () => {
      if (settled) return;
      settled = true;
      titleEl.classList.remove('is-revealing');
      titleEl.classList.add('is-settled');
      titleEl.style.willChange = 'auto';
      lines.forEach(el => {
        el.style.willChange = 'auto';
      });
    };

    const settleTimer = setTimeout(settleHandler, 650);
    titleEl.addEventListener('transitionend', () => {
      clearTimeout(settleTimer);
      settleHandler();
    }, { once: true });
  }

  function initKineticTypography() {
    const titles = document.querySelectorAll('.kinetic-title');
    if (titles.length === 0) return;

    // Immediately reveal top hero title for crisp above-the-fold entrance (or wait for intro if active)
    const heroTitle = document.querySelector('.couture-h1.kinetic-title, .hero-h1.kinetic-title');
    const introOverlay = document.getElementById('luxuryIntro');
    const hasSeenIntro = sessionStorage.getItem('polish_intro_seen') === 'true' || sessionStorage.getItem('polish_formula_intro_seen') === 'true';

    if (heroTitle && (!introOverlay || hasSeenIntro || isReducedMotion())) {
      revealKineticTitle(heroTitle);
    }

    // IntersectionObserver for below-the-fold editorial headlines
    if ('IntersectionObserver' in window && !isReducedMotion()) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            revealKineticTitle(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });

      titles.forEach(t => {
        if (t !== heroTitle) {
          observer.observe(t);
        }
      });
    } else {
      titles.forEach(t => revealKineticTitle(t));
    }
  }

  window.PolishKineticTypography = {
    revealKineticTitle,
    initKineticTypography
  };
})();
