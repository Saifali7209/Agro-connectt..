/** Expert console — single case review and submission. */
import { pageHead, el, showError, showToast, escapeHtml, formatDate, statusBadge, B } from "./_builders.js";
import { fetchCase, submitReview } from "../expert-review.js";
import { setBusy } from "../ui.js";
import { queryParams } from "../utils.js";
import { legacyNavigate } from "../../../utils/legacyHref.js";

export const meta = { title: "Review Case", navKey: "review-case" };

export async function render(main) {
  const { id } = queryParams();
  main.innerHTML = pageHead("Review case", "Confirm, correct or reject the AI suggestion. Your verdict is shown to the farmer.");
  const host = document.createElement("div");
  host.className = "panel-grid";
  main.append(host);
  try {
    const { data: c } = await fetchCase(id);
    host.innerHTML = `<div class="card">
        <div class="card-head"><h3 class="card-title">${escapeHtml(c.id)}</h3>${statusBadge(c.status)}</div>
        <img src="${escapeHtml(c.image)}" alt="Crop photo submitted for review" style="width:100%;border-radius:var(--radius-md)">
        <dl class="kv" style="margin-top:var(--sp-4)">
          <dt>Crop</dt><dd>${escapeHtml(c.crop)}</dd>
          <dt>Farmer</dt><dd>${escapeHtml(c.farmer)}</dd>
          <dt>Submitted</dt><dd>${formatDate(c.submitted_at)}</dd>
          <dt>AI suggestion</dt><dd>${escapeHtml(c.ai_condition)}</dd>
          <dt>AI confidence</dt><dd>${Math.round(c.confidence * 100)}%</dd>
          <dt>Reported symptoms</dt><dd>${c.symptoms.map(escapeHtml).join("; ")}</dd>
        </dl>
      </div>
      <form class="card" id="verdict" novalidate>
        <h3 class="card-title">Your assessment</h3>
        <div class="field"><label for="v-decision">Decision</label><select id="v-decision" name="decision">
          <option value="confirm">Confirm the AI suggestion</option>
          <option value="correct">Correct the diagnosis</option>
          <option value="inconclusive">Not enough evidence</option></select></div>
        <div class="field"><label for="v-condition">Condition</label><input id="v-condition" name="condition" type="text" value="${escapeHtml(c.ai_condition)}" required></div>
        <div class="field"><label for="v-severity">Severity</label><select id="v-severity" name="severity">
          <option>Low</option><option>Moderate</option><option>High</option><option>Unclear</option></select></div>
        <div class="field"><label for="v-advice">Advice for the farmer</label><textarea id="v-advice" name="advice" rows="6" required
          placeholder="Field actions, monitoring and when to consult the local KVK."></textarea></div>
        <div class="field"><label for="v-followup">Follow-up in</label><select id="v-followup" name="follow_up_days">
          <option value="3">3 days</option><option value="7">1 week</option><option value="14">2 weeks</option></select></div>
        <p class="text-muted" style="font-size:var(--fs-xs)">Do not name a specific chemical dose — point to the approved state advisory.</p>
        <button class="btn btn-primary" type="submit">Submit review</button>
      </form>`;

    el("#verdict", host).addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!e.target.checkValidity()) { e.target.reportValidity(); return; }
      const btn = e.target.querySelector('button[type="submit"]');
      setBusy(btn, true, "Submitting…");
      try {
        await submitReview(c.id, Object.fromEntries(new FormData(e.target).entries()));
        showToast("Review submitted to the farmer.", "success");
        legacyNavigate(`${B}/expert/pending-reviews.html`);
      } catch { showToast("The review could not be submitted — the server did not confirm it.", "error"); }
      finally { setBusy(btn, false); }
    });
  } catch (error) { showError(host, error); }
}
