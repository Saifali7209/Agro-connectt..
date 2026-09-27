/** Admin console — AI model registry (metadata reported by the AI service). */
import { pageHead, el, els, demoBanner, showError, showToast, statusBadge, escapeHtml, formatDate } from "./_builders.js";
import { fetchModels } from "../admin.js";

export const meta = { title: "Model Management", navKey: "model-management" };

export async function render(main) {
  main.innerHTML = pageHead("Model management", "Versions and reported metrics for each AI model in service.")
    + `<div class="notice notice-info" style="margin-bottom:var(--sp-4)">Metrics are published by the AI service. Promotion and rollback are performed by the backend, not by this screen.</div>
       <div id="host"><div class="skeleton" style="height:320px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#host", main);
  try {
    const { data, demo } = await fetchModels();
    host.innerHTML = (demo ? demoBanner("Sample model metadata for layout review.") : "")
      + `<div class="panel-grid">${data.map((m) => `<article class="card">
          <div class="card-head"><h3 class="card-title">${escapeHtml(m.name)}</h3>${statusBadge(m.status)}</div>
          <p class="text-muted" style="font-size:var(--fs-sm)"><code>${escapeHtml(m.key)}</code> · ${escapeHtml(m.version)} · updated ${formatDate(m.updated, "short")}</p>
          <dl class="kv">${Object.entries(m.metrics).map(([k, v]) => `<dt>${escapeHtml(k)}</dt><dd>${escapeHtml(String(v))}</dd>`).join("")}</dl>
          <div class="btn-group">
            <button class="btn btn-sm btn-outline" data-action="promote" data-key="${escapeHtml(m.key)}">Request promotion</button>
            <button class="btn btn-sm btn-ghost" data-action="logs" data-key="${escapeHtml(m.key)}">View logs</button>
          </div></article>`).join("")}</div>`;
    els("[data-action]", host).forEach((b) => b.addEventListener("click", () =>
      showToast("This request is handled by the AI service once the backend is connected.", "info")));
  } catch (error) { showError(host, error); }
}
