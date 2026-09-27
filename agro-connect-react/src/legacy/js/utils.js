/** AGRO CONNECT — pure helpers. No DOM writes, no network. */
import { APP_CONFIG } from "./config.js";

export function formatCurrency(value, opts = {}) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(APP_CONFIG.LOCALE, {
    style: "currency",
    currency: APP_CONFIG.CURRENCY,
    maximumFractionDigits: opts.decimals ?? 0,
  }).format(n);
}

export function formatNumber(value, decimals = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat(APP_CONFIG.LOCALE, { maximumFractionDigits: decimals }).format(n);
}

export function formatDate(value, style = "medium") {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(APP_CONFIG.LOCALE, { dateStyle: style }).format(d);
}

export function formatDateTime(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat(APP_CONFIG.LOCALE, { dateStyle: "medium", timeStyle: "short" }).format(d);
}

export function formatTime(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(APP_CONFIG.LOCALE, { timeStyle: "short" }).format(d);
}

export function timeAgo(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const secs = Math.round((Date.now() - d.getTime()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(APP_CONFIG.LOCALE, { numeric: "auto" });
  const table = [["year", 31536000], ["month", 2592000], ["day", 86400], ["hour", 3600], ["minute", 60]];
  for (const [unit, size] of table) {
    if (Math.abs(secs) >= size) return rtf.format(-Math.round(secs / size), unit);
  }
  return rtf.format(-secs, "second");
}

export function formatQty(qty, unit) {
  return `${formatNumber(qty)} ${unit || ""}`.trim();
}

/** Escape untrusted text before injecting into innerHTML templates. */
export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

export function debounce(fn, wait = APP_CONFIG.SEARCH_DEBOUNCE_MS) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function throttle(fn, wait = 200) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= wait) { last = now; fn(...args); }
  };
}

export function slugify(text) {
  return String(text).toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function initials(name) {
  return String(name || "?").split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

export function paginate(items, page, size = APP_CONFIG.PAGE_SIZE) {
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / size));
  const current = clamp(page, 1, pages);
  return { items: items.slice((current - 1) * size, current * size), page: current, pages, total };
}

export function sortBy(items, key, dir = "asc") {
  return [...items].sort((a, b) => {
    const x = a[key], y = b[key];
    if (x === y) return 0;
    return (x > y ? 1 : -1) * (dir === "desc" ? -1 : 1);
  });
}

export function groupBy(items, keyFn) {
  return items.reduce((acc, item) => {
    const k = keyFn(item);
    (acc[k] ||= []).push(item);
    return acc;
  }, {});
}

export function unique(arr) { return [...new Set(arr)]; }

export function queryParams(search = window.location.search) {
  return Object.fromEntries(new URLSearchParams(search).entries());
}

export function buildQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length)) return;
    Array.isArray(v) ? v.forEach((i) => sp.append(k, i)) : sp.set(k, v);
  });
  const s = sp.toString();
  return s ? `?${s}` : "";
}

export function readableBytes(bytes) {
  if (!bytes) return "0 KB";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${units[i]}`;
}

export function percent(value, decimals = 0) {
  return `${(Number(value) * 100).toFixed(decimals)}%`;
}

export function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

/** Small namespaced localStorage wrapper — UI preferences only, never secrets. */
export const store = {
  key: (k) => `agro:${k}`,
  get(k, fallback = null) {
    try { const v = localStorage.getItem(store.key(k)); return v ? JSON.parse(v) : fallback; }
    catch { return fallback; }
  },
  set(k, v) { try { localStorage.setItem(store.key(k), JSON.stringify(v)); } catch { /* quota */ } },
  remove(k) { try { localStorage.removeItem(store.key(k)); } catch { /* noop */ } },
};
