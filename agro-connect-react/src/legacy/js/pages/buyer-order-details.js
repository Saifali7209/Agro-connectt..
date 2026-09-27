import { renderOrderDetails } from "./_builders.js";
export const meta = { title: "Order details", navKey: "orders" };
export const render = (main) => renderOrderDetails(main, "buyer");
