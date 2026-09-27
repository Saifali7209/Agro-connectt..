/** Farmer console — listing management. */
import { renderMyCrops } from "./_builders.js";
export const meta = { title: "My Crops", navKey: "my-crops" };
export const render = (main) => renderMyCrops(main);
