/**
 * POLISH Media Co. — Haute Atelier DTC Revenue Velocity Console
 * 
 * Luxury Diagnostic Modeling:
 *  - 4 Strategic Growth Tiers (Emerging, Breakout, High-Growth, Dominance)
 *  - Single Fluid Precision Scrubber ($20k - $1.5M/mo)
 *  - Real-Time Mathematical Trajectory Engine:
 *      * CAC Compression (-28% to -42%)
 *      * Routine Bundling AOV Lift (+$16 to +$38)
 *      * 60-Day Replenishment Lift (+52% to +74%)
 *      * Projected 90-Day Trajectory ($50k -> $118k, $150k -> $345k, etc.)
 *  - Funnel Conversion Bridge to /apply
 */

(function () {
  'use strict';

  function initLuxuryCalculator() {
    const calcSection = document.getElementById('dtcCalculator');
    if (!calcSection) return;

    // Elements
    const tierButtons = document.querySelectorAll('.calc-tier-btn');
    const revSlider = document.getElementById('calcRevScrubber');
    const revReadout = document.getElementById('calcRevCurrent');
    
    // Outputs
    const outTrajectory = document.getElementById('calcOutTrajectory');
    const outVelocityPct = document.getElementById('calcOutVelocityPct');
    const outAnnualValue = document.getElementById('calcOutAnnual');
    const outCac = document.getElementById('calcOutCac');
    const outAov = document.getElementById('calcOutAov');
    const outRetention = document.getElementById('calcOutRetention');
    const ctaBtn = document.getElementById('calcCtaBtn');

    if (!revSlider || !outTrajectory) return;

    // Currency Formatter
    function formatCurrency(val) {
      if (val >= 1000000) {
        return '$' + (val / 1000000).toFixed(2) + 'M';
      }
      return '$' + Math.round(val).toLocaleString();
    }

    function formatShortCurrency(val) {
      if (val >= 1000000) {
        return '$' + (val / 1000000).toFixed(1) + 'M';
      }
      if (val >= 1000) {
        return '$' + Math.round(val / 1000) + 'k';
      }
      return '$' + Math.round(val);
    }

    // Dynamic Slider Fill
    function updateSliderTrack(slider) {
      const min = parseFloat(slider.min) || 20000;
      const max = parseFloat(slider.max) || 1500000;
      const val = parseFloat(slider.value) || 125000;
      const pct = ((val - min) / (max - min)) * 100;
      slider.style.background = `linear-gradient(to right, #E2C799 0%, #E2C799 ${pct}%, rgba(255, 255, 255, 0.08) ${pct}%, rgba(255, 255, 255, 0.08) 100%)`;
    }

    // Animated Counter
    const activeTweens = new Map();
    function animateValue(elem, targetVal, formatFn, duration = 350) {
      if (!elem) return;
      const key = elem.id;
      if (activeTweens.has(key)) {
        cancelAnimationFrame(activeTweens.get(key));
      }

      const startText = elem.getAttribute('data-raw-val') || '0';
      const startVal = parseFloat(startText) || 0;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        const current = startVal + (targetVal - startVal) * ease;

        elem.textContent = formatFn(current);

        if (progress < 1) {
          const raf = requestAnimationFrame(update);
          activeTweens.set(key, raf);
        } else {
          elem.setAttribute('data-raw-val', targetVal);
          elem.textContent = formatFn(targetVal);
          activeTweens.delete(key);
        }
      }

      const raf = requestAnimationFrame(update);
      activeTweens.set(key, raf);
    }

    // Calculation Engine
    function calculate() {
      const rev = parseFloat(revSlider.value) || 125000;

      // Update Slider Track and Readout
      updateSliderTrack(revSlider);
      if (revReadout) {
        revReadout.textContent = formatCurrency(rev);
      }

      // Sync Active Tier Chip
      tierButtons.forEach(btn => {
        const minTier = parseFloat(btn.getAttribute('data-min')) || 0;
        const maxTier = parseFloat(btn.getAttribute('data-max')) || Infinity;
        if (rev >= minTier && rev <= maxTier) {
          btn.classList.add('is-active');
        } else {
          btn.classList.remove('is-active');
        }
      });

      // Mathematical Modeling
      // Estimated spend baseline: 25% to 32% of monthly revenue
      const estimatedSpend = rev * 0.28;
      const cacFactor = 0.36; // 36% CAC reduction via UGC hook testing
      const aovLiftDollar = Math.max(16, Math.min(38, Math.round(rev * 0.00018 + 18)));
      const retentionLiftPct = 64; // 64% 60-day replenishment increase

      // 90-day trajectory formula:
      // Organic compounding + ROAS efficiency expansion + Retention replenishment
      const roasEfficiencyGain = estimatedSpend * 1.32 * 3.4;
      const retentionCompounding = rev * 0.26;
      const projectedNetRevenue = Math.round(Math.max(rev * 1.75, rev + (roasEfficiencyGain * 0.42) + retentionCompounding));
      const velocityGrowthPct = Math.round(((projectedNetRevenue - rev) / rev) * 100);
      const unlockedAnnualValue = (projectedNetRevenue - rev) * 12;

      // Update UI with smooth tabular animations
      animateValue(outTrajectory, projectedNetRevenue, val => formatCurrency(val));
      animateValue(outVelocityPct, velocityGrowthPct, val => `+${Math.round(val)}% Velocity Lift`);
      animateValue(outAnnualValue, unlockedAnnualValue, val => `+${formatShortCurrency(val)} Unlocked Annualized Value`);
      animateValue(outCac, Math.round(cacFactor * 100), val => `-${Math.round(val)}%`);
      animateValue(outAov, aovLiftDollar, val => `+$${Math.round(val)}`);
      animateValue(outRetention, retentionLiftPct, val => `+${Math.round(val)}%`);

      // Funnel Bridge Link
      if (ctaBtn) {
        ctaBtn.setAttribute('href', `/apply?rev=${rev}&target=${projectedNetRevenue}`);
      }
    }

    // Tier Button Interactions
    tierButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetVal = parseFloat(btn.getAttribute('data-val')) || 125000;
        revSlider.value = targetVal;
        calculate();
      });
    });

    revSlider.addEventListener('input', calculate);

    window.addEventListener('polishLanguageChanged', () => {
      calculate();
    });

    // Run Initial Calculation
    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLuxuryCalculator);
  } else {
    initLuxuryCalculator();
  }
})();
