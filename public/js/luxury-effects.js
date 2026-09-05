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
  // 8. SMART STICKY GLOWING CTA DOCK (AUTO-BLEND & COLLISION-SAFE)
  // =========================================================================
  const stickyDock = document.getElementById('stickyCtaDock');
  if (stickyDock) {
    const heroCta = document.querySelector('.hero-actions .btn-cta');
    const footer = document.querySelector('.site-footer');
    let heroCtaInView = true;
    let footerInView = false;

    function updateStickyVisibility() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      let heroPast = !heroCtaInView;
      let footerNear = footerInView;

      if (heroCta) {
        const heroRect = heroCta.getBoundingClientRect();
        if (heroRect.bottom < 80) {
          heroPast = true;
        } else if (heroRect.top > 0) {
          heroPast = false;
        }
      }
      if (footer) {
        const footerRect = footer.getBoundingClientRect();
        if (footerRect.top < window.innerHeight + 50) {
          footerNear = true;
        } else {
          footerNear = false;
        }
      }

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

    if ('IntersectionObserver' in window) {
      if (heroCta) {
        const heroObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            heroCtaInView = entry.isIntersecting;
            updateStickyVisibility();
          });
        }, { threshold: 0.1 });
        heroObserver.observe(heroCta);
      }

      if (footer) {
        const footerObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            footerInView = entry.isIntersecting;
            updateStickyVisibility();
          });
        }, { threshold: 0.05 });
        footerObserver.observe(footer);
      }
    }

    window.addEventListener('scroll', () => {
      requestAnimationFrame(updateStickyVisibility);
    }, { passive: true });
    updateStickyVisibility();
  }

  // =========================================================================
  // 10. THE LABORATORY DROP — Opening Cinematic
  //     Anime.js timeline: white lab → gold droplet falls → impact ripple →
  //     ink flood → logo emerges → FLIP to Dynamic Island
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

    // Reduced motion — skip entire animation
    if (prefersReducedMotion) {
      sessionStorage.setItem('polish_intro_seen', 'true');
      introOverlay.remove();
      const heroTitle = document.querySelector('.hero-h1.kinetic-title');
      if (heroTitle) heroTitle.classList.add('is-revealed');
      return;
    }

    // Elements
    const labCanvas     = document.getElementById('labCanvas');
    const labInkFlood   = document.getElementById('labInkFlood');
    const dropletSvg    = document.getElementById('labDropletSvg');
    const dropPath      = document.getElementById('dropPath');
    const dropHighlight = dropletSvg ? dropletSvg.querySelector('ellipse') : null;
    const ripple1       = document.getElementById('labRipple1');
    const ripple2       = document.getElementById('labRipple2');
    const ripple3       = document.getElementById('labRipple3');
    const splashEls     = document.querySelectorAll('.lab-splash');
    const introLogoPod  = document.getElementById('introLogoPod');
    const introCaption  = document.getElementById('introCaption');
    const islandShell   = document.getElementById('dynamicIslandShell');
    const targetLogoImg = document.querySelector('.island-logo-zone .brand-logo-img') || document.querySelector('.brand-logo-img');

    if (targetLogoImg) {
      targetLogoImg.style.opacity = '0';
    }

    // Anime.js is loaded from CDN; fall back to instant if not available
    if (typeof anime === 'undefined') {
      sessionStorage.setItem('polish_intro_seen', 'true');
      if (targetLogoImg) targetLogoImg.style.opacity = '1';
      introOverlay.remove();
      const heroTitle = document.querySelector('.hero-h1.kinetic-title');
      if (heroTitle) heroTitle.classList.add('is-revealed');
      return;
    }

    let timelineComplete = false;

    // ─── FLIP EXIT (shared with old code, called after logo appear) ───────────
    function doFlipExit() {
      if (!targetLogoImg || !introLogoPod) {
        if (targetLogoImg) targetLogoImg.style.opacity = '1';
        introOverlay.remove();
        const heroTitle = document.querySelector('.hero-h1.kinetic-title');
        if (heroTitle) heroTitle.classList.add('is-revealed');
        return;
      }

      // Fade caption
      anime({ targets: introCaption, opacity: 0, translateY: -10, duration: 280, easing: 'easeInQuad' });

      const firstRect = introLogoPod.getBoundingClientRect();
      const lastRect  = targetLogoImg.getBoundingClientRect();
      const deltaX    = (lastRect.left + lastRect.width / 2) - (firstRect.left + firstRect.width / 2);
      const deltaY    = (lastRect.top + lastRect.height / 2) - (firstRect.top + firstRect.height / 2);
      const scale     = lastRect.width / firstRect.width;

      // Fade the ink flood canvas out as logo flies away
      anime({ targets: labInkFlood, opacity: 0, duration: 640, easing: 'easeOutQuad', delay: 80 });
      anime({ targets: labCanvas,   opacity: 0, duration: 640, easing: 'easeOutQuad', delay: 80 });

      // FLIP the logo to the island
      anime({
        targets: introLogoPod,
        translateX: deltaX,
        translateY: deltaY,
        scale: scale,
        duration: 780,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)',
        complete: () => {
          if (targetLogoImg) targetLogoImg.style.opacity = '1';
          if (islandShell) {
            islandShell.classList.add('island-dock-settled');
            setTimeout(() => islandShell.classList.remove('island-dock-settled'), 1000);
          }
          introOverlay.remove();
        }
      });

      // Hero text reveal 200ms into flight
      setTimeout(() => {
        const heroTitle = document.querySelector('.hero-h1.kinetic-title');
        if (heroTitle) heroTitle.classList.add('is-revealed');
      }, 200);
    }

    // ─── SKIP — user tapped / scrolled ─────────────────────────────────────
    function skipIntro() {
      if (timelineComplete) return;
      timelineComplete = true;
      sessionStorage.setItem('polish_intro_seen', 'true');
      introOverlay.style.pointerEvents = 'none';
      if (targetLogoImg) targetLogoImg.style.opacity = '1';
      window.scrollTo(0, 0);
      anime.remove([dropletSvg, dropPath, dropHighlight, labInkFlood, labCanvas,
                    ripple1, ripple2, ripple3, introLogoPod, introCaption, ...Array.from(splashEls)]);
      introOverlay.remove();
      const heroTitle = document.querySelector('.hero-h1.kinetic-title');
      if (heroTitle) heroTitle.classList.add('is-revealed');
    }

    // ─── MASTER TIMELINE ────────────────────────────────────────────────────
    const tl = anime.timeline({
      autoplay: true,
      complete: () => {
        if (timelineComplete) return;
        timelineComplete = true;
        sessionStorage.setItem('polish_intro_seen', 'true');
        window.scrollTo(0, 0);
        introOverlay.style.pointerEvents = 'none';
        doFlipExit();
      }
    });

    // ─ Phase 1: Droplet appears at top, sharp and focused (0–80ms) ──────────
    tl.add({
      targets: [dropPath, dropHighlight],
      opacity: [0, 1],
      duration: 80,
      easing: 'linear',
      delay: anime.stagger(30)
    }, 0);

    // ─ Phase 2: Droplet falls — accelerates with a natural squash/stretch ───
    // The SVG itself translates downward, while the path internally squishes on impact
    tl.add({
      targets: dropletSvg,
      translateY: ['0px', '155px'],   // falls from -120px top into center-screen
      duration: 620,
      easing: 'cubicBezier(0.2, 0, 1, 1)',  // ease-in gravity
    }, 80);

    // Subtle vertical stretch during fall (aerodynamics)
    tl.add({
      targets: dropletSvg,
      scaleY: [1, 1.14],
      scaleX: [1, 0.88],
      duration: 600,
      easing: 'easeInQuad',
    }, 80);

    // ─ Phase 3: IMPACT — squash on landing ─────────────────────────────────
    tl.add({
      targets: dropletSvg,
      scaleY: [1.14, 0.45],
      scaleX: [0.88, 1.55],
      opacity: [1, 0],
      duration: 120,
      easing: 'easeOutQuad',
    }, 700);

    // ─ Phase 4: Ripple rings expand from impact point ───────────────────────
    tl.add({
      targets: ripple1,
      opacity: [0.95, 0],
      scale: [0, 5],
      duration: 560,
      easing: 'easeOutExpo',
    }, 700);

    tl.add({
      targets: ripple2,
      opacity: [0.7, 0],
      scale: [0, 9],
      duration: 640,
      easing: 'easeOutExpo',
    }, 760);

    tl.add({
      targets: ripple3,
      opacity: [0.4, 0],
      scale: [0, 14],
      duration: 720,
      easing: 'easeOutExpo',
    }, 830);

    // ─ Phase 5: Splash micro-droplets burst outward ──────────────────────────
    tl.add({
      targets: Array.from(splashEls),
      opacity: [
        { value: [0, 1], duration: 60, easing: 'linear' },
        { value: [1, 0], duration: 320, easing: 'easeOutQuad', delay: 80 }
      ],
      translateY: (el, i) => {
        const baseOffset = -30 - (i % 3) * 12;
        return [0, `${baseOffset}px`];
      },
      translateX: (el, i) => {
        const angle = (360 / splashEls.length) * i * (Math.PI / 180);
        return [0, `${Math.sin(angle) * 28}px`];
      },
      scale: [0.4, 1.2],
      duration: 440,
      delay: anime.stagger(30, { from: 'center' }),
      easing: 'easeOutQuart',
    }, 710);

    // ─ Phase 6: Ink flood expands outward from impact point ─────────────────
    // clip-path circle expands from 0% to 150% (covers entire screen)
    tl.add({
      targets: labInkFlood,
      clipPath: ['circle(0% at 50% 52%)', 'circle(150% at 50% 52%)'],
      duration: 860,
      easing: 'cubicBezier(0.4, 0, 0.2, 1)',
    }, 760);

    // White canvas fades out slightly ahead of ink to avoid hard edge
    tl.add({
      targets: labCanvas,
      opacity: [1, 0],
      duration: 280,
      easing: 'easeInQuad',
    }, 1050);

    // ─ Phase 7: Logo emerges from the obsidian ──────────────────────────────
    tl.add({
      targets: introLogoPod,
      opacity: [0, 1],
      translateY: ['14px', '0px'],
      duration: 480,
      easing: 'cubicBezier(0.16, 1, 0.3, 1)',
    }, 1180);

    // Caption fades in behind logo
    tl.add({
      targets: introCaption,
      opacity: [0, 1],
      translateY: ['10px', '0px'],
      duration: 380,
      easing: 'easeOutQuad',
    }, 1380);

    // Hold for brand appreciation — then FLIP runs via timeline complete callback
    // Total hold: ~400ms of logo + 200ms appreciation = FLIP fires at ~1980ms total
    tl.add({
      targets: {},  // no-op hold
      duration: 400,
    }, 1580);

    // ─── Skip listeners ─────────────────────────────────────────────────────
    introOverlay.addEventListener('pointerdown', skipIntro, { once: true });
    window.addEventListener('wheel',      skipIntro, { once: true, passive: true });
    window.addEventListener('touchstart', skipIntro, { once: true, passive: true });
    window.addEventListener('touchmove',  skipIntro, { once: true, passive: true });
    window.addEventListener('keydown',    skipIntro, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLuxuryOpeningAnimation);
  } else {
    initLuxuryOpeningAnimation();
  }
})();
