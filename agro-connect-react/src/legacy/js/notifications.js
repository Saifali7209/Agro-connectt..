/** AGRO CONNECT — notification centre. */
import { notificationAPI } from "./api.js";
import { loadData } from "./data-source.js";
import { DEMO_NOTIFICATIONS } from "../data/demo-data.js";
import { el, els, demoBanner, showError, bindTabs, emptyState } from "./ui.js";
import { escapeHtml, timeAgo } from "./utils.js";

export const NOTIFICATION_TYPES = ["All", "Orders", "Messages", "AI", "Weather", "Marketplace", "System"];
const ICONS = { Orders: "📦", Messages: "💬", AI: "🤖", Weather: "🌧", Marketplace: "🛒", System: "⚙️" };

export async function fetchNotifications() {
  return loadData(() => notificationAPI.list(), DEMO_NOTIFICATIONS);
}

export async function initNotifications(host) {
  host.innerHTML = `<div class="skeleton" style="height:320px;border-radius:var(--radius-lg)"></div>`;
  let items = [], demo = false;
  try {
    const res = await fetchNotifications();
    items = res.data; demo = res.demo;
  } catch (error) {
    showError(host, error, { retryId: "retry-notif" });
    el("#retry-notif", host)?.addEventListener("click", () => initNotifications(host));
    return;
  }

  let filter = "All";

  function draw() {
    const list = filter === "All" ? items : items.filter((n) => n.type === filter);
    const unread = items.filter((n) => !n.read).length;
    host.innerHTML = `${demo ? demoBanner("Sample notifications for layout review.") : ""}
      <div class="row-between">
        <div class="tabs" role="tablist" id="notif-tabs">
          ${NOTIFICATION_TYPES.map((t) => `<button type="button" role="tab" data-tab="${t}" aria-selected="${String(t === filter)}">${t}</button>`).join("")}
        </div>
        <button class="btn btn-outline btn-sm" type="button" id="mark-all">Mark all as read${unread ? ` (${unread})` : ""}</button>
      </div>
      <div class="card" style="padding:0;overflow:hidden;margin-top:var(--sp-4)">
        ${list.length ? list.map((n) => `<article class="notif ${n.read ? "" : "unread"}">
          <span class="n-icon" aria-hidden="true">${ICONS[n.type] || "🔔"}</span>
          <div style="flex:1">
            <div class="row-between"><strong>${escapeHtml(n.title)}</strong><time datetime="${n.at}">${timeAgo(n.at)}</time></div>
            <p class="text-muted">${escapeHtml(n.body)}</p>
          </div>
          ${n.read ? "" : `<button class="btn btn-sm btn-ghost" type="button" data-read="${n.id}">Mark read</button>`}
        </article>`).join("") : emptyState({ title: "No notifications", message: "You're all caught up." })}
      </div>`;

    bindTabs(el("#notif-tabs", host), (tab) => { filter = tab; draw(); });
    els("[data-read]", host).forEach((b) => b.addEventListener("click", async () => {
      const item = items.find((n) => n.id === b.dataset.read);
      try { await notificationAPI.markRead(b.dataset.read); } catch { /* offline: update locally */ }
      if (item) item.read = true;
      draw();
    }));
    el("#mark-all", host).addEventListener("click", async () => {
      try { await notificationAPI.markAllRead(); } catch { /* offline: update locally */ }
      items.forEach((n) => (n.read = true));
      draw();
    });
  }

  draw();
}
