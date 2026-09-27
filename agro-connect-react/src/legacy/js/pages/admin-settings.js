/** Admin console — platform settings. */
import { pageHead, el, showToast } from "./_builders.js";
import { setBusy } from "../ui.js";
import { API_CONFIG, APP_CONFIG } from "../config.js";

export const meta = { title: "Settings", navKey: "settings" };

export function render(main) {
  main.innerHTML = pageHead("Platform settings", "Marketplace rules, AI thresholds and integration details.")
    + `<div class="panel-grid">
      <form class="card" id="platform-form">
        <h3 class="card-title">Marketplace</h3>
        <div class="field"><label for="p-commission">Platform commission (%)</label>
          <input id="p-commission" name="commission" type="number" min="0" max="20" step="0.5" value="2"></div>
        <div class="field"><label for="p-minorder">Minimum order value (₹)</label>
          <input id="p-minorder" name="min_order" type="number" min="0" step="100" value="2000"></div>
        <div class="field"><label for="p-radius">Default delivery radius (km)</label>
          <input id="p-radius" name="radius" type="number" min="5" step="5" value="150"></div>
        <label class="checkline"><input type="checkbox" checked> Require farmer verification before publishing</label>
        <label class="checkline" style="margin-top:10px"><input type="checkbox" checked> Allow buyer counter-offers</label>
        <button class="btn btn-primary" type="submit" style="margin-top:var(--sp-4)">Save settings</button>
      </form>

      <div class="card">
        <h3 class="card-title">AI review thresholds</h3>
        <div class="field"><label for="a-low">Low-confidence cut-off</label>
          <input id="a-low" type="number" min="0" max="1" step="0.05" value="0.6"></div>
        <label class="checkline"><input type="checkbox" checked> Send low-confidence analyses to the expert queue</label>
        <label class="checkline" style="margin-top:10px"><input type="checkbox" checked> Show the expert-review prompt to farmers</label>
        <div class="notice notice-warn" style="margin-top:var(--sp-4)">AI findings are advisory. The platform never publishes a diagnosis without the confidence value returned by the model.</div>

        <hr class="divider">
        <h3 class="card-title">Integration</h3>
        <dl class="kv">
          <dt>API base URL</dt><dd><code>${API_CONFIG.BASE_URL}</code></dd>
          <dt>Request timeout</dt><dd>${API_CONFIG.TIMEOUT_MS} ms</dd>
          <dt>Upload timeout</dt><dd>${API_CONFIG.UPLOAD_TIMEOUT_MS} ms</dd>
          <dt>Support inbox</dt><dd>${APP_CONFIG.SUPPORT_EMAIL}</dd>
        </dl>
      </div>
    </div>`;

  el("#platform-form", main).addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    setBusy(btn, true, "Saving…");
    setTimeout(() => { setBusy(btn, false); showToast("Settings are stored once the server confirms the change.", "info"); }, 500);
  });
}
