/** AGRO CONNECT — inventory summary used by the farmer console. */
import { inventoryAPI } from "./api.js";
import { loadData } from "./data-source.js";
import { DEMO_INVENTORY } from "../data/demo-data.js";
import { formatNumber, escapeHtml } from "./utils.js";

export async function fetchInventory() {
  return loadData(() => inventoryAPI.summary(), DEMO_INVENTORY);
}

export function inventoryMarkup(rows) {
  return `<div class="card"><h3 class="card-title">Available inventory</h3>
    <div class="table-wrap" style="margin-top:var(--sp-3)"><table class="data">
      <thead><tr><th>Crop</th><th>Available</th><th>Reserved</th><th>Free to sell</th></tr></thead>
      <tbody>${rows.map((r) => `<tr><td>${escapeHtml(r.crop)}</td>
        <td>${formatNumber(r.available)} ${escapeHtml(r.unit)}</td>
        <td>${formatNumber(r.reserved)} ${escapeHtml(r.unit)}</td>
        <td><strong>${formatNumber(r.available - r.reserved)} ${escapeHtml(r.unit)}</strong></td></tr>`).join("")}</tbody>
    </table></div></div>`;
}
