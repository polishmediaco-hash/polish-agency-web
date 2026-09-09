/**
 * POLISH Board Studio — Haute Atelier Floating Contextual Mini-Toolbar
 * High-performance Miro-alternative floating dock positioned directly above active cards.
 */

window.StudioInspector = (function () {
  let inspectorEl = null;
  let activeElement = null;
  let activeData = null;

  function init() {
    inspectorEl = document.getElementById('floating-inspector');
    if (inspectorEl) {
      inspectorEl.setAttribute('role', 'toolbar');
      inspectorEl.setAttribute('aria-label', 'Element contextual controls');
      // Prevent pointer events on inspector from propagating to canvas
      inspectorEl.addEventListener('pointerdown', (e) => {
        e.stopPropagation();
      });
      inspectorEl.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Window resize tracking
    window.addEventListener('resize', () => {
      updatePosition();
    });
  }

  function show(el, data) {
    if (!inspectorEl) init();
    if (!inspectorEl || !el) return;

    activeElement = el;
    activeData = data;

    inspectorEl.classList.add('active');
    renderControls(el, data);
    updatePosition(el);
  }

  function hide() {
    activeElement = null;
    activeData = null;
    if (inspectorEl) {
      inspectorEl.classList.remove('active');
    }
  }

  function updatePosition(el) {
    const target = el || activeElement;
    if (!inspectorEl || !target) return;

    const rect = target.getBoundingClientRect();
    if (!rect || (rect.width === 0 && rect.height === 0)) return;

    // Check if element is completely off the screen
    if (rect.bottom < 40 || rect.top > window.innerHeight - 20 || rect.right < 40 || rect.left > window.innerWidth - 40) {
      inspectorEl.style.opacity = '0';
      inspectorEl.style.pointerEvents = 'none';
      return;
    } else {
      inspectorEl.style.opacity = '1';
      inspectorEl.style.pointerEvents = 'auto';
    }

    // Center horizontally with viewport safety margin
    const centerX = Math.max(170, Math.min(window.innerWidth - 170, rect.left + rect.width / 2));

    // Determine if placing above or below
    // If rect.top < 130 (near top header dock), place below the element
    const placeBelow = rect.top < 130;
    inspectorEl.classList.toggle('place-below', placeBelow);

    const targetY = placeBelow ? (rect.bottom + 12) : (rect.top - 12);

    inspectorEl.style.left = `${Math.round(centerX)}px`;
    inspectorEl.style.top = `${Math.round(targetY)}px`;
  }

  function renderControls(el, data) {
    if (!inspectorEl) return;
    const type = data.type || el.dataset.type || 'card';

    let html = '';

    // 1. Element Type Identifier Badge
    const typeLabels = {
      sticky: 'STICKY NOTE',
      frame: 'STRATEGY FRAME',
      table: 'ROADMAP TABLE',
      pricing: 'HIGH-TICKET OFFER',
      form: 'INTAKE WORKSHEET',
      script: 'TALKING TRACK',
      connection: 'FLOW CONNECTOR'
    };
    html += `<span class="insp-type-badge">${typeLabels[type] || 'ELEMENT'}</span>`;
    html += `<div class="insp-divider" aria-hidden="true"></div>`;

    // 2. Universal Typography Selector (for all textual cards)
    if (type !== 'connection') {
      const currentFont = data.fontFamily || 'sans';
      html += `
        <div class="insp-group">
          <select class="insp-select" aria-label="Typography Font Family" onchange="StudioInspector.setFont('${data.id}', this.value)" title="Typography Archetype">
            <option value="sans" ${currentFont === 'sans' ? 'selected' : ''}>Sans (Jakarta)</option>
            <option value="serif" ${currentFont === 'serif' ? 'selected' : ''}>Serif (Cormorant)</option>
            <option value="mono" ${currentFont === 'mono' ? 'selected' : ''}>Mono (Technical)</option>
            <option value="arabic" ${currentFont === 'arabic' ? 'selected' : ''}>Arabic (Tajawal)</option>
          </select>
        </div>
        <div class="insp-divider" aria-hidden="true"></div>
      `;
    }

    // 3. Type-Specific Customization Controls
    if (type === 'sticky') {
      const currentColor = data.color || 'yellow';
      html += `
        <div class="insp-swatch-row" role="radiogroup" aria-label="Sticky Note Color">
          <button type="button" role="radio" aria-label="Canary Yellow" aria-checked="${currentColor === 'yellow'}" class="insp-swatch swatch-yellow ${currentColor === 'yellow' ? 'active' : ''}" title="Canary Yellow" onclick="StudioInspector.setStickyColor('${data.id}', 'yellow')"></button>
          <button type="button" role="radio" aria-label="Rose Silk" aria-checked="${currentColor === 'rose'}" class="insp-swatch swatch-rose ${currentColor === 'rose' ? 'active' : ''}" title="Rose Silk" onclick="StudioInspector.setStickyColor('${data.id}', 'rose')"></button>
          <button type="button" role="radio" aria-label="Sky Azure" aria-checked="${currentColor === 'blue'}" class="insp-swatch swatch-blue ${currentColor === 'blue' ? 'active' : ''}" title="Sky Azure" onclick="StudioInspector.setStickyColor('${data.id}', 'blue')"></button>
          <button type="button" role="radio" aria-label="Sage Formulation" aria-checked="${currentColor === 'green'}" class="insp-swatch swatch-green ${currentColor === 'green' ? 'active' : ''}" title="Sage Formulation" onclick="StudioInspector.setStickyColor('${data.id}', 'green')"></button>
          <button type="button" role="radio" aria-label="Champagne Gold" aria-checked="${currentColor === 'gold'}" class="insp-swatch swatch-gold ${currentColor === 'gold' ? 'active' : ''}" title="Champagne Gold" onclick="StudioInspector.setStickyColor('${data.id}', 'gold')"></button>
          <button type="button" role="radio" aria-label="Obsidian Noir" aria-checked="${currentColor === 'noir'}" class="insp-swatch swatch-noir ${currentColor === 'noir' ? 'active' : ''}" title="Obsidian Noir" onclick="StudioInspector.setStickyColor('${data.id}', 'noir')"></button>
        </div>
        <div class="insp-divider" aria-hidden="true"></div>
        <button class="insp-btn ${data.hasTape !== false ? 'active' : ''}" onclick="StudioInspector.toggleTape('${data.id}')" title="Toggle Analog Masking Tape">
          <svg class="insp-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8l16-4v12l-16 4z"/><line x1="9" y1="6.7" x2="9" y2="18.7"/><line x1="15" y1="5.2" x2="15" y2="17.2"/></svg>
          Tape
        </button>
        <div class="insp-divider" aria-hidden="true"></div>
      `;
    } else if (type === 'frame') {
      html += `
        <div class="insp-group">
          <button class="insp-btn" onclick="StudioInspector.addBoxToFrame('${data.id}')" title="Add Strategic Pillar Box">+ Box</button>
          <button class="insp-btn" onclick="StudioInspector.setFrameBanner('${data.id}')" title="Set Frame Cover Image">
            <svg class="insp-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Cover
          </button>
        </div>
        <div class="insp-divider" aria-hidden="true"></div>
      `;
    } else if (type === 'table') {
      html += `
        <div class="insp-group">
          <button class="insp-btn" onclick="StudioCore.addTableRow('${data.id}')" title="Add Row">+ Row</button>
          <button class="insp-btn" onclick="StudioCore.removeTableRow('${data.id}')" title="Remove Row">− Row</button>
          <button class="insp-btn" onclick="StudioCore.addTableCol('${data.id}')" title="Add Column">+ Col</button>
          <button class="insp-btn" onclick="StudioCore.removeTableCol('${data.id}')" title="Remove Column">− Col</button>
        </div>
        <div class="insp-divider" aria-hidden="true"></div>
      `;
    } else if (type === 'pricing') {
      const cur = data.currency || 'AED';
      html += `
        <div class="insp-group">
          <select class="insp-select" aria-label="Currency Selector" onchange="StudioInspector.setPricingCurrency('${data.id}', this.value)" title="Offer Currency">
            <option value="AED" ${cur === 'AED' ? 'selected' : ''}>AED</option>
            <option value="$" ${cur === '$' ? 'selected' : ''}>$ USD</option>
            <option value="€" ${cur === '€' ? 'selected' : ''}>€ EUR</option>
            <option value="£" ${cur === '£' ? 'selected' : ''}>£ GBP</option>
          </select>
          <button class="insp-btn ${data.isFeatured || data.featured ? 'active' : ''}" onclick="StudioInspector.togglePricingFeatured('${data.id}')" title="Toggle Featured Anchor">
            <svg class="insp-icon" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            Featured
          </button>
          <button class="insp-btn" onclick="StudioCore.addPricingFeature('${data.id}')" title="Add Deliverable">+ Deliverable</button>
        </div>
        <div class="insp-divider" aria-hidden="true"></div>
      `;
    } else if (type === 'form') {
      html += `
        <div class="insp-group">
          <button class="insp-btn" onclick="StudioCore.addFormField('${data.id}', 'textarea')" title="Add Diagnostic Long Question">+ Question (Long)</button>
          <button class="insp-btn" onclick="StudioCore.addFormField('${data.id}', 'input')" title="Add Metric Input">+ Input (Short)</button>
        </div>
        <div class="insp-divider" aria-hidden="true"></div>
      `;
    } else if (type === 'script') {
      html += `
        <div class="insp-group">
          <span style="font-size:0.75rem; color:var(--brand-gold); font-weight:700; display:inline-flex; align-items:center; gap:5px;">
            <svg class="insp-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            VIP Talk Track
          </span>
        </div>
        <div class="insp-divider" aria-hidden="true"></div>
      `;
    } else if (type === 'connection') {
      const curColor = data.color || 'slate';
      html += `
        <div class="insp-swatch-row" role="radiogroup" aria-label="Connector Color">
          <button type="button" role="radio" aria-label="Champagne Gold" aria-checked="${curColor === 'gold'}" class="insp-swatch swatch-gold ${curColor === 'gold' ? 'active' : ''}" title="Champagne Gold" onclick="StudioInspector.setConnColor('${data.id}', 'gold')"></button>
          <button type="button" role="radio" aria-label="Noir" aria-checked="${curColor === 'noir'}" class="insp-swatch swatch-noir ${curColor === 'noir' ? 'active' : ''}" title="Noir" onclick="StudioInspector.setConnColor('${data.id}', 'noir')"></button>
          <button type="button" role="radio" aria-label="Rose" aria-checked="${curColor === 'rose'}" class="insp-swatch swatch-rose ${curColor === 'rose' ? 'active' : ''}" title="Rose" onclick="StudioInspector.setConnColor('${data.id}', 'rose')"></button>
          <button type="button" role="radio" aria-label="Slate" aria-checked="${curColor === 'slate'}" class="insp-swatch swatch-slate ${curColor === 'slate' ? 'active' : ''}" title="Slate" onclick="StudioInspector.setConnColor('${data.id}', 'slate')"></button>
        </div>
        <div class="insp-divider" aria-hidden="true"></div>
        <div class="insp-group">
          <button class="insp-btn ${data.style === 'dashed' ? 'active' : ''}" onclick="StudioInspector.setConnStyle('${data.id}', 'dashed')" title="Dashed Line">╌ Dashed</button>
          <button class="insp-btn ${data.style === 'solid' ? 'active' : ''}" onclick="StudioInspector.setConnStyle('${data.id}', 'solid')" title="Solid Line">━ Solid</button>
        </div>
        <div class="insp-divider" aria-hidden="true"></div>
      `;
    }

    // 4. Quick-Connect Arrow Trigger (for cards)
    if (type !== 'connection') {
      html += `
        <button class="insp-btn btn-connect" onclick="StudioInspector.startConnect('${data.id}')" title="Draw Connection Arrow (Miro-style)">
          <svg class="insp-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          Connect
        </button>
        <div class="insp-divider" aria-hidden="true"></div>
      `;
    }

    // 5. Common Global Actions: Duplicate & Delete
    html += `
      <button class="insp-btn" onclick="StudioCore.duplicateSelected()" title="Duplicate Element (Cmd+D)">
        <svg class="insp-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        Copy
      </button>
      <button class="insp-btn btn-danger" onclick="StudioCore.deleteSelected()" title="Delete Element (Delete)" aria-label="Delete Element">
        <svg class="insp-icon" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;

    inspectorEl.innerHTML = html;
  }

  function setFont(id, font) {
    const el = document.getElementById(id);
    const data = window.StudioCore.findElement(id);
    if (el && data) {
      el.classList.remove('font-sans', 'font-serif', 'font-mono', 'font-arabic');
      el.classList.add(`font-${font}`);
      data.fontFamily = font;
      window.StudioCore.triggerAutoSave();
      updatePosition();
    }
  }

  function setStickyColor(id, color) {
    const el = document.getElementById(id);
    const data = window.StudioCore.findElement(id);
    if (el && data) {
      const fontClass = data.fontFamily ? ` font-${data.fontFamily}` : '';
      el.className = `sticky-note sticky-${color} is-selected${fontClass}`;
      data.color = color;
      window.StudioCore.triggerAutoSave();
      renderControls(el, data);
      updatePosition();
    }
  }

  function toggleTape(id) {
    const el = document.getElementById(id);
    const data = window.StudioCore.findElement(id);
    if (el && data) {
      let tape = el.querySelector('.sticky-tape');
      if (tape) {
        tape.remove();
        data.hasTape = false;
      } else {
        const newTape = document.createElement('div');
        newTape.className = 'sticky-tape';
        el.prepend(newTape);
        data.hasTape = true;
      }
      window.StudioCore.triggerAutoSave();
      renderControls(el, data);
      updatePosition();
    }
  }

  function setPricingCurrency(id, currency) {
    const data = window.StudioCore.findElement(id);
    if (data) {
      data.currency = currency;
      window.StudioCore.reRenderElement(id);
      window.StudioCore.triggerAutoSave();
    }
  }

  function togglePricingFeatured(id) {
    const data = window.StudioCore.findElement(id);
    const el = document.getElementById(id);
    if (data && el) {
      data.isFeatured = !data.isFeatured;
      data.featured = data.isFeatured;
      el.classList.toggle('featured', data.isFeatured);
      window.StudioCore.triggerAutoSave();
      renderControls(el, data);
      updatePosition();
    }
  }

  function setConnColor(id, color) {
    const data = window.StudioCore.findConnection(id);
    if (data) {
      data.color = color;
      if (window.ConnectorEngine && window.StudioCore) {
        window.ConnectorEngine.renderAllConnections(window.StudioCore.getConnections());
      }
      window.StudioCore.triggerAutoSave();
      renderControls(activeElement, data);
      updatePosition();
    }
  }

  function setConnStyle(id, style) {
    const data = window.StudioCore.findConnection(id);
    if (data) {
      data.style = style;
      if (window.ConnectorEngine && window.StudioCore) {
        window.ConnectorEngine.renderAllConnections(window.StudioCore.getConnections());
      }
      window.StudioCore.triggerAutoSave();
      renderControls(activeElement, data);
      updatePosition();
    }
  }

  function addBoxToFrame(id) {
    const data = window.StudioCore.findElement(id);
    if (data) {
      if (!data.boxes) data.boxes = [];
      data.boxes.push({
        tag: 'TACTICAL PILLAR',
        tagColor: 'gold',
        title: 'Component Strategy',
        content: 'Add detailed methodology, deliverables, and protocols...'
      });
      window.StudioCore.reRenderElement(id);
      window.StudioCore.triggerAutoSave();
    }
  }

  let currentBannerFrameId = null;

  function openCoverModal(id) {
    currentBannerFrameId = id;
    const data = window.StudioCore.findElement(id);
    const modal = document.getElementById('coverModal');
    const input = document.getElementById('coverUrlInput');
    const previewContainer = document.getElementById('coverPreviewContainer');
    const previewImg = document.getElementById('coverPreviewImg');
    const btnRemove = document.getElementById('btnRemoveCover');

    if (!modal) return;
    const existingUrl = data?.image || '';
    if (input) input.value = existingUrl;

    if (existingUrl && previewContainer && previewImg) {
      previewImg.src = existingUrl;
      previewContainer.style.display = 'block';
      if (btnRemove) btnRemove.style.display = 'inline-block';
    } else {
      if (previewContainer) previewContainer.style.display = 'none';
      if (btnRemove) btnRemove.style.display = 'none';
    }

    modal.style.display = 'flex';
  }

  function closeCoverModal() {
    const modal = document.getElementById('coverModal');
    if (modal) modal.style.display = 'none';
    currentBannerFrameId = null;
  }

  function pickPreset(url) {
    const input = document.getElementById('coverUrlInput');
    if (input) input.value = url;
    updateCoverPreview();
  }

  function updateCoverPreview() {
    const input = document.getElementById('coverUrlInput');
    const previewContainer = document.getElementById('coverPreviewContainer');
    const previewImg = document.getElementById('coverPreviewImg');
    const btnRemove = document.getElementById('btnRemoveCover');

    if (!input) return;
    const url = input.value.trim();
    if (url) {
      if (previewImg) previewImg.src = url;
      if (previewContainer) previewContainer.style.display = 'block';
      if (btnRemove) btnRemove.style.display = 'inline-block';
    } else {
      if (previewContainer) previewContainer.style.display = 'none';
      if (btnRemove) btnRemove.style.display = 'none';
    }
  }

  function applyCoverBanner() {
    if (!currentBannerFrameId) return;
    const input = document.getElementById('coverUrlInput');
    const url = input ? input.value.trim() : '';
    const data = window.StudioCore.findElement(currentBannerFrameId);
    if (data) {
      data.image = url;
      window.StudioCore.reRenderElement(currentBannerFrameId);
      window.StudioCore.triggerAutoSave();
      if (window.StudioCore.showToast) {
        window.StudioCore.showToast(url ? 'Frame cover banner updated' : 'Frame cover removed');
      }
    }
    closeCoverModal();
  }

  function removeCoverBanner() {
    if (!currentBannerFrameId) return;
    const data = window.StudioCore.findElement(currentBannerFrameId);
    if (data) {
      data.image = '';
      window.StudioCore.reRenderElement(currentBannerFrameId);
      window.StudioCore.triggerAutoSave();
      if (window.StudioCore.showToast) {
        window.StudioCore.showToast('Frame cover removed');
      }
    }
    closeCoverModal();
  }

  function setFrameBanner(id) {
    openCoverModal(id);
  }

  function startConnect(id) {
    const el = document.getElementById(id);
    if (!el || !window.ConnectorEngine) return;
    const port = el.querySelector('.port-right') || el.querySelector('.card-port');
    if (port) {
      window.ConnectorEngine.startDrawing(port);
    }
  }

  return {
    init,
    show,
    hide,
    updatePosition,
    setFont,
    setStickyColor,
    toggleTape,
    setPricingCurrency,
    togglePricingFeatured,
    setConnColor,
    setConnStyle,
    addBoxToFrame,
    setFrameBanner,
    openCoverModal,
    closeCoverModal,
    pickPreset,
    updateCoverPreview,
    applyCoverBanner,
    removeCoverBanner,
    startConnect
  };
})();
