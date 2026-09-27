/** AGRO CONNECT — shared UI primitives. Presentation only, no business rules. */
import { escapeHtml } from "./utils.js";
import { friendlyMessage } from "./api.js";

/** Tagged template that escapes interpolations by default; use raw() to opt out. */
export function html(strings, ...values) {
  return strings.reduce((acc, s, i) => {
    const v = values[i - 1];
    return acc + (v && v.__raw ? v.value : Array.isArray(v) ? v.join("") : escapeHtml(v ?? "")) + s;
  });
}
export function raw(value) { return { __raw: true, value: value ?? "" }; }

export function el(selector, root = document) { return root.querySelector(selector); }
export function els(selector, root = document) { return [...root.querySelectorAll(selector)]; }

export function node(tag, attrs = {}, children = []) {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (k === "class") n.className = v;
    else if (k === "html") n.innerHTML = v;
    else if (k === "text") n.textContent = v;
    else if (k.startsWith("on") && typeof v === "function") n.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== null && v !== undefined && v !== false) n.setAttribute(k, v === true ? "" : v);
  });
  (Array.isArray(children) ? children : [children]).forEach((c) => c && n.append(c));
  return n;
}

/* ---------------- Toast ---------------- */
function toastRegion() {
  let region = el("#toast-region");
  if (!region) {
    region = node("div", { id: "toast-region", class: "toast-region", role: "status", "aria-live": "polite" });
    document.body.append(region);
  }
  return region;
}

export function showToast(message, type = "info", timeout = 4200) {
  const t = node("div", { class: `toast ${type}`, text: message });
  toastRegion().append(t);
  setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 250); }, timeout);
  return t;
}

/* ---------------- Modal ---------------- */
let lastFocused = null;

export function showModal({ title, body, actions = [], size = "" } = {}) {
  closeModal();
  lastFocused = document.activeElement;
  const backdrop = node("div", { class: "modal-backdrop", id: "app-modal" });
  const dialog = node("div", {
    class: `modal ${size}`, role: "dialog", "aria-modal": "true", "aria-label": title || "Dialog",
  });
  dialog.innerHTML = `
    <div class="card-head"><h2 class="card-title">${escapeHtml(title || "")}</h2>
      <button class="btn btn-ghost btn-sm" data-close aria-label="Close dialog">✕</button></div>
    <div class="modal-body"></div>
    <div class="form-actions"></div>`;
  const bodyHost = el(".modal-body", dialog);
  if (typeof body === "string") bodyHost.innerHTML = body; else if (body) bodyHost.append(body);

  const footer = el(".form-actions", dialog);
  actions.forEach((a) => footer.append(node("button", {
    class: `btn ${a.variant || "btn-outline"}`, type: "button",
    onClick: () => a.onClick?.(closeModal),
  }, a.label)));
  if (!actions.length) footer.remove();

  backdrop.append(dialog);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeModal(); });
  dialog.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(); });
  document.addEventListener("keydown", escClose);
  document.body.append(backdrop);
  (el("input, select, textarea, button", dialog) || dialog).focus();
  return { close: closeModal, root: dialog };
}

function escClose(e) { if (e.key === "Escape") closeModal(); }

export function closeModal() {
  el("#app-modal")?.remove();
  document.removeEventListener("keydown", escClose);
  lastFocused?.focus?.();
}

export function confirmDialog(title, message) {
  return new Promise((resolve) => {
    showModal({
      title,
      body: `<p class="text-muted">${escapeHtml(message)}</p>`,
      actions: [
        { label: "Cancel", variant: "btn-outline", onClick: (close) => { close(); resolve(false); } },
        { label: "Confirm", variant: "btn-primary", onClick: (close) => { close(); resolve(true); } },
      ],
    });
  });
}

/* ---------------- Loader ---------------- */
export function showLoader(label = "Loading") {
  hideLoader();
  document.body.append(node("div", {
    class: "loader-overlay", id: "app-loader", role: "status", "aria-live": "polite", "aria-label": label,
  }, node("div", { class: "spinner" })));
}
export function hideLoader() { el("#app-loader")?.remove(); }

export function setBusy(button, busy, busyLabel = "Working…") {
  if (!button) return;
  if (busy) {
    button.dataset.label = button.textContent;
    button.textContent = busyLabel;
    button.setAttribute("aria-busy", "true");
    button.disabled = true;
  } else {
    if (button.dataset.label) button.textContent = button.dataset.label;
    button.removeAttribute("aria-busy");
    button.disabled = false;
  }
}

/* ---------------- Inline states ---------------- */
export function skeletonGrid(count = 6, className = "crop-grid") {
  return `<div class="${className}">${Array.from({ length: count }, () => '<div class="skeleton skeleton-card"></div>').join("")}</div>`;
}

export function emptyState({ title = "Nothing here yet", message = "", action } = {}) {
  return `<div class="state"><div class="state-icon" aria-hidden="true">🌱</div>
    <h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p>
    ${action ? `<a class="btn btn-primary" href="${escapeHtml(action.href)}">${escapeHtml(action.label)}</a>` : ""}</div>`;
}

export function errorState({ title = "Something went wrong", message = "", retryId } = {}) {
  return `<div class="state error"><div class="state-icon" aria-hidden="true">⚠</div>
    <h3>${escapeHtml(title)}</h3><p>${escapeHtml(message)}</p>
    ${retryId ? `<button class="btn btn-outline" id="${escapeHtml(retryId)}" type="button">Try again</button>` : ""}</div>`;
}

/** Render the standard state for an ApiError without leaking backend internals. */
export function showError(container, error, { retryId, title } = {}) {
  if (!container) return;
  container.innerHTML = errorState({
    title: title || (error?.isUnavailable ? "Service unavailable" : "Something went wrong"),
    message: friendlyMessage(error),
    retryId,
  });
}

export function showEmptyState(container, options) {
  if (container) container.innerHTML = emptyState(options);
}

/** Demo-data banner. Every screen showing mock content must render this. */
export function demoBanner(text = "Demo content for interface development. Real values arrive from the Agro Connect API.") {
  return `<p class="notice notice-demo" role="note"><strong>Demo data.</strong> ${escapeHtml(text)}</p>`;
}

export function navigateTo(path) { window.location.href = path; }

/** Tabs helper: wires aria-selected + change callback on a .tabs container. */
export function bindTabs(container, onChange) {
  if (!container) return;
  container.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-tab]");
    if (!btn) return;
    els("button[data-tab]", container).forEach((b) => b.setAttribute("aria-selected", String(b === btn)));
    onChange(btn.dataset.tab, btn);
  });
}

export function statusBadge(status) {
  const map = {
    active: "badge-success", published: "badge-success", verified: "badge-success", completed: "badge-success",
    approved: "badge-success", online: "badge-success", healthy: "badge-success",
    pending: "badge-warning", paused: "badge-warning", processing: "badge-warning", review: "badge-warning",
    preparing: "badge-warning", low: "badge-warning", moderate: "badge-warning",
    rejected: "badge-danger", cancelled: "badge-danger", failed: "badge-danger", high: "badge-danger", critical: "badge-danger",
    draft: "badge", inactive: "badge", "not verified": "badge",
  };
  const key = String(status || "").toLowerCase();
  return `<span class="badge ${map[key] || "badge-info"} badge-dot">${escapeHtml(status)}</span>`;
}
