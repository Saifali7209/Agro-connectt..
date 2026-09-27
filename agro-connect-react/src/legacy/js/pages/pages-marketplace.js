/** Public marketplace. */
import { marketplaceLayout, initMarketplace } from "../marketplace.js";
import { APP_CONFIG } from "../config.js";

export const meta = { title: "Marketplace", navKey: "marketplace" };

export function render(main) {
  main.innerHTML = marketplaceLayout({
    heading: "Marketplace",
    sub: "Live crop listings published directly by farmers across India.",
  });
  initMarketplace({ root: main, detailBase: `${APP_CONFIG.BASE_PATH}/pages/crop-details.html` });
}
