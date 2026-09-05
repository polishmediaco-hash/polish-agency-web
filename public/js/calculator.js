/**
 * POLISH Media Co. — Interactive DTC Revenue Velocity Calculator Engine
 * 
 * Mathematical Model:
 *  - Inputs: Monthly Revenue ($20k - $1M), Monthly Ad Spend ($5k - $350k), Current AOV ($30 - $200), Strategic Focus
 *  - Outputs: Projected CAC Reduction, Routine Bundling AOV Lift, 60-Day Replenishment Lift, 90-Day Net Revenue Trajectory
 *  - Conversion Bridge: Dynamically links to /apply with pre-filled diagnostic parameters
 */

(function () {
  'use strict';

  function initCalculator() {
    const calcSection = document.getElementById('dtcCalculator');
    if (!calcSection) return;

    // Elements
    const revSlider = document.getElementById('calcRevSlider');
    const revValDisplay = document.getElementById('calcRevVal');
    const spendSlider = document.getElementById('calcSpendSlider');
    const spendValDisplay = document.getElementById('calcSpendVal');
    const aovSlider = document.getElementById('calcAovSlider');
    const aovValDisplay = document.getElementById('calcAovVal');
    const focusPills = document.querySelectorAll('.calc-focus-pill');
    
    // Result Elements
    const outTrajectory = document.getElementById('calcOutTrajectory');
    const outVelocityPct = document.getElementById('calcOutVelocityPct');
    const outCacReduction = document.getElementById('calcOutCac');
    const outAovLift = document.getElementById('calcOutAov');
    const outRetentionLift = document.getElementById('calcOutRetention');
    const outAnnualValue = document.getElementById('calcOutAnnual');
    const ctaBtn = document.getElementById('calcCtaBtn');

    if (!revSlider || !spendSlider || !aovSlider) return;

    let currentFocus = 'scale'; // 'scale', 'fatigue', 'retention'

    // Formatter helpers
    function formatCurrency(val) {
      if (val >= 1000000) {
        return '$' + (val / 1000000).toFixed(2) + 'M';
      }
      if (val >= 1000) {
        return '$' + (val / 1000).toFixed(0) + 'k';
      }
      return '$' + val.toLocaleString();
    }

    function formatNumberFull(val) {
      return '$' + Math.round(val).toLocaleString();
    }

    // Dynamic slider track fill in Champagne Gold
    function updateSliderTrack(slider) {
      const min = parseFloat(slider.min) || 0;
      const max = parseFloat(slider.max) || 100;
      const val = parseFloat(slider.value) || 0;
      const pct = ((val - min) / (max - min)) * 100;
      slider.style.background = `linear-gradient(to right, #E2C799 0%, #E2C799 ${pct}%, rgba(255, 255, 255, 0.08) ${pct}%, rgba(255, 255, 255, 0.08) 100%)`;
    }

    // Animated number counter
    const activeTweens = new Map();
    function animateValue(elem, targetVal, formatFn, duration = 400) {
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
        // Ease-out cubic
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

    // Core Scaling Formula Engine
    function calculate() {
      const rev = parseFloat(revSlider.value) || 85000;
      const spend = parseFloat(spendSlider.value) || 25000;
      const aov = parseFloat(aovSlider.value) || 58;

      // Update Slider Labels
      revValDisplay.textContent = formatCurrency(rev);
      spendValDisplay.textContent = formatCurrency(spend);
      aovValDisplay.textContent = '$' + aov;

      updateSliderTrack(revSlider);
      updateSliderTrack(spendSlider);
      updateSliderTrack(aovSlider);

      // Focus multipliers
      let focusMultiplier = 1.0;
      let cacFactor = 0.36; // 36% CAC reduction baseline
      let aovFactor = 0.38; // 38% AOV lift via bundling
      let retentionFactor = 0.64; // 64% repeat lift

      if (currentFocus === 'scale') {
        focusMultiplier = 1.15;
        cacFactor = 0.34;
        aovFactor = 0.35;
        retentionFactor = 0.58;
      } else if (currentFocus === 'fatigue') {
        focusMultiplier = 1.08;
        cacFactor = 0.42;
        aovFactor = 0.32;
        retentionFactor = 0.52;
      } else if (currentFocus === 'retention') {
        focusMultiplier = 1.12;
        cacFactor = 0.28;
        aovFactor = 0.44;
        retentionFactor = 0.74;
      }

      // Projected 90-Day Trajectory
      // Blended modeling: ROAS efficiency gain + Routine Bundling Lift + Retention Replenishment Compounding
      const roasGain = (spend * (1 + cacFactor * 0.85)) * (currentFocus === 'scale' ? 3.8 : 3.4);
      const retentionCompounding = rev * (retentionFactor * 0.42);
      const rawTrajectory = Math.max(rev * 1.85, rev + roasGain * 0.65 + retentionCompounding);
      const projectedNetRevenue = Math.round(rawTrajectory * focusMultiplier);
      const velocityGrowthPct = Math.round(((projectedNetRevenue - rev) / rev) * 100);
      const unlockedAnnualValue = (projectedNetRevenue - rev) * 12;

      // Specific metric lifts
      const projectedAovDollarLift = Math.round(aov * aovFactor);
      const projectedCacReductionPct = Math.round(cacFactor * 100);
      const projectedRetentionLiftPct = Math.round(retentionFactor * 100);

      // Animate Outputs
      animateValue(outTrajectory, projectedNetRevenue, val => formatNumberFull(val));
      animateValue(outVelocityPct, velocityGrowthPct, val => `+${Math.round(val)}%`);
      animateValue(outCacReduction, projectedCacReductionPct, val => `-${Math.round(val)}%`);
      animateValue(outAovLift, projectedAovDollarLift, val => `+$${Math.round(val)}`);
      animateValue(outRetentionLift, projectedRetentionLiftPct, val => `+${Math.round(val)}%`);
      animateValue(outAnnualValue, unlockedAnnualValue, val => formatCurrency(val) + '/yr');

      // Update CTA Bridge Link to /apply
      if (ctaBtn) {
        const applyUrl = `/apply?rev=${rev}&spend=${spend}&aov=${aov}&target=${projectedNetRevenue}&focus=${currentFocus}`;
        ctaBtn.setAttribute('href', applyUrl);
      }
    }

    // Event Listeners
    revSlider.addEventListener('input', calculate);
    spendSlider.addEventListener('input', calculate);
    aovSlider.addEventListener('input', calculate);

    focusPills.forEach(pill => {
      pill.addEventListener('click', () => {
        focusPills.forEach(p => p.classList.remove('is-active'));
        pill.classList.add('is-active');
        currentFocus = pill.getAttribute('data-focus') || 'scale';
        calculate();
      });
    });

    window.addEventListener('polishLanguageChanged', () => {
      calculate();
    });

    // Initial calculation
    calculate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
  } else {
    initCalculator();
  }
})();
