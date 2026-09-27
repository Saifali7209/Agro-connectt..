/** Home page — Agro Connect public landing. */
import { APP_CONFIG } from "../config.js";
import { fetchCrops } from "../crops.js";
import { cropCard } from "../crops.js";
import { el, demoBanner, skeletonGrid, showError } from "../ui.js";

export const meta = { title: "Agro Connect", navKey: "home" };
const B = APP_CONFIG.BASE_PATH;

export async function render(main) {
  main.innerHTML = `
  <section class="hero">
    <div class="container hero-grid">
      <div>
        <p class="eyebrow">Direct From Farmers. Direct To Buyers.</p>
        <h1>Sell Directly. Buy Fresh. Grow Together.</h1>
        <p class="hero-sub">Agro Connect connects farmers directly with buyers, making agricultural trade more
          transparent, simple and accessible.</p>
        <div class="btn-group" style="margin-top:var(--sp-5)">
          <a class="btn btn-primary btn-lg" href="${B}/farmer/add-crop.html">Sell Your Crop</a>
          <a class="btn btn-outline btn-lg" href="${B}/pages/marketplace.html">Find Crops</a>
          <a class="btn btn-accent btn-lg" href="${B}/pages/ai-crop-doctor.html">AI Crop Doctor</a>
        </div>
        <dl class="grid grid-3" style="margin-top:var(--sp-6)">
          <div><dt class="text-muted" style="font-size:var(--fs-xs);text-transform:uppercase;letter-spacing:.08em">Registered farmers</dt>
            <dd style="margin:0;font-family:var(--font-display);font-size:var(--fs-2xl)">5,200+</dd></div>
          <div><dt class="text-muted" style="font-size:var(--fs-xs);text-transform:uppercase;letter-spacing:.08em">Active buyers</dt>
            <dd style="margin:0;font-family:var(--font-display);font-size:var(--fs-2xl)">3,100+</dd></div>
          <div><dt class="text-muted" style="font-size:var(--fs-xs);text-transform:uppercase;letter-spacing:.08em">Districts covered</dt>
            <dd style="margin:0;font-family:var(--font-display);font-size:var(--fs-2xl)">112</dd></div>
        </dl>
      </div>
      <div class="hero-art">
        <img src="${B}/assets/images/hero-farm.jpg" width="1280" height="1024" fetchpriority="high"
             alt="An Indian farmer holding a crate of freshly harvested vegetables in his field at sunrise">
        <div class="hero-float one"><span class="text-muted" style="font-size:var(--fs-xs)">Today's potato rate</span>
          <strong>₹18 / kg</strong><span class="delta up" style="font-size:var(--fs-xs)">▲ 2.4% this week</span></div>
        <div class="hero-float two"><span class="text-muted" style="font-size:var(--fs-xs)">Payout to farmer</span>
          <strong>No middleman cut</strong></div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="row-between" style="margin-bottom:var(--sp-5)">
        <div><p class="eyebrow">How it works</p><h2>Three steps from field to buyer</h2></div>
      </div>
      <div class="grid grid-3">
        <article class="card"><span class="badge badge-primary">For farmers</span>
          <h3 style="margin-top:12px">List your crop in minutes</h3>
          <p class="text-muted">Add quantity, quality, price and photos from your phone. Update the rate whenever the market moves.</p>
          <a class="btn btn-outline btn-sm" href="${B}/farmer/add-crop.html">Add a crop</a></article>
        <article class="card"><span class="badge badge-primary">For buyers</span>
          <h3 style="margin-top:12px">Compare and book</h3>
          <p class="text-muted">Filter by crop, grade, location and quantity. See the farmer, the verification state and the harvest date before booking.</p>
          <a class="btn btn-outline btn-sm" href="${B}/pages/marketplace.html">Browse marketplace</a></article>
        <article class="card"><span class="badge badge-primary">For both</span>
          <h3 style="margin-top:12px">Negotiate, track, complete</h3>
          <p class="text-muted">Message directly, agree a fair rate, then follow the order through every stage until delivery.</p>
          <a class="btn btn-outline btn-sm" href="${B}/buyer/orders.html">See order tracking</a></article>
      </div>
    </div>
  </section>

  <section class="section section-alt">
    <div class="container">
      <div class="row-between" style="margin-bottom:var(--sp-5)">
        <div><p class="eyebrow">Marketplace</p><h2>Fresh listings</h2></div>
        <a class="btn btn-outline" href="${B}/pages/marketplace.html">View all listings</a>
      </div>
      <div id="home-listings">${skeletonGrid(3)}</div>
    </div>
  </section>

  <section class="section">
    <div class="container grid grid-2" style="align-items:center;gap:var(--sp-7)">
      <div>
        <p class="eyebrow">AI Crop Doctor</p>
        <h2>Crop health support, powered by the Agro Connect AI service</h2>
        <p class="text-muted">Upload a crop or leaf photo and the platform sends it to the Agro Connect assessment
          service. Results are shown only when the service returns them — the app never guesses a diagnosis, and
          low-confidence cases can be escalated to an agricultural expert.</p>
        <div class="btn-group"><a class="btn btn-primary" href="${B}/pages/ai-crop-doctor.html">Open AI Crop Doctor</a>
          <a class="btn btn-ghost" href="${B}/pages/about.html">How it works</a></div>
      </div>
      <img src="${B}/assets/images/farm-field.jpg" width="1024" height="768"
           style="border-radius:var(--radius-lg);box-shadow:var(--shadow-md)"
           alt="Neat crop rows stretching to the horizon in a rural Indian field">
    </div>
  </section>

  <section class="section section-alt">
    <div class="container text-center">
      <h2>Ready to trade directly?</h2>
      <p class="text-muted" style="max-width:56ch;margin-inline:auto">Create a free account as a farmer, a buyer or an
        agricultural expert and start on Agro Connect today.</p>
      <div class="btn-group" style="justify-content:center;margin-top:var(--sp-4)">
        <a class="btn btn-primary btn-lg" href="${B}/pages/register.html">Create account</a>
        <a class="btn btn-outline btn-lg" href="${B}/pages/login.html">Sign in</a>
      </div>
    </div>
  </section>`;

  const host = el("#home-listings", main);
  try {
    const { data, demo } = await fetchCrops();
    const list = (Array.isArray(data) ? data : data.items || []).slice(0, 3);
    host.innerHTML = `${demo ? demoBanner() : ""}<div class="crop-grid">${list.map((c) => cropCard(c)).join("")}</div>`;
  } catch (error) {
    showError(host, error);
  }
}
