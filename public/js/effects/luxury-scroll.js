/**
 * POLISH Luxury Web UI Engine — Scroll Velocity Physics & Dynamic Island Module
 * 
 * Provides:
 *  - Scroll velocity and fluid viscosity aerodynamic physics
 *  - Unified Dynamic Island header scroll progress & pinned state controller
 *  - 3D Flacon space travel & dolly-zoom depth inversion (Hero 0px -> 450px)
 *  - Smart sticky glowing CTA dock with reflow-free IntersectionObservers
 *  - Below-the-fold zero-cycle execution guard
 */

(function () {
  'use strict';

  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  let lastScrollTime = performance.now();
  let smoothVelocity = 0;
  let velocityDecayRAF = null;
  let scrollStopTimer = null;

  // Cached DOM elements
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

    // Dynamic Island Pinned Capsule state
    if (!isScrolled && scrollY > 45) {
      isScrolled = true;
      if (siteHeader) siteHeader.classList.add('is-scrolled');
    } else if (isScrolled && scrollY < 20) {
      isScrolled = false;
      if (siteHeader) siteHeader.classList.remove('is-scrolled');
    }

    // Dynamic Island Progress Bar
    if (progressBar) {
      const progress = Math.min(1, Math.max(0, scrollY / cachedDocHeight));
      progressBar.style.transform = `scaleX(${progress.toFixed(3)}) translateZ(0)`;
    }

    // Dolly-Zoom Depth Inversion & Flacon Space Travel (Hero 0px -> 450px)
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
})();
