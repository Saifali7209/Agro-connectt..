/** AGRO CONNECT — admin data helpers and shared table renderers. */
import { adminAPI, userAPI, knowledgeAPI, aiAPI } from "./api.js";
import { loadData } from "./data-source.js";
import {
  DEMO_ADMIN_STATS, DEMO_USERS, DEMO_KNOWLEDGE, DEMO_MODELS,
  DEMO_AI_ANALYTICS, DEMO_AUDIT_LOGS,
} from "../data/demo-data.js";
import { escapeHtml, formatDate, formatDateTime } from "./utils.js";
import { statusBadge } from "./ui.js";

export const fetchStats = () => loadData(() => adminAPI.stats(), DEMO_ADMIN_STATS);
export const fetchUsers = (params) => loadData(() => userAPI.list(params), DEMO_USERS);
export const fetchKnowledge = () => loadData(() => knowledgeAPI.list(), DEMO_KNOWLEDGE);
export const fetchModels = () => loadData(() => aiAPI.models(), DEMO_MODELS);
export const fetchAiAnalytics = () => loadData(() => aiAPI.analytics(), DEMO_AI_ANALYTICS);
export const fetchAuditLogs = (params) => loadData(() => adminAPI.auditLogs(params), DEMO_AUDIT_LOGS);

export function userTable(rows, { showRoleFilter = true } = {}) {
  return `<div class="card" style="padding:0;overflow:hidden">
    <div class="table-wrap" style="border:0">
      <table class="data">
        <thead><tr><th>User</th><th>Role</th><th>Contact</th><th>State</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
        <tbody>${rows.map((u) => `<tr>
          <td><strong>${escapeHtml(u.name)}</strong><br><span class="text-muted" style="font-size:var(--fs-xs)">${escapeHtml(u.id)}</span></td>
          <td>${escapeHtml(u.role)}</td>
          <td>${escapeHtml(u.email)}<br><span class="text-muted" style="font-size:var(--fs-xs)">${escapeHtml(u.phone)}</span></td>
          <td>${escapeHtml(u.state)}</td>
          <td>${statusBadge(u.status)}</td>
          <td>${formatDate(u.joined, "short")}</td>
          <td><div class="btn-group">
            <button class="btn btn-sm btn-outline" data-action="view" data-id="${escapeHtml(u.id)}">View</button>
            <button class="btn btn-sm btn-ghost" data-action="suspend" data-id="${escapeHtml(u.id)}">${u.status === "Suspended" ? "Reinstate" : "Suspend"}</button>
          </div></td></tr>`).join("")}</tbody>
      </table>
    </div>
    ${showRoleFilter ? "" : ""}
  </div>`;
}

export function auditTable(rows) {
  return `<div class="table-wrap"><table class="data">
    <thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Target</th><th>IP</th><th>Result</th></tr></thead>
    <tbody>${rows.map((l) => `<tr><td>${formatDateTime(l.at)}</td><td>${escapeHtml(l.actor)}</td>
      <td><code>${escapeHtml(l.action)}</code></td><td>${escapeHtml(l.target)}</td><td>${escapeHtml(l.ip)}</td>
      <td>${statusBadge(l.result === "Success" ? "completed" : "failed")}</td></tr>`).join("")}</tbody>
  </table></div>`;
}
