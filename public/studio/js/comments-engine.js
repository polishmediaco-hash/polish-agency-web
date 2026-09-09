/**
 * POLISH Media Co. — Client Commenting & Strategic Pin Drop Engine
 * 
 * Implements Haute Atelier interactive canvas-space commenting:
 * - Precision pin drop mode (cursor crosshair, exact canvas-space transform)
 * - Numbered Haute Atelier Champagne Gold pins & Emerald-Gold Pillar Approval stamps
 * - Floating glass card popovers with feedback threads and resolve toggles
 * - Slide-over comments tray with "Jump to Pin" smooth-panning
 * - Atomic persistence via /api/boards/:id/comments, localStorage, and Firebase sync
 */

(function () {
  'use strict';

  window.CommentsEngine = (function () {
    let boardId = null;
    let comments = [];
    let isPinDropMode = false;
    let activePinId = null;
    let draftPin = null;
    let isTrayOpen = false;
    let currentFilter = 'all'; // 'all' | 'open' | 'resolved'
    let currentAuthor = 'Client';

    // DOM References
    let viewportEl = null;
    let canvasEl = null;
    let pinsLayerEl = null;
    let popoverEl = null;
    let trayEl = null;
    let bannerEl = null;
    let dropPinBtnEl = null;
    let commentsCountBadgeEl = null;

    /**
     * Initialize Comments Engine
     */
    async function init(explicitBoardId) {
      // 1. Resolve Board ID
      if (explicitBoardId) {
        boardId = explicitBoardId;
      } else {
        const pathSegments = window.location.pathname.split('/').filter(Boolean);
        if (pathSegments.length >= 2 && (pathSegments[0] === 'b' || pathSegments[0] === 'view')) {
          boardId = pathSegments[1];
        } else {
          boardId = new URLSearchParams(window.location.search).get('id') || 'starter-strategy-board';
        }
      }

      // 2. Resolve cached author name
      try {
        const savedAuthor = localStorage.getItem('polish_comment_author');
        if (savedAuthor) currentAuthor = savedAuthor;
        if (window.PolishFirebase && window.PolishFirebase.currentUser) {
          currentAuthor = window.PolishFirebase.currentUser.displayName || currentAuthor;
        }
      } catch (_) {}

      // 3. Cache DOM elements & build dynamic overlays
      viewportEl = document.getElementById('viewport');
      canvasEl = document.getElementById('board-canvas');
      dropPinBtnEl = document.getElementById('dropPinBtn');
      commentsCountBadgeEl = document.getElementById('commentsCountBadge');

      if (!viewportEl || !canvasEl) return;

      setupDOMContainers();
      bindEventListeners();

      // 4. Initial load of comments
      await loadComments();
    }

    /**
     * Setup DOM elements (Pins layer, Popover container, Slide-over Tray, Drop Banner)
     */
    function setupDOMContainers() {
      // Pin container inside #board-canvas (scales & pans 1:1 with canvas)
      pinsLayerEl = document.getElementById('comments-pins-layer');
      if (!pinsLayerEl) {
        pinsLayerEl = document.createElement('div');
        pinsLayerEl.id = 'comments-pins-layer';
        pinsLayerEl.className = 'comments-pins-layer';
        canvasEl.appendChild(pinsLayerEl);
      }

      // Floating Popover Card in #viewport
      popoverEl = document.getElementById('commentCardPopover');
      if (!popoverEl) {
        popoverEl = document.createElement('div');
        popoverEl.id = 'commentCardPopover';
        popoverEl.className = 'comment-card-popover';
        popoverEl.style.display = 'none';
        viewportEl.appendChild(popoverEl);
      }

      // Slide-over Comments Tray in body
      trayEl = document.getElementById('commentsTray');
      if (!trayEl) {
        trayEl = document.createElement('aside');
        trayEl.id = 'commentsTray';
        trayEl.className = 'comments-tray';
        document.body.appendChild(trayEl);
      }

      // Pin Drop Floating Banner in body
      bannerEl = document.getElementById('pinDropBanner');
      if (!bannerEl) {
        bannerEl = document.createElement('div');
        bannerEl.id = 'pinDropBanner';
        bannerEl.className = 'pin-drop-banner';
        bannerEl.innerHTML = `
          <div class="banner-pill">
            <span class="banner-dot"></span>
            <span class="banner-text">Precision Pin Drop Active — Click anywhere on blueprint to place pin</span>
            <button class="banner-esc-btn" onclick="CommentsEngine.togglePinDropMode(false)" title="Cancel pin drop (Esc)">Esc</button>
          </div>
        `;
        document.body.appendChild(bannerEl);
      }
    }

    /**
     * Bind click, pan, and keyboard events
     */
    function bindEventListeners() {
      // Capture clicks for dropping pins anywhere on the canvas
      viewportEl.addEventListener('click', (e) => {
        if (!isPinDropMode) return;

        // Ignore clicks on docks, HUD, popover, or tray
        if (e.target.closest('.client-dock, .viewport-tools, .presentation-bar, .comment-card-popover, .comments-tray, .pin-drop-banner')) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        // Exact canvas-space coordinate calculation
        const scale = (typeof CanvasEngine !== 'undefined' && CanvasEngine.scale !== undefined)
          ? CanvasEngine.scale
          : (window.CanvasEngine && window.CanvasEngine.getScale ? window.CanvasEngine.getScale() : 0.75);
        const panX = (typeof CanvasEngine !== 'undefined' && CanvasEngine.panX !== undefined)
          ? CanvasEngine.panX
          : (window.CanvasEngine && window.CanvasEngine.getPan ? window.CanvasEngine.getPan().x : 0);
        const panY = (typeof CanvasEngine !== 'undefined' && CanvasEngine.panY !== undefined)
          ? CanvasEngine.panY
          : (window.CanvasEngine && window.CanvasEngine.getPan ? window.CanvasEngine.getPan().y : 0);

        const canvasX = (e.clientX - panX) / scale;
        const canvasY = (e.clientY - panY) / scale;

        handleDropPinAt(canvasX, canvasY);
      }, true); // Capture phase so it triggers even when clicking on cards/frames!

      // Update popover screen position when viewport is panned or zoomed
      const syncPopover = () => {
        if (activePinId || draftPin) {
          updatePopoverPosition();
        }
      };
      viewportEl.addEventListener('wheel', syncPopover, { passive: true });
      viewportEl.addEventListener('pointermove', () => {
        if (viewportEl.classList.contains('is-dragging')) {
          syncPopover();
        }
      });
      window.addEventListener('resize', syncPopover);

      // Keyboard shortcuts (Escape exits pin drop mode or closes popover/tray)
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (isPinDropMode) {
            togglePinDropMode(false);
          } else if (draftPin) {
            cancelDraftPin();
          } else if (activePinId) {
            closePopover();
          } else if (isTrayOpen) {
            toggleTray(false);
          }
        }
      });
    }

    /**
     * Toggle Pin Drop Mode
     */
    function togglePinDropMode(force) {
      isPinDropMode = force !== undefined ? force : !isPinDropMode;

      if (isPinDropMode) {
        if (draftPin) cancelDraftPin();
        closePopover();
        toggleTray(false);

        viewportEl.classList.add('pin-drop-active');
        bannerEl.classList.add('is-visible');
        if (dropPinBtnEl) dropPinBtnEl.classList.add('is-active');
      } else {
        viewportEl.classList.remove('pin-drop-active');
        bannerEl.classList.remove('is-visible');
        if (dropPinBtnEl) dropPinBtnEl.classList.remove('is-active');
      }
    }

    /**
     * Handle user clicking canvas while in Pin Drop Mode
     */
    function handleDropPinAt(canvasX, canvasY) {
      // Exit drop mode
      togglePinDropMode(false);

      const nextNumber = comments.length + 1;
      draftPin = {
        id: `draft-${Date.now()}`,
        isDraft: true,
        x: Math.round(canvasX),
        y: Math.round(canvasY),
        number: nextNumber,
        type: 'feedback', // default
        author: currentAuthor,
        content: '',
        resolved: false,
        createdAt: new Date().toISOString(),
        replies: []
      };

      renderPins();
      openPopover(draftPin, true);
    }

    /**
     * Render all pins into #comments-pins-layer
     */
    function renderPins() {
      if (!pinsLayerEl) return;
      pinsLayerEl.innerHTML = '';

      const pinsToRender = [...comments];
      if (draftPin) pinsToRender.push(draftPin);

      pinsToRender.forEach((pin) => {
        const pinEl = document.createElement('div');
        pinEl.className = `comment-pin pin-type-${pin.type} ${pin.resolved ? 'is-resolved' : ''} ${pin.id === activePinId || (pin.isDraft && draftPin) ? 'is-active' : ''}`;
        pinEl.id = `pin-el-${pin.id}`;
        pinEl.style.left = `${pin.x}px`;
        pinEl.style.top = `${pin.y}px`;
        pinEl.dataset.pinId = pin.id;

        // Visual layout based on type
        if (pin.type === 'approval') {
          pinEl.innerHTML = `
            <div class="pin-anchor-head approval-head">
              <div class="pin-approval-disc">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span class="pin-seq-num">${pin.number}</span>
              </div>
              <div class="pin-approval-stamp">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                <span>Pillar Approved ✓</span>
              </div>
            </div>
            <div class="pin-stem approval-stem"></div>
          `;
        } else {
          // Haute Atelier Gold Pin (Strategic Feedback)
          pinEl.innerHTML = `
            <div class="pin-anchor-head gold-head">
              <div class="pin-gold-disc">
                <svg class="pin-note-icon" width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <span class="pin-seq-num">${pin.number}</span>
              </div>
            </div>
            <div class="pin-stem gold-stem"></div>
          `;
        }

        // Pin Click Handler
        pinEl.addEventListener('click', (e) => {
          e.stopPropagation();
          if (isPinDropMode) return;
          if (draftPin && draftPin.id !== pin.id) {
            cancelDraftPin();
          }
          openPopover(pin, pin.isDraft);
        });

        pinsLayerEl.appendChild(pinEl);
      });

      updateBadgeCounter();
      renderTray();
    }

    /**
     * Open floating glass card popover next to a pin
     */
    function openPopover(pin, isNewDraft = false) {
      activePinId = pin.id;
      popoverEl.dataset.pinId = pin.id;
      popoverEl.style.display = 'block';

      if (isNewDraft) {
        renderDraftPopoverContent(pin);
      } else {
        renderExistingPopoverContent(pin);
      }

      updatePopoverPosition();

      // Highlight active pin element
      document.querySelectorAll('.comment-pin').forEach(el => el.classList.remove('is-active'));
      const activeEl = document.getElementById(`pin-el-${pin.id}`);
      if (activeEl) activeEl.classList.add('is-active');
    }

    /**
     * Update Popover screen coordinates anchored to current pin
     */
    function updatePopoverPosition() {
      const targetPin = draftPin || comments.find(c => c.id === activePinId);
      if (!targetPin || !popoverEl || popoverEl.style.display === 'none') return;

      const scale = (typeof CanvasEngine !== 'undefined' && CanvasEngine.scale !== undefined)
        ? CanvasEngine.scale
        : (window.CanvasEngine && window.CanvasEngine.getScale ? window.CanvasEngine.getScale() : 0.75);
      const panX = (typeof CanvasEngine !== 'undefined' && CanvasEngine.panX !== undefined)
        ? CanvasEngine.panX
        : (window.CanvasEngine && window.CanvasEngine.getPan ? window.CanvasEngine.getPan().x : 0);
      const panY = (typeof CanvasEngine !== 'undefined' && CanvasEngine.panY !== undefined)
        ? CanvasEngine.panY
        : (window.CanvasEngine && window.CanvasEngine.getPan ? window.CanvasEngine.getPan().y : 0);

      const screenX = targetPin.x * scale + panX;
      const screenY = targetPin.y * scale + panY;

      const popoverWidth = 350;
      const popoverHeight = popoverEl.offsetHeight || 260;

      // Position directly above pin tip if space allows, otherwise below
      let left = screenX - (popoverWidth / 2);
      let top = screenY - popoverHeight - 24;

      // Boundary clamp to keep card in viewport
      if (top < 80) {
        top = screenY + 28; // flip below
      }
      left = Math.max(20, Math.min(window.innerWidth - popoverWidth - 20, left));

      popoverEl.style.left = `${Math.round(left)}px`;
      popoverEl.style.top = `${Math.round(top)}px`;
    }

    /**
     * Render Content: New Pin Draft
     */
    function renderDraftPopoverContent(pin) {
      popoverEl.innerHTML = `
        <div class="popover-header">
          <div class="popover-title-wrap">
            <span class="popover-pin-badge">NEW PIN #${pin.number}</span>
            <span class="popover-status-pill">Draft</span>
          </div>
          <button class="popover-close-btn" onclick="CommentsEngine.cancelDraftPin()" title="Cancel (Esc)">✕</button>
        </div>

        <div class="popover-type-selector">
          <button type="button" class="type-tab-btn ${pin.type === 'feedback' ? 'is-selected' : ''}" onclick="CommentsEngine.setDraftType('feedback')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <span>Strategic Note</span>
          </button>
          <button type="button" class="type-tab-btn ${pin.type === 'approval' ? 'is-selected is-approval' : ''}" onclick="CommentsEngine.setDraftType('approval')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>Pillar Approval</span>
          </button>
        </div>

        <div class="popover-body">
          <div class="author-row">
            <input id="commentAuthorInput" type="text" class="popover-input-author" value="${escapeHtml(pin.author)}" placeholder="Your Name or Title (e.g. Founder, CMO)" maxlength="60" />
          </div>
          <textarea id="commentTextInput" class="popover-textarea" rows="3" placeholder="${pin.type === 'approval' ? 'Add note for Pillar Approval (e.g. Approved with Q3 launch target)...' : 'Share strategic observation, revision request, or question...'}" autofocus></textarea>
        </div>

        <div class="popover-footer">
          <button type="button" class="btn-popover-cancel" onclick="CommentsEngine.cancelDraftPin()">Cancel</button>
          <button type="button" class="btn-popover-submit" onclick="CommentsEngine.saveDraftPin()">
            <span>${pin.type === 'approval' ? 'Stamp Approval ✓' : 'Drop Pin Note'}</span>
          </button>
        </div>
      `;

      setTimeout(() => {
        const textInput = document.getElementById('commentTextInput');
        if (textInput) {
          textInput.focus();
          textInput.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
              saveDraftPin();
            }
          });
        }
      }, 50);
    }

    /**
     * Set type on active draft pin ('feedback' | 'approval')
     */
    function setDraftType(type) {
      if (!draftPin) return;
      draftPin.type = type;
      renderPins();
      renderDraftPopoverContent(draftPin);
    }

    /**
     * Save draft pin to board comments and sync
     */
    async function saveDraftPin() {
      if (!draftPin) return;

      const authorInput = document.getElementById('commentAuthorInput');
      const textInput = document.getElementById('commentTextInput');

      const author = (authorInput?.value || currentAuthor || 'Client').trim();
      const content = (textInput?.value || '').trim();

      if (!content && draftPin.type !== 'approval') {
        if (textInput) {
          textInput.focus();
          textInput.classList.add('shake-error');
          setTimeout(() => textInput.classList.remove('shake-error'), 400);
        }
        return;
      }

      currentAuthor = author;
      try { localStorage.setItem('polish_comment_author', currentAuthor); } catch (_) {}

      const newComment = {
        id: `pin-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        boardId: boardId,
        x: draftPin.x,
        y: draftPin.y,
        number: draftPin.number,
        type: draftPin.type,
        author: author,
        content: content || (draftPin.type === 'approval' ? 'Pillar Verified & Approved for Strategic Execution.' : 'Strategic Note.'),
        resolved: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: []
      };

      draftPin = null;
      comments.push(newComment);
      renderPins();
      openPopover(newComment, false);

      // Persist to server, localStorage, and Firebase
      await persistComment(newComment);
      showClientToast(newComment.type === 'approval' ? 'Pillar Approved stamp placed!' : 'Strategic pin dropped!');
    }

    /**
     * Cancel draft pin creation
     */
    function cancelDraftPin() {
      draftPin = null;
      closePopover();
      renderPins();
    }

    /**
     * Render Content: Existing Comment
     */
    function renderExistingPopoverContent(pin) {
      const initials = getInitials(pin.author);
      const timeFormatted = formatTimeAgo(pin.createdAt);

      const repliesHtml = (pin.replies || []).map(r => `
        <div class="popover-reply-item">
          <div class="reply-meta">
            <span class="reply-avatar">${getInitials(r.author)}</span>
            <span class="reply-author">${escapeHtml(r.author)}</span>
            <span class="reply-time">${formatTimeAgo(r.createdAt)}</span>
          </div>
          <div class="reply-content">${escapeHtml(r.content)}</div>
        </div>
      `).join('');

      popoverEl.innerHTML = `
        <div class="popover-header">
          <div class="popover-title-wrap">
            <span class="popover-pin-badge">PIN #${pin.number}</span>
            ${pin.type === 'approval'
              ? `<span class="badge-approval-pill"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> Pillar Approved ✓</span>`
              : `<span class="badge-note-pill">✦ Strategic Note</span>`
            }
            <span class="badge-status-pill ${pin.resolved ? 'is-resolved' : 'is-open'}">${pin.resolved ? 'Resolved' : 'Open'}</span>
          </div>
          <button class="popover-close-btn" onclick="CommentsEngine.closePopover()" title="Close (Esc)">✕</button>
        </div>

        <div class="popover-existing-body">
          <div class="author-meta-row">
            <div class="author-avatar-gold">${initials}</div>
            <div class="author-info">
              <div class="author-name">${escapeHtml(pin.author)}</div>
              <div class="author-timestamp">${timeFormatted}</div>
            </div>
          </div>

          <div class="comment-content-box">
            ${escapeHtml(pin.content)}
          </div>

          ${pin.type === 'approval' ? `
            <div class="stamp-verified-box">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <span>Verified Haute Pillar Alignment</span>
            </div>
          ` : ''}

          <!-- Replies Thread -->
          ${repliesHtml ? `<div class="popover-replies-list">${repliesHtml}</div>` : ''}

          <!-- Add Reply Box -->
          <div class="popover-add-reply">
            <input id="replyInput_${pin.id}" type="text" class="reply-input" placeholder="Reply to thread as ${escapeHtml(currentAuthor)}..." maxlength="500" />
            <button type="button" class="btn-send-reply" onclick="CommentsEngine.addReply('${pin.id}')">Reply</button>
          </div>
        </div>

        <div class="popover-footer-existing">
          <button type="button" class="btn-resolve-toggle ${pin.resolved ? 'is-resolved' : ''}" onclick="CommentsEngine.toggleResolve('${pin.id}')">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span>${pin.resolved ? 'Reopen Feedback' : 'Mark as Resolved'}</span>
          </button>
          <button type="button" class="btn-delete-pin" onclick="CommentsEngine.deleteComment('${pin.id}')" title="Delete pin">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      `;

      // Allow pressing enter in reply box
      setTimeout(() => {
        const replyInput = document.getElementById(`replyInput_${pin.id}`);
        if (replyInput) {
          replyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              addReply(pin.id);
            }
          });
        }
      }, 50);
    }

    /**
     * Add reply to existing comment
     */
    async function addReply(commentId) {
      const pin = comments.find(c => c.id === commentId);
      if (!pin) return;

      const input = document.getElementById(`replyInput_${commentId}`);
      const text = (input?.value || '').trim();
      if (!text) return;

      const replyObj = {
        id: `rep-${Date.now().toString(36)}`,
        author: currentAuthor || 'Advisor',
        content: text,
        createdAt: new Date().toISOString()
      };

      pin.replies = pin.replies || [];
      pin.replies.push(replyObj);

      renderPins();
      renderExistingPopoverContent(pin);
      updatePopoverPosition();

      // Persist to backend
      try {
        await fetch(`/api/boards/${encodeURIComponent(boardId)}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'reply',
            id: commentId,
            reply: replyObj
          })
        });
        syncLocalAndCloudBoard();
      } catch (err) {
        console.warn('[CommentsEngine] Failed to save reply:', err);
      }
    }

    /**
     * Toggle resolve state
     */
    async function toggleResolve(commentId) {
      const pin = comments.find(c => c.id === commentId);
      if (!pin) return;

      pin.resolved = !pin.resolved;
      renderPins();
      renderExistingPopoverContent(pin);
      updatePopoverPosition();

      await persistComment(pin);
      showClientToast(pin.resolved ? 'Pin marked as resolved' : 'Feedback reopened');
    }

    /**
     * Delete comment
     */
    async function deleteComment(commentId) {
      if (!confirm('Are you sure you want to remove this feedback pin?')) return;

      comments = comments.filter(c => c.id !== commentId);
      closePopover();
      renderPins();

      try {
        await fetch(`/api/boards/${encodeURIComponent(boardId)}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'delete',
            commentId: commentId
          })
        });
        syncLocalAndCloudBoard();
        showClientToast('Pin removed');
      } catch (err) {
        console.warn('[CommentsEngine] Failed to delete comment:', err);
      }
    }

    /**
     * Close floating popover
     */
    function closePopover() {
      activePinId = null;
      if (popoverEl) popoverEl.style.display = 'none';
      document.querySelectorAll('.comment-pin').forEach(el => el.classList.remove('is-active'));
    }

    /**
     * Slide-over Comments Tray
     */
    function toggleTray(force) {
      isTrayOpen = force !== undefined ? force : !isTrayOpen;
      if (isTrayOpen) {
        renderTray();
        trayEl.classList.add('is-open');
      } else {
        trayEl.classList.remove('is-open');
      }
    }

    /**
     * Render Slide-over Comments Tray content
     */
    function renderTray() {
      if (!trayEl) return;

      const filtered = comments.filter(c => {
        if (currentFilter === 'open') return !c.resolved;
        if (currentFilter === 'resolved') return !!c.resolved;
        return true;
      });

      const openCount = comments.filter(c => !c.resolved).length;
      const resolvedCount = comments.filter(c => c.resolved).length;

      trayEl.innerHTML = `
        <div class="tray-header">
          <div class="tray-title-cluster">
            <div class="tray-title">Strategic Feedback</div>
            <div class="tray-count-pill">${openCount} Open • ${comments.length} Total</div>
          </div>
          <button class="tray-close-btn" onclick="CommentsEngine.toggleTray(false)" title="Close (Esc)">✕</button>
        </div>

        <div class="tray-actions-bar">
          <button type="button" class="btn-tray-drop-pin" onclick="CommentsEngine.togglePinDropMode(true)">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="10" r="3"/><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/></svg>
            <span>Drop New Pin</span>
          </button>
          
          <div class="tray-filter-tabs">
            <button class="filter-tab ${currentFilter === 'all' ? 'active' : ''}" onclick="CommentsEngine.setFilter('all')">All (${comments.length})</button>
            <button class="filter-tab ${currentFilter === 'open' ? 'active' : ''}" onclick="CommentsEngine.setFilter('open')">Open (${openCount})</button>
            <button class="filter-tab ${currentFilter === 'resolved' ? 'active' : ''}" onclick="CommentsEngine.setFilter('resolved')">Resolved (${resolvedCount})</button>
          </div>
        </div>

        <div class="tray-list">
          ${filtered.length === 0 ? `
            <div class="tray-empty-state">
              <div class="empty-icon-gold">📍</div>
              <div class="empty-title">No ${currentFilter === 'all' ? '' : currentFilter} feedback pins</div>
              <div class="empty-sub">Click "Drop Pin" above or anywhere on the blueprint to mark strategic observations.</div>
            </div>
          ` : filtered.map(c => `
            <div class="tray-item ${c.resolved ? 'is-resolved' : ''} ${c.id === activePinId ? 'is-selected' : ''}" onclick="CommentsEngine.jumpToPin('${c.id}')">
              <div class="tray-item-top">
                <span class="tray-pin-num">#${c.number}</span>
                ${c.type === 'approval'
                  ? `<span class="tray-badge-approval">✓ Pillar Approved</span>`
                  : `<span class="tray-badge-note">Strategic Note</span>`
                }
                <span class="tray-status ${c.resolved ? 'is-resolved' : 'is-open'}">${c.resolved ? 'Resolved' : 'Open'}</span>
              </div>
              <div class="tray-item-content">${escapeHtml(c.content)}</div>
              <div class="tray-item-bottom">
                <span class="tray-author-time">${escapeHtml(c.author)} • ${formatTimeAgo(c.createdAt)}</span>
                <span class="tray-jump-action">Jump to Pin ↗</span>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    function setFilter(filter) {
      currentFilter = filter;
      renderTray();
    }

    /**
     * Jump to Pin: Smoothly centers the canvas viewport on that pin and opens popover
     */
    function jumpToPin(pinId) {
      const pin = comments.find(c => c.id === pinId);
      if (!pin) return;

      // Close tray on smaller screens, keep accessible
      if (window.innerWidth < 800) {
        toggleTray(false);
      }

      const currentScale = (typeof CanvasEngine !== 'undefined' && CanvasEngine.scale !== undefined)
        ? CanvasEngine.scale
        : (window.CanvasEngine && window.CanvasEngine.getScale ? window.CanvasEngine.getScale() : 0.75);
      const targetScale = Math.max(currentScale, 0.85);

      const targetPanX = (window.innerWidth / 2) - (pin.x * targetScale);
      const targetPanY = (window.innerHeight / 2) - (pin.y * targetScale);

      if (window.CanvasEngine && window.CanvasEngine.smoothPanTo) {
        window.CanvasEngine.smoothPanTo(targetPanX, targetPanY, targetScale, 450);
      }

      setTimeout(() => {
        openPopover(pin, false);

        // Flash ripple on pin
        const pinEl = document.getElementById(`pin-el-${pin.id}`);
        if (pinEl) {
          pinEl.classList.add('pin-pulse');
          setTimeout(() => pinEl.classList.remove('pin-pulse'), 1200);
        }
      }, 300);
    }

    /**
     * Persist comment to API & Local storage
     */
    async function persistComment(commentObj) {
      try {
        // 1. POST /api/boards/:id/comments
        const res = await fetch(`/api/boards/${encodeURIComponent(boardId)}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(commentObj)
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.comments) {
            comments = data.comments;
            renderPins();
          }
        }
      } catch (err) {
        console.warn('[CommentsEngine] Network save failed, using local persistence:', err);
      }

      // 2. Sync to local board cache & Firebase
      syncLocalAndCloudBoard();
    }

    /**
     * Sync in-memory comments into local storage board representation and Firebase
     */
    function syncLocalAndCloudBoard() {
      try {
        const localKey = `polish_board_${boardId}`;
        const raw = localStorage.getItem(localKey);
        let boardObj = raw ? JSON.parse(raw) : null;
        if (boardObj) {
          boardObj.comments = comments;
          boardObj.updatedAt = new Date().toISOString();
          localStorage.setItem(localKey, JSON.stringify(boardObj));

          // Also push full board to Firebase if user is authenticated
          if (window.PolishFirebase && window.PolishFirebase.saveBoard && window.PolishFirebase.currentUser) {
            window.PolishFirebase.saveBoard(boardObj, window.PolishFirebase.currentUser).catch(() => {});
          }
        }
      } catch (_) {}
    }

    /**
     * Load comments from API or local storage
     */
    async function loadComments() {
      // 1. Instant check from localStorage
      try {
        const localKey = `polish_board_${boardId}`;
        const raw = localStorage.getItem(localKey);
        if (raw) {
          const b = JSON.parse(raw);
          if (Array.isArray(b.comments) && b.comments.length > 0) {
            comments = b.comments;
            renderPins();
          }
        }
      } catch (_) {}

      // 2. Fresh fetch from GET /api/boards/:id/comments
      try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 3500);
        const res = await fetch(`/api/boards/${encodeURIComponent(boardId)}/comments`, { signal: ctrl.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.comments)) {
            comments = data.comments;
            renderPins();
            syncLocalAndCloudBoard();
          }
        }
      } catch (err) {
        console.warn('[CommentsEngine] Could not load comments from API:', err.message);
      }
    }

    /**
     * Update subtle dock counter badge
     */
    function updateBadgeCounter() {
      if (!commentsCountBadgeEl) return;
      const count = comments.filter(c => !c.resolved).length;
      if (count > 0) {
        commentsCountBadgeEl.textContent = count;
        commentsCountBadgeEl.style.display = 'inline-flex';
      } else if (comments.length > 0) {
        commentsCountBadgeEl.textContent = '✓';
        commentsCountBadgeEl.style.display = 'inline-flex';
      } else {
        commentsCountBadgeEl.style.display = 'none';
      }
    }

    /**
     * Helpers
     */
    function getInitials(name) {
      if (!name) return 'CL';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    function formatTimeAgo(isoString) {
      if (!isoString) return 'Just now';
      const now = Date.now();
      const then = new Date(isoString).getTime();
      const diffSec = Math.floor((now - then) / 1000);
      if (diffSec < 60) return 'Just now';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays}d ago`;
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    function showClientToast(msg) {
      if (window.showToast) {
        window.showToast(msg);
      } else {
        const toast = document.getElementById('clientToast');
        if (!toast) return;
        toast.querySelector('span').textContent = msg;
        toast.classList.add('visible');
        setTimeout(() => toast.classList.remove('visible'), 2800);
      }
    }

    return {
      init,
      togglePinDropMode,
      toggleTray,
      openPopover,
      closePopover,
      saveDraftPin,
      cancelDraftPin,
      setDraftType,
      addReply,
      toggleResolve,
      deleteComment,
      jumpToPin,
      setFilter,
      getComments: () => comments,
      isPinDropModeActive: () => isPinDropMode
    };
  })();
})();
