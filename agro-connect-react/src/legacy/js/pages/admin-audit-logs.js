/** Admin console — audit trail. */
import { pageHead, el, demoBanner, showError, emptyState } from "./_builders.js";
import { fetchAuditLogs, auditTable } from "../admin.js";

export const meta = { title: "Audit Logs", navKey: "audit-logs" };

export async function render(main) {
  main.innerHTML = pageHead("Audit logs", "Administrative and security events recorded by the platform.")
    + `<div class="filter-bar" style="margin-bottom:var(--sp-4)">
        <input id="log-search" type="search" placeholder="Search actor, action or target" aria-label="Search audit logs">
        <select id="log-result" aria-label="Filter by result"><option value="">All results</option><option>Success</option><option>Failed</option></select>
      </div><div id="host"><div class="skeleton" style="height:300px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#host", main);
  let rows = [], demo = false;

  function draw() {
    const q = (el("#log-search", main).value || "").toLowerCase().trim();
    const result = el("#log-result", main).value;
    const list = rows
      .filter((l) => (result ? l.result === result : true))
      .filter((l) => !q || [l.actor, l.action, l.target].join(" ").toLowerCase().includes(q));
    host.innerHTML = (demo ? demoBanner("Sample audit entries for layout review.") : "")
      + (list.length ? `<div class="card" style="padding:0;overflow:hidden">${auditTable(list)}</div>`
        : emptyState({ title: "No entries", message: "No audit events match this filter." }));
  }

  el("#log-search", main).addEventListener("input", () => rows.length && draw());
  el("#log-result", main).addEventListener("change", () => rows.length && draw());

  try { const r = await fetchAuditLogs(); rows = r.data; demo = r.demo; draw(); }
  catch (error) { showError(host, error); }
}
