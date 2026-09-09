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

    if (!data && window.StudioCore) {
      data = window.StudioCore.findElement(el.id) || window.StudioCore.findConnection(el.id) || {};
    }

    activeElement = el;
    activeData = data || {};

    inspectorEl.classList.add('active');
    renderControls(el, activeData);
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
    const inspWidth = inspectorEl.offsetWidth || 560;
    const halfWidth = inspWidth / 2;
    const minX = 74 + halfWidth + 12; // 74px left toolbar + half width + safety margin
    const maxX = window.innerWidth - halfWidth - 16;
    const rawCenter = rect.left + rect.width / 2;
    const centerX = Math.max(minX, Math.min(maxX, rawCenter));

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
    if (!data && window.StudioCore && el) {
      data = window.StudioCore.findElement(el.id) || window.StudioCore.findConnection(el.id) || {};
    }
    data = data || {};
    const type = data.type || (el && el.dataset ? el.dataset.type : '') || 'card';

    let html = '';

    // 1. Universal Typography & Sizing Group (for all non-connection cards)
    if (type !== 'connection') {
      const currentFont = data.fontFamily || 'sans';
      const sizeScale = (data.fontSizeScale || 'md').toUpperCase();

      html += `
        <div class="insp-group" title="Typography & Sizing">
          <select class="insp-select" aria-label="Typography Font Family" onchange="StudioInspector.setFont('${data.id}', this.value)" title="Typography Archetype">
            <option value="sans" ${currentFont === 'sans' ? 'selected' : ''}>Sans (Jakarta)</option>
            <option value="serif" ${currentFont === 'serif' ? 'selected' : ''}>Serif (Cormorant)</option>
            <option value="mono" ${currentFont === 'mono' ? 'selected' : ''}>Mono (Technical)</option>
            <option value="arabic" ${currentFont === 'arabic' ? 'selected' : ''}>Arabic (Tajawal)</option>
          </select>

          <button class="insp-btn" onclick="StudioInspector.stepFontSize('${data.id}', -1)" title="Smaller Text (A−)">A−</button>
          <span class="insp-size-pill" title="Current Size">${sizeScale}</span>
          <button class="insp-btn" onclick="StudioInspector.stepFontSize('${data.id}', 1)" title="Larger Text (A+)">A+</button>

          <button class="insp-btn ${data.isBold ? 'active' : ''}" onclick="StudioInspector.toggleBold('${data.id}')" title="Bold (B)"><strong>B</strong></button>
          <button class="insp-btn ${data.isItalic ? 'active' : ''}" onclick="StudioInspector.toggleItalic('${data.id}')" title="Italic (I)"><em>I</em></button>
          <button class="insp-btn ${data.textAlign ? 'active' : ''}" onclick="StudioInspector.cycleAlign('${data.id}')" title="Text Alignment">
            ${data.textAlign === 'center' ? '⫶' : data.textAlign === 'right' ? '≣' : '≡'}
          </button>
        </div>
        <div class="insp-divider" aria-hidden="true"></div>
      `;

      // 3. Universal Background & Card Color Palette (9 curated swatches + native color picker)
      const curBg = (data.bgColor || '').toLowerCase();
      html += `
        <div class="insp-group" title="Background & Fill Color">
          <div class="insp-swatch-row" role="radiogroup" aria-label="Background Color">
            <button type="button" class="insp-swatch swatch-white ${curBg === '#ffffff' ? 'active' : ''}" style="background:#ffffff" title="White / Alabaster" onclick="StudioInspector.setElementBgColor('${data.id}', '#ffffff')"></button>
            <button type="button" class="insp-swatch swatch-noir ${curBg === '#141210' || curBg === '#080706' ? 'active' : ''}" style="background:#141210" title="Obsidian Noir" onclick="StudioInspector.setElementBgColor('${data.id}', '#141210')"></button>
            <button type="button" class="insp-swatch swatch-gold ${curBg === '#faf5ee' || curBg === '#e2c799' ? 'active' : ''}" style="background:#FAF5EE; border-color:#C5A880" title="Champagne Gold" onclick="StudioInspector.setElementBgColor('${data.id}', '#FAF5EE')"></button>
            <button type="button" class="insp-swatch swatch-yellow ${curBg === '#fef08a' ? 'active' : ''}" style="background:#FEF08A" title="Canary Yellow" onclick="StudioInspector.setElementBgColor('${data.id}', '#FEF08A')"></button>
            <button type="button" class="insp-swatch swatch-rose ${curBg === '#fff1f2' || curBg === '#fecdd3' ? 'active' : ''}" style="background:#FFF1F2; border-color:#FDA4AF" title="Rose Silk" onclick="StudioInspector.setElementBgColor('${data.id}', '#FFF1F2')"></button>
            <button type="button" class="insp-swatch swatch-green ${curBg === '#ecfdf5' || curBg === '#bbf7d0' ? 'active' : ''}" style="background:#ECFDF5; border-color:#86EFAC" title="Sage Green" onclick="StudioInspector.setElementBgColor('${data.id}', '#ECFDF5')"></button>
            <button type="button" class="insp-swatch swatch-blue ${curBg === '#eff6ff' || curBg === '#bae6fd' ? 'active' : ''}" style="background:#EFF6FF; border-color:#93C5FD" title="Azure Blue" onclick="StudioInspector.setElementBgColor('${data.id}', '#EFF6FF')"></button>
            
            <label class="insp-color-input-label" title="Custom Hex Background Color">
              <input type="color" value="${data.bgColor || '#ffffff'}" oninput="StudioInspector.setElementBgColor('${data.id}', this.value)" onchange="StudioInspector.setElementBgColor('${data.id}', this.value)" class="insp-native-color-picker" />
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="m12 2 2 10-10 2"/></svg>
            </label>
          </div>
        </div>
        <div class="insp-divider" aria-hidden="true"></div>
      `;

      // 4. Universal Text Color Palette (6 curated swatches + native color picker)
      const curText = (data.textColor || '').toLowerCase();
      html += `
        <div class="insp-group" title="Text Color">
          <div class="insp-swatch-row" role="radiogroup" aria-label="Text Color">
            <span style="font-size:0.68rem; font-weight:800; color:var(--text-muted); margin-right:2px;">T:</span>
            <button type="button" class="insp-swatch ${curText === '#1a1715' || curText === '#080706' ? 'active' : ''}" style="background:#1A1715; border-color:#080706" title="Dark Ink" onclick="StudioInspector.setElementTextColor('${data.id}', '#1A1715')"></button>
            <button type="button" class="insp-swatch ${curText === '#ffffff' ? 'active' : ''}" style="background:#FFFFFF; border-color:#E8E2D8" title="White Text" onclick="StudioInspector.setElementTextColor('${data.id}', '#FFFFFF')"></button>
            <button type="button" class="insp-swatch ${curText === '#c5a880' ? 'active' : ''}" style="background:#C5A880; border-color:#8C6D3F" title="Gold Accent" onclick="StudioInspector.setElementTextColor('${data.id}', '#C5A880')"></button>
            <button type="button" class="insp-swatch ${curText === '#be123c' ? 'active' : ''}" style="background:#BE123C; border-color:#9F1239" title="Rose Red" onclick="StudioInspector.setElementTextColor('${data.id}', '#BE123C')"></button>
            <button type="button" class="insp-swatch ${curText === '#059669' ? 'active' : ''}" style="background:#059669; border-color:#047857" title="Emerald Green" onclick="StudioInspector.setElementTextColor('${data.id}', '#059669')"></button>
            <button type="button" class="insp-swatch ${curText === '#2563eb' ? 'active' : ''}" style="background:#2563EB; border-color:#1D4ED8" title="Cobalt Blue" onclick="StudioInspector.setElementTextColor('${data.id}', '#2563EB')"></button>
            
            <label class="insp-color-input-label" title="Custom Hex Text Color">
              <input type="color" value="${data.textColor || '#1A1715'}" oninput="StudioInspector.setElementTextColor('${data.id}', this.value)" onchange="StudioInspector.setElementTextColor('${data.id}', this.value)" class="insp-native-color-picker" />
              <span style="font-size:9px; font-weight:900; color:#fff;">T</span>
            </label>
          </div>
        </div>
        <div class="insp-divider" aria-hidden="true"></div>
      `;
    }

    // 5. Type-Specific Customization Controls
    if (type === 'sticky') {
      html += `
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
          <button class="insp-btn" onclick="StudioCore.addFormField('${data.id}', 'textarea')" title="Add Diagnostic Long Question">+ Question</button>
          <button class="insp-btn" onclick="StudioCore.addFormField('${data.id}', 'input')" title="Add Metric Input">+ Input</button>
        </div>
        <div class="insp-divider" aria-hidden="true"></div>
      `;
    } else if (type === 'shape') {
      const curShape = data.shapeType || 'rect';
      html += `
        <div class="insp-group">
          <select class="insp-select" aria-label="Shape Type" onchange="StudioInspector.setShapeType('${data.id}', this.value)" title="Change Shape Geometry">
            <option value="rect" ${curShape === 'rect' ? 'selected' : ''}>Rectangle</option>
            <option value="rounded-rect" ${curShape === 'rounded-rect' ? 'selected' : ''}>Rounded</option>
            <option value="circle" ${curShape === 'circle' ? 'selected' : ''}>Circle</option>
            <option value="diamond" ${curShape === 'diamond' ? 'selected' : ''}>Diamond</option>
            <option value="triangle" ${curShape === 'triangle' ? 'selected' : ''}>Triangle</option>
            <option value="arrow" ${curShape === 'arrow' ? 'selected' : ''}>Arrow</option>
            <option value="line" ${curShape === 'line' ? 'selected' : ''}>Line</option>
          </select>
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

    // 6. Common Global Actions: Duplicate & Delete
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
      data.fontFamily = font;
      if (window.ElementsFactory && window.ElementsFactory.applyElementStyles) {
        window.ElementsFactory.applyElementStyles(el, data);
      }
      window.StudioCore.triggerAutoSave();
      renderControls(el, data);
      updatePosition();
    }
  }

  function stepFontSize(id, delta) {
    const el = document.getElementById(id);
    const data = window.StudioCore.findElement(id);
    if (el && data) {
      const scales = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
      let curIdx = scales.indexOf(data.fontSizeScale || 'md');
      if (curIdx === -1) curIdx = 2;
      curIdx = Math.max(0, Math.min(scales.length - 1, curIdx + delta));
      data.fontSizeScale = scales[curIdx];
      if (window.ElementsFactory && window.ElementsFactory.applyElementStyles) {
        window.ElementsFactory.applyElementStyles(el, data);
      }
      window.StudioCore.triggerAutoSave();
      renderControls(el, data);
      updatePosition();
    }
  }

  function toggleBold(id) {
    const el = document.getElementById(id);
    const data = window.StudioCore.findElement(id);
    if (el && data) {
      data.isBold = !data.isBold;
      if (window.ElementsFactory && window.ElementsFactory.applyElementStyles) {
        window.ElementsFactory.applyElementStyles(el, data);
      }
      window.StudioCore.triggerAutoSave();
      renderControls(el, data);
      updatePosition();
    }
  }

  function toggleItalic(id) {
    const el = document.getElementById(id);
    const data = window.StudioCore.findElement(id);
    if (el && data) {
      data.isItalic = !data.isItalic;
      if (window.ElementsFactory && window.ElementsFactory.applyElementStyles) {
        window.ElementsFactory.applyElementStyles(el, data);
      }
      window.StudioCore.triggerAutoSave();
      renderControls(el, data);
      updatePosition();
    }
  }

  function cycleAlign(id) {
    const el = document.getElementById(id);
    const data = window.StudioCore.findElement(id);
    if (el && data) {
      const aligns = ['left', 'center', 'right'];
      let curIdx = aligns.indexOf(data.textAlign || 'left');
      curIdx = (curIdx + 1) % aligns.length;
      data.textAlign = aligns[curIdx];
      if (window.ElementsFactory && window.ElementsFactory.applyElementStyles) {
        window.ElementsFactory.applyElementStyles(el, data);
      }
      window.StudioCore.triggerAutoSave();
      renderControls(el, data);
      updatePosition();
    }
  }

  function setElementBgColor(id, hex) {
    const el = document.getElementById(id);
    const data = window.StudioCore.findElement(id);
    if (el && data) {
      data.bgColor = hex;
      if (data.type === 'sticky') data.color = 'custom';
      if (window.ElementsFactory && window.ElementsFactory.applyElementStyles) {
        window.ElementsFactory.applyElementStyles(el, data);
      }
      window.StudioCore.triggerAutoSave();
      renderControls(el, data);
      updatePosition();
    }
  }

  function setElementTextColor(id, hex) {
    const el = document.getElementById(id);
    const data = window.StudioCore.findElement(id);
    if (el && data) {
      data.textColor = hex;
      if (window.ElementsFactory && window.ElementsFactory.applyElementStyles) {
        window.ElementsFactory.applyElementStyles(el, data);
      }
      window.StudioCore.triggerAutoSave();
      renderControls(el, data);
      updatePosition();
    }
  }

  function setShapeType(id, shapeType) {
    const data = window.StudioCore.findElement(id);
    if (data) {
      data.shapeType = shapeType;
      window.StudioCore.reRenderElement(id);
      window.StudioCore.triggerAutoSave();
      const newEl = document.getElementById(id);
      if (newEl) renderControls(newEl, data);
      updatePosition();
    }
  }

  function setStickyColor(id, color) {
    setElementBgColor(id, color === 'yellow' ? '#FEF08A' : color === 'rose' ? '#FFF1F2' : color === 'blue' ? '#EFF6FF' : color === 'green' ? '#ECFDF5' : color === 'gold' ? '#FAF5EE' : '#141210');
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

  function handleDeviceCoverUpload(event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      if (window.StudioCore && window.StudioCore.showToast) {
        window.StudioCore.showToast('Please select a valid image file (PNG, JPG, WebP)', 'error');
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
      const dataUrl = e.target.result;
      const input = document.getElementById('coverUrlInput');
      if (input) input.value = dataUrl;
      updateCoverPreview();
      if (window.StudioCore && window.StudioCore.showToast) {
        window.StudioCore.showToast('Image loaded! Click "Apply Cover" to update frame.');
      }
    };
    reader.readAsDataURL(file);
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
    stepFontSize,
    toggleBold,
    toggleItalic,
    cycleAlign,
    setElementBgColor,
    setElementTextColor,
    setShapeType,
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
    handleDeviceCoverUpload,
    applyCoverBanner,
    removeCoverBanner,
    startConnect
  };
})();
