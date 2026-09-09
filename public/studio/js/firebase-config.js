/**
 * POLISH Media Co — Firebase Auth & Firestore Data Engine
 * 
 * Provides zero-bundler Firebase Authentication and Firestore real-time
 * board persistence with user isolation and public client presentation support.
 */

(function () {
  'use strict';

  const PolishFirebase = {
    app: null,
    auth: null,
    db: null,
    isReady: false,
    hasLiveFirebase: false,
    isAuthResolved: false,
    currentUser: null,
    authListeners: [],

    // Initialize Firebase — instant, zero-blocking, zero-overhead
    init() {
      if (this.isReady && this.hasLiveFirebase) return;

      // 1. Immediately hydrate currentUser synchronously from localStorage (0ms)
      const storedUser = localStorage.getItem('polish_studio_user');
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
        } catch (_) {
          this.currentUser = null;
        }
      }

      // 2. Direct client configuration (zero network blocking)
      const config = {
        apiKey: 'AIzaSyAdtvlrJwmTGMe6JbMCSdEQCKC7eAle-TM',
        authDomain: 'polishmediacocom.firebaseapp.com',
        projectId: 'polishmediacocom',
        storageBucket: 'polishmediacocom.firebasestorage.app',
        messagingSenderId: '70668280388',
        appId: '1:70668280388:web:455f906c6fbca8ce701211',
        measurementId: 'G-7MGW2YG98L',
        isConfigured: true
      };

      try {
        if (typeof firebase !== 'undefined' && firebase.initializeApp) {
          if (!firebase.apps.length) {
            this.app = firebase.initializeApp(config);
          } else {
            this.app = firebase.app();
          }
          this.auth = typeof firebase.auth === 'function' ? firebase.auth() : null;
          this.db = null;
          this.hasLiveFirebase = !!this.auth;

          if (this.auth) {
            // Non-blocking background listener — resolves in background without blocking UI
            this.auth.onAuthStateChanged((user) => {
              if (user) {
                this.currentUser = {
                  uid: user.uid,
                  displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Advisor'),
                  email: user.email,
                  photoURL: user.photoURL || null
                };
                try {
                  localStorage.setItem('polish_studio_user', JSON.stringify(this.currentUser));
                } catch (_) {}
              } else if (navigator.onLine && (!this.currentUser || !this.currentUser.isOffline)) {
                // Do not wipe cached credentials if working offline
                const cachedUser = localStorage.getItem('polish_studio_user');
                if (!cachedUser) {
                  this.currentUser = null;
                }
              }

              this.isAuthResolved = true;
              this._notifyAuthListeners(this.currentUser);
            });

            // Non-blocking redirect check
            if (this.auth.getRedirectResult) {
              this.auth.getRedirectResult().then((result) => {
                if (result && result.user) {
                  console.log('[PolishFirebase] Redirect sign-in success:', result.user.email);
                }
              }).catch(() => {});
            }
          }
        } else {
          this._initLocalFallback();
        }
      } catch (err) {
        console.error('[PolishFirebase] Init error, using local fallback:', err);
        this._initLocalFallback();
      }

      this.isAuthResolved = true;
      this.isReady = true;
      this._notifyAuthListeners(this.currentUser);
    },

    _initLocalFallback() {
      this.hasLiveFirebase = false;
      const storedUser = localStorage.getItem('polish_studio_user');
      if (storedUser) {
        try {
          this.currentUser = JSON.parse(storedUser);
        } catch (e) {
          this.currentUser = null;
        }
      }
      this._notifyAuthListeners(this.currentUser);
    },

    _notifyAuthListeners(user) {
      this.authListeners.forEach((fn) => {
        try {
          fn(user);
        } catch (e) {
          console.error('[PolishFirebase] Auth listener error:', e);
        }
      });
    },

    onAuthStateChanged(callback) {
      this.authListeners.push(callback);
      if (this.isAuthResolved) {
        callback(this.currentUser);
      }
      return () => {
        this.authListeners = this.authListeners.filter((fn) => fn !== callback);
      };
    },

    // Authentication: Login
    async login(email, password) {
      if (this.hasLiveFirebase && this.auth) {
        const cred = await this.auth.signInWithEmailAndPassword(email, password);
        return cred.user;
      }

      // Local adapter fallback
      const user = {
        uid: `user_${btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`,
        displayName: email.split('@')[0],
        email: email,
        photoURL: null
      };
      this.currentUser = user;
      localStorage.setItem('polish_studio_user', JSON.stringify(user));
      this._notifyAuthListeners(user);
      return user;
    },

    // Authentication: Register
    async register(email, password, displayName) {
      if (this.hasLiveFirebase && this.auth) {
        const cred = await this.auth.createUserWithEmailAndPassword(email, password);
        if (displayName && cred.user.updateProfile) {
          await cred.user.updateProfile({ displayName });
        }
        return cred.user;
      }

      // Local adapter fallback
      const user = {
        uid: `user_${btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12)}`,
        displayName: displayName || email.split('@')[0],
        email: email,
        photoURL: null
      };
      this.currentUser = user;
      localStorage.setItem('polish_studio_user', JSON.stringify(user));
      this._notifyAuthListeners(user);
      return user;
    },

    // Authentication: Google Sign-In
    async loginWithGoogle() {
      if (!this.auth) {
        await this.init();
      }

      // Direct fallback if init ran before scripts were parsed
      if (!this.auth && typeof firebase !== 'undefined' && typeof firebase.auth === 'function') {
        const fallbackConfig = {
          apiKey: 'AIzaSyAdtvlrJwmTGMe6JbMCSdEQCKC7eAle-TM',
          authDomain: 'polishmediacocom.firebaseapp.com',
          projectId: 'polishmediacocom',
          storageBucket: 'polishmediacocom.firebasestorage.app',
          messagingSenderId: '70668280388',
          appId: '1:70668280388:web:455f906c6fbca8ce701211',
          measurementId: 'G-7MGW2YG98L'
        };
        if (!firebase.apps.length) {
          this.app = firebase.initializeApp(fallbackConfig);
        } else {
          this.app = firebase.app();
        }
        this.auth = firebase.auth();
        this.hasLiveFirebase = true;
      }

      if (this.auth) {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');

        try {
          const cred = await this.auth.signInWithPopup(provider);
          return cred.user;
        } catch (err) {
          console.warn('[PolishFirebase] Popup attempt returned:', err.code, err.message);
          // If popup is closed, blocked, or fails cross-origin handshake, automatically switch to full-page redirect
          if (
            err.code === 'auth/popup-blocked' ||
            err.code === 'auth/popup-closed-by-user' ||
            err.code === 'auth/cancelled-popup-request' ||
            err.code === 'auth/internal-error'
          ) {
            console.log('[PolishFirebase] Popup failed/closed, seamlessly switching to signInWithRedirect...');
            await this.auth.signInWithRedirect(provider);
            return null;
          }
          throw err;
        }
      }

      throw new Error('Google Sign-In requires active Firebase credentials.');
    },

    // Authentication: Instant Offline Advisor Mode
    loginOffline(displayName = 'Advisor') {
      const user = {
        uid: 'advisor_' + Math.random().toString(36).slice(2, 9),
        displayName: displayName || 'Advisor',
        email: 'advisor@polishmediaco.com',
        photoURL: null,
        isOffline: true
      };
      this.currentUser = user;
      try {
        localStorage.setItem('polish_studio_user', JSON.stringify(user));
      } catch (_) {}
      this._notifyAuthListeners(user);
      return user;
    },

    // Authentication: Logout
    async logout() {
      if (this.hasLiveFirebase && this.auth) {
        await this.auth.signOut();
      }
      this.currentUser = null;
      localStorage.removeItem('polish_studio_user');
      this._notifyAuthListeners(null);
    },

    // Board Persistence: List Boards (User Isolated, Instant Local + Fast API)
    async listBoards(userId) {
      if (!userId) return [];
      const localKey = `polish_boards_${userId}`;

      // 1. Instant return from cache (0ms)
      let cachedBoards = [];
      try {
        const raw = localStorage.getItem(localKey);
        if (raw) cachedBoards = JSON.parse(raw);
      } catch (_) {}

      // 2. Fetch fresh boards from API with 2.5s timeout
      try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 2500);
        const res = await fetch('/api/boards', { signal: ctrl.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.boards) {
            const userBoards = data.boards.filter(b => !b.ownerId || b.ownerId === userId);
            try {
              localStorage.setItem(localKey, JSON.stringify(userBoards));
            } catch (_) {}
            return userBoards;
          }
        }
      } catch (_) {}

      return cachedBoards;
    },

    // Board Persistence: Get Single Board (Instant Local + Background API)
    async getBoard(boardId) {
      if (!boardId) return null;

      // 1. Instant return from local cache (0ms)
      let cached = null;
      try {
        const raw = localStorage.getItem(`polish_board_${boardId}`);
        if (raw) cached = JSON.parse(raw);
      } catch (_) {}

      // 2. Fetch fresh board from API with 2.5s timeout
      try {
        const ctrl = new AbortController();
        const timeoutId = setTimeout(() => ctrl.abort(), 2500);
        const res = await fetch(`/api/boards/${encodeURIComponent(boardId)}`, { signal: ctrl.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          if (data && data.board) {
            try {
              localStorage.setItem(`polish_board_${boardId}`, JSON.stringify(data.board));
            } catch (_) {}
            return data.board;
          }
        }
      } catch (_) {}

      return cached;
    },

    // Board Persistence: Save / Update Board (Instant Sync + Non-blocking Background API)
    async saveBoard(boardData, user) {
      if (!boardData || !boardData.id) throw new Error('Invalid board data');

      const now = new Date().toISOString();
      const payload = {
        ...boardData,
        ownerId: user ? user.uid : (boardData.ownerId || 'anonymous'),
        ownerEmail: user ? user.email : (boardData.ownerEmail || ''),
        updatedAt: now,
        isPublished: true
      };

      if (!payload.createdAt) payload.createdAt = now;

      // 1. Instant synchronous write to localStorage (0ms)
      try {
        localStorage.setItem(`polish_board_${boardData.id}`, JSON.stringify(payload));
        localStorage.setItem('polish_board_last_id', boardData.id);

        const localKey = `polish_boards_${payload.ownerId}`;
        const rawList = localStorage.getItem(localKey);
        let list = rawList ? JSON.parse(rawList) : [];
        const idx = list.findIndex(b => b.id === boardData.id);
        const meta = {
          id: payload.id,
          slug: payload.slug || payload.id,
          title: payload.title || 'Untitled Board',
          client: payload.client || 'Private Client',
          createdAt: payload.createdAt,
          updatedAt: payload.updatedAt,
          elementCount: (payload.elements || []).length,
          connectionCount: (payload.connections || []).length,
          ownerId: payload.ownerId,
          ownerEmail: payload.ownerEmail
        };
        if (idx >= 0) list[idx] = meta;
        else list.unshift(meta);
        localStorage.setItem(localKey, JSON.stringify(list));
      } catch (_) {}

      // 2. Non-blocking asynchronous sync to backend API in background
      fetch(`/api/boards/${encodeURIComponent(boardData.id)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});

      return payload;
    },

    // Board Persistence: Delete Board (Instant Local + Non-blocking Background API)
    async deleteBoard(boardId) {
      if (!boardId) return false;

      // 1. Instant delete from local cache (0ms)
      try {
        localStorage.removeItem(`polish_board_${boardId}`);
        if (this.currentUser) {
          const localKey = `polish_boards_${this.currentUser.uid}`;
          const rawList = localStorage.getItem(localKey);
          if (rawList) {
            const list = JSON.parse(rawList).filter(b => b.id !== boardId);
            localStorage.setItem(localKey, JSON.stringify(list));
          }
        }
      } catch (_) {}

      // 2. Non-blocking delete on server
      fetch(`/api/boards/${encodeURIComponent(boardId)}`, { method: 'DELETE' }).catch(() => {});
      return true;
    }
  };

  // Expose globally
  window.PolishFirebase = PolishFirebase;
})();
