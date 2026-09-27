/** Farmer console — market rates, history and the backend price forecast. */
import { pageHead, el, demoBanner, showError, formatCurrency } from "./_builders.js";
import { fetchPriceHistory, fetchRegional, historyChartMarkup, regionalMarkup, renderPrediction } from "../price-intelligence.js";
import { fetchMyCrops } from "../crops.js";
import { escapeHtml } from "../utils.js";

export const meta = { title: "Price Intelligence", navKey: "price-intelligence" };

export async function render(main) {
  main.innerHTML = pageHead("Price intelligence", "Compare market rates, review price history and request the forecast.")
    + `<div id="pi"><div class="skeleton" style="height:380px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#pi", main);
  try {
    const crops = await fetchMyCrops();
    const first = crops.data[0];
    const [history, regional] = await Promise.all([fetchPriceHistory(first.id), fetchRegional({ crop: first.name })]);
    const demo = crops.demo || history.demo || regional.demo;

    host.innerHTML = (demo ? demoBanner("Sample market data for layout review.") : "")
      + `<div class="card"><div class="card-head"><h3 class="card-title">${escapeHtml(first.name)} — ${escapeHtml(first.variety)}</h3>
          <span class="badge badge-info">${formatCurrency(first.price)} per ${escapeHtml(first.unit)}</span></div>
          <p class="text-muted" style="font-size:var(--fs-sm);margin:0">Rates below are collected from mandi feeds by the Agro Connect backend.</p></div>
        <div class="panel-grid" style="margin-top:var(--sp-5)">
          ${historyChartMarkup(history.data)}
          ${regionalMarkup(regional.data)}
        </div>
        <div id="forecast" style="margin-top:var(--sp-5)"></div>`;

    await renderPrediction(el("#forecast", host), { crop: first.name, unit: first.unit, region: first.farmer?.state });
  } catch (error) { showError(host, error); }
}
