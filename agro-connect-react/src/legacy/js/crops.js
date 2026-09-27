/** AGRO CONNECT — crop domain logic and shared crop UI fragments. */
import { cropAPI } from "./api.js";
import { loadData } from "./data-source.js";
import { DEMO_CROPS } from "../data/demo-data.js";
import { formatCurrency, formatNumber, formatDate, timeAgo, escapeHtml, initials } from "./utils.js";
import { statusBadge } from "./ui.js";
import { APP_CONFIG } from "./config.js";

const B = APP_CONFIG.BASE_PATH;

export async function fetchCrops(filters = {}) {
  return loadData(() => cropAPI.search(filters), DEMO_CROPS);
}

export async function fetchCrop(id) {
  return loadData(
    () => cropAPI.detail(id),
    DEMO_CROPS.find((c) => c.id === id || (typeof id === "string" && c.name.toLowerCase() === id.toLowerCase())) || DEMO_CROPS[0]
  );
}

export async function fetchMyCrops() {
  return loadData(() => cropAPI.mine(), DEMO_CROPS.slice(0, 5));
}

export function priceChange(crop) {
  if (!crop.previous_price) return { pct: 0, dir: "flat" };
  const pct = ((crop.price - crop.previous_price) / crop.previous_price) * 100;
  return { pct: Math.abs(pct).toFixed(1), dir: pct > 0 ? "up" : pct < 0 ? "down" : "flat" };
}

export function cropUnitLabel(crop) { return `per ${crop.unit}`; }

/** Client-side filtering mirrors the query params the API will accept. */
export function applyFilters(crops, f = {}) {
  const q = (f.q || "").trim().toLowerCase();
  return crops.filter((c) => {
    if (q && ![c.name, c.variety, c.category, c.farmer?.name, c.farmer?.district].join(" ").toLowerCase().includes(q)) return false;
    if (f.category && c.category !== f.category) return false;
    if (f.state && c.farmer?.state !== f.state) return false;
    if (f.grade && c.grade !== f.grade) return false;
    if (f.organic && !c.organic) return false;
    if (f.verified && !c.farmer?.verified) return false;
    if (f.minPrice && c.price < Number(f.minPrice)) return false;
    if (f.maxPrice && c.price > Number(f.maxPrice)) return false;
    if (f.minQty && c.quantity < Number(f.minQty)) return false;
    if (f.harvestFrom && new Date(c.harvest_date) < new Date(f.harvestFrom)) return false;
    return true;
  });
}

export function sortCrops(crops, sort) {
  const list = [...crops];
  switch (sort) {
    case "price-asc": return list.sort((a, b) => a.price - b.price);
    case "price-desc": return list.sort((a, b) => b.price - a.price);
    case "qty-desc": return list.sort((a, b) => b.quantity - a.quantity);
    case "recent":
    default: return list.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
  }
}

export function cropCard(crop, { detailBase = `${B}/pages/crop-details.html` } = {}) {
  const change = priceChange(crop);
  return `<article class="crop-card">
    <div class="crop-media">
      <img src="${escapeHtml(crop.image)}" alt="${escapeHtml(crop.name)} — ${escapeHtml(crop.variety)}" loading="lazy" width="400" height="300">
      <div class="tags">
        ${crop.organic ? '<span class="badge badge-success">Organic</span>' : ""}
        <span class="badge badge-primary">${escapeHtml(crop.grade)}</span>
      </div>
      <button class="save" type="button" data-save="${escapeHtml(crop.id)}" aria-label="Save ${escapeHtml(crop.name)}">♡</button>
    </div>
    <div class="crop-body">
      <h3>${escapeHtml(crop.name)}</h3>
      <p class="crop-variety">${escapeHtml(crop.variety)} · ${escapeHtml(crop.category)}</p>
      <p class="crop-price">${formatCurrency(crop.price)} <small>${cropUnitLabel(crop)}</small>
        ${change.dir !== "flat" ? `<small class="delta ${change.dir}">${change.dir === "up" ? "▲" : "▼"} ${change.pct}%</small>` : ""}</p>
      <div class="crop-meta">
        <span>Available: ${formatNumber(crop.quantity)} ${escapeHtml(crop.unit)} · min ${formatNumber(crop.min_order)} ${escapeHtml(crop.unit)}</span>
        <span>${escapeHtml(crop.farmer.district)}, ${escapeHtml(crop.farmer.state)}</span>
        <span>Updated ${timeAgo(crop.updated_at)}</span>
      </div>
      <div class="crop-farmer">
        <span class="avatar" aria-hidden="true">${initials(crop.farmer.name)}</span>
        <span style="font-size:var(--fs-xs)"><strong>${escapeHtml(crop.farmer.name)}</strong><br>
          ${crop.farmer.verified ? '<span class="badge badge-success">Verified farmer</span>' : '<span class="badge">Verification pending</span>'}</span>
      </div>
    </div>
    <div class="crop-actions">
      <a class="btn btn-outline btn-sm" href="${detailBase}?id=${encodeURIComponent(crop.id)}">View</a>
      <a class="btn btn-primary btn-sm" href="${B}/buyer/checkout.html?id=${encodeURIComponent(crop.id)}">Book</a>
    </div>
  </article>`;
}

export function cropRow(crop) {
  return `<tr>
    <td><strong>${escapeHtml(crop.name)}</strong><br><span class="text-muted" style="font-size:var(--fs-xs)">${escapeHtml(crop.variety)}</span></td>
    <td>${formatNumber(crop.quantity)} ${escapeHtml(crop.unit)}</td>
    <td>${formatCurrency(crop.price)} <span class="text-muted">/${escapeHtml(crop.unit)}</span></td>
    <td>${statusBadge(crop.status)}</td>
    <td>${formatDate(crop.updated_at, "short")}</td>
    <td>${crop.orders}</td>
    <td>
      <div class="btn-group">
        <a class="btn btn-sm btn-outline" href="${B}/pages/crop-details.html?id=${encodeURIComponent(crop.id)}">View</a>
        <button class="btn btn-sm btn-outline" data-action="price" data-id="${escapeHtml(crop.id)}">Update price</button>
        <button class="btn btn-sm btn-ghost" data-action="pause" data-id="${escapeHtml(crop.id)}">${crop.status === "paused" ? "Resume" : "Pause"}</button>
        <button class="btn btn-sm btn-danger" data-action="delete" data-id="${escapeHtml(crop.id)}">Delete</button>
      </div>
    </td>
  </tr>`;
}
