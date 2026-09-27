/** Farmer console — farm profile and verification. */
import { pageHead, el, showToast, statusBadge, escapeHtml } from "./_builders.js";
import { STATES, CROP_TYPES } from "../../data/demo-data.js";
import { userAPI } from "../api.js";
import { setBusy } from "../ui.js";

export const meta = { title: "My Farm", navKey: "profile" };

export function render(main) {
  main.innerHTML = pageHead("My farm", "Details buyers see on your public profile. Verification is reviewed by the Agro Connect team.")
    + `<div class="panel-grid">
      <form class="card" id="farm-form" novalidate>
        <h3 class="card-title">Farm details</h3>
        <div class="field"><label for="f-name">Full name</label><input id="f-name" name="name" type="text" required></div>
        <div class="grid-2">
          <div class="field"><label for="f-village">Village</label><input id="f-village" name="village" type="text"></div>
          <div class="field"><label for="f-district">District</label><input id="f-district" name="district" type="text"></div>
        </div>
        <div class="grid-2">
          <div class="field"><label for="f-state">State</label><select id="f-state" name="state">
            ${STATES.map((s) => `<option>${escapeHtml(s)}</option>`).join("")}</select></div>
          <div class="field"><label for="f-pin">PIN code</label><input id="f-pin" name="pincode" type="text" inputmode="numeric" pattern="[0-9]{6}"></div>
        </div>
        <div class="grid-2">
          <div class="field"><label for="f-size">Farm size</label><input id="f-size" name="farm_size" type="text" placeholder="e.g. 6.5 acres"></div>
          <div class="field"><label for="f-type">Farming type</label><select id="f-type" name="farming_type">
            <option>Conventional</option><option>Organic</option><option>Mixed</option></select></div>
        </div>
        <fieldset class="field"><legend>Main crops</legend>
          <div class="chips">${CROP_TYPES.slice(0, 10).map((c) => `<label class="chip"><input type="checkbox" name="main_crops" value="${escapeHtml(c)}"> ${escapeHtml(c)}</label>`).join("")}</div>
        </fieldset>
        <button class="btn btn-primary" type="submit">Save farm profile</button>
      </form>
      <div class="stack">
        <div class="card"><div class="card-head"><h3 class="card-title">Verification</h3>${statusBadge("Pending")}</div>
          <p class="text-muted" style="font-size:var(--fs-sm)">Upload land or identity proof. A reviewer confirms your account, and verified farms rank higher in buyer search.</p>
          <div class="field"><label for="f-doc">Verification document</label><input id="f-doc" type="file" accept="image/*,.pdf"></div>
          <button class="btn btn-outline" type="button" id="f-upload">Submit for verification</button>
        </div>
        <div class="card"><h3 class="card-title">Bank &amp; payout</h3>
          <p class="text-muted" style="font-size:var(--fs-sm)">Payout details are stored by the Agro Connect payment service. Never share your PIN or OTP with anyone.</p>
          <div class="field"><label for="f-upi">UPI ID</label><input id="f-upi" type="text" placeholder="name@bank"></div>
        </div>
      </div>
    </div>`;

  el("#farm-form", main).addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const payload = Object.fromEntries(new FormData(e.target).entries());
    payload.main_crops = [...new FormData(e.target).getAll("main_crops")];
    setBusy(btn, true, "Saving…");
    try { await userAPI.saveFarmerProfile(payload); showToast("Farm profile saved.", "success"); }
    catch { showToast("The server did not confirm the change. Please try again.", "error"); }
    finally { setBusy(btn, false); }
  });

  el("#f-upload", main).addEventListener("click", () =>
    showToast("Your document is submitted once the verification service confirms the upload.", "info"));
}
