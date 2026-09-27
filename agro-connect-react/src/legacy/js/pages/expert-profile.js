/** Expert console — credentials and availability. */
import { pageHead, el, showToast, escapeHtml } from "./_builders.js";
import { CROP_TYPES } from "../../data/demo-data.js";
import { setBusy } from "../ui.js";
import { api } from "../api.js";

export const meta = { title: "Profile", navKey: "profile" };

export function render(main) {
  main.innerHTML = pageHead("Expert profile", "Your specialisation decides which cases reach your queue.")
    + `<form class="card" id="exp-form" novalidate style="max-width:720px">
      <div class="grid-2">
        <div class="field"><label for="e-name">Name</label><input id="e-name" name="name" type="text" required></div>
        <div class="field"><label for="e-qual">Qualification</label><input id="e-qual" name="qualification" type="text" placeholder="e.g. Ph.D. Plant Pathology"></div>
      </div>
      <div class="grid-2">
        <div class="field"><label for="e-org">Institution</label><input id="e-org" name="institution" type="text"></div>
        <div class="field"><label for="e-exp">Years of experience</label><input id="e-exp" name="experience" type="number" min="0"></div>
      </div>
      <fieldset class="field"><legend>Crops you review</legend>
        <div class="chips">${CROP_TYPES.map((c) => `<label class="chip"><input type="checkbox" name="crops" value="${escapeHtml(c)}"> ${escapeHtml(c)}</label>`).join("")}</div>
      </fieldset>
      <div class="field"><label for="e-avail">Availability</label><select id="e-avail" name="availability">
        <option>Accepting cases</option><option>Limited</option><option>Paused</option></select></div>
      <div class="field"><label for="e-bio">Short bio for farmers</label><textarea id="e-bio" name="bio" rows="4" maxlength="400"></textarea></div>
      <button class="btn btn-primary" type="submit">Save profile</button>
    </form>`;

  el("#exp-form", main).addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    const payload = Object.fromEntries(new FormData(e.target).entries());
    payload.crops = [...new FormData(e.target).getAll("crops")];
    setBusy(btn, true, "Saving…");
    try { await api.put("/expert/me", payload); showToast("Profile saved.", "success"); }
    catch { showToast("The server did not confirm the change.", "error"); }
    finally { setBusy(btn, false); }
  });
}
