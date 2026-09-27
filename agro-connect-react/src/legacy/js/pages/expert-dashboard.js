/** Expert console — review workload overview. */
import { pageHead, statCards, tableCard, el, demoBanner, showError, formatNumber, B } from "./_builders.js";
import { fetchQueue, caseRow } from "../expert-review.js";

export const meta = { title: "Expert Dashboard", navKey: "dashboard" };

export async function render(main) {
  main.innerHTML = pageHead("Dashboard", "Cases waiting for your agronomy review.",
    `<a class="btn btn-primary" href="${B}/expert/pending-reviews.html">Open queue</a>`)
    + `<div id="dash"><div class="skeleton" style="height:340px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#dash", main);
  try {
    const { data, demo } = await fetchQueue();
    const pending = data.filter((c) => c.status === "Pending");
    const lowConf = data.filter((c) => c.confidence < 0.6);
    host.innerHTML = (demo ? demoBanner("Sample review queue for layout review.") : "")
      + statCards([
        { label: "Pending reviews", value: formatNumber(pending.length) },
        { label: "Low confidence", value: formatNumber(lowConf.length) },
        { label: "Reviewed this week", value: formatNumber(data.length - pending.length) },
        { label: "Crops covered", value: formatNumber(new Set(data.map((c) => c.crop)).size) },
      ])
      + `<div style="margin-top:var(--sp-5)">${tableCard("Queue", ["Case","Crop","Farmer","AI suggestion","Confidence","Severity","Status","Submitted",""], data.map(caseRow).join(""))}</div>`;
  } catch (error) { showError(host, error); }
}
