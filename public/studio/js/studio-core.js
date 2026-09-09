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
    return {
      id: 'starter-strategy-board',
      slug: 'executive-strategy-template',
      title: 'Executive Client Acquisition & Retainer Blueprint',
      client: 'Private Advisory Client',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewport: { panX: 60, panY: 60, scale: 0.55 },
      elements: [
        // ==========================================================
        // FRAME 00: EXECUTIVE CONTROL CENTER & SYSTEM LEGEND
        // ==========================================================
        {
          id: 'frame-control-center',
          type: 'frame',
          x: 80,
          y: 100,
          width: 540,
          height: 560,
          zIndex: 10,
          frameNumber: '00',
          titlePill: 'EXECUTIVE CONTROL CENTER',
          headline: 'System Legend &',
          serifAccent: 'Strategic Thesis',
          description: 'High-ticket advisory architecture mapping attention disruption, diagnostic qualification, and client conversion.',
          boxes: [
            {
              tag: 'VISUAL SEMANTICS',
              tagColor: 'gold',
              title: 'Color Coded Flow Logic',
              content: '• Sky Azure: Automated Flows & Tech Stack\n• Haute Gold: Strategic Architecture Pillars\n• Mint Sage: High-Ticket Revenue & Retainers\n• Rose: Friction Bottlenecks Solved'
            },
            {
              tag: 'NORTH STAR KPIS',
              tagColor: 'blue',
              title: '90-Day Conversion Benchmarks',
              content: '• Blended MER: 3.8x+ across ad spend\n• Diagnostic to Retainer CVR: 60%+\n• Client Retainer LTV: AED 18,500/quarter\n• Founder Delivery Time: Under 4 hrs/week'
            }
          ]
        },

        // ==========================================================
        // FRAME 01: PHASE 01 • ACQUISITION & ATTENTION (TOFU)
        // ==========================================================
        {
          id: 'frame-foundation',
          type: 'frame',
          x: 680,
          y: 100,
          width: 660,
          height: 560,
          zIndex: 10,
          frameNumber: '01',
          titlePill: 'PHASE 01 • ATTENTION & TRAFFIC',
          headline: 'Advantage+ & Creator',
          serifAccent: 'Prospecting Engine',
          description: 'Engineering a predictable net-new customer acquisition machine via isolated DCT sandbox campaigns and advertorial bridges.',
          boxes: [
            {
              tag: 'PROSPECTING SANDBOX',
              tagColor: 'gold',
              title: 'Dynamic Creative Testing (DCT)',
              content: '3 video thumbstop variations x 2 body messaging angles tested in isolated sandbox campaigns before graduation to ASC core budget.'
            },
            {
              tag: 'LANDING PAGE LIFT',
              tagColor: 'blue',
              title: 'Dedicated Advertorial Presell',
              content: 'Directing high-intent clicks to editorial advertorials explaining clinical formulation science, lifting conversion velocity by 34%.'
            }
          ]
        },

        // ==========================================================
        // FRAME 02: PHASE 02 • AUTHORITY & DIAGNOSTIC (MOFU)
        // ==========================================================
        {
          id: 'frame-nurture',
          type: 'frame',
          x: 1400,
          y: 100,
          width: 660,
          height: 560,
          zIndex: 10,
          frameNumber: '02',
          titlePill: 'PHASE 02 • AUTHORITY & BELIEF',
          headline: 'Diagnostic Audit &',
          serifAccent: 'Belief Architecture',
          description: 'Filtering non-serious prospects through a 60-min friction audit and asynchronous video proof sequences.',
          boxes: [
            {
              tag: 'TIER 1 • DIAGNOSTIC',
              tagColor: 'blue',
              title: 'The 60-Min Life Friction Audit',
              content: 'One-time diagnostic mapping pace fatigue, decision paralysis, and boundary erosion. Delivers a custom 1-page action blueprint.'
            },
            {
              tag: 'PROOF ASSET',
              tagColor: 'rose',
              title: 'VIP WhatsApp Voice Notes Hotline',
              content: 'Private async voice notes and weekly calibration audio teardowns establishing trusted confidential peer authority.'
            }
          ]
        },

        // ==========================================================
        // FRAME 03: PHASE 03 • CONVERSION & RETAINERS (BOFU)
        // ==========================================================
        {
          id: 'frame-offer',
          type: 'frame',
          x: 2120,
          y: 100,
          width: 660,
          height: 560,
          zIndex: 10,
          frameNumber: '03',
          titlePill: 'PHASE 03 • CONVERSION & RETAINER',
          headline: 'Two-Tier Retainer',
          serifAccent: 'Closing Architecture',
          description: 'Converting qualified diagnostic leads into recurring private advisory contracts capped at 5 active clients.',
          boxes: [
            {
              tag: 'TIER 2 • CORE RETAINER',
              tagColor: 'green',
              title: '30-Day Executive Reset Container',
              content: 'Bi-weekly private calibrations + VIP async WhatsApp access. Replaces low-ticket fatigue with predictable sovereign revenue.'
            },
            {
              tag: 'GOVERNANCE',
              tagColor: 'gold',
              title: 'Boutique Sovereign Protocol',
              content: 'Roster capped strictly at 5 active clients to preserve executive peace, impeccable aura, and uncompromising pricing power.'
            }
          ]
        },

        // ==========================================================
        // RETAINER OFFER CARD
        // ==========================================================
        {
          id: 'pricing-1',
          type: 'pricing',
          x: 2840,
          y: 100,
          width: 360,
          zIndex: 15,
          isFeatured: true,
          badge: 'HAUTE ADVISORY RETAINER',
          currency: 'AED',
          figure: '18,500',
          period: 'Quarterly Private Retainer',
          features: [
            'Bi-weekly In-Person or Private Zoom Calibrations',
            'Direct VIP WhatsApp Async Voice Hotline',
            'End-to-End Retention Architecture Blueprint',
            'Complete Team Protocols & Governance Handover'
          ]
        },

        // ==========================================================
        // STRATEGIC WASHI STICKY NOTES
        // ==========================================================
        {
          id: 'sticky-1',
          type: 'sticky',
          x: 620,
          y: 20,
          width: 250,
          height: 170,
          zIndex: 25,
          color: 'yellow',
          rotation: -2,
          hasTape: true,
          header: 'OPERATING RULE 01',
          content: 'Never pitch retainers cold. The Tier 1 diagnostic audit filters tire-kickers and converts at 60%+ into Tier 2.',
          footer: 'REF: POLISH-PROTO'
        },
        {
          id: 'sticky-2',
          type: 'sticky',
          x: 1340,
          y: 20,
          width: 250,
          height: 170,
          zIndex: 25,
          color: 'rose',
          rotation: 1.5,
          hasTape: true,
          header: 'OPERATING RULE 02',
          content: 'Cap active advisory roster strictly at 5–6 clients to maintain bespoke focus and uncompromising pricing leverage.',
          footer: 'REF: POLISH-LADDER'
        },
        {
          id: 'sticky-3',
          type: 'sticky',
          x: 2060,
          y: 20,
          width: 250,
          height: 170,
          zIndex: 25,
          color: 'blue',
          rotation: -1.5,
          hasTape: true,
          header: 'OPERATING RULE 03',
          content: 'Automate post-intake delivery via VIP audio voice memo within 24 hours of diagnostic completion.',
          footer: 'REF: POLISH-SPEED'
        },

        // ==========================================================
        // INTAKE ENGINE (DIAGNOSTIC WORKSHEET)
        // ==========================================================
        {
          id: 'form-1',
          type: 'form',
          x: 680,
          y: 720,
          width: 660,
          zIndex: 12,
          title: 'Brand Diagnostic Intake Worksheet',
          badge: 'INTAKE ENGINE',
          desc: 'Calibrate core operational friction points prior to executive kickoff sprint.',
          fields: [
            {
              id: 'field-diag-1',
              type: 'textarea',
              label: '01. Primary Conversion / Retention Friction',
              badge: 'DIAGNOSTIC',
              instructions: 'Where is the largest bottleneck between customer acquisition and 90-day repeat LTV?',
              value: 'Ad spend efficiency drops after second purchase; need bespoke high-ticket retention sequence.'
            },
            {
              id: 'field-diag-2',
              type: 'input',
              label: '02. Target 90-Day Gross Revenue Benchmark (AED / $)',
              badge: 'METRIC',
              instructions: 'Current baseline vs Q4 goal:',
              value: 'Current $85k/mo → Target $160k/mo'
            }
          ]
        },

        // ==========================================================
        // DELIVERABLES MATRIX (ROADMAP TABLE)
        // ==========================================================
        {
          id: 'table-1',
          type: 'table',
          x: 1400,
          y: 720,
          width: 780,
          zIndex: 12,
          title: '90-Day Scaling Trajectory & Quarterly Milestones',
          badge: 'EXECUTION ROADMAP',
          headers: ['Phase', 'Focus Area', 'Target Metric', 'Deliverable Output'],
          rows: [
            ['Phase 01: Audit', 'Baseline Diagnostic & Creative Sandbox', '2.8x - 3.2x MER', '3:2:2 DCT Ads + Advertorial Bridge'],
            ['Phase 02: Authority', 'Executive Reset & Advisory Launch', '+60% Diagnostic CVR', 'VIP Retainer & WhatsApp Hotline Setup'],
            ['Phase 03: Scaling', 'Autonomous Governance & Handover', 'Zero Founder Fatigue', 'Full SOP Handover & Protocol Runbook']
          ]
        },

        // ==========================================================
        // THESIS SCRIPT CARD
        // ==========================================================
        {
          id: 'script-1',
          type: 'script',
          x: 2240,
          y: 720,
          width: 480,
          height: 190,
          zIndex: 12,
          content: '"High-ticket category authority is not achieved by shouting louder. It is engineered through diagnostic precision, structured containers, and uncompromising pricing power."'
        }
      ],
      connections: [
        {
          id: 'conn-ctrl-1',
          from: 'frame-control-center',
          fromAnchor: 'right',
          to: 'frame-foundation',
          toAnchor: 'left',
          style: 'solid',
          color: 'gold',
          label: 'Phase 01 Launch'
        },
        {
          id: 'conn-1',
          from: 'frame-foundation',
          fromAnchor: 'right',
          to: 'frame-nurture',
          toAnchor: 'left',
          style: 'dashed',
          color: 'blue',
          label: 'High-Intent Prospecting Traffic'
        },
        {
          id: 'conn-2',
          from: 'frame-nurture',
          fromAnchor: 'right',
          to: 'frame-offer',
          toAnchor: 'left',
          style: 'solid',
          color: 'green',
          label: '60%+ Audit Qualification'
        },
        {
          id: 'conn-3',
          from: 'frame-offer',
          fromAnchor: 'right',
          to: 'pricing-1',
          toAnchor: 'left',
          style: 'solid',
          color: 'gold',
          label: 'Quarterly Retainer Contract'
        },
        {
          id: 'conn-4',
          from: 'frame-foundation',
          fromAnchor: 'bottom',
          to: 'form-1',
          toAnchor: 'top',
          style: 'dashed',
          color: 'slate',
          label: 'Friction Intake Calibration'
        },
        {
          id: 'conn-5',
          from: 'frame-nurture',
          fromAnchor: 'bottom',
          to: 'table-1',
          toAnchor: 'top',
          style: 'dashed',
          color: 'slate',
          label: '90-Day Milestone Execution'
        }
      ]
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
        const res = await fetch(`/api/boards/${encodeURIComponent(currentBoard.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
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
  // MULTI-CURRENCY ENGINE (DZD, AED, USD, EUR)
  // ==========================================================
  const CURRENCY_PRESETS = [
    { AED: 'AED 75,000', USD: '$ 20,000', EUR: '€ 18,500', DZD: '2,800,000 DZD' },
    { AED: 'AED 800', USD: '$ 250', EUR: '€ 220', DZD: '30,000 DZD' },
    { AED: 'AED 3,250', USD: '$ 900', EUR: '€ 820', DZD: '120,000 DZD' },
    { AED: 'AED 380', USD: '$ 100', EUR: '€ 95', DZD: '14,000 DZD' },
    { AED: 'AED 12,500', USD: '$ 3,400', EUR: '€ 3,100', DZD: '460,000 DZD' },
    { AED: 'AED 25,000', USD: '$ 6,800', EUR: '€ 6,200', DZD: '925,000 DZD' },
    { AED: 'AED 28,000', USD: '$ 7,600', EUR: '€ 7,000', DZD: '1,050,000 DZD' },
    { AED: 'AED 35,500', USD: '$ 9,600', EUR: '€ 8,800', DZD: '1,300,000 DZD' },
    { AED: 'AED 23,000', USD: '$ 6,200', EUR: '€ 5,700', DZD: '850,000 DZD' },
    { AED: 'AED 180,000', USD: '$ 49,000', EUR: '€ 45,000', DZD: '6,600,000 DZD' },
    { AED: 'AED 185,000', USD: '$ 50,000', EUR: '€ 46,000', DZD: '6,800,000 DZD' },
    { AED: 'AED 8,500', USD: '$ 2,300', EUR: '€ 2,100', DZD: '310,000 DZD' },
    { AED: 'AED 15,000', USD: '$ 4,000', EUR: '€ 3,700', DZD: '550,000 DZD' },
    { AED: 'AED 420', USD: '$ 115', EUR: '€ 105', DZD: '15,500 DZD' },
    { AED: 'AED 180', USD: '$ 50', EUR: '€ 45', DZD: '6,600 DZD' },
    { AED: 'AED 4,500', USD: '$ 1,200', EUR: '€ 1,100', DZD: '165,000 DZD' },
    { AED: '267.00', USD: '72.50', EUR: '66.75', DZD: '9,880' },
    { AED: '44.50', USD: '12.00', EUR: '11.10', DZD: '1,650' },
    { AED: '17.80', USD: '4.85', EUR: '4.45', DZD: '660' },
    { AED: '0.80', USD: '0.22', EUR: '0.20', DZD: '30' }
  ];

  const CURRENCY_SYMBOLS = {
    AED: 'AED',
    USD: '$',
    EUR: '€',
    DZD: 'DZD'
  };

  function formatConvertedText(text, targetCurrency) {
    if (!text || typeof text !== 'string') return text;
    let res = text;

    // 1. Calibrated Presets Check (bidirectional across all currencies)
    for (const set of CURRENCY_PRESETS) {
      for (const [cur, val] of Object.entries(set)) {
        if (res.includes(val)) {
          res = res.split(val).join(set[targetCurrency]);
        }
      }
    }

    // 2. Generic Currency Headers and Symbols
    const sym = CURRENCY_SYMBOLS[targetCurrency] || targetCurrency;
    res = res.replace(/\((?:AED|USD|\$|EUR|€|DZD|DA)\)/gi, `(${sym})`);
    return res;
  }

  function applyCurrencyToElements(elements, currency) {
    if (!Array.isArray(elements)) return;
    elements.forEach(el => {
      if (el.type === 'metric') {
        el.currency = currency;
        if (el.figure) el.figure = formatConvertedText(el.figure, currency);
        if (el.subtitle) el.subtitle = formatConvertedText(el.subtitle, currency);
      } else if (el.type === 'pricing') {
        el.currency = (currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency);
        if (el.figure) el.figure = formatConvertedText(el.figure, currency).replace(/[^0-9,.]/g, '');
        if (el.totalValue) el.totalValue = formatConvertedText(el.totalValue, currency);
        if (el.price) el.price = formatConvertedText(el.price, currency);
        if (el.savings) el.savings = formatConvertedText(el.savings, currency);
      } else if (el.type === 'table') {
        if (Array.isArray(el.headers)) {
          el.headers = el.headers.map(h => formatConvertedText(h, currency));
        }
        if (Array.isArray(el.rows)) {
          el.rows = el.rows.map(row => row.map(cell => formatConvertedText(cell, currency)));
        }
      } else if (el.type === 'prescription') {
        if (el.fee) el.fee = formatConvertedText(el.fee, currency);
        if (Array.isArray(el.stages)) {
          el.stages = el.stages.map(st => {
            if (st.desc) st.desc = formatConvertedText(st.desc, currency);
            return st;
          });
        }
      } else if (el.type === 'diagnostic-protocol') {
        if (Array.isArray(el.stages)) {
          el.stages = el.stages.map(st => {
            if (st.desc) st.desc = formatConvertedText(st.desc, currency);
            return st;
          });
        }
      }
    });
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

  /**
   * Export each board Frame as an individual high-res PNG.
   * Uses html2canvas (already loaded) to capture the live DOM per frame.
   * @param {string|null} singleFrameId  If provided, exports only that frame.
   */
  async function exportFrames(singleFrameId) {
    if (!currentBoard) {
      showToast('No board loaded.', 'warning');
      return;
    }
    if (typeof window.html2canvas !== 'function') {
      showToast('html2canvas not loaded.', 'warning');
      return;
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

    let newElements = [];
    let newConnections = [];
    let title = 'Untitled Board';

    if (templateKey === 'blank') {
      title = 'Blank Canvas';
      newElements = [];
      newConnections = [];
    } else if (templateKey === 'hormozi-offer' || templateKey === 'hormozi') {
      title = 'Alex Hormozi • $100M Grand Slam Offer & Value Equation Canvas';
      const veId = `ve-hz-${Date.now()}`;
      const stackId = `stack-hz-${Date.now()}`;
      const priceId = `pricing-hz-${Date.now()}`;
      const tblId = `table-hz-${Date.now()}`;
      const metricId = `metric-hz-${Date.now()}`;
      const s1Id = `sticky-hz-1-${Date.now()}`;
      const s2Id = `sticky-hz-2-${Date.now()}`;

      newElements = [
        {
          id: veId,
          type: 'value-equation',
          x: 100,
          y: 120,
          width: 740,
          title: 'The $100M Value Equation',
          scoreBadge: 'SCORE: 98.4 / 100',
          dreamOutcome: { title: 'Executive Prestige & Clinical Transformation', desc: 'Flawless complexion, eliminated rosacea flare-ups, and Paris laboratory status.' },
          likelihood: { title: '56-Day Double-Blind French Laboratory Proof', desc: '42% statistically verified barrier thickness lift with ISO bio-safety trials.' },
          timeDelay: { title: '12-Hour Overnight Micro-Relief', desc: 'Noticeable reduction in skin inflammation and redness on Night 1.' },
          effort: { title: '1-Step Precision Metered Protocol', desc: 'Single metered dropper replaces morning and evening 10-step multi-product confusion.' },
          footerLaw: 'Mathematical Law: When Denominator (Time × Effort) Approaches 0, Perceived Value Approaches Infinity.'
        },
        {
          id: stackId,
          type: 'bonus-stack',
          x: 880,
          y: 120,
          width: 480,
          title: 'Trim & Stack Grand Slam Offer',
          items: [
            { title: 'Core: 50ml Copper Peptide Barrier Emulsion', desc: 'Micro-encapsulated copper peptides in frosted French flint glass', strike: 'AED 6,500' },
            { title: 'Speed: Rose-Gold Cryo-Sculpt Contouring Tool', desc: 'Accelerates lymphatic drainage and facial contouring in 3 minutes', strike: 'AED 4,200' },
            { title: 'Certainty: Private Biochemist Skin Health Hotline', desc: '24/7 WhatsApp VIP formulation hotline for seasonal dosage adjustments', strike: 'AED 12,000' },
            { title: 'Guarantee: 100% Empty-Bottle Risk Reversal', desc: 'Keep the cryo-tool and get full refund if skin fails to transform in 60 days', strike: 'AED 8,500' }
          ],
          totalValue: 'AED 31,200',
          price: 'AED 12,500 / mo'
        },
        {
          id: priceId,
          type: 'pricing',
          x: 1400,
          y: 120,
          width: 380,
          isFeatured: true,
          badge: '$100M GRAND SLAM VIP RETAINER',
          currency: 'AED',
          figure: '12,500',
          period: '/ Month (Quarterly Commitment)',
          features: [
            '3-Month Active Regimen Batch (3x 50ml French Flint Glass)',
            'Rose-Gold Cryo-Sculpt Contouring Tool Included',
            'Direct VIP WhatsApp Hotline to Senior Biochemist',
            '100% Empty-Bottle Unconditional Money-Back Guarantee',
            'Complimentary Collector Travel Pouch & Silk Sleeping Mask'
          ]
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 800,
          width: 860,
          title: 'Hormozi Problem-to-Solution Deliverable Stack',
          badge: 'VALUE MATRIX',
          headers: ['Client Friction / Fear', 'Underlying Bottleneck', 'Grand Slam Deliverable', 'Perceived Value (AED)'],
          rows: [
            ['Active irritation & redness', 'Molecular formula instability', '5.2% Micro-Encapsulated Peptides', '4,200'],
            ['Complex multi-step routines', 'Lack of vanity mirror clarity', 'Magnetic 1-Step Routine Mirror Card', '650'],
            ['Fear formula will fail on skin', 'Previous bad brand experiences', '56-Day Laboratory Proof Dossier', '5,000'],
            ['Running out of bottle unexpectedly', 'DTC replenishment friction', 'Automated 45-Day Refill Concierge', '2,400']
          ]
        },
        {
          id: metricId,
          type: 'metric',
          x: 1000,
          y: 800,
          width: 320,
          title: 'VALUE TO PRICE RATIO',
          badge: '10:1 VALUE ASYMMETRY',
          deltaColor: 'tag-gold',
          figure: '10x Value',
          subtitle: 'AED 31,200 Stacked Worth / AED 12,500 Investment'
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1360,
          y: 800,
          width: 280,
          height: 190,
          color: 'yellow',
          rotation: -1.5,
          hasTape: true,
          header: 'THE GUARANTEE',
          content: 'The Empty-Bottle Guarantee: "If your skin does not visibly transform in 60 days, we return 100% of your investment and you keep the cryo-tool."',
          footer: 'RISK REVERSAL'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1680,
          y: 800,
          width: 280,
          height: 190,
          color: 'rose',
          rotation: 2,
          hasTape: true,
          header: 'HORMOZI LAW',
          content: 'Never compete on price. When you drop prices, you attract customers who complain the most and refer the least. Double the price and 10x the perceived value.',
          footer: 'PRICING DISCIPLINE'
        }
      ];

      newConnections = [
        { id: `conn-hz-1`, from: veId, fromAnchor: 'right', to: stackId, toAnchor: 'left', style: 'solid', color: 'gold', label: 'Value Equation → Bonus Stack' },
        { id: `conn-hz-2`, from: stackId, fromAnchor: 'right', to: priceId, toAnchor: 'left', style: 'solid', color: 'green', label: 'Stacked Retainer' }
      ];
    } else if (templateKey === 'ottley-ai' || templateKey === 'ottley') {
      title = 'Liam Ottley • AI Automation & Autonomous Systems Pipeline';
      const n1Id = `node-ot-1-${Date.now()}`;
      const n2Id = `node-ot-2-${Date.now()}`;
      const n3Id = `node-ot-3-${Date.now()}`;
      const n4Id = `node-ot-4-${Date.now()}`;
      const tblId = `table-ot-${Date.now()}`;
      const metricId = `metric-ot-${Date.now()}`;
      const s1Id = `sticky-ot-1-${Date.now()}`;
      const s2Id = `sticky-ot-2-${Date.now()}`;

      newElements = [
        {
          id: n1Id,
          type: 'pipeline-node',
          x: 100,
          y: 120,
          width: 380,
          nodeId: 'NODE_01: INGESTION',
          status: 'ONLINE 200 OK',
          title: 'Autonomous Ingestion Webhook',
          desc: 'Captures brand intake responses, gross ad spend, and SKU catalogs instantly from form submissions.',
          tech: ['Cloudflare Worker', 'Make.com Webhook', 'REST API'],
          steps: [
            'Ingests form JSON payload in <120ms',
            'Normalizes currency and spend metrics',
            'Emits event to scoring agent queue'
          ],
          latency: 'Latency: <120ms',
          compute: 'Cost: $0.0018 / run'
        },
        {
          id: n2Id,
          type: 'pipeline-node',
          x: 520,
          y: 120,
          width: 380,
          nodeId: 'NODE_02: CLASSIFIER',
          status: 'ONLINE 200 OK',
          title: 'Gemini 3.5 Classifier Agent',
          desc: 'Evaluates qualification criteria: flags brands with > $30k/mo media spend for VIP executive lane.',
          tech: ['Gemini 3.5 Flash', 'Structured JSON Schema'],
          steps: [
            'Validates MER and monthly media spend',
            'Extracts target demographic archetypes',
            'Assigns qualification tier & priority route'
          ],
          latency: 'Latency: <850ms',
          compute: 'Cost: $0.0042 / run'
        },
        {
          id: n3Id,
          type: 'pipeline-node',
          x: 940,
          y: 120,
          width: 380,
          nodeId: 'NODE_03: RAG SYNTHESIS',
          status: 'ONLINE 200 OK',
          title: 'Vector RAG & Clinical Lab DB',
          desc: 'Grounds brand offer in clinical laboratory research papers, formulation bio-safety, and regulatory trials.',
          tech: ['Supabase pgvector', 'OpenAI Embeddings', 'ISO 11930 DB'],
          steps: [
            'Vector semantic search against 500+ lab trials',
            'Synthesizes 3 clinical differentiator claims',
            'Prepares audit brief for human sign-off'
          ],
          latency: 'Latency: <1.4s',
          compute: 'Cost: $0.0075 / run'
        },
        {
          id: n4Id,
          type: 'pipeline-node',
          x: 1360,
          y: 120,
          width: 380,
          nodeId: 'NODE_04: DISPATCH',
          status: 'ONLINE 200 OK',
          title: 'POLISH Board Auto-Spawning',
          desc: 'Auto-instantiates password-protected Whiteboard Studio instance and synchronizes with HubSpot CRM.',
          tech: ['POLISH Board API', 'HubSpot Webhook', 'WhatsApp API'],
          steps: [
            'Generates interactive custom Miro canvas',
            'Dispatches VIP WhatsApp calendar invite',
            'Logs opportunity to enterprise sales CRM'
          ],
          latency: 'Latency: <420ms',
          compute: 'Cost: $0.0021 / run'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 640,
          width: 900,
          title: 'Liam Ottley Autonomous Systems Integration Architecture',
          badge: 'SYSTEMS TELEMETRY',
          headers: ['Node ID', 'Agent / Tool', 'Input Trigger', 'Latency Target', 'Fallback Protocol'],
          rows: [
            ['01_INGEST', 'Cloudflare Worker Webhook', 'Intake Form Submission', '< 150ms', 'Dead-Letter Queue + Retries'],
            ['02_SCORE', 'Gemini 3.5 Flash', 'Ad Spend & Revenue Profile', '< 1.4s', 'Senior Advisor Manual Review'],
            ['03_SYNTHESIS', 'Vector Knowledge RAG', 'Cosmetic Clinical DB', '< 2.8s', 'Fallback to Cached Standard'],
            ['04_DISPATCH', 'POLISH Whiteboard API', 'Dossier Payload', '< 650ms', 'Auto-Retry with Backoff']
          ]
        },
        {
          id: metricId,
          type: 'metric',
          x: 1040,
          y: 640,
          width: 320,
          title: 'PIPELINE TIME-TO-DELIVERY',
          badge: '98.4% AUTONOMOUS',
          deltaColor: 'tag-green',
          figure: '3.8 Minutes',
          subtitle: 'Intake-to-Dossier Turnaround vs 48 Hours Manual'
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1400,
          y: 640,
          width: 280,
          height: 190,
          color: 'mint',
          rotation: -1.5,
          hasTape: true,
          header: 'OTTLEY AAA RULE',
          content: 'Never sell customized one-off code when you can standardize modular systems. Productize your AI agency architecture into repeatable nodes.',
          footer: 'SYSTEM SCALE'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1720,
          y: 640,
          width: 280,
          height: 190,
          color: 'noir',
          rotation: 2,
          hasTape: true,
          header: 'HUMAN IN THE LOOP',
          content: 'AI handles 95% of the data gathering and drafting; humans provide the sovereign executive judgment that commands $25,000 advisory fees.',
          footer: 'QUALITY GATE'
        }
      ];

      newConnections = [
        { id: `conn-ot-1`, from: n1Id, fromAnchor: 'right', to: n2Id, toAnchor: 'left', style: 'solid', color: 'gold', label: '1. Ingest Payload' },
        { id: `conn-ot-2`, from: n2Id, fromAnchor: 'right', to: n3Id, toAnchor: 'left', style: 'solid', color: 'green', label: '2. Qualified Tier' },
        { id: `conn-ot-3`, from: n3Id, fromAnchor: 'right', to: n4Id, toAnchor: 'left', style: 'solid', color: 'gold', label: '3. Audit Dossier' }
      ];
    } else if (templateKey === 'bradley-inbound' || templateKey === 'bradley') {
      title = 'Chris Bradley • High-Ticket Inbound & Diagnostic Closing Blueprint';
      const f1Id = `frame-cb-1-${Date.now()}`;
      const diagId = `diag-cb-${Date.now()}`;
      const rxId = `rx-cb-${Date.now()}`;
      const formId = `form-cb-${Date.now()}`;
      const s1Id = `sticky-cb-1-${Date.now()}`;
      const s2Id = `sticky-cb-2-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 540,
          height: 540,
          frameNumber: '01',
          titlePill: 'AUTHORITY MEDIA',
          headline: '12-Minute Inbound',
          serifAccent: 'Authority Breakdown',
          description: 'Attracting high-net-worth beauty brand founders through undeniable proof breakdowns, zero sales chasing.',
          boxes: [
            { tag: 'AUTHORITY VIDEO', tagColor: 'gold', title: 'Unit Economics Deconstruction', content: 'Publishing 20-minute deconstructions of formulation economics and Meta Advantage+ ad spend leakage.' },
            { tag: 'DIAGNOSTIC BRIDGE', tagColor: 'blue', title: 'Clinical Diagnostic Intake', content: 'Positioning the initial consultation as an objective clinical diagnostic rather than a generic sales call.' }
          ]
        },
        {
          id: diagId,
          type: 'diagnostic-protocol',
          x: 680,
          y: 120,
          width: 680,
          title: 'Consultative Diagnostic & Prescription Protocol',
          stages: [
            { roman: 'STAGE I', title: 'Symptom Elicitation', desc: 'Identify visible pain: client complains of Meta CAC inflation and high single-purchase churn.' },
            { roman: 'STAGE II', title: 'Root Pathophysiology', desc: 'Diagnose systemic leak: lack of clinical authority assets and failure to package regimen routine bundles.' },
            { roman: 'STAGE III', title: 'Cost of Inaction Prognosis', desc: 'Compound impact: continuing current tactics burns AED 180,000 in wasted ad spend over 12 months.' },
            { roman: 'STAGE IV', title: 'Prescription of Care', desc: 'Prescribe 90-Day Sovereign Container: Parisian lab positioning, DTC regimen rebrand, and Meta ASC creative.' },
            { roman: 'STAGE V', title: 'The Silence Rule', desc: 'State fee with absolute certainty: AED 25,000 / mo quarterly retainer. Stop speaking and hold the frame.' }
          ]
        },
        {
          id: rxId,
          type: 'prescription',
          x: 1400,
          y: 120,
          width: 420,
          title: 'Sovereign Advisory Retainer Rx',
          fee: 'AED 25,000 / Month',
          term: 'Closed-Door 90-Day Container Commitment',
          term1: 'Bi-Weekly 1-on-1 Consultative Diagnostic & Growth Offsite',
          term2: '24/7 Async Sovereign Partner WhatsApp Hotline',
          term3: 'Creative Sandbox Teardowns & Multi-Touch Funnel Architecture'
        },
        {
          id: formId,
          type: 'form',
          x: 100,
          y: 760,
          width: 660,
          title: 'Chris Bradley 4-Pillar Diagnostic Intake Worksheet',
          badge: 'DIAGNOSTIC INTAKE',
          desc: 'Complete prior to client presentation to calibrate the prescription of care.',
          fields: [
            { id: 'cb-1', type: 'input', label: '01. Current Monthly Gross Revenue & Media Spend (AED / $)', badge: 'METRIC', instructions: 'What is the blended media spend and contribution margin?', value: '$65,000 / mo spend • 4.2x Target MER' },
            { id: 'cb-2', type: 'textarea', label: '02. Primary Operational Growth Bottleneck', badge: 'DIAGNOSTIC', instructions: 'Where is founder attention or cashflow experiencing friction?', value: 'Creative fatigue on Meta every 14 days and single-purchase replenishment churn.' }
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 800,
          y: 780,
          width: 290,
          height: 200,
          color: 'yellow',
          rotation: -1.5,
          hasTape: true,
          header: 'DOCTOR-PATIENT FRAME',
          content: 'Top surgeons never chase patients down the hall or offer holiday discounts. They diagnose the illness with calm authority, prescribe the treatment, and state the fee.',
          footer: 'BRADLEY PRINCIPLE'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1120,
          y: 780,
          width: 290,
          height: 200,
          color: 'rose',
          rotation: 2,
          hasTape: true,
          header: 'CLOSING RULE',
          content: 'The person who asks the questions controls the frame. If you find yourself pitching for 40 minutes, you have already lost. The client should speak 70% of the call.',
          footer: 'FRAME CONTROL'
        }
      ];

      newConnections = [
        { id: `conn-cb-1`, from: f1Id, fromAnchor: 'right', to: diagId, toAnchor: 'left', style: 'dashed', color: 'gold', label: 'Inbound → Diagnostic' },
        { id: `conn-cb-2`, from: diagId, fromAnchor: 'right', to: rxId, toAnchor: 'left', style: 'dashed', color: 'green', label: 'Prescription of Care' }
      ];
    } else if (templateKey === 'morgan-outbound' || templateKey === 'morgan') {
      title = 'Charlie Morgan • Sovereign Outbound Machine & Prospect Conversion Engine';
      const triadId = `triad-cm-${Date.now()}`;
      const cadenceId = `cadence-cm-${Date.now()}`;
      const tblId = `table-cm-${Date.now()}`;
      const metricId = `metric-cm-${Date.now()}`;
      const s1Id = `sticky-cm-1-${Date.now()}`;
      const s2Id = `sticky-cm-2-${Date.now()}`;

      newElements = [
        {
          id: triadId,
          type: 'belief-triad',
          x: 100,
          y: 120,
          width: 720,
          title: 'The 3 Limiting Beliefs Triad',
          vTitle: 'The Agency Vehicle',
          vBody: 'Shift belief from "Generic marketing agencies burn cash on vanity ads" to "Scientific clinical accelerators multiply cash on first-purchase AOV."',
          iTitle: 'Internal Capability',
          iBody: 'Shift belief from "Our team has no time or capacity to handle complex campaigns" to "Modular turnkey systems require zero internal staff overhead."',
          eTitle: 'External Market',
          eBody: 'Shift belief from "High-net-worth beauty buyers are cutting spend" to "Affluent cosmetic consumers actively seek lab-certified formulation transparency."'
        },
        {
          id: cadenceId,
          type: 'cadence-timeline',
          x: 960,
          y: 120,
          width: 780,
          title: '21-Day 8-Touch Outbound Machine'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 580,
          width: 900,
          title: 'Charlie Morgan Outbound Cadence & Conversion Pipeline',
          badge: 'PIPELINE EQUATION',
          headers: ['Outbound Funnel Stage', 'Weekly Target', 'Conversion %', 'Pipeline Output', 'Target CPA (AED)'],
          rows: [
            ['Verified Brand Founder Outreach', '1,000 Contacts', '100%', '1,000 Touches Sent', '0.80'],
            ['Positive Executive Response Rate', '45 Replies', '4.5%', '45 Qualified Dialogues', '17.80'],
            ['Custom Video Teardown Booked', '18 Demos', '40.0%', '18 Loom Presentations', '44.50'],
            ['Quarterly Client Retainer Closed', '3 Clients', '16.7%', 'AED 75,000 New ARR', '267.00']
          ]
        },
        {
          id: metricId,
          type: 'metric',
          x: 1040,
          y: 580,
          width: 320,
          title: 'OUTBOUND CASH ROI',
          badge: '93.6x PIPELINE MULTIPLIER',
          deltaColor: 'tag-green',
          figure: 'AED 75,000',
          subtitle: 'Weekly Retainer Intake on AED 800 Domain & Data Spend'
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1400,
          y: 580,
          width: 280,
          height: 190,
          color: 'noir',
          rotation: -1.5,
          hasTape: true,
          header: 'MORGAN IRON LAW',
          content: 'B2B sales is not subjective magic. It is pure statistics: Volume of Outreach × Accuracy of ICP List × Relatability of Script = Inevitable Pipeline.',
          footer: 'OUTBOUND MATH'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1720,
          y: 580,
          width: 280,
          height: 190,
          color: 'rose',
          rotation: 2,
          hasTape: true,
          header: 'OBJECTION REFRAME',
          content: '"We already do this in-house" is never a rejection; it is evidence that they value the function. Position your retainer as a force-multiplier for their team.',
          footer: 'OBJECTION REALITY'
        }
      ];

      newConnections = [
        { id: `conn-cm-1`, from: triadId, fromAnchor: 'right', to: cadenceId, toAnchor: 'left', style: 'dashed', color: 'gold', label: 'Dismantle Beliefs' }
      ];
    } else if (templateKey === 'ajsmart-sprint' || templateKey === 'ajsmart') {
      title = 'AJ&Smart • 4-Day Product Strategy & Executive Facilitation Sprint';
      const swimlaneId = `swimlane-aj-${Date.now()}`;
      const dots1Id = `dots-aj-1-${Date.now()}`;
      const dots2Id = `dots-aj-2-${Date.now()}`;
      const matrixId = `ldj-aj-${Date.now()}`;
      const tblId = `table-aj-${Date.now()}`;
      const s1Id = `sticky-aj-1-${Date.now()}`;
      const s2Id = `sticky-aj-2-${Date.now()}`;

      newElements = [
        {
          id: swimlaneId,
          type: 'sprint-swimlane',
          x: 100,
          y: 120,
          width: 1220,
          title: 'AJ&Smart 4-Day Product Strategy & Facilitation Sprint'
        },
        {
          id: dots1Id,
          type: 'voting-dots',
          x: 430,
          y: 350,
          dots: [
            { color: 'dot-violet', text: 'JS' },
            { color: 'dot-mint', text: 'AK' },
            { color: 'dot-gold', text: 'MH' }
          ]
        },
        {
          id: dots2Id,
          type: 'voting-dots',
          x: 730,
          y: 350,
          dots: [
            { color: 'dot-rose', text: 'EL' },
            { color: 'dot-mint', text: 'AK' }
          ]
        },
        {
          id: matrixId,
          type: 'ldj-matrix',
          x: 1360,
          y: 120,
          width: 580,
          title: 'LDJ Impact vs. Effort Prioritization Matrix'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 680,
          width: 900,
          title: 'AJ&Smart Day 4 User Testing & Usability Matrix',
          badge: 'TEST MATRIX',
          headers: ['Target Tester', 'Customer Archetype', 'First Impression', 'Price Reaction (AED 420)', 'Purchase Intent'],
          rows: [
            ['Tester 01 (Elena)', 'HNW Cosmetic Enthusiast', 'Frosted glass feels ultra-luxurious', 'Expected AED 500+ for lab formula', 'High (Ready to buy)'],
            ['Tester 02 (Sarah)', 'Clinical Derm Patient', 'Appreciated transparent trial data', 'Wants 30ml travel mini option', 'Medium (Wants sample)'],
            ['Tester 03 (Nadia)', 'Clean Beauty Advocate', 'Scrutinized preservative bio-safety', 'Comfortable once ISO 11930 cited', 'High (Impressed by data)'],
            ['Tester 04 (Fatima)', 'VIP Luxury Gifter', 'Wax seal & unboxing feels museum-grade', 'Very attractive for gifts', 'Immediate (Pre-ordered)']
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1040,
          y: 680,
          width: 290,
          height: 190,
          color: 'yellow',
          rotation: -1.5,
          hasTape: true,
          header: 'HMW QUESTION',
          content: 'How Might We communicate clinical peptide potency without overwhelming non-scientific beauty buyers with medical jargon?',
          footer: 'SPRINT ANCHOR'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1370,
          y: 680,
          width: 290,
          height: 190,
          color: 'blue',
          rotation: 2,
          hasTape: true,
          header: 'TOGETHER ALONE',
          content: 'Never brainstorm out loud. Brainstorm silently on stickies, then vote. It completely removes extrovert dominance and hippo bias.',
          footer: 'FACILITATION LAW'
        }
      ];

      newConnections = [
        { id: `conn-aj-1`, from: swimlaneId, fromAnchor: 'right', to: matrixId, toAnchor: 'left', style: 'dashed', color: 'gold', label: 'Decisions → Prioritization' }
      ];
    } else if (templateKey === 'isenberg-community' || templateKey === 'isenberg') {
      title = 'Greg Isenberg • Community-Led Growth Flywheel & Unbundling Canvas';
      const unbundleId = `unbundle-gi-${Date.now()}`;
      const flywheelId = `flywheel-gi-${Date.now()}`;
      const tblId = `table-gi-${Date.now()}`;
      const metricId = `metric-gi-${Date.now()}`;
      const s1Id = `sticky-gi-1-${Date.now()}`;
      const s2Id = `sticky-gi-2-${Date.now()}`;

      newElements = [
        {
          id: unbundleId,
          type: 'unbundling-tree',
          x: 100,
          y: 120,
          width: 620,
          title: 'Reddit Platform Unbundling Engine',
          communityPill: 'r/30PlusSkinCare • 2.4M'
        },
        {
          id: flywheelId,
          type: 'flywheel-rings',
          x: 760,
          y: 120,
          width: 580,
          title: 'Audience → Community → Product (ACP)'
        },
        {
          id: metricId,
          type: 'metric',
          x: 1380,
          y: 120,
          width: 320,
          title: 'COMMUNITY LTV EXPANSION',
          badge: '+84% LTV MULTIPLIER',
          deltaColor: 'tag-gold',
          figure: 'AED 3,250',
          subtitle: 'Community Member 12-Mo LTV vs AED 380 DTC Single Buyer'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 640,
          width: 900,
          title: 'Greg Isenberg Subreddit & Community Unbundling Matrix',
          badge: 'UNBUNDLING ENGINE',
          headers: ['Broad Digital Watering Hole', 'Core Unaddressed Frustration', 'Unbundled Luxury Product', 'Monetization Model'],
          rows: [
            ['r/30PlusSkinCare (2.4M Members)', 'Retinol irritation & barrier damage', 'Personalized Peptide Regimen Box', 'AED 420 / Month Auto-Refill'],
            ['TikTok #DermTok (12B Views)', 'Dermatologist claim skepticism', 'Third-Party Laboratory Claims Registry', 'AED 4,500 / Brand / Year'],
            ['Dubai Luxury Vanity Club', 'Access to unreleased Parisian batches', 'Secret Atelier Vault VIP Access', 'AED 15,000 / Year Retainer']
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1040,
          y: 640,
          width: 280,
          height: 190,
          color: 'rose',
          rotation: -1.5,
          hasTape: true,
          header: 'ISENBERG FLYWHEEL',
          content: 'Build the community first, product second. When you own the community, your customer acquisition cost drops to near zero because members are your co-designers.',
          footer: 'COMMUNITY LAW'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1370,
          y: 640,
          width: 280,
          height: 190,
          color: 'mint',
          rotation: 2,
          hasTape: true,
          header: 'UNBUNDLING LAW',
          content: 'Every massive subreddit, Facebook group, or Discord with > 100k members is an unbundled $10M luxury company waiting to be built with world-class branding.',
          footer: 'UNBUNDLING THESIS'
        }
      ];

      newConnections = [
        { id: `conn-gi-1`, from: unbundleId, fromAnchor: 'right', to: flywheelId, toAnchor: 'left', style: 'dashed', color: 'gold', label: 'Unbundling → Flywheel' },
        { id: `conn-gi-2`, from: flywheelId, fromAnchor: 'bottom', to: tblId, toAnchor: 'top', style: 'dashed', color: 'green', label: 'Product Roadmap' }
      ];
    } else if (templateKey === 'scaling-blueprint') {
      title = '90-Day Luxury Beauty Scaling Blueprint';
      const f1Id = `frame-sb-1-${Date.now()}`;
      const f2Id = `frame-sb-2-${Date.now()}`;
      const priceId = `pricing-sb-${Date.now()}`;
      const scriptId = `script-sb-${Date.now()}`;
      const tblId = `table-sb-${Date.now()}`;
      const s1Id = `sticky-sb-1-${Date.now()}`;
      const s2Id = `sticky-sb-2-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '01',
          titlePill: 'PAID MEDIA ACQUISITION',
          headline: 'Advantage+ & Creator',
          serifAccent: 'Liquidity Architecture',
          description: 'Engineering a predictable net-new customer acquisition machine via Meta Advantage+ ASC and whitelisted TikTok Spark ads without resetting algorithmic learning.',
          boxes: [
            { tag: 'PROSPECTING SANDBOX', tagColor: 'gold', title: 'Dynamic Creative Testing (DCT)', content: '3 video thumbstop variations x 2 body messaging angles tested in isolated sandbox campaigns before graduation to ASC core budget.' },
            { tag: 'LANDING PAGE LIFT', tagColor: 'blue', title: 'Dedicated Advertorial Presell', content: 'Directing high-intent prospecting clicks to editorial advertorials explaining clinical formulation science, lifting conversion velocity by 34%.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 820,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '02',
          titlePill: 'OFFER & BUNDLE MECHANICS',
          headline: 'Regimen Architecture &',
          serifAccent: 'AOV Expansion',
          description: 'Transitioning single-SKU purchasers into 3-step clinical routine buyers, lifting first-order average order value from AED 180 to AED 420+.',
          boxes: [
            { tag: 'CORE REGIMEN', tagColor: 'green', title: '3-Step Daily Protocol', content: 'Packaging Cleanser + Peptide Serum + Barrier Cream with exclusive collector travel pouch, making single-product checkout obsolete.' },
            { tag: 'SLIDE CART UPSELL', tagColor: 'rose', title: 'One-Click Post-Purchase Bump', content: 'Micro-dose travel mini and silk sleeping mask upsell triggers before final payment authorization, maintaining 22% uptake rate.' }
          ]
        },
        {
          id: priceId,
          type: 'pricing',
          x: 1540,
          y: 120,
          width: 380,
          isFeatured: true,
          badge: '90-DAY SCALING ACCELERATOR',
          currency: 'AED',
          figure: '28,000',
          period: '/ Month + 8% Growth',
          features: [
            'Meta ASC & TikTok Spark Media Buying ($25k-$100k Spend)',
            'Bi-Weekly UGC & Creator Direction (12 High-Res Cuts)',
            'Klaviyo Routine Replenishment & SMS Concierge Buildout',
            'Weekly Executive Unit Economics & MER Review',
            'Full Access to POLISH Whiteboard Strategy Studio'
          ]
        },
        {
          id: scriptId,
          type: 'script',
          x: 1540,
          y: 470,
          width: 380,
          height: 190,
          content: '"Scale in luxury beauty is not achieved by shouting louder. It is engineered through formulation transparency, frictionless routine bundling, and relentless replenishment cadence."'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 720,
          width: 880,
          title: '90-Day Scaling Trajectory & Quarterly Milestones',
          badge: 'EXECUTION TIMELINE',
          headers: ['Phase', 'Focus Area', 'Target Blended MER', 'Key Deliverable', 'Expected Lift'],
          rows: [
            ['Month 01', 'Baseline Audit & Creative Sandbox', '2.8x - 3.2x', '3:2:2 DCT Ads + Advertorial Bridge', '+35% First-Order AOV'],
            ['Month 02', 'Advantage+ ASC Scale & Creator Seeding', '3.4x - 3.8x', '12 Whitelisted Creator Spark Ads', '+75% Net Prospecting Volume'],
            ['Month 03', 'Klaviyo Replenishment & LTV Flywheel', '4.2x - 4.6x', '42-Day Automated Routine Refill Loop', '+110% Unlocked Monthly GMV']
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1020,
          y: 720,
          width: 280,
          height: 190,
          color: 'yellow',
          rotation: -1.5,
          hasTape: true,
          header: 'UNIT ECONOMICS',
          content: 'Target a minimum 78% Gross Margin. Without healthy gross margins, rising paid media customer acquisition costs will erode your scaling runway.',
          footer: 'MARGIN MANDATE'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1340,
          y: 720,
          width: 280,
          height: 190,
          color: 'mint',
          rotation: 2,
          hasTape: true,
          header: 'CASH CONVERSION',
          content: 'Negotiate 60-day supplier payment terms with your cosmetic laboratory once monthly order volume exceeds 3,000 units to unlock free cash flow.',
          footer: 'TREASURY GOVERNANCE'
        }
      ];

      newConnections = [
        { id: `conn-sb-1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' },
        { id: `conn-sb-2`, from: f2Id, fromAnchor: 'right', to: priceId, toAnchor: 'left', style: 'dashed', color: 'green', label: '' }
      ];
    } else if (templateKey === 'retention-flywheel') {
      title = 'DTC Skincare Retention & Replenishment Flywheel';
      const f1Id = `frame-rf-1-${Date.now()}`;
      const f2Id = `frame-rf-2-${Date.now()}`;
      const priceId = `pricing-rf-${Date.now()}`;
      const scriptId = `script-rf-${Date.now()}`;
      const tblId = `table-rf-${Date.now()}`;
      const s1Id = `sticky-rf-1-${Date.now()}`;
      const s2Id = `sticky-rf-2-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '01',
          titlePill: 'POST-PURCHASE INDUCTION',
          headline: 'Sensory Unboxing &',
          serifAccent: 'Skin Protocol Coaching',
          description: 'Transforming first delivery from a postal transaction into an editorial unboxing ritual that drives immediate Day 1 product adoption and application compliance.',
          boxes: [
            { tag: 'UNBOXING RITUAL', tagColor: 'rose', title: 'QR Ritual Companion', content: 'Embossed foil card linking to 90-second video tutorial with the brand founder explaining application technique and active ingredient synergy.' },
            { tag: 'DAY 3 CHECK-IN', tagColor: 'gold', title: 'Non-Promotional SMS Care', content: 'Conversational SMS asking: "How does your skin feel after your first 48 hours with the Active Serum?" Zero marketing pitch, 92% positive sentiment.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 820,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '02',
          titlePill: 'PREDICTIVE REPLENISHMENT',
          headline: 'Jar Burn Calculations &',
          serifAccent: '1-Click Refill Loops',
          description: 'Triggering refill opportunities precisely when bottle volume reaches 15%, before the consumer lapses into competitor browsing or drugstore substitutes.',
          boxes: [
            { tag: 'BURN RATE ENGINE', tagColor: 'green', title: '42-Day Dynamic SMS Refill Prompt', content: 'Smart algorithm calculates expected usage cadence. Delivers 1-click Apple Pay refill link with subscriber pricing benefit 10 days before bottom-of-jar.' },
            { tag: 'SUBSCRIPTION LADDER', tagColor: 'blue', title: 'Haute Atelier Refill Club', content: 'Eco-luxury aluminum refill pouches discounted 18% with quarterly curated chemist lab samples included free.' }
          ]
        },
        {
          id: priceId,
          type: 'pricing',
          x: 1540,
          y: 120,
          width: 380,
          isFeatured: true,
          badge: 'RETENTION VALUE PROJECTION',
          currency: 'AED',
          figure: '185,000',
          period: 'Unlocked 12-Mo LTV',
          features: [
            '60-Day Repeat Purchase Rate Lift: +48%',
            'Active Replenishment Subscriber Retention: 84%',
            'Blended Customer Lifetime Value: 3.4x CAC',
            'Lapsed Customer Win-Back Conversion: 16.2%',
            'VIP Laboratory Community Engagement Score: 92/100'
          ]
        },
        {
          id: scriptId,
          type: 'script',
          x: 1540,
          y: 470,
          width: 380,
          height: 190,
          content: '"The second sale is never made on product utility alone; it is earned through how intensely the brand respected the ritual between Day 1 and Day 45."'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 720,
          width: 880,
          title: 'Klaviyo & SMS Automated Retention Journey Matrix',
          badge: 'JOURNEY CADENCE',
          headers: ['Day Interval', 'Channel', 'Strategic Purpose', 'Trigger Condition', 'Observed CVR'],
          rows: [
            ['Day 0 (Delivery)', 'Email + SMS', 'Sensory Unboxing & QR Routine Guide', 'Carrier "Delivered" webhook', '68% Open / 34% Click'],
            ['Day 07', 'Editorial Email', '"What to expect in Week 2" (Cell turnover)', 'Opened Day 0 message', '54% Open / 18% Click'],
            ['Day 28', 'Conversational SMS', 'Progress Check-In & Companion Booster', 'No support ticket opened', '46% Reply Rate'],
            ['Day 42', 'SMS + VIP Email', '1-Click Predictive Replenishment Link', 'Jar 85% depleted threshold', '31% Repeat Purchase CVR']
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1020,
          y: 720,
          width: 280,
          height: 190,
          color: 'rose',
          rotation: -1.5,
          hasTape: true,
          header: 'RETENTION AXIOM',
          content: 'Never offer discounts on first reorder. Offer formulation upgrades, deluxe mini travel formats, or exclusive founder notes to preserve brand prestige.',
          footer: 'PRESTIGE INTEGRITY'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1340,
          y: 720,
          width: 280,
          height: 190,
          color: 'mint',
          rotation: 2,
          hasTape: true,
          header: 'CHURN INTERCEPT',
          content: 'If a customer skips a delivery, send a bespoke SMS asking if they would like to adjust delivery frequency rather than cancelling outright.',
          footer: 'CHURN DEFENSE'
        }
      ];

      newConnections = [
        { id: `conn-rf-1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'rose', label: '' },
        { id: `conn-rf-2`, from: f2Id, fromAnchor: 'right', to: priceId, toAnchor: 'left', style: 'dashed', color: 'green', label: '' }
      ];
    } else if (templateKey === 'personal-branding') {
      title = 'Personal Branding & Sovereign Authority Blueprint';
      const f1Id = `frame-pb-1-${Date.now()}`;
      const f2Id = `frame-pb-2-${Date.now()}`;
      const scriptId = `script-pb-${Date.now()}`;
      const priceId = `pricing-pb-${Date.now()}`;
      const tblId = `table-pb-${Date.now()}`;
      const s1Id = `sticky-pb-1-${Date.now()}`;
      const s2Id = `sticky-pb-2-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '01',
          titlePill: 'SOVEREIGN POSITIONING',
          headline: 'Executive Persona &',
          serifAccent: 'Category Ownership',
          description: 'Positioning the founder as the undisputed sovereign authority in luxury beauty, formulation science, and clinical aesthetics.',
          boxes: [
            { tag: 'FOUNDER THESIS', tagColor: 'gold', title: 'The Polarizing Point of View', content: 'Challenge industry consensus: "Clean beauty is unregulated marketing; cosmetic biochemistry is the only sustainable luxury."' },
            { tag: 'PILLAR NARRATIVE', tagColor: 'rose', title: 'Behind-The-Glass Formulation', content: 'Deconstruct laboratory trial failures, raw botanical extraction chemistry, and unfiltered Parisian factory visits.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 820,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '02',
          titlePill: 'CONTENT SYNDICATION',
          headline: 'Multi-Channel Media',
          serifAccent: 'Velocity Engine',
          description: 'Engineering a 1-to-many syndication architecture converting 1 long-form keynote into 30 high-impact sovereign media assets.',
          boxes: [
            { tag: 'LONG-FORM PILLAR', tagColor: 'blue', title: 'Substack & Private Journal', content: 'Bi-weekly 1,800-word deep dives into cosmetic chemistry economics and DTC brand equity preservation.' },
            { tag: 'SHORT-FORM HOOKS', tagColor: 'green', title: 'LinkedIn & 9:16 Video Micro-Clips', content: '15-second cinematic soundbites extracted with raking laboratory lighting and hard-hitting contrarian hooks.' }
          ]
        },
        {
          id: scriptId,
          type: 'script',
          x: 1540,
          y: 120,
          width: 380,
          height: 200,
          content: '"Elite founders do not pitch services cold. They publish undeniable technical truth until the world\'s most discerning brands knock on their atelier door."'
        },
        {
          id: priceId,
          type: 'pricing',
          x: 1540,
          y: 360,
          width: 380,
          isFeatured: true,
          badge: 'FOUNDER ADVISORY RETAINER',
          currency: 'AED',
          figure: '15,000',
          period: '/ Month',
          features: [
            'Bi-Weekly 1-on-1 Strategic Narrative Session',
            'Ghostwritten Substack & LinkedIn Pillar Essays',
            'Cinematic 9:16 Video Editing (8 Cuts / Month)',
            'Keynote Speech Architecture & PR Placement',
            'Direct Private Concierge WhatsApp Access'
          ]
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 720,
          width: 880,
          title: 'Weekly Publishing Cadence & Channel Architecture',
          badge: 'MEDIA CADENCE',
          headers: ['Day', 'Platform', 'Asset Format', 'Strategic Hook Angle', 'Primary CTA'],
          rows: [
            ['Monday', 'LinkedIn & X', 'Text Breakdown + Carousel', 'Deconstructing a $100M beauty acquisition', 'Subscribe to Atelier Memo'],
            ['Wednesday', 'Instagram / TikTok', '9:16 Laboratory Video', 'Why 90% of vitamin C serums oxidize on skin', 'Comment "FORMULA" for PDF'],
            ['Friday', 'Substack Editorial', 'Long-Form Strategic Essay', 'The Death of Aggressive Performance Marketing', 'Private Advisory Application'],
            ['Sunday', 'Private WhatsApp / VIP', 'Voice Memo & Behind Scenes', 'Unfiltered weekend lab thoughts & formulation notes', 'Passive Sovereign Trust']
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1020,
          y: 720,
          width: 280,
          height: 190,
          color: 'yellow',
          rotation: -1.5,
          hasTape: true,
          header: 'VOICE PRINCIPLE',
          content: 'Speak only with absolute conviction. Never use timid hedging ("in my opinion", "I think"). State biochemistry principles as undeniable physical facts.',
          footer: 'EXECUTIVE TONE'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1340,
          y: 720,
          width: 280,
          height: 190,
          color: 'rose',
          rotation: 2,
          hasTape: true,
          header: 'CONVERSION BRIDGE',
          content: 'Every single piece of founder media must contain a passive conversion pathway leading to the private board application.',
          footer: 'GROWTH ANCHOR'
        }
      ];

      newConnections = [
        { id: `conn-pb-1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' },
        { id: `conn-pb-2`, from: f2Id, fromAnchor: 'right', to: scriptId, toAnchor: 'left', style: 'dashed', color: 'blue', label: '' }
      ];
    } else if (templateKey === 'meta-tiktok-ads') {
      title = 'Meta & TikTok Ads Performance Engine';
      const f1Id = `frame-ads-1-${Date.now()}`;
      const f2Id = `frame-ads-2-${Date.now()}`;
      const priceId = `pricing-ads-${Date.now()}`;
      const tblId = `table-ads-${Date.now()}`;
      const s1Id = `sticky-ads-1-${Date.now()}`;
      const s2Id = `sticky-ads-2-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '01',
          titlePill: 'META ADVANTAGE+ ASC',
          headline: 'Dynamic Creative &',
          serifAccent: 'Algorithmic Scale',
          description: 'Advantage+ Shopping Campaigns structured with dynamic creative testing (DCT) to maximize machine-learning liquidity without audience fragmentation.',
          boxes: [
            { tag: 'DCT SETUP', tagColor: 'blue', title: '3:2:2 Creative Testing Framework', content: '3 distinct video hooks, 2 core value proposition bodies, 2 lifestyle headlines into single dynamic sandbox ad sets.' },
            { tag: 'RETARGETING', tagColor: 'gold', title: 'High-Intent Friction Elimination', content: 'Custom audience exclusions ensuring 95%+ net-new prospecting with 180-day customer exclusions.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 820,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '02',
          titlePill: 'TIKTOK SPARK ENGINE',
          headline: 'Native UGC Velocity &',
          serifAccent: '3-Sec Hook Retention',
          description: 'Spark ads driven by native creator b-roll, high thumbstop rates, and organic trending audio whitelisted for commercial scale.',
          boxes: [
            { tag: 'THUMBSTOP', tagColor: 'rose', title: '0-3 Second Pattern Interrupt', content: 'Microscopic texture application, tactile pipette clicks, and visceral dermatologist reactions exceeding 38% 3s hold.' },
            { tag: 'LANDING PAGE BRIDGE', tagColor: 'green', title: 'Dedicated Advertorial Presell', content: 'Directing paid social traffic to customized editorial advertorials before the PDP to elevate blended AOV to AED 420+.' }
          ]
        },
        {
          id: priceId,
          type: 'pricing',
          x: 1540,
          y: 120,
          width: 370,
          isFeatured: true,
          badge: 'MONTHLY PERFORMANCE BUDGET',
          currency: 'AED',
          figure: '35,000',
          period: '/ Month Spend',
          features: [
            'Meta Advantage+ ASC Architecture ($20k / mo)',
            'TikTok Spark Whitelisted Ads ($15k / mo)',
            'Weekly 6-Asset Creative Testing Cadence',
            'Dedicated Advertorial & PDP Split Testing',
            'Real-Time Blended MER & First-Order ROAS Tracking'
          ]
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 720,
          width: 880,
          title: 'Weekly Paid Social Creative Testing Matrix',
          badge: 'CREATIVE TESTING',
          headers: ['Creative Concept', 'Platform', 'Visual Hook Angle', 'Thumbstop %', 'Target CPA (AED)', 'RoAS Status'],
          rows: [
            ['Lab Texture Drop', 'TikTok Spark', 'Micro-macro dropper on glass slide', '42.4%', '68.00', 'Scaling (3.8x)'],
            ['Derm Split Screen', 'Meta ASC', '"Stop using retinol incorrectly"', '39.1%', '74.50', 'Winner (4.2x)'],
            ['Unboxing ASMR', 'TikTok Spark', 'Uncoated paper rip + embossed seal', '31.2%', '92.00', 'Iterate Audio'],
            ['Founder Formulation', 'Meta ASC', '"Why big beauty cuts active percentages"', '46.8%', '58.00', 'Top Performer (5.1x)']
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1020,
          y: 720,
          width: 280,
          height: 190,
          color: 'mint',
          rotation: -1.5,
          hasTape: true,
          header: 'SCALING RULE',
          content: 'Never increase campaign budget by more than 20% every 48 hours. Aggressive manual budget edits reset Meta machine learning algorithms.',
          footer: 'BUDGET DISCIPLINE'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1340,
          y: 720,
          width: 280,
          height: 190,
          color: 'rose',
          rotation: 2,
          hasTape: true,
          header: 'CREATIVE FATIGUE',
          content: 'Rotate winning angles every 18 days. Creative exhaustion is the #1 silent killer of high-volume cosmetics performance campaigns.',
          footer: 'CADENCE ALERT'
        }
      ];

      newConnections = [
        { id: `conn-ads-1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' },
        { id: `conn-ads-2`, from: f2Id, fromAnchor: 'right', to: priceId, toAnchor: 'left', style: 'dashed', color: 'green', label: '' }
      ];
    } else if (templateKey === 'strategy') {
      title = 'Executive Strategy Blueprint';
      const starter = getBuiltinStarterBoard();
      newElements = starter.elements;
      newConnections = starter.connections;
    } else if (templateKey === 'audit') {
      title = 'Beauty Brand Friction Diagnostic Audit';
      const f1Id = `frame-audit-1-${Date.now()}`;
      const f2Id = `frame-audit-2-${Date.now()}`;
      const s1Id = `sticky-audit-1-${Date.now()}`;
      const s2Id = `sticky-audit-2-${Date.now()}`;
      const tblId = `table-audit-${Date.now()}`;
      const formId = `form-audit-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 120,
          y: 120,
          width: 640,
          height: 520,
          frameNumber: '01',
          titlePill: 'CONVERSION DIAGNOSTIC',
          headline: 'Acquisition & CAC',
          serifAccent: 'Erosion',
          description: 'Diagnosing media spend dropoff, landing page friction, and high customer acquisition cost leaks.',
          boxes: [
            { tag: 'TRAFFIC LEAK', tagColor: 'rose', title: 'Top-of-Funnel Dropoff', content: 'Paid Meta & TikTok video hooks converting at under 1.4% due to generic category positioning.' },
            { tag: 'HOOK REMEDIATION', tagColor: 'gold', title: 'Micro-Batch Proof Angles', content: 'Laboratory formulation & dermatologist reaction assets outperforming polished studio ads 3:1.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 840,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '02',
          titlePill: 'RETENTION & LTV',
          headline: '90-Day Cohort',
          serifAccent: 'Preservation',
          description: 'Eliminating post-purchase silent churn and engineering predictable automated re-order velocity.',
          boxes: [
            { tag: 'CHURN VULNERABILITY', tagColor: 'rose', title: 'Single-Purchase Abandonment', content: '64% of first-time buyers do not re-order within 60 days without dedicated replenishment flow.' },
            { tag: 'VIP MEMBERSHIP', tagColor: 'green', title: 'Private Concierge Replenishment', content: 'Automated 45-day SMS + async WhatsApp refill reminders with exclusive gift-with-purchase tier.' }
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 770,
          y: 40,
          width: 270,
          height: 180,
          color: 'yellow',
          rotation: -1.5,
          hasTape: true,
          header: 'AUDIT ACTION',
          content: 'Audit unboxing collateral immediately. Insert gold-embossed QR card linking directly to private VIP loyalty tier.',
          footer: 'PRIORITY: HIGH'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1530,
          y: 240,
          width: 270,
          height: 180,
          color: 'rose',
          rotation: 1.8,
          hasTape: true,
          header: 'CHURN DRIVER',
          content: 'Replenishment emails are firing on day 14 instead of day 42. Customers feel spammed before the bottle is half empty.',
          footer: 'FIX: CADENCE'
        },
        {
          id: tblId,
          type: 'table',
          x: 120,
          y: 720,
          width: 660,
          title: 'Brand Friction & Remediation Matrix',
          badge: 'DIAGNOSTIC MATRIX',
          headers: ['Funnel Stage', 'Identified Friction', 'Remediation Protocol', 'Projected Lift'],
          rows: [
            ['Top of Funnel', 'High CAC ($48/order)', 'Deploy 6 Micro-Batch UGC Angles', '-35% Blended CAC'],
            ['Cart & Checkout', '22% Abandonment', 'Express 1-Click Apple Pay & Klarna', '+14% CVR Lift'],
            ['Post-Purchase', 'Single-Order Churn', 'Haute WhatsApp Replenishment', '+42% 90-Day LTV']
          ]
        },
        {
          id: formId,
          type: 'form',
          x: 840,
          y: 720,
          width: 580,
          title: 'Client Intake Calibration Worksheet',
          badge: 'INTAKE AUDIT',
          desc: 'Parameters to calibrate before presenting audit roadmap to founders.',
          fields: [
            { id: 'f-1', type: 'input', label: '01. Current Monthly Gross Media Spend (AED / $)', badge: 'METRIC', instructions: 'Average across Meta, TikTok, and Google Ads:', value: '$45,000 / mo' },
            { id: 'f-2', type: 'textarea', label: '02. Primary Operational Growth Bottleneck', badge: 'DEEP', instructions: 'Where does founder fatigue or supply friction bottleneck scale?', value: 'Custom formulation lead times require 8-week inventory forecasting.' }
          ]
        }
      ];

      newConnections = [
        { id: `conn-a1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' }
      ];
    } else if (templateKey === 'product-launch' || templateKey === 'launch') {
      title = 'Omnichannel DTC Product Launch Master Roadmap';
      const f1Id = `frame-launch-1-${Date.now()}`;
      const f2Id = `frame-launch-2-${Date.now()}`;
      const priceId = `pricing-launch-${Date.now()}`;
      const tblId = `table-launch-${Date.now()}`;
      const s1Id = `sticky-launch-1-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 640,
          height: 520,
          frameNumber: '01',
          titlePill: 'PRE-LAUNCH TEASE',
          headline: 'Anticipation & VIP',
          serifAccent: 'Waitlist Sprint',
          description: 'Building intense demand and exclusivity before public cart opening.',
          boxes: [
            { tag: 'SEEDING', tagColor: 'gold', title: 'Discreet Editor & Chemist Drop', content: 'Private delivery of 50 serialized wax-sealed sample vials to top dermatology and beauty editors under embargo.' },
            { tag: 'WAITLIST PORTAL', tagColor: 'blue', title: 'Password-Gated Early Access', content: 'Pre-launch password unlocks 24-hour private shopping window with numbered certificate of authenticity.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 820,
          y: 120,
          width: 660,
          height: 540,
          frameNumber: '02',
          titlePill: 'PUBLIC DROP DAY',
          headline: 'Multi-Channel Global',
          serifAccent: 'Activation',
          description: 'Coordinated omnichannel launch sprint across digital flagship and private client channels.',
          boxes: [
            { tag: 'PUBLIC RELEASE', tagColor: 'green', title: 'Omnichannel Cart Open', content: 'Digital flagship live, SMS broadcast to 12k VIP list, and 3-part documentary drop on Instagram & TikTok.' },
            { tag: 'SCARCITY CONTROL', tagColor: 'rose', title: 'Batch Allocation Cap', content: 'Initial batch strictly capped at 2,500 units to engineer genuine high-ticket sellout momentum.' }
          ]
        },
        {
          id: priceId,
          type: 'pricing',
          x: 1540,
          y: 120,
          width: 330,
          isFeatured: true,
          badge: 'LIMITED FOUNDER EDITION',
          currency: 'AED',
          figure: '1,250',
          period: 'Collector Box Set',
          features: [
            'Hand-Numbered Collector Presentation Box',
            'Full Active Barrier Repair Serum (50ml)',
            'Anodized Rose-Gold Micro-Sculpt Device',
            'Complimentary Concierge Refill Cartridge',
            'Private Masterclass with Lead Biochemist'
          ]
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 720,
          width: 780,
          title: 'Launch Master Countdown Schedule',
          badge: 'EXECUTION TIMELINE',
          headers: ['T-Minus', 'Milestone Deliverable', 'Execution Channel', 'Success Benchmark'],
          rows: [
            ['T-30 Days', 'Editor & Chemist NDA Seeding', 'Concierge White-Glove Mailer', '80%+ Organic Stories'],
            ['T-14 Days', 'Teaser Campaign & Waitlist Open', 'Meta Dark Ads + Reels', '15,000 Verified Emails'],
            ['T-24 Hours', 'Private VIP Password Cart Open', 'Exclusive SMS Drop', '$65k Gross in 24h'],
            ['Day 0', 'Full Public Global Launch', 'Omnichannel Flagship', 'Batch Sellout in 72h']
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 930,
          y: 720,
          width: 290,
          height: 200,
          color: 'gold',
          rotation: -2,
          hasTape: true,
          header: 'INVENTORY PROTOCOL',
          content: 'Keep 150 serialized units held back in reserve for VIP replacements and celebrity stylist emergency requests.',
          footer: 'LOGISTICS SPRINT'
        }
      ];

      newConnections = [
        { id: `conn-l1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' },
        { id: `conn-l2`, from: f2Id, fromAnchor: 'right', to: priceId, toAnchor: 'left', style: 'dashed', color: 'green', label: '' }
      ];
    } else if (templateKey === 'influencer-collabs' || templateKey === 'creator') {
      title = 'Influencer & Creator Collaborations Engine';
      const f1Id = `frame-cr-1-${Date.now()}`;
      const f2Id = `frame-cr-2-${Date.now()}`;
      const tblId = `table-cr-${Date.now()}`;
      const scriptId = `script-cr-${Date.now()}`;
      const s1Id = `sticky-cr-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 640,
          height: 500,
          frameNumber: '01',
          titlePill: 'TALENT ARCHETYPES',
          headline: 'Creator Selection &',
          serifAccent: 'Brand Affinity',
          description: 'Categorizing creator talent by trust credibility rather than superficial vanity follower metrics.',
          boxes: [
            { tag: 'ARCHETYPE 1', tagColor: 'gold', title: 'Cosmetic Chemists & Derms', content: 'High-authority ingredient breakdowns, clinical claim validation, and microscopic skin texture testing.' },
            { tag: 'ARCHETYPE 2', tagColor: 'rose', title: 'Haute Parisian Stylists', content: 'Luxury morning vanity routines, tactile textures, and natural light French girl aesthetic.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 820,
          y: 120,
          width: 660,
          height: 500,
          frameNumber: '02',
          titlePill: 'USAGE & LICENSING',
          headline: 'Paid Amplification &',
          serifAccent: 'Rights Governance',
          description: 'Maximizing asset longevity through 12-month paid whitelisting and dark-post syndication.',
          boxes: [
            { tag: 'WHITELISTING', tagColor: 'blue', title: 'Meta & TikTok Spark Authorization', content: 'Creators grant direct advertising permissions; ads run natively from creator handles with brand sponsor tag.' },
            { tag: 'PERFORMANCE BONUS', tagColor: 'green', title: 'Tiered RoAS Royalties', content: 'Base flat delivery fee + 4% gross revenue bonus when creative sustains > 3.2x blended RoAS over 30 days.' }
          ]
        },
        {
          id: scriptId,
          type: 'script',
          x: 1540,
          y: 120,
          width: 360,
          height: 180,
          content: '"We admire your scientific integrity. Our Parisian lab is releasing a barrier formulation and we would love to send you an unreleased batch for honest skin calibration — no mandatory post required."'
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1540,
          y: 350,
          width: 290,
          height: 180,
          color: 'mint',
          hasTape: true,
          header: 'BRIEFING MANDATE',
          content: 'No scripted bullet points. Creators must wear the formula for 10 consecutive days before recording raw b-roll.',
          footer: 'UGC PROTOCOL'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 680,
          width: 900,
          title: 'Active Creator Roster & Content Deliverables Pipeline',
          badge: 'TALENT ROSTER',
          headers: ['Creator Handle', 'Niche Archetype', 'Format', 'Deliverable Due', 'Fee (AED)', 'Status'],
          rows: [
            ['@camille.beaute', 'Haute Editorial', '3x 9:16 Reels', 'Oct 12', '4,500', 'Contract Signed'],
            ['@dr.nour.derma', 'Dermatologist', '2x Deep Dive Video', 'Oct 15', '8,000', 'Product Seeded'],
            ['@skinchem.atelier', 'Formulation Chemist', '1x Lab Breakdown', 'Oct 18', '6,200', 'In Production'],
            ['@leila.dubai', 'Lifestyle Luxury', '4x Story Sets', 'Oct 22', '5,000', 'Outreach Sent']
          ]
        }
      ];

      newConnections = [
        { id: `conn-c1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' }
      ];
    } else if (templateKey === 'skincare') {
      title = 'Skincare Formulation & Packaging Sprint';
      const f1Id = `frame-skin-1-${Date.now()}`;
      const f2Id = `frame-skin-2-${Date.now()}`;
      const tblId = `table-skin-${Date.now()}`;
      const s1Id = `sticky-skin-1-${Date.now()}`;
      const s2Id = `sticky-skin-2-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 640,
          height: 520,
          frameNumber: '01',
          titlePill: 'FORMULATION LAB',
          headline: 'Active Molecule',
          serifAccent: 'Architecture',
          description: 'Designing clinical potency ratios, liposomal delivery vehicles, and active stability profiles.',
          boxes: [
            { tag: 'HERO ACTIVE', tagColor: 'gold', title: '5.2% Bio-Identical Peptide Complex', content: 'Precision micro-encapsulated copper peptides stimulating cellular collagen synthesis without irritation.' },
            { tag: 'LIPID CARRIER', tagColor: 'green', title: 'Botanical Olive Squalane Carrier', content: 'Biocompatible lipid bilayer mimicking natural skin sebum for rapid trans-epidermal absorption.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 820,
          y: 120,
          width: 660,
          height: 520,
          frameNumber: '02',
          titlePill: 'HAUTE PACKAGING',
          headline: 'Tactile Vessel & Glass',
          serifAccent: 'Engineering',
          image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=1200&auto=format&fit=crop',
          description: 'Bespoke industrial design shielding active chemistry while delivering luxurious tactile haptics.',
          boxes: [
            { tag: 'GLASS VESSEL', tagColor: 'noir', title: 'Frosted French Flint Glass', content: 'Heavy 40% recycled glass with UV-opaque interior glaze to prevent photo-chemical degradation.' },
            { tag: 'DISPENSER', tagColor: 'gold', title: 'Anodized Champagne Gold Pipette', content: '0.5ml precision metered dose dropper with airtight silicone gasket seal.' }
          ]
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1540,
          y: 120,
          width: 280,
          height: 190,
          color: 'yellow',
          hasTape: true,
          header: 'CLINICAL TRIAL',
          content: '56-day double-blind clinical study required for "Clinically Proven 42% Reduction in Fine Lines" claim.',
          footer: 'REGULATORY COMPLIANCE'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1540,
          y: 350,
          width: 280,
          height: 190,
          color: 'mint',
          hasTape: true,
          header: 'SUSTAINABILITY',
          content: '100% Forest Stewardship Council (FSC) certified uncoated paper for folding cartons with vegetable dye inks.',
          footer: 'ECO PROTOCOL'
        },
        {
          id: tblId,
          type: 'table',
          x: 100,
          y: 700,
          width: 860,
          title: 'Stability, Safety & Regulatory Testing Protocols',
          badge: 'LAB TESTING MATRIX',
          headers: ['Testing Phase', 'Protocol Parameter', 'Duration', 'Regulatory Standard', 'Status'],
          rows: [
            ['Phase 01: Microbiology', 'Preservative Efficacy Testing (PET)', '28 Days', 'ISO 11930', 'Passed'],
            ['Phase 02: Thermal Stability', 'Accelerated Aging at 45°C / 75% RH', '12 Weeks', 'EU Cosmetics Reg 1223/2009', 'Week 8 In Progress'],
            ['Phase 03: Dermatological', 'Human Repeat Insult Patch Test (HRIPT)', '6 Weeks', 'Dermatologist Hypoallergenic', 'Recruiting Cohort'],
            ['Phase 04: Packaging Leak', 'Vacuum Decay & Inversion Chamber', '7 Days', 'ASTM D4991', 'Approved']
          ]
        }
      ];

      newConnections = [
        { id: `conn-s1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' }
      ];
    } else if (templateKey === 'moodboard') {
      title = 'Haute Brand Identity Moodboard';
      const f1Id = `frame-mb-1-${Date.now()}`;
      const f2Id = `frame-mb-2-${Date.now()}`;
      const s1Id = `sticky-mb-1-${Date.now()}`;
      const s2Id = `sticky-mb-2-${Date.now()}`;
      const shapeId = `shape-mb-${Date.now()}`;

      newElements = [
        {
          id: f1Id,
          type: 'frame',
          x: 100,
          y: 120,
          width: 620,
          height: 520,
          frameNumber: '01',
          titlePill: 'VISUAL UNIVERSE',
          headline: 'Haute Atelier',
          serifAccent: 'Aesthetic Palette',
          image: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1200&auto=format&fit=crop',
          description: 'Core design tokens, tactile paper materiality, and editorial color swatches.',
          boxes: [
            { tag: 'COLOR TOKENS', tagColor: 'gold', title: 'Champagne Gold & Noir', content: '#E2C799 (Warm Champagne), #C5A880 (Atelier Bronze), #FAF7F2 (Alabaster), #080706 (Obsidian Noir).' },
            { tag: 'TYPOGRAPHY PAIRING', tagColor: 'rose', title: 'Cormorant Garamond + Plus Jakarta', content: 'Graceful high-contrast serifs for editorial headlines anchored by modern geometric grotesk for UI & body.' }
          ]
        },
        {
          id: f2Id,
          type: 'frame',
          x: 780,
          y: 120,
          width: 620,
          height: 520,
          frameNumber: '02',
          titlePill: 'EDITORIAL DIRECTION',
          headline: 'Architectural Raking',
          serifAccent: 'Light & Shadows',
          image: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=1200&auto=format&fit=crop',
          description: 'Art direction guidelines for photography, packaging flatlays, and tactile textures.',
          boxes: [
            { tag: 'LIGHTING', tagColor: 'blue', title: 'Low Sun Raking Light', content: 'Natural directional morning light casting long soft architectural shadows across limestone and travertine.' },
            { tag: 'MATERIALITY', tagColor: 'gold', title: 'Uncoated Cotton & Cold Bronze', content: 'Rich heavy card stocks with blind debossing paired with brushed architectural metallic accents.' }
          ]
        },
        {
          id: shapeId,
          type: 'shape',
          shapeType: 'circle',
          x: 1460,
          y: 140,
          width: 200,
          height: 200,
          text: 'POLISH\nPARIS • DUBAI\nATELIER',
          zIndex: 20
        },
        {
          id: s1Id,
          type: 'sticky',
          x: 1450,
          y: 380,
          width: 270,
          height: 180,
          color: 'noir',
          hasTape: true,
          header: 'BRAND RULE',
          content: 'No synthetic rainbow gradients or harsh primary colors. Every asset must feel museum-grade and bespoke.',
          footer: 'HAUTE ATELIER'
        },
        {
          id: s2Id,
          type: 'sticky',
          x: 1450,
          y: 600,
          width: 270,
          height: 180,
          color: 'rose',
          hasTape: true,
          header: 'TACTILE DETAIL',
          content: 'Blind embossing on thick Alabaster paper stock. Gold foil accents used sparingly at < 5% surface area.',
          footer: 'PRINT SPEC'
        }
      ];

      newConnections = [
        { id: `conn-mb1`, from: f1Id, fromAnchor: 'right', to: f2Id, toAnchor: 'left', style: 'dashed', color: 'gold', label: '' }
      ];
    } else if (templateKey === 'mindmap') {
      title = 'POLISH Sovereign Brand Architecture Mind Map';
      const rootId = `shape-root-${Date.now()}`;
      const branch1Id = `sticky-b1-${Date.now()}`;
      const branch2Id = `sticky-b2-${Date.now()}`;
      const branch3Id = `sticky-b3-${Date.now()}`;
      const branch4Id = `sticky-b4-${Date.now()}`;

      newElements = [
        {
          id: rootId,
          type: 'shape',
          shapeType: 'circle',
          x: 750,
          y: 400,
          width: 220,
          height: 220,
          text: 'POLISH ATELIER\nSovereign Brand\nArchitecture',
          zIndex: 20
        },
        {
          id: branch1Id,
          type: 'sticky',
          color: 'rose',
          x: 1100,
          y: 200,
          width: 280,
          hasTape: true,
          header: 'AUDIENCE & PERSONA',
          content: 'Discerning aesthetic clientele valuing clinical biochemistry and third-party laboratory claim validation over superficial hype.',
          footer: 'BRANCH 01'
        },
        {
          id: branch2Id,
          type: 'sticky',
          color: 'yellow',
          x: 1100,
          y: 560,
          width: 280,
          hasTape: true,
          header: 'OFFER ARCHITECTURE',
          content: '3-Tier Clinical Retainer (AED 28,000 / mo + 8% growth equity) with exclusive access to POLISH Strategy Studio.',
          footer: 'BRANCH 02'
        },
        {
          id: branch3Id,
          type: 'sticky',
          color: 'blue',
          x: 360,
          y: 560,
          width: 280,
          hasTape: true,
          header: 'CONTENT & MEDIA',
          content: 'Dynamic creative testing (3:2:2 framework), macro texture thumbstops, and high-conversion scientific advertorial presells.',
          footer: 'BRANCH 03'
        },
        {
          id: branch4Id,
          type: 'sticky',
          color: 'mint',
          x: 360,
          y: 200,
          width: 280,
          hasTape: true,
          header: 'CLINICAL & PACKAGING',
          content: 'ISO 11930 PET preservative testing, French frosted flint glass vessels, and anodized champagne gold metered droppers.',
          footer: 'BRANCH 04'
        }
      ];

      newConnections = [
        { id: `conn-1`, from: rootId, fromAnchor: 'right', to: branch1Id, toAnchor: 'left', style: 'curved', color: 'rose', label: '' },
        { id: `conn-2`, from: rootId, fromAnchor: 'bottom', to: branch2Id, toAnchor: 'left', style: 'curved', color: 'gold', label: '' },
        { id: `conn-3`, from: rootId, fromAnchor: 'bottom', to: branch3Id, toAnchor: 'right', style: 'curved', color: 'blue', label: '' },
        { id: `conn-4`, from: rootId, fromAnchor: 'left', to: branch4Id, toAnchor: 'right', style: 'curved', color: 'green', label: '' }
      ];
    } else if (templateKey === 'planner') {
      title = 'Weekly Luxury Beauty Executive Sprint';
      const days = [
        { name: 'Monday', title: 'Pipeline & Media Calibration', boxTitle: 'ASC Liquidity & Spend Audit', boxContent: 'Review Meta ASC & TikTok Spark ROAS. Reallocate spend to winners with blended MER > 3.8x.', outcome: 'Media budgets balanced with zero algorithmic shock.' },
        { name: 'Tuesday', title: 'Creative Direction & Hook Testing', boxTitle: '12 Raw UGC Cuts Review', boxContent: 'Audit b-roll lighting, audio mastering, and microscopic dropper texture holds with creator talent.', outcome: '6 dynamic creative variations approved for sandbox.' },
        { name: 'Wednesday', title: 'Formulation & Clinical Sync', boxTitle: 'Biochemistry Stability Review', boxContent: 'Review accelerated aging reports at 45°C and sample batch 04 frosted flint glass seals.', outcome: 'EU 1223/2009 compliance dossier signed off.' },
        { name: 'Thursday', title: 'Retention & Private Concierge', boxTitle: 'Klaviyo Replenishment Cadence', boxContent: 'Optimize 45-day automated refill triggers and inspect VIP WhatsApp high-roller voice memos.', outcome: 'Repeat customer 90-day LTV pace lifted to AED 420+.' },
        { name: 'Friday', title: 'Unit Economics & Board Sign-off', boxTitle: 'Weekly Contribution Margin', boxContent: 'Audit gross revenue, net margins, customer acquisition costs, and 60-day inventory runway.', outcome: 'Executive board report transmitted to stakeholders.' }
      ];
      const colors = ['yellow', 'rose', 'blue', 'mint', 'noir'];
      newElements = [];
      newConnections = [];

      days.forEach((day, idx) => {
        const frameId = `frame-day-${idx}-${Date.now()}`;
        const stickyId = `sticky-task-${idx}-${Date.now()}`;
        const startX = 140 + idx * 430;

        newElements.push({
          id: frameId,
          type: 'frame',
          x: startX,
          y: 160,
          width: 390,
          height: 600,
          frameNumber: `0${idx + 1}`,
          titlePill: day.name.toUpperCase(),
          headline: day.title,
          description: `Executive operations and non-negotiable milestones for ${day.name}.`,
          boxes: [
            { tag: 'DEEP WORK SPRINT', tagColor: 'gold', title: day.boxTitle, content: day.boxContent }
          ]
        });

        newElements.push({
          id: stickyId,
          type: 'sticky',
          color: colors[idx % colors.length],
          x: startX + 50,
          y: 480,
          width: 290,
          hasTape: true,
          header: 'DAILY NON-NEGOTIABLE',
          content: day.outcome,
          footer: `${day.name.toUpperCase()} CADENCE`
        });
      });
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
