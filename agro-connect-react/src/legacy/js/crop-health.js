/**
 * AGRO CONNECT — crop health surface.
 * Live scores come from GET /ai/crop-health. When that service is unreachable the
 * page shows clearly-labelled demo values for layout only, never as a real reading.
 */
import { aiAPI } from "./api.js";
import { loadData } from "./data-source.js";
import { DEMO_HEALTH } from "../data/demo-data.js";
import { escapeHtml } from "./utils.js";
import { lineChart } from "./charts.js";

export async function fetchHealth(params = {}) {
  return loadData(() => aiAPI.cropHealth(params), DEMO_HEALTH);
}

export function healthScoreMarkup(health) {
  const tone = health.score >= 75 ? "" : health.score >= 50 ? "warn" : "danger";
  return `<div class="card">
    <div class="card-head"><h2 class="card-title">Overall health score</h2>
      <span class="badge ${health.score >= 75 ? "badge-success" : health.score >= 50 ? "badge-warning" : "badge-danger"}">${health.score} / 100</span></div>
    <div class="meter ${tone}"><span style="width:${health.score}%"></span></div>
    <p class="text-muted" style="margin-top:var(--sp-3);font-size:var(--fs-sm)">
      Combines disease risk, pest risk, water stress and weather risk for your registered plots.</p>
  </div>`;
}

export function metricsMarkup(health) {
  return `<div class="health-grid">
    ${health.metrics.map((m) => `<article class="card health-card">
      <div class="row-between"><strong>${escapeHtml(m.label)}</strong>
        <span class="badge ${m.tone === "danger" ? "badge-danger" : m.tone === "warn" ? "badge-warning" : "badge-success"}">${m.value}%</span></div>
      <div class="meter ${m.tone === "danger" ? "danger" : m.tone === "warn" ? "warn" : ""}"><span style="width:${m.value}%"></span></div>
      <p class="text-muted" style="margin:0;font-size:var(--fs-sm)">${escapeHtml(m.note)}</p>
    </article>`).join("")}
  </div>`;
}

export function historyMarkup(health) {
  return `<div class="card">
    <h3 class="card-title">Health trend</h3>
    ${lineChart(health.timeline, { height: 200 })}
  </div>`;
}
