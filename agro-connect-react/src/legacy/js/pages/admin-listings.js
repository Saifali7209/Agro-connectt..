/** Admin console — moderation view of marketplace listings. */
import { pageHead, tableCard, el, els, demoBanner, showError, showToast, statusBadge, escapeHtml, formatNumber, formatCurrency, formatDate, fetchMyCrops } from "./_builders.js";

export const meta = { title: "Listings", navKey: "listings" };

export async function render(main) {
  main.innerHTML = pageHead("Listings", "Published crop listings available for moderation.")
    + `<div id="host"><div class="skeleton" style="height:320px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#host", main);
  try {
    const { data: crops, demo } = await fetchMyCrops();
    host.innerHTML = (demo ? demoBanner("Sample listings for layout review.") : "")
      + tableCard("All listings", ["Listing", "Farmer", "Quantity", "Rate", "Status", "Updated", "Actions"],
        crops.map((c) => `<tr>
          <td><strong>${escapeHtml(c.name)}</strong><br><span class="text-muted" style="font-size:var(--fs-xs)">${escapeHtml(c.variety)}</span></td>
          <td>${escapeHtml(c.farmer?.name || "—")}<br><span class="text-muted" style="font-size:var(--fs-xs)">${escapeHtml(c.farmer?.state || "")}</span></td>
          <td>${formatNumber(c.quantity)} ${escapeHtml(c.unit)}</td>
          <td>${formatCurrency(c.price)}</td>
          <td>${statusBadge(c.status)}</td>
          <td>${formatDate(c.updated_at, "short")}</td>
          <td><div class="btn-group">
            <button class="btn btn-sm btn-outline" data-action="flag" data-id="${escapeHtml(c.id)}">Flag</button>
            <button class="btn btn-sm btn-ghost" data-action="unlist" data-id="${escapeHtml(c.id)}">Unlist</button>
          </div></td></tr>`).join(""));
    els("[data-action]", host).forEach((b) => b.addEventListener("click", () => {
      showToast(`Listing ${b.dataset.id} will be ${b.dataset.action === "flag" ? "flagged for review" : "unlisted"} once the server confirms it.`, "info");
    }));
  } catch (error) { showError(host, error); }
}
