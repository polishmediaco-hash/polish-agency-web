/**
 * POLISH Luxury Web UI Engine — Dynamic Cursor Spotlight & Tactile Physics Module
 * 
 * Provides:
 *  - Reflow-free dynamic cursor spotlight light-cone tracking (--mouse-x, --mouse-y)
 *  - Haute Atelier 3D micro-tilt (≤3.2deg) for cards
 *  - Spring-damped magnetic pull and meniscus droplet tracking for luxury CTA buttons
 *  - Staggered scroll-reveal cascade for cards and bento grids
 */

(function () {
  'use strict';

  function isGuardActive() {
    if (window.PolishThermalGuard) {
      return window.PolishThermalGuard.isMobile() || window.PolishThermalGuard.isReducedMotion();
    }
    const isSmall = window.innerWidth <= 768;
    const reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    return isSmall || reduced;
  }

  // 1. Staggered Scroll-Reveal Cascade
  function initCardReveal() {
    const cards = document.querySelectorAll('.pro-card');
    if (cards.length === 0) return;

    const reduced = window.PolishThermalGuard ? window.PolishThermalGuard.isReducedMotion() : false;

    if ('IntersectionObserver' in window && !reduced) {
      const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            cardObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      cards.forEach(card => cardObserver.observe(card));
    } else {
      cards.forEach(card => card.classList.add('is-revealed'));
    }
  }

  // 2. Dynamic Cursor Spotlight & Micro-Tilt
  function initSpotlightCards() {
    if (isGuardActive()) return;
    const cards = document.querySelectorAll('.pro-card, .hero-glass-card, .form-container-shell');
    if (cards.length === 0) return;

    cards.forEach(card => {
      let raf = null;
      let cachedRect = null;

      const updateRect = () => {
        cachedRect = card.getBoundingClientRect();
      };

      card.addEventListener('mouseenter', updateRect, { passive: true });

      card.addEventListener('mousemove', (e) => {
        if (!cachedRect) updateRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          if (!cachedRect) return;
          const x = clientX - cachedRect.left;
          const y = clientY - cachedRect.top;
          card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
          card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);

          // Tactile 3D Micro-Tilt (Refined ≤3.2deg)
          if (card.classList.contains('pro-card')) {
            const centerX = cachedRect.width / 2;
            const centerY = cachedRect.height / 2;
            const tiltY = (((x - centerX) / centerX) * 3.2).toFixed(2);
            const tiltX = (((y - centerY) / centerY) * -3.2).toFixed(2);
            card.style.setProperty('--tilt-x', `${tiltX}deg`);
            card.style.setProperty('--tilt-y', `${tiltY}deg`);
          }
        });
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        cachedRect = null;
        if (raf) cancelAnimationFrame(raf);
        card.style.removeProperty('--mouse-x');
        card.style.removeProperty('--mouse-y');
        if (card.classList.contains('pro-card')) {
          card.style.setProperty('--tilt-x', '0deg');
          card.style.setProperty('--tilt-y', '0deg');
        }
      });
    });
  }

  // 3. Tactile Magnetic Button Physics
  function initMagneticButtons() {
    if (isGuardActive()) return;
    const buttons = document.querySelectorAll('.btn-cta, .btn-cta-lg, .sticky-glowing-btn, .header-home-btn');
    if (buttons.length === 0) return;

    buttons.forEach(btn => {
      let raf = null;
      let isHovered = false;
      let cachedRect = null;

      btn.addEventListener('mouseenter', () => {
        isHovered = true;
        cachedRect = btn.getBoundingClientRect();
        btn.style.transition = 'transform 0.12s ease-out';
      });

      btn.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        if (!cachedRect) cachedRect = btn.getBoundingClientRect();
        const clientX = e.clientX;
        const clientY = e.clientY;

        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          if (!cachedRect || !isHovered) return;
          const centerX = cachedRect.left + cachedRect.width / 2;
          const centerY = cachedRect.top + cachedRect.height / 2;
          // Smooth 28% magnetic pull coefficient capped at 8px max displacement
          const pullX = Math.max(-8, Math.min(8, (clientX - centerX) * 0.28));
          const pullY = Math.max(-8, Math.min(8, (clientY - centerY) * 0.28));
          btn.style.transform = `translate3d(${pullX.toFixed(1)}px, ${(pullY - 2).toFixed(1)}px, 0)`;

          // Viscous Meniscus Droplet coordinate tracking
          const dropX = ((clientX - cachedRect.left) / cachedRect.width) * 100;
          const dropY = ((clientY - cachedRect.top) / cachedRect.height) * 100;
          btn.style.setProperty('--drop-x', `${dropX.toFixed(1)}%`);
          btn.style.setProperty('--drop-y', `${dropY.toFixed(1)}%`);
        });
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        isHovered = false;
        cachedRect = null;
        if (raf) cancelAnimationFrame(raf);
        btn.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
        btn.style.transform = 'translate3d(0, 0, 0)';
        btn.style.setProperty('--drop-x', '50%');
        btn.style.setProperty('--drop-y', '50%');
        setTimeout(() => {
          if (!isHovered) {
            btn.style.transition = '';
            btn.style.transform = '';
          }
        }, 450);
      });
    });
  }

  function initAll() {
    initCardReveal();
    initSpotlightCards();
    initMagneticButtons();
  }

  window.PolishSpotlightCards = {
    initCardReveal,
    initSpotlightCards,
    initMagneticButtons,
    initAll
  };
})();
