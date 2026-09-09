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
      <div class="frame-boxes-wrap">${boxesHTML}</div>
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
        <span class="metric-badge ${data.deltaColor || 'tag-green'}" contenteditable="true" data-field="metric-badge">${data.badge || '▲ +42% Lift'}</span>
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

  return {
    renderElement,
    applyElementStyles
  };
})();
