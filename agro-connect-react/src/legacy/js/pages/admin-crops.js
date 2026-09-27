/** Admin console — crop catalogue coverage. */
import { pageHead, tableCard, el, demoBanner, showError, escapeHtml, formatNumber, formatCurrency, fetchMyCrops } from "./_builders.js";
import { CROP_CATEGORIES } from "../../data/demo-data.js";

export const meta = { title: "Crops", navKey: "crops" };

export async function render(main) {
  main.innerHTML = pageHead("Crops", "Crop types traded on the platform and how they are represented in listings.")
    + `<div id="host"><div class="skeleton" style="height:320px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#host", main);
  try {
    const { data: crops, demo } = await fetchMyCrops();
    const byCategory = CROP_CATEGORIES.map((cat) => {
      const rows = crops.filter((c) => c.category === cat);
      const avg = rows.length ? rows.reduce((a, c) => a + c.price, 0) / rows.length : 0;
      return { cat, count: rows.length, qty: rows.reduce((a, c) => a + c.quantity, 0), avg };
    });
    host.innerHTML = (demo ? demoBanner("Sample catalogue figures for layout review.") : "")
      + tableCard("Categories", ["Category", "Listings", "Quantity offered", "Average rate"],
        byCategory.map((r) => `<tr><td><strong>${escapeHtml(r.cat)}</strong></td><td>${formatNumber(r.count)}</td>
          <td>${formatNumber(r.qty)}</td><td>${r.avg ? formatCurrency(Math.round(r.avg)) : "—"}</td></tr>`).join(""));
  } catch (error) { showError(host, error); }
}
