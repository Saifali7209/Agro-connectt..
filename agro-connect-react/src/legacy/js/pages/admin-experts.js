import { renderUserPage } from "./admin-users.js";
export const meta = { title: "Experts", navKey: "experts" };
export const render = (main) => renderUserPage(main, {
  title: "Experts", sub: "Agronomists reviewing AI crop analyses.", role: "expert",
  navEmpty: "No expert accounts match this filter.",
});
