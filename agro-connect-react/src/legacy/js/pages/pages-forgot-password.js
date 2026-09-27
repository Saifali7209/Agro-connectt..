/** Forgot password — request a reset link or OTP. */
import { authAPI } from "../api.js";
import { el, showToast, setBusy } from "../ui.js";
import { validateForm, rules } from "../validation.js";
import { APP_CONFIG } from "../config.js";

export const meta = { title: "Forgot password", navKey: "login" };
const B = APP_CONFIG.BASE_PATH;

export function render(main) {
  main.innerHTML = `<section class="section"><div class="container" style="max-width:460px">
    <div class="card">
      <h1>Reset your password</h1>
      <p class="text-muted">Enter the mobile number or email registered with Agro Connect and we'll send reset instructions.</p>
      <form id="forgot-form" novalidate style="margin-top:var(--sp-4)">
        <div class="field"><label for="identifier">Mobile number or email <span class="req">*</span></label>
          <input id="identifier" name="identifier" type="text" required autocomplete="username"></div>
        <button class="btn btn-primary btn-block" type="submit">Send reset instructions</button>
      </form>
      <p class="text-muted" style="margin-top:var(--sp-4);font-size:var(--fs-sm)">
        <a href="${B}/pages/login.html">Back to sign in</a></p>
    </div>
  </div></section>`;

  el("#forgot-form", main).addEventListener("submit", async (e) => {
    e.preventDefault();
    const { valid, values } = validateForm(e.target, { identifier: [rules.required] });
    if (!valid) return;
    const btn = e.target.querySelector('button[type="submit"]');
    setBusy(btn, true, "Sending…");
    try {
      await authAPI.forgotPassword(values.identifier);
      showToast("If that account exists, reset instructions are on their way.", "success");
    } catch {
      showToast("We couldn't start a reset right now. Please try again later.", "error");
    } finally { setBusy(btn, false); }
  });
}
