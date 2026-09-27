/**
 * AI Crop Doctor page.
 * Sends the photo to POST /api/v1/ai/analyze-crop and renders only what the
 * backend returns. No result is ever fabricated in the browser.
 */
import {
  cropPickerMarkup, uploadPanelMarkup, photoTipsMarkup, initUploader, progressMarkup,
  animateSteps, unavailableMarkup, resultMarkup, lowConfidenceMarkup, buildAnalysisForm,
  analyze, requestExpertReview, LOW_CONFIDENCE_THRESHOLD,
} from "../ai-crop-doctor.js";
import { el, els, showToast, setBusy } from "../ui.js";
import { friendlyMessage } from "../api.js";
import { APP_CONFIG } from "../config.js";
import { icon } from "../navigation.js";

const B = APP_CONFIG.BASE_PATH;

export const meta = { title: "AI Crop Doctor", navKey: "ai-crop-doctor" };

export function render(main) {
  main.innerHTML = `<section class="section"><div class="container stack">
    <!-- AI Suite Switcher Bar -->
    <div class="ai-suite-bar">
      <div class="ai-suite-pills">
        <span style="font-size:var(--fs-xs);font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:.08em;margin-right:4px;">AI Features:</span>
        <a class="ai-pill active" href="${B}/pages/ai-crop-doctor.html">
          ${icon.robot || ""} <span>AI Crop Doctor</span>
        </a>
        <a class="ai-pill" href="${B}/farmer/demand-forecasting.html">
          ${icon.trendingUp || icon.chart || ""} <span>Demand Forecasting</span>
        </a>
        <a class="ai-pill" href="${B}/farmer/route-optimization.html">
          ${icon.mapPin || ""} <span>Route Optimization</span>
        </a>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="badge badge-success" style="font-size:11px;">Model: crop_vision v3.0</span>
        <span class="text-muted" style="font-size:var(--fs-xs)">Automated agronomic disease diagnostics</span>
      </div>
    </div>

    <div class="ai-hero">
      <p class="eyebrow">Crop health</p>
      <h1>AI Crop Doctor</h1>
      <p>Upload a crop or leaf photo for an AI-assisted crop health assessment.</p>
    </div>

    <div class="ai-layout">
      <div class="stack">
        <div class="card">
          <h2 class="card-title">1. Choose the crop</h2>
          <div style="margin-top:var(--sp-3)">${cropPickerMarkup()}</div>
        </div>

        <div class="card">
          <h2 class="card-title">2. Add a photo</h2>
          <div style="margin-top:var(--sp-3)">${uploadPanelMarkup()}</div>
        </div>

        <form class="card" id="ai-form" novalidate>
          <h2 class="card-title">3. Field details</h2>
          <div class="form-grid" style="margin-top:var(--sp-4)">
            <div class="field"><label for="crop_age">Crop age (days)</label>
              <input id="crop_age" name="crop_age" type="number" min="1" max="400" inputmode="numeric"></div>
            <div class="field"><label for="growth_stage">Growth stage</label>
              <select id="growth_stage" name="growth_stage"><option value="">Select stage</option>
                <option>Seedling</option><option>Vegetative</option><option>Flowering</option>
                <option>Fruiting</option><option>Maturity</option></select></div>
            <div class="field"><label for="location">Village / district</label>
              <input id="location" name="location" type="text" autocomplete="address-level2"></div>
            <div class="field"><label for="irrigation">Irrigation</label>
              <select id="irrigation" name="irrigation"><option value="">Select method</option>
                <option>Rain-fed</option><option>Drip</option><option>Sprinkler</option><option>Flood / canal</option></select></div>
            <div class="field full"><label for="symptoms">What are you seeing?</label>
              <textarea id="symptoms" name="symptoms" placeholder="Spots on lower leaves, wilting after noon, white powder…"></textarea></div>
            <div class="field full"><label for="additional_information">Anything else</label>
              <textarea id="additional_information" name="additional_information" placeholder="Recent spraying, fertiliser applied, weather in the last week"></textarea></div>
          </div>
          <button class="btn btn-primary btn-lg btn-block" type="submit" id="analyze-btn">Analyse crop</button>
          <p class="text-muted" style="font-size:var(--fs-xs);margin-top:12px">
            The photo is uploaded to the Agro Connect API, which passes it to the crop health service. Assessments are
            decision support and do not replace an agronomist's inspection.</p>
        </form>
      </div>

      <div class="stack">
        ${photoTipsMarkup()}
        <div class="card">
          <h3 class="card-title">What you'll get</h3>
          <ul class="result-list" style="margin-top:var(--sp-3)">
            <li>Possible condition and model confidence</li>
            <li>Severity assessment</li>
            <li>Observed symptoms and possible causes</li>
            <li>Recommended next steps and monitoring</li>
            <li>Escalation to an agricultural expert when confidence is low</li>
          </ul>
        </div>
        <div id="ai-output" aria-live="polite"></div>
      </div>
    </div>
  </div></section>`;

  let selectedCrop = "";
  els(".crop-pick", main).forEach((b) => b.addEventListener("click", () => {
    selectedCrop = b.dataset.crop;
    els(".crop-pick", main).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  }));

  const uploader = initUploader(main);
  const output = el("#ai-output", main);
  const form = el("#ai-form", main);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!selectedCrop) { showToast("Choose the crop in the photo first.", "warn"); return; }
    if (!uploader.file) { showToast("Add a crop photo before analysing.", "warn"); return; }

    const btn = el("#analyze-btn", form);
    setBusy(btn, true, "Analysing…");
    output.innerHTML = progressMarkup();
    let running = true;
    animateSteps(el("#ai-progress", output), () => running);

    const values = Object.fromEntries(new FormData(form).entries());
    const fd = buildAnalysisForm({
      crop: selectedCrop,
      image: uploader.file,
      cropAge: values.crop_age,
      growthStage: values.growth_stage,
      location: values.location,
      symptoms: values.symptoms,
      irrigation: values.irrigation,
      additionalInformation: values.additional_information,
    });

    try {
      const result = await analyze(fd);
      running = false;
      if (!result || result.success === false) {
        output.innerHTML = unavailableMarkup();
      } else if (Number(result.confidence) < LOW_CONFIDENCE_THRESHOLD) {
        output.innerHTML = lowConfidenceMarkup(result);
      } else {
        output.innerHTML = resultMarkup(result);
      }
      wireResultActions(result?.analysis_id);
    } catch (error) {
      running = false;
      output.innerHTML = unavailableMarkup(
        error?.isUnavailable ? "AI analysis service is currently unavailable." : friendlyMessage(error)
      );
      wireResultActions(null);
    } finally {
      setBusy(btn, false);
      output.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  });

  function wireResultActions(analysisId) {
    el("#ai-retry", output)?.addEventListener("click", () => form.requestSubmit());
    el("#ai-again", output)?.addEventListener("click", () => { output.innerHTML = ""; window.scrollTo({ top: 0, behavior: "smooth" }); });
    el("#ai-better", output)?.addEventListener("click", () => { el("#dropzone", main).focus(); window.scrollTo({ top: 200, behavior: "smooth" }); });
    el("#ai-expert", output)?.addEventListener("click", async (e) => {
      setBusy(e.currentTarget, true, "Sending…");
      try {
        await requestExpertReview(analysisId, "Farmer requested expert review from the AI Crop Doctor screen.");
        showToast("An agricultural expert will review this case.", "success");
      } catch {
        showToast("The expert review service is unavailable right now. Please try again later.", "error");
      } finally {
        setBusy(e.currentTarget, false);
      }
    });
  }
}
