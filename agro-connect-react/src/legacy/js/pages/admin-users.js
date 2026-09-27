/** Admin console — all user accounts. */
import { pageHead, el, els, demoBanner, showError, showToast, emptyState, escapeHtml } from "./_builders.js";
import { fetchUsers, userTable } from "../admin.js";

export const meta = { title: "Users", navKey: "users" };

export function renderUserPage(main, { title, sub, role = null, navEmpty = "No accounts in this view." }) {
  main.innerHTML = pageHead(title, sub)
    + `<div class="filter-bar" style="margin-bottom:var(--sp-4)">
        <input id="u-search" type="search" placeholder="Search by name, email or state" aria-label="Search users">
        <select id="u-status" aria-label="Filter by status">
          <option value="">All statuses</option><option>Active</option><option>Pending</option><option>Suspended</option>
        </select>
      </div><div id="u-host"><div class="skeleton" style="height:320px;border-radius:var(--radius-lg)"></div></div>`;

  const host = el("#u-host", main);
  let rows = [], demo = false;

  (async () => {
    try { const r = await fetchUsers(role ? { role } : undefined); rows = r.data; demo = r.demo; draw(); }
    catch (error) { showError(host, error); }
  })();

  function draw() {
    const q = (el("#u-search", main).value || "").toLowerCase().trim();
    const status = el("#u-status", main).value;
    const list = rows
      .filter((u) => (role ? u.role.toLowerCase() === role : true))
      .filter((u) => (status ? u.status === status : true))
      .filter((u) => !q || [u.name, u.email, u.state, u.id].join(" ").toLowerCase().includes(q));

    host.innerHTML = (demo ? demoBanner("Sample accounts for layout review.") : "")
      + (list.length ? userTable(list) : emptyState({ title: "No matches", message: navEmpty }));

    els("[data-action]", host).forEach((b) => b.addEventListener("click", () => {
      const user = rows.find((u) => u.id === b.dataset.id);
      if (b.dataset.action === "suspend") {
        showToast(`${escapeHtml(user.name)} will be ${user.status === "Suspended" ? "reinstated" : "suspended"} once the server confirms the change.`, "info");
      } else {
        showToast("Account detail opens from the server record.", "info");
      }
    }));
  }

  el("#u-search", main).addEventListener("input", () => rows.length && draw());
  el("#u-status", main).addEventListener("change", () => rows.length && draw());
}

export const render = (main) => renderUserPage(main, {
  title: "Users", sub: "Every account on the platform, with role, state and status.",
});
