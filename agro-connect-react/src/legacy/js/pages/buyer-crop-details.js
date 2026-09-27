/** Buyer console — crop detail with order action. */
import { pageHead, el, showError, escapeHtml, formatCurrency, formatNumber, demoBanner, statusBadge, B } from "./_builders.js";
import { fetchCrop } from "../crops.js";
import { queryParams } from "../utils.js";

export const meta = { title: "Crop details", navKey: "find-crops" };

export async function render(main) {
  const { id } = queryParams();
  main.innerHTML = pageHead("Crop details", "Review the listing before placing an order.");
  const host = document.createElement("div");
  main.append(host);
  try {
    const { data: crop, demo } = await fetchCrop(id);
    host.innerHTML = (demo ? demoBanner("Sample listing for layout review.") : "")
      + `<div class="panel-grid">
        <div class="card"><img src="${escapeHtml(crop.image)}" alt="${escapeHtml(crop.name)}" style="width:100%;border-radius:var(--radius-md)">
          <h3 class="card-title" style="margin-top:var(--sp-4)">${escapeHtml(crop.name)} — ${escapeHtml(crop.variety)}</h3>
          <p class="text-muted">${escapeHtml(crop.description)}</p></div>
        <div class="card">
          <div class="card-head"><h3 class="card-title">${formatCurrency(crop.price)} per ${escapeHtml(crop.unit)}</h3>${statusBadge(crop.status)}</div>
          <dl class="kv">
            <dt>Available</dt><dd>${formatNumber(crop.quantity)} ${escapeHtml(crop.unit)}</dd>
            <dt>Minimum order</dt><dd>${formatNumber(crop.min_order)} ${escapeHtml(crop.unit)}</dd>
            <dt>Grade</dt><dd>${escapeHtml(crop.grade)}</dd>
            <dt>Delivery</dt><dd>${crop.delivery.map(escapeHtml).join(", ")}</dd>
            <dt>Farmer</dt><dd>${escapeHtml(crop.farmer.name)}${crop.farmer.verified ? " ✓" : ""}</dd>
            <dt>Location</dt><dd>${escapeHtml(crop.farmer.district)}, ${escapeHtml(crop.farmer.state)}</dd>
          </dl>
          <div class="btn-group" style="margin-top:var(--sp-4)">
            <a class="btn btn-primary" href="${B}/buyer/checkout.html?id=${encodeURIComponent(crop.id)}">Place order</a>
            <a class="btn btn-outline" href="${B}/buyer/messages.html">Message farmer</a>
          </div>
        </div>
      </div>`;
  } catch (error) { showError(host, error); }
}
