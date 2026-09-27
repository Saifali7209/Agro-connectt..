/** Buyer console — reviews left for farmers. */
import { pageHead, el, demoBanner, showError, showToast, escapeHtml, formatDate } from "./_builders.js";
import { loadData } from "../data-source.js";
import { reviewAPI } from "../api.js";
import { DEMO_REVIEWS } from "../../data/demo-data.js";
import { setBusy } from "../ui.js";

export const meta = { title: "Reviews", navKey: "reviews" };

export async function render(main) {
  main.innerHTML = pageHead("Reviews", "Rate the farmers you bought from — verified buyers only.")
    + `<div class="panel-grid">
      <form class="card" id="review-form" novalidate>
        <h3 class="card-title">Write a review</h3>
        <div class="field"><label for="r-order">Order reference</label><input id="r-order" name="order_id" type="text" required></div>
        <div class="field"><label for="r-rating">Rating</label><select id="r-rating" name="rating">
          ${[5, 4, 3, 2, 1].map((n) => `<option value="${n}">${"★".repeat(n)}</option>`).join("")}</select></div>
        <div class="field"><label for="r-text">Your experience</label><textarea id="r-text" name="text" rows="4" maxlength="500" required></textarea></div>
        <button class="btn btn-primary" type="submit">Publish review</button>
      </form>
      <div id="review-list"><div class="skeleton" style="height:260px;border-radius:var(--radius-lg)"></div></div>
    </div>`;

  const list = el("#review-list", main);
  try {
    const { data, demo } = await loadData(() => reviewAPI.list(), DEMO_REVIEWS);
    list.innerHTML = (demo ? demoBanner("Sample reviews for layout review.") : "")
      + data.map((r) => `<article class="card" style="margin-bottom:var(--sp-3)">
        <div class="card-head"><strong>${escapeHtml(r.farmer)}</strong><span>${"★".repeat(r.rating)}</span></div>
        <p style="margin:0">${escapeHtml(r.text)}</p>
        <p class="text-muted" style="font-size:var(--fs-xs);margin:6px 0 0">${formatDate(r.at)}</p></article>`).join("");
  } catch (error) { showError(list, error); }

  el("#review-form", main).addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!e.target.checkValidity()) { e.target.reportValidity(); return; }
    const btn = e.target.querySelector('button[type="submit"]');
    setBusy(btn, true, "Publishing…");
    try { await reviewAPI.create(Object.fromEntries(new FormData(e.target).entries())); showToast("Review published.", "success"); e.target.reset(); }
    catch { showToast("The review could not be published right now.", "error"); }
    finally { setBusy(btn, false); }
  });
}
