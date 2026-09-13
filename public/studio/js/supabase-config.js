/**
 * POLISH Media Co — Supabase Auth & Cloud Data Engine
 * 
 * Provides ultra-lightweight (~35KB) Supabase Authentication (Google OAuth, Session Sync)
 * and durable PostgreSQL board persistence with backwards-compatibility aliases.
 */

(function () {
  'use strict';

  const PolishSupabase = {
    supabase: null,
    isReady: false,
    hasLiveSupabase: false,
    isAuthResolved: false,
    currentUser: null,
    session: null,
    authListeners: [],
    _initPromise: null,
    lastAuthError: null,

    // Parse auth callback parameters or errors from URL
    _parseUrlAuth() {
      if (typeof window === 'undefined') return { hasTokens: false, error: null };
      const hash = window.location.hash ? window.location.hash.substring(1) : '';
      const search = window.location.search ? window.location.search.substring(1) : '';
      const hashParams = new URLSearchParams(hash);
      const searchParams = new URLSearchParams(search);

      const errorMsg = hashParams.get('error_description') || searchParams.get('error_description') || hashParams.get('error') || searchParams.get('error');
      if (errorMsg) {
        return { hasTokens: false, error: decodeURIComponent(errorMsg.replace(/\+/g, ' ')) };
      }

      const hasTokens = hashParams.has('access_token') || hashParams.has('refresh_token') || searchParams.has('code');
      return { hasTokens, error: null };
    },

    // Initialize Supabase — robust, single-instance, OAuth callback aware
    async init() {
      if (this.isReady && this.hasLiveSupabase && this.isAuthResolved) return this;
      if (this._initPromise) return this._initPromise;

      this._initPromise = (async () => {
        // 1. Immediately hydrate currentUser synchronously from localStorage (0ms)
        const storedUser = localStorage.getItem('polish_studio_user');
        if (storedUser) {
          try {
            this.currentUser = JSON.parse(storedUser);
          } catch (_) {
            this.currentUser = null;
          }
        }

        const urlAuth = this._parseUrlAuth();
        if (urlAuth.error) {
          this.lastAuthError = urlAuth.error;
          console.warn('[PolishSupabase] Auth error from URL:', urlAuth.error);
        }

        // 2. Fetch public client configuration from Express backend
        try {
          const configRes = await fetch('/api/config/supabase');
          if (configRes.ok) {
            const config = await configRes.json();
            if (config.isConfigured && config.supabaseUrl && config.supabaseAnonKey) {
              if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
                if (!this.supabase) {
                  this.supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey, {
                    auth: {
                      persistSession: true,
                      autoRefreshToken: true,
                      detectSessionInUrl: true,
                      flowType: 'implicit'
                    }
                  });
                }
                this.hasLiveSupabase = true;

                // 3. If returning with OAuth tokens/code in URL, wait for session exchange
                if (urlAuth.hasTokens) {
                  await new Promise((resolve) => {
                    let resolved = false;
                    const timer = setTimeout(() => {
                      if (!resolved) {
                        resolved = true;
                        resolve();
                      }
                    }, 4000);

                    const { data: { subscription } } = this.supabase.auth.onAuthStateChange((event, session) => {
                      if (session && session.user) {
                        this.session = session;
                        this.currentUser = this._formatUser(session.user);
                        try {
                          localStorage.setItem('polish_studio_user', JSON.stringify(this.currentUser));
                          localStorage.setItem('polish_supabase_token', session.access_token);
                        } catch (_) {}
                      }
                      if (!resolved && (session || event === 'SIGNED_IN' || event === 'INITIAL_SESSION')) {
                        resolved = true;
                        clearTimeout(timer);
                        if (subscription && subscription.unsubscribe) subscription.unsubscribe();
                        resolve();
                      }
                    });
                  });
                } else {
                  // Check existing active session from storage
                  const { data: { session } } = await this.supabase.auth.getSession();
                  if (session && session.user) {
                    this.session = session;
                    this.currentUser = this._formatUser(session.user);
                    try {
                      localStorage.setItem('polish_studio_user', JSON.stringify(this.currentUser));
                      localStorage.setItem('polish_supabase_token', session.access_token);
                    } catch (_) {}
                  }
                }

                // Global listener for subsequent state changes (token refresh, manual sign-out)
                this.supabase.auth.onAuthStateChange((event, session) => {
                  this.session = session;
                  if (session && session.user) {
                    this.currentUser = this._formatUser(session.user);
                    try {
                      localStorage.setItem('polish_studio_user', JSON.stringify(this.currentUser));
                      localStorage.setItem('polish_supabase_token', session.access_token);
                    } catch (_) {}
                  } else if (event === 'SIGNED_OUT') {
                    if (!this.currentUser || !this.currentUser.isOffline) {
                      this.currentUser = null;
                      localStorage.removeItem('polish_studio_user');
                      localStorage.removeItem('polish_supabase_token');
                    }
                  }
                  PolishSupabase.isAuthResolved = true;
                  PolishSupabase._notifyAuthListeners(PolishSupabase.currentUser);
                });
              }
            }
          }
        } catch (err) {
          console.warn('[PolishSupabase] Live init error, running local fallback:', err.message);
        }

        this.isAuthResolved = true;
        this.isReady = true;
        this._notifyAuthListeners(this.currentUser);
        return this;
      })();

      return this._initPromise;
    },

    _formatUser(u) {
      if (!u) return null;
      return {
        uid: u.id,
        email: u.email || '',
        displayName: u.user_metadata?.full_name || u.user_metadata?.name || (u.email ? u.email.split('@')[0] : 'Advisor'),
        photoURL: u.user_metadata?.avatar_url || u.user_metadata?.picture || null
      };
    },

    _notifyAuthListeners(user) {
      const list = (this && Array.isArray(this.authListeners)) ? this.authListeners : (PolishSupabase && Array.isArray(PolishSupabase.authListeners) ? PolishSupabase.authListeners : []);
      list.forEach((fn) => {
        try {
          fn(user);
        } catch (e) {
          console.error('[PolishSupabase] Auth listener error:', e);
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

    // Retrieve active JWT access token for API requests
    async getIdToken() {
      if (this.session && this.session.access_token) {
        return this.session.access_token;
      }
      if (this.supabase && this.hasLiveSupabase) {
        try {
          const { data: { session } } = await this.supabase.auth.getSession();
          if (session && session.access_token) {
            this.session = session;
            return session.access_token;
          }
        } catch (_) {}
      }
      return localStorage.getItem('polish_supabase_token') || '';
    },

    // Return authorization headers map for API calls
    async getAuthHeaders(extra = {}) {
      const headers = { ...extra };
      const token = await this.getIdToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      return headers;
    },

    // Authentication: Google OAuth Sign-In
    async loginWithGoogle(options = {}) {
      if (!this.supabase) {
        await this.init();
      }

      if (this.supabase && this.hasLiveSupabase) {
        const redirectUrl = options.redirectTo || `${window.location.origin}/boards`;
        const { data, error } = await this.supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: redirectUrl,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account'
            }
          }
        });

        if (error) throw error;
        return data;
      }

      // Offline Dev Fallback
      return this.loginOffline('Executive Advisor');
    },

    // Instant Zero-Network Offline Guest Mode
    loginOffline(displayName = 'Executive Advisor') {
      const user = {
        uid: 'user_offline_' + Date.now().toString(36),
        displayName: displayName,
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
      if (this.supabase && this.hasLiveSupabase) {
        try {
          await this.supabase.auth.signOut();
        } catch (_) {}
      }
      this.currentUser = null;
      this.session = null;
      localStorage.removeItem('polish_studio_user');
      localStorage.removeItem('polish_supabase_token');
      this._notifyAuthListeners(null);
    },

    // Board Persistence: List Boards
    async listBoards(userId) {
      const localKey = `polish_boards_${userId || 'all'}`;
      let cachedBoards = [];
      try {
        const raw = localStorage.getItem(localKey);
        if (raw) cachedBoards = JSON.parse(raw);
      } catch (_) {}

      try {
        const token = await this.getIdToken();
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch('/api/boards', { headers });
        if (res.ok) {
          const data = await res.json();
          if (data && data.boards) {
            try {
              localStorage.setItem(localKey, JSON.stringify(data.boards));
            } catch (_) {}
            return data.boards;
          }
        }
      } catch (_) {}

      return cachedBoards;
    },

    // Board Persistence: Get Single Board
    async getBoard(boardId) {
      if (!boardId) return null;

      let cached = null;
      try {
        const raw = localStorage.getItem(`polish_board_${boardId}`);
        if (raw) cached = JSON.parse(raw);
      } catch (_) {}

      try {
        const token = await this.getIdToken();
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res = await fetch(`/api/boards/${encodeURIComponent(boardId)}`, { headers });
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

    // Board Persistence: Save Board
    async saveBoard(boardData, user) {
      if (!boardData || !boardData.id) throw new Error('Invalid board data');

      const now = new Date().toISOString();
      const payload = {
        ...boardData,
        ownerId: user ? user.uid : (boardData.ownerId || 'admin'),
        ownerEmail: user ? user.email : (boardData.ownerEmail || ''),
        updatedAt: now,
        isPublished: true
      };

      // 1. Instant optimistic local write
      try {
        localStorage.setItem(`polish_board_${boardData.id}`, JSON.stringify(payload));
      } catch (_) {}

      // 2. Background sync to Supabase-backed API
      const token = await this.getIdToken();
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/boards/${encodeURIComponent(boardData.id)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        console.warn('[PolishSupabase] Background board sync deferred.');
      }

      return payload;
    }
  };

  // Expose as global PolishSupabase and alias to PolishFirebase for 100% backwards compatibility
  window.PolishSupabase = PolishSupabase;
  window.PolishFirebase = PolishSupabase;

  // Trigger init immediately; safe due to _initPromise guard
  PolishSupabase.init();
})();
