/** Crop detail page — gallery, specification, farmer, price history, booking. */
import { fetchCrop, priceChange } from "../crops.js";
import { fetchPriceHistory } from "../price-intelligence.js";
import { el, els, demoBanner, showError, showToast, statusBadge } from "../ui.js";
import { escapeHtml, formatCurrency, formatNumber, formatDate, initials, queryParams, timeAgo } from "../utils.js";
import { lineChart } from "../charts.js";
import { APP_CONFIG } from "../config.js";

export const meta = { title: "Crop details", navKey: "marketplace" };
const B = APP_CONFIG.BASE_PATH;

export async function render(main) {
  const { id } = queryParams();
  main.innerHTML = `<section class="section"><div class="container" id="detail-host">
    <div class="skeleton" style="height:420px;border-radius:var(--radius-lg)"></div></div></section>`;
  const host = el("#detail-host", main);

  let crop, demo = false;
  try {
    const res = await fetchCrop(id);
    crop = res.data; demo = res.demo;
  } catch (error) {
    showError(host, error);
    return;
  }

  const change = priceChange(crop);
  host.innerHTML = `${demo ? demoBanner("This listing is sample content.") : ""}
    <nav aria-label="Breadcrumb" style="margin-bottom:var(--sp-4);font-size:var(--fs-sm)">
      <a href="${B}/pages/marketplace.html">Marketplace</a> <span class="text-muted">/ ${escapeHtml(crop.name)}</span></nav>
    <div class="detail-layout">
      <div class="stack">
        <div>
          <div class="gallery-main"><img id="gallery-main-img" src="${escapeHtml(crop.images[0])}"
            alt="${escapeHtml(crop.name)} — ${escapeHtml(crop.variety)}" width="1024" height="640"></div>
          <div class="gallery-thumbs" role="group" aria-label="Crop photos">
            ${crop.images.map((src, i) => `<button type="button" data-src="${escapeHtml(src)}" aria-current="${String(i === 0)}"
              aria-label="Show photo ${i + 1}"><img src="${escapeHtml(src)}" alt="" loading="lazy"></button>`).join("")}
          </div>
        </div>

        <div class="card">
          <div class="card-head">
            <div><h1 style="margin:0">${escapeHtml(crop.name)}</h1>
              <p class="text-muted" style="margin:4px 0 0">${escapeHtml(crop.variety)} · ${escapeHtml(crop.category)}</p></div>
            <div class="row">${crop.organic ? '<span class="badge badge-success">Organic</span>' : ""}${statusBadge(crop.status)}</div>
          </div>
          <p>${escapeHtml(crop.description)}</p>
          <dl class="kv">
            <dt>Quality grade</dt><dd>${escapeHtml(crop.grade)}</dd>
            <dt>Available quantity</dt><dd>${formatNumber(crop.quantity)} ${escapeHtml(crop.unit)}</dd>
            <dt>Minimum order</dt><dd>${formatNumber(crop.min_order)} ${escapeHtml(crop.unit)}</dd>
            <dt>Harvest date</dt><dd>${formatDate(crop.harvest_date)}</dd>
            <dt>Available from</dt><dd>${formatDate(crop.available_from)}</dd>
            <dt>Delivery options</dt><dd>${crop.delivery.map(escapeHtml).join(", ")}</dd>
            <dt>Last updated</dt><dd>${timeAgo(crop.updated_at)}</dd>
          </dl>
        </div>

        <div class="card">
          <div class="card-head"><h2 class="card-title">Price history</h2>
            <span class="badge ${change.dir === "down" ? "badge-danger" : "badge-success"}">
              ${change.dir === "flat" ? "No change" : `${change.dir === "up" ? "▲" : "▼"} ${change.pct}% vs last rate`}</span></div>
          <div id="price-chart"><div class="skeleton" style="height:200px"></div></div>
        </div>
      </div>

      <div class="buy-box">
        <div class="card">
          <p class="crop-price" style="font-size:var(--fs-3xl)">${formatCurrency(crop.price)}
            <small>per ${escapeHtml(crop.unit)}</small></p>
          <p class="text-muted" style="font-size:var(--fs-sm)">Minimum order ${formatNumber(crop.min_order)} ${escapeHtml(crop.unit)}</p>
          <div class="btn-group" style="margin-top:var(--sp-3)">
            <a class="btn btn-primary btn-block" href="${B}/buyer/checkout.html?id=${encodeURIComponent(crop.id)}">Book Now</a>
            <a class="btn btn-outline btn-block" href="${B}/buyer/messages.html?farmer=${encodeURIComponent(crop.farmer.id)}">Contact Farmer</a>
            <button class="btn btn-ghost btn-block" type="button" id="save-crop">Save Crop</button>
          </div>
        </div>
        <div class="card">
          <h3 class="card-title">Farmer</h3>
          <div class="row" style="margin-top:var(--sp-3)">
            <span class="avatar avatar-lg" aria-hidden="true">${initials(crop.farmer.name)}</span>
            <div><strong>${escapeHtml(crop.farmer.name)}</strong><br>
              ${crop.farmer.verified ? '<span class="badge badge-success">Verified farmer</span>' : '<span class="badge badge-warning">Verification pending</span>'}
              <p class="text-muted" style="margin:6px 0 0;font-size:var(--fs-sm)">
                ${escapeHtml(crop.farmer.village)}, ${escapeHtml(crop.farmer.district)}<br>${escapeHtml(crop.farmer.state)}<br>★ ${crop.farmer.rating}</p></div>
          </div>
          <a class="btn btn-outline btn-block" style="margin-top:var(--sp-3)"
             href="${B}/pages/farmer-profile.html?id=${encodeURIComponent(crop.farmer.id)}">View farmer profile</a>
        </div>
      </div>
    </div>`;

  els(".gallery-thumbs button", host).forEach((b) => b.addEventListener("click", () => {
    el("#gallery-main-img", host).src = b.dataset.src;
    els(".gallery-thumbs button", host).forEach((x) => x.setAttribute("aria-current", String(x === b)));
  }));

  el("#save-crop", host).addEventListener("click", () => showToast("Saved to your list.", "success"));

  try {
    const { data } = await fetchPriceHistory(crop.id);
    el("#price-chart", host).innerHTML = lineChart(data, { height: 200, format: (v) => formatCurrency(v) });
  } catch {
    el("#price-chart", host).innerHTML = `<p class="text-muted">Price history is unavailable right now.</p>`;
  }
}
