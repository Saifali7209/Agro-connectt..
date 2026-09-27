/** Buyer console — order placement (POST /orders). With Price Negotiation / Make an Offer. */
import { pageHead, el, showError, showToast, escapeHtml, formatCurrency, formatNumber, initials, B } from "./_builders.js";
import { fetchCrop } from "../crops.js";
import { summaryBlock, createNegotiationOrder } from "../orders.js";
import { orderAPI } from "../api.js";
import { setBusy } from "../ui.js";
import { queryParams } from "../utils.js";
import { legacyNavigate } from "../../../utils/legacyHref.js";

export const meta = { title: "Checkout", navKey: "find-crops" };

export async function render(main) {
  const params = queryParams();
  const id = params.id || params.crop || params.crop_id;
  main.innerHTML = pageHead("Place order", "Confirm quantity, delivery, or make a negotiated offer. The farmer reviews before payment.");
  const host = document.createElement("div");
  host.className = "panel-grid";
  main.append(host);
  try {
    const { data: crop } = await fetchCrop(id);
    host.innerHTML = `<form class="card" id="order-form" novalidate>
        <!-- Crop Overview Card Header -->
        <div class="checkout-crop-header" style="display:flex;gap:var(--sp-3);margin-bottom:var(--sp-4);padding-bottom:var(--sp-3);border-bottom:1px solid var(--color-border);align-items:flex-start;">
          <img src="${escapeHtml(crop.image)}" alt="${escapeHtml(crop.name)} — ${escapeHtml(crop.variety)}" style="width:110px;height:90px;object-fit:cover;border-radius:var(--radius-md);flex-shrink:0;box-shadow:var(--shadow-sm);border:1px solid var(--color-border);">
          <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:2px;">
              <h3 class="card-title" style="margin:0;font-size:var(--fs-xl);">${escapeHtml(crop.name)}</h3>
              <span class="badge badge-primary" style="font-size:11px;">${escapeHtml(crop.grade || "Grade A")}</span>
              ${crop.organic ? '<span class="badge badge-success" style="font-size:11px;">Organic</span>' : ''}
            </div>
            <p class="crop-variety text-muted" style="margin:2px 0 6px 0;font-size:var(--fs-sm);">${escapeHtml(crop.variety)} · ${escapeHtml(crop.category || "Produce")}</p>
            
            <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:6px;font-size:var(--fs-xs);background:var(--color-bg-subtle, #f8fafc);padding:8px 10px;border-radius:var(--radius-sm);border:1px solid var(--color-border-light, #e2e8f0);">
              <div><span class="text-muted">Farmer:</span> <strong>${escapeHtml(crop.farmer?.name || "Verified Farmer")}</strong> ${crop.farmer?.verified ? '<span style="color:var(--color-success,#16a34a)">✓</span>' : ''}</div>
              <div><span class="text-muted">Location:</span> <strong>${escapeHtml(crop.farmer?.district || "Local")}, ${escapeHtml(crop.farmer?.state || "")}</strong></div>
              <div><span class="text-muted">Listed Rate:</span> <strong style="color:var(--color-primary-dark);">${formatCurrency(crop.price)}/${escapeHtml(crop.unit)}</strong></div>
              <div><span class="text-muted">Available Stock:</span> <strong>${formatNumber(crop.quantity)} ${escapeHtml(crop.unit)}</strong></div>
              <div><span class="text-muted">Min. Order:</span> <strong>${formatNumber(crop.min_order)} ${escapeHtml(crop.unit)}</strong></div>
              ${crop.farmer?.rating ? `<div><span class="text-muted">Rating:</span> <strong>★ ${crop.farmer.rating}</strong></div>` : ''}
            </div>
          </div>
        </div>

        <!-- Price Negotiation Section -->
        <div class="card card-tight" style="margin:var(--sp-3) 0;background:var(--color-bg);border:1px dashed var(--color-primary-light,#81c784);padding:14px;border-radius:var(--radius-md);">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
            <strong style="font-size:var(--fs-sm);color:var(--color-primary-dark);display:flex;align-items:center;gap:6px;">
              <span>🤝 Price Negotiation / Make an Offer</span>
            </strong>
            <span class="badge badge-outline" style="font-size:11px;">Optional</span>
          </div>
          <p class="text-muted" style="font-size:var(--fs-xs);margin:0 0 10px 0;">
            Want to negotiate a bulk or lower rate? Enter your counter-offer price below. The farmer will review and Accept or Reject your offer.
          </p>
          <div class="field" style="margin-bottom:10px;">
            <label for="o-offer-price" style="font-size:var(--fs-xs);font-weight:600;">Your Offer Price (₹/${escapeHtml(crop.unit)})</label>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="font-size:var(--fs-md);color:var(--color-muted);font-weight:bold;">₹</span>
              <input id="o-offer-price" name="offer_price" type="number" min="1" step="0.5" placeholder="e.g. ${Math.round(crop.price * 0.85)}" style="flex:1;">
              <span class="text-muted" style="font-size:var(--fs-xs);white-space:nowrap;">per ${escapeHtml(crop.unit)}</span>
            </div>
            <p class="text-muted" style="font-size:11px;margin:3px 0 0 0;">Listed price is ${formatCurrency(crop.price)}/${escapeHtml(crop.unit)}. Enter a negotiated price if desired.</p>
          </div>
          <div class="field" style="margin-bottom:0;">
            <label for="o-offer-note" style="font-size:var(--fs-xs);font-weight:600;">Message / Reason for offer (optional)</label>
            <input id="o-offer-note" name="offer_note" type="text" maxlength="160" placeholder="e.g. Regular bulk requirement of ${crop.min_order * 2} ${crop.unit}/week, looking for discounted rate">
          </div>
        </div>

        <div class="field"><label for="o-qty">Quantity (${escapeHtml(crop.unit)})</label>
          <input id="o-qty" name="quantity" type="number" min="${crop.min_order}" max="${crop.quantity}" value="${crop.min_order}" required>
          <p class="text-muted" style="font-size:11px;margin:3px 0 0 0;">Available: ${formatNumber(crop.quantity)} ${escapeHtml(crop.unit)} · Min. order: ${formatNumber(crop.min_order)} ${escapeHtml(crop.unit)}</p>
        </div>
        <div class="field"><label for="o-mode">Delivery</label><select id="o-mode" name="delivery_mode">
          ${crop.delivery.map((d) => `<option>${escapeHtml(d)}</option>`).join("")}</select></div>
        <div class="field"><label for="o-addr">Delivery address</label><textarea id="o-addr" name="address" rows="3" required></textarea></div>
        <div class="field"><label for="o-date">Preferred date</label><input id="o-date" name="expected" type="date"></div>
        <div class="field"><label for="o-note">General note for the farmer</label><input id="o-note" name="note" type="text" maxlength="160"></div>
        <button class="btn btn-primary" id="btn-submit-order" type="submit">Send order request</button>
      </form>
      <div class="stack">
        <div id="summary"></div>
        <div class="card" style="padding:14px;">
          <h4 class="card-title" style="font-size:var(--fs-sm);margin-bottom:8px;">Farmer & Sourcing Details</h4>
          <div style="display:flex;align-items:center;gap:10px;">
            <span class="avatar avatar-md" aria-hidden="true" style="width:36px;height:36px;font-size:13px;">${initials(crop.farmer?.name || "Farmer")}</span>
            <div style="font-size:var(--fs-xs);line-height:1.4;">
              <strong>${escapeHtml(crop.farmer?.name || "Farmer")}</strong>
              ${crop.farmer?.verified ? '<span class="badge badge-success" style="font-size:10px;padding:1px 5px;margin-left:4px;">Verified</span>' : ''}<br>
              <span class="text-muted">${escapeHtml(crop.farmer?.village ? crop.farmer.village + ", " : "")}${escapeHtml(crop.farmer?.district || "")}, ${escapeHtml(crop.farmer?.state || "")}</span><br>
              ${crop.farmer?.rating ? `<span style="color:#eab308;font-weight:600;">★ ${crop.farmer.rating} rating</span>` : ''}
            </div>
          </div>
        </div>
        <div class="notice notice-info">
          The farmer reviews your offer or order request before any payment is collected. You can track negotiation status in your Orders tab.
        </div>
      </div>`;

    const qty = el("#o-qty", host);
    const offerInput = el("#o-offer-price", host);
    const submitBtn = el("#btn-submit-order", host);

    const draw = () => {
      const offerVal = parseFloat(offerInput.value);
      const hasOffer = !isNaN(offerVal) && offerVal > 0;
      el("#summary", host).innerHTML = summaryBlock({
        price: crop.price,
        unit: crop.unit,
        quantity: Number(qty.value || 0),
        deliveryFee: 0,
        offerPrice: hasOffer ? offerVal : null,
      });

      if (hasOffer) {
        submitBtn.textContent = `Send Negotiation Offer (${formatCurrency(offerVal)}/${crop.unit})`;
      } else {
        submitBtn.textContent = "Send order request";
      }
    };

    qty.addEventListener("input", draw);
    offerInput.addEventListener("input", draw);
    draw();

    el("#order-form", host).addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!e.target.checkValidity()) { e.target.reportValidity(); return; }
      const btn = e.target.querySelector('button[type="submit"]');
      setBusy(btn, true, "Sending…");
      const formData = Object.fromEntries(new FormData(e.target).entries());
      const offerPrice = formData.offer_price ? Number(formData.offer_price) : null;
      const hasOffer = offerPrice !== null && !isNaN(offerPrice) && offerPrice > 0;

      try {
        // Create persistent order with negotiation data in local storage store
        const newOrder = createNegotiationOrder(crop, formData);

        // Attempt backend POST if server is reachable
        try {
          await orderAPI.create({
            crop_id: crop.id,
            ...formData,
            offer_price: hasOffer ? offerPrice : undefined,
            offer_note: formData.offer_note,
            status: hasOffer ? "Pending" : "Order Placed",
          });
        } catch { /* offline fallback safely handled */ }

        if (hasOffer) {
          showToast(`Price negotiation request (${formatCurrency(offerPrice)}/${crop.unit}) sent to the farmer for review!`, "success");
        } else {
          showToast("Order request sent to the farmer.", "success");
        }
        setTimeout(() => {
          legacyNavigate(`${B}/buyer/orders.html`);
        }, 500);
      } catch {
        showToast("The order could not be sent.", "error");
      } finally {
        setBusy(btn, false);
      }
    });
  } catch (error) { showError(host, error); }
}
