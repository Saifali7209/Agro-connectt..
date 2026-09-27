import { renderUserPage } from "./admin-users.js";
export const meta = { title: "Buyers", navKey: "buyers" };
export const render = (main) => renderUserPage(main, {
  title: "Buyers", sub: "Traders, retailers and processors purchasing on the platform.", role: "buyer",
  navEmpty: "No buyer accounts match this filter.",
});
