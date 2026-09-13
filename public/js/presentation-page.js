/**
 * POLISH Media Co. — Executive Presentation & Walkthrough Engine
 * Supports YouTube Unlisted Embeds, Native MP4s, Live Board Studio Iframe,
 * Dynamic URL Parameter Customization, and Chapter Navigation.
 */

(function () {
  'use strict';

  // Default Fallback State
  const DEFAULTS = {
    client: 'Celestia Cosmetics',
    name: 'Yasmine',
    board: 'polish-cosmetics-launch',
    title: 'Growth Strategy',
    // Default video recording ID (Unlisted YouTube ID or MP4)
    video: '', // Safe clean default; provided via ?video=
    chapters: [
      { time: '00:00', seconds: 0, title: '01 • Diagnostic & Market Positioning' },
      { time: '03:15', seconds: 195, title: '02 • Revenue Velocity & CAC Compression' },
      { time: '06:40', seconds: 400, title: '03 • Creative & UGC Performance Matrix' },
      { time: '09:50', seconds: 590, title: '04 • 90-Day Roadmap & Retainer Scope' }
    ]
  };

  let activePlayerType = null;
  let ytPlayer = null;
  let nativeVideoEl = null;
  let playbackPollTimer = null;

  // ── 1. URL Parameter Parser ──────────────────────────────────────────────────
  function getParams() {
    const params = new URLSearchParams(window.location.search);
    const client = (params.get('client') || params.get('brand') || DEFAULTS.client).trim();
    const name = (params.get('name') || DEFAULTS.name).trim();
    const board = (params.get('board') || params.get('boardId') || DEFAULTS.board).trim();
    const title = (params.get('title') || DEFAULTS.title).trim();
    const video = (params.get('video') || params.get('v') || DEFAULTS.video).trim();

    return { client, name, board, title, video };
  }

  // ── 2. DOM Hydration ─────────────────────────────────────────────────────────
  function hydratePage(state) {
    // Document Title
    document.title = `POLISH Media Co. × ${state.client} — Strategy Walkthrough`;

    // Header Lockup
    const headerClientEl = document.getElementById('headerClientName');
    if (headerClientEl) headerClientEl.textContent = state.client;

    // Hero Section
    const heroClientEl = document.getElementById('heroClientName');
    if (heroClientEl) heroClientEl.textContent = state.client;

    const heroTitleEl = document.getElementById('heroPresentationTitle');
    if (heroTitleEl) {
      heroTitleEl.textContent = state.title || 'Growth strategy walkthrough and interactive whiteboard.';
    }

    // Board Header Title
    const boardTitleEl = document.getElementById('boardHeaderTitle');
    if (boardTitleEl) boardTitleEl.textContent = `${state.client} • Strategy Board`;

    // Signoff Section
    const signoffClientEl = document.getElementById('signoffClientName');
    if (signoffClientEl) signoffClientEl.textContent = state.client;

    // External Bridges: Calendly / Book
    const bookButtons = document.querySelectorAll('.js-btn-book');
    const bookUrl = `/book?brand=${encodeURIComponent(state.client)}&name=${encodeURIComponent(state.name)}`;
    bookButtons.forEach(btn => btn.setAttribute('href', bookUrl));

    // External Bridges: WhatsApp Founder Line (+213 662 41 77 61)
    const waButtons = document.querySelectorAll('.js-btn-wa');
    const waText = encodeURIComponent(
      `Hi Faycal, I just watched the strategy walkthrough for ${state.client}. Let's discuss deploying the blueprint.`
    );
    const waUrl = `https://wa.me/213662417761?text=${waText}`;
    waButtons.forEach(btn => btn.setAttribute('href', waUrl));

    // Board Studio Direct Link
    const studioLinkEl = document.getElementById('btnOpenStudio');
    if (studioLinkEl) {
      studioLinkEl.setAttribute('href', `https://app.polishmediaco.com/view/${encodeURIComponent(state.board)}`);
    }

    // Populate Modal Inputs
    const inputClient = document.getElementById('modalInputClient');
    if (inputClient) inputClient.value = state.client;
    const inputTitle = document.getElementById('modalInputTitle');
    if (inputTitle) inputTitle.value = state.title;
    const inputBoard = document.getElementById('modalInputBoard');
    if (inputBoard) inputBoard.value = state.board;
    const inputVideo = document.getElementById('modalInputVideo');
    if (inputVideo) inputVideo.value = state.video;
  }

  // ── 3. Universal Video Parser & Mounting ────────────────────────────────────
  function parseVideoSource(rawVideo) {
    if (!rawVideo) return { type: 'placeholder' };

    const clean = rawVideo.trim();

    // 1. YouTube detection (URL formats or bare 11-char ID)
    const ytMatch = clean.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return { type: 'youtube', id: ytMatch[1] };
    }
    if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) {
      return { type: 'youtube', id: clean };
    }

    // 2. Vimeo detection
    const vimeoMatch = clean.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
    if (vimeoMatch && vimeoMatch[1]) {
      return { type: 'vimeo', id: vimeoMatch[1] };
    }

    // 3. Native MP4 / WebM video file
    if (clean.endsWith('.mp4') || clean.endsWith('.webm') || clean.endsWith('.mov') || clean.includes('/assets/recordings/')) {
      return { type: 'native', url: clean };
    }

    // Default to native URL or YouTube fallback
    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('/')) {
      return { type: 'native', url: clean };
    }

    return { type: 'placeholder' };
  }

  function mountVideo(videoSource) {
    const container = document.getElementById('videoWrapper');
    if (!container) return;

    activePlayerType = videoSource.type;

    if (videoSource.type === 'youtube') {
      container.innerHTML = `
        <div id="ytPlayerContainer" style="width:100%;height:100%;">
          <iframe 
            id="ytIframePlayer"
            class="pres-video-frame"
            src="https://www.youtube-nocookie.com/embed/${videoSource.id}?autoplay=0&rel=0&modestbranding=1&enablejsapi=1&playsinline=1"
            title="POLISH Media Co. Strategy Walkthrough"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>
      `;
      initYouTubeApi();
    } else if (videoSource.type === 'native') {
      container.innerHTML = `
        <video 
          id="presNativeVideo"
          class="pres-native-video" 
          controls 
          playsinline 
          preload="metadata">
          <source src="${videoSource.url}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
      nativeVideoEl = document.getElementById('presNativeVideo');
      if (nativeVideoEl) {
        nativeVideoEl.addEventListener('timeupdate', syncActiveChapterWithTime);
      }
    } else {
      // Placeholder / No Video Specified
      container.innerHTML = `
        <div class="pres-video-placeholder">
          <div class="pres-placeholder-play-circle" onclick="window.PresEngine.openConfigModal()">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <h3 class="pres-placeholder-title">No Video Recording Linked</h3>
          <p class="pres-placeholder-desc">Click here or append <code>?video=YOUR_YOUTUBE_ID</code> to attach your strategy walkthrough.</p>
        </div>
      `;
    }
  }

  // ── 4. YouTube API Integration (For Chapters Seeking & Sync) ────────────────
  function startProgressSync() {
    if (playbackPollTimer) clearInterval(playbackPollTimer);
    playbackPollTimer = setInterval(syncActiveChapterWithTime, 500);
  }

  function stopProgressSync() {
    if (playbackPollTimer) {
      clearInterval(playbackPollTimer);
      playbackPollTimer = null;
    }
  }

  function syncActiveChapterWithTime() {
    let currentTime = 0;
    if (activePlayerType === 'youtube' && ytPlayer && typeof ytPlayer.getCurrentTime === 'function') {
      try {
        currentTime = ytPlayer.getCurrentTime();
      } catch (_) { return; }
    } else if (activePlayerType === 'native' && nativeVideoEl) {
      currentTime = nativeVideoEl.currentTime;
    } else {
      return;
    }

    const chapters = DEFAULTS.chapters;
    let activeIndex = 0;
    for (let i = 0; i < chapters.length; i++) {
      if (currentTime >= chapters[i].seconds) {
        activeIndex = i;
      } else {
        break;
      }
    }

    const pills = document.querySelectorAll('.pres-chapter-pill');
    pills.forEach((p, idx) => {
      if (idx === activeIndex) {
        p.classList.add('is-active');
        p.setAttribute('aria-current', 'true');
      } else {
        p.classList.remove('is-active');
        p.removeAttribute('aria-current');
      }
    });
  }

  function initYouTubeApi() {
    if (window.YT && window.YT.Player) {
      onYouTubeIframeAPIReady();
      return;
    }
    if (!document.getElementById('youtube-iframe-api-script')) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }

  window.onYouTubeIframeAPIReady = function () {
    const iframe = document.getElementById('ytIframePlayer');
    if (iframe) {
      try {
        ytPlayer = new window.YT.Player('ytIframePlayer', {
          events: {
            'onReady': () => console.log('[POLISH Video] YouTube Player API Ready'),
            'onStateChange': (e) => {
              if (window.YT && e.data === window.YT.PlayerState.PLAYING) {
                startProgressSync();
              } else if (window.YT && (e.data === window.YT.PlayerState.PAUSED || e.data === window.YT.PlayerState.ENDED)) {
                stopProgressSync();
              }
            }
          }
        });
      } catch (err) {
        console.warn('[POLISH Video] YouTube Player init warning:', err);
      }
    }
  };

  // ── 5. Chapter Navigation ───────────────────────────────────────────────────
  function seekToTime(seconds, pillElement) {
    if (activePlayerType === 'youtube') {
      if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
        ytPlayer.seekTo(seconds, true);
        ytPlayer.playVideo();
      } else {
        // Fallback: postMessage to iframe
        const iframe = document.getElementById('ytIframePlayer');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'seekTo',
            args: [seconds, true]
          }), '*');
        }
      }
    } else if (activePlayerType === 'native' && nativeVideoEl) {
      nativeVideoEl.currentTime = seconds;
      nativeVideoEl.play();
    }

    // Highlight active chapter pill
    document.querySelectorAll('.pres-chapter-pill').forEach(pill => {
      pill.classList.remove('is-active');
      pill.removeAttribute('aria-current');
    });
    if (pillElement) {
      pillElement.classList.add('is-active');
      pillElement.setAttribute('aria-current', 'true');
    }
  }

  function renderChapters(chapters) {
    const bar = document.getElementById('chaptersBar');
    if (!bar) return;

    bar.innerHTML = '';
    chapters.forEach((ch, idx) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `pres-chapter-pill ${idx === 0 ? 'is-active' : ''}`;
      if (idx === 0) pill.setAttribute('aria-current', 'true');
      pill.innerHTML = `
        <span class="pres-chapter-time">${ch.time}</span>
        <span>${ch.title}</span>
      `;
      pill.addEventListener('click', () => seekToTime(ch.seconds, pill));
      bar.appendChild(pill);
    });
  }

  // ── 6. Live Board Iframe Mounting ───────────────────────────────────────────
  function mountBoard(boardId) {
    const wrap = document.getElementById('boardIframeWrapper');
    if (!wrap) return;

    // Use local client viewer /studio/view.html?id=...
    const boardUrl = `/studio/view.html?id=${encodeURIComponent(boardId)}`;
    let iframe = document.getElementById('boardIframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'boardIframe';
      iframe.className = 'pres-board-iframe';
      iframe.title = 'POLISH Board Studio Whiteboard';
      iframe.allow = 'fullscreen';
      wrap.appendChild(iframe);
    }
    iframe.src = boardUrl;
  }

  function toggleBoardFullscreen() {
    const stage = document.getElementById('boardStage');
    const btn = document.getElementById('btnToggleFullscreen');
    if (!stage) return;

    const isFull = stage.classList.toggle('is-fullscreen');
    if (btn) {
      btn.innerHTML = isFull 
        ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> Exit Full Screen`
        : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg> Full Screen Board`;
    }
  }

  // ── 7. Link Copier & Modal Drawer ───────────────────────────────────────────
  function showToast(message) {
    let toast = document.getElementById('presToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'presToast';
      toast.className = 'pres-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('is-visible');
    setTimeout(() => toast.classList.remove('is-visible'), 3200);
  }

  function copyClientShareLink() {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(() => {
        showToast('✓ Confidential Client Link Copied to Clipboard');
      }).catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  }

  function fallbackCopy(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      showToast('✓ Client Link Copied to Clipboard');
    } catch (_) {
      prompt('Copy Client Presentation Link:', text);
    }
    document.body.removeChild(textArea);
  }

  function openConfigModal() {
    const modal = document.getElementById('configModal');
    if (modal) modal.classList.add('is-open');
  }

  function closeConfigModal() {
    const modal = document.getElementById('configModal');
    if (modal) modal.classList.remove('is-open');
  }

  function saveConfigModal() {
    const client = (document.getElementById('modalInputClient')?.value || DEFAULTS.client).trim();
    const title = (document.getElementById('modalInputTitle')?.value || DEFAULTS.title).trim();
    const board = (document.getElementById('modalInputBoard')?.value || DEFAULTS.board).trim();
    const video = (document.getElementById('modalInputVideo')?.value || '').trim();

    const newUrl = new URL(window.location.origin + window.location.pathname);
    newUrl.searchParams.set('client', client);
    newUrl.searchParams.set('title', title);
    newUrl.searchParams.set('board', board);
    if (video) newUrl.searchParams.set('video', video);

    // Update browser history and re-hydrate
    window.history.pushState({}, '', newUrl.toString());
    closeConfigModal();

    const state = { client, name: 'Founder', board, title, video };
    hydratePage(state);
    mountVideo(parseVideoSource(video));
    mountBoard(board);
    showToast('✓ Presentation Updated & Custom Link Created');
  }

  // ── 8. Initialize Engine ────────────────────────────────────────────────────
  function init() {
    const state = getParams();
    hydratePage(state);
    renderChapters(DEFAULTS.chapters);
    mountVideo(parseVideoSource(state.video));
    mountBoard(state.board);

    // Admin Access Gating for Link Customization Tool
    const urlParams = new URLSearchParams(window.location.search);
    const isAdmin = urlParams.get('admin') === '1' || urlParams.get('edit') === '1';
    const btnConfig = document.getElementById('btnOpenConfig');
    if (btnConfig) {
      btnConfig.style.display = isAdmin ? 'inline-flex' : 'none';
    }

    // Board Interactive Overlay Barrier (Prevents Scroll Hijacking)
    const boardOverlay = document.getElementById('boardOverlay');
    const btnActivateBoard = document.getElementById('btnActivateBoard');
    if (btnActivateBoard && boardOverlay) {
      btnActivateBoard.addEventListener('click', (e) => {
        e.stopPropagation();
        boardOverlay.classList.add('is-active');
      });
      boardOverlay.addEventListener('click', () => {
        boardOverlay.classList.add('is-active');
      });
    }

    // Clicking outside the board re-locks pointer events
    document.addEventListener('click', (e) => {
      const stage = document.getElementById('boardStage');
      if (stage && !stage.contains(e.target) && boardOverlay) {
        boardOverlay.classList.remove('is-active');
      }
    });

    // Event Bindings
    const btnCopyLink = document.getElementById('btnCopyShareLink');
    if (btnCopyLink) btnCopyLink.addEventListener('click', copyClientShareLink);

    if (btnConfig) btnConfig.addEventListener('click', openConfigModal);

    const btnCloseModal = document.getElementById('btnCloseModal');
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeConfigModal);

    const btnSaveModal = document.getElementById('btnSaveModal');
    if (btnSaveModal) btnSaveModal.addEventListener('click', saveConfigModal);

    const configModal = document.getElementById('configModal');
    if (configModal) {
      configModal.addEventListener('click', (e) => {
        if (e.target === configModal) closeConfigModal();
      });
    }

    const btnFullscreen = document.getElementById('btnToggleFullscreen');
    if (btnFullscreen) btnFullscreen.addEventListener('click', toggleBoardFullscreen);

    // Escape closes modal, fullscreen, or locks board
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeConfigModal();
        if (boardOverlay) boardOverlay.classList.remove('is-active');
        const stage = document.getElementById('boardStage');
        if (stage && stage.classList.contains('is-fullscreen')) {
          toggleBoardFullscreen();
        }
      }
    });
  }

  // Export engine methods for inline triggers
  window.PresEngine = {
    init,
    openConfigModal,
    closeConfigModal,
    saveConfigModal,
    copyClientShareLink,
    toggleBoardFullscreen,
    seekToTime
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
