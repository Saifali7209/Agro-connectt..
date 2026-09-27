/**
 * AGRO CONNECT — AI Crop Doctor controller.
 *
 * Contract with the backend:
 *   POST {BASE_URL}/ai/analyze-crop        Content-Type: multipart/form-data
 *   fields: crop, image, crop_age, growth_stage, location, symptoms,
 *           irrigation, additional_information
 *
 *   200 -> { success, analysis_id, crop, condition, confidence, severity,
 *            symptoms[], possible_causes[], recommendations[], follow_up[] }
 *
 * This module NEVER invents a diagnosis. If the service cannot be reached the UI
 * shows "AI analysis service is currently unavailable." and nothing else.
 */
import { aiAPI } from "./api.js";
import { UPLOAD_CONFIG } from "./config.js";
import { validateImages } from "./validation.js";
import { el, els, showToast } from "./ui.js";
import { escapeHtml, percent, sleep } from "./utils.js";
import { confidenceRing } from "./charts.js";

export const AI_CROPS = ["Potato", "Tomato", "Wheat", "Rice", "Onion", "Cotton", "Maize", "Sugarcane", "Other"];
const EMOJI = { Potato: "🥔", Tomato: "🍅", Wheat: "🌾", Rice: "🍚", Onion: "🧅", Cotton: "🧵", Maize: "🌽", Sugarcane: "🎋", Other: "🌱" };

export const ANALYSIS_STEPS = [
  "Image received",
  "Checking image quality",
  "Analysing crop",
  "Processing",
  "Preparing assessment",
];

export const LOW_CONFIDENCE_THRESHOLD = 0.6;

export function cropPickerMarkup(selected = "") {
  return `<div class="crop-picker" role="group" aria-label="Select the crop in the photo">
    ${AI_CROPS.map((c) => `<button type="button" class="crop-pick" data-crop="${c}" aria-pressed="${String(c === selected)}">
      <span class="emoji" aria-hidden="true">${EMOJI[c]}</span>${c}</button>`).join("")}
  </div>`;
}

export function uploadPanelMarkup() {
  return `<div class="stack">
    <div class="dropzone" id="dropzone" tabindex="0" role="button"
         aria-label="Upload a crop photo. Accepted formats ${UPLOAD_CONFIG.ACCEPTED_LABEL}">
      <p style="font-size:32px;margin:0" aria-hidden="true">📷</p>
      <p><strong>Drag a photo here, or choose an option below</strong></p>
      <p class="text-muted" style="font-size:var(--fs-sm);margin:0">
        Accepted formats: ${UPLOAD_CONFIG.ACCEPTED_LABEL} · up to ${UPLOAD_CONFIG.MAX_FILE_MB} MB</p>
    </div>
    <div class="btn-group">
      <button class="btn btn-primary" type="button" id="btn-camera">Take Photo</button>
      <button class="btn btn-outline" type="button" id="btn-gallery">Upload From Gallery</button>
    </div>
    <input type="file" id="ai-camera-input" accept="image/*" capture="environment" class="hidden" aria-hidden="true">
    <input type="file" id="ai-file-input" accept="${UPLOAD_CONFIG.ACCEPTED_TYPES.join(",")}" class="hidden" aria-hidden="true">
    <div class="preview-grid" id="ai-preview" aria-live="polite"></div>
    <p class="error-text" id="ai-upload-error" role="alert"></p>
  </div>`;
}

export function photoTipsMarkup() {
  return `<div class="card">
    <h3 class="card-title">Photo tips for a better assessment</h3>
    <ul class="tips" style="margin-top:var(--sp-3)">
      <li>Fill the frame with one affected leaf or plant part.</li>
      <li>Shoot in daylight, with the sun behind you.</li>
      <li>Keep the camera steady so the photo is sharp.</li>
      <li>Include both healthy and affected areas if you can.</li>
      <li>Avoid shadows, flash glare and wet leaf reflections.</li>
    </ul>
  </div>`;
}

/** Handles file selection, validation and preview for a single AI image. */
export function initUploader(root, onChange) {
  const dropzone = el("#dropzone", root);
  const fileInput = el("#ai-file-input", root);
  const cameraInput = el("#ai-camera-input", root);
  const preview = el("#ai-preview", root);
  const errorSlot = el("#ai-upload-error", root);
  let current = null;

  function set(files) {
    errorSlot.textContent = "";
    const { accepted, errors } = validateImages(files, { max: 1 });
    if (errors.length) errorSlot.textContent = errors[0];
    if (!accepted.length) return;
    current = accepted[0];
    const url = URL.createObjectURL(current);
    preview.innerHTML = `<div class="preview-item"><img src="${url}" alt="Selected crop photo preview">
      <button type="button" data-remove aria-label="Remove selected photo">✕</button></div>`;
    el("[data-remove]", preview).addEventListener("click", () => {
      URL.revokeObjectURL(url);
      current = null; preview.innerHTML = ""; onChange?.(null);
    });
    onChange?.(current);
  }

  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileInput.click(); } });
  dropzone.addEventListener("dragover", (e) => { e.preventDefault(); dropzone.classList.add("dragover"); });
  dropzone.addEventListener("dragleave", () => dropzone.classList.remove("dragover"));
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault(); dropzone.classList.remove("dragover");
    set([...e.dataTransfer.files]);
  });
  fileInput.addEventListener("change", () => set([...fileInput.files]));
  cameraInput.addEventListener("change", () => set([...cameraInput.files]));
  el("#btn-camera", root).addEventListener("click", () => cameraInput.click());
  el("#btn-gallery", root).addEventListener("click", () => fileInput.click());

  return { get file() { return current; } };
}

export function progressMarkup() {
  return `<div class="card" id="ai-progress" role="status" aria-live="polite">
    <h3 class="card-title">Analysis in progress</h3>
    <ul class="ai-steps" style="margin-top:var(--sp-4)">
      ${ANALYSIS_STEPS.map((s, i) => `<li data-step="${i}"><span class="bullet">${i + 1}</span>${s}</li>`).join("")}
    </ul>
    <p class="text-muted" style="font-size:var(--fs-sm);margin-top:var(--sp-4)">
      Your photo is sent to the Agro Connect API, which passes it to the crop health service.</p>
  </div>`;
}

/** Advances the visual step indicator while the request is in flight. */
export async function animateSteps(container, shouldContinue) {
  const steps = els("[data-step]", container);
  for (let i = 0; i < steps.length; i += 1) {
    if (!shouldContinue()) return;
    steps.forEach((s, idx) => s.classList.toggle("active", idx === i));
    if (i > 0) steps[i - 1].classList.replace("active", "done") || steps[i - 1].classList.add("done");
    await sleep(700);
  }
}

export function unavailableMarkup(message = "AI analysis service is currently unavailable.") {
  return `<div class="state error" role="alert">
    <div class="state-icon" aria-hidden="true">⚠</div>
    <h3>${escapeHtml(message)}</h3>
    <p>No assessment can be shown right now. Your photo was not analysed. Please try again in a few minutes.</p>
    <div class="btn-group" style="justify-content:center">
      <button class="btn btn-outline" type="button" id="ai-retry">Try again</button>
      <button class="btn btn-primary" type="button" id="ai-expert">Request Expert Review</button>
    </div>
  </div>`;
}

export function lowConfidenceMarkup(result) {
  return `<div class="card">
    <h2 class="card-title">AI could not confidently identify the problem.</h2>
    <p class="text-muted">The model returned a confidence of ${percent(result.confidence)} for “${escapeHtml(result.condition || "unclear")}”, which is below the threshold Agro Connect uses to show an assessment.</p>
    <div class="btn-group">
      <button class="btn btn-primary" type="button" id="ai-better">Upload Better Image</button>
      <button class="btn btn-outline" type="button" id="ai-expert">Request Expert Review</button>
    </div>
  </div>`;
}

function listBlock(title, items) {
  if (!items?.length) return "";
  return `<div class="result-section"><h3>${escapeHtml(title)}</h3>
    <ul class="result-list">${items.map((i) => `<li>${escapeHtml(typeof i === "string" ? i : i.text || JSON.stringify(i))}</li>`).join("")}</ul></div>`;
}

/** Renders a real backend result. Every value comes from the API response. */
export function resultMarkup(result) {
  const severityTone = { low: "badge-success", moderate: "badge-warning", high: "badge-danger", severe: "badge-danger" }[String(result.severity || "").toLowerCase()] || "badge-info";
  return `<div class="stack">
    <div class="card">
      <div class="card-head">
        <div><p class="eyebrow">Assessment</p><h2 style="margin:0">${escapeHtml(result.condition || "Condition not reported")}</h2>
          <p class="text-muted" style="margin:6px 0 0">Crop: ${escapeHtml(result.crop || "—")} · Reference ${escapeHtml(result.analysis_id || "—")}</p></div>
        <span class="badge ${severityTone}">Severity: ${escapeHtml(result.severity || "—")}</span>
      </div>
      <div class="row" style="gap:var(--sp-6);align-items:center">
        ${confidenceRing(result.confidence)}
        <div><p style="margin:0"><strong>Model confidence</strong></p>
          <p class="text-muted" style="margin:0;max-width:44ch;font-size:var(--fs-sm)">
            An assessment is a decision-support signal, not a substitute for an agronomist's field inspection.</p></div>
      </div>
    </div>
    <div class="card stack">
      ${listBlock("Observed symptoms", result.symptoms)}
      ${listBlock("Possible causes", result.possible_causes)}
      ${listBlock("Recommended next steps", result.recommendations)}
      ${listBlock("Treatment information", result.treatment)}
      ${listBlock("Monitoring", result.follow_up)}
      ${listBlock("Prevention", result.prevention)}
    </div>
    <div class="btn-group">
      <button class="btn btn-outline" type="button" id="ai-again">Analyse another photo</button>
      <button class="btn btn-primary" type="button" id="ai-expert">Request Expert Review</button>
    </div>
  </div>`;
}

/** Builds the exact multipart payload the FastAPI endpoint expects. */
export function buildAnalysisForm({ crop, image, cropAge, growthStage, location, symptoms, irrigation, additionalInformation }) {
  const fd = new FormData();
  fd.append("crop", crop || "");
  if (image) fd.append("image", image, image.name);
  fd.append("crop_age", cropAge || "");
  fd.append("growth_stage", growthStage || "");
  fd.append("location", location || "");
  fd.append("symptoms", symptoms || "");
  fd.append("irrigation", irrigation || "");
  fd.append("additional_information", additionalInformation || "");
  return fd;
}

export async function analyze(formData) {
  return aiAPI.analyzeCrop(formData);
}

export function requestExpertReview(analysisId, note = "") {
  if (!analysisId) {
    showToast("An expert review needs a completed analysis reference.", "warn");
    return Promise.resolve(null);
  }
  return aiAPI.requestExpertReview(analysisId, note);
}
