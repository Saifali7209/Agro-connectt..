import { renderUserPage } from "./admin-users.js";
export const meta = { title: "Farmers", navKey: "farmers" };
export const render = (main) => renderUserPage(main, {
  title: "Farmers", sub: "Registered growers, their state and verification status.", role: "farmer",
  navEmpty: "No farmer accounts match this filter.",
});
