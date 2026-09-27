/** Contact page with validated enquiry form. */
import { APP_CONFIG } from "../config.js";
import { el, showToast, setBusy } from "../ui.js";
import { validateForm, rules, bindLiveValidation } from "../validation.js";
import { api } from "../api.js";

export const meta = { title: "Contact", navKey: "contact" };

export function render(main) {
  main.innerHTML = `<section class="section"><div class="container grid grid-2" style="gap:var(--sp-7);align-items:start">
    <div>
      <p class="eyebrow">Contact</p>
      <h1>Talk to the Agro Connect team</h1>
      <p class="text-muted">Questions about listing a crop, buying in bulk, verification or the AI Crop Doctor —
        send a message and the team will reply.</p>
      <dl class="kv" style="margin-top:var(--sp-5)">
        <dt>Email</dt><dd>${APP_CONFIG.SUPPORT_EMAIL}</dd>
        <dt>Support hours</dt><dd>Monday to Saturday, 9 am – 7 pm IST</dd>
        <dt>Farmer helpline</dt><dd>Available in Hindi, Marathi, Punjabi, Kannada and English</dd>
      </dl>
    </div>
    <form class="card" id="contact-form" novalidate>
      <h2 class="card-title">Send a message</h2>
      <div class="form-grid" style="margin-top:var(--sp-4)">
        <div class="field"><label for="name">Full name <span class="req">*</span></label>
          <input id="name" name="name" type="text" required autocomplete="name"></div>
        <div class="field"><label for="email">Email <span class="req">*</span></label>
          <input id="email" name="email" type="email" required autocomplete="email"></div>
        <div class="field"><label for="phone">Mobile number</label>
          <input id="phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel"></div>
        <div class="field"><label for="topic">Topic</label>
          <select id="topic" name="topic"><option>Selling crops</option><option>Buying crops</option>
            <option>Verification</option><option>AI Crop Doctor</option><option>Something else</option></select></div>
        <div class="field full"><label for="message">Message <span class="req">*</span></label>
          <textarea id="message" name="message" required minlength="20" placeholder="Tell us how we can help"></textarea></div>
      </div>
      <button class="btn btn-primary btn-block" type="submit">Send message</button>
      <p class="text-muted" style="font-size:var(--fs-xs);margin-top:12px">We reply within one working day.</p>
    </form>
  </div></section>`;

  const form = el("#contact-form", main);
  const schema = {
    name: [rules.required, rules.minLength(2)],
    email: [rules.required, rules.email],
    phone: [rules.phoneIN],
    message: [rules.required, rules.minLength(20)],
  };
  bindLiveValidation(form, schema);
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const { valid, values } = validateForm(form, schema);
    if (!valid) return;
    const btn = form.querySelector('button[type="submit"]');
    setBusy(btn, true, "Sending…");
    try {
      await api.post("/contact", values);
      showToast("Thank you — your message has been sent.", "success");
      form.reset();
    } catch {
      showToast("We couldn't send your message right now. Please email us instead.", "error");
    } finally {
      setBusy(btn, false);
    }
  });
}
