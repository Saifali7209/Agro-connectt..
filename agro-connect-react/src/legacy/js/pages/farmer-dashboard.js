/** Farmer console — overview of sales, orders, inventory and crop alerts. */
import {
  pageHead, statCards, chartCard, tableCard, el, demoBanner, showError,
  formatCurrency, formatNumber, lineChart, barChart, fetchInventory, inventoryMarkup,
  fetchOrders, fetchMyCrops, B,
} from "./_builders.js";
import { DEMO_SALES_SERIES, DEMO_ORDER_SERIES } from "../../data/demo-data.js";
import { orderRow } from "../orders.js";
import { icon } from "../navigation.js";

export const meta = { title: "Farmer Dashboard", navKey: "dashboard" };

export async function render(main) {
  main.innerHTML = pageHead("Dashboard", "Your sales, orders and listings at a glance.",
    `<a class="btn btn-primary" href="${B}/farmer/add-crop.html">Add crop</a>
     <a class="btn btn-outline" href="${B}/pages/ai-crop-doctor.html">${icon.robot || ""} AI Crop Doctor</a>
     <a class="btn btn-outline" href="${B}/farmer/demand-forecasting.html">${icon.trendingUp || ""} Demand Forecasting</a>
     <a class="btn btn-outline" href="${B}/farmer/route-optimization.html">${icon.mapPin || ""} Route Optimization</a>`)
    + `<div id="dash"><div class="skeleton" style="height:420px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#dash", main);
  try {
    const [crops, orders, inventory] = await Promise.all([fetchMyCrops(), fetchOrders(), fetchInventory()]);
    const demo = crops.demo || orders.demo || inventory.demo;
    const active = crops.data.filter((c) => c.status === "active").length;
    const pending = orders.data.filter((o) => o.status === "Pending").length;
    const revenue = orders.data.reduce((s, o) => s + o.price * o.quantity, 0);

    host.innerHTML = (demo ? demoBanner("Sample figures shown while the Agro Connect API is unavailable.") : "")
      + statCards([
        { label: "Active listings", value: formatNumber(active) },
        { label: "Orders this month", value: formatNumber(orders.data.length), delta: "+18%", dir: "up" },
        { label: "Pending action", value: formatNumber(pending) },
        { label: "Order value", value: formatCurrency(revenue) },
      ])
      + `<div class="panel-grid" style="margin-top:var(--sp-5)">
          ${chartCard("Sales trend", lineChart(DEMO_SALES_SERIES, { format: (v) => formatCurrency(v) }), "Monthly value of completed orders.")}
          ${chartCard("Orders received", barChart(DEMO_ORDER_SERIES))}
        </div>
        <div class="panel-grid" style="margin-top:var(--sp-5)">
          ${inventoryMarkup(inventory.data)}
          ${tableCard("Latest orders", ["Order", "Crop", "Quantity", "Buyer", "Total", "Status", "Expected", ""],
            orders.data.slice(0, 5).map((o) => orderRow(o, { perspective: "farmer" })).join(""),
            `<a class="btn btn-outline btn-sm" href="${B}/farmer/orders.html">All orders</a>`)}
        </div>`;
  } catch (error) { showError(host, error); }
}
