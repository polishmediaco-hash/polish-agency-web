/**
 * POLISH Board Studio — Central State, History & Orchestration
 */

window.StudioCore = (function () {
  let currentBoard = null;
  let selectedElement = null;
  let selectedElementData = null;
  let selectedConnection = null;

  let undoStack = [];
  let redoStack = [];

  let saveTimeout = null;
  let canvasContainer = null;
  let multiSelectedIds = [];
  let selectedStroke = null;

  function initTheme() {
    const saved = localStorage.getItem('polish_studio_theme') || 'light';
    if (saved === 'dark') {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }
    updateThemeButton();
  }

  function toggleTheme() {
    const isDark = document.body.classList.toggle('theme-dark');
    localStorage.setItem('polish_studio_theme', isDark ? 'dark' : 'light');
    updateThemeButton();
    if (window.StudioEvents) {
      window.StudioEvents.emit(window.StudioEvents.Events.THEME_CHANGED, { theme: isDark ? 'dark' : 'light', isDark });
    }
    if (window.MiniMap) window.MiniMap.update();
  }

  function updateThemeButton() {
    const btn = document.getElementById('themeToggleBtn');
    if (!btn) return;
    const isDark = document.body.classList.contains('theme-dark');
    btn.innerHTML = isDark
      ? '<svg class="dock-theme-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> <span class="dock-theme-label">Light</span>'
      : '<svg class="dock-theme-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg> <span class="dock-theme-label">Dark</span>';
    btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  }

  function getBuiltinStarterBoard() {
    if (window.TemplatesVault && typeof window.TemplatesVault.getStarterBoard === "function") {
      return window.TemplatesVault.getStarterBoard();
    }
    return {
      id: "starter-strategy-board",
      slug: "executive-strategy-template",
      title: "Executive Client Acquisition & Retainer Blueprint",
      client: "Private Advisory Client",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewport: { panX: 60, panY: 60, scale: 0.55 },
      elements: [],
      connections: []
    };
  }

  async function init() {
    canvasContainer = document.getElementById('board-canvas');
    initTheme();

    // 1. Determine Board ID synchronously (0ms)
    const params = new URLSearchParams(window.location.search);
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    const pathId = (pathParts[0] === 'b' || pathParts[0] === 'view') && pathParts[1] ? pathParts[1] : null;
    const boardId = params.get('id') || pathId || localStorage.getItem('polish_board_last_id') || 'starter-strategy-board';
    const templateParam = params.get('template');

    // 2. Instant render: if templateParam is present, initialize directly with template
    if (templateParam) {
      currentBoard = {
        id: boardId,
        slug: boardId,
        title: 'Strategy Board',
        client: 'Private Client',
        elements: [],
        connections: [],
        templateKey: templateParam,
        updatedAt: new Date().toISOString()
      };
      loadTemplate(templateParam);
      saveLocally();
      try {
        const cleanUrl = new URL(window.location);
        cleanUrl.searchParams.delete('template');
        window.history.replaceState({}, '', cleanUrl.pathname + cleanUrl.search);
      } catch (_) {}
      triggerAutoSave();
    } else {
      loadBoard(boardId);
    }

    // 3. Bind Keyboard Shortcuts & Title input
    bindKeyboardShortcuts();
    bindTitleInput();
  }

  function bindTitleInput() {
    const input = document.getElementById('boardTitleInput');
    if (input) {
      input.addEventListener('input', () => {
        if (currentBoard) {
          currentBoard.title = input.value;
          triggerAutoSave();
        }
      });
    }
  }

  async function loadBoard(id) {
    try {
      let board = null;

      // 1. Instant check from local cache (0ms)
      const localCached = localStorage.getItem(`polish_board_${id}`) || (localStorage.getItem('polish_board_last_id') === id ? localStorage.getItem('polish_board_current') : null);
      if (localCached) {
        try { board = JSON.parse(localCached); } catch (_) {}
      }

      // If not cached and starter board, use built-in template instantly (0ms)
      if (!board && (id === 'starter-strategy-board' || id === 'executive-strategy-template' || !id)) {
        board = getBuiltinStarterBoard();
      }

      // RENDER IMMEDIATELY ON FRAME 1 (0ms!)
      if (board) {
        currentBoard = board;
        applyLoadedBoard();
        indicateSaved(false);
      }

      // 2. Non-blocking asynchronous background refresh from /api/boards/:id
      fetch(`/api/boards/${encodeURIComponent(id)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.success && data.board) {
            const cloudBoard = data.board;
            const currentCount = (currentBoard && currentBoard.elements) ? currentBoard.elements.length : 0;
            const cloudCount = (cloudBoard && cloudBoard.elements) ? cloudBoard.elements.length : 0;

            // Guard: Never let an empty or starter cloud board wipe out a populated canvas
            if (currentCount > 0 && cloudCount === 0) {
              triggerAutoSave();
              return;
            }

            if (!board || new Date(cloudBoard.updatedAt || 0) > new Date(board.updatedAt || 0)) {
              currentBoard = cloudBoard;
              saveLocally();
              applyLoadedBoard();
            }
            indicateSaved(true);
          }
        })
        .catch(() => {});

      if (!currentBoard) {
        currentBoard = getBuiltinStarterBoard();
        saveLocally();
        applyLoadedBoard();
      }
    } catch (err) {
      console.error('Error loading board:', err);
    }
  }

  function applyLoadedBoard() {
    if (!currentBoard) return;
    const titleInput = document.getElementById('boardTitleInput');
    if (titleInput) titleInput.value = currentBoard.title || 'Untitled Board';

    // Update currency selector in top dock
    const activeCur = currentBoard.currency || localStorage.getItem('polish_studio_currency') || 'AED';
    currentBoard.currency = activeCur;
    document.querySelectorAll('.dock-currency-picker .currency-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.currency === activeCur);
    });

    // Update client view button link
    const btnClient = document.getElementById('btnClientView');
    if (btnClient) {
      btnClient.href = `/b/${encodeURIComponent(currentBoard.id)}`;
    }

    // Restore Viewport Transform
    if (currentBoard.viewport && window.CanvasEngine) {
      window.CanvasEngine.setTransform(
        currentBoard.viewport.scale || 0.75,
        currentBoard.viewport.panX || 100,
        currentBoard.viewport.panY || 80
      );
    }

    renderBoard();
    if (window.StudioAI && window.StudioAI.onTemplateLoaded && currentBoard.templateKey) {
      window.StudioAI.onTemplateLoaded(currentBoard.templateKey);
    }
  }

  function renderBoard() {
    if (!currentBoard || !canvasContainer) return;

    // Universal sanitizer: Eliminate duplicate titles and filler texts
    (currentBoard.elements || []).forEach(el => {
      if (el.type === 'frame') {
        if (el.headline && el.serifAccent && el.headline.trim().toLowerCase() === el.serifAccent.trim().toLowerCase()) {
          el.serifAccent = '';
        }
        if (el.description && (el.description.includes('Double-click') || el.description.includes('begin editing'))) {
          el.description = '';
        }
      }
      if (el.type === 'sticky') {
        if (el.content && el.content.includes('Drag frames, sticky notes')) {
          el.content = '';
        }
      }
    });

    // Clear existing DOM elements
    canvasContainer.querySelectorAll('.studio-element').forEach(el => el.remove());

    // Render all elements
    (currentBoard.elements || []).forEach(data => {
      window.ElementsFactory.renderElement(data, canvasContainer);
    });

    // Render all connections
    if (window.ConnectorEngine) {
      window.ConnectorEngine.renderAllConnections(currentBoard.connections || []);
    }

    // Render all freehand vector strokes
    if (window.DrawingEngine) {
      window.DrawingEngine.renderAllStrokes(currentBoard.drawings || []);
    }

    // Update Mini-Map
    if (window.StudioEvents) {
      window.StudioEvents.emit(window.StudioEvents.Events.BOARD_LOADED, { board: currentBoard });
    }
    if (window.MiniMap) {
      window.MiniMap.update();
    }
  }

  // Selection Handling
  function selectElement(el, data) {
    if (selectedElement === el) return;
    deselectAll();
    selectedElement = el;
    selectedElementData = data;
    el.classList.add('is-selected');

    if (window.StudioEvents) {
      window.StudioEvents.emit(window.StudioEvents.Events.ELEMENT_SELECTED, { el, data });
    }
    if (window.StudioInspector) {
      window.StudioInspector.show(el, data);
    }
    if (window.StudioAI && window.StudioAI.onCanvasSelectionChange) {
      window.StudioAI.onCanvasSelectionChange(data && data.id ? [data.id] : []);
    }
  }

  function selectConnection(conn, pathEl) {
    deselectAll();
    selectedConnection = conn;
    pathEl.classList.add('is-selected');

    const labelPill = document.getElementById(`label-${conn.id}`);
    if (labelPill) labelPill.classList.add('is-selected');

    if (window.StudioEvents && labelPill) {
      window.StudioEvents.emit(window.StudioEvents.Events.CONNECTION_SELECTED, { conn, labelPill });
    }
    if (window.StudioInspector && labelPill) {
      window.StudioInspector.show(labelPill, { ...conn, type: 'connection' });
    }
  }

  function deselectAll() {
    const hadSelected = !!(selectedElement || selectedConnection);
    if (selectedElement) {
      selectedElement.classList.remove('is-selected');
      selectedElement = null;
      selectedElementData = null;
    }
    if (selectedConnection) {
      document.querySelectorAll('.flow-line.is-selected, .connector-label-pill.is-selected').forEach(el => el.classList.remove('is-selected'));
      selectedConnection = null;
    }
    if (hadSelected && window.StudioEvents) {
      window.StudioEvents.emit(window.StudioEvents.Events.ELEMENT_DESELECTED, {});
    }
    if (window.StudioInspector) {
      window.StudioInspector.hide();
    }
    if (hadSelected && window.StudioAI && window.StudioAI.onCanvasSelectionChange) {
      const marqueeIds = (window.MarqueeEngine && window.MarqueeEngine.getSelectedIds) ? window.MarqueeEngine.getSelectedIds() : [];
      if (marqueeIds.length === 0) {
        window.StudioAI.onCanvasSelectionChange([]);
      }
    }
  }

  // Element Creation from Toolbar
  function addFrame() {
    if (!currentBoard) return;
    const center = getCanvasCenter();
    const count = (currentBoard.elements.filter(e => e.type === 'frame').length + 1).toString().padStart(2, '0');

    const newFrame = {
      id: `frame-${Date.now()}`,
      type: 'frame',
      x: Math.round(center.x - 300),
      y: Math.round(center.y - 240),
      width: 620,
      height: 480,
      zIndex: 10,
      frameNumber: count,
      titlePill: '',
      headline: `Frame ${count}`,
      serifAccent: '',
      description: '',
      boxes: [
        {
          tag: 'NOTE',
          tagColor: 'gold',
          title: 'Title',
          content: ''
        }
      ]
    };

    pushHistory();
    currentBoard.elements.push(newFrame);
    const el = window.ElementsFactory.renderElement(newFrame, canvasContainer);
    selectElement(el, newFrame);
    triggerAutoSave();
  }

  function addStrategyCard(cardData, posX, posY) {
    if (!currentBoard) return null;
    const center = getCanvasCenter();
    const rawType = String(cardData.type || cardData.elementType || 'frame').toLowerCase();
    let newCard = null;

    if (rawType === 'value-equation') {
      newCard = {
        id: `ve-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'value-equation',
        x: posX !== undefined ? Math.round(posX) : Math.round(center.x - 360),
        y: posY !== undefined ? Math.round(posY) : Math.round(center.y - 200),
        width: cardData.width || 720,
        zIndex: 15,
        title: cardData.title || 'The $100M Value Equation',
        scoreBadge: cardData.scoreBadge || 'SCORE: 98.4 / 100',
        dreamOutcome: cardData.dreamOutcome || { title: cardData.dreamTitle || 'Dream Outcome', desc: cardData.dreamDesc || cardData.content || 'Category dominance in luxury aesthetics.' },
        likelihood: cardData.likelihood || { title: cardData.likelihoodTitle || 'Perceived Certainty', desc: cardData.likelihoodDesc || 'Clinical trial proof and ironclad guarantee.' },
        timeDelay: cardData.timeDelay || { title: cardData.timeTitle || 'Time Delay Compressed', desc: cardData.timeDesc || 'Instant 48-hour onboarding and sprint launch.' },
        effort: cardData.effort || { title: cardData.effortTitle || 'Effort Eliminated', desc: cardData.effortDesc || 'Done-For-You operational execution.' },
        footerLaw: cardData.footerLaw || 'Mathematical Law: When Denominator (Time × Effort) Approaches 0, Perceived Value Approaches Infinity.'
      };
    } else if (rawType === 'bonus-stack') {
      newCard = {
        id: `bs-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'bonus-stack',
        x: posX !== undefined ? Math.round(posX) : Math.round(center.x - 230),
        y: posY !== undefined ? Math.round(posY) : Math.round(center.y - 220),
        width: cardData.width || 460,
        zIndex: 15,
        title: cardData.title || 'Grand Slam Bonus Stack',
        items: Array.isArray(cardData.items) && cardData.items.length > 0 ? cardData.items : [
          { title: 'Bonus 01: Turnkey SOP & Protocol Database', desc: 'Pre-vetted clinical operational blueprints', strike: 'AED 8,500' },
          { title: 'Bonus 02: High-AOV Funnel Architecture', desc: 'Custom funnel engineered for 3.4x MER', strike: 'AED 12,000' },
          { title: 'Bonus 03: 24/7 Sovereign Partner VIP Hotline', desc: 'Direct WhatsApp async access to senior advisory team', strike: 'AED 15,000' }
        ],
        totalValue: cardData.totalValue || 'AED 35,500',
        price: cardData.price || 'AED 12,500 / mo',
        savings: cardData.savings || 'AED 23,000'
      };
    } else if (rawType === 'capacity-indicator') {
      newCard = {
        id: `cap-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'capacity-indicator',
        x: posX !== undefined ? Math.round(posX) : Math.round(center.x - 180),
        y: posY !== undefined ? Math.round(posY) : Math.round(center.y - 120),
        width: cardData.width || 360,
        zIndex: 15,
        title: cardData.title || 'Atelier Client Roster',
        totalSlots: cardData.totalSlots || 3,
        filledSlots: cardData.filledSlots !== undefined ? cardData.filledSlots : 2,
        remainingText: cardData.remainingText || 'Accepting 1 new engagement this quarter.',
        urgency: cardData.urgency || 'Next opening: Q2 2025. Enquire to reserve.'
      };
    } else if (rawType === 'payment-architecture') {
      newCard = {
        id: `pa-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'payment-architecture',
        x: posX !== undefined ? Math.round(posX) : Math.round(center.x - 380),
        y: posY !== undefined ? Math.round(posY) : Math.round(center.y - 200),
        width: cardData.width || 760,
        zIndex: 15,
        title: cardData.title || 'Investment Structure Comparison',
        columns: Array.isArray(cardData.columns) && cardData.columns.length > 0 ? cardData.columns : [
          {
            name: 'Upfront Full Pay',
            total: cardData.upfrontTotal || 'AED 75,000',
            cashflow: 'Single payment, Day 1',
            psychology: 'Maximum client commitment. Eliminates monthly friction.',
            bestFor: 'High-trust, high-ticket close',
            badge: 'BEST VALUE',
            highlight: true
          },
          {
            name: 'Monthly Retainer',
            total: cardData.monthlyTotal || 'AED 25,000 / mo',
            cashflow: 'Rolling 3-month minimum',
            psychology: 'Lower barrier to entry. Price perceived as ongoing advisory.',
            bestFor: 'Ongoing advisory relationships',
            badge: '',
            highlight: false
          },
          {
            name: 'Milestone-Based',
            total: cardData.milestoneTotal || 'AED 25,000 × 3 milestones',
            cashflow: 'On delivery of each phase',
            psychology: 'Aligns payment to progress. Reduces buyer anxiety.',
            bestFor: 'Project-based engagements',
            badge: '',
            highlight: false
          }
        ],
        footnote: cardData.footnote || 'All structures access the same full scope of advisory. Investment architecture is a strategic choice, not a service tier.'
      };
    } else if (rawType === 'prescription') {
      newCard = {
        id: `rx-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'prescription',
        x: posX !== undefined ? Math.round(posX) : Math.round(center.x - 210),
        y: posY !== undefined ? Math.round(posY) : Math.round(center.y - 180),
        width: cardData.width || 420,
        zIndex: 15,
        title: cardData.title || 'Sovereign Advisory Retainer',
        fee: cardData.fee || 'AED 25,000 / Month',
        term: cardData.term || 'Closed-Door 90-Day Container Commitment',
        term1: cardData.term1 || (cardData.terms && cardData.terms[0]) || 'Bi-Weekly 1-on-1 Consultative Diagnostic & Growth Offsite',
        term2: cardData.term2 || (cardData.terms && cardData.terms[1]) || '24/7 Async Sovereign Partner WhatsApp Hotline',
        term3: cardData.term3 || (cardData.terms && cardData.terms[2]) || 'Creative Sandbox Teardowns & Multi-Touch Funnel Architecture'
      };
    } else if (rawType === 'sticky') {
      const rotation = (Math.random() * 4 - 2).toFixed(1);
      newCard = {
        id: `sticky-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'sticky',
        x: posX !== undefined ? Math.round(posX) : Math.round(center.x - 140),
        y: posY !== undefined ? Math.round(posY) : Math.round(center.y - 100),
        width: cardData.width || 280,
        height: cardData.height || 190,
        zIndex: 25,
        color: cardData.color || 'gold',
        rotation: parseFloat(rotation),
        hasTape: true,
        header: cardData.title || cardData.header || 'Strategic Note',
        content: cardData.content || cardData.text || '',
        footer: cardData.footer || ''
      };
    } else if (rawType === 'pricing') {
      newCard = {
        id: `pricing-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'pricing',
        x: posX !== undefined ? Math.round(posX) : Math.round(center.x - 160),
        y: posY !== undefined ? Math.round(posY) : Math.round(center.y - 160),
        width: cardData.width || 320,
        zIndex: 15,
        badge: cardData.badge || cardData.title || 'TIER OPTION',
        currency: cardData.currency || 'AED',
        figure: cardData.figure || cardData.price || '15,000',
        period: cardData.period || 'Monthly Retainer',
        features: Array.isArray(cardData.features) ? cardData.features : (cardData.content ? [cardData.content] : ['Dedicated Strategic Advisor', 'Weekly Optimization Sprints', 'Priority SLA Response']),
        isFeatured: !!cardData.isFeatured
      };
    } else if (rawType === 'diagnostic-protocol') {
      newCard = {
        id: `diag-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'diagnostic-protocol',
        x: posX !== undefined ? Math.round(posX) : Math.round(center.x - 340),
        y: posY !== undefined ? Math.round(posY) : Math.round(center.y - 200),
        width: cardData.width || 680,
        zIndex: 15,
        title: cardData.title || 'Consultative Diagnostic & Prescription Protocol',
        stages: Array.isArray(cardData.stages) ? cardData.stages : [
          { roman: 'STAGE I', title: 'Symptom Elicitation', desc: cardData.symptom || 'Identify visible client friction points and current conversion bottlenecks.' },
          { roman: 'STAGE II', title: 'Root Pathophysiology', desc: cardData.rootCause || 'Diagnose systemic operational leaks: positioning, offer economics, and pricing asymmetry.' },
          { roman: 'STAGE III', title: 'Cost of Inaction', desc: cardData.inactionCost || 'Compound cost of staying the course over the next 12 months.' },
          { roman: 'STAGE IV', title: 'Prescription of Care', desc: cardData.prescription || 'Prescribe 90-Day transformation container with dedicated senior advisory.' },
          { roman: 'STAGE V', title: 'Frame Control', desc: cardData.frameControl || 'State investment fee with absolute calm conviction. Hold the silence.' }
        ]
      };
    } else if (rawType === 'pipeline-node') {
      newCard = {
        id: `node-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'pipeline-node',
        x: posX !== undefined ? Math.round(posX) : Math.round(center.x - 210),
        y: posY !== undefined ? Math.round(posY) : Math.round(center.y - 160),
        width: cardData.width || 420,
        zIndex: 15,
        nodeId: cardData.nodeId || 'NODE_01',
        status: cardData.status || 'ONLINE 200 OK',
        title: cardData.title || 'Autonomous Intelligence Node',
        desc: cardData.desc || cardData.content || '',
        tech: cardData.tech || ['Claude 3.5 Sonnet', 'Make.com', 'Supabase Vector'],
        steps: Array.isArray(cardData.steps) ? cardData.steps : [
          'Ingest raw unstructured client data via webhook',
          'Run multi-pass LLM reasoning against proprietary knowledge base',
          'Synthesize executive brief and deliver to client portal'
        ],
        latency: cardData.latency || 'Latency: <120ms',
        compute: cardData.compute || 'Cost: $0.0028 / run'
      };
    } else if (rawType === 'offer-name-generator') {
      newCard = {
        id: `ong-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'offer-name-generator',
        x: posX !== undefined ? Math.round(posX) : Math.round(center.x - 240),
        y: posY !== undefined ? Math.round(posY) : Math.round(center.y - 160),
        width: cardData.width || 480,
        zIndex: 15,
        adjective: cardData.adjective || 'Sovereign',
        outcome: cardData.outcome || 'Growth',
        vehicle: cardData.vehicle || 'Accelerator',
        duration: cardData.duration || '90-Day',
        audience: cardData.audience || 'Luxury Aesthetic Clinics'
      };
    } else if (rawType === 'routine-step') {
      newCard = {
        id: `rs-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'routine-step',
        x: posX !== undefined ? Math.round(posX) : Math.round(center.x - 210),
        y: posY !== undefined ? Math.round(posY) : Math.round(center.y - 180),
        width: cardData.width || 420,
        zIndex: 15,
        stepBadge: cardData.stepBadge || 'STEP 01 • PREPARE',
        timeBadge: cardData.timeBadge || 'AM & PM DAILY',
        title: cardData.title || 'Botanical Cleanser Formulation',
        subtitle: cardData.subtitle || 'pH 5.4 Micro-Gel Formulation',
        actives: cardData.actives || '• 5% Niacinamide\n• Centella Asiatica\n• Glycerin Matrix',
        target: cardData.target || 'Barrier repair and gentle cellular purification.',
        aovLift: cardData.aovLift || '+$48 Routine Basket AOV'
      };
    } else if (rawType === 'olfactory-pyramid') {
      newCard = {
        id: `op-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'olfactory-pyramid',
        x: posX !== undefined ? Math.round(posX) : Math.round(center.x - 240),
        y: posY !== undefined ? Math.round(posY) : Math.round(center.y - 210),
        width: cardData.width || 480,
        zIndex: 15,
        title: cardData.title || 'Niche Extrait de Parfum',
        concentration: cardData.concentration || 'EXTRAIT DE PARFUM (30%)',
        tagline: cardData.tagline || 'Sensual Amber, Grasse Rose & Aged Oud',
        topNotes: cardData.topNotes || 'Italian Bergamot, Pink Peppercorn, Saffron',
        heartNotes: cardData.heartNotes || 'Rose Absolute, Orris Butter, Cardamom',
        baseNotes: cardData.baseNotes || 'Cambodian Oud, Ambergris, Bourbon Vanilla',
        longevity: cardData.longevity || '16+ Hours Sillage',
        voucher: cardData.voucher || '$38 Discovery Set = 100% Credit on 100ml'
      };
    } else if (rawType === 'ugc-brief') {
      newCard = {
        id: `ugc-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'ugc-brief',
        x: posX !== undefined ? Math.round(posX) : Math.round(center.x - 230),
        y: posY !== undefined ? Math.round(posY) : Math.round(center.y - 200),
        width: cardData.width || 460,
        zIndex: 15,
        platform: cardData.platform || 'TIKTOK & META SPARK ADS',
        aspect: cardData.aspect || '9:16 VERTICAL 4K',
        title: cardData.title || 'Extreme Texture Melt',
        conceptTag: cardData.conceptTag || 'ANGLE: ASMR & BARRIER SOOTHING',
        hookText: cardData.hookText || 'Macro 4K dropper release with natural golden-hour luminescence.',
        agitationText: cardData.agitationText || '"Why expensive moisturizers pill under makeup."',
        demoText: cardData.demoText || 'Half-face real-time velvet matte finish demo.',
        ctaText: cardData.ctaText || 'Get the Discovery Kit before batch sells out.',
        thumbstop: cardData.thumbstop || '42%+',
        cpa: cardData.cpa || '$16.50'
      };
    } else if (rawType === 'clinical-proof') {
      newCard = {
        id: `ccp-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'clinical-proof',
        x: posX !== undefined ? Math.round(posX) : Math.round(center.x - 250),
        y: posY !== undefined ? Math.round(posY) : Math.round(center.y - 190),
        width: cardData.width || 500,
        zIndex: 15,
        title: cardData.title || 'Laboratory Bio-Efficacy Results',
        labName: cardData.labName || 'PARISIAN DERM CLINICAL LAB',
        protocol: cardData.protocol || '28-Day Blinded Clinical Study • n = 54 Subjects',
        stat1: cardData.stat1 || '96%',
        claim1: cardData.claim1 || 'Demonstrated reduction in surface redness within 15 minutes.',
        stat2: cardData.stat2 || '89%',
        claim2: cardData.claim2 || 'Measured instrumental lift in barrier moisture over 72 hours.'
      };
    } else {
      // Default: Strategy Container Frame
      const count = (currentBoard.elements.filter(e => e.type === 'frame').length + 1).toString().padStart(2, '0');
      newCard = {
        id: `frame-ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'frame',
        x: posX !== undefined ? Math.round(posX) : Math.round(center.x - 210),
        y: posY !== undefined ? Math.round(posY) : Math.round(center.y - 160),
        width: cardData.width || 440,
        height: cardData.height || 340,
        zIndex: 15,
        frameNumber: count,
        titlePill: (cardData.type || 'STRATEGY').toUpperCase(),
        headline: cardData.title || `Strategy Pillar ${count}`,
        serifAccent: cardData.serifAccent || '',
        description: cardData.description || '',
        boxes: Array.isArray(cardData.boxes) && cardData.boxes.length > 0 ? cardData.boxes : [
          {
            tag: (cardData.type || 'EXECUTION').toUpperCase(),
            tagColor: cardData.tagColor || 'gold',
            title: cardData.boxTitle || 'Actionable Blueprint',
            content: cardData.content || '',
            isWhite: true
          }
        ]
      };
    }

    pushHistory();
    currentBoard.elements.push(newCard);
    const el = window.ElementsFactory.renderElement(newCard, canvasContainer);
    selectElement(el, newCard);
    triggerAutoSave();
    if (window.MiniMap) window.MiniMap.update();
    return newCard;
  }

  function addSticky(color = 'yellow') {
    if (!currentBoard) return;
    const center = getCanvasCenter();
    const rotation = (Math.random() * 4 - 2).toFixed(1);

    const newSticky = {
      id: `sticky-${Date.now()}`,
      type: 'sticky',
      x: Math.round(center.x - 140),
      y: Math.round(center.y - 100),
      width: 280,
      height: 190,
      zIndex: 25,
      color: color,
      rotation: parseFloat(rotation),
      hasTape: true,
      header: 'Note',
      content: '',
      footer: ''
    };

    pushHistory();
    currentBoard.elements.push(newSticky);
    const el = window.ElementsFactory.renderElement(newSticky, canvasContainer);
    selectElement(el, newSticky);
    triggerAutoSave();
    if (window.MiniMap) window.MiniMap.update();
  }

  function addShape(shapeType = 'rect', x, y) {
    if (!currentBoard) return;
    const center = (x !== undefined && y !== undefined) ? { x, y } : getCanvasCenter();
    const isCircle = shapeType === 'circle';
    const isDiamond = shapeType === 'diamond';
    const isLine = shapeType === 'line';

    const newShape = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shapeType: shapeType,
      x: Math.round(center.x - (isCircle ? 90 : 110)),
      y: Math.round(center.y - (isCircle ? 90 : (isLine ? 20 : 70))),
      width: isCircle ? 180 : (isDiamond ? 180 : 220),
      height: isCircle ? 180 : (isDiamond ? 180 : (isLine ? 40 : 140)),
      text: '',
      zIndex: 15
    };

    pushHistory();
    currentBoard.elements.push(newShape);
    const el = window.ElementsFactory.renderElement(newShape, canvasContainer);
    selectElement(el, newShape);
    triggerAutoSave();
    if (window.MiniMap) window.MiniMap.update();
  }

  function addText(x, y) {
    if (!currentBoard) return;
    const center = (x !== undefined && y !== undefined) ? { x, y } : getCanvasCenter();

    const newText = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: Math.round(center.x - 70),
      y: Math.round(center.y - 20),
      text: 'Text',
      fontSize: 22,
      zIndex: 22
    };

    pushHistory();
    currentBoard.elements.push(newText);
    const el = window.ElementsFactory.renderElement(newText, canvasContainer);
    selectElement(el, newText);

    // Auto-focus text content
    const inner = el.querySelector('.floating-text-inner');
    if (inner) {
      inner.focus();
      document.execCommand('selectAll', false, null);
    }

    triggerAutoSave();
    if (window.MiniMap) window.MiniMap.update();
  }

  function addDrawingStroke(strokeData) {
    if (!currentBoard) return;
    pushHistory();
    if (!currentBoard.drawings) currentBoard.drawings = [];
    currentBoard.drawings.push(strokeData);
    saveLocally();
    triggerAutoSave();
    if (window.MiniMap) window.MiniMap.update();
  }

  function selectStroke(strokeData, pathEl) {
    deselectAll();
    selectedStroke = { data: strokeData, el: pathEl };
  }

  function addPricing() {
    if (!currentBoard) return;
    const center = getCanvasCenter();

    const newPricing = {
      id: `pricing-${Date.now()}`,
      type: 'pricing',
      x: Math.round(center.x - 160),
      y: Math.round(center.y - 200),
      width: 320,
      height: 420,
      zIndex: 15,
      badge: 'HIGH-TICKET OFFER',
      currency: 'AED',
      figure: '6,500',
      period: 'Monthly Retainer',
      features: [
        '4 × 60-Min Strategy Calibrations',
        'VIP WhatsApp Async Voice Support',
        'Complete Execution Roadmap',
        'Confidential Executive Advisory'
      ]
    };

    pushHistory();
    currentBoard.elements.push(newPricing);
    const el = window.ElementsFactory.renderElement(newPricing, canvasContainer);
    selectElement(el, newPricing);
    triggerAutoSave();
  }

  function addForm() {
    if (!currentBoard) return;
    const center = getCanvasCenter();

    const newForm = {
      id: `form-${Date.now()}`,
      type: 'form',
      x: Math.round(center.x - 230),
      y: Math.round(center.y - 150),
      width: 460,
      zIndex: 12,
      title: 'Brand Diagnostic Worksheet',
      badge: 'INTAKE ENGINE',
      desc: 'High-ticket partnership intake & strategic diagnostic parameters.',
      fields: [
        {
          id: `field-${Date.now()}-1`,
          type: 'textarea',
          label: '01. Diagnostic Friction Point',
          badge: 'CALIBRATION',
          instructions: 'Describe the bottleneck in retention, conversion, or media CAC:',
          value: ''
        },
        {
          id: `field-${Date.now()}-2`,
          type: 'input',
          label: '02. Target 90-Day Revenue Benchmark (AED / $)',
          badge: 'METRIC',
          instructions: 'Current baseline vs target milestone:',
          value: ''
        }
      ]
    };

    pushHistory();
    currentBoard.elements.push(newForm);
    const el = window.ElementsFactory.renderElement(newForm, canvasContainer);
    selectElement(el, newForm);
    triggerAutoSave();
  }

  function addScript() {
    if (!currentBoard) return;
    const center = getCanvasCenter();

    const newScript = {
      id: `script-${Date.now()}`,
      type: 'script',
      x: Math.round(center.x - 160),
      y: Math.round(center.y - 80),
      width: 320,
      height: 140,
      zIndex: 14,
      content: '"Verbatim client advisory script or closing talk track..."'
    };

    pushHistory();
    currentBoard.elements.push(newScript);
    const el = window.ElementsFactory.renderElement(newScript, canvasContainer);
    selectElement(el, newScript);
    triggerAutoSave();
  }

  function addConnection(conn) {
    if (!currentBoard) return;
    pushHistory();
    if (!currentBoard.connections) currentBoard.connections = [];
    currentBoard.connections.push(conn);
    if (window.ConnectorEngine) {
      window.ConnectorEngine.renderAllConnections(currentBoard.connections);
    }
    triggerAutoSave();
  }

  function setMultiSelected(ids) {
    multiSelectedIds = ids || [];
  }

  function clearMultiSelection() {
    multiSelectedIds = [];
  }

  function updateElementPosition(id, x, y) {
    const elData = findElement(id);
    if (elData) {
      elData.x = x;
      elData.y = y;
    }
  }

  function addMetric() {
    if (!currentBoard) return;
    const center = getCanvasCenter();

    const newMetric = {
      id: `metric-${Date.now()}`,
      type: 'metric',
      x: Math.round(center.x - 140),
      y: Math.round(center.y - 90),
      width: 280,
      zIndex: 15,
      title: 'NORTH STAR METRIC',
      badge: '+42% Lift',
      deltaColor: 'tag-green',
      figure: '3.8x MER',
      subtitle: 'Blended RoAS across Meta ASC & Spark Ads'
    };

    pushHistory();
    currentBoard.elements.push(newMetric);
    const el = window.ElementsFactory.renderElement(newMetric, canvasContainer);
    selectElement(el, newMetric);
    triggerAutoSave();
  }

  function addCallout() {
    if (!currentBoard) return;
    const center = getCanvasCenter();

    const newCallout = {
      id: `callout-${Date.now()}`,
      type: 'callout',
      x: Math.round(center.x - 340),
      y: Math.round(center.y - 70),
      width: 680,
      zIndex: 8,
      roman: 'PHASE I',
      headline: 'System Architecture & Market Positioning',
      desc: 'Foundational customer acquisition & category authority container.'
    };

    pushHistory();
    currentBoard.elements.push(newCallout);
    const el = window.ElementsFactory.renderElement(newCallout, canvasContainer);
    selectElement(el, newCallout);
    triggerAutoSave();
  }

  function addRoutineStep() {
    if (!currentBoard) return;
    const center = getCanvasCenter();
    const count = currentBoard.elements.filter(e => e.type === 'routine-step').length + 1;
    const phases = ['01 • PREPARE', '02 • TREAT', '03 • HYDRATE', '04 • SHIELD'];
    const phase = phases[(count - 1) % phases.length];

    const card = {
      id: `rs-${Date.now()}`,
      type: 'routine-step',
      x: Math.round(center.x - 210),
      y: Math.round(center.y - 180),
      width: 420,
      zIndex: 12,
      stepBadge: `STEP ${phase}`,
      timeBadge: count % 2 === 0 ? 'PM ESSENTIAL' : 'AM & PM DAILY',
      title: count === 1 ? 'Botanical Lipid-Restoring Cleanser' : count === 2 ? 'Active Peptide Renewal Elixir' : 'Ceramide Lamellar Barrier Crème',
      subtitle: 'Clinical High-Absorption Formulation',
      actives: '• 5% Niacinamide + Zinc PCA\n• Centella Asiatica & Liposomal Matrix\n• Botanical Beta-Glucan',
      target: 'Barrier reinforcement and cellular radiance.',
      aovLift: '+$48 Routine Basket AOV'
    };

    pushHistory();
    currentBoard.elements.push(card);
    const el = window.ElementsFactory.renderElement(card, canvasContainer);
    selectElement(el, card);
    triggerAutoSave();
    if (window.MiniMap) window.MiniMap.update();
  }

  function addOlfactoryPyramid() {
    if (!currentBoard) return;
    const center = getCanvasCenter();

    const card = {
      id: `op-${Date.now()}`,
      type: 'olfactory-pyramid',
      x: Math.round(center.x - 240),
      y: Math.round(center.y - 210),
      width: 480,
      zIndex: 12,
      title: 'Oud Saphir Extrait de Parfum',
      concentration: 'EXTRAIT DE PARFUM (30% CONCENTRATION)',
      tagline: 'Sensual Amber, Damascus Rose & Wild Oud',
      topNotes: 'Calabrian Bergamot, Pink Peppercorn, Cardamom',
      heartNotes: 'Damascus Rose Absolute, Orris Butter, Saffron',
      baseNotes: 'Cambodian Oud, Grey Ambergris, Bourbon Vanilla',
      longevity: '16+ Hours Sillage',
      voucher: '$38 Discovery Set = 100% Credit on 100ml'
    };

    pushHistory();
    currentBoard.elements.push(card);
    const el = window.ElementsFactory.renderElement(card, canvasContainer);
    selectElement(el, card);
    triggerAutoSave();
    if (window.MiniMap) window.MiniMap.update();
  }

  function addUgcBrief() {
    if (!currentBoard) return;
    const center = getCanvasCenter();

    const card = {
      id: `ugc-${Date.now()}`,
      type: 'ugc-brief',
      x: Math.round(center.x - 230),
      y: Math.round(center.y - 200),
      width: 460,
      zIndex: 12,
      platform: 'TIKTOK & META SPARK ADS',
      aspect: '9:16 VERTICAL 4K',
      title: 'Extreme Macro Texture Melt',
      conceptTag: 'ANGLE: SENSORY ASMR & BARRIER PROOF',
      hookText: 'Macro 4K dropper squeeze onto cheekbone. Ambient droplet ASMR.',
      agitationText: '"Stop layering 6 products that pill under makeup. This replaces them all."',
      demoText: 'Half-face real-time application showing instant velvet hydration.',
      ctaText: 'Shop the Atelier Discovery Kit before current batch caps.',
      thumbstop: '42%+',
      cpa: '$16.50'
    };

    pushHistory();
    currentBoard.elements.push(card);
    const el = window.ElementsFactory.renderElement(card, canvasContainer);
    selectElement(el, card);
    triggerAutoSave();
    if (window.MiniMap) window.MiniMap.update();
  }

  function addClinicalProof() {
    if (!currentBoard) return;
    const center = getCanvasCenter();

    const card = {
      id: `ccp-${Date.now()}`,
      type: 'clinical-proof',
      x: Math.round(center.x - 250),
      y: Math.round(center.y - 190),
      width: 500,
      zIndex: 12,
      title: 'Laboratory Bio-Efficacy Results',
      labName: 'PARISIAN DERM CLINICAL LAB',
      protocol: '28-Day Blinded Clinical Study • n = 54 Subjects',
      stat1: '96%',
      claim1: 'Immediate reduction in skin surface redness within 15 minutes.',
      stat2: '89%',
      claim2: 'Instrumental lift in barrier moisture retention over 72 hours.'
    };

    pushHistory();
    currentBoard.elements.push(card);
    const el = window.ElementsFactory.renderElement(card, canvasContainer);
    selectElement(el, card);
    triggerAutoSave();
    if (window.MiniMap) window.MiniMap.update();
  }

  function toggleLockSelected() {
    if (!currentBoard) return;
    if (selectedElementData && selectedElement) {
      pushHistory();
      selectedElementData.isLocked = !selectedElementData.isLocked;
      selectedElement.classList.toggle('is-locked', !!selectedElementData.isLocked);
      showToast(selectedElementData.isLocked ? 'Element Locked (Cmd+L to unlock)' : 'Element Unlocked', 'info');
      triggerAutoSave();
      if (window.StudioInspector) window.StudioInspector.update(selectedElement, selectedElementData);
    }
  }

  function bringForward() {
    if (!selectedElementData || !selectedElement) return;
    pushHistory();
    selectedElementData.zIndex = (selectedElementData.zIndex || 10) + 2;
    selectedElement.style.zIndex = selectedElementData.zIndex;
    triggerAutoSave();
    showToast('Layer: Brought Forward', 'info');
  }

  function sendBackward() {
    if (!selectedElementData || !selectedElement) return;
    pushHistory();
    selectedElementData.zIndex = Math.max(1, (selectedElementData.zIndex || 10) - 2);
    selectedElement.style.zIndex = selectedElementData.zIndex;
    triggerAutoSave();
    showToast('Layer: Sent Backward', 'info');
  }

  // Duplicate Selected Element (Single or Multi-select)
  function duplicateSelected() {
    if (!currentBoard) return;

    if (multiSelectedIds.length > 0) {
      pushHistory();
      const newIds = [];
      multiSelectedIds.forEach(id => {
        const item = findElement(id);
        if (item) {
          const clone = JSON.parse(JSON.stringify(item));
          clone.id = `${item.type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
          clone.x = (clone.x || 0) + 40;
          clone.y = (clone.y || 0) + 40;
          currentBoard.elements.push(clone);
          newIds.push(clone.id);
        }
      });
      renderBoard();
      triggerAutoSave();
      return;
    }

    if (selectedElementData) {
      pushHistory();
      const clone = JSON.parse(JSON.stringify(selectedElementData));
      clone.id = `${clone.type}-${Date.now()}`;
      clone.x += 40;
      clone.y += 40;

      currentBoard.elements.push(clone);
      const el = window.ElementsFactory.renderElement(clone, canvasContainer);
      selectElement(el, clone);
      triggerAutoSave();
    }
  }

  // Delete Selected Element (Single, Multi-select, Connector, or Stroke)
  function deleteSelected() {
    if (!currentBoard) return;

    if (multiSelectedIds.length > 0) {
      pushHistory();
      currentBoard.elements = currentBoard.elements.filter(e => !multiSelectedIds.includes(e.id));
      if (currentBoard.connections) {
        currentBoard.connections = currentBoard.connections.filter(c => !multiSelectedIds.includes(c.from) && !multiSelectedIds.includes(c.to));
      }
      multiSelectedIds = [];
      renderBoard();
      triggerAutoSave();
      return;
    }

    if (selectedElement && selectedElementData) {
      pushHistory();
      const id = selectedElementData.id;
      currentBoard.elements = currentBoard.elements.filter(e => e.id !== id);
      if (currentBoard.connections) {
        currentBoard.connections = currentBoard.connections.filter(c => c.from !== id && c.to !== id);
      }
      selectedElement.remove();
      deselectAll();
      if (window.ConnectorEngine) window.ConnectorEngine.renderAllConnections(currentBoard.connections || []);
      triggerAutoSave();
    } else if (selectedConnection) {
      pushHistory();
      const connId = selectedConnection.id;
      currentBoard.connections = currentBoard.connections.filter(c => c.id !== connId);
      deselectAll();
      if (window.ConnectorEngine) window.ConnectorEngine.renderAllConnections(currentBoard.connections || []);
      triggerAutoSave();
    } else if (selectedStroke) {
      pushHistory();
      const strokeId = selectedStroke.data.id;
      currentBoard.drawings = (currentBoard.drawings || []).filter(s => s.id !== strokeId);
      if (selectedStroke.el) selectedStroke.el.remove();
      selectedStroke = null;
      triggerAutoSave();
    }
  }

  function getCanvasCenter() {
    if (window.CanvasEngine) {
      return window.CanvasEngine.screenToCanvas(window.innerWidth / 2, window.innerHeight / 2);
    }
    return { x: 500, y: 300 };
  }

  // Save to LocalStorage immediately
  function saveLocally() {
    if (!currentBoard) return;
    try {
      if (window.CanvasEngine) {
        const pan = window.CanvasEngine.getPan();
        currentBoard.viewport = {
          panX: pan.x,
          panY: pan.y,
          scale: window.CanvasEngine.getScale()
        };
      }
      currentBoard.updatedAt = new Date().toISOString();
      localStorage.setItem(`polish_board_${currentBoard.id}`, JSON.stringify(currentBoard));
      localStorage.setItem('polish_board_current', JSON.stringify(currentBoard));
      localStorage.setItem('polish_board_last_id', currentBoard.id);
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  // Auto-Save Debouncer (Local + Cloud Dual Sync)
  function triggerAutoSave() {
    saveLocally();
    indicateSaving();
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(async () => {
      await persistBoard();
    }, 1200);
  }

  async function persistBoard() {
    if (!currentBoard) return;
    saveLocally();

    let isCloudSynced = false;
    try {
      if (window.PolishFirebase && window.PolishFirebase.currentUser) {
        await window.PolishFirebase.saveBoard(currentBoard, window.PolishFirebase.currentUser);
        isCloudSynced = true;
      } else {
        const headers = (window.PolishFirebase && typeof window.PolishFirebase.getAuthHeaders === 'function')
          ? await window.PolishFirebase.getAuthHeaders()
          : { 'Content-Type': 'application/json' };
        const res = await fetch(`/api/boards/${encodeURIComponent(currentBoard.id)}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(currentBoard)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success) isCloudSynced = true;
        }
      }
      indicateSaved(isCloudSynced);
    } catch (err) {
      console.warn('Cloud sync error, local cache active:', err);
      indicateSaved(false);
    }
  }

  function indicateSaving() {
    const el = document.getElementById('saveIndicator');
    if (el) el.innerHTML = '<span class="save-dot" style="background:#F59E0B; box-shadow:0 0 6px rgba(245,158,11,0.5)"></span> <span class="save-text">Saving...</span>';
  }

  function indicateSaved(isCloud = true) {
    const el = document.getElementById('saveIndicator');
    if (!el) return;
    if (isCloud) {
      el.innerHTML = '<span class="save-dot"></span> <span class="save-text">Cloud Synced</span>';
    } else {
      el.innerHTML = '<span class="save-dot" style="background:#F59E0B; box-shadow:0 0 6px rgba(245,158,11,0.5)"></span> <span class="save-text">Saved Locally</span>';
    }
  }

  // ==========================================================
  // MULTI-CURRENCY ENGINE (Delegated to window.CurrencyEngine)
  // ==========================================================
  function formatConvertedText(text, targetCurrency) {
    if (window.CurrencyEngine && typeof window.CurrencyEngine.formatConvertedText === "function") {
      return window.CurrencyEngine.formatConvertedText(text, targetCurrency);
    }
    return text;
  }

  function applyCurrencyToElements(elements, currency) {
    if (window.CurrencyEngine && typeof window.CurrencyEngine.applyCurrencyToElements === "function") {
      return window.CurrencyEngine.applyCurrencyToElements(elements, currency);
    }
  }

  function setBoardCurrency(currency) {
    if (!['DZD', 'AED', 'USD', 'EUR'].includes(currency)) return;
    if (!currentBoard) return;

    pushHistory();
    currentBoard.currency = currency;
    localStorage.setItem('polish_studio_currency', currency);

    // Update Top Dock active button
    document.querySelectorAll('.dock-currency-picker .currency-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.currency === currency);
    });

    // Apply to elements and re-render
    applyCurrencyToElements(currentBoard.elements, currency);
    renderBoard();
    triggerAutoSave();

    if (window.StudioInspector && typeof window.StudioInspector.updateSelection === 'function') {
      window.StudioInspector.updateSelection();
    }
  }

  // History (Undo / Redo)
  function pushHistory() {
    if (!currentBoard) return;
    undoStack.push(JSON.stringify(currentBoard));
    if (undoStack.length > 30) undoStack.shift();
    redoStack = [];
    if (window.StudioEvents) {
      window.StudioEvents.emit(window.StudioEvents.Events.HISTORY_PUSHED, {
        canUndo: undoStack.length > 0,
        canRedo: redoStack.length > 0
      });
    }
  }

  function undo() {
    if (undoStack.length === 0) return;
    redoStack.push(JSON.stringify(currentBoard));
    const previous = JSON.parse(undoStack.pop());
    currentBoard = previous;
    renderBoard();
    triggerAutoSave();
  }

  function redo() {
    if (redoStack.length === 0) return;
    undoStack.push(JSON.stringify(currentBoard));
    const next = JSON.parse(redoStack.pop());
    currentBoard = next;
    renderBoard();
    triggerAutoSave();
  }

  function bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Don't trigger shortcuts when typing in inputs/textareas, but allow Escape to exit editing
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) {
        if (e.key === 'Escape') {
          if (typeof e.target.blur === 'function') e.target.blur();
          deselectAll();
          if (window.MarqueeEngine) window.MarqueeEngine.clearMultiSelection();
          if (window.CanvasEngine) window.CanvasEngine.setTool('select');
        }
        return;
      }

      // Cmd+Z (Undo) / Cmd+Shift+Z (Redo)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) redo();
        else undo();
        e.preventDefault();
        return;
      }

      // Cmd+D (Duplicate)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        duplicateSelected();
        e.preventDefault();
        return;
      }

      // Cmd+L (Lock / Unlock Selected)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'l') {
        toggleLockSelected();
        e.preventDefault();
        return;
      }

      // Cmd+] (Bring Forward) / Cmd+[ (Send Backward)
      if ((e.metaKey || e.ctrlKey) && e.key === ']') {
        bringForward();
        e.preventDefault();
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '[') {
        sendBackward();
        e.preventDefault();
        return;
      }

      // Delete / Backspace
      if (e.key === 'Backspace' || e.key === 'Delete') {
        deleteSelected();
        e.preventDefault();
        return;
      }

      // Escape (Deselect)
      if (e.key === 'Escape') {
        deselectAll();
        if (window.MarqueeEngine) window.MarqueeEngine.clearMultiSelection();
        if (window.CanvasEngine) window.CanvasEngine.setTool('select');
        return;
      }

      // Single Key Miro Hotkeys:
      const key = e.key.toLowerCase();
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        if (key === 'v') {
          if (window.CanvasEngine) window.CanvasEngine.setTool('select');
        } else if (key === 'h') {
          if (window.CanvasEngine) window.CanvasEngine.setTool('hand');
        } else if (key === 'n') {
          addSticky('yellow');
        } else if (key === 't') {
          if (window.CanvasEngine) window.CanvasEngine.setTool('text');
        } else if (key === 's') {
          if (window.CanvasEngine) window.CanvasEngine.setTool('shape', 'rect');
        } else if (key === 'p') {
          if (window.CanvasEngine) window.CanvasEngine.setTool('pen');
        } else if (key === 'l') {
          if (window.CanvasEngine) window.CanvasEngine.setTool('laser');
        } else if (key === 'm') {
          addMetric();
        } else if (key === 'f') {
          addFrame();
        } else if (e.key === '?') {
          toggleShortcutsModal();
        } else if (key === '+' || key === '=') {
          if (window.CanvasEngine) window.CanvasEngine.zoomDelta(0.15);
        } else if (key === '-') {
          if (window.CanvasEngine) window.CanvasEngine.zoomDelta(-0.15);
        } else if (key === '0') {
          if (window.CanvasEngine) window.CanvasEngine.resetView();
        }
      }
    });

    // Board Title Input Sync
    const titleInput = document.getElementById('boardTitleInput');
    if (titleInput) {
      titleInput.addEventListener('input', () => {
        if (currentBoard) {
          currentBoard.title = titleInput.value;
          triggerAutoSave();
        }
      });
    }
  }

  function addTable() {
    if (!currentBoard) return;
    const center = getCanvasCenter();

    const newTable = {
      id: `table-${Date.now()}`,
      type: 'table',
      x: Math.round(center.x - 280),
      y: Math.round(center.y - 150),
      width: 560,
      zIndex: 12,
      title: 'Strategic Deliverables Matrix',
      badge: 'EXECUTION PLAN',
      headers: ['Strategic Phase', 'Target Output', 'Timeline & RoI'],
      rows: [
        ['01. Diagnostic Sprint', 'Friction Audit & Action Blueprint', 'Week 1–2'],
        ['02. Executive Advisory', 'Weekly Calibrations + Async Voice', 'Months 1–3'],
        ['03. Scale & Governance', 'Autonomous Team Protocols', 'Ongoing']
      ]
    };

    pushHistory();
    currentBoard.elements.push(newTable);
    const el = window.ElementsFactory.renderElement(newTable, canvasContainer);
    selectElement(el, newTable);
    triggerAutoSave();
  }

  function findElement(id) {
    return currentBoard ? currentBoard.elements.find(e => e.id === id) : null;
  }

  function findConnection(id) {
    return currentBoard ? currentBoard.connections.find(c => c.id === id) : null;
  }

  function reRenderElement(id) {
    const data = findElement(id);
    const oldEl = document.getElementById(id);
    if (data && oldEl) {
      oldEl.remove();
      const newEl = window.ElementsFactory.renderElement(data, canvasContainer);
      selectElement(newEl, data);
      if (window.ConnectorEngine && currentBoard) {
        window.ConnectorEngine.renderAllConnections(currentBoard.connections || []);
      }
    }
  }

  function addTableRow(id) {
    const data = findElement(id);
    if (data && data.rows) {
      pushHistory();
      const colCount = (data.headers && data.headers.length) || 3;
      const newRow = Array(colCount).fill('Editable detail...');
      data.rows.push(newRow);
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function removeTableRow(id) {
    const data = findElement(id);
    if (data && data.rows && data.rows.length > 1) {
      pushHistory();
      data.rows.pop();
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function addTableCol(id) {
    const data = findElement(id);
    if (data) {
      pushHistory();
      if (!data.headers) data.headers = [];
      data.headers.push(`Column ${data.headers.length + 1}`);
      if (data.rows) {
        data.rows.forEach(r => r.push('Detail...'));
      }
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function removeTableCol(id) {
    const data = findElement(id);
    if (data && data.headers && data.headers.length > 1) {
      pushHistory();
      data.headers.pop();
      if (data.rows) {
        data.rows.forEach(r => {
          if (r.length > 1) r.pop();
        });
      }
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function addFormField(id, type = 'textarea') {
    const data = findElement(id);
    if (data) {
      pushHistory();
      if (!data.fields) data.fields = [];
      const num = data.fields.length + 1;
      data.fields.push({
        id: `field-${Date.now()}`,
        type: type,
        label: `0${num}. Diagnostic Item / Question`,
        badge: type === 'input' ? 'SHORT' : 'DEEP',
        instructions: type === 'input' ? 'Single parameter or metric target:' : 'Client calibration and analysis details:',
        value: ''
      });
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function removeFormField(id, index) {
    const data = findElement(id);
    if (data && data.fields && data.fields.length > 0) {
      pushHistory();
      data.fields.splice(index, 1);
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function addPricingFeature(id) {
    const data = findElement(id);
    if (data) {
      pushHistory();
      if (!data.features) data.features = [];
      data.features.push('High-touch advisory deliverable...');
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function removePricingFeature(id, index) {
    const data = findElement(id);
    if (data && data.features && data.features.length > 0) {
      pushHistory();
      data.features.splice(index, 1);
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function addFrameBox(id) {
    const data = findElement(id);
    if (data) {
      pushHistory();
      if (!data.boxes) data.boxes = [];
      data.boxes.push({
        tag: 'STRATEGY',
        tagColor: 'gold',
        title: 'Tactical Pillar',
        content: 'Define execution protocols, ownership, and deliverables...'
      });
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function removeFrameBox(id, index) {
    const data = findElement(id);
    if (data && data.boxes && data.boxes.length > 0) {
      pushHistory();
      data.boxes.splice(index, 1);
      reRenderElement(id);
      triggerAutoSave();
    }
  }

  function exportJSON() {
    if (!currentBoard) return;
    const blob = new Blob([JSON.stringify(currentBoard, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentBoard.title ? currentBoard.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'board'}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function showToast(msg, type = 'info') {
    const toast = document.getElementById('studioToast');
    if (!toast) return;
    const text = toast.querySelector('.toast-text');
    if (text) text.textContent = msg;
    toast.className = 'studio-toast visible' + (type === 'warning' ? ' toast-warning' : type === 'error' ? ' toast-error' : '');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('visible');
    }, 2800);
  }

  function importJSON(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (!imported || !Array.isArray(imported.elements)) {
          showToast('Invalid canvas JSON: missing elements array.', 'error');
          return;
        }
        pushHistory();
        currentBoard = imported;
        if (!currentBoard.id) currentBoard.id = `imported-${Date.now()}`;
        document.getElementById('boardTitleInput').value = currentBoard.title || 'Imported Board';
        renderBoard();
        saveLocally();
        triggerAutoSave();
        showToast('Board imported successfully!');
        if (window.CanvasEngine && currentBoard.viewport) {
          window.CanvasEngine.setTransform(
            currentBoard.viewport.scale || 0.75,
            currentBoard.viewport.panX || 100,
            currentBoard.viewport.panY || 80
          );
        }
      } catch (err) {
        showToast('Could not parse board JSON file: ' + err.message, 'error');
      }
    };
    reader.readAsText(file);
  }

  function exportPNG() {
    if (!currentBoard || !window.CanvasEngine) return;
    const bounds = window.CanvasEngine.getCanvasBounds();

    const canvas = document.createElement('canvas');
    const padding = 60;
    const width = bounds.width + padding * 2;
    const height = bounds.height + padding * 2;

    canvas.width = Math.min(width * 2, 8000);
    canvas.height = Math.min(height * 2, 8000);
    const ctx = canvas.getContext('2d');
    ctx.scale(canvas.width / width, canvas.height / height);

    const isDark = document.body.classList.contains('theme-dark');

    // Canvas Background
    ctx.fillStyle = isDark ? '#080706' : '#FAF7F2';
    ctx.fillRect(0, 0, width, height);

    // Subtle Dot Grid
    ctx.fillStyle = isDark ? 'rgba(226, 199, 153, 0.15)' : 'rgba(26, 23, 21, 0.1)';
    for (let gx = 0; gx < width; gx += 34) {
      for (let gy = 0; gy < height; gy += 34) {
        ctx.beginPath();
        ctx.arc(gx, gy, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Render elements silhouettes & content
    document.querySelectorAll('.studio-element').forEach(el => {
      const left = (parseFloat(el.style.left) || 0) - bounds.minX + padding;
      const top = (parseFloat(el.style.top) || 0) - bounds.minY + padding;
      const w = el.offsetWidth || 200;
      const h = el.offsetHeight || 150;

      ctx.fillStyle = isDark ? '#141210' : '#FFFFFF';
      ctx.strokeStyle = isDark ? 'rgba(226, 199, 153, 0.35)' : 'rgba(26, 23, 21, 0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(left, top, w, h, 14);
      } else {
        ctx.rect(left, top, w, h);
      }
      ctx.fill();
      ctx.stroke();

      const heading = el.querySelector('h2, .sticky-header, .form-card-title, .table-title, .shape-content-text, .floating-text-inner');
      if (heading) {
        ctx.fillStyle = isDark ? '#F5E6D3' : '#1A1715';
        ctx.font = 'bold 16px sans-serif';
        ctx.fillText(heading.textContent.trim().slice(0, 34), left + 18, top + 36);
      }

      const desc = el.querySelector('p, .sticky-content, .field-instructions');
      if (desc) {
        ctx.fillStyle = isDark ? '#A8A096' : '#736D67';
        ctx.font = '13px sans-serif';
        ctx.fillText(desc.textContent.trim().slice(0, 48), left + 18, top + 64);
      }
    });

    // Draw freehand strokes
    (currentBoard.drawings || []).forEach(stroke => {
      if (stroke.points && stroke.points.length > 1) {
        ctx.strokeStyle = stroke.color || (isDark ? '#E2C799' : '#1A1715');
        ctx.lineWidth = stroke.width || 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        const startX = stroke.points[0].x - bounds.minX + padding;
        const startY = stroke.points[0].y - bounds.minY + padding;
        ctx.moveTo(startX, startY);
        for (let i = 1; i < stroke.points.length; i++) {
          ctx.lineTo(stroke.points[i].x - bounds.minX + padding, stroke.points[i].y - bounds.minY + padding);
        }
        ctx.stroke();
      }
    });

    const a = document.createElement('a');
    a.download = `${currentBoard.title ? currentBoard.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'board'}-export.png`;
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  let html2canvasLoadingPromise = null;
  function ensureHtml2Canvas() {
    if (typeof window.html2canvas === 'function') return Promise.resolve();
    if (html2canvasLoadingPromise) return html2canvasLoadingPromise;
    html2canvasLoadingPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = '/studio/js/html2canvas.min.js';
      s.onload = () => resolve();
      s.onerror = (e) => {
        html2canvasLoadingPromise = null;
        reject(e);
      };
      document.head.appendChild(s);
    });
    return html2canvasLoadingPromise;
  }

  /**
   * Export each board Frame as an individual high-res PNG.
   * Dynamically lazy-loads html2canvas on demand to save initial page weight.
   * @param {string|null} singleFrameId  If provided, exports only that frame.
   */
  async function exportFrames(singleFrameId) {
    if (!currentBoard) {
      showToast('No board loaded.', 'warning');
      return;
    }
    if (typeof window.html2canvas !== 'function') {
      try {
        showToast('Loading export engine…');
        await ensureHtml2Canvas();
      } catch (err) {
        showToast('Failed to load export engine.', 'warning');
        return;
      }
    }

    let frameEls = Array.from(document.querySelectorAll('.board-frame'));
    if (singleFrameId) {
      frameEls = frameEls.filter(el => el.id === singleFrameId);
    }

    if (frameEls.length === 0) {
      showToast('No frames found. Add a Frame to use Export Frames.', 'warning');
      return;
    }

    // Sort by frame number
    frameEls.sort((a, b) => {
      const nA = parseInt(a.querySelector('.frame-number')?.innerText || '99', 10);
      const nB = parseInt(b.querySelector('.frame-number')?.innerText || '99', 10);
      return nA - nB;
    });

    showToast(`Exporting ${frameEls.length} frame${frameEls.length > 1 ? 's' : ''}…`);

    const boardName = (currentBoard.title || 'board').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const scale = window.CanvasEngine ? window.CanvasEngine.getScale() : 1;
    const panX = window.CanvasPanZoom ? window.CanvasPanZoom.panX : 0;
    const panY = window.CanvasPanZoom ? window.CanvasPanZoom.panY : 0;

    for (let i = 0; i < frameEls.length; i++) {
      const frameEl = frameEls[i];
      const frameLeft = parseFloat(frameEl.style.left) || 0;
      const frameTop  = parseFloat(frameEl.style.top)  || 0;
      const frameW    = frameEl.offsetWidth;
      const frameH    = frameEl.offsetHeight;

      // Compute screen-space bounding box of the frame
      const screenX = Math.round(frameLeft * scale + panX);
      const screenY = Math.round(frameTop  * scale + panY);
      const screenW = Math.round(frameW * scale);
      const screenH = Math.round(frameH * scale);

      try {
        const canvas = await window.html2canvas(document.getElementById('canvas-container') || document.body, {
          x: screenX,
          y: screenY,
          width:  Math.max(screenW, 10),
          height: Math.max(screenH, 10),
          scale: Math.max(2, 2 / scale),   // always export at ≥2× retina
          useCORS: true,
          allowTaint: false,
          backgroundColor: document.body.classList.contains('theme-dark') ? '#080706' : '#FAF7F2',
          logging: false
        });

        const frameNum = String(i + 1).padStart(2, '0');
        const frameTitle = frameEl.querySelector('.frame-headline')?.innerText?.trim() || `frame-${frameNum}`;
        const slug = frameTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);

        const a = document.createElement('a');
        a.download = `${boardName}-${frameNum}-${slug}.png`;
        a.href = canvas.toDataURL('image/png');
        document.body.appendChild(a);
        a.click();
        a.remove();

        // Small stagger to avoid browser throttling multiple downloads
        await new Promise(r => setTimeout(r, 400));
      } catch (err) {
        console.warn('[exportFrames] Error capturing frame', i + 1, err);
        showToast(`Error capturing frame ${i + 1}.`, 'warning');
      }
    }

    showToast(`${frameEls.length} frame${frameEls.length > 1 ? 's' : ''} exported.`);
  }

  function toggleCameraBubble() {
    if (window.StudioCamera) {
      window.StudioCamera.toggle();
    }
  }

  function loadTemplate(templateKey) {
    if (!currentBoard) return;
    pushHistory();

    let title = "Untitled Board";
    let newElements = [];
    let newConnections = [];

    if (window.TemplatesVault && typeof window.TemplatesVault.getTemplate === "function") {
      const tpl = window.TemplatesVault.getTemplate(templateKey);
      title = tpl.title;
      newElements = tpl.elements;
      newConnections = tpl.connections;
    } else {
      const starter = getBuiltinStarterBoard();
      title = starter.title;
      newElements = starter.elements;
      newConnections = starter.connections;
    }

    currentBoard.title = title;
    currentBoard.templateKey = templateKey;
    currentBoard.elements = newElements;
    currentBoard.connections = newConnections;
    currentBoard.drawings = [];

    // Apply active currency
    const activeCur = localStorage.getItem('polish_studio_currency') || 'AED';
    currentBoard.currency = activeCur;
    document.querySelectorAll('.dock-currency-picker .currency-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.currency === activeCur);
    });
    if (activeCur !== 'AED') {
      applyCurrencyToElements(currentBoard.elements, activeCur);
    }

    const input = document.getElementById('boardTitleInput');
    if (input) input.value = title;
    renderBoard();
    saveLocally();
    triggerAutoSave();
    if (window.StudioAI && window.StudioAI.onTemplateLoaded) {
      window.StudioAI.onTemplateLoaded(templateKey);
    }
    if (window.CanvasEngine) {
      window.CanvasEngine.fitToContent();
    }
  }

  function toggleShortcutsModal() {
    const modal = document.getElementById('shortcutsModal');
    if (!modal) return;
    modal.classList.toggle('visible');
  }

  return {
    init,
    pushHistory: () => pushHistory(),
    selectElement,
    selectConnection,
    selectStroke,
    deselectAll,
    setMultiSelected,
    clearMultiSelection,
    updateElementPosition,
    addFrame,
    addStrategyCard,
    addFrameBox,
    removeFrameBox,
    addSticky,
    addShape,
    addText,
    addDrawingStroke,
    addPricing,
    addPricingFeature,
    removePricingFeature,
    addMetric,
    addCallout,
    addRoutineStep,
    addOlfactoryPyramid,
    addUgcBrief,
    addClinicalProof,
    addTable,
    addTableRow,
    removeTableRow,
    addTableCol,
    removeTableCol,
    addForm,
    addFormField,
    removeFormField,
    addScript,
    addConnection,
    duplicateSelected,
    deleteSelected,
    toggleLockSelected,
    bringForward,
    sendBackward,
    triggerAutoSave,
    saveBoardDebounced: triggerAutoSave,
    undo,
    redo,
    exportJSON,
    importJSON,
    exportPNG,
    exportFrames,
    toggleCameraBubble,
    takeCameraSnapshot: toggleCameraBubble,
    loadTemplate,
    toggleTheme,
    toggleShortcutsModal,
    setBoardCurrency,
    formatConvertedText,
    getBoardCurrency: () => (currentBoard && currentBoard.currency) || 'AED',
    getConnections: () => (currentBoard ? currentBoard.connections || [] : []),
    getCurrentBoard: () => currentBoard,
    getElements: () => (currentBoard ? currentBoard.elements || [] : []),
    findElement,
    findConnection,
    reRenderElement,
    getCurrentBoardId: () => (currentBoard ? currentBoard.id : null),
    getSelectedElementData: () => selectedElementData,
    showToast
  };
})();
