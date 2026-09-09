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

    // Initialize Firebase
    async init() {
      if (this.isReady && this.hasLiveFirebase && this.isAuthResolved) return;

      try {
        let config = null;
        try {
          const res = await fetch('/api/config/firebase');
          if (res.ok) {
            const data = await res.json();
            if (data && data.isConfigured && data.apiKey) {
              config = data;
            }
          }
        } catch (e) {
          console.warn('[PolishFirebase] Dynamic config fetch failed:', e.message);
        }

        // Project client configuration fallback for zero-downtime authentication
        if (!config || !config.apiKey) {
          config = {
            apiKey: 'AIzaSyAdtvlrJwmTGMe6JbMCSdEQCKC7eAle-TM',
            authDomain: 'polishmediacocom.firebaseapp.com',
            projectId: 'polishmediacocom',
            storageBucket: 'polishmediacocom.firebasestorage.app',
            messagingSenderId: '70668280388',
            appId: '1:70668280388:web:455f906c6fbca8ce701211',
            measurementId: 'G-7MGW2YG98L',
            isConfigured: true
          };
        }

        // Initialize Firebase with config
        if (config && typeof firebase !== 'undefined' && firebase.initializeApp) {
          if (!firebase.apps.length) {
            this.app = firebase.initializeApp(config);
          } else {
            this.app = firebase.app();
          }
          this.auth = typeof firebase.auth === 'function' ? firebase.auth() : null;
          this.db = typeof firebase.firestore === 'function' ? firebase.firestore() : null;
          this.hasLiveFirebase = !!this.auth;

          // Await initial auth state resolution so currentUser is known before init() completes
          await new Promise((resolve) => {
            let resolved = false;
            const timeout = setTimeout(() => {
              if (!resolved) {
                resolved = true;
                this.isAuthResolved = true;
                resolve();
              }
            }, 1200);

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
              } else {
                // If offline or disconnected, check if we have a valid cached user in localStorage before clearing
                const cachedUser = localStorage.getItem('polish_studio_user');
                if (cachedUser && !navigator.onLine) {
                  try {
                    this.currentUser = JSON.parse(cachedUser);
                  } catch (_) {
                    this.currentUser = null;
                  }
                } else if (!cachedUser) {
                  this.currentUser = null;
                }
              }

              this._notifyAuthListeners(this.currentUser);

              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                this.isAuthResolved = true;
                resolve();
              }
            });
          });

          // Non-blocking check for redirect result (from signInWithRedirect)
          if (this.auth.getRedirectResult) {
            this.auth.getRedirectResult().then((result) => {
              if (result && result.user) {
                console.log('[PolishFirebase] Redirect sign-in success:', result.user.email);
              }
            }).catch(() => {});
          }

          console.log('[PolishFirebase] Connected to project:', config.projectId, 'User:', this.currentUser ? this.currentUser.email : 'None');
        } else {
          // Fallback: Local Session & API Storage Adapter
          this._initLocalFallback();
          this.isAuthResolved = true;
        }

        this.isReady = true;
      } catch (err) {
        console.error('[PolishFirebase] Init error, falling back to local adapter:', err);
        this._initLocalFallback();
        this.isAuthResolved = true;
        this.isReady = true;
      }
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
        provider.setCustomParameters({ prompt: 'select_account' });

        try {
          const cred = await this.auth.signInWithPopup(provider);
          return cred.user;
        } catch (err) {
          console.warn('[PolishFirebase] Popup attempt returned:', err.code, err.message);
          if (err.code === 'auth/popup-blocked') {
            console.log('[PolishFirebase] Popup blocked, switching to signInWithRedirect for reliability...');
            await this.auth.signInWithRedirect(provider);
            return null;
          }
          throw err;
        }
      }

      throw new Error('Google Sign-In requires active Firebase credentials.');
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

    // Firestore Data: List Boards (User Isolated)
    async listBoards(userId) {
      if (!userId) return [];

      if (this.hasLiveFirebase && this.db) {
        try {
          const snapshot = await this.db
            .collection('boards')
            .where('ownerId', '==', userId)
            .get();

          const boards = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            boards.push({
              id: doc.id,
              ...data,
              elementCount: (data.elements || []).length,
              connectionCount: (data.connections || []).length
            });
          });

          // Sort in JS to avoid needing complex composite indexes
          boards.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
          return boards;
        } catch (err) {
          console.error('[PolishFirebase] Error querying Firestore boards:', err);
        }
      }

      // Fallback: Query backend API or localStorage
      try {
        const res = await fetch('/api/boards');
        if (res.ok) {
          const data = await res.json();
          if (data && data.boards) {
            // Filter by userId if present, otherwise show user's boards
            return data.boards.filter(b => !b.ownerId || b.ownerId === userId);
          }
        }
      } catch (e) {
        console.warn('[PolishFirebase] Fallback API failed:', e);
      }

      // LocalStorage fallback
      const localKey = `polish_boards_${userId}`;
      const cached = localStorage.getItem(localKey);
      return cached ? JSON.parse(cached) : [];
    },

    // Firestore Data: Get Single Board
    async getBoard(boardId) {
      if (!boardId) return null;

      if (this.hasLiveFirebase && this.db) {
        try {
          const doc = await this.db.collection('boards').doc(boardId).get();
          if (doc.exists) {
            return { id: doc.id, ...doc.data() };
          }
        } catch (err) {
          console.warn('[PolishFirebase] Firestore getBoard failed, trying API fallback:', err.message);
        }
      }

      // Fallback to API
      try {
        const res = await fetch(`/api/boards/${encodeURIComponent(boardId)}`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.board) return data.board;
        }
      } catch (e) {
        console.warn('[PolishFirebase] API getBoard failed:', e);
      }

      // Local fallback
      const cached = localStorage.getItem(`polish_board_${boardId}`);
      return cached ? JSON.parse(cached) : null;
    },

    // Firestore Data: Save / Update Board
    async saveBoard(boardData, user) {
      if (!boardData || !boardData.id) throw new Error('Invalid board data');

      const now = new Date().toISOString();
      const payload = {
        ...boardData,
        ownerId: user ? user.uid : (boardData.ownerId || 'anonymous'),
        ownerEmail: user ? user.email : (boardData.ownerEmail || ''),
        updatedAt: now,
        isPublished: true // Allows client presentation viewing
      };

      if (!payload.createdAt) payload.createdAt = now;

      if (this.hasLiveFirebase && this.db) {
        try {
          await this.db.collection('boards').doc(boardData.id).set(payload, { merge: true });
          console.log('[PolishFirebase] Board saved to Firestore:', boardData.id);
        } catch (err) {
          console.warn('[PolishFirebase] Firestore save failed, writing to backend API:', err);
        }
      }

      // Also persist to backend API for multi-channel reliability
      try {
        await fetch(`/api/boards/${encodeURIComponent(boardData.id)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (e) {
        console.warn('[PolishFirebase] API sync failed:', e);
      }

      // Cache locally
      localStorage.setItem(`polish_board_${boardData.id}`, JSON.stringify(payload));
      return payload;
    },

    // Firestore Data: Delete Board
    async deleteBoard(boardId) {
      if (!boardId) return false;

      if (this.hasLiveFirebase && this.db) {
        try {
          await this.db.collection('boards').doc(boardId).delete();
        } catch (err) {
          console.warn('[PolishFirebase] Firestore delete failed:', err);
        }
      }

      try {
        await fetch(`/api/boards/${encodeURIComponent(boardId)}`, { method: 'DELETE' });
      } catch (e) {}

      localStorage.removeItem(`polish_board_${boardId}`);
      return true;
    }
  };

  // Expose globally
  window.PolishFirebase = PolishFirebase;
})();
