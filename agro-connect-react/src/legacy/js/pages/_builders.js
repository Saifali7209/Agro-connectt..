/** Shared page builders used by the console pages (farmer, buyer, expert, admin). */
import { el, els, demoBanner, showError, showToast, statusBadge, emptyState, confirmDialog, showModal, setBusy } from "../ui.js";
import { escapeHtml, formatCurrency, formatNumber, formatDate, initials } from "../utils.js";
import { lineChart, barChart, donutChart, legend } from "../charts.js";
import { fetchMyCrops, cropRow } from "../crops.js";
import { fetchOrders, orderRow, orderTimeline, updateOrderNegotiation } from "../orders.js";
import { initMessaging } from "../messaging.js";
import { initNotifications } from "../notifications.js";
import { fetchInventory, inventoryMarkup } from "../inventory.js";
import { updatePrice } from "../price-intelligence.js";
import { APP_CONFIG } from "../config.js";

export const B = APP_CONFIG.BASE_PATH;

export function pageHead(title, sub, actions = "") {
  return `<header class="page-head"><div><h2 style="margin:0">${escapeHtml(title)}</h2>
    <p>${escapeHtml(sub)}</p></div><div class="btn-group">${actions}</div></header>`;
}

export function statCards(cards) {
  return `<div class="stat-grid">${cards.map((c) => `<article class="stat">
    <span class="label">${escapeHtml(c.label)}</span><span class="value">${c.value}</span>
    ${c.delta ? `<span class="delta ${c.dir || "up"}">${escapeHtml(c.delta)}</span>` : ""}</article>`).join("")}</div>`;
}

export function chartCard(title, body, note = "") {
  return `<div class="card"><h3 class="card-title">${escapeHtml(title)}</h3>${body}
    ${note ? `<p class="text-muted" style="font-size:var(--fs-xs);margin-top:8px">${escapeHtml(note)}</p>` : ""}</div>`;
}

export function tableCard(title, headers, rowsHtml, actions = "") {
  return `<div class="card" style="padding:0;overflow:hidden">
    <div class="card-head" style="padding:var(--sp-4) var(--sp-5) 0;margin-bottom:var(--sp-3)">
      <h3 class="card-title">${escapeHtml(title)}</h3><div class="btn-group">${actions}</div></div>
    <div class="table-wrap" style="border:0;border-radius:0">
      <table class="data"><thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join("")}</tr></thead>
      <tbody>${rowsHtml}</tbody></table></div></div>`;
}

/* ---------- Reusable page renderers ---------- */

export async function renderMyCrops(main) {
  main.innerHTML = pageHead("My Crops", "Every listing you have published, with quantity, price and order activity.",
    `<a class="btn btn-primary" href="${B}/farmer/add-crop.html">Add crop</a>`)
    + `<div id="crops-host"><div class="skeleton" style="height:320px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#crops-host", main);
  let crops = [], demo = false;
  try { const r = await fetchMyCrops(); crops = r.data; demo = r.demo; }
  catch (error) { showError(host, error); return; }

  function draw() {
    host.innerHTML = (demo ? demoBanner("Sample listings for layout review.") : "")
      + (crops.length
        ? tableCard("Listings", ["Crop", "Quantity", "Price", "Status", "Updated", "Orders", "Actions"], crops.map(cropRow).join(""))
        : emptyState({ title: "No listings yet", message: "Publish your first crop to start receiving orders.", action: { href: `${B}/farmer/add-crop.html`, label: "Add crop" } }));

    els("[data-action]", host).forEach((b) => b.addEventListener("click", async () => {
      const crop = crops.find((c) => c.id === b.dataset.id);
      if (b.dataset.action === "pause") {
        crop.status = crop.status === "paused" ? "active" : "paused";
        showToast(`Listing ${crop.status === "paused" ? "paused" : "resumed"}. The change is saved when the server confirms it.`, "info");
        draw();
      } else if (b.dataset.action === "delete") {
        if (await confirmDialog("Delete listing", `Remove ${crop.name} (${crop.variety}) from the marketplace?`)) {
          crops = crops.filter((c) => c.id !== crop.id);
          draw();
          showToast("Listing removed.", "success");
        }
      } else if (b.dataset.action === "price") {
        openPriceModal(crop, draw);
      }
    }));
  }
  draw();
}

export function openPriceModal(crop, onDone) {
  showModal({
    title: `Update price — ${crop.name}`,
    body: `<form id="price-form" novalidate>
      <p class="text-muted">Current rate: <strong>${formatCurrency(crop.price)} per ${escapeHtml(crop.unit)}</strong></p>
      <div class="field"><label for="new-price">New price (₹ per ${escapeHtml(crop.unit)})</label>
        <input id="new-price" name="price" type="number" min="1" step="0.5" value="${crop.price}" required></div>
      <div class="field"><label for="price-note">Note for buyers (optional)</label>
        <input id="price-note" name="note" type="text" maxlength="120"></div>
    </form>`,
    actions: [
      { label: "Cancel", variant: "btn-outline", onClick: (close) => close() },
      {
        label: "Save price", variant: "btn-primary", onClick: async (close) => {
          const form = document.getElementById("price-form");
          const price = Number(form.elements.price.value);
          if (!price || price <= 0) { showToast("Enter a price greater than zero.", "warn"); return; }
          try {
            await updatePrice(crop.id, price, form.elements.note.value);
            crop.previous_price = crop.price;
            crop.price = price;
            showToast("Price updated.", "success");
            close(); onDone?.();
          } catch {
            showToast("The price could not be updated — the server did not confirm the change.", "error");
          }
        },
      },
    ],
  });
}

export async function renderOrders(main, perspective) {
  main.innerHTML = pageHead("Orders", perspective === "farmer"
    ? "Incoming orders from buyers, with status and expected delivery."
    : "Your purchases and their current stage.")
    + `<div class="tabs" role="tablist" id="order-tabs" style="margin-bottom:var(--sp-4)">
        ${["All", "Pending", "Preparing", "Out for Delivery", "Completed", "Cancelled"].map((t, i) =>
          `<button type="button" role="tab" data-tab="${t}" aria-selected="${String(i === 0)}">${t}</button>`).join("")}
      </div><div id="orders-host"><div class="skeleton" style="height:300px;border-radius:var(--radius-lg)"></div></div>`;

  const host = el("#orders-host", main);
  let orders = [], demo = false, filter = "All";
  try { const r = await fetchOrders(); orders = r.data; demo = r.demo; }
  catch (error) { showError(host, error); return; }

  function draw() {
    const list = filter === "All" ? orders : orders.filter((o) => o.status === filter);
    host.innerHTML = (demo ? demoBanner("Sample orders for layout review.") : "")
      + (list.length
        ? tableCard("Orders", ["Order", "Crop", "Quantity", perspective === "farmer" ? "Buyer" : "Farmer", "Total", "Status", "Expected", ""],
            list.map((o) => orderRow(o, { perspective })).join(""))
        : emptyState({ title: "No orders in this view", message: "Orders will appear here as soon as they are placed." }));
  }
  draw();
  el("#order-tabs", main).addEventListener("click", (e) => {
    const b = e.target.closest("button[data-tab]");
    if (!b) return;
    els("#order-tabs button", main).forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    filter = b.dataset.tab; draw();
  });
}

export async function renderOrderDetails(main, perspective) {
  const id = new URLSearchParams(location.search).get("id");
  main.innerHTML = pageHead("Order details", "Follow this order and price negotiations through every stage.");
  const host = document.createElement("div");
  host.className = "panel-grid";
  main.append(host);
  let orders = [];
  try { const r = await fetchOrders(); orders = r.data; } catch (error) { showError(main, error); return; }
  const order = orders.find((o) => o.id === id) || orders[0];
  const total = Number(order.price) * Number(order.quantity) + Number(order.delivery_fee || 0);

  const neg = order.negotiation;
  const hasNegotiation = !!neg;
  const isPending = neg && neg.status === "Pending";
  const isAccepted = neg && neg.status === "Accepted";
  const isRejected = neg && neg.status === "Rejected";

  let statusBadgeMarkup = "";
  if (isPending) {
    statusBadgeMarkup = `<span class="badge badge-warning" id="neg-status-badge" style="font-weight:600;padding:4px 10px;font-size:var(--fs-xs);">⏳ Pending Review</span>`;
  } else if (isAccepted) {
    statusBadgeMarkup = `<span class="badge badge-success" id="neg-status-badge" style="font-weight:600;padding:4px 10px;font-size:var(--fs-xs);">✓ Offer Accepted</span>`;
  } else if (isRejected) {
    statusBadgeMarkup = `<span class="badge badge-danger" id="neg-status-badge" style="font-weight:600;padding:4px 10px;font-size:var(--fs-xs);">✕ Offer Rejected</span>`;
  }

  const origPrice = Number(neg?.original_price || order.price);
  const offerPrice = Number(neg?.offered_price || order.price);
  const priceDiff = origPrice - offerPrice;
  const diffPercent = origPrice > 0 ? Math.round((priceDiff / origPrice) * 100) : 0;

  host.innerHTML = `<div class="stack">
    ${hasNegotiation ? `
    <div class="card" id="negotiation-card" style="border-left:4px solid ${isAccepted ? 'var(--color-primary,#2e7d32)' : isRejected ? 'var(--color-danger,#c62828)' : '#f59e0b'};">
      <div class="card-head" style="margin-bottom:var(--sp-2);">
        <h3 class="card-title" style="display:flex;align-items:center;gap:8px;">
          <span>🤝 Price Negotiation / Offer Details</span>
        </h3>
        ${statusBadgeMarkup}
      </div>
      
      <p class="text-muted" style="font-size:var(--fs-xs);margin:0 0 var(--sp-3) 0;">
        ${perspective === "farmer"
          ? (isPending
              ? "The buyer has proposed a negotiated counter-offer for this order. Review the offer details below and choose to Accept or Reject."
              : isAccepted
                ? "You accepted this negotiated price. The order rate and total amount have been updated."
                : "You rejected this offer. The order remains at the original listed price.")
          : (isPending
              ? "Your counter-offer has been sent to the farmer and is waiting for review."
              : isAccepted
                ? "The farmer accepted your negotiated rate! Your order rate and total amount have been updated."
                : "The farmer declined your offer. You may place a new offer or order at the listed price.")
        }
      </p>

      <dl class="kv" style="margin-bottom:var(--sp-2);">
        <dt>Crop</dt>
        <dd><strong>${escapeHtml(order.crop)}</strong> <span class="text-muted">(${escapeHtml(order.variety)})</span></dd>
        
        <dt>Buyer</dt>
        <dd><strong>${escapeHtml(order.buyer.name)}</strong> <span class="text-muted">(${escapeHtml(order.buyer.city || "Direct Buyer")})</span></dd>

        <dt>Requested Quantity</dt>
        <dd><strong>${formatNumber(order.quantity)} ${escapeHtml(order.unit)}</strong></dd>

        <dt>Farmer Listed Price</dt>
        <dd style="text-decoration:${isAccepted ? 'line-through' : 'none'};color:${isAccepted ? 'var(--color-muted)' : 'inherit'};">
          ${formatCurrency(origPrice)} per ${escapeHtml(order.unit)}
        </dd>

        <dt>Buyer Offered Price</dt>
        <dd>
          <strong style="color:var(--color-primary-dark,#1b5e20);font-size:var(--fs-md);">${formatCurrency(offerPrice)} per ${escapeHtml(order.unit)}</strong>
          ${priceDiff > 0 ? `<span class="badge badge-warning" style="font-size:10px;margin-left:6px;">-${formatCurrency(priceDiff)} (${diffPercent}% discount)</span>` : ""}
        </dd>

        <dt>Buyer's Message</dt>
        <dd style="background:var(--color-bg);padding:8px 12px;border-radius:var(--radius-sm);font-style:italic;font-size:var(--fs-sm);">
          "${escapeHtml(neg.buyer_note || "No message attached.")}"
        </dd>

        <dt>Negotiation Status</dt>
        <dd><strong id="neg-status-text" style="color:${isAccepted ? 'var(--color-primary,#2e7d32)' : isRejected ? 'var(--color-danger,#c62828)' : '#b45309'}">${escapeHtml(neg.status)}</strong></dd>
      </dl>

      ${perspective === "farmer" && isPending ? `
      <div class="btn-group" id="farmer-negotiation-actions" style="margin-top:var(--sp-3);padding-top:var(--sp-3);border-top:1px solid var(--color-border,#e0e0e0);gap:8px;">
        <button class="btn btn-primary btn-sm" id="btn-accept-negotiation" style="background:#2e7d32;border-color:#2e7d32;color:#fff;">
          ✓ Accept Offer (${formatCurrency(offerPrice)}/${escapeHtml(order.unit)})
        </button>
        <button class="btn btn-danger btn-sm" id="btn-reject-negotiation">
          ✕ Reject Offer
        </button>
      </div>` : ""}

      ${perspective === "buyer" && isRejected ? `
      <div style="margin-top:var(--sp-3);padding-top:var(--sp-3);border-top:1px solid var(--color-border,#e0e0e0);display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
        <span class="text-muted" style="font-size:var(--fs-xs);">The offer was declined. Would you like to place a new offer or order at listed rate?</span>
        <a class="btn btn-primary btn-sm" href="${B}/buyer/checkout.html?id=${encodeURIComponent(order.crop_id || 'crp_1001')}">
          Make New Offer / Re-order
        </a>
      </div>` : ""}
    </div>` : ""}

    <div class="card">
      <div class="card-head"><h3 class="card-title">${escapeHtml(order.id)}</h3>${statusBadge(order.status)}</div>
      <dl class="kv">
        <dt>Crop</dt><dd>${escapeHtml(order.crop)} (${escapeHtml(order.variety)})</dd>
        <dt>Quantity</dt><dd>${formatNumber(order.quantity)} ${escapeHtml(order.unit)}</dd>
        <dt>Rate</dt>
        <dd id="order-rate-display">
          ${formatCurrency(order.price)} per ${escapeHtml(order.unit)}
          ${isAccepted ? `<span class="badge badge-success" style="font-size:10px;margin-left:6px;">Negotiated Rate</span>` : ""}
        </dd>
        <dt>Delivery</dt><dd>${escapeHtml(order.delivery_mode)} — ${formatCurrency(order.delivery_fee)}</dd>
        <dt>Total Amount</dt>
        <dd id="order-total-display">
          <strong style="font-size:var(--fs-md);">${formatCurrency(total)}</strong>
          ${isAccepted ? `<span class="text-muted" style="font-size:var(--fs-xs);margin-left:6px;">(Calculated at accepted ₹${neg.offered_price}/${order.unit})</span>` : ""}
        </dd>
        <dt>${perspective === "farmer" ? "Buyer" : "Farmer"}</dt>
        <dd>${escapeHtml(perspective === "farmer" ? order.buyer.name : order.farmer.name)}</dd>
        <dt>Placed</dt><dd>${formatDate(order.placed_at)}</dd>
        <dt>Expected</dt><dd>${formatDate(order.expected)}</dd>
      </dl>
      <div class="btn-group" style="margin-top:var(--sp-3)">
        <a class="btn btn-outline btn-sm" href="${B}/${perspective}/orders.html">Back to orders</a>
        <a class="btn btn-primary btn-sm" href="${B}/${perspective === "farmer" ? "farmer" : "buyer"}/route-optimization.html?id=${encodeURIComponent(order.id)}">🗺️ Route Optimization</a>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="card-head"><h3 class="card-title">Tracking</h3>${statusBadge(order.status)}</div>
    ${orderTimeline(order.status)}
    <hr class="divider" style="margin:var(--sp-3) 0">
    <div style="background:var(--color-bg);padding:12px;border-radius:var(--radius-md);">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
        <strong style="font-size:var(--fs-sm);">Transit & Logistics Route</strong>
        <span class="badge badge-success">OpenStreetMap</span>
      </div>
      <p class="text-muted" style="font-size:var(--fs-xs);margin:0 0 10px 0;">
        Shortest road route from <strong>${escapeHtml(order.farmer.name)}</strong>'s farm to <strong>${escapeHtml(order.buyer.name)}</strong> using Dijkstra optimization.
      </p>
      <a class="btn btn-primary btn-sm" style="width:100%;justify-content:center;" href="${B}/${perspective === "farmer" ? "farmer" : "buyer"}/route-optimization.html?id=${encodeURIComponent(order.id)}">
        Open Interactive Route Map
      </a>
    </div>
  </div>`;

  // Attach farmer negotiation actions
  const btnAccept = el("#btn-accept-negotiation", host);
  const btnReject = el("#btn-reject-negotiation", host);

  if (btnAccept) {
    btnAccept.addEventListener("click", () => {
      const updated = updateOrderNegotiation(order.id, "accept");
      if (updated) {
        showToast(`Offer of ${formatCurrency(updated.price)}/${updated.unit} accepted! Order total updated to ${formatCurrency(updated.price * updated.quantity + updated.delivery_fee)}.`, "success");
        renderOrderDetails(main, perspective);
      }
    });
  }

  if (btnReject) {
    btnReject.addEventListener("click", () => {
      const updated = updateOrderNegotiation(order.id, "reject");
      if (updated) {
        showToast(`Offer rejected. The order remains at the listed price of ${formatCurrency(updated.price)}/${updated.unit}.`, "info");
        renderOrderDetails(main, perspective);
      }
    });
  }
}

export async function renderMessages(main) {
  main.innerHTML = pageHead("Messages", "Talk directly with the other side of every deal.") + `<div id="msg-host"></div>`;
  await initMessaging(el("#msg-host", main));
}

export async function renderNotifications(main) {
  main.innerHTML = pageHead("Notifications", "Orders, messages, crop health, weather and platform updates.") + `<div id="notif-host"></div>`;
  await initNotifications(el("#notif-host", main));
}

export function renderSettings(main, role) {
  main.innerHTML = pageHead("Settings", "Account, notification and privacy preferences.")
    + `<div class="panel-grid">
      <form class="card" id="account-form">
        <h3 class="card-title">Account</h3>
        <div class="field"><label for="s-name">Display name</label><input id="s-name" name="name" type="text"></div>
        <div class="field"><label for="s-email">Email</label><input id="s-email" name="email" type="email"></div>
        <div class="field"><label for="s-phone">Mobile number</label><input id="s-phone" name="phone" type="tel"></div>
        <div class="field"><label for="s-lang">Language</label><select id="s-lang" name="language">
          <option>English</option><option>हिन्दी</option><option>मराठी</option><option>ਪੰਜਾਬੀ</option><option>ಕನ್ನಡ</option></select></div>
        <button class="btn btn-primary" type="submit">Save changes</button>
      </form>
      <div class="card"><h3 class="card-title">Notifications</h3>
        <label class="checkline"><input type="checkbox" checked> Order updates</label>
        <label class="checkline" style="margin-top:10px"><input type="checkbox" checked> New messages</label>
        <label class="checkline" style="margin-top:10px"><input type="checkbox" checked> Weather alerts</label>
        <label class="checkline" style="margin-top:10px"><input type="checkbox"> Marketplace tips</label>
        <hr class="divider">
        <h3 class="card-title">Security</h3>
        <p class="text-muted" style="font-size:var(--fs-sm)">Password and two-step verification are managed by the Agro Connect account service.</p>
        <div class="btn-group"><a class="btn btn-outline btn-sm" href="${B}/pages/forgot-password.html">Change password</a>
          <button class="btn btn-ghost btn-sm" type="button">Sign out of all devices</button></div>
      </div>
    </div>`;
  el("#account-form", main).addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    setBusy(btn, true, "Saving…");
    setTimeout(() => { setBusy(btn, false); showToast("Saved once the server confirms the change.", "info"); }, 500);
  });
}

export { el, els, demoBanner, showError, showToast, statusBadge, emptyState, escapeHtml, formatCurrency, formatNumber, formatDate, initials, lineChart, barChart, donutChart, legend, fetchInventory, inventoryMarkup, fetchOrders, fetchMyCrops };
