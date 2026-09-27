/** Farmer console — weather and field advisories. */
import { pageHead, el, demoBanner, showError } from "./_builders.js";
import { fetchWeather, currentMarkup, forecastMarkup, alertsMarkup } from "../weather.js";

export const meta = { title: "Weather", navKey: "weather" };

export async function render(main) {
  main.innerHTML = pageHead("Weather", "Conditions and alerts for the location on your farm profile.")
    + `<div id="wx"><div class="skeleton" style="height:320px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#wx", main);
  try {
    const { data, demo } = await fetchWeather();
    host.innerHTML = (demo ? demoBanner("Sample weather layout — not a real reading.") : "")
      + currentMarkup(data)
      + `<div style="margin-top:var(--sp-5)">${alertsMarkup(data)}</div>`
      + `<div style="margin-top:var(--sp-5)">${forecastMarkup(data)}</div>`;
  } catch (error) { showError(host, error); }
}
