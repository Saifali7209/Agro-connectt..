import { renderOrders } from "./_builders.js";
export const meta = { title: "Orders", navKey: "orders" };
export const render = (main) => renderOrders(main, "buyer");
