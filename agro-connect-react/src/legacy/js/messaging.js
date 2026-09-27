/** AGRO CONNECT — conversation list + thread controller. */
import { messagingAPI } from "./api.js";
import { loadData } from "./data-source.js";
import { DEMO_CONVERSATIONS } from "../data/demo-data.js";
import { el, els, demoBanner, showToast, showError } from "./ui.js";
import { escapeHtml, initials, timeAgo, formatTime } from "./utils.js";

export async function fetchConversations() {
  return loadData(() => messagingAPI.conversations(), DEMO_CONVERSATIONS);
}

export function messagingMarkup() {
  return `<div id="messaging-host" class="stack"></div>`;
}

export async function initMessaging(host) {
  host.innerHTML = `<div class="skeleton" style="height:520px;border-radius:var(--radius-lg)"></div>`;
  let conversations = [];
  let demo = false;
  try {
    const res = await fetchConversations();
    conversations = res.data;
    demo = res.demo;
  } catch (error) {
    showError(host, error, { retryId: "retry-msg" });
    el("#retry-msg", host)?.addEventListener("click", () => initMessaging(host));
    return;
  }

  let activeId = conversations[0]?.id;

  function draw() {
    const active = conversations.find((c) => c.id === activeId);
    host.innerHTML = `${demo ? demoBanner("Conversations shown here are sample threads.") : ""}
      <div class="chat-layout" id="chat">
        <div class="chat-list">
          <div class="search"><label class="sr-only" for="msg-search">Search conversations</label>
            <input id="msg-search" type="search" placeholder="Search conversations"></div>
          <div class="chat-items" role="listbox" aria-label="Conversations">
            ${conversations.map((c) => `<button class="chat-item" role="option" data-id="${c.id}" aria-selected="${String(c.id === activeId)}">
              <span class="avatar" aria-hidden="true">${initials(c.name)}</span>
              <span class="meta"><strong>${escapeHtml(c.name)}</strong><span>${escapeHtml(c.preview)}</span></span>
              <span style="text-align:right;font-size:var(--fs-xs)" class="text-muted">${timeAgo(c.last_at)}
                ${c.unread ? `<br><span class="badge badge-primary">${c.unread}</span>` : ""}</span>
            </button>`).join("")}
          </div>
        </div>
        <div class="chat-thread">
          ${active ? `<div class="chat-head">
            <button class="btn btn-ghost btn-sm" type="button" id="back-list" aria-label="Back to conversations">←</button>
            <span class="avatar" aria-hidden="true">${initials(active.name)}</span>
            <div><strong>${escapeHtml(active.name)}</strong><br><span class="text-muted" style="font-size:var(--fs-xs)">${escapeHtml(active.role)}</span></div></div>
          <div class="chat-body" id="chat-body">
            ${active.messages.map((m) => `<div class="bubble ${m.from === "me" ? "mine" : ""}">${escapeHtml(m.text)}
              <time datetime="${m.at}">${formatTime(m.at)}</time></div>`).join("")}
          </div>
          <form class="chat-compose" id="compose">
            <button class="icon-btn" type="button" aria-label="Attach a file">📎</button>
            <label class="sr-only" for="msg">Write a message</label>
            <textarea id="msg" name="message" placeholder="Write a message…" required></textarea>
            <button class="btn btn-primary" type="submit">Send</button>
          </form>` : `<div class="state"><h3>No conversation selected</h3><p>Choose a conversation to read it.</p></div>`}
        </div>
      </div>`;

    els(".chat-item", host).forEach((b) => b.addEventListener("click", () => {
      activeId = b.dataset.id;
      const conv = conversations.find((c) => c.id === activeId);
      if (conv) conv.unread = 0;
      draw();
      el("#chat", host)?.classList.add("thread-open");
    }));
    el("#back-list", host)?.addEventListener("click", () => el("#chat", host).classList.remove("thread-open"));

    const search = el("#msg-search", host);
    search?.addEventListener("input", () => {
      const q = search.value.toLowerCase();
      els(".chat-item", host).forEach((b) => {
        b.classList.toggle("hidden", !b.textContent.toLowerCase().includes(q));
      });
    });

    el("#compose", host)?.addEventListener("submit", async (e) => {
      e.preventDefault();
      const field = el("#msg", host);
      const text = field.value.trim();
      if (!text) return;
      try {
        await messagingAPI.send(activeId, { text });
        showToast("Message sent.", "success");
      } catch {
        showToast("Message could not be sent — the messaging service is unavailable.", "error");
        return;
      } finally {
        field.value = "";
      }
      const conv = conversations.find((c) => c.id === activeId);
      conv.messages.push({ id: Date.now(), from: "me", text, at: new Date().toISOString() });
      draw();
      el("#chat", host)?.classList.add("thread-open");
    });

    const body = el("#chat-body", host);
    if (body) body.scrollTop = body.scrollHeight;
  }

  draw();
}
