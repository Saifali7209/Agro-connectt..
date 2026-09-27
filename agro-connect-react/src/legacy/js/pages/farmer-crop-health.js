/** Farmer console — crop health monitoring. */
import { pageHead, el, demoBanner, showError } from "./_builders.js";
import { fetchHealth, healthScoreMarkup, metricsMarkup, historyMarkup } from "../crop-health.js";
import { B } from "./_builders.js";
import { icon } from "../navigation.js";

export const meta = { title: "Crop Health", navKey: "crop-health" };

export async function render(main) {
  main.innerHTML = pageHead("Crop health", "Risk indicators for your registered plots, refreshed by the Agro Connect service.",
    `<a class="btn btn-primary" href="${B}/pages/ai-crop-doctor.html">Analyse a photo (AI Doctor)</a>
     <a class="btn btn-outline" href="${B}/farmer/demand-forecasting.html">${icon.trendingUp || ""} Demand Forecasting</a>`)
    + `<div id="health"><div class="skeleton" style="height:360px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#health", main);
  try {
    const { data, demo } = await fetchHealth();
    host.innerHTML = (demo ? demoBanner("Illustrative values for layout only — not a real crop reading.") : "")
      + healthScoreMarkup(data)
      + `<div style="margin-top:var(--sp-5)">${metricsMarkup(data)}</div>`
      + `<div style="margin-top:var(--sp-5)">${historyMarkup(data)}</div>`;
  } catch (error) { showError(host, error); }
}
