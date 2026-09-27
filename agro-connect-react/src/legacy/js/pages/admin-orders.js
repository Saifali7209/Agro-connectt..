/** Admin console — order oversight. */
import { pageHead, statCards, tableCard, el, demoBanner, showError, statusBadge, escapeHtml, formatNumber, formatCurrency, formatDate, fetchOrders } from "./_builders.js";

export const meta = { title: "Orders", navKey: "orders" };

export async function render(main) {
  main.innerHTML = pageHead("Orders", "Every transaction between farmers and buyers.")
    + `<div id="host"><div class="skeleton" style="height:320px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#host", main);
  try {
    const { data: orders, demo } = await fetchOrders();
    const value = orders.reduce((a, o) => a + o.price * o.quantity + o.delivery_fee, 0);
    host.innerHTML = (demo ? demoBanner("Sample orders for layout review.") : "")
      + statCards([
        { label: "Orders", value: formatNumber(orders.length) },
        { label: "Completed", value: formatNumber(orders.filter((o) => o.status === "Completed").length) },
        { label: "In progress", value: formatNumber(orders.filter((o) => o.status !== "Completed" && o.status !== "Cancelled").length) },
        { label: "Order value", value: formatCurrency(value) },
      ])
      + `<div style="margin-top:var(--sp-5)">${tableCard("All orders", ["Order", "Crop", "Farmer", "Buyer", "Quantity", "Total", "Status", "Placed"],
        orders.map((o) => `<tr><td><code>${escapeHtml(o.id)}</code></td>
          <td>${escapeHtml(o.crop)}</td><td>${escapeHtml(o.farmer?.name || "—")}</td><td>${escapeHtml(o.buyer?.name || "—")}</td>
          <td>${formatNumber(o.quantity)} ${escapeHtml(o.unit)}</td>
          <td>${formatCurrency(o.price * o.quantity + o.delivery_fee)}</td>
          <td>${statusBadge(o.status)}</td><td>${formatDate(o.placed_at, "short")}</td></tr>`).join(""))}</div>`;
  } catch (error) { showError(host, error); }
}
