/**
 * POLISH Media Co. — Luxury Invoicing Atelier Engine (v2.2)
 * Architecture: Pure Vanilla JS, Zero Bundlers, Instant State Sync
 * Faithful to real agency billing data. Zero hallucinations.
 */

(function () {
  'use strict';

  // --- Helper: Format Today's Live Date (DD/MM/YYYY) ---
  function getTodayFormatted() {
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yyyy = now.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  // --- Helper: Format & Adjust Serial Code (e.g. POL-2026-094) ---
  function formatSerialCode(val, defaultYear = new Date().getFullYear()) {
    if (!val) return `POL-${defaultYear}-094`;
    const str = String(val).trim().toUpperCase();
    
    // Check if already in POL-YYYY-XXX format
    const matchFull = str.match(/^POL-(\d{4})-([A-Z0-9]+)$/i);
    if (matchFull) {
      const yr = matchFull[1];
      const seq = matchFull[2];
      const padded = /^\d+$/.test(seq) ? seq.padStart(3, '0') : seq;
      return `POL-${yr}-${padded}`;
    }

    // Check if in format YYYY-XXX
    const matchYearSeq = str.match(/^(\d{4})[-/ ]([A-Z0-9]+)$/i);
    if (matchYearSeq) {
      const yr = matchYearSeq[1];
      const seq = matchYearSeq[2];
      const padded = /^\d+$/.test(seq) ? seq.padStart(3, '0') : seq;
      return `POL-${yr}-${padded}`;
    }

    // Extract digits or alphanumerics
    const clean = str.replace(/[^0-9A-Z]/gi, '');
    if (/^\d+$/.test(clean)) {
      return `POL-${defaultYear}-${clean.padStart(3, '0')}`;
    }
    return clean ? `POL-${defaultYear}-${clean}` : `POL-${defaultYear}-094`;
  }

  function incrementSerialCode(currentCode) {
    const yearMatch = String(currentCode).match(/POL-(\d{4})-(\d+)/i);
    if (yearMatch) {
      const yr = yearMatch[1];
      const nextNum = parseInt(yearMatch[2], 10) + 1;
      return `POL-${yr}-${String(nextNum).padStart(3, '0')}`;
    }
    const numOnly = parseInt(String(currentCode).replace(/[^0-9]/g, ''), 10);
    const nextNum = isNaN(numOnly) ? 94 : numOnly + 1;
    return formatSerialCode(nextNum);
  }

  // --- Default State (Exact match of verified invoice with auto-adjusted date & serial) ---
  const defaultState = {
    theme: 'alabaster', // 'alabaster' or 'obsidian'
    lang: 'en',         // 'en', 'fr', 'ar'
    currency: 'DA',     // 'DA', 'USD', 'EUR', 'AED'
    editMode: false,
    
    // Invoice Metadata
    invoiceNumber: formatSerialCode('094'),
    issueDate: getTodayFormatted(),
    dueDate: '',

    // Agency / Payable To
    payableName: 'Polish Media Co',
    payableContact: 'Faycal Chouli',
    payableSubtitle: '',
    payableAddress: '',
    payablePhone: '+213 661 41 77 62',
    payableEmail: 'Contact@polishmediaco.com',
    payableWebsite: 'polishmediaco.com',

    // Client Details
    clientName: 'Celestia cosmetics',
    clientContact: 'Yasmine',
    clientPhone: '+213 563 05 28 57',
    clientEmail: '',
    clientAddress: '',

    // Service Line Items
    items: [
      {
        description: 'Intensive Ads Campaign',
        duration: '15 Days',
        platform: 'Meta',
        price: 180000
      }
    ],

    // Calculations
    taxRate: 0,
    depositPaid: 0,

    // Settlement / Payment Info
    beneficiaryName: 'FAYCAL CHOULI',
    ccp: '0044643623 cle 49',
    rip: '00799999004464362350',
    baridiMob: '',
    bankName: '',
    iban: '',
    swift: '',

    // Notes
    terms: ''
  };

  // State instance
  let state = Object.assign({}, defaultState);

  // --- Localization Dictionaries ---
  const I18N = {
    en: {
      invoiceTitle: 'INVOICE',
      numberLabel: 'Invoice No:',
      dateLabel: 'Date:',
      dueLabel: 'Due:',
      payableTo: 'PAYABLE TO',
      clientDetails: 'CLIENT DETAILS',
      colDesc: 'ITEM DESCRIPTION',
      colDuration: 'DURATION',
      colPlatform: 'PLATFORM',
      colPrice: 'PRICE',
      grandTotal: 'GRAND TOTAL',
      subtotal: 'Subtotal:',
      deposit: 'Advance / Deposit:',
      balanceDue: 'Balance Due:',
      paymentInfo: 'PAYMENT INFO:',
      beneficiary: 'Beneficiary:',
      ccpLabel: 'Ccp :',
      ripLabel: 'Rip :'
    },
    fr: {
      invoiceTitle: 'FACTURE',
      numberLabel: 'Facture N° :',
      dateLabel: 'Date :',
      dueLabel: 'Échéance :',
      payableTo: 'PAYABLE À',
      clientDetails: 'DÉTAILS DU CLIENT',
      colDesc: 'DESCRIPTION DU SERVICE',
      colDuration: 'DURÉE',
      colPlatform: 'PLATEFORME',
      colPrice: 'TARIF',
      grandTotal: 'TOTAL À PAYER',
      subtotal: 'Sous-total :',
      deposit: 'Acompte Versé :',
      balanceDue: 'Net À Payer :',
      paymentInfo: 'INFORMATIONS DE PAIEMENT :',
      beneficiary: 'Bénéficiaire :',
      ccpLabel: 'Ccp :',
      ripLabel: 'Rip :'
    },
    ar: {
      invoiceTitle: 'فاتورة',
      numberLabel: 'رقم الفاتورة :',
      dateLabel: 'التاريخ :',
      dueLabel: 'الاستحقاق :',
      payableTo: 'مستحق لـ',
      clientDetails: 'بيانات العميل',
      colDesc: 'بيان الخدمة',
      colDuration: 'المدة',
      colPlatform: 'المنصة',
      colPrice: 'السعر',
      grandTotal: 'المجموع الإجمالي',
      subtotal: 'المجموع الفرعي :',
      deposit: 'الدفعة المقدمة :',
      balanceDue: 'المبلغ المستحق :',
      paymentInfo: 'بيانات الدفع',
      beneficiary: 'المستفيد :',
      ccpLabel: 'الحساب البريدي (CCP):',
      ripLabel: 'الرقم البريدي الموحد (RIP):'
    }
  };

  // --- Utility: Currency Formatter ---
  function formatAmount(num, currency, lang = state ? state.lang : 'en') {
    const val = Number(num) || 0;
    const isAr = lang === 'ar';
    const spaced = val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
    switch (currency) {
      case 'DA':
        return isAr ? `${spaced} دج` : `${spaced}da`;
      case 'USD':
        return isAr ? `${spaced} $` : '$' + val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      case 'EUR':
        return isAr ? `${spaced} €` : val.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
      case 'AED':
        return isAr ? `${spaced} د.إ` : val.toLocaleString('en-US') + ' AED';
      default:
        return `${spaced} ${currency}`;
    }
  }

  // --- Sanitize Helper ---
  function escapeHTML(str) {
    if (typeof str !== 'string') return str || '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Calculation Engine ---
  // --- Dynamic Document Title for Contextual PDF File Downloads ---
  function getFormattedInvoiceFilename() {
    const prefix = state.lang === 'fr' ? 'Facture' : 'Invoice';
    const client = (state.clientName || 'Client')
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '-')
      .replace(/\s+/g, ' ');
    const serial = (state.invoiceNumber || 'POL-2026')
      .trim()
      .replace(/[/\\?%*:|"<>]/g, '-');
    const date = (state.issueDate || getTodayFormatted())
      .trim()
      .replace(/[/\\.]/g, '-');

    return `${prefix} - ${client} - ${serial} - ${date}`;
  }

  function updateDocumentTitle() {
    document.title = getFormattedInvoiceFilename();
  }

  function computeTotals() {
    const subtotal = state.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0);
    const taxAmount = state.taxRate > 0 ? (subtotal * (state.taxRate / 100)) : 0;
    const grandTotal = Math.max(0, subtotal + taxAmount - (Number(state.depositPaid) || 0));
    return { subtotal, taxAmount, grandTotal };
  }

  // --- Render Invoice A4 Sheet ---
  function renderInvoiceSheet() {
    const sheet = document.getElementById('invoiceSheet');
    if (!sheet) return;

    // Dynamically synchronize document title with client name and date
    updateDocumentTitle();

    const dict = I18N[state.lang] || I18N.en;
    const isRtl = state.lang === 'ar';
    const isDark = state.theme === 'obsidian';
    const totals = computeTotals();

    // Set Sheet attributes
    sheet.setAttribute('data-invoice-theme', state.theme);
    sheet.setAttribute('dir', isRtl ? 'rtl' : 'ltr');

    // Select proper logo
    const logoSrc = isDark 
      ? '/assets/logo-gold.svg' 
      : '/brand-pack/01_logos/polish-logo-horizontal-dark.svg';

    let itemsRowsHTML = '';
    state.items.forEach((item, index) => {
      itemsRowsHTML += `
        <tr data-index="${index}">
          <td class="inv-td inv-td-desc-cell">
            <div class="inv-td-desc" contenteditable="${state.editMode}" data-field="items.${index}.description" dir="auto">${escapeHTML(item.description)}</div>
          </td>
          <td class="inv-td inv-td-duration-cell">
            <span class="inv-td-badge" contenteditable="${state.editMode}" data-field="items.${index}.duration" dir="ltr"><bdi>${escapeHTML(item.duration)}</bdi></span>
          </td>
          <td class="inv-td inv-td-platform-cell">
            <span class="inv-td-badge" contenteditable="${state.editMode}" data-field="items.${index}.platform" dir="ltr"><bdi>${escapeHTML(item.platform)}</bdi></span>
          </td>
          <td class="inv-td inv-td-price-cell">
            <span class="inv-td-price" contenteditable="${state.editMode}" data-field="items.${index}.price" data-type="number" dir="ltr">${formatAmount(item.price, state.currency, state.lang)}</span>
          </td>
        </tr>
      `;
    });

    sheet.innerHTML = `
      <div>
        <!-- 1. Header (Anchored LTR to preserve global brand mark on the left) -->
        <header class="inv-header">
          <div class="inv-brand-block">
            <img src="${logoSrc}" alt="POLISH" class="inv-logo-img" id="sheetLogo">
          </div>
          <div class="inv-title-block">
            <h1 class="inv-title">${dict.invoiceTitle}</h1>
            <ul class="inv-meta-list">
              <li class="inv-meta-item">
                <span class="inv-meta-label">${dict.numberLabel}</span>
                <span class="inv-meta-val" contenteditable="${state.editMode}" data-field="invoiceNumber" dir="ltr"><bdi>${escapeHTML(state.invoiceNumber)}</bdi></span>
              </li>
              <li class="inv-meta-item">
                <span class="inv-meta-label">${dict.dateLabel}</span>
                <span class="inv-meta-val" contenteditable="${state.editMode}" data-field="issueDate" dir="ltr"><bdi>${escapeHTML(state.issueDate)}</bdi></span>
              </li>
              ${state.dueDate ? `
                <li class="inv-meta-item">
                  <span class="inv-meta-label">${dict.dueLabel}</span>
                  <span class="inv-meta-val" contenteditable="${state.editMode}" data-field="dueDate" dir="ltr"><bdi>${escapeHTML(state.dueDate)}</bdi></span>
                </li>
              ` : ''}
            </ul>
          </div>
        </header>

        <!-- 2. Entities Grid (Symmetrical from/to layout anchored under logo and title) -->
        <section class="inv-entities-grid">
          <div class="inv-entity-card inv-entity-payable">
            <span class="inv-entity-label">${dict.payableTo}</span>
            <div class="inv-entity-name" contenteditable="${state.editMode}" data-field="payableName" dir="auto">${escapeHTML(state.payableName)}</div>
            ${state.payableContact ? `<div class="inv-entity-sub" contenteditable="${state.editMode}" data-field="payableContact" dir="ltr"><span class="inv-dash">-</span> <bdi>${escapeHTML(state.payableContact)}</bdi></div>` : ''}
            ${state.payablePhone ? `<div class="inv-entity-contact" dir="ltr"><span contenteditable="${state.editMode}" data-field="payablePhone"><bdi>${escapeHTML(state.payablePhone)}</bdi></span></div>` : ''}
          </div>

          <div class="inv-entity-card inv-entity-client">
            <span class="inv-entity-label">${dict.clientDetails}</span>
            <div class="inv-entity-name" contenteditable="${state.editMode}" data-field="clientName" dir="auto">${escapeHTML(state.clientName)}</div>
            ${state.clientContact ? `<div class="inv-entity-sub" contenteditable="${state.editMode}" data-field="clientContact" dir="ltr"><span class="inv-dash">-</span> <bdi>${escapeHTML(state.clientContact)}</bdi></div>` : ''}
            ${state.clientPhone ? `<div class="inv-entity-contact" dir="ltr"><span contenteditable="${state.editMode}" data-field="clientPhone"><bdi>${escapeHTML(state.clientPhone)}</bdi></span></div>` : ''}
          </div>
        </section>

        <!-- 3. Table of Services (Order: ITEM DESCRIPTION | DURATION | PLATFORM | PRICE) -->
        <section class="inv-table-wrap">
          <table class="inv-table">
            <thead class="inv-thead">
              <tr>
                <th class="inv-th th-desc" style="width: 42%;">${dict.colDesc}</th>
                <th class="inv-th th-duration" style="width: 18%;">${dict.colDuration}</th>
                <th class="inv-th th-platform" style="width: 18%;">${dict.colPlatform}</th>
                <th class="inv-th th-price" style="width: 22%;">${dict.colPrice}</th>
              </tr>
            </thead>
            <tbody class="inv-tbody">
              ${itemsRowsHTML}
            </tbody>
          </table>
        </section>

        <!-- 4. Summary & Grand Total -->
        <section class="inv-summary-row">
          <div class="inv-summary-box">
            ${state.items.length > 1 || state.taxRate > 0 || state.depositPaid > 0 ? `
              <div class="inv-calc-line">
                <span>${dict.subtotal}</span>
                <span dir="ltr">${formatAmount(totals.subtotal, state.currency, state.lang)}</span>
              </div>
            ` : ''}
            ${state.taxRate > 0 ? `
              <div class="inv-calc-line">
                <span>Tax (${state.taxRate}%):</span>
                <span dir="ltr">${formatAmount(totals.taxAmount, state.currency, state.lang)}</span>
              </div>
            ` : ''}
            ${state.depositPaid > 0 ? `
              <div class="inv-calc-line">
                <span>${dict.deposit}</span>
                <span dir="ltr">-${formatAmount(state.depositPaid, state.currency, state.lang)}</span>
              </div>
            ` : ''}
            <div class="inv-calc-line total-line">
              <span>${dict.grandTotal}</span>
              <span class="inv-total-amount" dir="ltr">${formatAmount(totals.grandTotal, state.currency, state.lang)}</span>
            </div>
          </div>
        </section>

        <!-- 5. Payment Details Card -->
        <section class="inv-payment-card">
          <div class="inv-payment-title">${dict.paymentInfo}</div>
          <div class="inv-beneficiary" contenteditable="${state.editMode}" data-field="beneficiaryName" dir="ltr"><bdi>${escapeHTML(state.beneficiaryName)}</bdi></div>
          <div class="inv-rails-grid">
            <div class="inv-rail-item">
              <strong class="inv-rail-label"><bdi>${dict.ccpLabel}</bdi></strong> 
              <span class="inv-rail-val" contenteditable="${state.editMode}" data-field="ccp" dir="ltr"><bdi>${escapeHTML(state.ccp)}</bdi></span>
            </div>
            <div class="inv-rail-item">
              <strong class="inv-rail-label"><bdi>${dict.ripLabel}</bdi></strong> 
              <span class="inv-rail-val" contenteditable="${state.editMode}" data-field="rip" dir="ltr"><bdi>${escapeHTML(state.rip)}</bdi></span>
            </div>
            ${state.bankName ? `
              <div class="inv-rail-item">
                <strong class="inv-rail-label"><bdi>Bank:</bdi></strong> 
                <span contenteditable="${state.editMode}" data-field="bankName" dir="auto">${escapeHTML(state.bankName)}</span>
              </div>
            ` : ''}
            ${state.iban ? `
              <div class="inv-rail-item">
                <strong class="inv-rail-label"><bdi>IBAN:</bdi></strong> 
                <span class="inv-rail-val" contenteditable="${state.editMode}" data-field="iban" dir="ltr"><bdi>${escapeHTML(state.iban)}</bdi></span>
              </div>
            ` : ''}
          </div>
        </section>

        ${state.terms ? `
        <!-- 6. Legal / Scope Terms (Optional) -->
        <div class="inv-terms-block" contenteditable="${state.editMode}" data-field="terms" dir="auto">
          ${escapeHTML(state.terms)}
        </div>
        ` : ''}
      </div>

      <!-- 7. Rounded Footer Pill (Always direction: ltr) -->
      <footer class="inv-footer">
        <div class="inv-footer-pill" dir="ltr">
          <span class="inv-footer-contact-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <bdi>${state.payableWebsite}</bdi>
          </span>
          <span class="inv-footer-contact-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            <bdi>${state.payablePhone}</bdi>
          </span>
          <span class="inv-footer-contact-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <bdi>${state.payableEmail}</bdi>
          </span>
        </div>
      </footer>
    `;

    // Re-bind contenteditable listeners
    attachInlineEditListeners();
  }

  // --- Inline Contenteditable Listeners ---
  function attachInlineEditListeners() {
    const editables = document.querySelectorAll('#invoiceSheet [contenteditable="true"]');
    editables.forEach(el => {
      el.addEventListener('blur', function () {
        const field = this.getAttribute('data-field');
        const isNum = this.getAttribute('data-type') === 'number';
        let val = this.innerText.trim();

        if (isNum) {
          const parsed = parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
          setNestedValue(state, field, parsed);
        } else {
          if (field === 'invoiceNumber') {
            val = formatSerialCode(val);
          }
          setNestedValue(state, field, val);
        }

        syncStateToForm();
        renderInvoiceSheet();
        saveToLocalStorage();
      });
    });
  }

  function setNestedValue(obj, path, value) {
    const keys = path.split('.');
    let current = obj;
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  }

  // --- Sync State into Left Form Inputs ---
  function syncStateToForm() {
    setValue('inputInvoiceNumber', state.invoiceNumber);
    setValue('inputIssueDate', state.issueDate);
    setValue('inputDueDate', state.dueDate);
    setValue('inputCurrency', state.currency);

    setValue('inputPayableName', state.payableName);
    setValue('inputPayableContact', state.payableContact);
    setValue('inputPayablePhone', state.payablePhone);

    setValue('inputClientName', state.clientName);
    setValue('inputClientContact', state.clientContact);
    setValue('inputClientPhone', state.clientPhone);
    setValue('inputClientEmail', state.clientEmail);
    setValue('inputClientAddress', state.clientAddress);

    setValue('inputBeneficiaryName', state.beneficiaryName);
    setValue('inputCcp', state.ccp);
    setValue('inputRip', state.rip);
    setValue('inputBankName', state.bankName);
    setValue('inputTerms', state.terms);

    renderServiceFormRows();
  }

  function setValue(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  }

  // --- Render Dynamic Line Items in Left Form ---
  function renderServiceFormRows() {
    const container = document.getElementById('serviceItemsFormContainer');
    if (!container) return;

    container.innerHTML = '';
    state.items.forEach((item, idx) => {
      const row = document.createElement('div');
      row.className = 'service-item-row';
      row.innerHTML = `
        <div class="service-item-header">
          <span class="service-item-number">SERVICE ITEM 0${idx + 1}</span>
          ${state.items.length > 1 ? `
            <button type="button" class="btn-remove-item" data-remove-idx="${idx}" title="Delete item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          ` : ''}
        </div>
        <div class="form-group">
          <label class="form-label">Item Description</label>
          <input type="text" class="form-input form-sync" data-item-field="description" data-item-idx="${idx}" value="${escapeHTML(item.description)}">
        </div>
        <div class="form-grid-2">
          <div class="form-group">
            <label class="form-label">Duration / Timeline</label>
            <input type="text" class="form-input form-sync" data-item-field="duration" data-item-idx="${idx}" value="${escapeHTML(item.duration)}">
          </div>
          <div class="form-group">
            <label class="form-label">Platform / Channel</label>
            <input type="text" class="form-input form-sync" data-item-field="platform" data-item-idx="${idx}" value="${escapeHTML(item.platform)}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Price / Amount (${state.currency})</label>
          <input type="number" class="form-input form-sync" data-item-field="price" data-item-idx="${idx}" value="${item.price || 0}">
        </div>
      `;
      container.appendChild(row);
    });

    container.querySelectorAll('.form-sync').forEach(input => {
      input.addEventListener('input', function () {
        const idx = parseInt(this.getAttribute('data-item-idx'), 10);
        const field = this.getAttribute('data-item-field');
        const val = field === 'price' ? parseFloat(this.value) || 0 : this.value;
        state.items[idx][field] = val;
        renderInvoiceSheet();
        saveToLocalStorage();
      });
    });

    container.querySelectorAll('.btn-remove-item').forEach(btn => {
      btn.addEventListener('click', function () {
        const idx = parseInt(this.getAttribute('data-remove-idx'), 10);
        state.items.splice(idx, 1);
        renderServiceFormRows();
        renderInvoiceSheet();
        saveToLocalStorage();
      });
    });
  }

  function addServiceItem() {
    state.items.push({
      description: 'Performance Creative & Media Campaign',
      duration: '15 Days',
      platform: 'Meta',
      price: 180000
    });
    renderServiceFormRows();
    renderInvoiceSheet();
    saveToLocalStorage();
    showToast('New service item added');
  }

  function setupFormListeners() {
    const bind = (id, prop, isNum = false) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', function () {
        state[prop] = isNum ? parseFloat(this.value) || 0 : this.value;
        renderInvoiceSheet();
        saveToLocalStorage();
      });
    };

    // Invoice Serial Number with auto-formatting on blur
    const invNumInput = document.getElementById('inputInvoiceNumber');
    if (invNumInput) {
      invNumInput.addEventListener('input', function () {
        state.invoiceNumber = this.value;
        renderInvoiceSheet();
        saveToLocalStorage();
      });
      invNumInput.addEventListener('blur', function () {
        this.value = formatSerialCode(this.value);
        state.invoiceNumber = this.value;
        renderInvoiceSheet();
        saveToLocalStorage();
      });
    }

    // Button to increment serial code (+1)
    const btnNext = document.getElementById('btnNextSerial');
    if (btnNext) {
      btnNext.addEventListener('click', () => {
        state.invoiceNumber = incrementSerialCode(state.invoiceNumber);
        setValue('inputInvoiceNumber', state.invoiceNumber);
        renderInvoiceSheet();
        saveToLocalStorage();
        showToast(`Next Serial: ${state.invoiceNumber}`);
      });
    }

    // Button to set date to today
    const btnToday = document.getElementById('btnSetToday');
    if (btnToday) {
      btnToday.addEventListener('click', () => {
        state.issueDate = getTodayFormatted();
        setValue('inputIssueDate', state.issueDate);
        renderInvoiceSheet();
        saveToLocalStorage();
        showToast(`Date set to today: ${state.issueDate}`);
      });
    }

    bind('inputIssueDate', 'issueDate');
    bind('inputDueDate', 'dueDate');
    bind('inputPayableName', 'payableName');
    bind('inputPayableContact', 'payableContact');
    bind('inputPayablePhone', 'payablePhone');
    bind('inputClientName', 'clientName');
    bind('inputClientContact', 'clientContact');
    bind('inputClientPhone', 'clientPhone');
    bind('inputClientEmail', 'clientEmail');
    bind('inputClientAddress', 'clientAddress');
    bind('inputBeneficiaryName', 'beneficiaryName');
    bind('inputCcp', 'ccp');
    bind('inputRip', 'rip');
    bind('inputBankName', 'bankName');
    bind('inputTerms', 'terms');

    const currSelect = document.getElementById('inputCurrency');
    if (currSelect) {
      currSelect.addEventListener('change', function () {
        state.currency = this.value;
        renderServiceFormRows();
        renderInvoiceSheet();
        saveToLocalStorage();
      });
    }

    const btnAdd = document.getElementById('btnAddServiceItem');
    if (btnAdd) btnAdd.addEventListener('click', addServiceItem);
  }

  // --- Preset Templates Vault ---
  const PRESETS = {
    celestia: {
      clientName: 'Celestia cosmetics',
      clientContact: 'Yasmine',
      clientPhone: '+213 563 05 28 57',
      clientEmail: '',
      clientAddress: '',
      invoiceNumber: 'POL-2026-093',
      issueDate: '25/08/2026',
      dueDate: '',
      currency: 'DA',
      items: [
        {
          description: 'Intensive Ads Campaign',
          duration: '15 Days',
          platform: 'Meta',
          price: 180000
        }
      ],
      beneficiaryName: 'FAYCAL CHOULI',
      ccp: '0044643623 cle 49',
      rip: '00799999004464362350',
      bankName: '',
      terms: ''
    },
    picked: {
      clientName: 'Picked Makeup',
      clientContact: 'Direction Commerciale',
      clientPhone: '+213 555 00 00 00',
      clientEmail: '',
      clientAddress: '',
      invoiceNumber: 'POL-2026-094',
      issueDate: getTodayFormatted(),
      dueDate: '',
      currency: 'DA',
      items: [
        {
          description: 'Gestion des publicités Instagram — 1 mois',
          duration: '30 Days',
          platform: 'Instagram',
          price: 200000
        },
        {
          description: 'Gestion des publicités site web — 1 mois',
          duration: '30 Days',
          platform: 'Google / Web',
          price: 100000
        }
      ],
      beneficiaryName: 'FAYCAL CHOULI',
      ccp: '0044643623 cle 49',
      rip: '00799999004464362350',
      bankName: '',
      terms: ''
    }
  };

  function loadPreset(presetKey) {
    if (!PRESETS[presetKey]) return;
    state = Object.assign({}, defaultState, PRESETS[presetKey]);
    syncStateToForm();
    renderInvoiceSheet();
    saveToLocalStorage();
    showToast(`Loaded: ${state.clientName}`);
  }

  function setupToolbar() {
    const themeAlabaster = document.getElementById('themeAlabaster');
    const themeObsidian = document.getElementById('themeObsidian');

    if (themeAlabaster && themeObsidian) {
      themeAlabaster.addEventListener('click', () => {
        state.theme = 'alabaster';
        themeAlabaster.classList.add('active');
        themeObsidian.classList.remove('active');
        renderInvoiceSheet();
        saveToLocalStorage();
      });

      themeObsidian.addEventListener('click', () => {
        state.theme = 'obsidian';
        themeObsidian.classList.add('active');
        themeAlabaster.classList.remove('active');
        renderInvoiceSheet();
        saveToLocalStorage();
      });
    }

    const langSelect = document.getElementById('langSelect');
    if (langSelect) {
      langSelect.value = state.lang;
      langSelect.addEventListener('change', function () {
        state.lang = this.value;
        renderInvoiceSheet();
        saveToLocalStorage();
      });
    }

    const btnToggleEdit = document.getElementById('btnToggleEdit');
    const editModePill = document.getElementById('editModePill');
    if (btnToggleEdit) {
      btnToggleEdit.addEventListener('click', () => {
        state.editMode = !state.editMode;
        document.body.classList.toggle('edit-mode-active', state.editMode);
        
        if (editModePill) {
          editModePill.classList.toggle('inactive', !state.editMode);
          editModePill.innerHTML = state.editMode
            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg> Direct Edit Active'
            : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg> Preview Mode';
        }

        renderInvoiceSheet();
        showToast(state.editMode ? 'Direct click-to-edit activated' : 'Locked to preview mode');
      });
    }

    const btnPrint = document.getElementById('btnPrintInvoice');
    if (btnPrint) {
      btnPrint.addEventListener('click', () => {
        updateDocumentTitle();
        window.print();
      });
    }

    document.querySelectorAll('[data-preset-load]').forEach(btn => {
      btn.addEventListener('click', function () {
        const key = this.getAttribute('data-preset-load');
        loadPreset(key);
      });
    });

    const btnReset = document.getElementById('btnResetInvoice');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('Reset invoice to default template?')) {
          localStorage.removeItem('polish_invoice_state_v4');
          localStorage.removeItem('polish_invoice_state_v3');
          localStorage.removeItem('polish_invoice_state_v2');
          state = Object.assign({}, defaultState, {
            invoiceNumber: formatSerialCode('094'),
            issueDate: getTodayFormatted()
          });
          syncStateToForm();
          renderInvoiceSheet();
          showToast('Reset to default');
        }
      });
    }

    // Mobile View Toggles
    const btnMobileForm = document.getElementById('btnMobileForm');
    const btnMobilePreview = document.getElementById('btnMobilePreview');
    if (btnMobileForm && btnMobilePreview) {
      btnMobileForm.addEventListener('click', () => {
        document.body.classList.remove('show-mobile-preview');
        btnMobileForm.classList.add('active');
        btnMobilePreview.classList.remove('active');
      });
      btnMobilePreview.addEventListener('click', () => {
        document.body.classList.add('show-mobile-preview');
        btnMobilePreview.classList.add('active');
        btnMobileForm.classList.remove('active');
      });
    }

    // Cloud Persistence & Archive Toolbar Triggers
    const btnCloudSave = document.getElementById('btnCloudSave');
    if (btnCloudSave) {
      btnCloudSave.addEventListener('click', saveInvoiceToCloud);
    }

    const btnOpenArchive = document.getElementById('btnOpenArchive');
    if (btnOpenArchive) {
      btnOpenArchive.addEventListener('click', openArchiveDrawer);
    }

    const btnCloseArchive = document.getElementById('btnCloseArchive');
    if (btnCloseArchive) {
      btnCloseArchive.addEventListener('click', closeArchiveDrawer);
    }

    const archiveBackdrop = document.getElementById('archiveDrawerBackdrop');
    if (archiveBackdrop) {
      archiveBackdrop.addEventListener('click', closeArchiveDrawer);
    }

    const archiveSearch = document.getElementById('archiveSearchInput');
    if (archiveSearch) {
      archiveSearch.addEventListener('input', (e) => filterArchiveList(e.target.value));
    }

    const btnLogout = document.getElementById('btnAdminLogout');
    if (btnLogout) {
      btnLogout.addEventListener('click', logoutAdmin);
    }

    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        updateDocumentTitle();
        window.print();
      }
    });

    window.addEventListener('beforeprint', () => {
      updateDocumentTitle();
    });
  }

  // --- LocalStorage Persistence ---
  function saveToLocalStorage() {
    try {
      localStorage.setItem('polish_invoice_state_v4', JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }
  }

  function loadFromLocalStorage() {
    try {
      // Clear legacy state keys
      localStorage.removeItem('polish_invoice_state_v2');
      localStorage.removeItem('polish_invoice_state_v3');
      const saved = localStorage.getItem('polish_invoice_state_v4');
      if (saved) {
        const parsed = JSON.parse(saved);
        delete parsed.payableAddress;
        state = Object.assign({}, defaultState, parsed);
        if (state.invoiceNumber) {
          state.invoiceNumber = formatSerialCode(state.invoiceNumber);
        }
      } else {
        state.invoiceNumber = formatSerialCode('094');
        state.issueDate = getTodayFormatted();
      }
    } catch (e) {
      console.warn('LocalStorage load error:', e);
    }
  }

  function showToast(msg) {
    let toast = document.getElementById('invToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'invToast';
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2400);
  }

  // ========================================================================
  // EXECUTIVE AUTHENTICATION & SUPABASE INTEGRATION
  // ========================================================================
  let activeAdminToken = '';
  let activeAdminKey = '';
  let cachedCloudInvoices = [];

  async function getAuthHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    if (window.PolishSupabase && typeof window.PolishSupabase.getIdToken === 'function') {
      try {
        const token = await window.PolishSupabase.getIdToken();
        if (token) activeAdminToken = token;
      } catch (_) {}
    }
    if (!activeAdminToken) {
      activeAdminToken = localStorage.getItem('polish_supabase_token') || '';
    }
    if (activeAdminToken) {
      headers['Authorization'] = `Bearer ${activeAdminToken}`;
    } else if (activeAdminKey) {
      headers['x-api-key'] = activeAdminKey;
    } else {
      const storedKey = sessionStorage.getItem('polish_admin_key');
      if (storedKey) {
        activeAdminKey = storedKey;
        headers['x-api-key'] = storedKey;
      }
    }
    return headers;
  }

  function showAuthError(msg) {
    const errEl = document.getElementById('authGateError');
    if (errEl) {
      errEl.textContent = msg;
      errEl.style.display = 'block';
    }
  }

  async function checkAdminAuth() {
    const isInsideAdmin = !!document.getElementById('dashboardAppView');
    const authGate = document.getElementById('authGateView');
    const appView = document.getElementById('studioAppView');

    // 0. Inside Admin Dashboard: Authentication is handled by admin.html
    if (isInsideAdmin) {
      const storedKey = localStorage.getItem('polish_admin_key') || sessionStorage.getItem('polish_admin_key');
      if (storedKey) activeAdminKey = storedKey;
      if (window.PolishSupabase && typeof window.PolishSupabase.getIdToken === 'function') {
        try {
          const token = await window.PolishSupabase.getIdToken();
          if (token) activeAdminToken = token;
        } catch (_) {}
      }
      loadCloudInvoicesList();
      return true;
    }

    // 1. Check URL query key
    const urlKey = new URLSearchParams(window.location.search).get('key');

    // 2. Check fallback key in localStorage or sessionStorage
    const storedKey = urlKey || localStorage.getItem('polish_admin_key') || sessionStorage.getItem('polish_admin_key');
    if (storedKey) {
      try {
        const res = await fetch('/api/admin/verify', {
          headers: { 'x-api-key': storedKey }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          activeAdminKey = storedKey;
          localStorage.setItem('polish_admin_key', storedKey);
          sessionStorage.setItem('polish_admin_key', storedKey);
          document.documentElement.classList.add('is-authenticated');
          unlockStudio('Executive Key');
          if (urlKey && window.history && window.history.replaceState) {
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
          }
          return true;
        }
      } catch (_) {}
    }

    // 3. Check Supabase OAuth
    if (window.PolishSupabase) {
      try {
        await window.PolishSupabase.init();
        if (window.PolishSupabase.currentUser && !window.PolishSupabase.currentUser.isOffline) {
          const token = await window.PolishSupabase.getIdToken();
          if (token) {
            activeAdminToken = token;
            const res = await fetch('/api/admin/verify', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && data.success) {
              document.documentElement.classList.add('is-authenticated');
              unlockStudio(data.user?.email || window.PolishSupabase.currentUser.email);
              return true;
            } else if (data.error) {
              showAuthError(data.error);
              if (window.PolishSupabase.logout) await window.PolishSupabase.logout();
            }
          }
        }
      } catch (err) {
        console.warn('[Invoice Auth] Supabase check error:', err);
      }
    }

    // Unauthenticated (only for standalone invoice.html)
    document.documentElement.classList.remove('is-authenticated');
    if (authGate) authGate.style.display = 'flex';
    if (appView) appView.style.display = 'none';
    return false;
  }

  function unlockStudio(identifier) {
    const isInsideAdmin = !!document.getElementById('dashboardAppView');
    const authGate = document.getElementById('authGateView');
    const appView = document.getElementById('studioAppView');
    const userEmailEl = document.getElementById('adminUserEmail');

    document.documentElement.classList.add('is-authenticated');
    if (authGate && !isInsideAdmin) authGate.style.display = 'none';
    if (appView) appView.style.display = 'block';
    if (userEmailEl && identifier && !isInsideAdmin) {
      userEmailEl.textContent = identifier.includes('@') ? identifier.split('@')[0] : identifier;
      userEmailEl.title = identifier;
    }

    loadCloudInvoicesList();
  }

  if (!window.handleGoogleAdminSignIn) {
    window.handleGoogleAdminSignIn = async function () {
      const errEl = document.getElementById('authGateError');
      if (errEl) errEl.style.display = 'none';
      const text = document.getElementById('btnGoogleText');
      if (text) text.textContent = 'Connecting with Google...';

      try {
        if (!window.PolishSupabase || !window.PolishSupabase.isReady) {
          await window.PolishSupabase.init();
        }
        await window.PolishSupabase.loginWithGoogle({
          redirectTo: window.location.href.split('#')[0]
        });
      } catch (err) {
        console.error('[Invoice Auth] Google sign-in failed:', err);
        showAuthError(err.message || 'Google sign-in could not be completed.');
      } finally {
        if (text) text.textContent = 'Sign In with Google';
      }
    };
  }

  if (!window.handleKeyUnlock) {
    window.handleKeyUnlock = async function () {
      const keyInput = document.getElementById('adminSecurityKey');
      const key = keyInput ? keyInput.value.trim() : '';
      if (!key) {
        showAuthError('Please enter your executive master key.');
        return;
      }

      try {
        const res = await fetch('/api/admin/verify', {
          headers: { 'x-api-key': key }
        });
        const data = await res.json();
        if (res.ok && data.success) {
          activeAdminKey = key;
          localStorage.setItem('polish_admin_key', key);
          sessionStorage.setItem('polish_admin_key', key);
          document.documentElement.classList.add('is-authenticated');
          unlockStudio('Executive Key');
        } else {
          showAuthError(data.error || 'Invalid executive security key.');
        }
      } catch (err) {
        showAuthError('Connection error: ' + err.message);
      }
    };
  }

  if (!document.getElementById('dashboardAppView')) {
    const emergencyKeyInput = document.getElementById('adminSecurityKey');
    if (emergencyKeyInput) {
      emergencyKeyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (window.handleKeyUnlock) window.handleKeyUnlock();
        }
      });
    }
  }

  async function logoutAdmin() {
    activeAdminToken = '';
    activeAdminKey = '';
    localStorage.removeItem('polish_admin_key');
    localStorage.removeItem('polish_admin_session');
    sessionStorage.removeItem('polish_admin_key');
    localStorage.removeItem('polish_supabase_token');
    localStorage.removeItem('polish_studio_user');
    document.documentElement.classList.remove('is-authenticated');

    if (window.PolishSupabase && typeof window.PolishSupabase.logout === 'function') {
      try {
        await window.PolishSupabase.logout();
      } catch (_) {}
    }

    const authGate = document.getElementById('authGateView');
    const appView = document.getElementById('studioAppView');
    if (authGate) authGate.style.display = 'flex';
    if (appView) appView.style.display = 'none';
    showToast('Signed out of Executive Invoicing Atelier');
  }

  // ========================================================================
  // CLOUD PERSISTENCE & ARCHIVE DRAWER
  // ========================================================================
  async function saveInvoiceToCloud() {
    const saveBtn = document.getElementById('btnCloudSave');
    const syncText = document.getElementById('cloudSyncText');
    const syncPill = document.getElementById('cloudSyncPill');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.style.opacity = '0.7';
    }
    if (syncText) syncText.textContent = 'Saving to Supabase...';

    try {
      const totals = computeTotals();
      const payload = {
        invoiceNumber: state.invoiceNumber || formatSerialCode('094'),
        issueDate: state.issueDate || getTodayFormatted(),
        dueDate: state.dueDate || '',
        currency: state.currency || 'DA',
        clientName: state.clientName || 'Untitled Client',
        clientContact: state.clientContact || '',
        clientPhone: state.clientPhone || '',
        clientEmail: state.clientEmail || '',
        clientAddress: state.clientAddress || '',
        payableName: state.payableName || 'Polish Media Co',
        payableContact: state.payableContact || 'Faycal Chouli',
        payablePhone: state.payablePhone || '+213 661 41 77 62',
        items: state.items || [],
        beneficiaryName: state.beneficiaryName || 'FAYCAL CHOULI',
        ccp: state.ccp || '0044643623 cle 49',
        rip: state.rip || '00799999004464362350',
        bankName: state.bankName || '',
        terms: state.terms || '',
        status: 'issued',
        subtotal: totals.subtotal,
        grandTotal: totals.grandTotal,
        theme: state.theme || 'alabaster',
        lang: state.lang || 'en'
      };

      const headers = await getAuthHeaders();
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save invoice to cloud');
      }

      showToast(`Saved to Cloud: ${payload.invoiceNumber}`);
      if (syncText) syncText.textContent = 'Synced (Supabase)';
      if (syncPill) {
        syncPill.style.borderColor = 'rgba(16, 185, 129, 0.4)';
        syncPill.style.color = '#10B981';
      }

      loadCloudInvoicesList();
    } catch (err) {
      console.error('[Invoice Cloud Save] Error:', err);
      showToast('Cloud save failed: ' + err.message);
      if (syncText) syncText.textContent = 'Sync Error';
    } finally {
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.style.opacity = '1';
      }
    }
  }

  async function loadCloudInvoicesList() {
    const listContainer = document.getElementById('archiveListContainer');
    if (!listContainer) return;

    try {
      const headers = await getAuthHeaders();
      const res = await fetch('/api/invoices', { headers });
      const data = await res.json();

      if (res.ok && data.success && Array.isArray(data.invoices)) {
        cachedCloudInvoices = data.invoices;
        renderArchiveCards(cachedCloudInvoices);
        const countBadge = document.getElementById('invoicesNavCount');
        if (countBadge) {
          countBadge.textContent = cachedCloudInvoices.length;
        }
      } else {
        listContainer.innerHTML = `<div style="text-align: center; padding: 24px; color: var(--studio-text-muted); font-size: 12.5px;">No cloud invoices found or access denied.</div>`;
      }
    } catch (err) {
      console.warn('[Invoice Archive] Failed to load list:', err);
      listContainer.innerHTML = `<div style="text-align: center; padding: 24px; color: #F87171; font-size: 12.5px;">Unable to fetch cloud invoices. Check connection.</div>`;
    }
  }

  function renderArchiveCards(invoices) {
    const listContainer = document.getElementById('archiveListContainer');
    if (!listContainer) return;

    if (!invoices || invoices.length === 0) {
      listContainer.innerHTML = `<div style="text-align: center; padding: 32px 16px; color: var(--studio-text-muted); font-size: 12.5px;">No saved invoices in cloud storage yet.<br><span style="font-size: 11px; opacity: 0.7; margin-top: 6px; display: inline-block;">Click "Save to Cloud" in the toolbar to persist this invoice.</span></div>`;
      return;
    }

    listContainer.innerHTML = invoices.map(inv => {
      const serial = escapeHTML(inv.invoiceNumber || inv.id);
      const client = escapeHTML(inv.clientName || 'Untitled Client');
      const date = escapeHTML(inv.issueDate || '');
      const totalNum = Number(inv.grandTotal || inv.totalAmount || (inv.state && (inv.state.grandTotal || inv.state.totalAmount)) || 0);
      const total = totalNum.toLocaleString('en-US');
      const currency = escapeHTML(inv.currency || (inv.state && inv.state.currency) || 'DA');
      const status = (inv.status || 'issued').toLowerCase();
      const id = escapeHTML(inv.id);

      return `
        <div class="archive-invoice-card" data-invoice-id="${id}">
          <div class="archive-card-top">
            <span class="archive-card-num">${serial}</span>
            <span class="archive-card-status ${status}">${status}</span>
          </div>
          <div class="archive-card-client">${client}</div>
          <div class="archive-card-meta">
            <span>${date}</span>
            <span class="archive-card-total">${total} ${currency}</span>
          </div>
          <div class="archive-card-actions">
            <button type="button" class="archive-btn-load" onclick="window.loadInvoiceFromCloudById('${id}')">Load Into Studio</button>
            <button type="button" class="archive-btn-del" onclick="window.deleteInvoiceFromCloudById('${id}', event)" title="Delete invoice">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  window.loadInvoiceFromCloudById = function (id) {
    const inv = cachedCloudInvoices.find(item => item.id === id || item.invoiceNumber === id);
    if (!inv) {
      showToast('Invoice not found in cache');
      return;
    }

    state = Object.assign({}, defaultState, {
      invoiceNumber: inv.invoiceNumber || formatSerialCode('094'),
      issueDate: inv.issueDate || getTodayFormatted(),
      dueDate: inv.dueDate || '',
      currency: inv.currency || 'DA',
      clientName: inv.clientName || '',
      clientContact: inv.clientContact || '',
      clientPhone: inv.clientPhone || '',
      clientEmail: inv.clientEmail || '',
      clientAddress: inv.clientAddress || '',
      payableName: inv.payableName || 'Polish Media Co',
      payableContact: inv.payableContact || 'Faycal Chouli',
      payablePhone: inv.payablePhone || '+213 661 41 77 62',
      items: Array.isArray(inv.items) && inv.items.length > 0 ? inv.items : defaultState.items,
      beneficiaryName: inv.beneficiaryName || 'FAYCAL CHOULI',
      ccp: inv.ccp || '0044643623 cle 49',
      rip: inv.rip || '00799999004464362350',
      bankName: inv.bankName || '',
      terms: inv.terms || '',
      theme: inv.theme || state.theme,
      lang: inv.lang || state.lang
    });

    syncStateToForm();
    renderInvoiceSheet();
    saveToLocalStorage();
    closeArchiveDrawer();
    showToast(`Loaded invoice: ${state.invoiceNumber}`);
  };

  window.deleteInvoiceFromCloudById = async function (id, event) {
    if (event) event.stopPropagation();
    if (!confirm(`Are you sure you want to delete invoice ${id}? This cannot be undone.`)) {
      return;
    }

    try {
      const headers = await getAuthHeaders();
      const res = await fetch(`/api/invoices/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`Invoice ${id} deleted`);
        loadCloudInvoicesList();
      } else {
        showToast('Delete failed: ' + (data.error || 'Server error'));
      }
    } catch (err) {
      showToast('Delete error: ' + err.message);
    }
  };

  function openArchiveDrawer() {
    const drawer = document.getElementById('archiveDrawer');
    const backdrop = document.getElementById('archiveDrawerBackdrop');
    if (drawer) drawer.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    loadCloudInvoicesList();
  }

  function closeArchiveDrawer() {
    const drawer = document.getElementById('archiveDrawer');
    const backdrop = document.getElementById('archiveDrawerBackdrop');
    if (drawer) drawer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
  }

  function filterArchiveList(query) {
    const q = (query || '').toLowerCase().trim();
    if (!q) {
      renderArchiveCards(cachedCloudInvoices);
      return;
    }
    const filtered = cachedCloudInvoices.filter(inv => {
      const num = (inv.invoiceNumber || inv.id || '').toLowerCase();
      const client = (inv.clientName || '').toLowerCase();
      const date = (inv.issueDate || '').toLowerCase();
      return num.includes(q) || client.includes(q) || date.includes(q);
    });
    renderArchiveCards(filtered);
  }

  async function init() {
    loadFromLocalStorage();
    syncStateToForm();
    renderInvoiceSheet();
    setupFormListeners();
    setupToolbar();
    await checkAdminAuth();
  }

  window.refreshInvoiceStudio = function () {
    syncStateToForm();
    renderInvoiceSheet();
    loadCloudInvoicesList();
  };
  window.initInvoiceStudio = init;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
