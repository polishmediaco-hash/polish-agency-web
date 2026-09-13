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

  let isMovingBackward = false;

  // Handle Pre-filled Calculator Parameters from /#dtcCalculator
  const urlParams = new URLSearchParams(window.location.search);
  const revParam = urlParams.get('rev');
  const targetParam = urlParams.get('target');
  const spendParam = urlParams.get('spend');
  const aovParam = urlParams.get('aov');
  const focusParam = urlParams.get('focus');

  if (revParam || targetParam) {
    const revNum = parseInt(revParam || '0', 10);
    const targetNum = parseInt(targetParam || '0', 10);
    const formHeader = document.querySelector('.form-header-zone');
    if (formHeader && revNum > 0) {
      const isFr = window.polishI18n && window.polishI18n.currentLang === 'fr';
      const isAr = window.polishI18n && window.polishI18n.currentLang === 'ar';
      
      let bannerText = `Diagnostic Profile: <strong>$${revNum.toLocaleString()}/mo</strong> → Projected 90-Day Target: <strong>$${targetNum.toLocaleString()}/mo</strong>`;
      if (isFr) {
        bannerText = `Profil Diagnostique : <strong>$${revNum.toLocaleString()}/mois</strong> → Objectif à 90 Jours : <strong>$${targetNum.toLocaleString()}/mois</strong>`;
      } else if (isAr) {
        bannerText = `ملف التشخيص المالي: <strong>$${revNum.toLocaleString()}/شهرياً</strong> ← الهدف المتوقع (90 يوماً): <strong>$${targetNum.toLocaleString()}/شهرياً</strong>`;
      }

      const banner = document.createElement('div');
      banner.className = 'calc-diagnostic-pill';
      banner.innerHTML = `<span class="pill-dot"></span><span>${bannerText}</span>`;
      formHeader.appendChild(banner);
    }

    // Auto-select corresponding monthly revenue in Step 3
    if (revNum > 0) {
      let targetVal = 'Under $20k/mo';
      if (revNum >= 500000) targetVal = '$500k+/mo';
      else if (revNum >= 150000) targetVal = '$150k - $500k/mo';
      else if (revNum >= 50000) targetVal = '$50k - $150k/mo';
      else if (revNum >= 20000) targetVal = '$20k - $50k/mo';
      else targetVal = 'Under $20k/mo';

      const revSelect = document.getElementById('monthlyRevenue');
      if (revSelect) {
        revSelect.value = targetVal;
      }
    }

    // Auto-select corresponding marketing status in Step 3
    if (focusParam === 'scale') {
      const opt = document.querySelector('select[name="marketingHistory"] option[value*="manage marketing in-house"]');
      if (opt) opt.selected = true;
    } else if (focusParam === 'fatigue') {
      const opt = document.querySelector('select[name="marketingHistory"] option[value*="better creative"]');
      if (opt) opt.selected = true;
    }
  }

  /**
   * Updates all visual UI elements for the active step
   */
  function updateStepUI(options = {}) {
    // Hide all step panes (supports both class variants)
    const stepPanes = document.querySelectorAll('.form-step-pane, .wizard-step');
    stepPanes.forEach(pane => {
      pane.classList.remove('active', 'step-backward');
      pane.style.display = 'none';
    });

    // Show current step pane with directional spring class
    const activePane = document.querySelector(`.form-step-pane[data-step="${currentStep}"], .wizard-step[data-step="${currentStep}"]`);
    if (activePane) {
      if (isMovingBackward) {
        activePane.classList.add('step-backward');
      } else {
        activePane.classList.remove('step-backward');
      }
      activePane.classList.add('active');
      activePane.style.display = 'block';
    }

    // Update Progress Indicator
    const progressPercent = (currentStep / totalSteps) * 100;
    if (progressFill) progressFill.style.width = `${progressPercent}%`;
    if (stepCounterText) {
      const isFr = window.polishI18n && window.polishI18n.currentLang === 'fr';
      const isAr = window.polishI18n && window.polishI18n.currentLang === 'ar';
      let stepWord = 'Step';
      if (isFr) stepWord = 'Étape';
      if (isAr) stepWord = 'الخطوة';
      stepCounterText.innerText = `${stepWord} 0${currentStep} / 0${totalSteps}`;
    }
    if (stepPhaseText) {
      const key = `apply.step${currentStep}Title`;
      const title = (window.polishI18n ? window.polishI18n.t(key) : null) || stepPhases[currentStep - 1];
      stepPhaseText.innerText = title;
    }

    // Update Navigation Buttons — on Step 1, hide back button for clean full-width continue
    const stepNavFooter = document.querySelector('.step-nav-footer');
    if (btnBack) {
      if (currentStep === 1) {
        btnBack.style.display = 'none';
        if (stepNavFooter) stepNavFooter.classList.add('is-first-step');
      } else {
        btnBack.style.display = 'inline-flex';
        btnBack.disabled = false;
        if (stepNavFooter) stepNavFooter.classList.remove('is-first-step');
      }
    }

    if (currentStep === totalSteps) {
      if (btnNext) btnNext.style.display = 'none';
      if (btnSubmit) btnSubmit.style.display = 'inline-flex';
      if (stepNavFooter) stepNavFooter.classList.add('is-last-step');
    } else {
      if (btnNext) btnNext.style.display = 'inline-flex';
      if (btnSubmit) btnSubmit.style.display = 'none';
      if (stepNavFooter) stepNavFooter.classList.remove('is-last-step');
    }

    // Clear alerts on valid step transition
    hideAlert();

    // Smoothly keep form step header in view on mobile ONLY when user explicitly navigates
    if (options.scroll && window.innerWidth <= 768) {
      const formShell = document.querySelector('.form-container-shell') || document.getElementById('wizardFormShell');
      if (formShell) {
        const topY = formShell.getBoundingClientRect().top + window.pageYOffset - 75;
        window.scrollTo({ top: topY, behavior: 'smooth' });
      }
    }
  }

  /**
   * Highlights input with error styling and attaches auto-clear listeners
   */
  function markFieldError(el) {
    if (!el) return;
    el.classList.add('input-error');
    el.setAttribute('aria-invalid', 'true');
    const clear = () => {
      el.classList.remove('input-error');
      el.removeAttribute('aria-invalid');
      hideAlert();
    };
    el.addEventListener('input', clear, { once: true });
    el.addEventListener('change', clear, { once: true });
  }

  /**
   * Validates inputs for the active step
   */
  function validateCurrentStep() {
    hideAlert();
    const isFr = window.polishI18n && window.polishI18n.currentLang === 'fr';
    const isAr = window.polishI18n && window.polishI18n.currentLang === 'ar';

    if (currentStep === 1) {
      const nameInput = document.getElementById('fullName');
      const brandInput = document.getElementById('brandName');
      const emailInput = document.getElementById('workEmail');
      const phoneInput = document.getElementById('phoneWhatsapp');
      const websiteInput = document.getElementById('websiteUrl');
      const socialInput = document.getElementById('socialLink');

      const name = nameInput ? nameInput.value.trim() : '';
      const brand = brandInput ? brandInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const website = websiteInput ? websiteInput.value.trim() : '';
      const social = socialInput ? socialInput.value.trim() : '';

      if (!name) {
        markFieldError(nameInput);
        showAlert(isFr ? 'Veuillez renseigner votre nom et prénom.' : (isAr ? 'يرجى إدخال اسمك الكامل.' : 'Please enter your full name.'), nameInput);
        return false;
      }
      if (!brand) {
        markFieldError(brandInput);
        showAlert(isFr ? 'Veuillez indiquer le nom de votre marque.' : (isAr ? 'يرجى إدخال اسم العلامة التجارية.' : 'Please enter your company or brand name.'), brandInput);
        return false;
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        markFieldError(emailInput);
        showAlert(isFr ? 'Veuillez renseigner une adresse email professionnelle valide.' : (isAr ? 'يرجى إدخال بريد إلكتروني مهني صحيح.' : 'Please enter a valid work email address.'), emailInput);
        return false;
      }
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      if (!phone || cleanPhone.length < 7) {
        markFieldError(phoneInput);
        showAlert(isFr ? 'Veuillez indiquer votre numéro WhatsApp direct ou téléphone (avec indicatif pays).' : (isAr ? 'يرجى إدخال رقم واتساب أو هاتف مباشر مع رمز الدولة.' : 'Please enter your direct WhatsApp or phone number with country code.'), phoneInput);
        return false;
      }
      if (!website) {
        markFieldError(websiteInput);
        showAlert(isFr ? 'Veuillez indiquer le site web ou boutique en ligne de votre marque.' : (isAr ? 'يرجى إدخال رابط المتجر الإلكتروني أو الموقع الخاص بعلامتك.' : 'Please enter your brand website or store URL.'), websiteInput);
        return false;
      }
      if (!social) {
        markFieldError(socialInput);
        showAlert(isFr ? 'Veuillez indiquer le lien vers votre réseau social (Instagram / TikTok).' : (isAr ? 'يرجى إدخال حساب التواصل الاجتماعي (Instagram / TikTok).' : 'Please enter your Instagram, TikTok, or brand social handle.'), socialInput);
        return false;
      }
    } else if (currentStep === 2) {
      const category = document.querySelector('input[name="businessCategory"]:checked');
      const roleSelect = document.getElementById('role');
      const role = roleSelect ? roleSelect.value.trim() : '';

      if (!category) {
        showAlert(isFr ? 'Veuillez sélectionner votre catégorie produit.' : (isAr ? 'يرجى اختيار تصنيف منتجات علامتك التجارية.' : 'Please select your business vertical.'));
        return false;
      }
      if (!role) {
        markFieldError(roleSelect);
        showAlert(isFr ? 'Veuillez choisir votre fonction dans la marque.' : (isAr ? 'يرجى تحديد دورك وموقعك القيادي في العلامة التجارية.' : 'Please choose your leadership position in the organization.'), roleSelect);
        return false;
      }
    } else if (currentStep === 3) {
      const revenueSelect = document.getElementById('monthlyRevenue');
      const revenue = revenueSelect ? revenueSelect.value.trim() : '';
      const historySelect = document.getElementById('marketingHistory');
      const history = historySelect ? historySelect.value.trim() : '';

      if (!revenue) {
        markFieldError(revenueSelect);
        showAlert(isFr ? 'Veuillez sélectionner votre tranche de chiffre d\'affaires mensuel.' : (isAr ? 'يرجى تحديد نطاق الإيرادات الشهرية الحالية لعلامتك.' : 'Please select your current monthly revenue range.'), revenueSelect);
        return false;
      }
      if (!history) {
        markFieldError(historySelect);
        showAlert(isFr ? 'Veuillez sélectionner votre statut marketing actuel.' : (isAr ? 'يرجى تحديد وضعك التسويقي الحالي.' : 'Please select your past marketing or agency experience.'), historySelect);
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
        isMovingBackward = false;
        currentStep++;
        updateStepUI({ scroll: true });
      }
    });
  }

  // Back Button Handler
  if (btnBack) {
    btnBack.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentStep > 1) {
        isMovingBackward = true;
        currentStep--;
        updateStepUI({ scroll: true });
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
      email: formData.get('email')?.toString().trim().toLowerCase() || '',
      phone: formData.get('phone')?.toString().trim() || '',
      websiteUrl: formData.get('websiteUrl')?.toString().trim() || '',
      socialLink: formData.get('socialLink')?.toString().trim() || '',
      role: formData.get('role')?.toString().trim() || '',
      businessCategory: formData.get('businessCategory')?.toString().trim() || '',
      monthlyRevenue: formData.get('monthlyRevenue')?.toString().trim() || '',
      marketingHistory: formData.get('marketingHistory')?.toString().trim() || '',
      primaryGoal: formData.get('primaryGoal')?.toString().trim() || '',
      calculatorData: (revParam || targetParam) ? {
        monthlyRevenue: revParam,
        monthlySpend: spendParam,
        aov: aovParam,
        targetRevenue: targetParam,
        focus: focusParam
      } : null
    };

    // Button Spinner UI
    const isFr = window.polishI18n && window.polishI18n.currentLang === 'fr';
    const isAr = window.polishI18n && window.polishI18n.currentLang === 'ar';
    let loadingText = 'Registering Dossier...';
    if (isFr) loadingText = 'Enregistrement du Dossier...';
    else if (isAr) loadingText = 'جاري تسجيل الملف...';

    const submitText = (window.polishI18n ? window.polishI18n.t('apply.btnSubmit') : null) || (isFr ? 'Envoyer le Dossier de Partenariat' : (isAr ? 'إرسال ملف الشراكة' : 'Submit Partnership Brief'));

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
        let errDefault = 'Failed to submit application.';
        if (isFr) errDefault = "Échec de l'envoi. Veuillez nous contacter directement sur WhatsApp.";
        else if (isAr) errDefault = 'فشل إرسال الطلب. يرجى التواصل معنا مباشرة عبر واتساب.';
        throw new Error(result.error || errDefault);
      }

      // Show Success Box
      if (wizardShell) wizardShell.style.display = 'none';
      if (successBox) {
        successBox.style.display = 'block';

        const leadIdEl = document.getElementById('successLeadRef');
        if (leadIdEl && result.leadId) {
          leadIdEl.innerText = result.leadId;
        }

        const bookBtn = document.getElementById('successBookDirectBtn');
        if (bookBtn) {
          const bookParams = new URLSearchParams({
            name: payload.fullName || '',
            brand: payload.brandName || '',
            email: payload.email || '',
            phone: payload.phone || '',
            social: payload.socialLink || ''
          });
          bookBtn.href = `/book?${bookParams.toString()}`;
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

  // Initialize without scrolling and ensure page opens at top
  window.addEventListener('polishLanguageChanged', () => updateStepUI({ scroll: false }));
  updateStepUI({ scroll: false });
  window.scrollTo(0, 0);
});

