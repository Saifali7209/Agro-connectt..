/** Buyer console — marketplace search inside the console shell. */
import { pageHead, el, B } from "./_builders.js";
import { filterPanelMarkup, toolbarMarkup, initMarketplace } from "../marketplace.js";

export const meta = { title: "Find Crops", navKey: "find-crops" };

export async function render(main) {
  main.innerHTML = pageHead("Find crops", "Search verified farmer listings by crop, region, price and grade.")
    + `<div class="market-layout">${filterPanelMarkup()}
        <div class="stack">${toolbarMarkup()}<div id="results" aria-live="polite"></div></div></div>`;
  initMarketplace({ root: main, detailBase: `${B}/buyer/crop-details.html` });
}
