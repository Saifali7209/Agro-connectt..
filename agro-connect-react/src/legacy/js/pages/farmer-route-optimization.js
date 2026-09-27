/**
 * AGRO CONNECT — Farmer Route Optimization View
 * Re-exports the route optimization view with farmer console metadata.
 */
import { render as renderRouteOpt, meta as baseMeta } from "./buyer-route-optimization.js";

export const meta = {
  ...baseMeta,
  navKey: "route-optimization"
};

export const render = renderRouteOpt;
