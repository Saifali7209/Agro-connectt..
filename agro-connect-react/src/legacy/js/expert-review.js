/** AGRO CONNECT — agricultural expert review workflow. */
import { expertAPI } from "./api.js";
import { loadData } from "./data-source.js";
import { DEMO_EXPERT_CASES } from "../data/demo-data.js";
import { escapeHtml, formatDateTime, percent } from "./utils.js";
import { statusBadge } from "./ui.js";
import { APP_CONFIG } from "./config.js";

const B = APP_CONFIG.BASE_PATH;

export async function fetchQueue(params = {}) {
  return loadData(() => expertAPI.queue(params), DEMO_EXPERT_CASES);
}

export async function fetchCase(id) {
  return loadData(() => expertAPI.case(id), DEMO_EXPERT_CASES.find((c) => c.id === id) || DEMO_EXPERT_CASES[0]);
}

export function submitReview(id, payload) {
  return expertAPI.submit(id, payload);
}

export function caseRow(c) {
  const low = Number(c.confidence) < 0.6;
  return `<tr>
    <td><strong>${escapeHtml(c.id)}</strong></td>
    <td>${escapeHtml(c.crop)}</td>
    <td>${escapeHtml(c.farmer)}</td>
    <td>${escapeHtml(c.ai_condition)}</td>
    <td><span class="badge ${low ? "badge-danger" : "badge-success"}">${percent(c.confidence)}</span></td>
    <td>${escapeHtml(c.severity)}</td>
    <td>${statusBadge(c.status)}</td>
    <td>${formatDateTime(c.submitted_at)}</td>
    <td><a class="btn btn-sm btn-primary" href="${B}/expert/review-case.html?id=${encodeURIComponent(c.id)}">Review</a></td>
  </tr>`;
}
