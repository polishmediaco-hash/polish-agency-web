/**
 * POLISH Board Studio — Elements Factory & Drag/Resize Interaction
 * Generates and manages authentic board elements matching polishmediaco.com/board.
 */

window.ElementsFactory = (function () {
  let isDraggingElement = false;
  let draggedEl = null;
  let dragOffset = { x: 0, y: 0 };

  let isResizing = false;
  let resizeEl = null;
  let resizeHandleType = null;
  let initialResize = { x: 0, y: 0, width: 0, height: 0, startMouseX: 0, startMouseY: 0 };

  function renderElement(data, container) {
    let el;
    switch (data.type) {
      case 'frame':
        el = createFrameDOM(data);
        break;
      case 'sticky':
        el = createStickyDOM(data);
        break;
      case 'shape':
        el = createShapeDOM(data);
        break;
      case 'text':
        el = createTextDOM(data);
        break;
      case 'pricing':
        el = createPricingDOM(data);
        break;
      case 'table':
        el = createTableDOM(data);
        break;
      case 'form':
        el = createFormDOM(data);
        break;
      case 'script':
        el = createScriptDOM(data);
        break;
      case 'metric':
        el = createMetricDOM(data);
        break;
      case 'callout':
        el = createCalloutDOM(data);
        break;
      case 'value-equation':
        el = createValueEquationDOM(data);
        break;
      case 'bonus-stack':
        el = createBonusStackDOM(data);
        break;
      case 'pipeline-node':
        el = createPipelineNodeDOM(data);
        break;
      case 'diagnostic-protocol':
        el = createDiagnosticProtocolDOM(data);
        break;
      case 'prescription':
        el = createPrescriptionDOM(data);
        break;
      case 'belief-triad':
        el = createBeliefTriadDOM(data);
        break;
      case 'cadence-timeline':
        el = createCadenceTimelineDOM(data);
        break;
      case 'sprint-swimlane':
        el = createSprintSwimlaneDOM(data);
        break;
      case 'voting-dots':
        el = createVotingDotsDOM(data);
        break;
      case 'ldj-matrix':
        el = createLdjMatrixDOM(data);
        break;
      case 'unbundling-tree':
        el = createUnbundlingTreeDOM(data);
        break;
      case 'flywheel-rings':
        el = createFlywheelRingsDOM(data);
        break;
      case 'capacity-indicator':
        el = createCapacityIndicatorDOM(data);
        break;
      case 'offer-name-generator':
        el = createOfferNameGeneratorDOM(data);
        break;
      case 'payment-architecture':
        el = createPaymentArchitectureDOM(data);
        break;
      case 'routine-step':
        el = createRoutineStepDOM(data);
        break;
      case 'olfactory-pyramid':
        el = createOlfactoryPyramidDOM(data);
        break;
      case 'ugc-brief':
        el = createUgcBriefDOM(data);
        break;
      case 'clinical-proof':
        el = createClinicalProofDOM(data);
        break;
      default:
        el = createFrameDOM(data);
    }

    el.classList.add('studio-element');
    applyElementStyles(el, data);
    container.appendChild(el);
    attachElementInteractions(el, data);
    return el;
  }

  function applyElementStyles(el, data) {
    if (!el || !data) return;

    // 1. Font Family
    if (data.fontFamily) {
      el.classList.remove('font-sans', 'font-serif', 'font-mono', 'font-arabic');
      el.classList.add(`font-${data.fontFamily}`);
      const fontMap = {
        sans: "'Plus Jakarta Sans', -apple-system, sans-serif",
        serif: "'Cormorant Garamond', Georgia, serif",
        mono: "'JetBrains Mono', monospace",
        arabic: "'Tajawal', sans-serif"
      };
      if (fontMap[data.fontFamily]) {
        el.style.setProperty('--card-font-family', fontMap[data.fontFamily]);
        el.querySelectorAll('*').forEach(c => {
          c.style.fontFamily = fontMap[data.fontFamily];
        });
      }
    }

    // 2. Font Size Scale
    if (data.fontSizeScale) {
      el.classList.remove('font-scale-xs', 'font-scale-sm', 'font-scale-md', 'font-scale-lg', 'font-scale-xl', 'font-scale-2xl');
      el.classList.add(`font-scale-${data.fontSizeScale}`);
    }

    // 3. Bold & Italic
    if (data.isBold) {
      el.classList.add('format-bold');
    } else {
      el.classList.remove('format-bold');
    }

    if (data.isItalic) {
      el.classList.add('format-italic');
    } else {
      el.classList.remove('format-italic');
    }

    // 4. Text Alignment
    if (data.textAlign) {
      el.classList.remove('align-left', 'align-center', 'align-right');
      el.classList.add(`align-${data.textAlign}`);
    }

    // 5. Background Color
    if (data.bgColor) {
      el.style.backgroundColor = data.bgColor;
      if (data.type === 'shape') {
        const svgFill = el.querySelector('.shape-svg [fill]');
        if (svgFill) svgFill.setAttribute('fill', data.bgColor);
      }
    }

    // 6. Text Color
    if (data.textColor) {
      el.style.color = data.textColor;
      el.querySelectorAll('h1, h2, h3, h4, p, span, div, th, td, input, textarea, .sticky-header, .sticky-content, .sticky-footer, .shape-content-text').forEach(child => {
        if (!child.classList.contains('box-tag') && !child.classList.contains('frame-number') && !child.classList.contains('frame-title-pill') && !child.classList.contains('field-badge') && !child.classList.contains('price-badge')) {
          child.style.color = data.textColor;
        }
      });
    }

    // 7. Border Color
    if (data.borderColor) {
      el.style.borderColor = data.borderColor;
      if (data.type === 'shape') {
        const svgStroke = el.querySelector('.shape-svg [stroke]');
        if (svgStroke) svgStroke.setAttribute('stroke', data.borderColor);
      }
    }
  }

  // 1. Board Frame DOM
  function createFrameDOM(data) {
    const frame = document.createElement('div');
    frame.id = data.id;
    frame.className = `board-frame ${data.fontFamily ? 'font-' + data.fontFamily : ''}`;
    frame.style.left = `${data.x}px`;
    frame.style.top = `${data.y}px`;
    frame.style.width = `${data.width || 620}px`;
    if (data.height) frame.style.minHeight = `${data.height}px`;
    frame.style.zIndex = data.zIndex || 10;
    frame.dataset.type = 'frame';

    let boxesHTML = '';
    if (data.boxes && Array.isArray(data.boxes)) {
      boxesHTML = data.boxes.map((b, i) => `
        <div class="content-box ${b.isWhite ? 'white' : ''}">
          <div class="box-header-row">
            <div class="box-tag tag-${b.tagColor || 'gold'}" contenteditable="true" data-field="box-tag-${i}">${b.tag || 'NOTE'}</div>
            <button class="box-remove-btn" title="Remove box" onclick="StudioCore.removeFrameBox('${data.id}', ${i})">✕</button>
          </div>
          <h4 contenteditable="true" data-field="box-title-${i}">${b.title || ''}</h4>
          <p contenteditable="true" data-field="box-content-${i}">${b.content || ''}</p>
        </div>
      `).join('');
    }

    const bannerHTML = data.image ? `<div class="frame-banner-image"><img src="${data.image}" alt="Banner" /></div>` : '';

    frame.innerHTML = `
      <div class="frame-drag-bar"></div>
      <div class="frame-badge-wrap">
        <span class="frame-number" contenteditable="true" data-field="frameNumber">${data.frameNumber || '01'}</span>
        ${data.titlePill ? `<span class="frame-title-pill" contenteditable="true" data-field="titlePill">${data.titlePill}</span>` : ''}
      </div>
      ${bannerHTML}
      <h2 class="frame-headline">
        <span contenteditable="true" data-field="headline">${data.headline || ''}</span>
        ${data.serifAccent ? `<span class="serif-accent" contenteditable="true" data-field="serifAccent"> ${data.serifAccent}</span>` : ''}
      </h2>
      ${data.description ? `<p class="frame-desc" contenteditable="true" data-field="description">${data.description}</p>` : ''}
      <div class="frame-boxes-wrap ${data.boxes && data.boxes.length >= 4 ? 'grid-2-col' : ''}">${boxesHTML}</div>
      <div class="frame-ctrl-bar" style="margin-top: 12px; display: flex; justify-content: flex-end;">
        <button class="table-btn" onclick="StudioCore.addFrameBox('${data.id}')">+ Box</button>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;

    return frame;
  }

  // 2. Sticky Note DOM
  function createStickyDOM(data) {
    const note = document.createElement('div');
    note.id = data.id;
    note.className = `sticky-note sticky-${data.color || 'yellow'} ${data.fontFamily ? 'font-' + data.fontFamily : ''}`;
    note.style.left = `${data.x}px`;
    note.style.top = `${data.y}px`;
    note.style.width = `${data.width || 280}px`;
    note.style.zIndex = data.zIndex || 20;
    note.style.transform = `rotate(${data.rotation || 0}deg)`;
    note.dataset.type = 'sticky';

    note.innerHTML = `
      ${data.hasTape !== false ? '<div class="sticky-tape"></div>' : ''}
      ${data.header ? `<div class="sticky-header" contenteditable="true" data-field="header">${data.header}</div>` : ''}
      <div class="sticky-content" contenteditable="true" data-field="content">${data.content || ''}</div>
      ${data.footer ? `<div class="sticky-footer" contenteditable="true" data-field="footer">${data.footer}</div>` : ''}

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
    `;

    return note;
  }

  // 2.5. Basic Shape DOM (Rect, Rounded, Circle, Diamond, Triangle, Arrow, Line)
  function createShapeDOM(data) {
    const shape = document.createElement('div');
    shape.id = data.id;
    const shapeType = data.shapeType || 'rect';
    shape.className = `studio-shape shape-${shapeType} ${data.fontFamily ? 'font-' + data.fontFamily : ''}`;
    shape.style.left = `${data.x}px`;
    shape.style.top = `${data.y}px`;
    shape.style.width = `${data.width || (shapeType === 'circle' ? 180 : (shapeType === 'diamond' ? 180 : 220))}px`;
    shape.style.height = `${data.height || (shapeType === 'circle' ? 180 : (shapeType === 'diamond' ? 180 : (shapeType === 'line' ? 40 : 140)))}px`;
    shape.style.zIndex = data.zIndex || 15;
    shape.dataset.type = 'shape';
    shape.dataset.shapeType = shapeType;

    const isDark = document.body.classList.contains('theme-dark');
    const defaultFill = isDark ? 'rgba(30, 26, 23, 0.7)' : 'rgba(255, 255, 255, 0.9)';
    const defaultStroke = isDark ? '#E2C799' : '#1A1715';

    const fill = data.fillColor || defaultFill;
    const stroke = data.strokeColor || defaultStroke;
    const strokeWidth = data.strokeWidth || 2;

    let svgGraphic = '';
    if (shapeType === 'circle') {
      svgGraphic = `<svg class="shape-svg" viewBox="0 0 100 100" preserveAspectRatio="none"><circle cx="50" cy="50" r="46" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/></svg>`;
    } else if (shapeType === 'diamond') {
      svgGraphic = `<svg class="shape-svg" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,5 95,50 50,95 5,50" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/></svg>`;
    } else if (shapeType === 'triangle') {
      svgGraphic = `<svg class="shape-svg" viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points="50,6 95,94 5,94" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/></svg>`;
    } else if (shapeType === 'rounded-rect') {
      svgGraphic = `<svg class="shape-svg" viewBox="0 0 100 100" preserveAspectRatio="none"><rect x="3" y="3" width="94" height="94" rx="16" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/></svg>`;
    } else if (shapeType === 'arrow') {
      svgGraphic = `<svg class="shape-svg" viewBox="0 0 100 60" preserveAspectRatio="none"><polygon points="4,20 62,20 62,6 96,30 62,54 62,40 4,40" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/></svg>`;
    } else if (shapeType === 'line') {
      svgGraphic = `<svg class="shape-svg" viewBox="0 0 100 20" preserveAspectRatio="none"><line x1="4" y1="10" x2="96" y2="10" stroke="${stroke}" stroke-width="${strokeWidth * 1.8}" stroke-linecap="round"/></svg>`;
    } else {
      svgGraphic = `<svg class="shape-svg" viewBox="0 0 100 100" preserveAspectRatio="none"><rect x="3" y="3" width="94" height="94" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/></svg>`;
    }

    shape.innerHTML = `
      ${svgGraphic}
      <div class="shape-content-text" contenteditable="true" data-field="text">${data.text || ''}</div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;

    return shape;
  }

  // 2.8. Standalone Floating Text DOM
  function createTextDOM(data) {
    const textEl = document.createElement('div');
    textEl.id = data.id;
    textEl.className = `floating-text-element ${data.fontFamily ? 'font-' + data.fontFamily : ''}`;
    textEl.style.left = `${data.x}px`;
    textEl.style.top = `${data.y}px`;
    if (data.width) textEl.style.width = `${data.width}px`;
    textEl.style.zIndex = data.zIndex || 22;
    textEl.dataset.type = 'text';

    const fontSize = data.fontSize || 22;
    const color = data.color || '';

    textEl.innerHTML = `
      <div class="floating-text-inner" contenteditable="true" data-field="text" style="font-size:${fontSize}px; ${color ? 'color:' + color : ''}">${data.text || ''}</div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handle -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
    `;

    return textEl;
  }

  // 3. High-Ticket Pricing Card DOM
  function createPricingDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `pricing-card ${data.isFeatured || data.featured ? 'featured' : ''} ${data.fontFamily ? 'font-' + data.fontFamily : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 320}px`;
    card.style.zIndex = data.zIndex || 15;
    card.dataset.type = 'pricing';

    let featuresHTML = (data.features || ['Deliverable feature 1', 'Deliverable feature 2', 'Deliverable feature 3'])
      .map((f, i) => `
        <li>
          <span class="feature-text" contenteditable="true" data-field="feature-${i}">${f}</span>
          <button class="feature-remove-btn" title="Remove deliverable" onclick="StudioCore.removePricingFeature('${data.id}', ${i})">✕</button>
        </li>
      `)
      .join('');

    card.innerHTML = `
      <div class="price-badge" contenteditable="true" data-field="badge">${data.badge || 'TIER OPTION'}</div>
      <div class="price-value-row">
        <span class="price-currency" contenteditable="true" data-field="currency">${data.currency || 'AED'}</span>
        <span class="price-figure" contenteditable="true" data-field="figure">${data.figure || '5,000'}</span>
      </div>
      <div class="price-period" contenteditable="true" data-field="period">${data.period || 'Monthly Retainer'}</div>
      <ul class="clean-list">${featuresHTML}</ul>
      <div class="pricing-ctrl-bar">
        <button class="pricing-add-btn" onclick="StudioCore.addPricingFeature('${data.id}')">+ Deliverable</button>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>
    `;

    return card;
  }

  // 4. Luxury Strategy Table DOM
  function createTableDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `table-card ${data.fontFamily ? 'font-' + data.fontFamily : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 560}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'table';

    const headers = data.headers || ['Strategic Phase', 'Target Output', 'Timeline & RoI'];
    const rows = data.rows || [
      ['01. Diagnostic Sprint', 'Friction Audit & Action Blueprint', 'Week 1–2'],
      ['02. Executive Advisory', 'Weekly Calibrations + Async Voice', 'Months 1–3'],
      ['03. Scale & Governance', 'Autonomous Team Protocols', 'Ongoing']
    ];

    let headersHTML = headers.map((h, i) => `<th contenteditable="true" data-field="table-header-${i}">${h}</th>`).join('');
    let rowsHTML = rows.map((r, ri) => `
      <tr>
        ${r.map((cell, ci) => `<td contenteditable="true" data-field="table-cell-${ri}-${ci}">${cell}</td>`).join('')}
      </tr>
    `).join('');

    card.innerHTML = `
      <div class="table-card-header">
        <span class="table-card-title" contenteditable="true" data-field="title">${data.title || 'Strategic Deliverables Matrix'}</span>
        <span class="table-card-badge" contenteditable="true" data-field="badge">${data.badge || 'EXECUTION PLAN'}</span>
      </div>
      <div class="luxury-table-wrapper">
        <table class="luxury-table">
          <thead><tr>${headersHTML}</tr></thead>
          <tbody>${rowsHTML}</tbody>
        </table>
      </div>
      <div class="table-ctrl-bar">
        <button class="table-btn" onclick="StudioCore.addTableRow('${data.id}')">+ Row</button>
        <button class="table-btn" onclick="StudioCore.removeTableRow('${data.id}')">− Row</button>
        <button class="table-btn" onclick="StudioCore.addTableCol('${data.id}')">+ Col</button>
        <button class="table-btn" onclick="StudioCore.removeTableCol('${data.id}')">− Col</button>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;

    return card;
  }

  // 5. Form & Diagnostic Worksheet Card DOM
  function createFormDOM(data) {
    const form = document.createElement('div');
    form.id = data.id;
    form.className = `form-field-card ${data.fontFamily ? 'font-' + data.fontFamily : ''}`;
    form.style.left = `${data.x}px`;
    form.style.top = `${data.y}px`;
    form.style.width = `${data.width || 460}px`;
    form.style.zIndex = data.zIndex || 12;
    form.dataset.type = 'form';

    // Normalize data.fields array
    if (!data.fields || !Array.isArray(data.fields) || data.fields.length === 0) {
      data.fields = [
        {
          id: 'field-1',
          type: 'textarea',
          label: data.label || '01. Diagnostic Friction Point',
          badge: data.badge || 'CALIBRATION',
          instructions: data.instructions || 'Describe the bottleneck in retention, conversion, or media CAC:',
          value: data.value || ''
        },
        {
          id: 'field-2',
          type: 'input',
          label: '02. Target 90-Day Revenue Benchmark (AED / $)',
          badge: 'METRIC',
          instructions: 'Current baseline vs target milestone:',
          value: ''
        }
      ];
    }

    const fieldsHTML = data.fields.map((f, idx) => `
      <div class="form-field-item">
        <div class="field-header">
          <span class="field-label" contenteditable="true" data-field="form-field-label-${idx}">${f.label || 'Diagnostic Question'}</span>
          <div class="field-actions">
            <span class="field-badge" contenteditable="true" data-field="form-field-badge-${idx}">${f.badge || (f.type === 'input' ? 'SHORT' : 'DEEP')}</span>
            <button class="field-remove-btn" title="Remove question" onclick="StudioCore.removeFormField('${data.id}', ${idx})">✕</button>
          </div>
        </div>
        <p class="field-instructions" contenteditable="true" data-field="form-field-hint-${idx}">${f.instructions || 'Client answers this during calibration:'}</p>
        ${f.type === 'input' 
          ? `<input type="text" class="field-input" placeholder="Type answer here..." value="${f.value || ''}" data-field-index="${idx}">`
          : `<textarea class="field-textarea" placeholder="Type diagnostic response here..." data-field-index="${idx}">${f.value || ''}</textarea>`
        }
      </div>
    `).join('');

    form.innerHTML = `
      <div class="form-card-header">
        <span class="form-card-title" contenteditable="true" data-field="title">${data.title || 'Brand Diagnostic Worksheet'}</span>
        <span class="form-card-badge" contenteditable="true" data-field="badge">${data.badge || 'INTAKE ENGINE'}</span>
      </div>
      <div class="form-card-desc" contenteditable="true" data-field="desc">${data.desc || 'High-ticket partnership intake & strategic diagnostic parameters.'}</div>
      <div class="form-fields-container">
        ${fieldsHTML}
      </div>
      <div class="form-ctrl-bar">
        <button class="form-add-btn" onclick="StudioCore.addFormField('${data.id}', 'textarea')">+ Question (Long)</button>
        <button class="form-add-btn" onclick="StudioCore.addFormField('${data.id}', 'input')">+ Input (Short)</button>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;

    return form;
  }

  // 6. Script Bubble DOM
  function createScriptDOM(data) {
    const bubble = document.createElement('div');
    bubble.id = data.id;
    bubble.className = `script-bubble ${data.fontFamily ? 'font-' + data.fontFamily : ''}`;
    bubble.style.left = `${data.x}px`;
    bubble.style.top = `${data.y}px`;
    bubble.style.width = `${data.width || 320}px`;
    bubble.style.zIndex = data.zIndex || 14;
    bubble.dataset.type = 'script';

    bubble.innerHTML = `
      <div contenteditable="true" data-field="content">${data.content || ''}</div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>
    `;

    return bubble;
  }

  // 7. Metric KPI Callout Card DOM
  function createMetricDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `metric-kpi-card ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 280}px`;
    card.style.zIndex = data.zIndex || 14;
    card.dataset.type = 'metric';

    card.innerHTML = `
      <div class="metric-card-header">
        <span class="metric-title" contenteditable="true" data-field="metric-title">${data.title || 'NORTH STAR METRIC'}</span>
        <span class="metric-badge ${data.deltaColor || 'tag-green'}" contenteditable="true" data-field="metric-badge">${data.badge || '+42% Lift'}</span>
      </div>
      <div class="metric-figure" contenteditable="true" data-field="metric-figure">${data.figure || '3.8x MER'}</div>
      <div class="metric-subtitle" contenteditable="true" data-field="metric-subtitle">${data.subtitle || 'Blended RoAS across Meta ASC & Spark Ads'}</div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  // 8. Section Chapter Callout Banner DOM
  function createCalloutDOM(data) {
    const banner = document.createElement('div');
    banner.id = data.id;
    banner.className = `chapter-callout-banner ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    banner.style.left = `${data.x}px`;
    banner.style.top = `${data.y}px`;
    banner.style.width = `${data.width || 680}px`;
    banner.style.zIndex = data.zIndex || 8;
    banner.dataset.type = 'callout';

    banner.innerHTML = `
      <div class="callout-roman" contenteditable="true" data-field="callout-roman">${data.roman || 'PHASE I'}</div>
      <div class="callout-content-wrap">
        <h3 class="callout-headline" contenteditable="true" data-field="callout-headline">${data.headline || 'System Architecture & Market Positioning'}</h3>
        <p class="callout-desc" contenteditable="true" data-field="callout-desc">${data.desc || 'Foundational client acquisition & category authority container.'}</p>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return banner;
  }

  // 9. Alex Hormozi: Value Equation Fraction DOM (with interactive calculator)
  function createValueEquationDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-value-equation ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 720}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'value-equation';

    const dOutcome = data.dreamOutcome || { title: 'Category Dominance & Dream Outcome', desc: 'Achieving the undisputed status as the authority brand in the luxury niche.' };
    const dLikelihood = data.likelihood || { title: 'Perceived Certainty of Success', desc: 'Proprietary laboratory proof mechanisms, guarantees, and verifiable case studies.' };
    const dTime = data.timeDelay || { title: 'Time Delay Compressed to Zero', desc: 'Instant 48-hour system onboarding and turnkey sprint deployment.' };
    const dEffort = data.effort || { title: 'Effort & Sacrifice Eliminated', desc: 'Done-For-You operational execution with dedicated sovereign advisory support.' };
    const calcId = data.id + '-calc';

    card.innerHTML = `
      <div class="ve-header">
        <div class="ve-tag-wrap">
          <span class="ve-badge-yellow">VALUE CALCULUS</span>
          <h3 class="ve-title" contenteditable="true" data-field="title">${data.title || 'The $100M Value Equation'}</h3>
        </div>
        <div class="ve-score-badge" contenteditable="true" data-field="scoreBadge">${data.scoreBadge || 'SCORE: 98.4 / 100'}</div>
      </div>

      <div class="ve-fraction-container">
        <!-- Numerator: Value Multipliers -->
        <div class="ve-row">
          <div class="ve-var-card ve-multiplier">
            <div class="ve-var-head">
              <span class="ve-var-name">01. Dream Outcome</span>
              <span class="ve-action-pill">↑ Maximize</span>
            </div>
            <h4 class="ve-var-title" contenteditable="true" data-field="do-title">${dOutcome.title}</h4>
            <p class="ve-var-desc" contenteditable="true" data-field="do-desc">${dOutcome.desc}</p>
          </div>
          <div class="ve-var-card ve-multiplier">
            <div class="ve-var-head">
              <span class="ve-var-name">02. Likelihood of Success</span>
              <span class="ve-action-pill">↑ Maximize</span>
            </div>
            <h4 class="ve-var-title" contenteditable="true" data-field="lk-title">${dLikelihood.title}</h4>
            <p class="ve-var-desc" contenteditable="true" data-field="lk-desc">${dLikelihood.desc}</p>
          </div>
        </div>

        <!-- Center Division Bar -->
        <div class="ve-divider-bar">
          <div class="ve-divider-line"></div>
          <div class="ve-divider-pill">÷ DIVIDED BY (REDUCERS)</div>
        </div>

        <!-- Denominator: Value Reducers -->
        <div class="ve-row">
          <div class="ve-var-card ve-reducer">
            <div class="ve-var-head">
              <span class="ve-var-name">03. Time Delay</span>
              <span class="ve-action-pill">↓ Minimize</span>
            </div>
            <h4 class="ve-var-title" contenteditable="true" data-field="td-title">${dTime.title}</h4>
            <p class="ve-var-desc" contenteditable="true" data-field="td-desc">${dTime.desc}</p>
          </div>
          <div class="ve-var-card ve-reducer">
            <div class="ve-var-head">
              <span class="ve-var-name">04. Effort & Sacrifice</span>
              <span class="ve-action-pill">↓ Minimize</span>
            </div>
            <h4 class="ve-var-title" contenteditable="true" data-field="ef-title">${dEffort.title}</h4>
            <p class="ve-var-desc" contenteditable="true" data-field="ef-desc">${dEffort.desc}</p>
          </div>
        </div>
      </div>

      <!-- LIVE CALCULATOR -->
      <div class="ve-calculator" id="${calcId}">
        <div class="ve-calc-header">
          <span class="ve-calc-label">LIVE VALUE CALCULATOR</span>
          <div class="ve-calc-result" id="${calcId}-result">∞ × VALUE</div>
        </div>
        <div class="ve-calc-sliders">
          <div class="ve-slider-row">
            <span class="ve-slider-label">Dream Outcome</span>
            <input type="range" class="ve-slider" id="${calcId}-d" min="1" max="10" value="9"
              oninput="(function(){ var d=document.getElementById('${calcId}-d').value, l=document.getElementById('${calcId}-l').value, t=document.getElementById('${calcId}-t').value, e=document.getElementById('${calcId}-e').value; var score=(d*l)/(t*e); document.getElementById('${calcId}-result').textContent = isFinite(score) ? score.toFixed(1)+'× VALUE' : '∞ × VALUE'; document.getElementById('${calcId}-d-val').textContent=d; })()" />
            <span class="ve-slider-val" id="${calcId}-d-val">9</span>
          </div>
          <div class="ve-slider-row">
            <span class="ve-slider-label">Likelihood</span>
            <input type="range" class="ve-slider" id="${calcId}-l" min="1" max="10" value="9"
              oninput="(function(){ var d=document.getElementById('${calcId}-d').value, l=document.getElementById('${calcId}-l').value, t=document.getElementById('${calcId}-t').value, e=document.getElementById('${calcId}-e').value; var score=(d*l)/(t*e); document.getElementById('${calcId}-result').textContent = isFinite(score) ? score.toFixed(1)+'× VALUE' : '∞ × VALUE'; document.getElementById('${calcId}-l-val').textContent=l; })()" />
            <span class="ve-slider-val" id="${calcId}-l-val">9</span>
          </div>
          <div class="ve-slider-row">
            <span class="ve-slider-label">Time Delay</span>
            <input type="range" class="ve-slider" id="${calcId}-t" min="1" max="10" value="1"
              oninput="(function(){ var d=document.getElementById('${calcId}-d').value, l=document.getElementById('${calcId}-l').value, t=document.getElementById('${calcId}-t').value, e=document.getElementById('${calcId}-e').value; var score=(d*l)/(t*e); document.getElementById('${calcId}-result').textContent = isFinite(score) ? score.toFixed(1)+'× VALUE' : '∞ × VALUE'; document.getElementById('${calcId}-t-val').textContent=t; })()" />
            <span class="ve-slider-val" id="${calcId}-t-val">1</span>
          </div>
          <div class="ve-slider-row">
            <span class="ve-slider-label">Effort</span>
            <input type="range" class="ve-slider" id="${calcId}-e" min="1" max="10" value="1"
              oninput="(function(){ var d=document.getElementById('${calcId}-d').value, l=document.getElementById('${calcId}-l').value, t=document.getElementById('${calcId}-t').value, e=document.getElementById('${calcId}-e').value; var score=(d*l)/(t*e); document.getElementById('${calcId}-result').textContent = isFinite(score) ? score.toFixed(1)+'× VALUE' : '∞ × VALUE'; document.getElementById('${calcId}-e-val').textContent=e; })()" />
            <span class="ve-slider-val" id="${calcId}-e-val">1</span>
          </div>
        </div>
        <p class="ve-calc-formula">V = (D × L) ÷ (T × E)</p>
      </div>

      <div class="ve-footer-law" contenteditable="true" data-field="footerLaw">
        ${data.footerLaw || 'Mathematical Law: When Denominator (Time × Effort) Approaches 0, Perceived Value Approaches Infinity.'}
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }


  // 10. Alex Hormozi: Trim & Stack Bonus Architecture DOM
  function createBonusStackDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-bonus-stack ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 460}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'bonus-stack';

    const items = data.items || [
      { title: 'Bonus 01: Turnkey SOP & Formula Database', desc: 'Pre-vetted Parisian laboratory formulation specs', strike: 'AED 8,500' },
      { title: 'Bonus 02: High-AOV Routine Funnel Blueprint', desc: 'Shopify architecture engineered for 3.4x MER', strike: 'AED 12,000' },
      { title: 'Bonus 03: 24/7 Sovereign Partner VIP Hotline', desc: 'Direct WhatsApp async access to senior strategist', strike: 'AED 15,000' }
    ];

    const itemsHTML = items.map((item, i) => `
      <div class="bs-item">
        <div class="bs-item-left">
          <h4 contenteditable="true" data-field="bs-title-${i}">${item.title}</h4>
          <p contenteditable="true" data-field="bs-desc-${i}">${item.desc}</p>
        </div>
        <div class="bs-item-right">
          <span class="bs-strike-price" contenteditable="true" data-field="bs-strike-${i}">${item.strike}</span>
          <span class="bs-free-pill">INCLUDED</span>
        </div>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="bs-header">
        <div>
          <span class="ve-badge-yellow">TRIM & STACK</span>
          <h3 style="margin: 6px 0 0 0; font-size: 1.2rem; font-weight: 800;" contenteditable="true" data-field="title">${data.title || 'Grand Slam Bonus Stack'}</h3>
        </div>
        <span style="font-family: var(--font-mono, monospace); font-size: 0.75rem; font-weight: 800; color: #16A34A;">3 BONUSES</span>
      </div>

      <div class="bs-items-list">${itemsHTML}</div>

      <div class="bs-summary-bar">
        <div class="bs-stack-total-row">
          <div class="bs-summary-val-title">Total Stack Value</div>
          <div class="bs-total-strike" contenteditable="true" data-field="totalValue">${data.totalValue || 'AED 35,500'}</div>
        </div>
        <div class="bs-divider-line"></div>
        <div class="bs-investment-row">
          <div class="bs-summary-val-title">Your Investment Today</div>
          <div class="bs-summary-val-num bs-inv-price" contenteditable="true" data-field="price">${data.price || 'AED 12,500 / mo'}</div>
        </div>
        <div class="bs-savings-pill">You save <span contenteditable="true" data-field="savings">${data.savings || 'AED 23,000'}</span> in perceived value</div>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  // 11. Liam Ottley: Modular AI Pipeline Node DOM
  function createPipelineNodeDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-pipeline-node ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 420}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'pipeline-node';

    const techPills = data.tech || ['Claude 3.5 Sonnet', 'Make.com', 'Supabase Vector'];
    const pillsHTML = techPills.map(t => `<span class="node-tech-chip">${t}</span>`).join('');

    const steps = data.steps || [
      'Webhook listener triggers on intake submission',
      'RAG embedding query against Parisian clinical trials',
      'JSON output structured into client strategy brief'
    ];
    const stepsHTML = steps.map((s, idx) => `
      <div class="node-step-item">
        <span class="node-step-num">0${idx + 1}</span>
        <span contenteditable="true" data-field="step-${idx}">${s}</span>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="node-header-row">
        <span class="node-id-badge" contenteditable="true" data-field="nodeId">${data.nodeId || 'NODE_01'}</span>
        <div class="node-status-pill">
          <span class="status-pulse-dot"></span>
          <span contenteditable="true" data-field="status">${data.status || 'ONLINE 200 OK'}</span>
        </div>
      </div>

      <h3 class="node-title" contenteditable="true" data-field="title">${data.title || 'Ingestion & Vector Synthesis Node'}</h3>
      <p class="node-desc" contenteditable="true" data-field="desc">${data.desc || 'Autonomous ingestion parsing founder ad metrics and formulation profile.'}</p>

      <div class="node-tech-pills">${pillsHTML}</div>
      <div class="node-steps-list">${stepsHTML}</div>

      <div class="node-telemetry-footer">
        <span contenteditable="true" data-field="latency">${data.latency || 'Latency: <140ms'}</span>
        <span contenteditable="true" data-field="compute">${data.compute || 'Cost: $0.0034 / run'}</span>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  // 12. Chris Bradley: Consultative Diagnostic Protocol DOM
  function createDiagnosticProtocolDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-diagnostic-protocol ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 680}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'diagnostic-protocol';

    const stages = data.stages || [
      { roman: 'STAGE I', title: 'Symptom Elicitation', desc: 'Identify visible pain: client complains of Meta CAC inflation and high single-purchase churn.' },
      { roman: 'STAGE II', title: 'Root Pathophysiology', desc: 'Diagnose systemic leak: lack of clinical authority assets and failure to package regimen routine bundles.' },
      { roman: 'STAGE III', title: 'Cost of Inaction Prognosis', desc: 'Compound impact: continuing current tactics burns AED 180,000 in wasted ad spend over 12 months.' },
      { roman: 'STAGE IV', title: 'Prescription of Care', desc: 'Prescribe 90-Day Sovereign Container: Parisian lab positioning, DTC regimen rebrand, and Meta ASC creative.' },
      { roman: 'STAGE V', title: 'The Silence Rule', desc: 'State fee with absolute certainty: AED 25,000 / mo quarterly retainer. Stop speaking and hold the frame.' }
    ];

    const stagesHTML = stages.map((st, idx) => `
      <div class="diag-stage-card">
        <div class="diag-stage-head">
          <span class="diag-roman">${st.roman}</span>
          <h4 class="diag-stage-title" contenteditable="true" data-field="stage-title-${idx}">${st.title}</h4>
        </div>
        <p class="diag-stage-desc" contenteditable="true" data-field="stage-desc-${idx}">${st.desc}</p>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="diag-header">
        <div class="diag-title-wrap">
          <span style="font-family: var(--font-mono, monospace); font-size: 0.70rem; color: #064E3B; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase;">DOCTOR-PATIENT FRAME</span>
          <h3 contenteditable="true" data-field="title">${data.title || 'Consultative Diagnostic & Prescription Protocol'}</h3>
        </div>
        <span class="diag-badge-gold">SAVILE ROW AUTHORITY</span>
      </div>

      <div class="diag-stages-wrap">${stagesHTML}</div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  // 13. Chris Bradley: Sovereign Advisory Prescription Sheet DOM (with guarantee type selector)
  function createPrescriptionDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-prescription ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 420}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'prescription';

    const guaranteeTexts = {
      unconditional: 'Contraindication: Full refund within 30 days, no questions asked.',
      conditional: 'Contraindication: Refund issued only upon verified completion of all assigned sprint deliverables.',
      performance: 'Contraindication: Investment returned if agreed KPIs are not reached by Day 90.',
      service: 'Contraindication: Free remediation sprint guaranteed if output quality falls below agreed specification.',
      anti: 'Contraindication: Zero refunds. You are committing to a sovereign transformation — not a trial.'
    };
    const gId = data.id + '-guarantee';

    card.innerHTML = `
      <div class="rx-watermark">Rx</div>
      <div class="rx-header">
        <span style="font-family: var(--font-mono, monospace); font-size: 0.68rem; font-weight: 800; color: #C9A84C; letter-spacing: 0.08em; text-transform: uppercase;">PRESCRIPTION OF CARE</span>
        <h3 class="rx-title" contenteditable="true" data-field="title">${data.title || 'Sovereign Advisory Retainer'}</h3>
      </div>

      <div class="rx-container-fee" contenteditable="true" data-field="fee">${data.fee || 'AED 25,000 / Month'}</div>
      <p style="font-size: 0.78rem; color: #666; margin: 0 0 1rem 0;" contenteditable="true" data-field="term">${data.term || 'Closed-Door 90-Day Container Commitment'}</p>

      <!-- GUARANTEE TYPE SELECTOR -->
      <div class="rx-guarantee-selector">
        <span class="rx-guarantee-label">GUARANTEE TYPE</span>
        <div class="rx-guarantee-group" id="${gId}-group">
          <button type="button" class="rx-gtag active" data-gtype="unconditional"
            onclick="(function(el){ el.closest('.rx-guarantee-group').querySelectorAll('.rx-gtag').forEach(b=>b.classList.remove('active')); el.classList.add('active'); var texts={unconditional:'${guaranteeTexts.unconditional}',conditional:'${guaranteeTexts.conditional}',performance:'${guaranteeTexts.performance}',service:'${guaranteeTexts.service}',anti:'${guaranteeTexts.anti}'}; var t=el.dataset.gtype; el.closest('.element-prescription').querySelector('.rx-contra-text').textContent=texts[t]||''; })(this)">Unconditional</button>
          <button type="button" class="rx-gtag" data-gtype="conditional"
            onclick="(function(el){ el.closest('.rx-guarantee-group').querySelectorAll('.rx-gtag').forEach(b=>b.classList.remove('active')); el.classList.add('active'); var texts={unconditional:'${guaranteeTexts.unconditional}',conditional:'${guaranteeTexts.conditional}',performance:'${guaranteeTexts.performance}',service:'${guaranteeTexts.service}',anti:'${guaranteeTexts.anti}'}; var t=el.dataset.gtype; el.closest('.element-prescription').querySelector('.rx-contra-text').textContent=texts[t]||''; })(this)">Conditional</button>
          <button type="button" class="rx-gtag" data-gtype="performance"
            onclick="(function(el){ el.closest('.rx-guarantee-group').querySelectorAll('.rx-gtag').forEach(b=>b.classList.remove('active')); el.classList.add('active'); var texts={unconditional:'${guaranteeTexts.unconditional}',conditional:'${guaranteeTexts.conditional}',performance:'${guaranteeTexts.performance}',service:'${guaranteeTexts.service}',anti:'${guaranteeTexts.anti}'}; var t=el.dataset.gtype; el.closest('.element-prescription').querySelector('.rx-contra-text').textContent=texts[t]||''; })(this)">Performance</button>
          <button type="button" class="rx-gtag" data-gtype="service"
            onclick="(function(el){ el.closest('.rx-guarantee-group').querySelectorAll('.rx-gtag').forEach(b=>b.classList.remove('active')); el.classList.add('active'); var texts={unconditional:'${guaranteeTexts.unconditional}',conditional:'${guaranteeTexts.conditional}',performance:'${guaranteeTexts.performance}',service:'${guaranteeTexts.service}',anti:'${guaranteeTexts.anti}'}; var t=el.dataset.gtype; el.closest('.element-prescription').querySelector('.rx-contra-text').textContent=texts[t]||''; })(this)">Service</button>
          <button type="button" class="rx-gtag" data-gtype="anti"
            onclick="(function(el){ el.closest('.rx-guarantee-group').querySelectorAll('.rx-gtag').forEach(b=>b.classList.remove('active')); el.classList.add('active'); var texts={unconditional:'${guaranteeTexts.unconditional}',conditional:'${guaranteeTexts.conditional}',performance:'${guaranteeTexts.performance}',service:'${guaranteeTexts.service}',anti:'${guaranteeTexts.anti}'}; var t=el.dataset.gtype; el.closest('.element-prescription').querySelector('.rx-contra-text').textContent=texts[t]||''; })(this)">Anti-Guarantee</button>
        </div>
      </div>

      <div class="rx-terms-list">
        <div class="rx-term-row">
          <span class="rx-term-bullet">§</span>
          <span contenteditable="true" data-field="term-1">${data.term1 || 'Bi-Weekly 1-on-1 Consultative Diagnostic & Growth Offsite'}</span>
        </div>
        <div class="rx-term-row">
          <span class="rx-term-bullet">§</span>
          <span contenteditable="true" data-field="term-2">${data.term2 || '24/7 Async Sovereign Partner WhatsApp Hotline'}</span>
        </div>
        <div class="rx-term-row">
          <span class="rx-term-bullet">§</span>
          <span contenteditable="true" data-field="term-3">${data.term3 || 'Creative Sandbox Teardowns & Multi-Touch Funnel Architecture'}</span>
        </div>
      </div>

      <div style="margin-top: 1.25rem; padding-top: 0.75rem; border-top: 1px dashed rgba(201, 168, 76, 0.4); font-size: 0.75rem; color: #DC2626; font-weight: 700;">
        <span class="rx-contra-text">${guaranteeTexts.unconditional}</span>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }



  // 14. Charlie Morgan: 3-Limiting-Beliefs Triad DOM
  function createBeliefTriadDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-belief-triad ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 760}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'belief-triad';

    card.innerHTML = `
      <div class="triad-header">
        <div>
          <span class="triad-badge-amber">ACQUISITION ENGINE</span>
          <h3 style="margin: 6px 0 0 0; font-size: 1.2rem; font-weight: 800; color: #FFF;" contenteditable="true" data-field="title">${data.title || 'The 3 Limiting Beliefs Triad'}</h3>
        </div>
        <span style="font-family: var(--font-mono, monospace); font-size: 0.72rem; color: #A3A3A3;">MORGAN CLOSING MATRIX</span>
      </div>

      <div class="triad-cols">
        <div class="triad-col-card active-focus">
          <div class="triad-col-tag">01. THE VEHICLE</div>
          <h4 class="triad-col-title" contenteditable="true" data-field="v-title">${data.vTitle || 'Agency Vehicle Reframe'}</h4>
          <p class="triad-col-body" contenteditable="true" data-field="v-body">${data.vBody || 'Shift prospect belief from "Generic marketing agencies burn cash on vanity ads" to "Scientific clinical accelerators multiply cash on first-purchase AOV."'}</p>
        </div>
        <div class="triad-col-card">
          <div class="triad-col-tag">02. INTERNAL ABILITY</div>
          <h4 class="triad-col-title" contenteditable="true" data-field="i-title">${data.iTitle || 'Margin & Bandwidth Reframe'}</h4>
          <p class="triad-col-body" contenteditable="true" data-field="i-body">${data.iBody || 'Shift belief from "Our team has no time or capacity to handle complex campaigns" to "Modular turnkey systems require zero internal staff overhead."'}</p>
        </div>
        <div class="triad-col-card">
          <div class="triad-col-tag">03. EXTERNAL MARKET</div>
          <h4 class="triad-col-title" contenteditable="true" data-field="e-title">${data.eTitle || 'Market Receptivity Reframe'}</h4>
          <p class="triad-col-body" contenteditable="true" data-field="e-body">${data.eBody || 'Shift belief from "High-net-worth beauty buyers are cutting spend" to "Affluent cosmetic consumers actively seek lab-certified formulation transparency."'}</p>
        </div>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  // 15. Charlie Morgan: 21-Day Cadence Timeline DOM
  function createCadenceTimelineDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-cadence-timeline ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 760}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'cadence-timeline';

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #262626; padding-bottom: 0.75rem;">
        <div>
          <span style="font-family: var(--font-mono, monospace); font-size: 0.70rem; color: #F59E0B; font-weight: 800; text-transform: uppercase;">OUTBOUND MATH</span>
          <h3 style="margin: 4px 0 0 0; font-size: 1.15rem; font-weight: 800; color: #FFF;" contenteditable="true" data-field="title">${data.title || '21-Day 8-Touch Outbound Machine'}</h3>
        </div>
        <span style="font-family: var(--font-mono, monospace); font-size: 0.75rem; color: #10B981; font-weight: 800;">4.5% REPLY TARGET</span>
      </div>

      <div class="cadence-steps-row">
        <div class="cadence-step-box">
          <div class="cadence-day-badge">DAY 01</div>
          <h4 class="cadence-step-name" contenteditable="true" data-field="s1-name">LinkedIn Pattern Interrupt</h4>
          <p class="cadence-step-detail" contenteditable="true" data-field="s1-detail">Soft personalized connection note identifying 1 specific ad leak.</p>
        </div>
        <div class="cadence-step-box">
          <div class="cadence-day-badge">DAY 03</div>
          <h4 class="cadence-step-name" contenteditable="true" data-field="s2-name">65-Word Loom Teardown</h4>
          <p class="cadence-step-detail" contenteditable="true" data-field="s2-detail">Direct email with 120-sec custom loom deconstructing their PDP checkout.</p>
        </div>
        <div class="cadence-step-box">
          <div class="cadence-day-badge">DAY 07</div>
          <h4 class="cadence-step-name" contenteditable="true" data-field="s3-name">LinkedIn Voice Note</h4>
          <p class="cadence-step-detail" contenteditable="true" data-field="s3-detail">High-status 20-sec voice message referencing the exact feedback.</p>
        </div>
        <div class="cadence-step-box">
          <div class="cadence-day-badge">DAY 14</div>
          <h4 class="cadence-step-name" contenteditable="true" data-field="s4-name">The Soft Breakup</h4>
          <p class="cadence-step-detail" contenteditable="true" data-field="s4-detail">Low-friction question: "Shall I close your file on this, or revisit next quarter?"</p>
        </div>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  // 16. AJ&Smart: 4-Day Design Sprint 2.0 Swimlane DOM
  function createSprintSwimlaneDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-sprint-swimlane ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 1200}px`;
    card.style.zIndex = data.zIndex || 10;
    card.dataset.type = 'sprint-swimlane';

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid rgba(124, 58, 237, 0.2); padding-bottom: 0.75rem;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="background: #7C3AED; color: #FFF; font-family: var(--font-mono, monospace); font-size: 0.72rem; font-weight: 800; padding: 4px 10px; border-radius: 6px;">DESIGN SPRINT 2.0</span>
          <h3 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #111;" contenteditable="true" data-field="title">${data.title || 'AJ&Smart 4-Day Strategy & Facilitation Sprint'}</h3>
        </div>
        <span style="font-family: var(--font-mono, monospace); font-size: 0.75rem; color: #7C3AED; font-weight: 800;">TOGETHER ALONE</span>
      </div>

      <div class="sprint-cols-wrap">
        <!-- Day 1 -->
        <div class="sprint-col">
          <div class="sprint-col-head">
            <span class="sprint-day-pill">DAY 01</span>
            <h4 class="sprint-col-title">Map & Sketch</h4>
          </div>
          <div class="sprint-item-card">
            <div class="sprint-item-title" contenteditable="true" data-field="d1-1-t">Expert Interviews</div>
            <div class="sprint-item-desc" contenteditable="true" data-field="d1-1-d">Silent HMW sticky note capture while grilling leadership.</div>
          </div>
          <div class="sprint-item-card">
            <div class="sprint-item-title" contenteditable="true" data-field="d1-2-t">Lightning Demos</div>
            <div class="sprint-item-desc" contenteditable="true" data-field="d1-2-d">Reviewing Swiss horology packaging for cosmetic dropper inspiration.</div>
          </div>
        </div>

        <!-- Day 2 -->
        <div class="sprint-col">
          <div class="sprint-col-head">
            <span class="sprint-day-pill">DAY 02</span>
            <h4 class="sprint-col-title">Decide & Storyboard</h4>
          </div>
          <div class="sprint-item-card">
            <div class="sprint-item-title" contenteditable="true" data-field="d2-1-t">Heatmap Dot Voting</div>
            <div class="sprint-item-desc" contenteditable="true" data-field="d2-1-d">Silent dot voting removes extrovert bias and reveals group alignment.</div>
          </div>
          <div class="sprint-item-card">
            <div class="sprint-item-title" contenteditable="true" data-field="d2-2-t">The Sovereign Decider</div>
            <div class="sprint-item-desc" contenteditable="true" data-field="d2-2-d">Executive Decider locks the 8-step storyboard for rapid prototyping.</div>
          </div>
        </div>

        <!-- Day 3 -->
        <div class="sprint-col">
          <div class="sprint-col-head">
            <span class="sprint-day-pill">DAY 03</span>
            <h4 class="sprint-col-title">Prototype</h4>
          </div>
          <div class="sprint-item-card">
            <div class="sprint-item-title" contenteditable="true" data-field="d3-1-t">Goldilocks Asset</div>
            <div class="sprint-item-desc" contenteditable="true" data-field="d3-1-d">High-fidelity interactive Shopify PDP with 3D frosted glass dropper.</div>
          </div>
          <div class="sprint-item-card">
            <div class="sprint-item-title" contenteditable="true" data-field="d3-2-t">Trial Scripting</div>
            <div class="sprint-item-desc" contenteditable="true" data-field="d3-2-d">Neutral user interview protocol isolating price resistance.</div>
          </div>
        </div>

        <!-- Day 4 -->
        <div class="sprint-col">
          <div class="sprint-col-head">
            <span class="sprint-day-pill">DAY 04</span>
            <h4 class="sprint-col-title">Test & Learn</h4>
          </div>
          <div class="sprint-item-card">
            <div class="sprint-item-title" contenteditable="true" data-field="d4-1-t">5 User Interviews</div>
            <div class="sprint-item-desc" contenteditable="true" data-field="d4-1-d">Testing with 5 verified luxury cosmetic buyers reveals 85% of usability flaws.</div>
          </div>
          <div class="sprint-item-card">
            <div class="sprint-item-title" contenteditable="true" data-field="d4-2-t">Synthesis Matrix</div>
            <div class="sprint-item-desc" contenteditable="true" data-field="d4-2-d">Locking product roadmap based on qualitative customer patterns.</div>
          </div>
        </div>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  // 17. AJ&Smart: Heatmap Voting Dot Stickers DOM
  function createVotingDotsDOM(data) {
    const cluster = document.createElement('div');
    cluster.id = data.id;
    cluster.className = `element-voting-dots ${data.isLocked ? 'is-locked' : ''}`;
    cluster.style.left = `${data.x}px`;
    cluster.style.top = `${data.y}px`;
    cluster.style.zIndex = data.zIndex || 50;
    cluster.dataset.type = 'voting-dots';

    const dots = data.dots || [
      { color: 'dot-violet', text: 'JS' },
      { color: 'dot-mint', text: 'AK' },
      { color: 'dot-gold', text: 'MH' },
      { color: 'dot-rose', text: 'EL' }
    ];

    cluster.innerHTML = dots.map(d => `<div class="voting-dot ${d.color}">${d.text}</div>`).join('');
    return cluster;
  }

  // 18. AJ&Smart: 2x2 LDJ Impact vs Effort Matrix DOM
  function createLdjMatrixDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-ldj-matrix ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 620}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'ldj-matrix';

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid rgba(124, 58, 237, 0.2); padding-bottom: 0.75rem;">
        <div>
          <span style="font-family: var(--font-mono, monospace); font-size: 0.70rem; color: #7C3AED; font-weight: 800; text-transform: uppercase;">LDJ PRIORITIZATION</span>
          <h3 style="margin: 4px 0 0 0; font-size: 1.15rem; font-weight: 800; color: #111;" contenteditable="true" data-field="title">${data.title || 'Impact vs. Effort Matrix'}</h3>
        </div>
        <span style="font-family: var(--font-mono, monospace); font-size: 0.72rem; color: #10B981; font-weight: 800;">SWEET SPOT: Q1</span>
      </div>

      <div class="ldj-grid">
        <div class="ldj-quadrant ldj-q1">
          <div class="ldj-quadrant-tag">Q1 • HIGH IMPACT / LOW EFFORT</div>
          <h4 class="ldj-quadrant-title" contenteditable="true" data-field="q1-t">Quick Wins (Execute Immediately)</h4>
          <p class="ldj-quadrant-desc" contenteditable="true" data-field="q1-d">Add peptide clinical trial badge to above-the-fold hero and checkout.</p>
        </div>
        <div class="ldj-quadrant ldj-q2">
          <div class="ldj-quadrant-tag">Q2 • HIGH IMPACT / HIGH EFFORT</div>
          <h4 class="ldj-quadrant-title" contenteditable="true" data-field="q2-t">Major Projects (Sprint Candidate)</h4>
          <p class="ldj-quadrant-desc" contenteditable="true" data-field="q2-d">Custom 3D unboxing ritual video and interactive skin barrier diagnostic app.</p>
        </div>
        <div class="ldj-quadrant ldj-q3">
          <div class="ldj-quadrant-tag">Q3 • LOW IMPACT / LOW EFFORT</div>
          <h4 class="ldj-quadrant-title" contenteditable="true" data-field="q3-t">Fill-Ins (When Time Permits)</h4>
          <p class="ldj-quadrant-desc" contenteditable="true" data-field="q3-d">Updating footer copyright and secondary terms of service copy.</p>
        </div>
        <div class="ldj-quadrant ldj-q4">
          <div class="ldj-quadrant-tag">Q4 • LOW IMPACT / HIGH EFFORT</div>
          <h4 class="ldj-quadrant-title" contenteditable="true" data-field="q4-t">Thankless Tasks (Kill Immediately)</h4>
          <p class="ldj-quadrant-desc" contenteditable="true" data-field="q4-d">Custom native mobile iOS app for single-product brand.</p>
        </div>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  // 19. Greg Isenberg: Subreddit Unbundling Tree DOM
  function createUnbundlingTreeDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-unbundling-tree ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 600}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'unbundling-tree';

    card.innerHTML = `
      <div class="unbundle-head">
        <div>
          <span style="font-family: var(--font-mono, monospace); font-size: 0.70rem; color: #C2410C; font-weight: 800; text-transform: uppercase;">PLATFORM UNBUNDLING</span>
          <h3 style="margin: 4px 0 0 0; font-size: 1.2rem; font-weight: 800; color: #1C1917;" contenteditable="true" data-field="title">${data.title || 'Digital Watering Hole Unbundling'}</h3>
        </div>
        <span class="unbundle-reddit-pill" contenteditable="true" data-field="communityPill">${data.communityPill || 'r/30PlusSkinCare • 2.4M'}</span>
      </div>

      <div class="unbundle-card-body">
        <div class="unbundle-pain-tag">CORE UNRESOLVED FRUSTRATION</div>
        <h4 style="margin: 4px 0 6px 0; font-size: 0.95rem; font-weight: 800; color: #111;" contenteditable="true" data-field="painTitle">Barrier Damage & Retinol Irritation</h4>
        <p class="unbundle-solution-desc" contenteditable="true" data-field="painDesc">2,400+ monthly comments lamenting flaking, redness, and conflicting dermatologist routines without guidance.</p>
      </div>

      <div class="unbundle-card-body" style="border-left: 4px solid #C2410C;">
        <div class="unbundle-pain-tag" style="color: #10B981;">THE UNBUNDLED LUXURY SOLUTION</div>
        <h4 class="unbundle-solution-title" contenteditable="true" data-field="solTitle">Personalized Peptide Regimen Concierge</h4>
        <p class="unbundle-solution-desc" contenteditable="true" data-field="solDesc">Direct-to-consumer auto-replenishment box paired with private aesthetician WhatsApp concierge ($120 / month).</p>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  // 20. Greg Isenberg: 3-Tier Concentric Flywheel DOM
  function createFlywheelRingsDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-flywheel-rings ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 560}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'flywheel-rings';

    card.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid rgba(139, 92, 246, 0.2); padding-bottom: 0.75rem;">
        <div>
          <span style="font-family: var(--font-mono, monospace); font-size: 0.70rem; color: #8B5CF6; font-weight: 800; text-transform: uppercase;">ACP FRAMEWORK</span>
          <h3 style="margin: 4px 0 0 0; font-size: 1.2rem; font-weight: 800; color: #1C1917;" contenteditable="true" data-field="title">${data.title || 'Audience → Community → Product'}</h3>
        </div>
        <span style="font-family: var(--font-mono, monospace); font-size: 0.72rem; color: #8B5CF6; font-weight: 800;">ZERO-CAC FLYWHEEL</span>
      </div>

      <div class="flywheel-rings-wrap">
        <div class="flywheel-tier flywheel-tier-1">
          <div class="flywheel-tier-tag">OUTER RING • AUDIENCE (TOFU)</div>
          <h4 class="flywheel-tier-title" contenteditable="true" data-field="t1-t">Clinical Cosmetic Chemistry Substack & YouTube</h4>
          <p class="flywheel-tier-desc" contenteditable="true" data-field="t1-d">Educational deep dives on formulation biochemistry attracting 35,000 discerning founders and beauty patrons.</p>
        </div>
        <div class="flywheel-tier flywheel-tier-2">
          <div class="flywheel-tier-tag">MIDDLE RING • COMMUNITY (MOFU)</div>
          <h4 class="flywheel-tier-title" contenteditable="true" data-field="t2-t">Application-Only Vanity Atelier VIP WhatsApp</h4>
          <p class="flywheel-tier-desc" contenteditable="true" data-field="t2-d">Curated 500-member private circle who review formulation prototypes, test droppers, and become organic brand evangelists.</p>
        </div>
        <div class="flywheel-tier flywheel-tier-3">
          <div class="flywheel-tier-tag">INNER CORE • PRODUCT (BOFU)</div>
          <h4 class="flywheel-tier-title" contenteditable="true" data-field="t3-t">Co-Created Micro-Batch Drops & Retainers</h4>
          <p class="flywheel-tier-desc" contenteditable="true" data-field="t3-d">Limited Parisian peptide drops that sell out in 6 hours with $0 upfront ad spend due to owned community distribution.</p>
        </div>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }


  // Element Event Listeners: Select, Drag, Resize, Edit Sync
  function attachElementInteractions(el, data) {
    if (data.isLocked) {
      el.classList.add('is-locked');
    }

    // Select Element on Click
    el.addEventListener('pointerdown', (e) => {
      // Check if clicking a port
      if (e.target.classList.contains('card-port')) {
        if (window.ConnectorEngine) {
          window.ConnectorEngine.startDrawing(e.target);
        }
        e.stopPropagation();
        return;
      }

      // In presentation mode, intercept pointer events:
      if (window.StudioPresentation && window.StudioPresentation.isPresenting && window.StudioPresentation.isPresenting()) {
        if (window.StudioPresentation.isLaserActive && window.StudioPresentation.isLaserActive()) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (window.StudioPresentation.findStepIndexByElement) {
          const stepIdx = window.StudioPresentation.findStepIndexByElement(el);
          if (stepIdx !== -1) {
            window.StudioPresentation.goToStep(stepIdx);
          }
        }
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      // When drawing mode (pen / laser) is active, do not intercept pointerdown so drawing engine draws seamlessly
      if (window.CanvasEngine) {
        const tool = window.CanvasEngine.getTool();
        if (tool === 'pen' || tool === 'laser') {
          return;
        }
      }

      // Always select element on pointerdown
      if (window.StudioCore) {
        window.StudioCore.selectElement(el, data);
      }

      // If locked, disallow dragging and resizing
      if (data.isLocked) {
        return;
      }

      // Don't drag if clicking inside buttons, inputs, textareas, selects, or editable text
      if (
        e.target.isContentEditable ||
        e.target.closest('button, input, textarea, select, option, a, [contenteditable="true"]')
      ) {
        return;
      }

      // Check if clicking resize handle
      if (e.target.classList.contains('resize-handle')) {
        isResizing = true;
        resizeEl = el;
        resizeHandleType = e.target.dataset.handle;
        const scale = window.CanvasEngine ? window.CanvasEngine.getScale() : 1;
        initialResize = {
          x: parseFloat(el.style.left) || 0,
          y: parseFloat(el.style.top) || 0,
          width: el.offsetWidth,
          height: el.offsetHeight,
          startMouseX: e.clientX,
          startMouseY: e.clientY
        };
        try { e.target.setPointerCapture(e.pointerId); } catch (_) {}
        e.stopPropagation();
        return;
      }

      isDraggingElement = true;
      draggedEl = el;
      const scale = window.CanvasEngine ? window.CanvasEngine.getScale() : 1;
      const canvasPos = window.CanvasEngine.screenToCanvas(e.clientX, e.clientY);

      dragOffset.x = canvasPos.x - (parseFloat(el.style.left) || 0);
      dragOffset.y = canvasPos.y - (parseFloat(el.style.top) || 0);

      try { el.setPointerCapture(e.pointerId); } catch (_) {}
      e.stopPropagation();
    });

    el.addEventListener('pointermove', (e) => {
      if (isResizing && resizeEl === el) {
        const scale = window.CanvasEngine ? window.CanvasEngine.getScale() : 1;
        const deltaX = (e.clientX - initialResize.startMouseX) / scale;
        const deltaY = (e.clientY - initialResize.startMouseY) / scale;

        if (resizeHandleType === 'se') {
          const newW = Math.max(340, initialResize.width + deltaX);
          const newH = Math.max(220, initialResize.height + deltaY);
          el.style.width = `${newW}px`;
          el.style.minHeight = `${newH}px`;
          data.width = newW;
          data.height = newH;
        }

        if (window.StudioEvents) {
          window.StudioEvents.emit(window.StudioEvents.Events.ELEMENT_RESIZED, {
            id: el.id,
            el,
            width: data.width,
            height: data.height
          });
        }
        if (window.ConnectorEngine) {
          window.ConnectorEngine.updateConnectedLines(el.id);
        }
        if (window.StudioInspector) {
          window.StudioInspector.updatePosition(el);
        }
        return;
      }

      if (isDraggingElement && draggedEl === el) {
        const canvasPos = window.CanvasEngine.screenToCanvas(e.clientX, e.clientY);
        let newX = Math.round(canvasPos.x - dragOffset.x);
        let newY = Math.round(canvasPos.y - dragOffset.y);

        // Magnetic Grid Snap (20px) on Shift key or when enabled
        if (e.shiftKey || (window.StudioCore && window.StudioCore.isGridSnapEnabled && window.StudioCore.isGridSnapEnabled())) {
          newX = Math.round(newX / 20) * 20;
          newY = Math.round(newY / 20) * 20;
        }

        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
        data.x = newX;
        data.y = newY;

        if (window.StudioEvents) {
          window.StudioEvents.emit(window.StudioEvents.Events.ELEMENT_MOVED, {
            id: el.id,
            el,
            x: newX,
            y: newY
          });
        }
        if (window.ConnectorEngine) {
          window.ConnectorEngine.updateConnectedLines(el.id);
        }
        if (window.StudioInspector) {
          window.StudioInspector.updatePosition(el);
        }
      }
    });

    el.addEventListener('pointerup', (e) => {
      if (isDraggingElement) {
        isDraggingElement = false;
        draggedEl = null;
        try { el.releasePointerCapture(e.pointerId); } catch (_) {}
        if (window.StudioCore) window.StudioCore.triggerAutoSave();
      }
      if (isResizing) {
        isResizing = false;
        resizeEl = null;
        if (window.StudioCore) window.StudioCore.triggerAutoSave();
      }
    });

    // Content Editable changes sync
    el.addEventListener('input', (e) => {
      // Standard input and textarea elements inside cards (e.g. form card)
      if (e.target.dataset && e.target.dataset.fieldIndex !== undefined) {
        const idx = parseInt(e.target.dataset.fieldIndex, 10);
        if (data && data.fields && data.fields[idx]) {
          data.fields[idx].value = e.target.value;
          if (window.StudioCore) window.StudioCore.triggerAutoSave();
        }
        return;
      }

      if (e.target.isContentEditable) {
        const field = e.target.dataset.field;
        if (field && data) {
          if (field.startsWith('box-tag-')) {
            const idx = parseInt(field.replace('box-tag-', ''), 10);
            if (data.boxes && data.boxes[idx]) data.boxes[idx].tag = e.target.innerText;
          } else if (field.startsWith('box-title-')) {
            const idx = parseInt(field.replace('box-title-', ''), 10);
            if (data.boxes && data.boxes[idx]) data.boxes[idx].title = e.target.innerText;
          } else if (field.startsWith('box-content-')) {
            const idx = parseInt(field.replace('box-content-', ''), 10);
            if (data.boxes && data.boxes[idx]) data.boxes[idx].content = e.target.innerText;
          } else if (field.startsWith('table-header-')) {
            const idx = parseInt(field.replace('table-header-', ''), 10);
            if (data.headers) data.headers[idx] = e.target.innerText;
          } else if (field.startsWith('table-cell-')) {
            const parts = field.split('-');
            const ri = parseInt(parts[2], 10);
            const ci = parseInt(parts[3], 10);
            if (data.rows && data.rows[ri]) data.rows[ri][ci] = e.target.innerText;
          } else if (field.startsWith('feature-')) {
            const idx = parseInt(field.replace('feature-', ''), 10);
            if (data.features) data.features[idx] = e.target.innerText;
          } else if (field.startsWith('form-field-label-')) {
            const idx = parseInt(field.replace('form-field-label-', ''), 10);
            if (data.fields && data.fields[idx]) data.fields[idx].label = e.target.innerText;
          } else if (field.startsWith('form-field-badge-')) {
            const idx = parseInt(field.replace('form-field-badge-', ''), 10);
            if (data.fields && data.fields[idx]) data.fields[idx].badge = e.target.innerText;
          } else if (field.startsWith('form-field-hint-')) {
            const idx = parseInt(field.replace('form-field-hint-', ''), 10);
            if (data.fields && data.fields[idx]) data.fields[idx].instructions = e.target.innerText;
          } else if (field === 'metric-title') {
            data.title = e.target.innerText;
          } else if (field === 'metric-badge') {
            data.badge = e.target.innerText;
          } else if (field === 'metric-figure') {
            data.figure = e.target.innerText;
          } else if (field === 'metric-subtitle') {
            data.subtitle = e.target.innerText;
          } else if (field === 'callout-headline') {
            data.headline = e.target.innerText;
          } else if (field === 'callout-roman') {
            data.roman = e.target.innerText;
          } else if (field === 'callout-desc') {
            data.desc = e.target.innerText;
          } else {
            data[field] = e.target.innerText;
          }
          if (window.StudioCore) window.StudioCore.triggerAutoSave();
        }
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // LENS 7 — NEW OFFER ARCHITECTURE WIDGETS
  // ═══════════════════════════════════════════════════════════════

  // CAPACITY INDICATOR: Client slot fill visualization (scarcity)
  function createCapacityIndicatorDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-capacity-indicator ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 360}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'capacity-indicator';

    const total = parseInt(data.totalSlots || 3);
    const filled = parseInt(data.filledSlots || 2);
    const remaining = total - filled;
    const slotsHTML = Array.from({ length: total }, (_, i) =>
      `<div class="cap-slot ${i < filled ? 'cap-slot-filled' : 'cap-slot-empty'}"></div>`
    ).join('');

    card.innerHTML = `
      <div class="cap-header">
        <span class="cap-badge">CAPACITY</span>
        <h3 class="cap-title" contenteditable="true" data-field="title">${data.title || 'Atelier Client Roster'}</h3>
      </div>
      <div class="cap-slots-row" id="${data.id}-slots">${slotsHTML}</div>
      <div class="cap-status">
        <span class="cap-filled-count" contenteditable="true" data-field="filledSlots">${filled}</span>
        <span class="cap-of"> of </span>
        <span class="cap-total-count" contenteditable="true" data-field="totalSlots">${total}</span>
        <span class="cap-label-text"> client positions filled.</span>
      </div>
      <div class="cap-remaining ${remaining === 0 ? 'cap-closed' : ''}" contenteditable="true" data-field="remainingText">
        ${data.remainingText || (remaining > 0 ? `Accepting ${remaining} new engagement${remaining === 1 ? '' : 's'} this quarter.` : 'Roster closed. Join waitlist below.')}
      </div>
      <p class="cap-urgency" contenteditable="true" data-field="urgency">${data.urgency || 'Next opening: Q2 2025. Enquire to reserve.'}</p>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  // OFFER NAME GENERATOR: Formula-based live naming composer
  function createOfferNameGeneratorDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-offer-name-generator ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 480}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'offer-name-generator';
    const oid = data.id + '-ong';

    card.innerHTML = `
      <div class="ong-header">
        <span class="ong-badge">OFFER NAMING</span>
        <h3 class="ong-title">Offer Name Generator</h3>
      </div>
      <div class="ong-fields">
        <div class="ong-field-row">
          <label class="ong-label">ADJECTIVE</label>
          <input class="ong-input" id="${oid}-adj" type="text" value="${data.adjective || 'Sovereign'}" placeholder="Sovereign, Elite, Accelerated..."
            oninput="document.getElementById('${oid}-output').textContent = 'The ' + document.getElementById('${oid}-adj').value + ' ' + document.getElementById('${oid}-outcome').value + ' ' + document.getElementById('${oid}-vehicle').value + ' — A ' + document.getElementById('${oid}-duration').value + ' Program for ' + document.getElementById('${oid}-audience').value" />
        </div>
        <div class="ong-field-row">
          <label class="ong-label">OUTCOME</label>
          <input class="ong-input" id="${oid}-outcome" type="text" value="${data.outcome || 'Growth'}" placeholder="Growth, Acquisition, Scaling..."
            oninput="document.getElementById('${oid}-output').textContent = 'The ' + document.getElementById('${oid}-adj').value + ' ' + document.getElementById('${oid}-outcome').value + ' ' + document.getElementById('${oid}-vehicle').value + ' — A ' + document.getElementById('${oid}-duration').value + ' Program for ' + document.getElementById('${oid}-audience').value" />
        </div>
        <div class="ong-field-row">
          <label class="ong-label">DELIVERY VEHICLE</label>
          <input class="ong-input" id="${oid}-vehicle" type="text" value="${data.vehicle || 'Accelerator'}" placeholder="Accelerator, Retainer, Sprint..."
            oninput="document.getElementById('${oid}-output').textContent = 'The ' + document.getElementById('${oid}-adj').value + ' ' + document.getElementById('${oid}-outcome').value + ' ' + document.getElementById('${oid}-vehicle').value + ' — A ' + document.getElementById('${oid}-duration').value + ' Program for ' + document.getElementById('${oid}-audience').value" />
        </div>
        <div class="ong-field-row">
          <label class="ong-label">DURATION</label>
          <input class="ong-input" id="${oid}-duration" type="text" value="${data.duration || '90-Day'}" placeholder="90-Day, 6-Month, 12-Week..."
            oninput="document.getElementById('${oid}-output').textContent = 'The ' + document.getElementById('${oid}-adj').value + ' ' + document.getElementById('${oid}-outcome').value + ' ' + document.getElementById('${oid}-vehicle').value + ' — A ' + document.getElementById('${oid}-duration').value + ' Program for ' + document.getElementById('${oid}-audience').value" />
        </div>
        <div class="ong-field-row">
          <label class="ong-label">AUDIENCE</label>
          <input class="ong-input" id="${oid}-audience" type="text" value="${data.audience || 'Luxury Aesthetic Clinics'}" placeholder="Clinics, Founders, Brands..."
            oninput="document.getElementById('${oid}-output').textContent = 'The ' + document.getElementById('${oid}-adj').value + ' ' + document.getElementById('${oid}-outcome').value + ' ' + document.getElementById('${oid}-vehicle').value + ' — A ' + document.getElementById('${oid}-duration').value + ' Program for ' + document.getElementById('${oid}-audience').value" />
        </div>
      </div>
      <div class="ong-output-wrap">
        <span class="ong-output-label">GENERATED OFFER NAME</span>
        <div class="ong-output" id="${oid}-output">The Sovereign Growth Accelerator — A 90-Day Program for Luxury Aesthetic Clinics</div>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  // PAYMENT ARCHITECTURE: 3-column payment comparison card
  function createPaymentArchitectureDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-payment-architecture ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 760}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'payment-architecture';

    const cols = data.columns || [
      {
        name: 'Upfront Full Pay',
        total: 'AED 75,000',
        cashflow: 'Single payment, Day 1',
        psychology: 'Maximum client commitment. Eliminates monthly friction. Best for transformation containers.',
        bestFor: 'High-trust, high-ticket close',
        badge: 'BEST VALUE',
        highlight: true
      },
      {
        name: 'Monthly Retainer',
        total: 'AED 25,000 / mo',
        cashflow: 'Rolling 3-month minimum',
        psychology: 'Lower barrier to entry. Increases churn risk. Price perceived as "subscription".',
        bestFor: 'Ongoing advisory relationships',
        badge: '',
        highlight: false
      },
      {
        name: 'Milestone-Based',
        total: 'AED 25,000 × 3 milestones',
        cashflow: 'On delivery of each phase',
        psychology: 'Aligns payment to progress. Reduces buyer anxiety. Requires clear deliverable gates.',
        bestFor: 'Project-based engagements',
        badge: '',
        highlight: false
      }
    ];

    const colsHTML = cols.map((col, i) => `
      <div class="pa-col ${col.highlight ? 'pa-col-highlight' : ''}">
        ${col.badge ? `<div class="pa-col-badge">${col.badge}</div>` : ''}
        <div class="pa-col-name" contenteditable="true" data-field="pa-col-${i}-name">${col.name}</div>
        <div class="pa-col-total" contenteditable="true" data-field="pa-col-${i}-total">${col.total}</div>
        <div class="pa-col-divider"></div>
        <div class="pa-col-row">
          <span class="pa-col-row-label">CASH FLOW</span>
          <span class="pa-col-row-val" contenteditable="true" data-field="pa-col-${i}-cashflow">${col.cashflow}</span>
        </div>
        <div class="pa-col-row">
          <span class="pa-col-row-label">PSYCHOLOGY</span>
          <span class="pa-col-row-val" contenteditable="true" data-field="pa-col-${i}-psychology">${col.psychology}</span>
        </div>
        <div class="pa-col-row pa-col-bestfor">
          <span class="pa-col-row-label">BEST FOR</span>
          <span class="pa-col-row-val" contenteditable="true" data-field="pa-col-${i}-bestfor">${col.bestFor}</span>
        </div>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="pa-header">
        <span class="pa-badge">PAYMENT ARCHITECTURE</span>
        <h3 class="pa-title" contenteditable="true" data-field="title">${data.title || 'Investment Structure Comparison'}</h3>
      </div>
      <div class="pa-columns">${colsHTML}</div>
      <p class="pa-footnote" contenteditable="true" data-field="footnote">${data.footnote || 'All structures access the same full scope of advisory. Investment architecture is a strategic choice, not a service tier.'}</p>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  // 26. POLISH Cosmetic: 4-Step Skincare Routine Step DOM
  function createRoutineStepDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-routine-step ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 420}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'routine-step';

    card.innerHTML = `
      <div class="crs-header">
        <div class="crs-badge-row">
          <span class="crs-step-badge" contenteditable="true" data-field="stepBadge">${data.stepBadge || 'STEP 01 • PREPARE'}</span>
          <span class="crs-time-badge" contenteditable="true" data-field="timeBadge">${data.timeBadge || 'AM & PM DAILY'}</span>
        </div>
        <h3 class="crs-title" contenteditable="true" data-field="title">${data.title || 'Botanical Acid Mantle Cleanser'}</h3>
        <p class="crs-subtitle" contenteditable="true" data-field="subtitle">${data.subtitle || 'pH 5.2 Micro-Gel Formulation'}</p>
      </div>

      <div class="crs-body">
        <div class="crs-actives-card">
          <span class="crs-field-label">KEY BIO-ACTIVES</span>
          <div class="crs-actives-text" contenteditable="true" data-field="actives">${data.actives || '• 2% Salicylic Acid (Liposomal Encapsulated)\n• Centella Asiatica & Madecassoside\n• Camellia Sinensis Ferment Extract'}</div>
        </div>

        <div class="crs-benefit-row">
          <div class="crs-benefit-col">
            <span class="crs-field-label">TARGET ACTION</span>
            <div class="crs-benefit-val" contenteditable="true" data-field="target">${data.target || 'Pore Decongestion & Barrier Prep'}</div>
          </div>
          <div class="crs-benefit-col">
            <span class="crs-field-label">ROUTINE AOV LIFT</span>
            <div class="crs-benefit-val highlight-gold" contenteditable="true" data-field="aovLift">${data.aovLift || '+$42 (Bundled: 3.4x CVR)'}</div>
          </div>
        </div>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  // 27. POLISH Cosmetic: Haute Parfumerie Olfactory Pyramid DOM
  function createOlfactoryPyramidDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-olfactory-pyramid ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 480}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'olfactory-pyramid';

    card.innerHTML = `
      <div class="op-header">
        <div class="op-tag-row">
          <span class="op-badge-gold">HAUTE PARFUMERIE</span>
          <span class="op-type-badge" contenteditable="true" data-field="concentration">${data.concentration || 'EXTRAIT DE PARFUM (30% CONCENTRATION)'}</span>
        </div>
        <h3 class="op-title" contenteditable="true" data-field="title">${data.title || 'Oud Saphir Royale'}</h3>
        <p class="op-tagline" contenteditable="true" data-field="tagline">${data.tagline || 'Sensual Amber, Velvety Damascus Rose & Smoked Oud'}</p>
      </div>

      <div class="op-tiers-stack">
        <!-- Top Tier -->
        <div class="op-tier op-tier-top">
          <div class="op-tier-meta">
            <span class="op-tier-name">01. HEAD NOTES</span>
            <span class="op-tier-time">0 — 20 MIN</span>
          </div>
          <div class="op-tier-notes" contenteditable="true" data-field="topNotes">${data.topNotes || 'Italian Bergamot, Pink Peppercorn, Wild Saffron'}</div>
        </div>

        <!-- Heart Tier -->
        <div class="op-tier op-tier-heart">
          <div class="op-tier-meta">
            <span class="op-tier-name">02. HEART NOTES</span>
            <span class="op-tier-time">20 MIN — 4 HOURS</span>
          </div>
          <div class="op-tier-notes" contenteditable="true" data-field="heartNotes">${data.heartNotes || 'Damascus Rose Absolute, Orris Butter, Cardamom Pods'}</div>
        </div>

        <!-- Base Tier -->
        <div class="op-tier op-tier-base">
          <div class="op-tier-meta">
            <span class="op-tier-name">03. BASE NOTES</span>
            <span class="op-tier-time">4 HOURS — 24+ HOURS</span>
          </div>
          <div class="op-tier-notes" contenteditable="true" data-field="baseNotes">${data.baseNotes || 'Cambodian Agarwood (Oud), Ambergris, Bourbon Vanilla'}</div>
        </div>
      </div>

      <div class="op-metrics-footer">
        <div class="op-footer-stat">
          <span class="op-stat-label">LONGEVITY</span>
          <span class="op-stat-val" contenteditable="true" data-field="longevity">${data.longevity || '16+ Hours Sillage'}</span>
        </div>
        <div class="op-footer-stat">
          <span class="op-stat-label">DISCOVERY VOUCHER</span>
          <span class="op-stat-val highlight-gold" contenteditable="true" data-field="voucher">${data.voucher || '100% Rebated on 100ml'}</span>
        </div>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  // 28. POLISH Cosmetic: Beauty UGC Video Brief DOM
  function createUgcBriefDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-ugc-brief ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 460}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'ugc-brief';

    card.innerHTML = `
      <div class="cub-header">
        <div class="cub-badge-row">
          <span class="cub-platform-pill" contenteditable="true" data-field="platform">${data.platform || 'TIKTOK & SPARK ADS'}</span>
          <span class="cub-aspect-pill" contenteditable="true" data-field="aspect">${data.aspect || '9:16 VERTICAL 4K'}</span>
        </div>
        <h3 class="cub-title" contenteditable="true" data-field="title">${data.title || 'Micro-Texture Swatch & Skin Melt'}</h3>
        <span class="cub-concept-tag" contenteditable="true" data-field="conceptTag">${data.conceptTag || 'ANGLE: THE 3-SECOND HYPER-HYDRATION TEST'}</span>
      </div>

      <div class="cub-timeline">
        <div class="cub-timeline-step">
          <div class="cub-step-badge">0:00 — 0:03</div>
          <div class="cub-step-content">
            <span class="cub-step-role">VISUAL HOOK (THUMBSTOP)</span>
            <div class="cub-step-text" contenteditable="true" data-field="hookText">${data.hookText || 'Extreme close-up dropper release onto cheekbone. Glass-skin luminescence catches natural sunlight.'}</div>
          </div>
        </div>

        <div class="cub-timeline-step">
          <div class="cub-step-badge">0:03 — 0:15</div>
          <div class="cub-step-content">
            <span class="cub-step-role">BARRIER AGITATION & PROOF</span>
            <div class="cub-step-text" contenteditable="true" data-field="agitationText">${data.agitationText || '"Stop layering 8 serums that cancel each other out. This single lipid complex replaced my entire morning drawer."'}</div>
          </div>
        </div>

        <div class="cub-timeline-step">
          <div class="cub-step-badge">0:15 — 0:30</div>
          <div class="cub-step-content">
            <span class="cub-step-role">TEXTURE MELT & ABSORPTION</span>
            <div class="cub-step-text" contenteditable="true" data-field="demoText">${data.demoText || 'Half-face comparison showing instant velvet matte finish without stickiness or shine.'}</div>
          </div>
        </div>

        <div class="cub-timeline-step">
          <div class="cub-step-badge">0:30 — 0:40</div>
          <div class="cub-step-content">
            <span class="cub-step-role">CALL TO ACTION (OFFER)</span>
            <div class="cub-step-text" contenteditable="true" data-field="ctaText">${data.ctaText || 'Get the 3-Piece Atelier Discovery Kit before current batch sells out. 100% empty-bottle guarantee.'}</div>
          </div>
        </div>
      </div>

      <div class="cub-metrics-bar">
        <span class="cub-metric-item">Target Thumbstop: <strong contenteditable="true" data-field="thumbstop">${data.thumbstop || '36%+'}</strong></span>
        <span class="cub-metric-item">Target CPA: <strong contenteditable="true" data-field="cpa">${data.cpa || '$18.50'}</strong></span>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  // 29. POLISH Cosmetic: Laboratory Clinical Claims DOM
  function createClinicalProofDOM(data) {
    const card = document.createElement('div');
    card.id = data.id;
    card.className = `element-clinical-proof ${data.fontFamily ? 'font-' + data.fontFamily : ''} ${data.isLocked ? 'is-locked' : ''}`;
    card.style.left = `${data.x}px`;
    card.style.top = `${data.y}px`;
    card.style.width = `${data.width || 500}px`;
    card.style.zIndex = data.zIndex || 12;
    card.dataset.type = 'clinical-proof';

    card.innerHTML = `
      <div class="ccp-header">
        <div class="ccp-badge-row">
          <span class="ccp-seal-pill">CLINICAL SUBSTANTIATION</span>
          <span class="ccp-lab-pill" contenteditable="true" data-field="labName">${data.labName || 'INDEPENDENT DERM TESTING LAB (FR)'}</span>
        </div>
        <h3 class="ccp-title" contenteditable="true" data-field="title">${data.title || 'Laboratory Bio-Efficacy Results'}</h3>
        <p class="ccp-protocol" contenteditable="true" data-field="protocol">${data.protocol || '28-Day Blinded Clinical Study • n = 54 Subjects • Instrumental Corneometry'}</p>
      </div>

      <div class="ccp-claims-grid">
        <div class="ccp-claim-card">
          <div class="ccp-claim-number" contenteditable="true" data-field="stat1">${data.stat1 || '96%'}</div>
          <div class="ccp-claim-text" contenteditable="true" data-field="claim1">${data.claim1 || 'Demonstrated immediate reduction in skin surface erythema & redness within 15 minutes of application.'}</div>
        </div>
        <div class="ccp-claim-card">
          <div class="ccp-claim-number" contenteditable="true" data-field="stat2">${data.stat2 || '89%'}</div>
          <div class="ccp-claim-text" contenteditable="true" data-field="claim2">${data.claim2 || 'Measured instrumental lift in barrier moisture retention over 72 consecutive hours.'}</div>
        </div>
      </div>

      <div class="ccp-compliance-strip">
        <div class="ccp-compliance-tag">✓ EU CPSR Certified</div>
        <div class="ccp-compliance-tag">✓ Hypoallergenic</div>
        <div class="ccp-compliance-tag">✓ Safe for Sensitive Skin</div>
        <div class="ccp-compliance-tag">✓ Dermatologist Tested</div>
      </div>

      <!-- Ports -->
      <div class="card-port port-top" data-port="top" data-parent="${data.id}"></div>
      <div class="card-port port-right" data-port="right" data-parent="${data.id}"></div>
      <div class="card-port port-bottom" data-port="bottom" data-parent="${data.id}"></div>
      <div class="card-port port-left" data-port="left" data-parent="${data.id}"></div>

      <!-- Resize Handles -->
      <div class="resize-handle rh-se" data-handle="se"></div>
      <div class="resize-handle rh-sw" data-handle="sw"></div>
      <div class="resize-handle rh-ne" data-handle="ne"></div>
      <div class="resize-handle rh-nw" data-handle="nw"></div>
    `;
    return card;
  }

  return {
    renderElement,
    applyElementStyles
  };
})();
