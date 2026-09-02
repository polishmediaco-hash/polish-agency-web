/**
 * POLISH Luxury Web UI Engine — Ultra-High Performance 120FPS
 * Lightweight, GPU-composited, zero CPU layout thrashing
 */

(function () {
  'use strict';

  // Check if touch device / mobile (disable heavy mouse followers on touch screens)
  const isTouch = ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768);

  // 1. Mouse Caustic Spotlight (Desktop Only, Idle-Sleeping Physics)
  if (!isTouch) {
    const mouseCaustic = document.createElement('div');
    mouseCaustic.className = 'mouse-caustic-light';
    mouseCaustic.style.willChange = 'transform';
    document.body.appendChild(mouseCaustic);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let currentX = mouseX;
    let currentY = mouseY;
    let isMoving = false;
    let idleFrames = 0;

    window.addEventListener('pointermove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!isMoving) {
        isMoving = true;
        idleFrames = 0;
        requestAnimationFrame(renderCaustic);
      }
    }, { passive: true });

    function renderCaustic() {
      if (document.hidden) {
        isMoving = false;
        return;
      }

      const dx = mouseX - currentX;
      const dy = mouseY - currentY;

      currentX += dx * 0.1;
      currentY += dy * 0.1;

      mouseCaustic.style.transform = `translate3d(${currentX - 350}px, ${currentY - 350}px, 0)`;

      // Sleep animation when resting
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        idleFrames++;
        if (idleFrames > 30) {
          isMoving = false;
          return;
        }
      } else {
        idleFrames = 0;
      }

      requestAnimationFrame(renderCaustic);
    }

    // 2. 3D Card Perspective Tilt (Optimized with RAF)
    const tiltCards = document.querySelectorAll('.hero-glass-card, .form-container-shell');
    tiltCards.forEach(card => {
      let tiltRAF = null;

      card.addEventListener('mousemove', function (e) {
        if (tiltRAF) cancelAnimationFrame(tiltRAF);
        tiltRAF = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;

          const rotateX = ((y - centerY) / centerY) * -3;
          const rotateY = ((x - centerX) / centerX) * 3;

          card.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
        });
      }, { passive: true });

      card.addEventListener('mouseleave', function () {
        if (tiltRAF) cancelAnimationFrame(tiltRAF);
        card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // 3. Ultra-Lightweight Ambient Particle Engine (Zero Shadow Blurs, GPU-friendly)
  const bgContainer = document.querySelector('.bg-canvas-wrap');
  if (bgContainer && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const canvas = document.createElement('canvas');
    canvas.className = 'ambient-particles-canvas';
    bgContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let resizeTimeout;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 150);
    }, { passive: true });

    const particleCount = isTouch ? 12 : 24;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.6,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
      color: `rgba(0, 229, 255, ${(Math.random() * 0.35 + 0.15).toFixed(2)})`
    }));

    function animateParticles() {
      if (document.hidden) {
        requestAnimationFrame(animateParticles);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }

      requestAnimationFrame(animateParticles);
    }
    requestAnimationFrame(animateParticles);
  }
})();
