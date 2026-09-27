/**
 * AGRO CONNECT — the single source of truth for the current session.
 *
 * Design rules (these are what close the old authentication bypass):
 *
 *  1. The access token lives in a module variable — in memory only. It is never
 *     written to localStorage or sessionStorage, so it cannot be forged from
 *     devtools and it cannot leak through XSS-readable storage.
 *  2. NOTHING in browser storage is ever treated as proof of authentication.
 *     A page refresh re-establishes the session by calling the backend
 *     (`POST /auth/refresh` then `GET /auth/me`). If the backend says no, the
 *     user is logged out. There is no client-side "isLoggedIn" flag to flip.
 *  3. The role used by the route guards comes from the profile the backend
 *     returned — never from a form field, a query string or storage.
 *
 * Both the React tree (via AuthContext) and the legacy service modules (via
 * legacy/js/auth.js, which re-exports this file) read the same state, so there
 * is exactly one session in the application.
 */

export const ROLES = Object.freeze({
  FARMER: "farmer",
  BUYER: "buyer",
  EXPERT: "expert",
  ADMIN: "admin",
});

/** Where each role lands after a successful sign-in. */
export const ROLE_HOME = Object.freeze({
  farmer: "/farmer/dashboard",
  buyer: "/buyer/dashboard",
  expert: "/expert/dashboard",
  admin: "/admin/dashboard",
});

let accessToken = null; // in-memory only, intentionally never persisted
let profile = null;     // populated only from a backend response

const subscribers = new Set();

function emit() {
  const snapshot = { token: accessToken, profile };
  subscribers.forEach((fn) => {
    try { fn(snapshot); } catch { /* a bad subscriber must not break the session */ }
  });
}

/** Subscribe to session changes. Returns an unsubscribe function. */
export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

export function setToken(token) { accessToken = token || null; emit(); }
export function getToken() { return accessToken; }

export function setProfile(next) { profile = next || null; emit(); }
export function getProfile() { return profile; }

/** Used by api.js on every request. */
export function getAuthHeader() {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

/**
 * Authentication is the presence of a live token AND a backend-issued profile.
 * Both are set together and cleared together, so they cannot drift apart.
 */
export function isAuthenticated() { return Boolean(accessToken && profile); }

export function getRole() { return profile?.role || null; }
export function hasRole(role) { return getRole() === role; }

export function hasAnyRole(roles) {
  if (!roles || roles.length === 0) return true;
  return roles.includes(getRole());
}

/** Wipes every trace of the session from the tab. */
export function clearSession() {
  accessToken = null;
  profile = null;
  // Defensive: remove anything an older build of the app may have left behind.
  try {
    localStorage.removeItem("session.profile");
    sessionStorage.removeItem("session.profile");
  } catch { /* storage can be unavailable in private mode */ }
  emit();
}
