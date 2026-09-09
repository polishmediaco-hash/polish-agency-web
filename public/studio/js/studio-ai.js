/**
 * POLISH Board Studio — POLISH AI Strategy Engine
 * 
 * Non-blocking floating luxury window with official POLISH branding,
 * draggable spatial controls, zero conversational filler,
 * zero fake titles, and smart whiteboard card spawning.
 */

(function () {
  'use strict';

  const CREATOR_PERSONAS = {
    'hormozi-offer': {
      persona: 'hormozi',
      name: 'Alex Hormozi',
      badge: 'HORMOZI COPILOT',
      welcome: 'Alex Hormozi Grand Slam Copilot active. Ready to audit your offer equation, bonus stacking, price elasticity, and risk reversal.',
      presets: [
        { label: 'Value Equation Audit', prompt: 'Audit our offer against the Value Equation: Dream Outcome, Perceived Likelihood, Time Delay, and Effort & Sacrifice. How do we maximize the numerator and compress the denominator?' },
        { label: 'Grand Slam Guarantee', prompt: 'Architect an unconditional, conditional, or anti-guarantee that completely reverses client risk without compromising margins.' },
        { label: 'Bonus Stacking', prompt: 'Generate a high perceived value bonus stack with distinct anchor pricing to shatter price resistance.' },
        { label: 'Scarcity & Urgency', prompt: 'Formulate ethical cohort-based scarcity and deadline urgency mechanics for this offer.' },
        { label: 'Price Multiplier', prompt: 'How do we re-bundle our current deliverable into a $10,000+ high-conviction tier that requires zero fulfillment drag?' }
      ]
    },
    'ottley-ai': {
      persona: 'ottley',
      name: 'Liam Ottley',
      badge: 'OTTLEY COPILOT',
      welcome: 'Liam Ottley AAA Copilot active. Ready to architect your AI automation pipeline, autonomous agent workflows, and agency SLA retainers.',
      presets: [
        { label: 'AI Audit & Roadmap', prompt: 'Architect an end-to-end AI workflow audit for an enterprise client to identify 3 high-ROI autonomous automations.' },
        { label: 'AAA Retainer Pricing', prompt: 'Structure a performance-tied monthly retainer ($4k-$12k/mo) for maintaining autonomous agent workflows.' },
        { label: 'Autonomous Architecture', prompt: 'Design a multi-agent orchestration pipeline using n8n/Make and webhooks that reduces manual human touches by 80%.' },
        { label: 'Proof of Concept Scope', prompt: 'Define a 7-day Paid Discovery Sprint scope to de-risk implementation before signing the annual agreement.' },
        { label: 'Client Delivery SLA', prompt: 'Establish diagnostic milestone SLAs and error-handling protocols for client automated systems.' }
      ]
    },
    'bradley-inbound': {
      persona: 'bradley',
      name: 'Chris Bradley',
      badge: 'BRADLEY COPILOT',
      welcome: 'Chris Bradley High-Ticket Copilot active. Ready to construct your authority VSL, diagnostic qualification flow, and 2-call closing script.',
      presets: [
        { label: 'Authority VSL Script', prompt: 'Outline a 12-minute diagnostic VSL script demonstrating undeniable category authority and client case transformation.' },
        { label: 'Diagnostic Triage Call', prompt: 'Formulate a 15-minute diagnostic triage framework to disqualify tire-kickers and anchor prospect urgency.' },
        { label: '2-Call Closing Script', prompt: 'Provide the exact closing questions to transition a prospect from diagnosis to a $15,000 upfront engagement.' },
        { label: 'Organic Content Engine', prompt: 'Map out 5 polarising authority posts for LinkedIn/YouTube that drive qualified inbound DM inquiries.' },
        { label: 'Objection Neutralizer', prompt: 'How do we preemptively handle "We don\'t have the budget right now" using consultative diagnosis?' }
      ]
    },
    'morgan-outbound': {
      persona: 'morgan',
      name: 'Charlie Morgan',
      badge: 'MORGAN COPILOT',
      welcome: 'Charlie Morgan Outbound Copilot active. Ready to scale your TAM scraping, multi-touch cold sequences, and sovereign conversion engine.',
      presets: [
        { label: 'TAM Spear List', prompt: 'Define the exact ICP qualification criteria and scraping strategy to build a high-conviction 500-account TAM list.' },
        { label: 'Sovereign Cold Script', prompt: 'Write a 65-word cold outreach message with zero fluff, high personalization, and a soft conversational CTA.' },
        { label: 'Multi-Touch Cadence', prompt: 'Architect an 8-touch omnichannel cadence (Email + LinkedIn + Loom + Phone) across 21 business days.' },
        { label: 'Offer Diagnostic Hook', prompt: 'Create an offer-centric cold hook that leads with a quantifiable result rather than service deliverables.' },
        { label: 'SDR Ramp Metrics', prompt: 'Establish daily and weekly benchmark KPIs for an outbound SDR: dials, touches, positive replies, and booked demos.' }
      ]
    },
    'ajsmart-sprint': {
      persona: 'ajsmart',
      name: 'AJ&Smart',
      badge: 'AJ&SMART COPILOT',
      welcome: 'AJ&Smart Strategy Facilitator active. Ready to run Lightning Decision Jams, How-Might-We reframing, and 4-day Design Sprints.',
      presets: [
        { label: 'Lightning Decision Jam', prompt: 'Guide us through a 45-minute Lightning Decision Jam (LDJ) to identify top friction points and prioritize solutions.' },
        { label: 'HMW Question Generator', prompt: 'Reframe our top 3 customer challenges into high-impact "How Might We" (HMW) opportunity statements.' },
        { label: '4-Day Sprint Roadmap', prompt: 'Structure an executive-ready 4-day Design Sprint agenda from Map & Sketch to Prototype and User Testing.' },
        { label: 'Silent Voting Matrix', prompt: 'Set up an impact vs effort matrix with dot-voting criteria to eliminate stakeholder debate.' },
        { label: 'User Test Script', prompt: 'Draft a 5-interview user testing protocol to validate our prototype with target customers on Day 4.' }
      ]
    },
    'isenberg-community': {
      persona: 'isenberg',
      name: 'Greg Isenberg',
      badge: 'ISENBERG COPILOT',
      welcome: 'Greg Isenberg Growth Copilot active. Ready to unbundle niche communities, architect growth flywheels, and launch vertical Micro-SaaS.',
      presets: [
        { label: 'Unbundling Reddit/FB', prompt: 'Analyze Reddit communities and identify 3 niche subreddits ready to be unbundled into premium vertical products.' },
        { label: 'Community Flywheel', prompt: 'Map out a community-led growth flywheel: Content -> Community -> Product -> Advocates.' },
        { label: 'Micro-SaaS Concept', prompt: 'Propose 3 hyper-targeted Micro-SaaS concepts tailored specifically to serve our core community audience.' },
        { label: '0-to-100 Member Playbook', prompt: 'Draft an invite-only onboarding script to recruit our first 100 founding community members.' },
        { label: 'Paid Community Tier', prompt: 'Structure a $99/mo paid membership tier with high utility, mastermind calls, and zero burnout for the host.' }
      ]
    }
  };

  const StudioAI = {
    isOpen: false,
    isMinimized: false,
    isDocked: false,
    isThinking: false,
    history: [],
    lastBoardCards: [],
    pos: null,
    _selectionContext: null,   // array of {type, title, content} from selected canvas elements
    activeCreatorPersona: null,
    activeTemplateKey: null,
    defaultPresetsHtml: null,

    init() {
      // Restore saved preferences
      try {
        const savedPos = localStorage.getItem('polish_ai_pos');
        if (savedPos) this.pos = JSON.parse(savedPos);
        const savedDock = localStorage.getItem('polish_ai_docked');
        if (savedDock === 'true') this.isDocked = true;
      } catch (e) {}

      // Apply initial positioning
      this.applySavedState();

      // Setup Drag Physics on Header
      this.initDraggable();

      // Store default presets HTML
      const presetsWrap = document.querySelector('.ai-presets-wrap');
      if (presetsWrap && !this.defaultPresetsHtml) {
        this.defaultPresetsHtml = presetsWrap.innerHTML;
      }

      // Check URL parameters or current board for template key
      const urlTemplate = new URLSearchParams(window.location.search).get('template');
      if (urlTemplate && CREATOR_PERSONAS[urlTemplate]) {
        this.applyCreatorPersona(urlTemplate);
      } else if (window.StudioCore && window.StudioCore.getCurrentBoard && window.StudioCore.getCurrentBoard() && window.StudioCore.getCurrentBoard().templateKey) {
        this.applyCreatorPersona(window.StudioCore.getCurrentBoard().templateKey);
      }

      // Bind keyboard shortcut: Cmd+J or Ctrl+J
      window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
          e.preventDefault();
          this.toggleWindow();
        } else if (e.key === 'Escape' && this.isOpen && !this.isMinimized) {
          this.minimize();
        }
      });

      // Bind auto-resize on prompt textarea
      const textarea = document.getElementById('aiPromptInput');
      if (textarea) {
        textarea.addEventListener('input', () => {
          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight, 110) + 'px';
        });

        textarea.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
          }
        });
      }
    },

    applySavedState() {
      const windowEl = document.getElementById('aiCopilotWindow');
      if (!windowEl) return;

      if (this.isDocked) {
        windowEl.classList.add('is-docked');
        windowEl.style.left = '';
        windowEl.style.top = '';
        windowEl.style.right = '';
        windowEl.style.bottom = '';
      } else if (this.pos && typeof this.pos.left === 'number' && typeof this.pos.top === 'number') {
        const maxLeft = Math.max(10, window.innerWidth - 450);
        const maxTop = Math.max(10, window.innerHeight - 300);
        const left = Math.min(Math.max(10, this.pos.left), maxLeft);
        const top = Math.min(Math.max(10, this.pos.top), maxTop);

        windowEl.style.left = left + 'px';
        windowEl.style.top = top + 'px';
        windowEl.style.right = 'auto';
        windowEl.style.bottom = 'auto';
      }
    },

    initDraggable() {
      const windowEl = document.getElementById('aiCopilotWindow');
      const headerEl = document.getElementById('aiWindowHeader');
      if (!windowEl || !headerEl) return;

      let isDragging = false;
      let startX = 0;
      let startY = 0;
      let initialLeft = 0;
      let initialTop = 0;

      headerEl.addEventListener('pointerdown', (e) => {
        // Do not initiate drag if clicking buttons or actions
        if (e.target.closest('.ai-header-actions') || e.target.closest('button')) {
          return;
        }

        // If docked or on mobile, dragging is disabled
        if (this.isDocked || window.innerWidth <= 768) return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;

        const rect = windowEl.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        windowEl.classList.add('is-dragging');
        headerEl.setPointerCapture(e.pointerId);
      });

      headerEl.addEventListener('pointermove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        let newLeft = initialLeft + deltaX;
        let newTop = initialTop + deltaY;

        const windowWidth = windowEl.offsetWidth;
        const windowHeight = windowEl.offsetHeight;

        // Keep inside viewport with 12px margin
        const minLeft = 12;
        const maxLeft = window.innerWidth - windowWidth - 12;
        const minTop = 12;
        const maxTop = window.innerHeight - windowHeight - 12;

        newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
        newTop = Math.max(minTop, Math.min(newTop, maxTop));

        windowEl.style.left = newLeft + 'px';
        windowEl.style.top = newTop + 'px';
        windowEl.style.right = 'auto';
        windowEl.style.bottom = 'auto';
      });

      const stopDrag = (e) => {
        if (!isDragging) return;
        isDragging = false;
        windowEl.classList.remove('is-dragging');

        const rect = windowEl.getBoundingClientRect();
        this.pos = { left: rect.left, top: rect.top };
        try {
          localStorage.setItem('polish_ai_pos', JSON.stringify(this.pos));
        } catch (err) {}
      };

      headerEl.addEventListener('pointerup', stopDrag);
      headerEl.addEventListener('pointercancel', stopDrag);
    },

    toggleWindow(force) {
      if (typeof force === 'boolean') {
        if (force) {
          this.open();
        } else {
          this.close();
        }
        return;
      }

      if (!this.isOpen) {
        this.open();
      } else if (this.isMinimized) {
        this.restore();
      } else {
        this.minimize();
      }
    },

    toggleDrawer(force) {
      this.toggleWindow(force);
    },

    open() {
      const windowEl = document.getElementById('aiCopilotWindow');
      const pillEl = document.getElementById('aiMinimizedPill');
      const dockBtn = document.getElementById('btnAiCopilot');

      this.isOpen = true;
      this.isMinimized = false;

      if (pillEl) pillEl.classList.remove('is-active');
      if (windowEl) windowEl.classList.add('is-open');
      if (dockBtn) dockBtn.classList.add('active-pulse');

      // Refresh selection context badge immediately
      this.updateSelectionBadge(this.getSelectionContext());

      setTimeout(() => {
        const input = document.getElementById('aiPromptInput');
        if (input) input.focus();
      }, 150);
    },

    minimize() {
      const windowEl = document.getElementById('aiCopilotWindow');
      const pillEl = document.getElementById('aiMinimizedPill');
      const dockBtn = document.getElementById('btnAiCopilot');

      this.isMinimized = true;

      if (windowEl) windowEl.classList.remove('is-open');
      if (pillEl) pillEl.classList.add('is-active');
      if (dockBtn) dockBtn.classList.remove('active-pulse');
    },

    restore() {
      this.open();
    },

    close() {
      const windowEl = document.getElementById('aiCopilotWindow');
      const pillEl = document.getElementById('aiMinimizedPill');
      const dockBtn = document.getElementById('btnAiCopilot');

      this.isOpen = false;
      this.isMinimized = false;

      if (windowEl) windowEl.classList.remove('is-open');
      if (pillEl) pillEl.classList.remove('is-active');
      if (dockBtn) dockBtn.classList.remove('active-pulse');
    },

    toggleDock() {
      const windowEl = document.getElementById('aiCopilotWindow');
      if (!windowEl) return;

      this.isDocked = !this.isDocked;
      try {
        localStorage.setItem('polish_ai_docked', this.isDocked ? 'true' : 'false');
      } catch (e) {}

      if (this.isDocked) {
        windowEl.classList.add('is-docked');
        windowEl.style.left = '';
        windowEl.style.top = '';
        windowEl.style.right = '';
        windowEl.style.bottom = '';
      } else {
        windowEl.classList.remove('is-docked');
        this.applySavedState();
      }
    },

    sendPreset(presetText) {
      const input = document.getElementById('aiPromptInput');
      if (!input) return;
      input.value = presetText;
      this.sendMessage();
    },

    onTemplateLoaded(templateKey) {
      this.applyCreatorPersona(templateKey);
    },

    applyCreatorPersona(templateKey) {
      if (!templateKey) return;
      const config = CREATOR_PERSONAS[templateKey];
      if (!config) return;

      this.activeTemplateKey = templateKey;
      this.activeCreatorPersona = config.persona;

      // Update Header Subtitle Tag
      const subEl = document.getElementById('aiHeaderSubtitle');
      if (subEl) {
        subEl.textContent = config.badge;
        subEl.style.display = 'inline-flex';
      }

      // Update Presets Chips
      const presetsWrap = document.querySelector('.ai-presets-wrap');
      if (presetsWrap) {
        if (!this.defaultPresetsHtml) {
          this.defaultPresetsHtml = presetsWrap.innerHTML;
        }
        presetsWrap.innerHTML = '';
        config.presets.forEach(p => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'ai-preset-chip';
          btn.textContent = p.label;
          btn.title = p.prompt;
          btn.onclick = () => this.sendPreset(p.prompt);
          presetsWrap.appendChild(btn);
        });
      }

      // Update initial assistant message if chat is fresh
      if (this.history.length === 0) {
        const msgContainer = document.getElementById('aiMessagesContainer');
        if (msgContainer) {
          const firstBubble = msgContainer.querySelector('.ai-message.assistant .ai-msg-bubble p');
          if (firstBubble) {
            firstBubble.textContent = config.welcome;
          }
        }
      }
    },

    clearChat() {
      this.history = [];
      this.lastBoardCards = [];
      this.updatePillCardsCount();

      const config = this.activeTemplateKey ? CREATOR_PERSONAS[this.activeTemplateKey] : null;
      const welcomeText = config ? config.welcome : 'Define an offer structure, ad angle, CAC constraint, or client presentation challenge to architect for your board.';

      const container = document.getElementById('aiMessagesContainer');
      if (container) {
        container.innerHTML = `
          <div class="ai-message assistant">
            <div class="ai-msg-avatar">
              <img src="/assets/logo-gold-mark.svg?v=22.0" alt="POLISH" width="16" height="16" />
            </div>
            <div class="ai-msg-body">
              <div class="ai-msg-bubble">
                <p>${welcomeText}</p>
              </div>
            </div>
          </div>
        `;
      }
    },

    async sendMessage() {
      const input = document.getElementById('aiPromptInput');
      if (!input) return;

      const message = input.value.trim();
      if (!message || this.isThinking) return;

      // Clear input
      input.value = '';
      input.style.height = 'auto';

      // Ensure window is open & visible
      if (!this.isOpen || this.isMinimized) {
        this.open();
      }

      // Append User message
      this.appendMessage('user', message);
      this.history.push({ role: 'user', text: message });

      // Show typing indicator
      this.isThinking = true;
      this.setSendButtonState(true);
      const typingId = this.showTypingIndicator();

      // Gather current board context + live selection context
      const boardTitleInput = document.getElementById('boardTitleInput');
      const liveSelection = this.getSelectionContext();
      const currentBoardTemplate = (window.StudioCore && window.StudioCore.getCurrentBoard && window.StudioCore.getCurrentBoard()) ? window.StudioCore.getCurrentBoard().templateKey : null;
      const activeTemplate = this.activeTemplateKey || currentBoardTemplate || undefined;
      const activePersona = this.activeCreatorPersona || (activeTemplate && CREATOR_PERSONAS[activeTemplate] ? CREATOR_PERSONAS[activeTemplate].persona : undefined);

      const boardContext = {
        title: boardTitleInput ? boardTitleInput.value : 'Strategy Board',
        elementCount: window.StudioCore && window.StudioCore.getElements ? window.StudioCore.getElements().length : 0,
        selectionContext: liveSelection || undefined,
        templateKey: activeTemplate,
        creatorPersona: activePersona
      };

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            history: this.history.slice(-8),
            boardContext,
            creatorPersona: activePersona,
            templateKey: activeTemplate
          })
        });

        const data = await response.json();
        this.removeTypingIndicator(typingId);

        if (data.success && data.reply) {
          this.history.push({ role: 'model', text: data.rawReply || data.reply });
          if (data.boardCards && Array.isArray(data.boardCards) && data.boardCards.length > 0) {
            this.lastBoardCards = data.boardCards;
            this.updatePillCardsCount();
          }
          this.appendMessage('assistant', data.reply, data.boardCards);
        } else {
          this.appendMessage('assistant', `**Notice:** ${data.error || 'Unable to connect to AI engine.'}`);
        }
      } catch (err) {
        this.removeTypingIndicator(typingId);
        this.appendMessage('assistant', `**Notice:** Could not reach the Strategy Engine (${err.message}).`);
      } finally {
        this.isThinking = false;
        this.setSendButtonState(false);
      }
    },

    appendMessage(role, text, boardCards = null) {
      const container = document.getElementById('aiMessagesContainer');
      if (!container) return;

      const msgEl = document.createElement('div');
      msgEl.className = `ai-message ${role}`;

      const avatar = document.createElement('div');
      avatar.className = 'ai-msg-avatar';
      if (role === 'user') {
        avatar.textContent = 'YOU';
      } else {
        avatar.innerHTML = '<img src="/assets/logo-gold-mark.svg?v=22.0" alt="POLISH" width="16" height="16" />';
      }

      const body = document.createElement('div');
      body.className = 'ai-msg-body';

      if (role === 'user') {
        const bubble = document.createElement('div');
        bubble.className = 'ai-msg-bubble user';
        bubble.textContent = text;
        body.appendChild(bubble);
      } else {
        // Assistant: Direct Strategic Output Bubble (Zero Filler Headers)
        const bubble = document.createElement('div');
        bubble.className = 'ai-msg-bubble assistant';
        bubble.innerHTML = this.renderMarkdown(text);
        body.appendChild(bubble);

        // Render Strategy Card Deck Spawner if cards are available
        if (boardCards && Array.isArray(boardCards) && boardCards.length > 0) {
          const spawnerEl = document.createElement('div');
          spawnerEl.className = 'ai-deck-spawner';

          const spawnerHeader = document.createElement('div');
          spawnerHeader.className = 'ai-deck-header';
          spawnerHeader.innerHTML = `
            <span class="ai-deck-count-info">${boardCards.length} Board Element${boardCards.length === 1 ? '' : 's'} Ready</span>
          `;
          spawnerEl.appendChild(spawnerHeader);

          const previewList = document.createElement('div');
          previewList.className = 'ai-deck-preview-list';
          boardCards.forEach(c => {
            const item = document.createElement('div');
            item.className = 'ai-deck-preview-item';
            const tag = (c.type || 'STRATEGY').toUpperCase();
            const title = c.title || c.headline || 'Strategy Card';
            item.innerHTML = `<span class="ai-deck-tag">${tag}</span><span class="ai-deck-item-title">${title}</span>`;
            previewList.appendChild(item);
          });
          spawnerEl.appendChild(previewList);

          const addBtn = document.createElement('button');
          addBtn.className = 'btn-add-to-canvas';
          addBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
            Spawn to Canvas
          `;
          addBtn.onclick = () => {
            this.insertCardsToCanvas(boardCards);
            addBtn.disabled = true;
            addBtn.innerHTML = `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Added to Canvas
            `;
            addBtn.style.filter = 'grayscale(0.6)';
          };
          spawnerEl.appendChild(addBtn);

          body.appendChild(spawnerEl);
        }
      }

      msgEl.appendChild(avatar);
      msgEl.appendChild(body);
      container.appendChild(msgEl);

      container.scrollTop = container.scrollHeight;
    },

    updatePillCardsCount() {
      const badge = document.getElementById('aiPillCardsBadge');
      if (!badge) return;
      if (this.lastBoardCards && this.lastBoardCards.length > 0) {
        badge.textContent = `${this.lastBoardCards.length} Cards`;
        badge.style.display = 'inline-flex';
      } else {
        badge.style.display = 'none';
      }
    },

    showTypingIndicator() {
      const container = document.getElementById('aiMessagesContainer');
      if (!container) return null;

      const id = 'typing_' + Date.now();
      const typingEl = document.createElement('div');
      typingEl.id = id;
      typingEl.className = 'ai-message assistant';
      typingEl.innerHTML = `
        <div class="ai-msg-avatar">
          <img src="/assets/logo-gold-mark.svg?v=22.0" alt="POLISH" width="16" height="16" />
        </div>
        <div class="ai-msg-body">
          <div class="ai-msg-bubble assistant ai-typing-indicator">
            <div class="ai-typing-dot"></div>
            <div class="ai-typing-dot"></div>
            <div class="ai-typing-dot"></div>
          </div>
        </div>
      `;
      container.appendChild(typingEl);
      container.scrollTop = container.scrollHeight;
      return id;
    },

    removeTypingIndicator(id) {
      if (!id) return;
      const el = document.getElementById(id);
      if (el) el.remove();
    },

    setSendButtonState(disabled) {
      const btn = document.getElementById('aiSendBtn');
      if (btn) btn.disabled = disabled;
    },

    // Insert AI generated cards & widgets directly onto the whiteboard canvas
    insertCardsToCanvas(cards) {
      if (!window.StudioCore || !cards || !cards.length) return;

      // Determine viewport center coordinates on board
      const panZoom = window.CanvasPanZoom || { panX: 0, panY: 0, zoom: 1 };
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Center of visible screen converted to board world coordinates
      let startX = (-panZoom.panX + (viewportWidth / 2) - 260) / panZoom.zoom;
      let startY = (-panZoom.panY + (viewportHeight / 2) - 160) / panZoom.zoom;

      const createdCardIds = [];
      const nonConnectableTypes = ['sticky', 'text'];
      let currentX = startX;

      cards.forEach((card, index) => {
        const rawType = String(card.type || card.elementType || 'frame').toLowerCase();
        const elemWidth = card.width || (
          rawType === 'payment-architecture' ? 780 :
          rawType === 'value-equation' ? 740 :
          rawType === 'sprint-swimlane' ? 900 :
          rawType === 'belief-triad' ? 780 :
          rawType === 'diagnostic-protocol' ? 700 :
          rawType === 'offer-name-generator' ? 500 :
          rawType === 'bonus-stack' ? 480 :
          rawType === 'prescription' ? 440 :
          rawType === 'pipeline-node' ? 440 :
          rawType === 'capacity-indicator' ? 380 :
          rawType === 'pricing' ? 340 :
          rawType === 'sticky' ? 300 : 460
        );

        const posX = Math.round(currentX);
        const posY = Math.round(startY + ((index % 2) * 35));
        currentX += elemWidth + 40;

        let element = null;
        if (typeof window.StudioCore.addStrategyCard === 'function') {
          element = window.StudioCore.addStrategyCard(card, posX, posY);
        } else if (typeof window.StudioCore.addSticky === 'function') {
          element = window.StudioCore.addSticky('gold');
        }

        if (element && element.id && !nonConnectableTypes.includes(rawType)) {
          createdCardIds.push(element.id);
        }
      });

      // Connect created cards sequentially if ConnectorEngine is available
      if (createdCardIds.length > 1) {
        for (let i = 0; i < createdCardIds.length - 1; i++) {
          try {
            if (typeof window.StudioCore.addConnection === 'function') {
              window.StudioCore.addConnection(createdCardIds[i], createdCardIds[i + 1]);
            } else if (window.ConnectorEngine && typeof window.ConnectorEngine.createConnection === 'function') {
              window.ConnectorEngine.createConnection(createdCardIds[i], createdCardIds[i + 1]);
            }
          } catch (e) {
            console.warn('[StudioAI] Connector auto-link bypassed:', e.message);
          }
        }
      }

      // Mark dirty and trigger auto-save
      window.StudioCore.markDirty();
      if (typeof window.StudioCore.showToast === 'function') {
        window.StudioCore.showToast(`Added ${cards.length} element${cards.length === 1 ? '' : 's'} to canvas.`);
      }
    },

    // Clean client-side markdown renderer
    renderMarkdown(text) {
      if (!text) return '';
      let html = text
        // Headings
        .replace(/^#### (.*$)/gim, '<h4>$1</h4>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold & Italic
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        // Unordered lists
        .replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>')
        // Numbered lists
        .replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>')
        // Paragraph breaks
        .replace(/\n\n+/g, '</p><p>')
        .replace(/\n/g, '<br>');

      // Wrap list items in <ul>
      html = html.replace(/(<li>[\s\S]*?<\/li>)/gm, '<ul>$1</ul>');
      // Clean up consecutive <ul> tags
      html = html.replace(/<\/ul>\s*<ul>/g, '');

      return `<p>${html}</p>`;
    },

    // ── Selection Context ──────────────────────────────────────────────────────

    // Reads currently selected canvas elements and builds a structured context array.
    getSelectionContext() {
      let ids = (window.MarqueeEngine && window.MarqueeEngine.getSelectedIds())
        || (window.StudioCore && window.StudioCore._multiSelectedIds ? Array.from(window.StudioCore._multiSelectedIds) : []);

      // If no multi-selection, check single selection
      if ((!ids || ids.length === 0) && window.StudioCore && window.StudioCore.getSelectedElementData) {
        const single = window.StudioCore.getSelectedElementData();
        if (single && single.id) ids = [single.id];
      }

      if (!ids || ids.length === 0) {
        this._selectionContext = null;
        return null;
      }

      const items = [];
      ids.forEach(id => {
        const data = window.StudioCore && window.StudioCore.findElement ? window.StudioCore.findElement(id) : null;
        if (!data) return;

        const type = (data.type || 'element').toUpperCase();
        let title = data.title || data.headline || data.header || data.text || '(Untitled)';
        let content = '';

        if (data.type === 'pricing') {
          title = `${data.tier || 'Pricing Tier'} (${data.currency || '$'}${data.price || '0'}${data.period ? ' / ' + data.period : ''})`;
          content = Array.isArray(data.features) ? 'Features: ' + data.features.join(' • ') : '';
        } else if (data.type === 'frame') {
          title = `${data.headline || 'Frame'} ${data.serifAccent ? '— ' + data.serifAccent : ''}`;
          const boxSummaries = (data.boxes || []).map(b => `[${b.tag || 'BOX'}] ${b.title}: ${b.content}`).join(' | ');
          content = `${data.description || ''} ${boxSummaries}`.trim();
        } else if (data.type === 'table') {
          title = data.title || 'Data Table';
          const headers = (data.headers || []).join(' | ');
          const rowSample = (data.rows || []).slice(0, 3).map(r => r.join(' | ')).join(' \n ');
          content = `Headers: ${headers} \n Sample Rows: ${rowSample}`;
        } else if (data.type === 'sticky') {
          title = data.header || 'Sticky Note';
          content = `${data.content || ''} ${data.footer ? '(' + data.footer + ')' : ''}`.trim();
        } else {
          content = data.content || data.body || data.description || data.text || '';
        }

        items.push({ type, title: String(title).slice(0, 140), content: String(content).slice(0, 400) });
      });

      this._selectionContext = items.length > 0 ? items : null;
      return this._selectionContext;
    },

    clearSelectionContext(deselectCanvas = true) {
      this._selectionContext = null;
      this.updateSelectionBadge(null);
      if (deselectCanvas) {
        if (window.StudioCore && window.StudioCore.deselectAll) {
          window.StudioCore.deselectAll();
        }
        if (window.MarqueeEngine && window.MarqueeEngine.clearMultiSelection) {
          window.MarqueeEngine.clearMultiSelection();
        }
      }
    },

    // Updates the #aiSelectionBadge UI element.
    updateSelectionBadge(items) {
      const badge = document.getElementById('aiSelectionBadge');
      const label = document.getElementById('aiSelectionBadgeLabel');
      if (!badge || !label) return;

      if (items && items.length > 0) {
        label.textContent = `${items.length} ${items.length === 1 ? 'element' : 'elements'} in context`;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    },

    // Hook called from marquee-selection / studio-core when selection changes.
    onCanvasSelectionChange(ids) {
      if (!ids || ids.length === 0) {
        this.clearSelectionContext(false); // Do not recurse into StudioCore.deselectAll
        return;
      }
      const ctx = this.getSelectionContext();
      this.updateSelectionBadge(ctx);
    }
  };

  // Expose to window
  window.StudioAI = StudioAI;

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => StudioAI.init());
  } else {
    StudioAI.init();
  }
})();
