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
  // 1. PURE 120FPS NATIVE HARDWARE SCROLLING (ZERO INERTIA LAG)
  // =========================================================================
  // Lenis virtual scroll interceptor removed to ensure 0ms input latency
  // and 100% native trackpad/mouse wheel responsiveness across all devices.
  const lenisInstance = null;

  // =========================================================================
  // 2. NATIVE GPU FLOATING 3D BEAUTY PRODUCTS (ZERO JAVASCRIPT SCROLL LAG)
  // =========================================================================
  // Background holographic 3D products are animated strictly via native GPU
  // CSS keyframes (roamFarPerfume, roamFarSerum, roamMidLipstick, etc.),
  // offloading 100% of motion from the main thread and scroll listeners.

  // =========================================================================
  // 3. TACTILE LUXURY INTERACTIONS (PURE CSS HARDWARE-ACCELERATED)
  // =========================================================================
  // Button and card hover states are handled via pure GPU compositor CSS,
  // guaranteeing 0ms input latency and eliminating main-thread reflows.

  // =========================================================================
  // 4. EDITORIAL KINETIC TYPOGRAPHY MASK REVEALS
  // =========================================================================
  function initKineticTypography() {
    const titles = document.querySelectorAll('.kinetic-title');
    if (titles.length === 0) return;

    // Immediately reveal top hero title for crisp above-the-fold entrance (or wait for intro if active)
    const heroTitle = document.querySelector('.hero-h1.kinetic-title');
    const introOverlay = document.getElementById('luxuryIntro');
    const hasSeenIntro = sessionStorage.getItem('polish_intro_seen') === 'true';

    if (heroTitle && (!introOverlay || hasSeenIntro)) {
      heroTitle.classList.add('is-revealed');
    }

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-revealed');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12 });

      titles.forEach(t => {
        if (t !== heroTitle) observer.observe(t);
      });
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
  // 5. 120FPS GPU CARD MOTION (ZERO JAVASCRIPT OVERHEAD)
  // =========================================================================
  // Card hover elevation and ambient sheen are handled entirely via GPU
  // CSS compositor transforms, ensuring 120FPS fluid scrolling and zero lag.

  // =========================================================================
  // 6. AMBIENT PARTICLES ENGINE (DESKTOP ONLY — 0MS OVERHEAD)
  // =========================================================================
  const bgContainer = document.querySelector('.bg-canvas-wrap');
  if (bgContainer && !prefersReducedMotion && !isTouch) {
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
      }, 200);
    }, { passive: true });

    const particleCount = 14;
    const holoColors = [
      'rgba(0, 229, 255, 0.45)',
      'rgba(235, 0, 255, 0.38)',
      'rgba(138, 43, 226, 0.35)',
      'rgba(255, 255, 255, 0.55)'
    ];
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.5,
      speedX: (Math.random() - 0.5) * 0.18,
      speedY: (Math.random() - 0.5) * 0.18,
      color: holoColors[Math.floor(Math.random() * holoColors.length)]
    }));

    let isScrolling = false;
    let scrollPauseTimer = null;
    window.addEventListener('scroll', () => {
      isScrolling = true;
      clearTimeout(scrollPauseTimer);
      scrollPauseTimer = setTimeout(() => {
        isScrolling = false;
      }, 120);
    }, { passive: true });

    function animateParticles() {
      if (document.hidden || isScrolling) {
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
  // =========================================================================
  // 7. SINGLE UNIFIED DYNAMIC ISLAND CONTROLLER (100% GPU COMPOSITED)
  // =========================================================================
  const siteHeader = document.getElementById('siteHeader') || document.querySelector('.site-header');
  const progressBar = document.querySelector('.dynamic-island-progress-bar');
  let isScrolled = false;
  let cachedDocHeight = 1000;

  function measureScrollMetrics() {
    cachedDocHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  }
  measureScrollMetrics();
  window.addEventListener('resize', measureScrollMetrics, { passive: true });
  window.addEventListener('load', measureScrollMetrics, { passive: true });

  function updateScrollState() {
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    
    // Hysteresis threshold to prevent layout flutter near scroll boundary
    if (!isScrolled && scrollY > 45) {
      isScrolled = true;
      if (siteHeader) siteHeader.classList.add('is-scrolled');
    } else if (isScrolled && scrollY < 20) {
      isScrolled = false;
      if (siteHeader) siteHeader.classList.remove('is-scrolled');
    }

    if (progressBar) {
      const progress = Math.min(1, Math.max(0, scrollY / cachedDocHeight));
      progressBar.style.transform = `scaleX(${progress.toFixed(3)})`;
    }
  }

  let islandRAF = null;
  function scheduleScrollUpdate() {
    if (islandRAF) return;
    islandRAF = requestAnimationFrame(() => {
      updateScrollState();
      islandRAF = null;
    });
  }

  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  updateScrollState();

  // =========================================================================
  // 10. LUXURY OPENING SCREEN (SHARED-ELEMENT FLIP TRANSITION)
  // =========================================================================
  function initLuxuryOpeningAnimation() {
    const introOverlay = document.getElementById('luxuryIntro');
    if (!introOverlay) return;

    const hasSeen = sessionStorage.getItem('polish_intro_seen') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const forceReplay = urlParams.get('replay_intro') === '1';

    if (hasSeen && !forceReplay) {
      introOverlay.remove();
      const heroTitle = document.querySelector('.hero-h1.kinetic-title');
      if (heroTitle) heroTitle.classList.add('is-revealed');
      return;
    }

    const introLogoPod = document.getElementById('introLogoPod');
    const introCaption = document.getElementById('introCaption');
    const introGlow = introOverlay.querySelector('.intro-glow-core');
    const introBackdrop = introOverlay.querySelector('.intro-backdrop');
    const targetLogoImg = document.querySelector('.top-bar-logo') || document.querySelector('.island-logo-zone .brand-logo-img') || document.querySelector('.brand-logo-img');
    const islandShell = document.getElementById('dynamicIslandShell');

    // Temporarily hide the destination header logo so there's no visual clone
    if (targetLogoImg) {
      targetLogoImg.style.opacity = '0';
      targetLogoImg.style.transition = 'opacity 0.2s ease';
    }

    // Trigger stage entrance
    requestAnimationFrame(() => {
      introOverlay.classList.add('is-active');
    });

    let isFinished = false;

    function finishIntro(instant = false) {
      if (isFinished) return;
      isFinished = true;
      sessionStorage.setItem('polish_intro_seen', 'true');

      if (instant || !targetLogoImg || !introLogoPod) {
        if (targetLogoImg) targetLogoImg.style.opacity = '1';
        introOverlay.remove();
        const heroTitle = document.querySelector('.hero-h1.kinetic-title');
        if (heroTitle) heroTitle.classList.add('is-revealed');
        return;
      }

      // 1. Softly dissolve subtitle & ambient glow
      if (introCaption) {
        introCaption.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
        introCaption.style.opacity = '0';
        introCaption.style.transform = 'translateY(-10px)';
      }
      if (introGlow) {
        introGlow.style.transition = 'opacity 0.5s ease';
        introGlow.style.opacity = '0';
      }

      // 2. Measure coordinates for shared-element FLIP transition
      const firstRect = introLogoPod.getBoundingClientRect();
      const lastRect = targetLogoImg.getBoundingClientRect();

      const deltaX = (lastRect.left + lastRect.width / 2) - (firstRect.left + firstRect.width / 2);
      const deltaY = (lastRect.top + lastRect.height / 2) - (firstRect.top + firstRect.height / 2);
      const scale = (lastRect.width / firstRect.width);

      // 3. Dissolve backdrop in parallel
      if (introBackdrop) {
        introBackdrop.style.transition = 'opacity 0.72s cubic-bezier(0.16, 1, 0.3, 1)';
        introBackdrop.style.opacity = '0';
      }

      // 4. FLIP flight of the logo into the Dynamic Island dock
      introLogoPod.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
      introLogoPod.style.transform = `translate3d(${deltaX.toFixed(2)}px, ${deltaY.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;

      // Reveal hero text 200ms into flight as the curtain clears
      setTimeout(() => {
        const heroTitle = document.querySelector('.hero-h1.kinetic-title');
        if (heroTitle) heroTitle.classList.add('is-revealed');
      }, 200);

      // 5. Landing settle & Dynamic Island pulse
      setTimeout(() => {
        if (targetLogoImg) targetLogoImg.style.opacity = '1';
        if (islandShell) {
          islandShell.classList.add('island-dock-settled');
          setTimeout(() => islandShell.classList.remove('island-dock-settled'), 1000);
        }
        introOverlay.remove();
      }, 820);
    }

    // Fast, crisp branding appreciation before flight (600ms)
    const timer = setTimeout(() => {
      finishIntro(false);
    }, 600);

    // Fast-track user bypass (click, tap, scroll, or keypress)
    introOverlay.addEventListener('pointerdown', () => {
      clearTimeout(timer);
      finishIntro(false);
    }, { once: true });

    window.addEventListener('wheel', () => {
      clearTimeout(timer);
      finishIntro(true);
    }, { once: true, passive: true });

    window.addEventListener('touchmove', () => {
      clearTimeout(timer);
      finishIntro(true);
    }, { once: true, passive: true });

    window.addEventListener('keydown', () => {
      clearTimeout(timer);
      finishIntro(true);
    }, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLuxuryOpeningAnimation);
  } else {
    initLuxuryOpeningAnimation();
  }
})();
