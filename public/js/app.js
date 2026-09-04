/**
 * POLISH High-Performance 3-Step Intake Diagnostic & Form Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  const wizardForm = document.getElementById('polishWizardForm');
  if (!wizardForm) return;

  let currentStep = 1;
  const totalSteps = 3;

  const stepPhases = [
    'About You & Your Brand',
    'Your Category & Role',
    'Current Growth Setup'
  ];

  // DOM Elements
  const progressFill = document.getElementById('wizardProgressFill');
  const stepCounterText = document.getElementById('wizardStepCounter');
  const stepPhaseText = document.getElementById('wizardStepPhase');
  const btnBack = document.getElementById('wizardBtnBack');
  const btnNext = document.getElementById('wizardBtnNext');
  const btnSubmit = document.getElementById('wizardBtnSubmit');
  const alertBox = document.getElementById('wizardAlertBox');
  const wizardShell = document.getElementById('wizardFormShell') || document.getElementById('wizardContentShell');
  const successBox = document.getElementById('wizardSuccessScreen');

  /**
   * Updates all visual UI elements for the active step
   */
  function updateStepUI() {
    // Hide all step panes (supports both class variants)
    const stepPanes = document.querySelectorAll('.form-step-pane, .wizard-step');
    stepPanes.forEach(pane => {
      pane.classList.remove('active');
      pane.style.display = 'none';
    });

    // Show current step pane
    const activePane = document.querySelector(`.form-step-pane[data-step="${currentStep}"], .wizard-step[data-step="${currentStep}"]`);
    if (activePane) {
      activePane.classList.add('active');
      activePane.style.display = 'block';
    }

    // Update Progress Indicator
    const progressPercent = (currentStep / totalSteps) * 100;
    if (progressFill) progressFill.style.width = `${progressPercent}%`;
    if (stepCounterText) {
      const isFr = window.polishI18n && window.polishI18n.currentLang === 'fr';
      const stepWord = isFr ? 'Étape' : 'Step';
      stepCounterText.innerText = `${stepWord} 0${currentStep} / 0${totalSteps}`;
    }
    if (stepPhaseText) {
      const key = `apply.step${currentStep}Title`;
      const title = (window.polishI18n ? window.polishI18n.t(key) : null) || stepPhases[currentStep - 1];
      stepPhaseText.innerText = title;
    }

    // Update Navigation Buttons
    if (btnBack) {
      btnBack.disabled = (currentStep === 1);
    }

    if (currentStep === totalSteps) {
      if (btnNext) btnNext.style.display = 'none';
      if (btnSubmit) btnSubmit.style.display = 'inline-flex';
    } else {
      if (btnNext) btnNext.style.display = 'inline-flex';
      if (btnSubmit) btnSubmit.style.display = 'none';
    }

    // Clear alerts on valid step transition
    hideAlert();

    // Smoothly keep form step header in view on mobile
    if (window.innerWidth <= 768) {
      const formShell = document.querySelector('.form-container-shell') || document.getElementById('wizardFormShell');
      if (formShell) {
        const topY = formShell.getBoundingClientRect().top + window.pageYOffset - 65;
        window.scrollTo({ top: topY, behavior: 'smooth' });
      }
    }
  }

  /**
   * Validates inputs for the active step
   */
  function validateCurrentStep() {
    hideAlert();
    const isFr = window.polishI18n && window.polishI18n.currentLang === 'fr';

    if (currentStep === 1) {
      const nameInput = document.getElementById('fullName');
      const brandInput = document.getElementById('brandName');
      const socialInput = document.getElementById('socialLink');

      const name = nameInput ? nameInput.value.trim() : '';
      const brand = brandInput ? brandInput.value.trim() : '';
      const social = socialInput ? socialInput.value.trim() : '';

      if (!name) {
        showAlert(isFr ? 'Veuillez renseigner votre nom et prénom.' : 'Please enter your full name.', nameInput);
        return false;
      }
      if (!brand) {
        showAlert(isFr ? 'Veuillez indiquer le nom de votre marque.' : 'Please enter your company or brand name.', brandInput);
        return false;
      }
      if (!social) {
        showAlert(isFr ? 'Veuillez indiquer le lien vers votre réseau social (Instagram / TikTok).' : 'Please enter your Instagram, TikTok, or brand social handle.', socialInput);
        return false;
      }
    } else if (currentStep === 2) {
      const category = document.querySelector('input[name="businessCategory"]:checked');
      const roleSelect = document.getElementById('role');
      const role = roleSelect ? roleSelect.value.trim() : '';

      if (!category) {
        showAlert(isFr ? 'Veuillez sélectionner votre catégorie produit.' : 'Please select your business vertical.');
        return false;
      }
      if (!role) {
        showAlert(isFr ? 'Veuillez choisir votre fonction dans la marque.' : 'Please choose your leadership position in the organization.', roleSelect);
        return false;
      }
    } else if (currentStep === 3) {
      const historySelect = document.getElementById('marketingHistory');
      const history = historySelect ? historySelect.value.trim() : '';

      if (!history) {
        showAlert(isFr ? 'Veuillez sélectionner votre statut marketing actuel.' : 'Please select your past marketing or agency experience.', historySelect);
        return false;
      }
    }

    return true;
  }

  // Next / Continue Button Handler
  if (btnNext) {
    btnNext.addEventListener('click', (e) => {
      e.preventDefault();
      if (!validateCurrentStep()) return;
      if (currentStep < totalSteps) {
        currentStep++;
        updateStepUI();
      }
    });
  }

  // Back Button Handler
  if (btnBack) {
    btnBack.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentStep > 1) {
        currentStep--;
        updateStepUI();
      }
    });
  }

  // Category Badge Click Feedback
  document.querySelectorAll('.cat-badge-label input[type="radio"]').forEach(radio => {
    radio.addEventListener('change', () => {
      hideAlert();
    });
  });

  // Enter Key Handler
  wizardForm.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
      e.preventDefault();
      if (currentStep < totalSteps) {
        if (btnNext) btnNext.click();
      } else {
        if (btnSubmit) btnSubmit.click();
      }
    }
  });

  // Form Submit Handler
  wizardForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    // Build Payload
    const formData = new FormData(wizardForm);
    const payload = {
      fullName: formData.get('fullName')?.toString().trim() || '',
      brandName: formData.get('brandName')?.toString().trim() || '',
      websiteUrl: formData.get('websiteUrl')?.toString().trim() || '',
      socialLink: formData.get('socialLink')?.toString().trim() || '',
      role: formData.get('role')?.toString().trim() || '',
      businessCategory: formData.get('businessCategory')?.toString().trim() || '',
      marketingHistory: formData.get('marketingHistory')?.toString().trim() || '',
      primaryGoal: formData.get('primaryGoal')?.toString().trim() || ''
    };

    // Button Spinner UI
    const isFr = window.polishI18n && window.polishI18n.currentLang === 'fr';
    const loadingText = isFr ? 'Enregistrement du Dossier...' : 'Registering Dossier...';
    const submitText = (window.polishI18n ? window.polishI18n.t('apply.btnSubmit') : null) || (isFr ? 'Envoyer le Dossier de Partenariat' : 'Submit Partnership Brief');

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = `
        <svg style="animation: spin 1s linear infinite; width:16px; height:16px; margin-right:8px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
          <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"></path>
        </svg>
        ${loadingText}
      `;
    }

    try {
      const response = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || (isFr ? "Échec de l'envoi. Veuillez nous contacter directement sur WhatsApp." : 'Failed to submit application.'));
      }

      // Show Success Box
      if (wizardShell) wizardShell.style.display = 'none';
      if (successBox) {
        successBox.style.display = 'block';

        const leadIdEl = document.getElementById('successLeadRef');
        if (leadIdEl && result.leadId) {
          leadIdEl.innerText = result.leadId;
        }

        window.scrollTo({
          top: successBox.getBoundingClientRect().top + window.scrollY - 100,
          behavior: 'smooth'
        });
      }
    } catch (err) {
      console.error('Submission error:', err);
      showAlert(err.message || (isFr ? "Erreur de transmission. Veuillez nous contacter directement sur WhatsApp." : 'Error transmitting dossier. Please contact us directly on WhatsApp.'));
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = `
          <span>${submitText}</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        `;
      }
    }
  });

  function showAlert(msg, focusEl = null) {
    if (!alertBox) return;
    alertBox.innerText = msg;
    alertBox.style.display = 'block';
    alertBox.style.background = 'rgba(239, 68, 68, 0.15)';
    alertBox.style.border = '1px solid rgba(239, 68, 68, 0.45)';
    alertBox.style.color = '#FCA5A5';
    alertBox.style.padding = '12px 16px';
    alertBox.style.borderRadius = '12px';
    alertBox.style.fontSize = '13.5px';
    alertBox.style.fontWeight = '600';
    alertBox.style.marginBottom = '22px';
    alertBox.style.boxShadow = '0 8px 24px rgba(239, 68, 68, 0.2)';

    if (focusEl) {
      focusEl.focus();
    }
  }

  function hideAlert() {
    if (!alertBox) return;
    alertBox.style.display = 'none';
  }

  // Initialize and listen to language switches
  window.addEventListener('polishLanguageChanged', updateStepUI);
  updateStepUI();
});

// Dynamic Header & Morphing Dynamic Island Controller
(function initDynamicIslandScroll() {
  const header = document.getElementById('siteHeader') || document.querySelector('.site-header');
  const island = document.getElementById('dynamicIslandShell') || document.querySelector('.dynamic-island-shell');
  if (!header) return;

  function updateScrollState() {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollY / docHeight) * 100)) : 0;

    if (scrollY > 110) {
      header.classList.add('is-scrolled');
    } else if (scrollY < 45) {
      header.classList.remove('is-scrolled');
    }

    if (island) {
      island.style.setProperty('--island-progress', `${progress.toFixed(1)}%`);
    }
  }

  window.addEventListener('scroll', updateScrollState, { passive: true });
  window.addEventListener('polishLenisScroll', updateScrollState);
  updateScrollState();
})();
