/** Expert console — full pending queue with filters. */
import { pageHead, tableCard, el, els, demoBanner, showError, emptyState } from "./_builders.js";
import { fetchQueue, caseRow } from "../expert-review.js";

export const meta = { title: "Pending Reviews", navKey: "pending-reviews" };

export async function render(main) {
  main.innerHTML = pageHead("Pending reviews", "Farmer cases where the AI asked for expert confirmation.")
    + `<div class="tabs" role="tablist" id="q-tabs" style="margin-bottom:var(--sp-4)">
        ${["All", "Low confidence", "Pending", "Confirmed"].map((t, i) =>
          `<button type="button" role="tab" data-tab="${t}" aria-selected="${String(i === 0)}">${t}</button>`).join("")}</div>
      <div id="queue"><div class="skeleton" style="height:320px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#queue", main);
  let cases = [], demo = false, filter = "All";
  try { const r = await fetchQueue(); cases = r.data; demo = r.demo; }
  catch (error) { showError(host, error); return; }

  function draw() {
    const list = filter === "All" ? cases
      : filter === "Low confidence" ? cases.filter((c) => c.confidence < 0.6)
      : cases.filter((c) => c.status === filter);
    host.innerHTML = (demo ? demoBanner("Sample cases for layout review.") : "")
      + (list.length
        ? tableCard("Cases", ["Case","Crop","Farmer","AI suggestion","Confidence","Severity","Status","Submitted",""], list.map(caseRow).join(""))
        : emptyState({ title: "Nothing in this view", message: "New cases arrive as farmers request expert help." }));
  }
  draw();
  el("#q-tabs", main).addEventListener("click", (e) => {
    const b = e.target.closest("button[data-tab]"); if (!b) return;
    els("#q-tabs button", main).forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    filter = b.dataset.tab; draw();
  });
}
