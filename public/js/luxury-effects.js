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
  // 3. TACTILE MAGNETIC ATTRACTION (DESKTOP ONLY)
  // =========================================================================
  if (!isTouch && window.matchMedia('(pointer: fine)').matches && !prefersReducedMotion) {
    let activeMagneticEl = null;

    // Interactive magnetic attraction binding
    function initMagneticElements() {
      const magneticTargets = document.querySelectorAll(
        '.brand-logo-link, .brand-logo-pod, .header-home-btn, .lang-btn, .btn-cta, .cat-badge-card, .footer-link-item, [data-magnetic]'
      );

      magneticTargets.forEach(el => {
        if (el.dataset.magneticInit) return;
        el.dataset.magneticInit = 'true';

        el.addEventListener('pointerenter', () => {
          activeMagneticEl = el;
        });

        el.addEventListener('pointerleave', () => {
          if (activeMagneticEl === el) activeMagneticEl = null;
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
  }

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
  // 8. AWARD-WINNING MORPHING DYNAMIC ISLAND CONTROLLER (ZERO-REFLOW GPU ENGINE)
  // =========================================================================
  const siteHeader = document.getElementById('siteHeader') || document.querySelector('.site-header');
  const progressBar = document.querySelector('.dynamic-island-progress-bar');

  if (siteHeader) {
    let islandRAF = null;
    let isScrolled = false;
    let cachedDocHeight = 1000;

    function measureScrollMetrics() {
      cachedDocHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    }
    measureScrollMetrics();
    window.addEventListener('resize', measureScrollMetrics, { passive: true });
    window.addEventListener('load', measureScrollMetrics, { passive: true });

    function updateIslandState() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      
      // Clean hysteresis threshold: drop down at 80px, return to top bar at 35px
      if (!isScrolled && scrollY > 80) {
        isScrolled = true;
        siteHeader.classList.add('is-scrolled');
      } else if (isScrolled && scrollY < 35) {
        isScrolled = false;
        siteHeader.classList.remove('is-scrolled');
      }

      // GPU-accelerated progress update without reflow
      if (progressBar && isScrolled) {
        const progress = Math.min(1, Math.max(0, scrollY / cachedDocHeight));
        progressBar.style.transform = `scaleX(${progress.toFixed(3)})`;
      }
    }

    function scheduleIslandUpdate() {
      if (islandRAF) return;
      islandRAF = requestAnimationFrame(() => {
        updateIslandState();
        islandRAF = null;
      });
    }

    window.addEventListener('scroll', scheduleIslandUpdate, { passive: true });
    updateIslandState();
  }

  // =========================================================================
  // 9. CONCEPT 1: RADIAL SPOTLIGHT GLASS CARDS (DESKTOP INTERACTION)
  // =========================================================================
  function initRadialSpotlightCards() {
    if (isTouch || !window.matchMedia('(pointer: fine)').matches) return;

    const cards = document.querySelectorAll(
      '.pro-card, .hero-glass-card, .case-banner, .form-container-shell'
    );

    cards.forEach(card => {
      if (card.dataset.spotlightInit) return;
      card.dataset.spotlightInit = 'true';

      let spotlightRAF = null;

      card.addEventListener('pointermove', function (e) {
        if (spotlightRAF) cancelAnimationFrame(spotlightRAF);
        spotlightRAF = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
          card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
        });
      }, { passive: true });

      card.addEventListener('pointerleave', function () {
        if (spotlightRAF) cancelAnimationFrame(spotlightRAF);
      }, { passive: true });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRadialSpotlightCards);
  } else {
    initRadialSpotlightCards();
  }
  window.addEventListener('polishLanguageChanged', () => {
    setTimeout(initRadialSpotlightCards, 120);
  });

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

    // Time to appreciate branding before flight (1.15s)
    const timer = setTimeout(() => {
      finishIntro(false);
    }, 1150);

    // Fast-track user bypass (click, tap, or keypress)
    introOverlay.addEventListener('pointerdown', () => {
      clearTimeout(timer);
      finishIntro(false);
    }, { once: true });

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
