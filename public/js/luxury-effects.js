/**
 * POLISH Luxury Web UI Engine — Ultra-High Performance 120FPS
 * Features:
 *  - Velvety Smooth Inertia Scrolling (Lenis Engine)
 *  - Scroll Velocity-Reactive 3D Product Physics (Aerodynamic Tilt & Inertia Drag)
 *  - Magnetic Luxury Cursor (Tactile Attraction & Specular Glow)
 *  - Editorial Kinetic Typography Mask Reveals
 *  - Ambient Luminescence Particle Canvas
 *  - 3D Perspective Card Tilt
 */

(function () {
  'use strict';

  const isTouch = ('ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth <= 768);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // =========================================================================
  // 1. VELVETY SMOOTH INERTIA SCROLLING (LENIS ENGINE)
  // =========================================================================
  let lenisInstance = null;
  if (typeof Lenis !== 'undefined' && !isTouch && !prefersReducedMotion) {
    try {
      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Luxury exponential out curve
        smoothWheel: true,
        smoothTouch: false, // Preserve 100% native mobile touch response
        wheelMultiplier: 0.95,
        touchMultiplier: 1.5,
        infinite: false
      });
      window.polishLenis = lenisInstance;

      lenisInstance.on('scroll', () => {
        window.dispatchEvent(new CustomEvent('polishLenisScroll'));
      });

      function lenisRaf(time) {
        lenisInstance.raf(time);
        requestAnimationFrame(lenisRaf);
      }
      requestAnimationFrame(lenisRaf);
    } catch (err) {
      console.warn('[POLISH Engine] Lenis initialization skipped:', err);
    }
  }

  // =========================================================================
  // 2. SCROLL VELOCITY-REACTIVE FLOATING 3D PRODUCTS PHYSICS
  // =========================================================================
  const depthLayers = document.querySelectorAll('.beauty-depth-layer');
  if (depthLayers.length > 0 && !prefersReducedMotion) {
    let currentVelocity = 0;
    let targetVelocity = 0;
    let velocityRAF = null;

    function applyVelocityTransform() {
      // Smooth lerp decay for natural aerodynamic weight
      currentVelocity += (targetVelocity - currentVelocity) * 0.12;
      targetVelocity *= 0.88;

      const tiltZ = Math.max(-10, Math.min(10, currentVelocity * 0.14));
      const scaleY = 1 - Math.min(0.08, Math.abs(currentVelocity) * 0.0025);
      const yLagFar = currentVelocity * 0.7;
      const yLagMid = currentVelocity * 0.42;

      depthLayers.forEach(layer => {
        if (layer.classList.contains('beauty-depth-far')) {
          layer.style.transform = `translate3d(0, ${yLagFar.toFixed(2)}px, 0) rotateZ(${tiltZ.toFixed(2)}deg) scaleY(${scaleY.toFixed(3)})`;
        } else if (layer.classList.contains('beauty-depth-mid')) {
          layer.style.transform = `translate3d(0, ${yLagMid.toFixed(2)}px, 0) rotateZ(${(tiltZ * 0.75).toFixed(2)}deg) scaleY(${scaleY.toFixed(3)})`;
        } else {
          layer.style.transform = `rotateZ(${(tiltZ * 0.4).toFixed(2)}deg)`;
        }
      });

      if (Math.abs(currentVelocity) > 0.04 || Math.abs(targetVelocity) > 0.04) {
        velocityRAF = requestAnimationFrame(applyVelocityTransform);
      } else {
        velocityRAF = null;
        currentVelocity = 0;
        depthLayers.forEach(layer => {
          layer.style.transform = '';
        });
      }
    }

    if (lenisInstance) {
      lenisInstance.on('scroll', (e) => {
        targetVelocity = e.velocity || 0;
        if (!velocityRAF) velocityRAF = requestAnimationFrame(applyVelocityTransform);
      });
    } else {
      let lastY = window.scrollY;
      let lastTime = performance.now();
      window.addEventListener('scroll', () => {
        const now = performance.now();
        const dt = Math.max(1, now - lastTime);
        const dy = window.scrollY - lastY;
        targetVelocity = (dy / dt) * 14;
        lastY = window.scrollY;
        lastTime = now;
        if (!velocityRAF) velocityRAF = requestAnimationFrame(applyVelocityTransform);
      }, { passive: true });
    }
  }

  // =========================================================================
  // 3. MAGNETIC LUXURY CURSOR (DESKTOP ONLY)
  // =========================================================================
  if (!isTouch && window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion) {
    const cursorDot = document.createElement('div');
    cursorDot.className = 'luxury-cursor-dot';
    const cursorRing = document.createElement('div');
    cursorRing.className = 'luxury-cursor-ring';
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    let mouseX = -100;
    let mouseY = -100;
    let ringX = -100;
    let ringY = -100;
    let activeMagneticEl = null;

    window.addEventListener('pointermove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
    }, { passive: true });

    window.addEventListener('pointerdown', () => document.body.classList.add('is-cursor-clicking'), { passive: true });
    window.addEventListener('pointerup', () => document.body.classList.remove('is-cursor-clicking'), { passive: true });

    // Interactive magnetic attraction binding
    function initMagneticElements() {
      const magneticTargets = document.querySelectorAll(
        '.brand-logo-pod, .header-home-btn, .lang-btn, .btn-cta, .cat-badge-card, .footer-link-item, [data-magnetic]'
      );

      magneticTargets.forEach(el => {
        if (el.dataset.magneticInit) return;
        el.dataset.magneticInit = 'true';

        el.addEventListener('pointerenter', () => {
          activeMagneticEl = el;
          document.body.classList.add('has-cursor-hover');
        });

        el.addEventListener('pointerleave', () => {
          if (activeMagneticEl === el) activeMagneticEl = null;
          document.body.classList.remove('has-cursor-hover');
          el.style.transform = '';
        });

        el.addEventListener('pointermove', (e) => {
          const rect = el.getBoundingClientRect();
          const relX = e.clientX - (rect.left + rect.width / 2);
          const relY = e.clientY - (rect.top + rect.height / 2);
          // Subtle magnetic pull (max 6-8px offset for organic weighted feel)
          const pullX = Math.max(-7, Math.min(7, relX * 0.25));
          const pullY = Math.max(-7, Math.min(7, relY * 0.25));
          el.style.transform = `translate3d(${pullX.toFixed(2)}px, ${pullY.toFixed(2)}px, 0)`;
        });
      });
    }

    initMagneticElements();
    window.addEventListener('polishLanguageChanged', () => setTimeout(initMagneticElements, 100));

    // Smooth ring lerp tracking
    function renderCursorRing() {
      let targetRingX = mouseX;
      let targetRingY = mouseY;

      if (activeMagneticEl) {
        const rect = activeMagneticEl.getBoundingClientRect();
        targetRingX = rect.left + rect.width / 2;
        targetRingY = rect.top + rect.height / 2;
      }

      ringX += (targetRingX - ringX) * 0.18;
      ringY += (targetRingY - ringY) * 0.18;

      cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
      requestAnimationFrame(renderCursorRing);
    }
    requestAnimationFrame(renderCursorRing);
  }

  // =========================================================================
  // 4. EDITORIAL KINETIC TYPOGRAPHY MASK REVEALS
  // =========================================================================
  function initKineticTypography() {
    const titles = document.querySelectorAll('.kinetic-title');
    if (titles.length === 0) return;

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      titles.forEach(t => observer.observe(t));
    } else {
      titles.forEach(t => t.classList.add('is-revealed'));
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initKineticTypography);
  } else {
    initKineticTypography();
  }
  window.addEventListener('polishLanguageChanged', () => {
    document.querySelectorAll('.kinetic-title').forEach(t => t.classList.add('is-revealed'));
  });

  // =========================================================================
  // 5. 3D PERSPECTIVE CARD TILT (DESKTOP ONLY)
  // =========================================================================
  if (!isTouch && !prefersReducedMotion) {
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

          const rotateX = ((y - centerY) / centerY) * -2.5;
          const rotateY = ((x - centerX) / centerX) * 2.5;

          card.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-2px)`;
        });
      }, { passive: true });

      card.addEventListener('mouseleave', function () {
        if (tiltRAF) cancelAnimationFrame(tiltRAF);
        card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      });
    });
  }

  // =========================================================================
  // 6. AMBIENT PARTICLES ENGINE
  // =========================================================================
  const bgContainer = document.querySelector('.bg-canvas-wrap');
  if (bgContainer && !prefersReducedMotion) {
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

    const particleCount = isTouch ? 12 : 26;
    const holoColors = [
      'rgba(0, 229, 255, 0.45)',
      'rgba(235, 0, 255, 0.38)',
      'rgba(138, 43, 226, 0.35)',
      'rgba(255, 255, 255, 0.55)'
    ];
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.6 + 0.6,
      speedX: (Math.random() - 0.5) * 0.22,
      speedY: (Math.random() - 0.5) * 0.22,
      color: holoColors[Math.floor(Math.random() * holoColors.length)]
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

  // =========================================================================
  // 7. SMART STICKY GLOWING CTA DOCK
  // =========================================================================
  const stickyDock = document.getElementById('stickyCtaDock');
  if (stickyDock) {
    const onPageCtas = Array.from(document.querySelectorAll('.hero-actions .btn-cta, .creator-cta-box .btn-cta, .apply-actions .btn-cta, #btnSubmitCreator, .site-footer'));
    const visibleElements = new Set();

    function updateStickyVisibility() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      if (scrollY > 220 && visibleElements.size === 0) {
        stickyDock.classList.add('is-visible');
        stickyDock.setAttribute('aria-hidden', 'false');
      } else {
        stickyDock.classList.remove('is-visible');
        stickyDock.setAttribute('aria-hidden', 'true');
      }
    }

    if ('IntersectionObserver' in window && onPageCtas.length > 0) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            visibleElements.add(entry.target);
          } else {
            visibleElements.delete(entry.target);
          }
        });
        updateStickyVisibility();
      }, {
        root: null,
        rootMargin: '0px 0px -30px 0px',
        threshold: 0.05
      });

      onPageCtas.forEach(el => observer.observe(el));
    }

    window.addEventListener('scroll', updateStickyVisibility, { passive: true });
    updateStickyVisibility();
  }

  // =========================================================================
  // 8. AWARD-WINNING MORPHING DYNAMIC ISLAND CONTROLLER
  // =========================================================================
  const siteHeader = document.getElementById('siteHeader') || document.querySelector('.site-header');
  const islandShell = document.getElementById('dynamicIslandShell') || document.querySelector('.dynamic-island-shell');

  if (siteHeader) {
    function updateIslandState() {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;

      // Hysteresis threshold to eliminate jitter at transition point
      if (scrollY > 35) {
        siteHeader.classList.add('is-scrolled');
      } else if (scrollY < 20) {
        siteHeader.classList.remove('is-scrolled');
      }

      if (islandShell) {
        islandShell.style.setProperty('--island-progress', `${progress.toFixed(1)}%`);
      }
    }

    window.addEventListener('scroll', updateIslandState, { passive: true });
    if (lenisInstance) {
      lenisInstance.on('scroll', updateIslandState);
    }
    updateIslandState();
  }
})();
