/** Admin console — exportable platform reports. */
import { pageHead, statCards, chartCard, el, els, demoBanner, showError, showToast, formatNumber, formatCurrency, barChart, lineChart } from "./_builders.js";
import { fetchStats } from "../admin.js";

export const meta = { title: "Reports", navKey: "reports" };

const REPORTS = [
  { key: "users", label: "User growth", note: "Sign-ups by role and state for the selected period." },
  { key: "orders", label: "Order settlement", note: "Orders, values and delivery outcomes." },
  { key: "listings", label: "Listing activity", note: "Published, paused and expired listings." },
  { key: "ai", label: "AI usage", note: "Analyses, confidence bands and expert escalations." },
];

export async function render(main) {
  main.innerHTML = pageHead("Reports", "Generate platform reports for a chosen period.",
    `<select id="period" aria-label="Reporting period" class="input-inline">
       <option>Last 30 days</option><option>Last quarter</option><option>Year to date</option></select>`)
    + `<div id="host"><div class="skeleton" style="height:320px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#host", main);
  try {
    const { data: s, demo } = await fetchStats();
    host.innerHTML = (demo ? demoBanner("Sample reporting figures for layout review.") : "")
      + statCards([
        { label: "Users", value: formatNumber(s.users) },
        { label: "Orders", value: formatNumber(s.orders) },
        { label: "Listings", value: formatNumber(s.listings) },
        { label: "Gross merchandise value", value: formatCurrency(s.gmv) },
      ])
      + `<div class="grid-2" style="margin-top:var(--sp-5)">
          ${chartCard("Sign-ups", lineChart(s.signups, { format: (v) => formatNumber(v) }))}
          ${chartCard("Accounts by role", barChart(s.role_split, { format: (v) => formatNumber(v) }))}
        </div>
        <div class="panel-grid" style="margin-top:var(--sp-5)">
          ${REPORTS.map((r) => `<article class="card card-tight"><h3 class="card-title">${r.label}</h3>
            <p class="text-muted" style="font-size:var(--fs-sm)">${r.note}</p>
            <div class="btn-group"><button class="btn btn-sm btn-outline" data-report="${r.key}" data-format="csv">Export CSV</button>
              <button class="btn btn-sm btn-ghost" data-report="${r.key}" data-format="pdf">Export PDF</button></div></article>`).join("")}
        </div>`;
    els("[data-report]", host).forEach((b) => b.addEventListener("click", () =>
      showToast("The report file is produced by the server and downloads once the backend is connected.", "info")));
  } catch (error) { showError(host, error); }
}
