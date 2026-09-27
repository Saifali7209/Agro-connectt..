/** Public farmer profile. */
import { userAPI } from "../api.js";
import { loadData } from "../data-source.js";
import { DEMO_FARMERS, DEMO_CROPS, DEMO_REVIEWS } from "../../data/demo-data.js";
import { cropCard } from "../crops.js";
import { el, demoBanner, showError, statusBadge } from "../ui.js";
import { escapeHtml, initials, formatDate, queryParams } from "../utils.js";
import { APP_CONFIG } from "../config.js";

export const meta = { title: "Farmer profile", navKey: "farmers" };
const B = APP_CONFIG.BASE_PATH;

export async function render(main) {
  const { id } = queryParams();
  main.innerHTML = `<section class="section"><div class="container" id="profile-host">
    <div class="skeleton" style="height:280px;border-radius:var(--radius-lg)"></div></div></section>`;
  const host = el("#profile-host", main);

  let farmer, demo = false;
  try {
    const res = await loadData(() => userAPI.farmer(id), DEMO_FARMERS.find((f) => f.id === id) || DEMO_FARMERS[0]);
    farmer = res.data; demo = res.demo;
  } catch (error) { showError(host, error); return; }

  const listings = DEMO_CROPS.filter((c) => c.farmer.id === farmer.id);
  const reviews = DEMO_REVIEWS.filter((r) => r.farmer === farmer.name);

  host.innerHTML = `${demo ? demoBanner("Sample farmer profile.") : ""}
    <div class="card">
      <div class="row" style="gap:var(--sp-5);align-items:flex-start">
        <span class="avatar avatar-lg" aria-hidden="true">${initials(farmer.name)}</span>
        <div style="flex:1">
          <div class="row-between"><h1 style="margin:0">${escapeHtml(farmer.name)}</h1>${statusBadge(farmer.verification)}</div>
          <p class="text-muted" style="margin:6px 0">${escapeHtml(farmer.village)}, ${escapeHtml(farmer.district)}, ${escapeHtml(farmer.state)} — ${escapeHtml(farmer.pincode)}</p>
          <p class="text-muted" style="margin:0;font-size:var(--fs-sm)">On Agro Connect since ${formatDate(farmer.since)} · ★ ${farmer.rating} from ${farmer.reviews} reviews</p>
          <div class="btn-group" style="margin-top:var(--sp-4)">
            <a class="btn btn-primary" href="${B}/buyer/messages.html?farmer=${encodeURIComponent(farmer.id)}">Contact farmer</a>
            <a class="btn btn-outline" href="${B}/pages/marketplace.html?q=${encodeURIComponent(farmer.name)}">See all listings</a>
          </div>
        </div>
      </div>
      <hr class="divider">
      <dl class="kv">
        <dt>Farm size</dt><dd>${escapeHtml(farmer.farm_size)}</dd>
        <dt>Farming type</dt><dd>${escapeHtml(farmer.farming_type)}</dd>
        <dt>Main crops</dt><dd>${(farmer.main_crops || []).map(escapeHtml).join(", ")}</dd>
        <dt>Active listings</dt><dd>${farmer.listings}</dd>
      </dl>
    </div>

    <h2 style="margin-top:var(--sp-6)">Current listings</h2>
    ${listings.length ? `<div class="crop-grid">${listings.map((c) => cropCard(c)).join("")}</div>`
      : `<div class="state"><h3>No active listings</h3><p>This farmer has nothing published right now.</p></div>`}

    <h2 style="margin-top:var(--sp-6)">Buyer reviews</h2>
    ${reviews.length ? `<div class="grid grid-2">${reviews.map((r) => `<article class="card">
        <div class="row-between"><strong>${escapeHtml(r.buyer)}</strong><span class="badge badge-success">★ ${r.rating}</span></div>
        <p class="text-muted" style="margin:8px 0 0">${escapeHtml(r.text)}</p>
        <small class="text-muted">${formatDate(r.at)}</small></article>`).join("")}</div>`
      : `<div class="state"><h3>No reviews yet</h3><p>Reviews appear after a completed order.</p></div>`}`;
}
