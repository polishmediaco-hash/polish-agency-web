/**
 * POLISH Media Co. — Executive Presentation & Walkthrough Engine
 * Supports Bespoke Slug Routing (/p/:slug), Public Proposals API,
 * Confidential Portal Gating, YouTube Unlisted Embeds, Native MP4s,
 * Live Board Studio Iframe, and Interactive Chapter Sync.
 */

(function () {
  'use strict';

  // Default Fallback State
  const DEFAULTS = {
    client: 'Client Brand',
    name: '',
    board: 'polish-cosmetics-launch',
    title: 'Growth Strategy Walkthrough',
    video: '',
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
  let currentChapters = DEFAULTS.chapters;

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── 1. Route & Slug Extraction ──────────────────────────────────────────────
  function extractSlugFromPath() {
    const path = window.location.pathname.replace(/\/+$/, '');
    const pMatch = path.match(/^\/p\/([^/?#]+)/i);
    if (pMatch && pMatch[1]) return decodeURIComponent(pMatch[1]).trim().toLowerCase();
    const propMatch = path.match(/^\/proposal\/([^/?#]+)/i);
    if (propMatch && propMatch[1]) return decodeURIComponent(propMatch[1]).trim().toLowerCase();
    return null;
  }

  // Legacy URL Parameter Parser (Fallback)
  function getParams() {
    const params = new URLSearchParams(window.location.search);
    const client = (params.get('client') || params.get('brand') || DEFAULTS.client).trim();
    const name = (params.get('name') || DEFAULTS.name).trim();
    const board = (params.get('board') || params.get('boardId') || DEFAULTS.board).trim();
    const title = (params.get('title') || DEFAULTS.title).trim();
    const video = (params.get('video') || params.get('v') || DEFAULTS.video).trim();

    return { client, name, board, title, video };
  }

  // ── 2. Gate & View Management ───────────────────────────────────────────────
  function showGate(gateId) {
    const loadingGate = document.getElementById('presLoadingGate');
    const notFoundGate = document.getElementById('presNotFoundGate');
    const content = document.getElementById('presentationContent');

    if (loadingGate) loadingGate.style.display = (gateId === 'loading') ? 'flex' : 'none';
    if (notFoundGate) notFoundGate.style.display = (gateId === 'notfound') ? 'flex' : 'none';
    if (content) content.style.display = (gateId === 'content') ? 'block' : 'none';
  }

  // ── 3. DOM Hydration ─────────────────────────────────────────────────────────
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
    const bookUrl = `/book?brand=${encodeURIComponent(state.client)}&name=${encodeURIComponent(state.name || '')}`;
    bookButtons.forEach(btn => btn.setAttribute('href', bookUrl));

    // External Bridges: WhatsApp Founder Line (+213 662 41 77 61)
    const waButtons = document.querySelectorAll('.js-btn-wa');
    const waText = encodeURIComponent(
      `Hi Faycal, I just watched the strategy walkthrough for ${state.client}. Let's discuss deploying the blueprint.`
    );
    const waUrl = `https://wa.me/213662417761?text=${waText}`;
    waButtons.forEach(btn => btn.setAttribute('href', waUrl));

    // Deliverables rendering if custom deliverables present
    if (Array.isArray(state.deliverables) && state.deliverables.length) {
      renderDeliverables(state.deliverables);
    }
  }

  function renderDeliverables(deliverables) {
    const grid = document.getElementById('presHighlightsGrid');
    if (!grid || !Array.isArray(deliverables) || !deliverables.length) return;
    grid.innerHTML = deliverables.map((d, i) => `
      <div class="pres-card">
        <div class="pres-card-num">${escapeHtml(d.num || String(i + 1).padStart(2, '0'))}</div>
        <h3 class="pres-card-title">${escapeHtml(d.title || '')}</h3>
        <p class="pres-card-desc">${escapeHtml(d.desc || d.description || '')}</p>
      </div>
    `).join('');
  }

  // ── 4. Universal Video Parser & Mounting ────────────────────────────────────
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

    // Default to native URL
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
      const ytIframe = document.getElementById('ytIframePlayer');
      if (ytIframe) {
        ytIframe.addEventListener('load', () => container.classList.add('is-loaded'));
      }
      setTimeout(() => container.classList.add('is-loaded'), 1200);
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
        nativeVideoEl.addEventListener('loadeddata', () => container.classList.add('is-loaded'));
        nativeVideoEl.addEventListener('timeupdate', syncActiveChapterWithTime);
      }
      setTimeout(() => container.classList.add('is-loaded'), 1200);
    } else {
      // Placeholder / No Video Specified
      container.innerHTML = `
        <div class="pres-video-placeholder">
          <div class="pres-placeholder-play-circle">
            <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
          <h3 class="pres-placeholder-title">Strategy Walkthrough Recording</h3>
          <p class="pres-placeholder-desc">Interactive session recording is being prepared for this proposal.</p>
        </div>
      `;
      container.classList.add('is-loaded');
    }
  }

  // ── 5. YouTube API Integration (For Chapters Seeking & Sync) ────────────────
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

    const chapters = currentChapters;
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

  // ── 6. Chapter Navigation ───────────────────────────────────────────────────
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

    currentChapters = Array.isArray(chapters) && chapters.length ? chapters : DEFAULTS.chapters;
    bar.innerHTML = '';
    currentChapters.forEach((ch, idx) => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = `pres-chapter-pill ${idx === 0 ? 'is-active' : ''}`;
      if (idx === 0) pill.setAttribute('aria-current', 'true');
      pill.innerHTML = `
        <span class="pres-chapter-time">${escapeHtml(ch.time)}</span>
        <span>${escapeHtml(ch.title)}</span>
      `;
      pill.addEventListener('click', () => seekToTime(ch.seconds, pill));
      bar.appendChild(pill);
    });
  }

  // ── 7. Live Board Iframe Mounting ───────────────────────────────────────────
  function mountBoard(boardId) {
    const wrap = document.getElementById('boardIframeWrapper');
    if (!wrap) return;

    const boardUrl = `/studio/view.html?id=${encodeURIComponent(boardId)}`;
    let iframe = document.getElementById('boardIframe');
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'boardIframe';
      iframe.className = 'pres-board-iframe';
      iframe.title = 'POLISH Board Studio Whiteboard';
      iframe.allow = 'camera; microphone; display-capture; fullscreen';
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

  // ── 8. Initialize Engine ────────────────────────────────────────────────────
  async function init() {
    const slug = extractSlugFromPath();

    if (slug) {
      // 1. Bespoke Slug Mode (/p/:slug or /presentation/:slug)
      showGate('loading');
      try {
        const res = await fetch(`/api/presentations/${encodeURIComponent(slug)}`);
        if (!res.ok) {
          throw new Error(`Presentation not found: status ${res.status}`);
        }
        const data = await res.json();
        if (!data || !data.success || !data.presentation) {
          throw new Error('Invalid presentation payload');
        }

        const pres = data.presentation;
        const state = {
          client: pres.brandName || pres.brand || 'Client Brand',
          name: pres.contactName || pres.contact || '',
          title: pres.title || 'Growth Strategy Walkthrough',
          board: pres.boardId || pres.board || DEFAULTS.board,
          video: pres.video || '',
          chapters: (Array.isArray(pres.chapters) && pres.chapters.length) ? pres.chapters : DEFAULTS.chapters,
          deliverables: pres.deliverables || []
        };

        hydratePage(state);
        renderChapters(state.chapters);
        mountVideo(parseVideoSource(state.video));
        mountBoard(state.board);
        showGate('content');
      } catch (err) {
        console.warn('[POLISH Proposal] Failed to load proposal for slug:', slug, err);
        const slugDisplay = document.getElementById('notFoundSlugDisplay');
        if (slugDisplay) slugDisplay.textContent = `/p/${slug}`;
        const headerClientEl = document.getElementById('headerClientName');
        if (headerClientEl) headerClientEl.textContent = 'Briefing Unavailable';
        showGate('notfound');
      }
    } else {
      // 2. No slug in path: Check legacy query parameters
      const params = new URLSearchParams(window.location.search);
      const hasClientParam = params.has('client') || params.has('brand');
      const hasVideoParam = params.has('video') || params.has('v');

      if (hasClientParam || hasVideoParam) {
        // Backwards-compatible query parameter proposal
        const state = getParams();
        hydratePage(state);
        renderChapters(DEFAULTS.chapters);
        mountVideo(parseVideoSource(state.video));
        mountBoard(state.board);
        showGate('content');
      } else {
        // Bare access with no slug: redirect immediately to home
        window.location.replace('/');
        return;
      }
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

    const btnFullscreen = document.getElementById('btnToggleFullscreen');
    if (btnFullscreen) btnFullscreen.addEventListener('click', toggleBoardFullscreen);

    // Escape exits fullscreen or locks board
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (boardOverlay) boardOverlay.classList.remove('is-active');
        const stage = document.getElementById('boardStage');
        if (stage && stage.classList.contains('is-fullscreen')) {
          toggleBoardFullscreen();
        }
      }
    });
  }

  // Export engine methods for client triggers
  window.PresEngine = {
    init,
    toggleBoardFullscreen,
    seekToTime
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
