/** AGRO CONNECT — form validation shared by every form in the app. */
import { UPLOAD_CONFIG } from "./config.js";
import { readableBytes } from "./utils.js";

export const rules = {
  required: (v) => (String(v ?? "").trim() ? null : "This field is required."),
  email: (v) => (!v || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : "Enter a valid email address."),
  phoneIN: (v) => (!v || /^[6-9]\d{9}$/.test(String(v).replace(/\D/g, "").slice(-10)) ? null : "Enter a valid 10-digit mobile number."),
  pincode: (v) => (!v || /^[1-9]\d{5}$/.test(v) ? null : "Enter a valid 6-digit PIN code."),
  min: (n) => (v) => (v === "" || Number(v) >= n ? null : `Must be at least ${n}.`),
  max: (n) => (v) => (v === "" || Number(v) <= n ? null : `Must be ${n} or less.`),
  minLength: (n) => (v) => (!v || String(v).length >= n ? null : `Use at least ${n} characters.`),
  positive: (v) => (v === "" || Number(v) > 0 ? null : "Enter a number greater than zero."),
  password: (v) => (!v || (String(v).length >= 8 && /[A-Za-z]/.test(v) && /\d/.test(v)) ? null : "Use 8+ characters with a letter and a number."),
  match: (otherValue, label = "values") => (v) => (v === otherValue ? null : `The ${label} do not match.`),
  date: (v) => (!v || !Number.isNaN(Date.parse(v)) ? null : "Enter a valid date."),
  otp: (v) => (/^\d{6}$/.test(String(v || "")) ? null : "Enter the 6-digit code."),
};

/** Attach/replace the error message for one field. */
export function setFieldError(input, message) {
  if (!input) return;
  const field = input.closest(".field") || input.parentElement;
  let slot = field?.querySelector(".error-text");
  if (!slot && field) {
    slot = document.createElement("p");
    slot.className = "error-text";
    slot.setAttribute("role", "alert");
    field.append(slot);
  }
  if (slot) slot.textContent = message || "";
  input.setAttribute("aria-invalid", message ? "true" : "false");
}

export function clearErrors(form) {
  form.querySelectorAll(".error-text").forEach((n) => (n.textContent = ""));
  form.querySelectorAll("[aria-invalid]").forEach((n) => n.setAttribute("aria-invalid", "false"));
}

/**
 * validateForm(form, schema) -> { valid, values, errors }
 * schema: { fieldName: [rule, rule] }
 */
export function validateForm(form, schema = {}) {
  clearErrors(form);
  const values = Object.fromEntries(new FormData(form).entries());
  const errors = {};

  // Native HTML5 constraints first (type=email, required, min, max, pattern…)
  [...form.elements].forEach((input) => {
    if (!input.name || input.disabled || input.type === "file") return;
    if (!input.checkValidity()) errors[input.name] ||= input.validationMessage;
  });

  Object.entries(schema).forEach(([name, list]) => {
    const input = form.elements[name];
    const value = values[name] ?? (input?.type === "checkbox" ? input.checked : "");
    for (const rule of list) {
      const msg = rule(value, values);
      if (msg) { errors[name] = msg; break; }
    }
  });

  Object.entries(errors).forEach(([name, msg]) => setFieldError(form.elements[name], msg));
  const first = form.querySelector('[aria-invalid="true"]');
  if (first) first.focus();

  return { valid: !Object.keys(errors).length, values, errors };
}

/** Map a FastAPI 422 body ({field: message}) onto the form. */
export function applyServerErrors(form, details) {
  if (!details || typeof details !== "object") return;
  Object.entries(details).forEach(([field, msg]) => setFieldError(form.elements[field], String(msg)));
}

/** Live validation on blur for a single field. */
export function bindLiveValidation(form, schema) {
  Object.keys(schema).forEach((name) => {
    const input = form.elements[name];
    if (!input || !input.addEventListener) return;
    input.addEventListener("blur", () => {
      const value = input.type === "checkbox" ? input.checked : input.value;
      let message = null;
      for (const rule of schema[name]) { message = rule(value); if (message) break; }
      setFieldError(input, message);
    });
  });
}

/** Shared image validation for crop photos and AI uploads. */
export function validateImages(files, { max = UPLOAD_CONFIG.MAX_FILES, existing = 0 } = {}) {
  const accepted = [];
  const errors = [];
  for (const file of files) {
    if (accepted.length + existing >= max) { errors.push(`You can upload up to ${max} images.`); break; }
    if (!UPLOAD_CONFIG.ACCEPTED_TYPES.includes(file.type)) { errors.push(`${file.name}: only ${UPLOAD_CONFIG.ACCEPTED_LABEL} are accepted.`); continue; }
    if (file.size > UPLOAD_CONFIG.MAX_FILE_MB * 1024 * 1024) {
      errors.push(`${file.name} is ${readableBytes(file.size)} — the limit is ${UPLOAD_CONFIG.MAX_FILE_MB} MB.`);
      continue;
    }
    accepted.push(file);
  }
  return { accepted, errors };
}
