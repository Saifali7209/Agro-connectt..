/**
 * AGRO CONNECT — demo/live data switch.
 *
 * Marketplace-style screens fall back to clearly-labelled demo content while the
 * FastAPI backend is not running, so the interface stays reviewable.
 *
 * AI predictions, price forecasts and payments NEVER use this helper — those
 * surfaces must show a service-unavailable state instead of invented values.
 */
import { USE_DEMO_DATA } from "./config.js";

let backendOffline = false;

export async function loadData(fetcher, demoValue) {
  if (USE_DEMO_DATA) {
    if (backendOffline) {
      return { data: demoValue, demo: true };
    }
    try {
      const live = await Promise.race([
        fetcher(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("offline-fallback")), 700))
      ]);
      return { data: live, demo: false };
    } catch {
      backendOffline = true;
      return { data: demoValue, demo: true };
    }
  }
  const live = await fetcher();
  return { data: live, demo: false };
}

/** Strict loader: no fallback, ever. Used by AI, prediction and payment screens. */
export async function loadStrict(fetcher) {
  return await fetcher();
}
