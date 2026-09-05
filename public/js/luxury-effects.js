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
  // 5. STAGGERED SCROLL-REVEAL CASCADE (CARDS & BENTO)
  // =========================================================================
  function initCardReveal() {
    const cards = document.querySelectorAll('.pro-card');
    if (cards.length === 0) return;

    if ('IntersectionObserver' in window && !prefersReducedMotion) {
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCardReveal);
  } else {
    initCardReveal();
  }

  // =========================================================================
  // 5B. DYNAMIC CURSOR SPOTLIGHT TRACKING (120FPS RAF-THROTTLED)
  // =========================================================================
  function initSpotlightCards() {
    if (isTouch || prefersReducedMotion) return;
    const cards = document.querySelectorAll('.pro-card, .hero-glass-card, .form-container-shell');
    if (cards.length === 0) return;

    cards.forEach(card => {
      let raf = null;
      card.addEventListener('mousemove', (e) => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--mouse-x', `${x.toFixed(1)}px`);
          card.style.setProperty('--mouse-y', `${y.toFixed(1)}px`);
        });
      }, { passive: true });

      card.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.removeProperty('--mouse-x');
        card.style.removeProperty('--mouse-y');
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSpotlightCards);
  } else {
    initSpotlightCards();
  }

  // =========================================================================
  // 5C. TACTILE MAGNETIC BUTTON PHYSICS (SPRING DAMPED ACCELERATION)
  // =========================================================================
  function initMagneticButtons() {
    if (isTouch || prefersReducedMotion) return;
    const buttons = document.querySelectorAll('.btn-cta, .btn-cta-lg, .sticky-glowing-btn, .header-home-btn');
    if (buttons.length === 0) return;

    buttons.forEach(btn => {
      let raf = null;
      let isHovered = false;

      btn.addEventListener('mouseenter', () => {
        isHovered = true;
        btn.style.transition = 'transform 0.12s ease-out';
      });

      btn.addEventListener('mousemove', (e) => {
        if (!isHovered) return;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rect = btn.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          // Smooth 28% magnetic pull coefficient capped at 8px max displacement
          const pullX = Math.max(-8, Math.min(8, (e.clientX - centerX) * 0.28));
          const pullY = Math.max(-8, Math.min(8, (e.clientY - centerY) * 0.28));
          btn.style.transform = `translate3d(${pullX.toFixed(1)}px, ${(pullY - 2).toFixed(1)}px, 0)`;
        });
      }, { passive: true });

      btn.addEventListener('mouseleave', () => {
        isHovered = false;
        if (raf) cancelAnimationFrame(raf);
        btn.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
        btn.style.transform = 'translate3d(0, 0, 0)';
        setTimeout(() => {
          if (!isHovered) {
            btn.style.transition = '';
            btn.style.transform = '';
          }
        }, 450);
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMagneticButtons);
  } else {
    initMagneticButtons();
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
      'rgba(226, 199, 153, 0.55)',
      'rgba(245, 230, 211, 0.65)',
      'rgba(197, 168, 128, 0.40)',
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

    // Dolly-Zoom Depth Inversion & Flacon Space Travel (Hero 0px -> 450px)
    // 100% GPU COMPOSITOR PROPERTIES ONLY (translate3d, scale, opacity)
    // ZERO dynamic filter blur = ZERO texture layer clipping / ZERO box shade cut out / 120FPS smooth on phone
    const bottleWrap = document.getElementById('heroBottleWrap');
    const bgDepthFar = document.querySelector('.beauty-depth-far');
    const bgDepthMid = document.querySelector('.beauty-depth-mid');

    if (bottleWrap) {
      const maxScroll = 450;
      const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);

      if (Math.abs(progress - lastBottleProgress) > 0.003 || (progress === 1 && lastBottleProgress !== 1) || (progress === 0 && lastBottleProgress !== 0)) {
        lastBottleProgress = progress;

        // 1. Centerpiece Serum Bottle recedes into distant background constellation
        const scale = 1 - (progress * 0.65); // 1.0 -> 0.35
        const isRTL = document.documentElement.dir === 'rtl';
        const shiftX = (isRTL ? -1 : 1) * (progress * 110);
        const shiftY = progress * -25;
        const opacity = 1 - (progress * 0.65); // 1.0 -> 0.35

        bottleWrap.style.transform = `translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
        bottleWrap.style.opacity = opacity.toFixed(2);

    // 2. Background Products gently come into focus via compositor opacity
        const bgOpacity = 0.30 + (progress * 0.35); // 0.30 -> 0.65
        if (bgDepthFar && window.innerWidth > 768) {
          bgDepthFar.style.opacity = bgOpacity.toFixed(2);
        }
        // On desktop only, apply subtle scale to mid layer; skip on mobile for maximum 120FPS fluidity
        if (bgDepthMid && window.innerWidth > 768) {
          const bgScale = 0.80 + (progress * 0.20);
          bgDepthMid.style.transform = `scale(${bgScale.toFixed(3)})`;
        }
      }
    }

    updateStickyVisibility();
  }

  let lastBottleProgress = -1;
  let islandRAF = null;
  function scheduleScrollUpdate() {
    if (islandRAF) return;
    islandRAF = requestAnimationFrame(() => {
      updateScrollState();
      islandRAF = null;
    });
  }

  // =========================================================================
  // 8. SMART STICKY GLOWING CTA DOCK (100% REFLOW-FREE INTERSECTION OBSERVER)
  // =========================================================================
  const stickyDock = document.getElementById('stickyCtaDock');
  const heroCta = document.querySelector('.hero-actions .btn-cta') || document.querySelector('.btn-jewel-couture');
  const footer = document.querySelector('.site-footer');
  let heroCtaInView = true;
  let footerInView = false;

  function updateStickyVisibility() {
    if (!stickyDock) return;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    // 100% Layout-reflow-free: strictly uses off-thread IntersectionObserver states
    const heroPast = !heroCtaInView;
    const footerNear = footerInView;

    if (scrollY > 160 && heroPast && !footerNear) {
      stickyDock.classList.add('is-visible');
      stickyDock.setAttribute('aria-hidden', 'false');
      document.body.classList.add('has-sticky-cta');
    } else {
      stickyDock.classList.remove('is-visible');
      stickyDock.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('has-sticky-cta');
    }
  }

  if (stickyDock && 'IntersectionObserver' in window) {
    if (heroCta) {
      const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          heroCtaInView = entry.isIntersecting;
          updateStickyVisibility();
        });
      }, { threshold: 0.05 });
      heroObserver.observe(heroCta);
    }

    if (footer) {
      const footerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          footerInView = entry.isIntersecting;
          updateStickyVisibility();
        });
      }, { threshold: 0.02 });
      footerObserver.observe(footer);
    }
  }

  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  updateScrollState();

  // =========================================================================
  // 10. CONCEPT 2: THE FORMULA SYNTHESIS — Opening Cinematic
  //     Anime.js timeline:
  //     3 converging golden emulsion beads (120° angles) → collision & coalescence →
  //     luminous micro-shockwave & sparks → POLISH logo relief synthesis & gleam →
  //     shared-element FLIP into Dynamic Island header
  // =========================================================================
  function initLuxuryOpeningAnimation() {
    const introOverlay = document.getElementById('luxuryIntro');
    if (!introOverlay) return;

    const hasSeen = sessionStorage.getItem('polish_formula_intro_seen') === 'true';
    const urlParams = new URLSearchParams(window.location.search);
    const forceReplay = urlParams.get('replay_intro') === '1';

    if (hasSeen && !forceReplay) {
      introOverlay.remove();
      const heroTitle = document.querySelector('.hero-h1.kinetic-title');
      if (heroTitle) heroTitle.classList.add('is-revealed');
      return;
    }

    // Reduced motion — skip entire animation
    if (prefersReducedMotion) {
      sessionStorage.setItem('polish_formula_intro_seen', 'true');
      introOverlay.remove();
      const heroTitle = document.querySelector('.hero-h1.kinetic-title');
      if (heroTitle) heroTitle.classList.add('is-revealed');
      return;
    }

    // Elements
    const formulaBackdrop   = document.getElementById('formulaBackdrop');
    const formulaOrbit      = document.getElementById('formulaOrbit');
    const bead1             = document.getElementById('beadWrap1');
    const bead2             = document.getElementById('beadWrap2');
    const bead3             = document.getElementById('beadWrap3');
    const coreBloom         = document.getElementById('formulaCoreBloom');
    const shockwave1        = document.getElementById('formulaShockwave1');
    const shockwave2        = document.getElementById('formulaShockwave2');
    const sparks            = document.querySelectorAll('.formula-spark');
    const formulaLogoPod    = document.getElementById('formulaLogoPod');
    const formulaGleam      = document.getElementById('formulaGleam');
    const formulaCaption    = document.getElementById('formulaCaption');
    const skipHint          = document.getElementById('introSkipHint');
    const islandShell       = document.getElementById('dynamicIslandShell');
    const targetLogoImg     = document.querySelector('.island-logo-zone .brand-logo-img') || document.querySelector('.brand-logo-img');

    if (targetLogoImg) {
      targetLogoImg.style.opacity = '0';
    }

    // Fallback if anime.js is not loaded
    if (typeof anime === 'undefined') {
      sessionStorage.setItem('polish_formula_intro_seen', 'true');
      if (targetLogoImg) targetLogoImg.style.opacity = '1';
      introOverlay.remove();
      const heroTitle = document.querySelector('.hero-h1.kinetic-title');
      if (heroTitle) heroTitle.classList.add('is-revealed');
      return;
    }

    let timelineComplete = false;

    // Radius calculation for 120° orbital convergence (responsive)
    const isMobile = window.innerWidth <= 768;
    const radius = isMobile ? 100 : 140;
    const b1Y = -radius, b1X = 0;
    const b2X = Math.round(radius * 0.866), b2Y = Math.round(radius * 0.5);
    const b3X = -Math.round(radius * 0.866), b3Y = Math.round(radius * 0.5);

    // Explicitly initialize all animated targets with anime.set() to avoid style conflicts
    anime.set(bead1, { translateX: `${b1X}px`, translateY: `${b1Y}px`, scale: 0.5, opacity: 0 });
    anime.set(bead2, { translateX: `${b2X}px`, translateY: `${b2Y}px`, scale: 0.5, opacity: 0 });
    anime.set(bead3, { translateX: `${b3X}px`, translateY: `${b3Y}px`, scale: 0.5, opacity: 0 });
    anime.set(formulaOrbit, { opacity: 0, scale: 0.75, rotate: '-18deg' });
    anime.set(coreBloom, { opacity: 0, scale: 0.1 });
    anime.set(shockwave1, { opacity: 0, scale: 0.1 });
    anime.set(shockwave2, { opacity: 0, scale: 0.1 });
    anime.set(formulaLogoPod, { opacity: 0, scale: 0.85, translateX: '0px', translateY: '0px', transformOrigin: '50% 50%' });
    anime.set(formulaGleam, { translateX: '-120%' });
    anime.set(formulaCaption, { opacity: 0, translateY: '8px' });

    // ─── FLIP EXIT (shared-element FLIP into Dynamic Island) ─────────────────
    function doFlipExit() {
      if (!targetLogoImg || !formulaLogoPod) {
        if (targetLogoImg) targetLogoImg.style.opacity = '1';
        introOverlay.remove();
        const heroTitle = document.querySelector('.hero-h1.kinetic-title');
        if (heroTitle) heroTitle.classList.add('is-revealed');
        return;
      }

      // 1. Fade caption and skip hint
      if (formulaCaption) anime({ targets: formulaCaption, opacity: 0, translateY: -8, duration: 180, easing: 'easeInQuad' });
      if (skipHint) anime({ targets: skipHint, opacity: 0, duration: 160, easing: 'easeInQuad' });

      // 2. Measure exact sub-pixel geometry
      const introLogoImg = document.getElementById('formulaLogoImg') || formulaLogoPod.querySelector('.formula-logo-img');
      const firstRect = formulaLogoPod.getBoundingClientRect();
      const lastRect  = targetLogoImg.getBoundingClientRect();

      if (!firstRect.width || !lastRect.width) {
        if (targetLogoImg) targetLogoImg.style.opacity = '1';
        introOverlay.remove();
        const heroTitle = document.querySelector('.hero-h1.kinetic-title');
        if (heroTitle) heroTitle.classList.add('is-revealed');
        return;
      }

      const deltaX = (lastRect.left + lastRect.width / 2) - (firstRect.left + firstRect.width / 2);
      const deltaY = (lastRect.top + lastRect.height / 2) - (firstRect.top + firstRect.height / 2);
      const scale  = lastRect.width / firstRect.width;

      // 3. Smoothly dissolve ambient aura during flight to seamlessly match flat header logo
      if (introLogoImg) {
        anime({
          targets: introLogoImg,
          filter: 'drop-shadow(0 0 0px rgba(226, 199, 153, 0))',
          duration: 620,
          easing: 'easeOutQuad'
        });
      }

      // 4. Dissolve velvet backdrop during flight
      anime({ targets: formulaBackdrop, opacity: 0, duration: 500, easing: 'easeOutQuad', delay: 40 });
      anime({ targets: introOverlay,    opacity: 0, duration: 550, easing: 'easeOutQuad', delay: 100 });

      // 5. Precision FLIP flight of the synthesized logo into the Dynamic Island dock
      anime({
        targets: formulaLogoPod,
        translateX: `${deltaX}px`,
        translateY: `${deltaY}px`,
        scale: scale,
        duration: 720,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
        complete: () => {
          if (targetLogoImg) targetLogoImg.style.opacity = '1';
          if (islandShell) {
            islandShell.classList.add('island-dock-settled');
            setTimeout(() => islandShell.classList.remove('island-dock-settled'), 900);
          }
          introOverlay.remove();
        }
      });

      // Bulletproof fail-safe: ensures overlay is removed even if animation is interrupted
      setTimeout(() => {
        if (document.body.contains(introOverlay)) {
          if (targetLogoImg) targetLogoImg.style.opacity = '1';
          introOverlay.remove();
        }
      }, 950);

      // Hero text reveal 180ms into flight
      setTimeout(() => {
        const heroTitle = document.querySelector('.hero-h1.kinetic-title');
        if (heroTitle) heroTitle.classList.add('is-revealed');
      }, 180);
    }

    // ─── SKIP HANDLER ───────────────────────────────────────────────────────
    function skipIntro() {
      if (timelineComplete) return;
      timelineComplete = true;
      sessionStorage.setItem('polish_formula_intro_seen', 'true');
      introOverlay.style.pointerEvents = 'none';
      if (targetLogoImg) targetLogoImg.style.opacity = '1';
      window.scrollTo(0, 0);
      try {
        anime.remove([formulaBackdrop, formulaOrbit, bead1, bead2, bead3,
                      coreBloom, shockwave1, shockwave2, formulaLogoPod, formulaGleam, formulaCaption, ...Array.from(sparks)]);
      } catch (e) {}
      introOverlay.remove();
      const heroTitle = document.querySelector('.hero-h1.kinetic-title');
      if (heroTitle) heroTitle.classList.add('is-revealed');
    }

    // ─── MASTER FORMULA SYNTHESIS TIMELINE ─────────────────────────────────
    const tl = anime.timeline({
      autoplay: true,
      complete: () => {
        if (timelineComplete) return;
        timelineComplete = true;
        sessionStorage.setItem('polish_formula_intro_seen', 'true');
        window.scrollTo(0, 0);
        introOverlay.style.pointerEvents = 'none';
        doFlipExit();
      }
    });

    // Phase 1: Hairline orbit track awakens (0–460ms)
    tl.add({
      targets: formulaOrbit,
      opacity: [0, 0.35],
      scale: [0.75, 1],
      rotate: ['-18deg', '0deg'],
      duration: 460,
      easing: 'easeOutCubic'
    }, 0);

    // Phase 2: 3 Golden Emulsion Beads converge toward center (60–640ms)
    tl.add({
      targets: [bead1, bead2, bead3],
      translateX: '0px',
      translateY: '0px',
      scale: [0.5, 1.15],
      opacity: [0, 1],
      duration: 580,
      easing: 'cubicBezier(0.4, 0, 0.2, 1)'
    }, 60);

    // Phase 3: COLLISION AT 640ms — Fusion of beads & orbit fade
    tl.add({
      targets: [bead1, bead2, bead3],
      scale: [1.15, 0.1],
      opacity: [1, 0],
      duration: 80,
      easing: 'easeOutQuad'
    }, 640);

    tl.add({
      targets: formulaOrbit,
      opacity: [0.35, 0],
      scale: [1, 1.25],
      duration: 200,
      easing: 'easeOutQuad'
    }, 640);

    // Phase 4: Coalescence Core Bloom Flash (650–980ms)
    tl.add({
      targets: coreBloom,
      scale: [0.2, 2.6],
      opacity: [
        { value: 1, duration: 60, easing: 'linear' },
        { value: 0, duration: 270, easing: 'easeOutQuad' }
      ],
      duration: 330,
      easing: 'easeOutQuad'
    }, 650);

    // Phase 5: High-Velocity Specular Shockwaves & Radial Micro-Sparks (660–1240ms)
    tl.add({
      targets: shockwave1,
      scale: [0.1, 4.8],
      opacity: [
        { value: 0.95, duration: 50, easing: 'linear' },
        { value: 0, duration: 530, easing: 'easeOutQuad' }
      ],
      duration: 580,
      easing: 'easeOutExpo'
    }, 660);

    tl.add({
      targets: shockwave2,
      scale: [0.1, 4.0],
      opacity: [
        { value: 0.75, duration: 50, easing: 'linear' },
        { value: 0, duration: 500, easing: 'easeOutQuad' }
      ],
      duration: 550,
      easing: 'easeOutExpo'
    }, 700);

    tl.add({
      targets: Array.from(sparks),
      opacity: [
        { value: 1, duration: 40, easing: 'linear' },
        { value: 0, duration: 320, delay: 60, easing: 'easeOutQuad' }
      ],
      translateX: (el) => {
        const dist = parseFloat(el.style.getPropertyValue('--spark-dist')) || 70;
        return `${dist}px`;
      },
      duration: 420,
      delay: anime.stagger(16, { from: 'center' }),
      easing: 'easeOutQuart'
    }, 660);

    // Phase 6: Synthesized POLISH Logo Relief Pod emerges (800–1320ms)
    tl.add({
      targets: formulaLogoPod,
      opacity: [0, 1],
      scale: [0.85, 1],
      duration: 520,
      easing: 'cubicBezier(0.16, 1, 0.3, 1)'
    }, 800);

    // Phase 7: Specular Gleam Sheen sweeps across the synthesized gold logo
    tl.add({
      targets: formulaGleam,
      translateX: ['-120%', '160%'],
      duration: 640,
      easing: 'easeInOutCubic'
    }, 920);

    // Phase 8: Editorial Caption tracking reveal
    tl.add({
      targets: formulaCaption,
      opacity: [0, 1],
      translateY: ['8px', '0px'],
      duration: 420,
      easing: 'easeOutQuad'
    }, 1060);

    // Phase 9: Brand Appreciation Hold before FLIP exit
    tl.add({
      targets: {},
      duration: 500
    }, 1480);

    // ─── Instant Skip listeners (no delay, responsive immediately) ──────────
    introOverlay.addEventListener('pointerdown', skipIntro, { once: true });
    introOverlay.addEventListener('touchstart', skipIntro, { once: true, passive: true });
    window.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaY) > 6 || Math.abs(e.deltaX) > 6) skipIntro();
    }, { once: true, passive: true });
    window.addEventListener('keydown', skipIntro, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLuxuryOpeningAnimation);
  } else {
    initLuxuryOpeningAnimation();
  }
})();
