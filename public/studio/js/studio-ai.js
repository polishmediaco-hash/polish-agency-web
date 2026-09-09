/**
 * POLISH Board Studio — Polish AI Strategy Intelligence Engine
 * 
 * Non-blocking floating luxury window with draggable spatial controls,
 * ambient minimized pill, zero-emoji high-ticket copywriting,
 * and smart whiteboard card spawning.
 */

(function () {
  'use strict';

  const StudioAI = {
    isOpen: false,
    isMinimized: false,
    isDocked: false,
    isThinking: false,
    history: [],
    lastBoardCards: [],
    pos: null,

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

    clearChat() {
      this.history = [];
      this.lastBoardCards = [];
      this.updatePillCardsCount();

      const container = document.getElementById('aiMessagesContainer');
      if (container) {
        container.innerHTML = `
          <div class="ai-message assistant">
            <div class="ai-msg-avatar">AI</div>
            <div class="ai-msg-body">
              <div class="ai-brief-card">
                <div class="ai-brief-header">
                  <span class="ai-brief-tag">INTELLIGENCE BRIEF</span>
                  <span class="ai-brief-status">READY</span>
                </div>
                <h4 class="ai-brief-title">Polish AI Active</h4>
                <p class="ai-brief-prose">Define an offer structure, ad angle, CAC constraint, or client presentation challenge to architect for your board. I will provide direct DTC unit economics and spawn custom strategy frames directly onto your canvas.</p>
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

      // Gather current board context
      const boardTitleInput = document.getElementById('boardTitleInput');
      const boardContext = {
        title: boardTitleInput ? boardTitleInput.value : 'Strategy Board',
        elementCount: window.StudioCore && window.StudioCore.getElements ? window.StudioCore.getElements().length : 0
      };

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            history: this.history.slice(-8),
            boardContext
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
          this.appendMessage('assistant', `**System Notice:** ${data.error || 'Unable to connect to AI engine.'}`);
        }
      } catch (err) {
        this.removeTypingIndicator(typingId);
        this.appendMessage('assistant', `**Connection Error:** Could not reach the Strategy Engine (${err.message}).`);
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
      avatar.innerHTML = role === 'user' ? 'YOU' : 'AI';

      const body = document.createElement('div');
      body.className = 'ai-msg-body';

      if (role === 'user') {
        const bubble = document.createElement('div');
        bubble.className = 'ai-msg-bubble';
        bubble.textContent = text;
        body.appendChild(bubble);
      } else {
        // Assistant: Haute Atelier Executive Brief Card
        const briefCard = document.createElement('div');
        briefCard.className = 'ai-brief-card';

        const briefHeader = document.createElement('div');
        briefHeader.className = 'ai-brief-header';
        briefHeader.innerHTML = `
          <span class="ai-brief-tag">STRATEGIC ANALYSIS</span>
          <span class="ai-brief-status">VALIDATED</span>
        `;
        briefCard.appendChild(briefHeader);

        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'ai-brief-content';
        contentWrapper.innerHTML = this.renderMarkdown(text);
        briefCard.appendChild(contentWrapper);

        // Render Strategy Card Deck Spawner if cards are available
        if (boardCards && Array.isArray(boardCards) && boardCards.length > 0) {
          const spawnerEl = document.createElement('div');
          spawnerEl.className = 'ai-deck-spawner';

          const spawnerHeader = document.createElement('div');
          spawnerHeader.className = 'ai-deck-header';
          spawnerHeader.innerHTML = `
            <span class="ai-deck-count-info">${boardCards.length} Strategy ${boardCards.length === 1 ? 'Card' : 'Cards'} Ready</span>
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

          briefCard.appendChild(spawnerEl);
        }

        body.appendChild(briefCard);
      }

      msgEl.appendChild(avatar);
      msgEl.appendChild(body);
      container.appendChild(msgEl);

      // Smooth scroll to bottom
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
        <div class="ai-msg-avatar">AI</div>
        <div class="ai-msg-body">
          <div class="ai-brief-card" style="padding: 10px 14px;">
            <div class="ai-typing-indicator">
              <div class="ai-typing-dot"></div>
              <div class="ai-typing-dot"></div>
              <div class="ai-typing-dot"></div>
            </div>
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

    // Insert AI generated cards directly onto the whiteboard canvas
    insertCardsToCanvas(cards) {
      if (!window.StudioCore || !cards || !cards.length) return;

      // Determine viewport center coordinates on board
      const panZoom = window.CanvasPanZoom || { panX: 0, panY: 0, zoom: 1 };
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      // Center of visible screen converted to board world coordinates
      let startX = (-panZoom.panX + (viewportWidth / 2) - 200) / panZoom.zoom;
      let startY = (-panZoom.panY + (viewportHeight / 2) - 140) / panZoom.zoom;

      const createdCardIds = [];

      cards.forEach((card, index) => {
        // Place cards horizontally staggered across the board
        const posX = Math.round(startX + (index * 470));
        const posY = Math.round(startY + ((index % 2) * 50));

        let element = null;
        if (typeof window.StudioCore.addStrategyCard === 'function') {
          element = window.StudioCore.addStrategyCard(card, posX, posY);
        } else if (typeof window.StudioCore.addSticky === 'function') {
          element = window.StudioCore.addSticky('gold');
        }

        if (element && element.id) {
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
        window.StudioCore.showToast(`Added ${cards.length} strategy cards to canvas.`);
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
