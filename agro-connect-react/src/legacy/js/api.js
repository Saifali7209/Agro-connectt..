/**
 * AGRO CONNECT — single HTTP gateway to the FastAPI backend.
 *
 *   page module -> service module (cropAPI, orderAPI, ...) -> api.get/post/... -> FastAPI
 *
 * No module outside this file should call fetch(). No HTML file contains fetch().
 */
import { API_CONFIG, ENDPOINTS } from "./config.js";
import { getAuthHeader, clearSession } from "./auth.js";

/** Normalised error every caller can rely on. */
export class ApiError extends Error {
  constructor(status, message, details = null, code = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details; // e.g. FastAPI 422 field errors
    this.code = code;
  }
  get isOffline() { return this.status === 0; }
  get isUnavailable() { return this.status === 0 || this.status === 503 || this.status === 504; }
}

/** User-facing copy per status. Backend stack traces are never surfaced. */
const MESSAGES = {
  0: "We couldn't reach the Agro Connect server. Check your connection and try again.",
  400: "That request wasn't valid. Please review the details and try again.",
  401: "Your session has ended. Please sign in again.",
  403: "You don't have permission to do this.",
  404: "We couldn't find what you were looking for.",
  409: "This conflicts with existing information. Refresh and try again.",
  413: "That file is too large to upload.",
  422: "Some details need fixing before we can continue.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our side. Please try again shortly.",
  502: "The service is temporarily unreachable. Please try again shortly.",
  503: "This service is currently unavailable. Please try again later.",
  504: "The server took too long to respond. Please try again.",
};

export function friendlyMessage(error) {
  if (error instanceof ApiError) return MESSAGES[error.status] || error.message || MESSAGES[500];
  return MESSAGES[500];
}

const listeners = { unauthorized: [], error: [] };
export function onApiEvent(type, handler) { listeners[type]?.push(handler); }
function emit(type, payload) { (listeners[type] || []).forEach((h) => { try { h(payload); } catch { /* noop */ } }); }

function url(path, params) {
  const base = API_CONFIG.BASE_URL.replace(/\/$/, "");
  const suffix = params ? (typeof params === "string" ? params : new URLSearchParams(params).toString().replace(/^(?=.)/, "?")) : "";
  return `${base}${path}${suffix}`;
}

async function parseBody(response) {
  const type = response.headers.get("content-type") || "";
  if (response.status === 204) return null;
  if (type.includes("application/json")) { try { return await response.json(); } catch { return null; } }
  return await response.text();
}

async function request(method, path, { body, params, headers = {}, signal, timeout, isForm = false } = {}) {
  const controller = new AbortController();
  const limit = timeout ?? (isForm ? API_CONFIG.UPLOAD_TIMEOUT_MS : API_CONFIG.TIMEOUT_MS);
  const timer = setTimeout(() => controller.abort("timeout"), limit);
  if (signal) signal.addEventListener("abort", () => controller.abort(signal.reason), { once: true });

  const init = {
    method,
    signal: controller.signal,
    credentials: API_CONFIG.WITH_CREDENTIALS ? "include" : "same-origin",
    headers: { Accept: "application/json", ...getAuthHeader(), ...headers },
  };
  if (body !== undefined && body !== null) {
    if (isForm) init.body = body; // browser sets multipart boundary
    else { init.headers["Content-Type"] = "application/json"; init.body = JSON.stringify(body); }
  }

  let response;
  try {
    response = await fetch(url(path, params), init);
  } catch (err) {
    clearTimeout(timer);
    const offline = new ApiError(0, MESSAGES[0], { cause: String(err) });
    emit("error", offline);
    throw offline;
  }
  clearTimeout(timer);

  const payload = await parseBody(response);

  if (!response.ok) {
    const detail = payload && typeof payload === "object" ? payload.detail ?? payload.message : null;
    const error = new ApiError(
      response.status,
      MESSAGES[response.status] || MESSAGES[500],
      response.status === 422 ? normaliseValidation(detail) : detail,
      payload?.code ?? null
    );
    if (response.status === 401) { clearSession(); emit("unauthorized", error); }
    emit("error", error);
    throw error;
  }
  return payload;
}

/** FastAPI 422 -> { field: message } */
function normaliseValidation(detail) {
  if (!Array.isArray(detail)) return detail;
  const out = {};
  detail.forEach((d) => {
    const field = Array.isArray(d.loc) ? d.loc[d.loc.length - 1] : "form";
    out[field] = d.msg || "Invalid value";
  });
  return out;
}

export const api = {
  get: (path, params, opts) => request("GET", path, { params, ...opts }),
  post: (path, body, opts) => request("POST", path, { body, ...opts }),
  put: (path, body, opts) => request("PUT", path, { body, ...opts }),
  patch: (path, body, opts) => request("PATCH", path, { body, ...opts }),
  delete: (path, opts) => request("DELETE", path, opts),
  upload: (path, formData, opts) => request("POST", path, { body: formData, isForm: true, ...opts }),
};

/* ------------------------------------------------------------------ *
 * Service modules — the only vocabulary page code should use.
 * ------------------------------------------------------------------ */

export const authAPI = {
  login: (credentials) => api.post(ENDPOINTS.auth.login, credentials),
  register: (payload) => api.post(ENDPOINTS.auth.register, payload),
  logout: () => api.post(ENDPOINTS.auth.logout),
  me: (opts) => api.get(ENDPOINTS.auth.me, undefined, opts),
  refresh: () => api.post(ENDPOINTS.auth.refresh),
  requestOtp: (phone) => api.post(ENDPOINTS.auth.requestOtp, { phone }),
  verifyOtp: (phone, code) => api.post(ENDPOINTS.auth.verifyOtp, { phone, code }),
  forgotPassword: (identifier) => api.post(ENDPOINTS.auth.forgotPassword, { identifier }),
  resetPassword: (payload) => api.post(ENDPOINTS.auth.resetPassword, payload),
};

export const cropAPI = {
  catalog: () => api.get(ENDPOINTS.crops.catalog),
  search: (filters) => api.get(ENDPOINTS.crops.list, filters),
  detail: (id) => api.get(ENDPOINTS.crops.detail(id)),
  mine: (params) => api.get(ENDPOINTS.crops.mine, params),
  create: (payload) => api.post(ENDPOINTS.crops.create, payload),
  update: (id, payload) => api.put(ENDPOINTS.crops.update(id), payload),
  remove: (id) => api.delete(ENDPOINTS.crops.remove(id)),
  updatePrice: (id, price, note) => api.put(ENDPOINTS.crops.price(id), { price, note }),
  priceHistory: (id) => api.get(ENDPOINTS.crops.priceHistory(id)),
  setStatus: (id, status) => api.patch(ENDPOINTS.crops.status(id), { status }),
  uploadImages: (id, formData) => api.upload(ENDPOINTS.crops.images(id), formData),
  saved: () => api.get(ENDPOINTS.crops.saved),
  save: (id) => api.post(ENDPOINTS.crops.saved, { crop_id: id }),
};

export const orderAPI = {
  list: (params) => api.get(ENDPOINTS.orders.list, params),
  detail: (id) => api.get(ENDPOINTS.orders.detail(id)),
  create: (payload) => api.post(ENDPOINTS.orders.create, payload),
  setStatus: (id, status, note) => api.patch(ENDPOINTS.orders.status(id), { status, note }),
  timeline: (id) => api.get(ENDPOINTS.orders.timeline(id)),
  offers: (id) => api.get(ENDPOINTS.orders.offers(id)),
  makeOffer: (id, payload) => api.post(ENDPOINTS.orders.offers(id), payload),
};

export const inventoryAPI = {
  summary: () => api.get(ENDPOINTS.inventory.summary),
  adjust: (id, payload) => api.patch(ENDPOINTS.inventory.adjust(id), payload),
};

export const userAPI = {
  list: (params) => api.get(ENDPOINTS.users.list, params),
  detail: (id) => api.get(ENDPOINTS.users.detail(id)),
  setStatus: (id, status) => api.patch(ENDPOINTS.users.status(id), { status }),
  setRole: (id, role) => api.patch(ENDPOINTS.users.role(id), { role }),
  farmers: (params) => api.get(ENDPOINTS.farmers.list, params),
  farmer: (id) => api.get(ENDPOINTS.farmers.detail(id)),
  farmerProfile: () => api.get(ENDPOINTS.farmers.profile),
  saveFarmerProfile: (payload) => api.put(ENDPOINTS.farmers.profile, payload),
  verifyFarmer: (id, decision) => api.patch(ENDPOINTS.farmers.verify(id), decision),
  buyers: (params) => api.get(ENDPOINTS.buyers.list, params),
};

export const aiAPI = {
  /** POST /api/v1/ai/analyze-crop — multipart/form-data */
  analyzeCrop: (formData, opts) => api.upload(ENDPOINTS.ai.analyzeCrop, formData, opts),
  analysis: (id) => api.get(ENDPOINTS.ai.analysis(id)),
  analyses: (params) => api.get(ENDPOINTS.ai.analyses, params),
  cropHealth: (params) => api.get(ENDPOINTS.ai.cropHealth, params),
  pricePrediction: (params) => api.get(ENDPOINTS.ai.pricePrediction, params),
  yieldPrediction: (params) => api.get(ENDPOINTS.ai.yieldPrediction, params),
  diseaseRisk: (params) => api.get(ENDPOINTS.ai.diseaseRisk, params),
  requestExpertReview: (id, note) => api.post(ENDPOINTS.ai.requestExpertReview(id), { note }),
  analytics: (params) => api.get(ENDPOINTS.ai.analytics, params),
  models: () => api.get(ENDPOINTS.ai.models),
};

export const weatherAPI = {
  current: (params) => api.get(ENDPOINTS.weather.current, params),
  forecast: (params) => api.get(ENDPOINTS.weather.forecast, params),
  alerts: (params) => api.get(ENDPOINTS.weather.alerts, params),
};

export const messagingAPI = {
  conversations: () => api.get(ENDPOINTS.messaging.conversations),
  thread: (id) => api.get(ENDPOINTS.messaging.thread(id)),
  send: (id, payload) => api.post(ENDPOINTS.messaging.send(id), payload),
};

export const notificationAPI = {
  list: (params) => api.get(ENDPOINTS.notifications.list, params),
  markRead: (id) => api.patch(ENDPOINTS.notifications.read(id)),
  markAllRead: () => api.patch(ENDPOINTS.notifications.readAll),
};

export const expertAPI = {
  queue: (params) => api.get(ENDPOINTS.expert.queue, params),
  case: (id) => api.get(ENDPOINTS.expert.review(id)),
  submit: (id, payload) => api.post(ENDPOINTS.expert.submit(id), payload),
  profile: () => api.get(ENDPOINTS.expert.profile),
};

export const priceAPI = {
  market: (params) => api.get(ENDPOINTS.prices.market, params),
  history: (params) => api.get(ENDPOINTS.prices.history, params),
  regional: (params) => api.get(ENDPOINTS.prices.regional, params),
};

export const reviewAPI = {
  list: (params) => api.get(ENDPOINTS.reviews.list, params),
  create: (payload) => api.post(ENDPOINTS.reviews.create, payload),
};

export const knowledgeAPI = {
  list: (params) => api.get(ENDPOINTS.knowledge.list, params),
  detail: (id) => api.get(ENDPOINTS.knowledge.detail(id)),
  create: (payload) => api.post(ENDPOINTS.knowledge.create, payload),
  update: (id, payload) => api.put(ENDPOINTS.knowledge.detail(id), payload),
};

export const adminAPI = {
  stats: () => api.get(ENDPOINTS.admin.stats),
  reports: (params) => api.get(ENDPOINTS.admin.reports, params),
  auditLogs: (params) => api.get(ENDPOINTS.admin.auditLogs, params),
  settings: () => api.get(ENDPOINTS.admin.settings),
  saveSettings: (payload) => api.put(ENDPOINTS.admin.settings, payload),
};
