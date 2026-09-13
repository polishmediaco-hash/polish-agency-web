/**
 * POLISH Luxury Web UI Engine — Unified Visual Physics Lifecycle Dispatcher
 * 
 * Coordinates the 6 single-responsibility visual physics submodules:
 *  1. PolishThermalGuard       — Mobile CPU/GPU thermal & battery guard + reduced motion
 *  2. PolishKineticTypography  — Editorial typography mask reveals with GPU layer deallocation
 *  3. PolishSpotlightCards     — 120 FPS cursor spotlight, 3D micro-tilt & magnetic buttons
 *  4. PolishParticleCanvas     — Ambient champagne-gold particle canvas with zero-cycle fold pause
 *  5. PolishLuxuryScroll       — Scroll velocity physics, Dynamic Island header & flacon space travel
 *  6. PolishOpeningCinematic   — Concept 2: The Formula Synthesis Opening Cinematic (Anime.js)
 * 
 * Provides 100% backward compatibility for single-script delivery and modular individual consumption.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. MOBILE THERMAL & BATTERY GUARD MODULE
  // =========================================================================
  if (!window.PolishThermalGuard) {
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
  }

  // =========================================================================
  // 2. EDITORIAL KINETIC TYPOGRAPHY MODULE
  // =========================================================================
  if (!window.PolishKineticTypography) {
    function revealKineticTitle(titleEl) {
      if (!titleEl || titleEl.classList.contains('is-revealed')) return;

      const lines = titleEl.querySelectorAll('.kinetic-line, .kinetic-text');
      const isReduced = window.PolishThermalGuard ? window.PolishThermalGuard.isReducedMotion() : false;

      if (isReduced) {
        titleEl.classList.add('is-revealed', 'is-settled');
        titleEl.style.willChange = 'auto';
        lines.forEach(el => {
          el.style.willChange = 'auto';
        });
        return;
      }

      titleEl.classList.add('is-revealing');
      titleEl.style.willChange = 'transform';
      lines.forEach(el => {
        el.style.willChange = 'transform';
      });

      titleEl.classList.add('is-revealed');

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

      const heroTitle = document.querySelector('.couture-h1.kinetic-title, .hero-h1.kinetic-title');
      const introOverlay = document.getElementById('luxuryIntro');
      const hasSeenIntro = sessionStorage.getItem('polish_intro_seen') === 'true' || sessionStorage.getItem('polish_formula_intro_seen') === 'true';
      const isReduced = window.PolishThermalGuard ? window.PolishThermalGuard.isReducedMotion() : false;

      if (heroTitle && (!introOverlay || hasSeenIntro || isReduced)) {
        revealKineticTitle(heroTitle);
      }

      if ('IntersectionObserver' in window && !isReduced) {
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
  }

  // =========================================================================
  // 3. DYNAMIC CURSOR SPOTLIGHT & TACTILE PHYSICS MODULE
  // =========================================================================
  if (!window.PolishSpotlightCards) {
    function isGuardActive() {
      if (window.PolishThermalGuard) {
        return window.PolishThermalGuard.isMobile() || window.PolishThermalGuard.isReducedMotion();
      }
      return window.innerWidth <= 768;
    }

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
            const pullX = Math.max(-8, Math.min(8, (clientX - centerX) * 0.28));
            const pullY = Math.max(-8, Math.min(8, (clientY - centerY) * 0.28));
            btn.style.transform = `translate3d(${pullX.toFixed(1)}px, ${(pullY - 2).toFixed(1)}px, 0)`;

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
  }

  // =========================================================================
  // 4. AMBIENT PARTICLES ENGINE MODULE
  // =========================================================================
  if (!window.PolishParticleCanvas) {
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
      return window.innerWidth <= 768;
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
  }

  // =========================================================================
  // 5. SCROLL VELOCITY PHYSICS & DYNAMIC ISLAND MODULE
  // =========================================================================
  if (!window.PolishLuxuryScroll) {
    let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
    let lastScrollTime = performance.now();
    let smoothVelocity = 0;
    let velocityDecayRAF = null;
    let scrollStopTimer = null;

    let domHeroSection = null;
    let domBottleWrap = null;
    let domBgDepthFar = null;
    let domBgDepthMid = null;
    let domPulseDot = null;
    let domCoutureTitle = null;
    let isHeroInView = true;

    let siteHeader = null;
    let progressBar = null;
    let isScrolled = false;
    let cachedDocHeight = 1000;
    let lastBottleProgress = -1;

    let stickyDock = null;
    let heroCta = null;
    let footer = null;
    let heroCtaInView = true;
    let footerInView = false;
    let isStickyDockVisible = false;

    let islandRAF = null;
    let lastScrollFrameTime = 0;
    let mobileScrollTailTimer = null;

    function isMobileGuard() {
      return window.PolishThermalGuard ? window.PolishThermalGuard.isMobile() : (window.innerWidth <= 768);
    }

    function isReducedMotion() {
      return window.PolishThermalGuard ? window.PolishThermalGuard.isReducedMotion() : false;
    }

    function cacheScrollElements() {
      domHeroSection = document.getElementById('heroCoutureSection');
      domBottleWrap = document.getElementById('heroBottleWrap');
      domBgDepthFar = document.querySelector('.beauty-depth-far');
      domBgDepthMid = document.querySelector('.beauty-depth-mid');
      domPulseDot = document.querySelector('.island-pulse-dot');
      domCoutureTitle = document.querySelector('.couture-h1');
      if (!domHeroSection && domBottleWrap) {
        domHeroSection = domBottleWrap.closest('section');
      }
      siteHeader = document.getElementById('siteHeader') || document.querySelector('.site-header');
      progressBar = document.querySelector('.dynamic-island-progress-bar');
      stickyDock = document.getElementById('stickyCtaDock');
      heroCta = document.querySelector('.hero-actions .btn-cta') || document.querySelector('.btn-jewel-couture');
      footer = document.querySelector('.site-footer');
    }

    function measureScrollMetrics() {
      cachedDocHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    }

    function initHeroIntersectionObserver() {
      if (!domHeroSection && domBottleWrap) {
        domHeroSection = domBottleWrap.closest('section') || document.getElementById('heroCoutureSection');
      }
      if (!domHeroSection) return;

      if ('IntersectionObserver' in window) {
        const heroObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            isHeroInView = entry.isIntersecting;
            if (isHeroInView) {
              scheduleScrollUpdate();
            }
          });
        }, { threshold: 0 });
        heroObserver.observe(domHeroSection);
      }
    }

    function applyFluidViscosity() {
      if (isReducedMotion() || isMobileGuard()) return;

      if (domBgDepthMid) {
        const tiltDeg = Math.max(-3.2, Math.min(3.2, -smoothVelocity * 0.14));
        const dragPx = Math.max(-18, Math.min(18, -smoothVelocity * 0.8));
        domBgDepthMid.style.setProperty('--fluid-drag-layer', `${dragPx.toFixed(1)}px`);
        domBgDepthMid.style.setProperty('--fluid-tilt-layer', `${tiltDeg.toFixed(2)}deg`);
      }

      if (domBgDepthFar) {
        const farDragPx = Math.max(-10, Math.min(10, -smoothVelocity * 0.35));
        domBgDepthFar.style.setProperty('--fluid-drag-layer', `${farDragPx.toFixed(1)}px`);
      }

      if (domPulseDot) {
        const energy = Math.min(1, Math.abs(smoothVelocity) / 10);
        domPulseDot.style.opacity = (0.7 + energy * 0.3).toFixed(2);
        domPulseDot.style.transform = `scale(${(1 + energy * 0.35).toFixed(2)}) translateZ(0)`;
      }

      if (domCoutureTitle && isHeroInView) {
        const emulsionSkew = Math.max(-1.4, Math.min(1.4, -smoothVelocity * 0.08));
        domCoutureTitle.style.transform = `skewX(${emulsionSkew.toFixed(2)}deg)`;
      }
    }

    function startVelocityDecay() {
      if (isMobileGuard() || isReducedMotion()) {
        smoothVelocity = 0;
        return;
      }

      if (velocityDecayRAF) cancelAnimationFrame(velocityDecayRAF);
      function decay() {
        if (Math.abs(smoothVelocity) > 0.04) {
          smoothVelocity *= 0.86;
          applyFluidViscosity();
          velocityDecayRAF = requestAnimationFrame(decay);
        } else {
          smoothVelocity = 0;
          applyFluidViscosity();
          velocityDecayRAF = null;
        }
      }
      velocityDecayRAF = requestAnimationFrame(decay);
    }

    function updateStickyVisibility(passedScrollY) {
      if (!stickyDock) return;
      const scrollY = typeof passedScrollY === 'number' ? passedScrollY : (window.pageYOffset || document.documentElement.scrollTop || 0);
      const heroPast = !heroCtaInView;
      const footerNear = footerInView;
      const shouldBeVisible = (scrollY > 160 && heroPast && !footerNear);

      if (shouldBeVisible !== isStickyDockVisible) {
        isStickyDockVisible = shouldBeVisible;
        if (shouldBeVisible) {
          stickyDock.classList.add('is-visible');
          stickyDock.setAttribute('aria-hidden', 'false');
          document.body.classList.add('has-sticky-cta');
        } else {
          stickyDock.classList.remove('is-visible');
          stickyDock.setAttribute('aria-hidden', 'true');
          document.body.classList.remove('has-sticky-cta');
        }
      }
    }

    function initStickyDockObservers() {
      if (!stickyDock || !('IntersectionObserver' in window)) return;

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

    function updateScrollState() {
      const scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
      const now = performance.now();
      const dt = Math.max(16, now - lastScrollTime);
      lastScrollTime = now;

      const rawVelocity = ((scrollY - lastScrollY) / dt) * 16;
      lastScrollY = scrollY;
      const clampedVelocity = Math.max(-24, Math.min(24, rawVelocity));
      smoothVelocity += (clampedVelocity - smoothVelocity) * 0.24;

      const mobile = isMobileGuard();
      const reduced = isReducedMotion();

      if (!mobile && !reduced) {
        applyFluidViscosity();
        clearTimeout(scrollStopTimer);
        scrollStopTimer = setTimeout(startVelocityDecay, 90);
      }

      if (!isScrolled && scrollY > 45) {
        isScrolled = true;
        if (siteHeader) siteHeader.classList.add('is-scrolled');
      } else if (isScrolled && scrollY < 20) {
        isScrolled = false;
        if (siteHeader) siteHeader.classList.remove('is-scrolled');
      }

      if (progressBar) {
        const progress = Math.min(1, Math.max(0, scrollY / cachedDocHeight));
        progressBar.style.transform = `scaleX(${progress.toFixed(3)}) translateZ(0)`;
      }

      if (domBottleWrap) {
        if (reduced) {
          if (lastBottleProgress !== 0) {
            lastBottleProgress = 0;
            domBottleWrap.style.transform = 'none';
            domBottleWrap.style.opacity = '1';
            domBottleWrap.style.willChange = 'auto';
          }
        } else if (!isHeroInView) {
          if (scrollY > 450 && lastBottleProgress !== 1) {
            lastBottleProgress = 1;
            if (mobile) {
              domBottleWrap.style.transform = 'translate3d(0, -20px, 0) scale(0.55)';
              domBottleWrap.style.opacity = '0.45';
            } else {
              const isRTL = document.documentElement.dir === 'rtl';
              const shiftX = (isRTL ? -1 : 1) * 110;
              domBottleWrap.style.transform = `translate3d(${shiftX.toFixed(1)}px, -25px, 0) scale(0.350)`;
              domBottleWrap.style.opacity = '0.35';
            }
          }
        } else {
          const maxScroll = 450;
          const progress = Math.min(Math.max(scrollY / maxScroll, 0), 1);
          const updateThreshold = mobile ? 0.012 : 0.003;

          if (Math.abs(progress - lastBottleProgress) > updateThreshold || (progress === 1 && lastBottleProgress !== 1) || (progress === 0 && lastBottleProgress !== 0)) {
            lastBottleProgress = progress;

            if (mobile) {
              const mScale = 1 - (progress * 0.45);
              const mShiftY = progress * -20;
              const mOpacity = 1 - (progress * 0.55);
              domBottleWrap.style.transform = `translate3d(0, ${mShiftY.toFixed(1)}px, 0) scale(${mScale.toFixed(2)})`;
              domBottleWrap.style.opacity = mOpacity.toFixed(2);
            } else {
              const scale = 1 - (progress * 0.65);
              const isRTL = document.documentElement.dir === 'rtl';
              const shiftX = (isRTL ? -1 : 1) * (progress * 110);
              const shiftY = progress * -25;
              const opacity = 1 - (progress * 0.65);

              domBottleWrap.style.transform = `translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
              domBottleWrap.style.opacity = opacity.toFixed(2);

              const bgOpacity = 0.30 + (progress * 0.35);
              if (domBgDepthFar) {
                domBgDepthFar.style.opacity = bgOpacity.toFixed(2);
              }
              if (domBgDepthMid) {
                const bgScale = 0.80 + (progress * 0.20);
                domBgDepthMid.style.transform = `scale(${bgScale.toFixed(3)}) translateZ(0)`;
              }
            }
          }
        }
      }

      updateStickyVisibility(scrollY);
    }

    function scheduleScrollUpdate() {
      if (islandRAF) return;
      islandRAF = requestAnimationFrame((timestamp) => {
        islandRAF = null;

        if (isMobileGuard()) {
          const delta = timestamp - lastScrollFrameTime;
          if (delta < 14) {
            clearTimeout(mobileScrollTailTimer);
            mobileScrollTailTimer = setTimeout(updateScrollState, 20);
            return;
          }
          lastScrollFrameTime = timestamp;
        }

        updateScrollState();
      });
    }

    function initLuxuryScroll() {
      cacheScrollElements();
      measureScrollMetrics();
      initHeroIntersectionObserver();
      initStickyDockObservers();
      window.addEventListener('resize', measureScrollMetrics, { passive: true });
      window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
      updateScrollState();
    }

    window.PolishLuxuryScroll = {
      initLuxuryScroll,
      updateScrollState,
      scheduleScrollUpdate,
      cacheScrollElements,
      measureScrollMetrics,
      getSmoothVelocity: () => smoothVelocity
    };
  }

  // =========================================================================
  // 6. OPENING CINEMATIC MODULE
  // =========================================================================
  if (!window.PolishOpeningCinematic) {
    function isReducedMotion() {
      return window.PolishThermalGuard ? window.PolishThermalGuard.isReducedMotion() : false;
    }

    function revealHeroTitle() {
      const heroTitle = document.querySelector('.couture-h1.kinetic-title, .hero-h1.kinetic-title');
      if (heroTitle && window.PolishKineticTypography) {
        window.PolishKineticTypography.revealKineticTitle(heroTitle);
      } else if (heroTitle) {
        heroTitle.classList.add('is-revealed', 'is-settled');
      }
    }

    function initLuxuryOpeningAnimation() {
      const introOverlay = document.getElementById('luxuryIntro');
      if (!introOverlay) return;

      const hasSeen = sessionStorage.getItem('polish_formula_intro_seen') === 'true';
      const urlParams = new URLSearchParams(window.location.search);
      const forceReplay = urlParams.get('replay_intro') === '1';

      if (hasSeen && !forceReplay) {
        introOverlay.remove();
        revealHeroTitle();
        return;
      }

      if (isReducedMotion()) {
        sessionStorage.setItem('polish_formula_intro_seen', 'true');
        introOverlay.remove();
        revealHeroTitle();
        return;
      }

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
      const formulaLogoInner  = document.getElementById('formulaLogoInner');
      const formulaGleam      = document.getElementById('formulaGleam');
      const formulaCaption    = document.getElementById('formulaCaption');
      const skipHint          = document.getElementById('introSkipHint');
      const islandShell       = document.getElementById('dynamicIslandShell');
      const targetLogoImg     = document.querySelector('.island-logo-zone .brand-logo-img') || document.querySelector('.brand-logo-img');

      if (targetLogoImg) {
        targetLogoImg.style.opacity = '0';
      }

      if (typeof anime === 'undefined') {
        sessionStorage.setItem('polish_formula_intro_seen', 'true');
        if (targetLogoImg) targetLogoImg.style.opacity = '1';
        introOverlay.remove();
        revealHeroTitle();
        return;
      }

      let timelineComplete = false;

      const isMobile = window.innerWidth <= 768;
      const radius = isMobile ? 100 : 140;
      const b1Y = -radius, b1X = 0;
      const b2X = Math.round(radius * 0.866), b2Y = Math.round(radius * 0.5);
      const b3X = -Math.round(radius * 0.866), b3Y = Math.round(radius * 0.5);

      anime.set(bead1, { translateX: `${b1X}px`, translateY: `${b1Y}px`, scale: 0.5, opacity: 0 });
      anime.set(bead2, { translateX: `${b2X}px`, translateY: `${b2Y}px`, scale: 0.5, opacity: 0 });
      anime.set(bead3, { translateX: `${b3X}px`, translateY: `${b3Y}px`, scale: 0.5, opacity: 0 });
      anime.set(formulaOrbit, { opacity: 0, scale: 0.75, rotate: '-18deg' });
      anime.set(coreBloom, { opacity: 0, scale: 0.1 });
      anime.set(shockwave1, { opacity: 0, scale: 0.1 });
      anime.set(shockwave2, { opacity: 0, scale: 0.1 });
      anime.set(formulaLogoPod, { opacity: 0, translateX: '0px', translateY: '0px' });
      if (formulaLogoInner) anime.set(formulaLogoInner, { scale: 0.85, transformOrigin: '50% 50%' });
      anime.set(formulaGleam, { translateX: '-120%' });
      anime.set(formulaCaption, { opacity: 0, translateY: '8px' });

      function doFlipExit() {
        if (!targetLogoImg || !formulaLogoPod) {
          if (targetLogoImg) targetLogoImg.style.opacity = '1';
          introOverlay.remove();
          revealHeroTitle();
          return;
        }

        if (formulaCaption) anime({ targets: formulaCaption, opacity: 0, translateY: -8, duration: 180, easing: 'easeInQuad' });
        if (skipHint) anime({ targets: skipHint, opacity: 0, duration: 160, easing: 'easeInQuad' });

        const introLogoImg = document.getElementById('formulaLogoImg') || formulaLogoPod.querySelector('.formula-logo-img');
        const firstRect = formulaLogoPod.getBoundingClientRect();
        const lastRect  = targetLogoImg.getBoundingClientRect();

        if (!firstRect.width || !lastRect.width) {
          if (targetLogoImg) targetLogoImg.style.opacity = '1';
          introOverlay.remove();
          revealHeroTitle();
          return;
        }

        const deltaX = (lastRect.left + lastRect.width / 2) - (firstRect.left + firstRect.width / 2);
        const deltaY = (lastRect.top + lastRect.height / 2) - (firstRect.top + firstRect.height / 2);
        const scale  = lastRect.width / firstRect.width;

        if (introLogoImg) {
          anime({
            targets: introLogoImg,
            filter: 'drop-shadow(0 0 0px rgba(226, 199, 153, 0))',
            duration: 620,
            easing: 'easeOutQuad'
          });
        }

        anime({ targets: formulaBackdrop, opacity: 0, duration: 580, easing: 'easeOutQuad', delay: 40 });

        anime({
          targets: formulaLogoPod,
          translateX: `${deltaX}px`,
          translateY: `${deltaY}px`,
          duration: 720,
          easing: 'cubicBezier(0.16, 1, 0.3, 1)'
        });

        if (formulaLogoInner) {
          anime({
            targets: formulaLogoInner,
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
        } else {
          setTimeout(() => {
            if (targetLogoImg) targetLogoImg.style.opacity = '1';
            introOverlay.remove();
          }, 720);
        }

        setTimeout(() => {
          if (document.body.contains(introOverlay)) {
            if (targetLogoImg) targetLogoImg.style.opacity = '1';
            introOverlay.remove();
          }
        }, 950);

        setTimeout(() => {
          revealHeroTitle();
        }, 180);
      }

      function skipIntro() {
        if (timelineComplete) return;
        timelineComplete = true;
        sessionStorage.setItem('polish_formula_intro_seen', 'true');
        introOverlay.style.pointerEvents = 'none';
        if (targetLogoImg) targetLogoImg.style.opacity = '1';
        window.scrollTo(0, 0);
        try {
          anime.remove([formulaBackdrop, formulaOrbit, bead1, bead2, bead3,
                        coreBloom, shockwave1, shockwave2, formulaLogoPod, formulaLogoInner, formulaGleam, formulaCaption, ...Array.from(sparks)]);
        } catch (e) {}
        introOverlay.remove();
        revealHeroTitle();
      }

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

      tl.add({
        targets: formulaOrbit,
        opacity: [0, 0.35],
        scale: [0.75, 1],
        rotate: ['-18deg', '0deg'],
        duration: 460,
        easing: 'easeOutCubic'
      }, 0);

      tl.add({
        targets: [bead1, bead2, bead3],
        translateX: '0px',
        translateY: '0px',
        scale: [0.5, 1.15],
        opacity: [0, 1],
        duration: 580,
        easing: 'cubicBezier(0.4, 0, 0.2, 1)'
      }, 60);

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

      tl.add({
        targets: formulaLogoPod,
        opacity: [0, 1],
        duration: 520,
        easing: 'cubicBezier(0.16, 1, 0.3, 1)'
      }, 800);

      if (formulaLogoInner) {
        tl.add({
          targets: formulaLogoInner,
          scale: [0.85, 1],
          duration: 520,
          easing: 'cubicBezier(0.16, 1, 0.3, 1)'
        }, 800);
      }

      tl.add({
        targets: formulaGleam,
        translateX: ['-120%', '160%'],
        duration: 640,
        easing: 'easeInOutCubic'
      }, 920);

      tl.add({
        targets: formulaCaption,
        opacity: [0, 1],
        translateY: ['8px', '0px'],
        duration: 420,
        easing: 'easeOutQuad'
      }, 1060);

      tl.add({
        targets: {},
        duration: 500
      }, 1480);

      introOverlay.addEventListener('pointerdown', skipIntro, { once: true });
      introOverlay.addEventListener('touchstart', skipIntro, { once: true, passive: true });
      window.addEventListener('wheel', (e) => {
        if (Math.abs(e.deltaY) > 6 || Math.abs(e.deltaX) > 6) skipIntro();
      }, { once: true, passive: true });
      window.addEventListener('keydown', skipIntro, { once: true });
    }

    window.PolishOpeningCinematic = {
      initLuxuryOpeningAnimation
    };
  }

  // =========================================================================
  // 7. CONSOLIDATED LIFECYCLE DISPATCHER
  // =========================================================================
  function initAll() {
    // 1. Enforce reduced-motion policies immediately
    if (window.PolishThermalGuard) {
      window.PolishThermalGuard.applyReducedMotionPolicy();
    }

    // 2. Kinetic typography reveals
    if (window.PolishKineticTypography) {
      window.PolishKineticTypography.initKineticTypography();
    }

    // 3. Spotlight cards & magnetic buttons
    if (window.PolishSpotlightCards) {
      window.PolishSpotlightCards.initAll();
    }

    // 4. Ambient luminescence particle canvas
    if (window.PolishParticleCanvas) {
      window.PolishParticleCanvas.initParticleCanvas();
    }

    // 5. Scroll physics, Dynamic Island header & flacon space travel
    if (window.PolishLuxuryScroll) {
      window.PolishLuxuryScroll.initLuxuryScroll();
    }

    // 6. Opening cinematic
    if (window.PolishOpeningCinematic) {
      window.PolishOpeningCinematic.initLuxuryOpeningAnimation();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  window.PolishLuxuryEffects = {
    initAll,
    ThermalGuard: window.PolishThermalGuard,
    KineticTypography: window.PolishKineticTypography,
    SpotlightCards: window.PolishSpotlightCards,
    ParticleCanvas: window.PolishParticleCanvas,
    LuxuryScroll: window.PolishLuxuryScroll,
    OpeningCinematic: window.PolishOpeningCinematic
  };
})();
