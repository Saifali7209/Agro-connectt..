/**
 * Compatibility shim.
 *
 * The legacy service modules (api.js, marketplace.js, notifications.js, …) import
 * session helpers from this path. Rather than maintaining a second copy of the
 * session, this file simply re-exports the one real store in
 * src/services/session.js — so legacy code and React code can never disagree
 * about who is signed in.
 *
 * The old `requireRole()` guard has deliberately been removed. Access control
 * now happens at the routing layer (<ProtectedRoute>), which cannot be skipped
 * by loading a page directly.
 */
export {
  ROLES,
  ROLE_HOME,
  setToken,
  getToken,
  getAuthHeader,
  setProfile,
  getProfile,
  isAuthenticated,
  hasRole,
  hasAnyRole,
  getRole,
  clearSession,
  subscribe,
} from "../../services/session.js";
