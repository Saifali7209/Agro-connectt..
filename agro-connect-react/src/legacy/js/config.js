/**
 * AGRO CONNECT — runtime configuration (React / Vite build).
 *
 * All values come from Vite environment variables so nothing is hardcoded and
 * no secret ever has to live in source. See .env.example.
 *
 * Only VITE_* variables are exposed to the browser bundle — database URIs and
 * JWT secrets belong on the backend and must never appear here.
 */

const ENV = import.meta.env;

function bool(value, fallback) {
  if (value === undefined || value === "") return fallback;
  return String(value) !== "false";
}

export const API_CONFIG = Object.freeze({
  BASE_URL: ENV.VITE_API_BASE_URL || "http://localhost:8000/api/v1",
  TIMEOUT_MS: Number(ENV.VITE_API_TIMEOUT_MS) || 20000,
  UPLOAD_TIMEOUT_MS: Number(ENV.VITE_API_UPLOAD_TIMEOUT_MS) || 60000,
  WITH_CREDENTIALS: bool(ENV.VITE_API_WITH_CREDENTIALS, true), // refresh-cookie friendly
});

export const APP_CONFIG = Object.freeze({
  NAME: "Agro Connect",
  TAGLINE: "Direct From Farmers. Direct To Buyers.",
  CURRENCY: "INR",
  LOCALE: "en-IN",
  /**
   * The React app is mounted at the domain root and navigation is handled by
   * React Router, so the legacy BASE_PATH prefix is now empty. Legacy markup
   * that still emits `${B}/farmer/orders.html` therefore produces
   * `/farmer/orders.html`, which <LegacyPage> rewrites to the React route
   * `/farmer/orders` and navigates to without a page reload.
   */
  BASE_PATH: "",
  SUPPORT_EMAIL: "support@agroconnect.example",
  PAGE_SIZE: 9,
  SEARCH_DEBOUNCE_MS: 350,
});

export const UPLOAD_CONFIG = Object.freeze({
  ACCEPTED_TYPES: ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  ACCEPTED_LABEL: "JPG, JPEG, PNG, WEBP",
  MAX_FILE_MB: 8,
  MAX_FILES: 6,
});

/** Every backend route the frontend will ever call. Keep paths in one place. */
export const ENDPOINTS = Object.freeze({
  auth: {
    login: "/auth/login",
    register: "/auth/register",
    logout: "/auth/logout",
    me: "/auth/me",
    refresh: "/auth/refresh",
    requestOtp: "/auth/otp/request",
    verifyOtp: "/auth/otp/verify",
    forgotPassword: "/auth/password/forgot",
    resetPassword: "/auth/password/reset",
  },
  users: { list: "/users", detail: (id) => `/users/${id}`, role: (id) => `/users/${id}/role`, status: (id) => `/users/${id}/status` },
  farmers: { list: "/farmers", detail: (id) => `/farmers/${id}`, profile: "/farmers/me", verify: (id) => `/farmers/${id}/verification` },
  buyers: { list: "/buyers", detail: (id) => `/buyers/${id}`, profile: "/buyers/me" },
  crops: {
    catalog: "/crops/catalog",
    list: "/crops",
    detail: (id) => `/crops/${id}`,
    create: "/crops",
    update: (id) => `/crops/${id}`,
    remove: (id) => `/crops/${id}`,
    price: (id) => `/crops/${id}/price`,
    priceHistory: (id) => `/crops/${id}/price-history`,
    status: (id) => `/crops/${id}/status`,
    images: (id) => `/crops/${id}/images`,
    mine: "/crops/mine",
    saved: "/crops/saved",
  },
  orders: {
    list: "/orders",
    detail: (id) => `/orders/${id}`,
    create: "/orders",
    status: (id) => `/orders/${id}/status`,
    timeline: (id) => `/orders/${id}/timeline`,
    offers: (id) => `/orders/${id}/offers`,
  },
  inventory: { summary: "/inventory/summary", adjust: (id) => `/inventory/${id}` },
  messaging: { conversations: "/messages/conversations", thread: (id) => `/messages/conversations/${id}`, send: (id) => `/messages/conversations/${id}` },
  notifications: { list: "/notifications", read: (id) => `/notifications/${id}/read`, readAll: "/notifications/read-all" },
  weather: { current: "/weather", forecast: "/weather/forecast", alerts: "/weather/alerts" },
  ai: {
    analyzeCrop: "/ai/analyze-crop",
    analysis: (id) => `/ai/analyses/${id}`,
    analyses: "/ai/analyses",
    cropHealth: "/ai/crop-health",
    pricePrediction: "/ai/price-prediction",
    yieldPrediction: "/ai/yield-prediction",
    diseaseRisk: "/ai/disease-risk",
    requestExpertReview: (id) => `/ai/analyses/${id}/expert-review`,
    analytics: "/ai/analytics",
    models: "/ai/models",
  },
  expert: { queue: "/expert/reviews/pending", review: (id) => `/expert/reviews/${id}`, submit: (id) => `/expert/reviews/${id}/submit`, profile: "/expert/me" },
  prices: { market: "/prices/market", history: "/prices/history", regional: "/prices/regional" },
  reviews: { list: "/reviews", create: "/reviews" },
  knowledge: { list: "/knowledge", detail: (id) => `/knowledge/${id}`, create: "/knowledge" },
  admin: { stats: "/admin/stats", reports: "/admin/reports", auditLogs: "/admin/audit-logs", settings: "/admin/settings" },
});

/** Set VITE_USE_DEMO_DATA=false once a real API instance is reachable. */
export const USE_DEMO_DATA = bool(ENV.VITE_USE_DEMO_DATA, true);
