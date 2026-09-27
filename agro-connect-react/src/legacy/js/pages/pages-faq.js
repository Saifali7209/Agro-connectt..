/** FAQ page. */
export const meta = { title: "FAQ", navKey: "faq" };

const FAQS = [
  { q: "Who can sell on Agro Connect?", a: "Any registered farmer with a verified profile. Verification asks for basic farm and identity details and is reviewed by the Agro Connect team." },
  { q: "Does Agro Connect take a cut of my sale?", a: "The platform connects you directly with buyers. Charges, when they apply, are shown clearly before an order is confirmed." },
  { q: "How is the price decided?", a: "The farmer sets the listed rate and can change it at any time. Buyers may send an offer, and both sides can counter until they agree." },
  { q: "Is the AI diagnosis guaranteed?", a: "No. The AI Crop Doctor is decision support. When confidence is low the case is flagged and can be sent to an agricultural expert for review." },
  { q: "What happens if the AI service is unavailable?", a: "The app tells you plainly that the service is unavailable. It never shows an invented result." },
  { q: "How do buyers know a farmer is genuine?", a: "Verified farmers carry a verification badge, and every completed order can be reviewed by the buyer." },
  { q: "Can I use Agro Connect on a basic smartphone?", a: "Yes. The interface is designed mobile-first with large touch targets, simple forms and a bottom navigation bar." },
  { q: "How is my data handled?", a: "Account data is held by the Agro Connect backend. The browser stores only display preferences, never passwords or payment details." },
];

export function render(main) {
  main.innerHTML = `<section class="section"><div class="container" style="max-width:800px">
    <p class="eyebrow">Support</p>
    <h1>Frequently asked questions</h1>
    <div class="stack" style="margin-top:var(--sp-5)">
      ${FAQS.map((f, i) => `<details class="card"${i === 0 ? " open" : ""}>
        <summary style="cursor:pointer;font-weight:700;font-family:var(--font-display);font-size:var(--fs-lg)">${f.q}</summary>
        <p class="text-muted" style="margin-top:var(--sp-3)">${f.a}</p></details>`).join("")}
    </div>
  </div></section>`;
}
