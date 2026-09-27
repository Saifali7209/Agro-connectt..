import { createContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api, authAPI, onApiEvent } from "../services/api.js";
import { ENDPOINTS } from "../legacy/js/config.js";
import {
  ROLE_HOME,
  clearSession,
  getToken,
  setProfile,
  setToken,
} from "../services/session.js";

/**
 * AGRO CONNECT — centralised authentication state.
 *
 * `status` is the value every guard reads:
 *   "initialising" — we are still asking the backend whether a session exists.
 *                    Nothing protected may render yet.
 *   "authenticated" — the backend issued a token AND returned a profile.
 *   "anonymous"     — no valid session. Protected routes redirect to /login.
 *
 * The "initialising" state is what removes the race condition where a dashboard
 * flashes on screen before the auth check finishes.
 */
export const AuthContext = createContext(null);

const STATUS = {
  INITIALISING: "initialising",
  AUTHENTICATED: "authenticated",
  ANONYMOUS: "anonymous",
};

// Module-level (not per-component) so the "unauthorized" listener is attached
// exactly once for the life of the page — see the effect below.
let unauthorizedListenerAttached = false;

export function AuthProvider({ children }) {
  const [status, setStatus] = useState(STATUS.INITIALISING);
  const [user, setUser] = useState(null);
  const [sessionError, setSessionError] = useState(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  /** Commit a backend auth response to both React state and the session store. */
  const commit = useCallback((token, profile) => {
    setToken(token || null);
    setProfile(profile || null);
    if (!mounted.current) return;
    setUser(profile || null);
    setStatus(profile ? STATUS.AUTHENTICATED : STATUS.ANONYMOUS);
  }, []);

  const forget = useCallback(() => {
    clearSession();
    if (!mounted.current) return;
    setUser(null);
    setStatus(STATUS.ANONYMOUS);
  }, []);

  /**
   * Startup / hard-refresh session restore.
   *
   * The access token is deliberately not persisted, so on a fresh page load we
   * ask the backend to mint a new one from its httpOnly refresh cookie. Only if
   * that succeeds AND /auth/me returns a profile do we consider the user signed
   * in. A failure at either step means anonymous — never a fallback to anything
   * stored in the browser.
   */
  useEffect(() => {
    let cancelled = false;
    let settled = false;

    // Every non-public route (console pages AND the /login, /register,
    // /forgot-password, /reset-password screens) waits on this single effect
    // via `isInitialising`. Home and the other plain public pages never gate
    // on it, which is exactly why they always rendered while "almost every
    // other page" did not: this was the one chain those pages were stuck
    // behind.
    //
    // `settled` plus the hard ceiling below are a backstop *in addition to*
    // the try/catch: no matter what happens inside the async call chain
    // (an uncaught rejection, a backend that accepts the connection but never
    // writes a response, a proxy that swallows the abort), `isInitialising`
    // is guaranteed to clear.
    const finish = (fn) => {
      if (cancelled || settled) return;
      settled = true;
      fn();
    };

    const ceiling = setTimeout(() => finish(forget), 8000);

    (async () => {
      try {
        // A short timeout: when no backend is reachable the app should fall
        // through to "anonymous" quickly rather than hanging on the splash.
        const refreshed = await api.post(ENDPOINTS.auth.refresh, null, { timeout: 6000 });
        if (refreshed?.access_token) setToken(refreshed.access_token);

        // This fallback call previously had no timeout of its own, so it
        // defaulted to the general-purpose 20s API_CONFIG.TIMEOUT_MS. A
        // backend that answers /auth/refresh but stalls on /auth/me could
        // leave every gated route showing "Checking your session…" for up
        // to 20 seconds — which reads as "stuck forever" to anyone testing
        // navigation. Bound it the same way /auth/refresh already is.
        const profile = refreshed?.user ?? (await authAPI.me({ timeout: 6000 }));
        if (cancelled) return;

        if (profile?.role) finish(() => commit(getToken(), profile));
        else finish(forget);
      } catch (error) {
        if (cancelled) return;
        // 401/403 simply means "not signed in" and is not worth surfacing.
        // Anything else (backend down, network failure) is worth telling the
        // user about on the login screen, but it still yields no access.
        if (error?.status !== 401 && error?.status !== 403) {
          setSessionError(error);
        }
        finish(forget);
      }
    })();

    return () => { cancelled = true; clearTimeout(ceiling); };
  }, [commit, forget]);

  /**
   * A 401 from any request anywhere in the app ends the session immediately, so
   * an expired token cannot leave protected UI on screen.
   */
  const forgetRef = useRef(forget);
  forgetRef.current = forget;

  useEffect(() => {
    // The legacy event bus has no removeListener, so a plain effect with an
    // empty dependency array is not actually enough to register exactly once:
    // React 18 StrictMode invokes effects twice in development, and this one
    // has no cleanup to undo the first registration. Guard at module scope so
    // the listener is attached a single time for the life of the page, no
    // matter how many times AuthProvider's effects run.
    if (!unauthorizedListenerAttached) {
      unauthorizedListenerAttached = true;
      onApiEvent("unauthorized", () => forgetRef.current());
    }
  }, []);

  /** Credentials go to the backend. The backend decides. */
  const login = useCallback(async (credentials) => {
    const res = await authAPI.login(credentials);
    if (!res?.access_token || !res?.user?.role) {
      // A malformed response must not be treated as a successful sign-in.
      forget();
      throw new Error("The sign-in response from the server was incomplete.");
    }
    commit(res.access_token, res.user);
    return res.user;
  }, [commit, forget]);

  const loginWithOtp = useCallback(async (phone, code) => {
    const res = await authAPI.verifyOtp(phone, code);
    if (!res?.access_token || !res?.user?.role) {
      forget();
      throw new Error("The verification response from the server was incomplete.");
    }
    commit(res.access_token, res.user);
    return res.user;
  }, [commit, forget]);

  /**
   * Registration creates the account and nothing more. No token is stored and
   * no session is started, so submitting the signup form can never by itself
   * open a protected page — the user must sign in.
   */
  const register = useCallback(async (payload) => {
    const res = await authAPI.register(payload);
    forget();
    return res;
  }, [forget]);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout(); // let the backend revoke the refresh cookie
    } catch {
      // Even if the call fails, the local session must still be destroyed.
    } finally {
      forget();
    }
  }, [forget]);

  const value = useMemo(() => ({
    status,
    isInitialising: status === STATUS.INITIALISING,
    isAuthenticated: status === STATUS.AUTHENTICATED,
    user,
    role: user?.role ?? null,
    sessionError,
    homePath: ROLE_HOME[user?.role] || "/",
    login,
    loginWithOtp,
    register,
    logout,
    refreshProfile: async () => {
      const profile = await authAPI.me();
      commit(getToken(), profile);
      return profile;
    },
  }), [status, user, sessionError, login, loginWithOtp, register, logout, commit]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { STATUS as AUTH_STATUS };
