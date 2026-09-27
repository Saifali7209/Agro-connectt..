/** Farmer directory with comparison. */
import { userAPI } from "../api.js";
import { loadData } from "../data-source.js";
import { DEMO_FARMERS } from "../../data/demo-data.js";
import { el, els, demoBanner, showError, skeletonGrid, statusBadge } from "../ui.js";
import { escapeHtml, initials, debounce } from "../utils.js";
import { APP_CONFIG } from "../config.js";

export const meta = { title: "Farmers", navKey: "farmers" };
const B = APP_CONFIG.BASE_PATH;

export async function render(main) {
  main.innerHTML = `<section class="section"><div class="container">
    <header class="page-head" style="margin-bottom:var(--sp-5)">
      <div><p class="eyebrow">Directory</p><h1>Farmers on Agro Connect</h1>
        <p class="text-muted">Compare growers by location, farming type, rating and verification.</p></div>
    </header>
    <div class="card card-tight" style="margin-bottom:var(--sp-4)">
      <form class="search-bar" id="farmer-search" role="search">
        <label class="sr-only" for="fq">Search farmers</label>
        <input id="fq" type="search" placeholder="Search by name, district, state or crop">
        <label class="sr-only" for="fverified">Verification</label>
        <select id="fverified" style="max-width:220px"><option value="">All farmers</option>
          <option value="Verified">Verified only</option><option value="Pending">Verification pending</option></select>
      </form>
    </div>
    <div id="farmer-list">${skeletonGrid(4, "grid grid-2")}</div>
  </div></section>`;

  const host = el("#farmer-list", main);
  let farmers = [], demo = false;
  try {
    const res = await loadData(() => userAPI.farmers(), DEMO_FARMERS);
    farmers = res.data; demo = res.demo;
  } catch (error) {
    showError(host, error);
    return;
  }

  function draw(filterText = "", verification = "") {
    const q = filterText.toLowerCase();
    const list = farmers.filter((f) =>
      (!q || [f.name, f.district, f.state, f.village, ...(f.main_crops || [])].join(" ").toLowerCase().includes(q)) &&
      (!verification || f.verification === verification));

    host.innerHTML = `${demo ? demoBanner("Sample farmer profiles for layout review.") : ""}
      ${list.length ? `<div class="grid grid-2">${list.map((f) => `<article class="card farmer-card">
        <span class="avatar avatar-lg" aria-hidden="true">${initials(f.name)}</span>
        <div style="flex:1">
          <div class="row-between"><h3 style="margin:0">${escapeHtml(f.name)}</h3>${statusBadge(f.verification)}</div>
          <p class="text-muted" style="margin:4px 0;font-size:var(--fs-sm)">${escapeHtml(f.village)}, ${escapeHtml(f.district)}, ${escapeHtml(f.state)}</p>
          <dl class="kv" style="margin:var(--sp-3) 0">
            <dt>Farm size</dt><dd>${escapeHtml(f.farm_size)}</dd>
            <dt>Farming type</dt><dd>${escapeHtml(f.farming_type)}</dd>
            <dt>Main crops</dt><dd>${(f.main_crops || []).map(escapeHtml).join(", ")}</dd>
            <dt>Rating</dt><dd>★ ${f.rating} (${f.reviews} reviews)</dd>
            <dt>Active listings</dt><dd>${f.listings}</dd>
          </dl>
          <div class="btn-group">
            <a class="btn btn-sm btn-primary" href="${B}/pages/farmer-profile.html?id=${encodeURIComponent(f.id)}">View profile</a>
            <a class="btn btn-sm btn-outline" href="${B}/pages/marketplace.html?state=${encodeURIComponent(f.state)}">See listings</a>
          </div>
        </div></article>`).join("")}</div>`
        : `<div class="state"><h3>No farmers match this search</h3><p>Try another district or clear the filters.</p></div>`}`;
  }

  draw();
  const input = el("#fq", main);
  const select = el("#fverified", main);
  input.addEventListener("input", debounce(() => draw(input.value, select.value)));
  select.addEventListener("change", () => draw(input.value, select.value));
  el("#farmer-search", main).addEventListener("submit", (e) => e.preventDefault());
}
