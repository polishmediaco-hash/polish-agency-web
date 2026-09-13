/**
 * POLISH Luxury Web UI Engine — Ambient Luminescence Particle Canvas Module
 * 
 * Renders subtle, champagne-gold drifting micro-particles with scroll velocity
 * impulse coupling. Halts execution completely when scrolled below the fold or
 * when the document is hidden to ensure 0 CPU/GPU cycles during reading.
 */

(function () {
  'use strict';

  let particleRafId = null;
  let isCanvasInView = true;
  let particles = [];
  let ctx = null;
  let canvas = null;
  let width = 0;
  let height = 0;

  function isGuardActive() {
    if (window.PolishThermalGuard) {
      return window.PolishThermalGuard.isMobile() || window.PolishThermalGuard.isReducedMotion();
    }
    const isSmall = window.innerWidth <= 768;
    const reduced = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    return isSmall || reduced;
  }

  function getScrollVelocity() {
    if (window.PolishLuxuryScroll && typeof window.PolishLuxuryScroll.getSmoothVelocity === 'function') {
      return window.PolishLuxuryScroll.getSmoothVelocity();
    }
    return 0;
  }

  function animateParticles() {
    if (document.hidden || !isCanvasInView || !ctx) {
      particleRafId = null;
      return;
    }

    ctx.clearRect(0, 0, width, height);
    const smoothVelocity = getScrollVelocity();

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      // Ambient natural motion + smooth liquid current response
      p.x += p.speedX + (smoothVelocity * 0.04);
      p.y += p.speedY + (smoothVelocity * 0.35);

      if (p.x < 0) p.x = width;
      else if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      else if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
    }

    particleRafId = requestAnimationFrame(animateParticles);
  }

  function initParticleCanvas() {
    if (isGuardActive()) return;

    const bgContainer = document.querySelector('.bg-canvas-wrap');
    if (!bgContainer) return;

    // Check if canvas already exists
    let existingCanvas = bgContainer.querySelector('.ambient-particles-canvas');
    if (existingCanvas) {
      canvas = existingCanvas;
    } else {
      canvas = document.createElement('canvas');
      canvas.className = 'ambient-particles-canvas';
      bgContainer.appendChild(canvas);
    }

    ctx = canvas.getContext('2d', { alpha: true });
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;

    let resizeTimeout;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 200);
    }, { passive: true });

    const particleCount = 14;
    const holoColors = [
      'rgba(226, 199, 153, 0.55)',
      'rgba(245, 230, 211, 0.65)',
      'rgba(197, 168, 128, 0.40)',
      'rgba(255, 255, 255, 0.55)'
    ];

    particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.18,
      speedY: (Math.random() - 0.5) * 0.18,
      color: holoColors[Math.floor(Math.random() * holoColors.length)]
    }));

    // Zero-cycle below fold guard
    if ('IntersectionObserver' in window) {
      const particleObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          isCanvasInView = entry.isIntersecting;
          if (isCanvasInView && !particleRafId && !document.hidden) {
            particleRafId = requestAnimationFrame(animateParticles);
          }
        });
      }, { threshold: 0 });
      particleObserver.observe(canvas);
    } else {
      particleRafId = requestAnimationFrame(animateParticles);
    }

    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && isCanvasInView && !particleRafId) {
        particleRafId = requestAnimationFrame(animateParticles);
      }
    });
  }

  function pause() {
    if (particleRafId) {
      cancelAnimationFrame(particleRafId);
      particleRafId = null;
    }
  }

  function resume() {
    if (!particleRafId && isCanvasInView && !document.hidden) {
      particleRafId = requestAnimationFrame(animateParticles);
    }
  }

  window.PolishParticleCanvas = {
    initParticleCanvas,
    pause,
    resume
  };
})();
