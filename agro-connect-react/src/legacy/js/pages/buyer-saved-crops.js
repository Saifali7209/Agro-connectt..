/** Buyer console — saved listings. */
import { pageHead, el, demoBanner, showError, emptyState, B } from "./_builders.js";
import { cropCard } from "../crops.js";
import { cropAPI } from "../api.js";
import { loadData } from "../data-source.js";
import { DEMO_CROPS } from "../../data/demo-data.js";

export const meta = { title: "Saved Crops", navKey: "saved-crops" };

export async function render(main) {
  main.innerHTML = pageHead("Saved crops", "Listings you shortlisted while browsing the marketplace.")
    + `<div id="saved"><div class="skeleton" style="height:280px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#saved", main);
  try {
    const { data, demo } = await loadData(() => cropAPI.saved(), DEMO_CROPS.slice(0, 3));
    host.innerHTML = (demo ? demoBanner("Sample saved listings for layout review.") : "")
      + (data.length
        ? `<div class="crop-grid">${data.map((c) => cropCard(c, { detailBase: `${B}/buyer/crop-details.html` })).join("")}</div>`
        : emptyState({ title: "Nothing saved yet", message: "Tap the heart on a listing to keep it here.", action: { href: `${B}/buyer/find-crops.html`, label: "Find crops" } }));
  } catch (error) { showError(host, error); }
}
