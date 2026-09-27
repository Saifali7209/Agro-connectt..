/** Farmer console — multi-step crop listing form (POST /crops, then image upload). */
import { pageHead, el, els, showToast, escapeHtml, B } from "./_builders.js";
import { CROP_TYPES, CROP_CATEGORIES, QUALITY_GRADES, UNITS, STATES } from "../../data/demo-data.js";
import { cropAPI } from "../api.js";
import { setBusy } from "../ui.js";
import { validateImages } from "../validation.js";
import { UPLOAD_CONFIG } from "../config.js";
import { legacyNavigate } from "../../../utils/legacyHref.js";

export const meta = { title: "Add Crop", navKey: "add-crop" };

const STEPS = ["Crop details", "Quantity & price", "Photos", "Delivery & review"];

export function render(main) {
  let step = 0;
  let files = [];

  main.innerHTML = pageHead("Add a crop", "Publish a listing buyers can find and order.")
    + `<form class="card" id="crop-form" novalidate>
      <ol class="stepper" id="steps">${STEPS.map((s, i) => `<li class="step${i === 0 ? " active" : ""}" data-step="${i}"><b>${i + 1}</b> ${escapeHtml(s)}</li>`).join("")}</ol>

      <section class="wizard-step" data-step="0">
        <div class="grid-2">
          <div class="field"><label for="c-name">Crop</label><select id="c-name" name="name" required>
            ${CROP_TYPES.map((c) => `<option>${escapeHtml(c)}</option>`).join("")}</select></div>
          <div class="field"><label for="c-variety">Variety</label><input id="c-variety" name="variety" type="text" required placeholder="e.g. Kufri Jyoti"></div>
        </div>
        <div class="grid-2">
          <div class="field"><label for="c-cat">Category</label><select id="c-cat" name="category">
            ${CROP_CATEGORIES.map((c) => `<option>${escapeHtml(c)}</option>`).join("")}</select></div>
          <div class="field"><label for="c-grade">Quality grade</label><select id="c-grade" name="grade">
            ${QUALITY_GRADES.map((g) => `<option>${escapeHtml(g)}</option>`).join("")}</select></div>
        </div>
        <div class="field"><label for="c-desc">Description</label>
          <textarea id="c-desc" name="description" rows="4" maxlength="600" placeholder="Storage, grading, moisture, harvest handling…"></textarea></div>
        <label class="checkline"><input type="checkbox" name="organic" value="true"> Grown without chemical inputs</label>
      </section>

      <section class="wizard-step" data-step="1" hidden>
        <div class="grid-2">
          <div class="field"><label for="c-qty">Quantity available</label><input id="c-qty" name="quantity" type="number" min="1" required></div>
          <div class="field"><label for="c-unit">Unit</label><select id="c-unit" name="unit">
            ${UNITS.map((u) => `<option>${escapeHtml(u)}</option>`).join("")}</select></div>
        </div>
        <div class="grid-2">
          <div class="field"><label for="c-price">Price per unit (₹)</label><input id="c-price" name="price" type="number" min="1" step="0.5" required></div>
          <div class="field"><label for="c-min">Minimum order</label><input id="c-min" name="min_order" type="number" min="1"></div>
        </div>
        <div class="grid-2">
          <div class="field"><label for="c-harvest">Harvest date</label><input id="c-harvest" name="harvest_date" type="date"></div>
          <div class="field"><label for="c-from">Available from</label><input id="c-from" name="available_from" type="date"></div>
        </div>
      </section>

      <section class="wizard-step" data-step="2" hidden>
        <div class="dropzone" id="drop" tabindex="0" role="button" aria-label="Add crop photos">
          <p><strong>Add photos of your crop</strong></p>
          <p class="text-muted">${escapeHtml(UPLOAD_CONFIG.ACCEPTED_LABEL)} · up to ${UPLOAD_CONFIG.MAX_FILE_MB} MB each · maximum ${UPLOAD_CONFIG.MAX_FILES} photos</p>
          <input id="c-images" type="file" accept="image/*" multiple hidden>
        </div>
        <div class="preview-grid" id="previews"></div>
      </section>

      <section class="wizard-step" data-step="3" hidden>
        <fieldset class="field"><legend>Delivery options</legend>
          <div class="chips">${["Farm pickup", "Local transport", "Mandi delivery", "Cold-chain delivery"].map((d) =>
            `<label class="chip"><input type="checkbox" name="delivery" value="${escapeHtml(d)}"> ${escapeHtml(d)}</label>`).join("")}</div>
        </fieldset>
        <div class="grid-2">
          <div class="field"><label for="c-state">State</label><select id="c-state" name="state">
            ${STATES.map((s) => `<option>${escapeHtml(s)}</option>`).join("")}</select></div>
          <div class="field"><label for="c-district">District</label><input id="c-district" name="district" type="text"></div>
        </div>
        <div id="review-summary" class="notice notice-info"></div>
      </section>

      <div class="btn-group" style="margin-top:var(--sp-5)">
        <button class="btn btn-outline" type="button" id="prev" hidden>Back</button>
        <button class="btn btn-primary" type="button" id="next">Continue</button>
        <button class="btn btn-primary" type="submit" id="publish" hidden>Publish listing</button>
      </div>
    </form>`;

  const form = el("#crop-form", main);
  const drop = el("#drop", main);
  const input = el("#c-images", main);

  function paint() {
    els(".wizard-step", form).forEach((s) => { s.hidden = Number(s.dataset.step) !== step; });
    els("#steps li", form).forEach((li) => {
      const i = Number(li.dataset.step);
      li.classList.toggle("active", i === step);
      li.classList.toggle("done", i < step);
    });
    el("#prev", form).hidden = step === 0;
    el("#next", form).hidden = step === STEPS.length - 1;
    el("#publish", form).hidden = step !== STEPS.length - 1;
    if (step === STEPS.length - 1) {
      const d = Object.fromEntries(new FormData(form).entries());
      el("#review-summary", form).innerHTML = `<strong>${escapeHtml(d.name || "")} — ${escapeHtml(d.variety || "")}</strong><br>
        ${escapeHtml(d.quantity || "0")} ${escapeHtml(d.unit || "")} at ₹${escapeHtml(d.price || "0")} per ${escapeHtml(d.unit || "unit")} · ${files.length} photo(s)`;
    }
  }

  function drawPreviews() {
    el("#previews", form).innerHTML = files.map((f, i) => `<figure class="preview-item">
      <img src="${URL.createObjectURL(f)}" alt="Crop photo ${i + 1}">
      <button type="button" data-remove="${i}" aria-label="Remove photo ${i + 1}">×</button></figure>`).join("");
    els("[data-remove]", form).forEach((b) => b.addEventListener("click", () => {
      files.splice(Number(b.dataset.remove), 1); drawPreviews();
    }));
  }

  function addFiles(list) {
    const { accepted, errors } = validateImages([...list], { existing: files.length });
    if (errors.length) showToast(errors[0], "warn");
    files = [...files, ...accepted].slice(0, UPLOAD_CONFIG.MAX_FILES);
    drawPreviews();
  }

  drop.addEventListener("click", () => input.click());
  drop.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.click(); } });
  drop.addEventListener("dragover", (e) => { e.preventDefault(); drop.classList.add("dragover"); });
  drop.addEventListener("dragleave", () => drop.classList.remove("dragover"));
  drop.addEventListener("drop", (e) => { e.preventDefault(); drop.classList.remove("dragover"); addFiles(e.dataTransfer.files); });
  input.addEventListener("change", () => addFiles(input.files));

  el("#next", form).addEventListener("click", () => {
    const current = el(`.wizard-step[data-step="${step}"]`, form);
    const invalid = [...current.querySelectorAll("input,select,textarea")].find((f) => !f.checkValidity());
    if (invalid) { invalid.reportValidity(); return; }
    step = Math.min(step + 1, STEPS.length - 1); paint();
  });
  el("#prev", form).addEventListener("click", () => { step = Math.max(step - 1, 0); paint(); });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = el("#publish", form);
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.delivery = [...new FormData(form).getAll("delivery")];
    payload.organic = form.elements.organic.checked;
    setBusy(btn, true, "Publishing…");
    try {
      const created = await cropAPI.create(payload);
      if (files.length && created?.id) {
        const fd = new FormData();
        files.forEach((f) => fd.append("images", f));
        await cropAPI.uploadImages(created.id, fd);
      }
      showToast("Listing published.", "success");
      legacyNavigate(`${B}/farmer/my-crops.html`);
    } catch {
      showToast("The listing could not be published — the server did not confirm it.", "error");
    } finally { setBusy(btn, false); }
  });

  paint();
}
