/**
 * POLISH Luxury Web UI Engine — Opening Cinematic Module
 * 
 * Concept 2: The Formula Synthesis
 * Anime.js timeline:
 * 3 converging golden emulsion beads (120° angles) -> collision & coalescence ->
 * luminous micro-shockwave & sparks -> POLISH logo relief synthesis & gleam ->
 * shared-element FLIP into Dynamic Island header.
 */

(function () {
  'use strict';

  let currentTimeline = null;
  let skipHandlerRegistered = false;

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

    // Reduced motion — skip entire animation
    if (isReducedMotion()) {
      sessionStorage.setItem('polish_formula_intro_seen', 'true');
      introOverlay.remove();
      revealHeroTitle();
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
    const formulaLogoInner  = document.getElementById('formulaLogoInner');
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
      revealHeroTitle();
      return;
    }

    let timelineComplete = false;

    // Radius calculation for 120° orbital convergence (responsive)
    const isMobile = window.innerWidth <= 768;
    const radius = isMobile ? 100 : 140;
    const b1Y = -radius, b1X = 0;
    const b2X = Math.round(radius * 0.866), b2Y = Math.round(radius * 0.5);
    const b3X = -Math.round(radius * 0.866), b3Y = Math.round(radius * 0.5);

    // Explicitly initialize all animated targets with anime.set()
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

    // FLIP EXIT (shared-element FLIP into Dynamic Island)
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
    currentTimeline = tl;

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

    // Instant Skip listeners
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
})();
