/** AGRO CONNECT — weather service adapter. GET /api/v1/weather */
import { weatherAPI } from "./api.js";
import { loadData } from "./data-source.js";
import { DEMO_WEATHER } from "../data/demo-data.js";
import { escapeHtml } from "./utils.js";

export async function fetchWeather(params = {}) {
  return loadData(() => weatherAPI.current(params), DEMO_WEATHER);
}

export function currentMarkup(w) {
  const c = w.current;
  return `<div class="card">
    <div class="card-head"><div><p class="eyebrow">Current conditions</p>
      <h2 style="margin:0">${escapeHtml(w.location)}</h2></div>
      <span class="badge badge-info">${escapeHtml(c.condition)}</span></div>
    <div class="stat-grid">
      <div class="stat"><span class="label">Temperature</span><span class="value">${c.temp}°C</span></div>
      <div class="stat"><span class="label">Humidity</span><span class="value">${c.humidity}%</span></div>
      <div class="stat"><span class="label">Rain probability</span><span class="value">${c.rain_probability}%</span></div>
      <div class="stat"><span class="label">Wind</span><span class="value">${c.wind} km/h</span></div>
    </div>
  </div>`;
}

export function forecastMarkup(w) {
  return `<div class="card">
    <h3 class="card-title">7-day forecast</h3>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(104px,1fr));margin-top:var(--sp-4)">
      ${w.forecast.map((d) => `<div class="card card-tight text-center" style="box-shadow:none">
        <strong>${escapeHtml(d.day)}</strong>
        <p style="font-size:var(--fs-xl);font-family:var(--font-display);margin:6px 0">${d.temp}°</p>
        <p class="text-muted" style="font-size:var(--fs-xs);margin:0">${escapeHtml(d.condition)}<br>${d.rain}% rain</p></div>`).join("")}
    </div>
  </div>`;
}

export function alertsMarkup(w) {
  if (!w.alerts?.length) return `<div class="card"><h3 class="card-title">Alerts</h3><p class="text-muted">No weather alerts for your area.</p></div>`;
  return `<div class="card"><h3 class="card-title">Alerts</h3>
    ${w.alerts.map((a) => `<div class="notice notice-warn" role="alert" style="margin-bottom:10px">
      <strong>${escapeHtml(a.title)}</strong><br>${escapeHtml(a.body)}</div>`).join("")}</div>`;
}
