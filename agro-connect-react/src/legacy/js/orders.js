/** AGRO CONNECT — order domain logic (totals are display-only; backend is authoritative). */
import { orderAPI } from "./api.js";
import { loadData } from "./data-source.js";
import { DEMO_ORDERS, ORDER_STAGES, DEMO_OFFERS } from "../data/demo-data.js";
import { formatCurrency, formatNumber, formatDate, escapeHtml, timeAgo, store } from "./utils.js";
import { statusBadge } from "./ui.js";
import { APP_CONFIG } from "./config.js";

const B = APP_CONFIG.BASE_PATH;

/** Retrieve local persistent orders merged with demo orders and seeded demo negotiation */
export function getSavedOrders() {
  const saved = store.get("orders", null);
  if (saved && Array.isArray(saved) && saved.length > 0) {
    return saved;
  }
  const initial = DEMO_ORDERS.map((o) => {
    if (o.id === "ORD-24771" && !o.negotiation) {
      return {
        ...o,
        negotiation: {
          has_offer: true,
          status: "Pending",
          original_price: 21,
          offered_price: 18,
          buyer_note: "Regular bulk requirement of 5 MT per week. Looking for ₹18/kg long-term rate.",
          created_at: "2026-09-04T05:00:00Z",
        },
      };
    }
    return { ...o };
  });
  store.set("orders", initial);
  return initial;
}

export function saveOrders(orders) {
  store.set("orders", orders);
}

export function findOrderById(id) {
  const orders = getSavedOrders();
  return orders.find((o) => o.id === id) || null;
}

export function updateOrderNegotiation(orderId, decision) {
  const orders = getSavedOrders();
  const index = orders.findIndex((o) => o.id === orderId);
  if (index === -1) return null;
  const order = { ...orders[index] };
  if (!order.negotiation) return order;

  if (decision === "accept") {
    order.negotiation = {
      ...order.negotiation,
      status: "Accepted",
      reviewed_at: new Date().toISOString(),
    };
    // Update order price to the accepted negotiated price!
    order.price = Number(order.negotiation.offered_price);
    order.status = "Farmer Accepted";
  } else if (decision === "reject") {
    order.negotiation = {
      ...order.negotiation,
      status: "Rejected",
      reviewed_at: new Date().toISOString(),
    };
    // Keep the original listed price
    order.price = Number(order.negotiation.original_price);
    order.status = "Pending";
  }

  orders[index] = order;
  saveOrders(orders);
  return order;
}

export function createNegotiationOrder(crop, formData) {
  const orders = getSavedOrders();
  const quantity = Number(formData.quantity || crop.min_order || 1);
  const offerPrice = formData.offer_price ? Number(formData.offer_price) : null;
  const hasOffer = offerPrice !== null && !isNaN(offerPrice) && offerPrice > 0;
  const isPickup = (formData.delivery_mode || "").toLowerCase().includes("pickup");
  const deliveryFee = isPickup ? 0 : 1200;

  const newOrder = {
    id: `ORD-${Math.floor(25000 + Math.random() * 9000)}`,
    crop: crop.name,
    variety: crop.variety || "Standard",
    crop_id: crop.id,
    quantity,
    unit: crop.unit,
    price: Number(crop.price), // original listed price
    delivery_fee: deliveryFee,
    status: hasOffer ? "Pending" : "Order Placed",
    placed_at: new Date().toISOString(),
    buyer: {
      id: "byr_04",
      name: "FreshKart Retail (Buyer)",
      city: (formData.address || "Mumbai").split("\n")[0].slice(0, 30),
    },
    farmer: crop.farmer ? { id: crop.farmer.id || "frm_08", name: crop.farmer.name } : { id: "frm_08", name: "Sunita Patil" },
    delivery_mode: formData.delivery_mode || "Local transport",
    expected: formData.expected || new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10),
    note: formData.note || "",
    address: formData.address || "",
    negotiation: hasOffer ? {
      has_offer: true,
      status: "Pending",
      original_price: Number(crop.price),
      offered_price: offerPrice,
      buyer_note: formData.offer_note || formData.note || "Price negotiation request submitted from checkout.",
      created_at: new Date().toISOString(),
      reviewed_at: null,
    } : null,
  };

  orders.unshift(newOrder);
  saveOrders(orders);
  return newOrder;
}

export async function fetchOrders(params = {}) {
  const localOrders = getSavedOrders();
  return loadData(() => orderAPI.list(params), localOrders);
}

export async function fetchOffers(orderId) {
  return loadData(() => orderAPI.offers(orderId), DEMO_OFFERS);
}

/**
 * Display-only arithmetic. The backend recalculates and returns authoritative
 * figures on POST /orders — never treat this as a confirmed amount.
 */
export function orderTotals({ price, quantity, deliveryFee = 0 }) {
  const subtotal = Number(price) * Number(quantity);
  return { subtotal, deliveryFee: Number(deliveryFee), total: subtotal + Number(deliveryFee) };
}

export function orderRow(order, { perspective = "farmer" } = {}) {
  const counterpart = perspective === "farmer" ? order.buyer.name : order.farmer.name;
  const { total } = orderTotals({ price: order.price, quantity: order.quantity, deliveryFee: order.delivery_fee });
  let negBadge = "";
  if (order.negotiation) {
    if (order.negotiation.status === "Pending") {
      negBadge = `<br><span class="badge badge-warning" style="font-size:10px;padding:2px 6px;margin-top:3px;display:inline-block">⏳ Offer: ${formatCurrency(order.negotiation.offered_price)}/${escapeHtml(order.unit)} (Pending)</span>`;
    } else if (order.negotiation.status === "Accepted") {
      negBadge = `<br><span class="badge badge-success" style="font-size:10px;padding:2px 6px;margin-top:3px;display:inline-block">✓ Offer Accepted: ${formatCurrency(order.negotiation.offered_price)}/${escapeHtml(order.unit)}</span>`;
    } else if (order.negotiation.status === "Rejected") {
      negBadge = `<br><span class="badge badge-danger" style="font-size:10px;padding:2px 6px;margin-top:3px;display:inline-block">✕ Offer Rejected</span>`;
    }
  }
  return `<tr>
    <td><strong>${escapeHtml(order.id)}</strong><br><span class="text-muted" style="font-size:var(--fs-xs)">${timeAgo(order.placed_at)}</span>${negBadge}</td>
    <td>${escapeHtml(order.crop)}<br><span class="text-muted" style="font-size:var(--fs-xs)">${escapeHtml(order.variety)}</span></td>
    <td>${formatNumber(order.quantity)} ${escapeHtml(order.unit)}</td>
    <td>${escapeHtml(counterpart)}</td>
    <td>${formatCurrency(total)}</td>
    <td>${statusBadge(order.status)}</td>
    <td>${formatDate(order.expected, "short")}</td>
    <td>
      <div style="display:flex;gap:6px;align-items:center;">
        <a class="btn btn-sm btn-outline" href="${B}/${perspective}/order-details.html?id=${encodeURIComponent(order.id)}">Open</a>
        <a class="btn btn-sm btn-primary" href="${B}/${perspective === "farmer" ? "farmer" : "buyer"}/route-optimization.html?id=${encodeURIComponent(order.id)}" title="Optimize Route">Map & Route</a>
      </div>
    </td>
  </tr>`;
}

export function orderTimeline(currentStatus) {
  const index = ORDER_STAGES.findIndex((s) => s.toLowerCase() === String(currentStatus).toLowerCase());
  const cancelled = String(currentStatus).toLowerCase() === "cancelled";
  if (cancelled) {
    return `<ul class="timeline"><li class="done"><div><span class="t-title">Order placed</span></div></li>
      <li class="current"><div><span class="t-title">Cancelled</span><p class="text-muted" style="margin:0;font-size:var(--fs-sm)">This order was cancelled before delivery.</p></div></li></ul>`;
  }
  const active = index === -1 ? 0 : index;
  return `<ul class="timeline">${ORDER_STAGES.map((stage, i) => {
    const cls = i < active ? "done" : i === active ? "current" : "";
    return `<li class="${cls}"><div><span class="t-title">${stage}</span>
      <p class="text-muted" style="margin:0;font-size:var(--fs-sm)">${i <= active ? "Completed" : "Waiting"}</p></div></li>`;
  }).join("")}</ul>`;
}

export function summaryBlock({ price, unit, quantity, deliveryFee, offerPrice = null }) {
  const activePrice = offerPrice && offerPrice > 0 ? Number(offerPrice) : Number(price);
  const isNegotiated = offerPrice && offerPrice > 0 && offerPrice !== Number(price);
  const t = orderTotals({ price: activePrice, quantity, deliveryFee });
  const diff = (Number(price) - activePrice) * Number(quantity);

  return `<div>
    <div class="summary-line"><span>Listed crop price</span><span>${formatCurrency(price)} / ${escapeHtml(unit)}</span></div>
    ${isNegotiated ? `
    <div class="summary-line" style="color:var(--color-primary-dark);font-weight:600;">
      <span>Your offer price</span>
      <span>${formatCurrency(offerPrice)} / ${escapeHtml(unit)} <span class="badge badge-warning" style="font-size:10px;padding:1px 5px">Negotiated</span></span>
    </div>` : ""}
    <div class="summary-line"><span>Quantity</span><span>${formatNumber(quantity)} ${escapeHtml(unit)}</span></div>
    <div class="summary-line"><span>Subtotal</span><span>${formatCurrency(t.subtotal)}</span></div>
    <div class="summary-line"><span>Delivery</span><span>${t.deliveryFee ? formatCurrency(t.deliveryFee) : "Pickup — no charge"}</span></div>
    <div class="summary-line total"><span>${isNegotiated ? "Proposed offer total" : "Estimated total"}</span><span>${formatCurrency(t.total)}</span></div>
    ${isNegotiated && diff > 0 ? `
    <div style="background:var(--color-primary-subtle, #e8f5e9);color:var(--color-primary-dark, #1b5e20);padding:8px 12px;border-radius:var(--radius-sm, 6px);font-size:var(--fs-xs);margin-top:10px;display:flex;justify-content:space-between;align-items:center;">
      <span>🎉 Estimated Savings:</span>
      <strong>${formatCurrency(diff)}</strong>
    </div>` : ""}
    <p class="text-muted" style="font-size:var(--fs-xs);margin-top:8px">
      ${isNegotiated
        ? "Your counter-offer will be sent to the farmer for review before confirmation."
        : "Shown for guidance. The final payable amount is confirmed by Agro Connect when the order is created."}
    </p>
  </div>`;
}

export { ORDER_STAGES };

