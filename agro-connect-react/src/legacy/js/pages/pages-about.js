/** About page. */
import { APP_CONFIG } from "../config.js";

export const meta = { title: "About", navKey: "about" };
const B = APP_CONFIG.BASE_PATH;

export function render(main) {
  main.innerHTML = `
  <section class="section">
    <div class="container" style="max-width:860px">
      <p class="eyebrow">About Agro Connect</p>
      <h1>A direct route between the field and the buyer</h1>
      <p class="hero-sub">Agro Connect removes the layers between growers and the people who buy their produce, so
        farmers keep more of the sale price and buyers know exactly where their crop comes from.</p>

      <h2 style="margin-top:var(--sp-7)">What the platform does</h2>
      <div class="grid grid-2">
        <article class="card"><h3>Marketplace</h3><p class="text-muted">Farmers publish live listings with quantity,
          grade, harvest date and price. Buyers search, compare and book without an intermediary.</p></article>
        <article class="card"><h3>Direct communication</h3><p class="text-muted">Built-in messaging and structured
          negotiation replace scattered phone calls, so both sides have one record of what was agreed.</p></article>
        <article class="card"><h3>AI-assisted crop health</h3><p class="text-muted">Photos are analysed by the Agro
          Connect assessment service. Results are decision support, never a replacement for an agronomist.</p></article>
        <article class="card"><h3>Expert verification</h3><p class="text-muted">Agricultural experts review
          low-confidence cases and correct them, which keeps advice trustworthy and improves the service over time.</p></article>
      </div>

      <h2 style="margin-top:var(--sp-7)">How we handle AI responsibly</h2>
      <ul class="tips" style="font-size:var(--fs-md)">
        <li>No assessment is displayed unless the backend service returns one.</li>
        <li>Low-confidence outputs are labelled as such and routed to a human expert.</li>
        <li>Treatment guidance always points to the approved local advisory, never an unverified prescription.</li>
        <li>Every case can be audited by the platform's agronomy team.</li>
      </ul>

      <div class="card" style="margin-top:var(--sp-6)">
        <h3>Built for backend integration</h3>
        <p class="text-muted">This interface is a standards-based HTML, CSS and JavaScript application. It talks to a
          FastAPI service over REST, which owns the database, authentication and all machine-learning work.</p>
        <a class="btn btn-primary" href="${B}/pages/contact.html">Talk to the team</a>
      </div>
    </div>
  </section>`;
}
