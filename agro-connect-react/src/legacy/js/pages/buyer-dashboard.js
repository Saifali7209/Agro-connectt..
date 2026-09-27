/** Buyer console — purchasing overview. */
import { pageHead, statCards, chartCard, tableCard, el, demoBanner, showError,
  formatCurrency, formatNumber, lineChart, fetchOrders, B } from "./_builders.js";
import { DEMO_SALES_SERIES } from "../../data/demo-data.js";
import { fetchCrops, cropCard } from "../crops.js";
import { orderRow } from "../orders.js";

export const meta = { title: "Buyer Dashboard", navKey: "dashboard" };

export async function render(main) {
  main.innerHTML = pageHead("Dashboard", "Your purchases, spending and fresh listings.",
    `<a class="btn btn-primary" href="${B}/buyer/find-crops.html">Find crops</a>`)
    + `<div id="dash"><div class="skeleton" style="height:420px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#dash", main);
  try {
    const [orders, crops] = await Promise.all([fetchOrders(), fetchCrops()]);
    const demo = orders.demo || crops.demo;
    const spend = orders.data.reduce((s, o) => s + o.price * o.quantity + o.delivery_fee, 0);
    const active = orders.data.filter((o) => o.status !== "Completed" && o.status !== "Cancelled").length;

    host.innerHTML = (demo ? demoBanner("Sample figures shown while the Agro Connect API is unavailable.") : "")
      + statCards([
        { label: "Orders placed", value: formatNumber(orders.data.length) },
        { label: "In progress", value: formatNumber(active) },
        { label: "Total spend", value: formatCurrency(spend) },
        { label: "Suppliers", value: formatNumber(new Set(orders.data.map((o) => o.farmer.name)).size) },
      ])
      + `<div style="margin-top:var(--sp-5)">${chartCard("Monthly spend", lineChart(DEMO_SALES_SERIES, { format: (v) => formatCurrency(v) }))}</div>
        <div style="margin-top:var(--sp-5)">
          ${tableCard("Recent orders", ["Order", "Crop", "Quantity", "Farmer", "Total", "Status", "Expected", ""],
            orders.data.slice(0, 5).map((o) => orderRow(o, { perspective: "buyer" })).join(""),
            `<a class="btn btn-outline btn-sm" href="${B}/buyer/orders.html">All orders</a>`)}
        </div>
        <h3 class="card-title" style="margin-top:var(--sp-5)">Fresh listings for you</h3>
        <div class="crop-grid">${crops.data.slice(0, 3).map((c) => cropCard(c, { detailBase: `${B}/buyer/crop-details.html` })).join("")}</div>`;
  } catch (error) { showError(host, error); }
}
