/**
 * Re-export of the HTTP gateway so React code imports from `services/` while the
 * legacy service modules keep their existing relative imports. There is still
 * exactly one fetch implementation in the app (src/legacy/js/api.js).
 */
export * from "../legacy/js/api.js";
