/**
 * AGRO CONNECT — price history, regional comparison and price updates.
 * The predicted price range is produced by a backend ML service only; this module
 * never estimates one locally.
 */
import { cropAPI, priceAPI, aiAPI } from "./api.js";
import { loadData } from "./data-source.js";
import { DEMO_PRICE_HISTORY, DEMO_REGIONAL_PRICES } from "../data/demo-data.js";
import { formatCurrency, escapeHtml } from "./utils.js";
import { lineChart, barChart } from "./charts.js";

export async function fetchPriceHistory(cropId) {
  return loadData(() => cropAPI.priceHistory(cropId), DEMO_PRICE_HISTORY);
}

export async function fetchRegional(params) {
  return loadData(() => priceAPI.regional(params), DEMO_REGIONAL_PRICES);
}

/** Strict: never falls back. PUT /crops/{id}/price */
export function updatePrice(cropId, price, note) {
  return cropAPI.updatePrice(cropId, Number(price), note);
}

export function priceHeaderMarkup({ current, previous, unit }) {
  const diff = previous ? current - previous : 0;
  const pct = previous ? ((diff / previous) * 100).toFixed(1) : "0.0";
  return `<div class="stat-grid">
    <div class="stat"><span class="label">Current price</span><span class="value">${formatCurrency(current)}</span><span class="text-muted" style="font-size:var(--fs-xs)">per ${escapeHtml(unit)}</span></div>
    <div class="stat"><span class="label">Previous price</span><span class="value">${formatCurrency(previous)}</span><span class="text-muted" style="font-size:var(--fs-xs)">last published rate</span></div>
    <div class="stat"><span class="label">Price change</span><span class="value">${diff >= 0 ? "+" : "−"}${formatCurrency(Math.abs(diff))}</span>
      <span class="delta ${diff >= 0 ? "up" : "down"}">${diff >= 0 ? "▲" : "▼"} ${Math.abs(pct)}%</span></div>
  </div>`;
}

export function historyChartMarkup(points) {
  return `<div class="card"><h3 class="card-title">Price history</h3>
    ${lineChart(points, { height: 220, format: (v) => formatCurrency(v) })}</div>`;
}

export function regionalMarkup(rows) {
  return `<div class="card"><h3 class="card-title">Regional prices</h3>
    ${barChart(rows.map((r) => ({ label: r.region.split(",")[0], value: r.price })), { height: 200, format: (v) => formatCurrency(v) })}
    <div class="table-wrap" style="margin-top:var(--sp-4)"><table class="data">
      <thead><tr><th>Market</th><th>Rate</th><th>Weekly change</th></tr></thead>
      <tbody>${rows.map((r) => `<tr><td>${escapeHtml(r.region)}</td><td>${formatCurrency(r.price)}</td>
        <td><span class="delta ${r.change >= 0 ? "up" : "down"}">${r.change >= 0 ? "▲" : "▼"} ${Math.abs(r.change)}%</span></td></tr>`).join("")}</tbody>
    </table></div></div>`;
}

/** Renders the ML forecast card. Shows an unavailable state unless the API answers. */
export async function renderPrediction(container, params) {
  container.innerHTML = `<div class="card"><h3 class="card-title">Predicted price range</h3>
    <p class="text-muted">Requesting the forecast from the Agro Connect prediction service…</p>
    <div class="skeleton" style="height:70px"></div></div>`;
  try {
    const r = await aiAPI.pricePrediction(params);
    container.innerHTML = `<div class="card"><div class="card-head"><h3 class="card-title">Predicted price range</h3>
        <span class="badge badge-info">${escapeHtml(r.model_version || "model")}</span></div>
      <p style="font-family:var(--font-display);font-size:var(--fs-2xl);margin:0">
        ${formatCurrency(r.low)} – ${formatCurrency(r.high)}</p>
      <p class="text-muted" style="font-size:var(--fs-sm)">Horizon: ${escapeHtml(r.horizon || "—")} · Confidence: ${escapeHtml(String(r.confidence ?? "—"))}</p></div>`;
  } catch {
    container.innerHTML = `<div class="card"><h3 class="card-title">Predicted price range</h3>
      <div class="notice notice-warn" role="status"><strong>Prediction will be provided by the backend ML service.</strong><br>
        The price prediction service is currently unavailable, so no forecast is shown. Agro Connect does not estimate prices in the browser.</div></div>`;
  }
}
