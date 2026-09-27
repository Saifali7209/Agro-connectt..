/** Buyer console — payment records. Values come from the backend only. */
import { pageHead, tableCard, el, showError, formatCurrency, formatDate, escapeHtml, statusBadge, emptyState } from "./_builders.js";
import { api } from "../api.js";

export const meta = { title: "Payments", navKey: "payments" };

export async function render(main) {
  main.innerHTML = pageHead("Payments", "Receipts and settlement status recorded by the Agro Connect payment service.")
    + `<div id="pay"><div class="skeleton" style="height:240px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#pay", main);
  try {
    const rows = await api.get("/payments");
    host.innerHTML = rows?.length
      ? tableCard("Transactions", ["Reference", "Order", "Amount", "Method", "Status", "Date"],
          rows.map((p) => `<tr><td><code>${escapeHtml(p.reference)}</code></td><td>${escapeHtml(p.order_id)}</td>
            <td>${formatCurrency(p.amount)}</td><td>${escapeHtml(p.method)}</td>
            <td>${statusBadge(p.status)}</td><td>${formatDate(p.created_at)}</td></tr>`).join(""))
      : emptyState({ title: "No payments yet", message: "Completed payments appear here with their receipt reference." });
  } catch {
    host.innerHTML = `<div class="state error"><h3>Payment records are unavailable</h3>
      <p>The payment service did not respond. Payment amounts are never shown from sample data.</p></div>`;
  }
}
