// Minimal X (Twitter) OAuth 2.0 PKCE helper for browser-only apps
(function () {
    const STORAGE_KEY = 'x-auth';
    const STATE_KEY = 'x-auth-state';
    const VERIFIER_KEY = 'x-auth-code-verifier';

    function getConfig() {
        const cfg = (window.APP_CONFIG && window.APP_CONFIG.twitterAuth) || {};
        const clientId = (cfg.clientId || '').trim();
        const redirectUri = (cfg.redirectUri || '').trim();
        const scopes = Array.isArray(cfg.scopes) && cfg.scopes.length ? cfg.scopes : ['tweet.read', 'users.read', 'tweet.write', 'offline.access'];
        const tokenProxyUrl = (cfg.tokenProxyUrl || '').trim();
        // Derive API proxy base from tokenProxyUrl (strip trailing /token)
        let apiProxyBase = '';
        if (tokenProxyUrl) {
            try {
                const u = new URL(tokenProxyUrl);
                u.pathname = u.pathname.replace(/\/?token$/i, '');
                apiProxyBase = u.toString().replace(/\/$/, '');
            } catch (_) {}
        }
        return { clientId, redirectUri, scopes, tokenProxyUrl, apiProxyBase };
    }

    function isConfigured() {
        const { clientId, redirectUri } = getConfig();
        return Boolean(clientId && redirectUri);
    }

    function loadAuth() {
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch (e) {
            return null;
        }
    }

    function saveAuth(data) {
        if (!data) return;
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function clearAuth() {
        window.localStorage.removeItem(STORAGE_KEY);
        window.localStorage.removeItem(STATE_KEY);
        window.localStorage.removeItem(VERIFIER_KEY);
    }

    function now() { return Math.floor(Date.now() / 1000); }

    function isExpired(auth) {
        if (!auth || !auth.expires_at) return true;
        // Refresh 60s earlier to be safe
        return now() > (auth.expires_at - 60);
    }

    async function ensureAccessToken() {
        const cfg = getConfig();
        if (!isConfigured()) return null;
        let auth = loadAuth();
        if (auth && !isExpired(auth)) return auth.access_token;
        if (auth && auth.refresh_token) {
            try {
                const token = await refreshToken(auth.refresh_token, cfg);
                auth = normalizeToken(token);
                saveAuth(auth);
                return auth.access_token;
            } catch (e) {
                clearAuth();
                return null;
            }
        }
        return null;
    }

    async function refreshToken(refreshTokenValue, cfg) {
        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshTokenValue,
            client_id: cfg.clientId,
        });
        const tokenUrl = cfg.tokenProxyUrl || 'https://api.twitter.com/2/oauth2/token';
        const res = await fetch(tokenUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: body.toString(),
        });
        if (!res.ok) throw new Error('token refresh failed');
        return res.json();
    }

    function normalizeToken(token) {
        const expires_at = token.expires_in ? now() + Number(token.expires_in) : (now() + 3600);
        return { ...token, expires_at };
    }

    async function fetchProfile(accessToken) {
        const cfg = getConfig();
        const base = cfg.apiProxyBase;
        const url = (base ? `${base}/users/me` : 'https://api.twitter.com/2/users/me') + '?user.fields=profile_image_url,username,name';
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });
        if (!res.ok) throw new Error('profile fetch failed');
        const data = await res.json();
        return data.data;
    }

    function toLargeAvatar(url) {
        if (typeof url !== 'string') return url;
        return url.replace('_normal', '_400x400');
    }

    async function initFromRedirect() {
        if (!isConfigured()) return false;
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const expectedState = window.localStorage.getItem(STATE_KEY);
        const verifier = window.localStorage.getItem(VERIFIER_KEY);
        if (!code || !state || !verifier || state !== expectedState) return false;
        try {
            const cfg = getConfig();
            const body = new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                code_verifier: verifier,
                redirect_uri: cfg.redirectUri,
                client_id: cfg.clientId,
            });
            const tokenUrl = cfg.tokenProxyUrl || 'https://api.twitter.com/2/oauth2/token';
            const res = await fetch(tokenUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: body.toString(),
            });
            if (!res.ok) throw new Error('token exchange failed');
            const token = await res.json();
            const auth = normalizeToken(token);
            saveAuth(auth);
            // Clean URL
            try { window.history.replaceState({}, document.title, window.location.pathname); } catch (_) {}
            // Fetch user and update app state
            const me = await fetchProfile(auth.access_token);
            if (window.AppState) {
                window.AppState.setUser({ id: me.username, handle: '@' + me.username, avatar: toLargeAvatar(me.profile_image_url) });
            }
            if (window.SaveController && window.I18N) {
                const lang = (window.AppState?.getState()?.lang) || 'zh';
                const dict = window.I18N.translations[lang] || window.I18N.translations.zh;
                const msg = (dict.toastXLoginSuccess || 'X 已连接');
                window.SaveController.showToast(msg);
            }
            window.localStorage.removeItem(STATE_KEY);
            window.localStorage.removeItem(VERIFIER_KEY);
            return true;
        } catch (e) {
            if (window.SaveController && window.I18N) {
                const lang = (window.AppState?.getState()?.lang) || 'zh';
                const dict = window.I18N.translations[lang] || window.I18N.translations.en;
                const msg = (dict.toastXLoginFailed || 'X 登录失败');
                window.SaveController.showToast(msg);
            }
            return false;
        }
    }

    async function login() {
        if (!isConfigured()) return false;
        const cfg = getConfig();
        // If valid token exists, just refresh label/profile
        const token = await ensureAccessToken();
        if (token) {
            try {
                const me = await fetchProfile(token);
                window.AppState?.setUser({ id: me.username, handle: '@' + me.username, avatar: toLargeAvatar(me.profile_image_url) });
                return true;
            } catch (_) {}
        }
        const state = randomString(24);
        const codeVerifier = randomString(64);
        const challenge = await pkceChallenge(codeVerifier);
        window.localStorage.setItem(STATE_KEY, state);
        window.localStorage.setItem(VERIFIER_KEY, codeVerifier);
        const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', cfg.clientId);
        authUrl.searchParams.set('redirect_uri', cfg.redirectUri);
        authUrl.searchParams.set('scope', cfg.scopes.join(' '));
        authUrl.searchParams.set('state', state);
        authUrl.searchParams.set('code_challenge', challenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');
        window.location.href = authUrl.toString();
        return true;
    }

    async function postTweet(text) {
        const token = await ensureAccessToken();
        if (!token) throw new Error('no_access_token');
        const cfg = getConfig();
        const base = cfg.apiProxyBase;
        const url = base ? `${base}/tweets` : 'https://api.twitter.com/2/tweets';
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ text })
        });
        if (!res.ok) {
            const errTxt = await safeText(res);
            throw new Error('tweet_failed: ' + errTxt);
        }
        return res.json();
    }

    async function safeText(res) { try { return await res.text(); } catch (_) { return ''; } }

    // Utils
    function randomString(len) {
        const arr = new Uint8Array(len);
        crypto.getRandomValues(arr);
        return Array.from(arr).map(b => ('0' + (b % 36).toString(36)).slice(-1)).join('');
    }

    async function pkceChallenge(verifier) {
        const data = new TextEncoder().encode(verifier);
        const digest = await crypto.subtle.digest('SHA-256', data);
        const base64 = btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        return base64;
    }

    window.XAuth = {
        initFromRedirect,
        isConfigured,
        login,
        ensureAccessToken,
        postTweet,
        fetchProfile,
        clearAuth,
    };
})();
