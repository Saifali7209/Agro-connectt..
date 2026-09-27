/** Reset password with OTP-ready fields. */
import { authAPI } from "../api.js";
import { el, showToast, setBusy } from "../ui.js";
import { validateForm, rules } from "../validation.js";
import { APP_CONFIG } from "../config.js";
import { queryParams } from "../utils.js";
import { legacyNavigate } from "../../../utils/legacyHref.js";

export const meta = { title: "Set a new password", navKey: "login" };
const B = APP_CONFIG.BASE_PATH;

export function render(main) {
  const { token = "" } = queryParams();
  main.innerHTML = `<section class="section"><div class="container" style="max-width:460px">
    <div class="card">
      <h1>Set a new password</h1>
      <p class="text-muted">Enter the code you received and choose a new password.</p>
      <form id="reset-form" novalidate style="margin-top:var(--sp-4)">
        <input type="hidden" name="token" value="${token}">
        <div class="field"><label for="code">6-digit code <span class="req">*</span></label>
          <input id="code" name="code" type="text" inputmode="numeric" maxlength="6" required autocomplete="one-time-code"></div>
        <div class="field"><label for="password">New password <span class="req">*</span></label>
          <input id="password" name="password" type="password" required autocomplete="new-password"></div>
        <div class="field"><label for="confirm">Confirm new password <span class="req">*</span></label>
          <input id="confirm" name="confirm" type="password" required autocomplete="new-password"></div>
        <button class="btn btn-primary btn-block" type="submit">Update password</button>
      </form>
      <p class="text-muted" style="margin-top:var(--sp-4);font-size:var(--fs-sm)">
        <a href="${B}/pages/login.html">Back to sign in</a></p>
    </div>
  </div></section>`;

  el("#reset-form", main).addEventListener("submit", async (e) => {
    e.preventDefault();
    const { valid, values } = validateForm(e.target, {
      code: [rules.otp],
      password: [rules.required, rules.password],
      confirm: [rules.required, (v, all) => (v === all.password ? null : "The passwords do not match.")],
    });
    if (!valid) return;
    const btn = e.target.querySelector('button[type="submit"]');
    setBusy(btn, true, "Updating…");
    try {
      await authAPI.resetPassword(values);
      showToast("Password updated. Please sign in.", "success");
      setTimeout(() => { legacyNavigate(`${B}/pages/login.html`); }, 900);
    } catch {
      showToast("We couldn't update the password. The code may have expired.", "error");
    } finally { setBusy(btn, false); }
  });
}
