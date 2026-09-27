/** Admin console — platform overview. */
import { pageHead, statCards, chartCard, tableCard, el, demoBanner, showError, formatNumber, formatCurrency, lineChart, donutChart, legend, B } from "./_builders.js";
import { fetchStats, fetchAuditLogs, auditTable } from "../admin.js";

export const meta = { title: "Admin Dashboard", navKey: "dashboard" };

export async function render(main) {
  main.innerHTML = pageHead("Platform overview", "Users, listings, orders and AI activity across Agro Connect.",
    `<a class="btn btn-outline" href="${B}/admin/reports.html">Reports</a>
     <a class="btn btn-primary" href="${B}/admin/ai-analytics.html">AI analytics</a>`)
    + `<div id="dash"><div class="skeleton" style="height:360px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#dash", main);
  try {
    const [{ data: s, demo }, logs] = await Promise.all([fetchStats(), fetchAuditLogs()]);
    host.innerHTML = (demo ? demoBanner("Sample platform metrics for layout review.") : "")
      + statCards([
        { label: "Total users", value: formatNumber(s.users) },
        { label: "Active listings", value: formatNumber(s.listings) },
        { label: "Orders", value: formatNumber(s.orders) },
        { label: "AI analyses", value: formatNumber(s.ai_analyses) },
        { label: "Gross merchandise value", value: formatCurrency(s.gmv) },
        { label: "Experts on panel", value: formatNumber(s.experts) },
      ])
      + `<div class="grid-2" style="margin-top:var(--sp-5)">
          ${chartCard("Monthly sign-ups", lineChart(s.signups, { format: (v) => formatNumber(v) }))}
          ${chartCard("Accounts by role", donutChart(s.role_split) + legend(s.role_split))}
        </div>
        <div class="card" style="margin-top:var(--sp-5)"><h3 class="card-title">Recent activity</h3>${auditTable(logs.data)}</div>`;
  } catch (error) { showError(host, error); }
}
