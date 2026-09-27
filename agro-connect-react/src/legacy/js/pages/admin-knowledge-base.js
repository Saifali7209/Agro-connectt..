/** Admin console — disease knowledge base entries. */
import { pageHead, el, els, demoBanner, showError, showToast, escapeHtml, formatDate } from "./_builders.js";
import { fetchKnowledge } from "../admin.js";
import { showModal } from "../ui.js";
import { CROP_TYPES } from "../../data/demo-data.js";

export const meta = { title: "Knowledge Base", navKey: "knowledge-base" };

export async function render(main) {
  main.innerHTML = pageHead("Knowledge base", "Reference entries shown alongside AI findings and expert reviews.",
    `<button class="btn btn-primary" id="kb-new" type="button">New entry</button>`)
    + `<div id="host"><div class="skeleton" style="height:320px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#host", main);

  el("#kb-new", main).addEventListener("click", () => showModal({
    title: "New knowledge entry",
    body: `<form id="kb-form" novalidate>
      <div class="field"><label for="kb-crop">Crop</label><select id="kb-crop" name="crop">
        ${CROP_TYPES.slice(0, 12).map((c) => `<option>${escapeHtml(c)}</option>`).join("")}</select></div>
      <div class="field"><label for="kb-disease">Condition</label><input id="kb-disease" name="disease" type="text" required></div>
      <div class="field"><label for="kb-symptoms">Symptoms</label><textarea id="kb-symptoms" name="symptoms" rows="3"></textarea></div>
      <div class="field"><label for="kb-management">Management</label><textarea id="kb-management" name="management" rows="3"></textarea></div>
      <div class="field"><label for="kb-source">Source</label><input id="kb-source" name="source" type="text" placeholder="ICAR advisory, KVK bulletin…"></div>
    </form>`,
    actions: [
      { label: "Cancel", variant: "btn-outline", onClick: (close) => close() },
      { label: "Save entry", variant: "btn-primary", onClick: (close) => { close(); showToast("The entry is saved when the server confirms it.", "info"); } },
    ],
  }));

  try {
    const { data, demo } = await fetchKnowledge();
    host.innerHTML = (demo ? demoBanner("Sample knowledge entries for layout review.") : "")
      + `<div class="panel-grid">${data.map((k) => `<article class="card">
          <div class="card-head"><h3 class="card-title">${escapeHtml(k.disease)}</h3>
            <span class="badge">${escapeHtml(k.crop)}</span></div>
          <dl class="kv">
            <dt>Symptoms</dt><dd>${escapeHtml(k.symptoms)}</dd>
            <dt>Causes</dt><dd>${escapeHtml(k.causes)}</dd>
            <dt>Management</dt><dd>${escapeHtml(k.management)}</dd>
            <dt>Treatment</dt><dd>${escapeHtml(k.treatment)}</dd>
            <dt>Safety</dt><dd>${escapeHtml(k.safety)}</dd>
            <dt>Source</dt><dd>${escapeHtml(k.source)} — reviewed ${formatDate(k.reviewed, "short")}</dd>
          </dl>
          <div class="btn-group"><button class="btn btn-sm btn-outline" data-edit="${escapeHtml(k.id)}">Edit</button></div>
        </article>`).join("")}</div>`;
    els("[data-edit]", host).forEach((b) => b.addEventListener("click", () =>
      showToast("Editing opens the stored entry from the server.", "info")));
  } catch (error) { showError(host, error); }
}
