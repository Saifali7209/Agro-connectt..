/** AGRO CONNECT — marketplace controller shared by the public and buyer catalogues. */
import { fetchCrops, applyFilters, sortCrops, cropCard } from "./crops.js";
import { CROP_CATEGORIES, STATES, QUALITY_GRADES } from "../data/demo-data.js";
import { el, els, skeletonGrid, emptyState, showError, demoBanner, showToast } from "./ui.js";
import { debounce, paginate, escapeHtml, queryParams } from "./utils.js";
import { APP_CONFIG } from "./config.js";

export function filterPanelMarkup(initial = {}) {
  return `<form class="card filters" id="filter-form" aria-label="Crop filters">
    <div class="filter-group">
      <h4>Category</h4>
      <div class="field"><label class="sr-only" for="f-category">Category</label>
        <select id="f-category" name="category"><option value="">All categories</option>
          ${CROP_CATEGORIES.map((c) => `<option${initial.category === c ? " selected" : ""}>${c}</option>`).join("")}</select></div>
    </div>
    <div class="filter-group">
      <h4>Location</h4>
      <div class="field"><label class="sr-only" for="f-state">State</label>
        <select id="f-state" name="state"><option value="">All states</option>
          ${STATES.map((s) => `<option${initial.state === s ? " selected" : ""}>${s}</option>`).join("")}</select></div>
    </div>
    <div class="filter-group">
      <h4>Price range (₹)</h4>
      <div class="row">
        <div class="field" style="flex:1;margin:0"><label class="sr-only" for="f-min">Minimum price</label>
          <input id="f-min" name="minPrice" type="number" min="0" inputmode="numeric" placeholder="Min"></div>
        <div class="field" style="flex:1;margin:0"><label class="sr-only" for="f-max">Maximum price</label>
          <input id="f-max" name="maxPrice" type="number" min="0" inputmode="numeric" placeholder="Max"></div>
      </div>
    </div>
    <div class="filter-group">
      <h4>Minimum quantity</h4>
      <div class="field" style="margin:0"><label class="sr-only" for="f-qty">Minimum available quantity</label>
        <input id="f-qty" name="minQty" type="number" min="0" inputmode="numeric" placeholder="e.g. 500"></div>
    </div>
    <div class="filter-group">
      <h4>Quality</h4>
      <div class="field" style="margin:0"><label class="sr-only" for="f-grade">Quality grade</label>
        <select id="f-grade" name="grade"><option value="">Any grade</option>
          ${QUALITY_GRADES.map((g) => `<option>${g}</option>`).join("")}</select></div>
    </div>
    <div class="filter-group">
      <h4>Harvested after</h4>
      <div class="field" style="margin:0"><label class="sr-only" for="f-harvest">Harvest date from</label>
        <input id="f-harvest" name="harvestFrom" type="date"></div>
    </div>
    <div class="filter-group">
      <h4>Preferences</h4>
      <label class="checkline"><input type="checkbox" name="organic" value="1"> Organic only</label>
      <label class="checkline" style="margin-top:8px"><input type="checkbox" name="verified" value="1"> Verified farmers only</label>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary btn-block" type="submit">Apply filters</button>
      <button class="btn btn-ghost btn-block" type="reset">Clear all</button>
    </div>
  </form>`;
}

export function toolbarMarkup() {
  return `<div class="card card-tight">
    <form class="search-bar" id="search-form" role="search">
      <label class="sr-only" for="q">Search crops, varieties or farmers</label>
      <input id="q" name="q" type="search" placeholder="Search crops, varieties, farmers or districts" autocomplete="off">
      <label class="sr-only" for="sort">Sort results</label>
      <select id="sort" name="sort" style="max-width:200px">
        <option value="recent">Recently updated</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="qty-desc">Largest quantity</option>
      </select>
      <button class="btn btn-primary" type="submit">Search</button>
    </form>
    <p class="text-muted" id="result-count" style="margin:12px 0 0;font-size:var(--fs-sm)" aria-live="polite"></p>
  </div>`;
}

/** Wires search, filters, pagination and rendering for a results container. */
export function initMarketplace({ root, detailBase }) {
  const results = el("#results", root);
  const countLabel = el("#result-count", root);
  const state = { all: [], filters: { ...queryParams() }, sort: "recent", page: 1, demo: false };

  async function load() {
    results.innerHTML = skeletonGrid(6);
    try {
      const { data, demo } = await fetchCrops(state.filters);
      state.all = Array.isArray(data) ? data : data.items || [];
      state.demo = demo;
      render();
    } catch (error) {
      showError(results, error, { retryId: "retry-market" });
      el("#retry-market", results)?.addEventListener("click", load);
    }
  }

  function render() {
    const filtered = sortCrops(applyFilters(state.all, state.filters), state.sort);
    const page = paginate(filtered, state.page, APP_CONFIG.PAGE_SIZE);
    countLabel.textContent = `${filtered.length} listing${filtered.length === 1 ? "" : "s"} found`;

    if (!filtered.length) {
      results.innerHTML = emptyState({
        title: "No crops match these filters",
        message: "Try widening the price range, clearing the location filter or searching a different crop.",
      });
      return;
    }

    results.innerHTML = `${state.demo ? demoBanner() : ""}
      <div class="crop-grid">${page.items.map((c) => cropCard(c, { detailBase })).join("")}</div>
      ${page.pages > 1 ? `<nav class="pagination" aria-label="Results pages">
        ${Array.from({ length: page.pages }, (_, i) => `<button type="button" data-page="${i + 1}"${i + 1 === page.page ? ' aria-current="page"' : ""}>${i + 1}</button>`).join("")}
      </nav>` : ""}`;

    els("[data-page]", results).forEach((b) => b.addEventListener("click", () => {
      state.page = Number(b.dataset.page);
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }));
    els("[data-save]", results).forEach((b) => b.addEventListener("click", () => {
      b.textContent = "♥";
      showToast("Saved to your list. Sign in to sync it across devices.", "success");
    }));
  }

  const searchForm = el("#search-form", root);
  const input = el("#q", searchForm);
  input.addEventListener("input", debounce(() => {
    state.filters.q = input.value;
    state.page = 1;
    render();
  }));
  el("#sort", searchForm).addEventListener("change", (e) => { state.sort = e.target.value; render(); });
  searchForm.addEventListener("submit", (e) => { e.preventDefault(); state.filters.q = input.value; state.page = 1; render(); });

  const filterForm = el("#filter-form", root);
  filterForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const values = Object.fromEntries(new FormData(filterForm).entries());
    state.filters = { ...state.filters, ...values, organic: !!values.organic, verified: !!values.verified };
    state.page = 1;
    render();
  });
  filterForm.addEventListener("reset", () => {
    setTimeout(() => { state.filters = { q: input.value }; state.page = 1; render(); }, 0);
  });

  load();
  return { reload: load };
}

export function marketplaceLayout({ heading, sub, detailBase }) {
  return `<div class="container section">
    <header class="page-head" style="margin-bottom:var(--sp-5)">
      <div><h1>${escapeHtml(heading)}</h1><p class="text-muted">${escapeHtml(sub)}</p></div>
    </header>
    <div class="market-layout">
      ${filterPanelMarkup()}
      <div class="stack">
        ${toolbarMarkup()}
        <div id="results" aria-live="polite"></div>
      </div>
    </div>
  </div>`;
}
