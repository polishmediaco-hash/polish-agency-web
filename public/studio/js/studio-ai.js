/**
 * POLISH Board Studio — AI Strategy Copilot Engine
 * 
 * Hyper-specialized in Marketing, Luxury Branding, High-Ticket Sales,
 * Irresistible Offers, Haute Copywriting, and Content/UGC Strategy.
 */

(function () {
  'use strict';

  const StudioAI = {
    isOpen: false,
    isThinking: false,
    history: [],

    init() {
      // Bind keyboard shortcut: Cmd+J or Ctrl+J
      window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'j') {
          e.preventDefault();
          this.toggleDrawer();
        }
      });

      // Bind auto-resize on prompt textarea
      const textarea = document.getElementById('aiPromptInput');
      if (textarea) {
        textarea.addEventListener('input', () => {
          textarea.style.height = 'auto';
          textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        });

        textarea.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
          }
        });
      }
    },

    toggleDrawer(force) {
      const drawer = document.getElementById('aiCopilotDrawer');
      const backdrop = document.getElementById('aiCopilotBackdrop');
      if (!drawer) return;

      this.isOpen = typeof force === 'boolean' ? force : !this.isOpen;

      if (this.isOpen) {
        drawer.classList.add('is-open');
        if (backdrop) backdrop.classList.add('is-open');
        setTimeout(() => {
          const input = document.getElementById('aiPromptInput');
          if (input) input.focus();
        }, 150);
      } else {
        drawer.classList.remove('is-open');
        if (backdrop) backdrop.classList.remove('is-open');
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
      const container = document.getElementById('aiMessagesContainer');
      if (container) {
        container.innerHTML = `
          <div class="ai-message assistant">
            <div class="ai-msg-avatar">AI</div>
            <div class="ai-msg-body">
              <div class="ai-msg-bubble">
                <p><strong>Polish AI Active.</strong></p>
                <p>Define an offer structure, ad angle, CAC constraint, or client presentation challenge to architect for your board.</p>
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

      const bubble = document.createElement('div');
      bubble.className = 'ai-msg-bubble';
      bubble.innerHTML = this.renderMarkdown(text);
      body.appendChild(bubble);

      // If response includes board cards, render the "Add to Canvas" action box
      if (boardCards && Array.isArray(boardCards) && boardCards.length > 0) {
        const actionBox = document.createElement('div');
        actionBox.className = 'ai-cards-action-box';

        const info = document.createElement('div');
        info.className = 'ai-cards-count-info';
        info.textContent = `${boardCards.length} Strategy ${boardCards.length === 1 ? 'Card' : 'Cards'} Available`;

        const addBtn = document.createElement('button');
        addBtn.className = 'btn-add-to-canvas';
        addBtn.textContent = 'Add to Canvas';
        addBtn.onclick = () => {
          this.insertCardsToCanvas(boardCards);
          addBtn.disabled = true;
          addBtn.textContent = 'Added to Canvas';
          addBtn.style.filter = 'grayscale(0.6)';
        };

        actionBox.appendChild(info);
        actionBox.appendChild(addBtn);
        body.appendChild(actionBox);
      }

      msgEl.appendChild(avatar);
      msgEl.appendChild(body);
      container.appendChild(msgEl);

      // Scroll to bottom smoothly
      container.scrollTop = container.scrollHeight;
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
          <div class="ai-msg-bubble ai-typing-indicator">
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

      // Briefly close drawer on mobile so user sees the new cards immediately
      if (window.innerWidth < 768) {
        this.toggleDrawer(false);
      }
    },

    // Simple, clean client-side markdown renderer
    renderMarkdown(text) {
      if (!text) return '';
      let html = text
        // Headings
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
