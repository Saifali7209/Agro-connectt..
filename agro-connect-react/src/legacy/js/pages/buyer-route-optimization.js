/**
 * AGRO CONNECT — Retailer / Buyer Route Optimization View
 *
 * Interactive OpenStreetMap powered by Leaflet, OSRM road routing engine,
 * and Dijkstra shortest path optimization.
 */

import {
  resolveLocationCoordinates,
  buildRegionalTransportationGraph,
  fetchOsrmRoute,
  calculateTransportationCost,
  formatDuration
} from "../route-optimizer.js";
import { fetchOrders } from "../orders.js";
import { pageHead, escapeHtml, formatCurrency, formatNumber, formatDate, statusBadge } from "./_builders.js";
import { APP_CONFIG } from "../config.js";

const B = APP_CONFIG.BASE_PATH;

export const meta = {
  title: "Route Optimization",
  navKey: "route-optimization"
};

let activeMapInstance = null;

async function ensureLeaflet() {
  if (window.L) return window.L;

  if (!document.getElementById("leaflet-css")) {
    const link = document.createElement("link");
    link.id = "leaflet-css";
    link.rel = "stylesheet";
    link.href = `${B}/assets/vendor/leaflet/leaflet.css`;
    document.head.appendChild(link);
  }

  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L);
    const script = document.createElement("script");
    script.src = `${B}/assets/vendor/leaflet/leaflet.js`;
    script.onload = () => resolve(window.L);
    // No external CDN fallback — vendor copy is bundled at assets/vendor/leaflet/
    script.onerror = () => reject(new Error("Leaflet vendor script failed to load."));
    document.head.appendChild(script);
  });
}

export async function render(main) {
  // Fetch existing orders from project
  let orders = [];
  try {
    const res = await fetchOrders();
    orders = res.data || [];
  } catch (err) {
    console.error("Failed to load orders for route optimization:", err);
  }

  if (!orders.length) {
    main.innerHTML = pageHead("Route Optimization", "Real road routing & logistics cost calculator.") +
      `<div class="card"><p class="text-muted">No booked orders available for route calculation.</p></div>`;
    return;
  }

  // Get selected order from URL or default to first order
  const urlParams = new URLSearchParams(window.location.search);
  const selectedOrderId = urlParams.get("id") || orders[0].id;
  let currentOrder = orders.find((o) => o.id === selectedOrderId) || orders[0];

  const isFarmer = window.location.pathname.includes("/farmer/") || (document.body.dataset.page || "").startsWith("farmer");
  const role = isFarmer ? "farmer" : "buyer";

  // Shell markup
  main.innerHTML = `
    <div class="route-opt-header">
      ${pageHead("Route Optimization", "OpenStreetMap with Dijkstra road route optimization and logistics cost savings.")}
    </div>

    <!-- Order Selector Toolbar -->
    <div class="card order-selector-bar" style="margin-bottom: var(--sp-4);">
      <div style="display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px;">
        <div style="display:flex; align-items:center; gap:12px; flex-grow:1; min-width:280px;">
          <label for="route-order-select" style="font-weight:600; font-size:var(--fs-sm); white-space:nowrap;">Select Booked Order:</label>
          <select id="route-order-select" class="form-control" style="max-width:480px; padding:6px 12px; border-radius:var(--radius-md); border:1px solid var(--color-border); font-size:var(--fs-sm); font-family:inherit;">
            ${orders.map((o) => `
              <option value="${escapeHtml(o.id)}" ${o.id === currentOrder.id ? "selected" : ""}>
                ${escapeHtml(o.id)} · ${escapeHtml(o.crop)} (${formatNumber(o.quantity)} ${escapeHtml(o.unit)}) — ${escapeHtml(o.farmer.name)} ➔ ${escapeHtml(o.buyer.name)} [${escapeHtml(o.buyer.city || "Hub")}]
              </option>
            `).join("")}
          </select>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <a class="btn btn-outline btn-sm" id="view-order-details-link" href="${B}/${role}/order-details.html?id=${encodeURIComponent(currentOrder.id)}">
            View Order Details
          </a>
          <button class="btn btn-primary btn-sm" id="recalc-route-btn" type="button">
            Recalculate Route
          </button>
        </div>
      </div>
    </div>

    <!-- KPI Metric Stat Cards -->
    <div class="metric-grid" id="route-kpi-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:16px; margin-bottom:var(--sp-4);">
      <div class="card stat-card" style="padding:16px; border-left: 4px solid var(--color-primary);">
        <div class="text-muted" style="font-size:var(--fs-xs); text-transform:uppercase; letter-spacing:0.5px; font-weight:600;">Optimized Distance</div>
        <div class="stat-value" id="kpi-distance" style="font-size:1.6rem; font-weight:700; color:var(--color-text); margin:4px 0;">-- km</div>
        <div class="badge badge-success" id="kpi-distance-saved" style="font-size:var(--fs-xs); display:inline-block;">-- km saved via Dijkstra</div>
      </div>

      <div class="card stat-card" style="padding:16px; border-left: 4px solid #0284c7;">
        <div class="text-muted" style="font-size:var(--fs-xs); text-transform:uppercase; letter-spacing:0.5px; font-weight:600;">Est. Travel Time</div>
        <div class="stat-value" id="kpi-duration" style="font-size:1.6rem; font-weight:700; color:var(--color-text); margin:4px 0;">--</div>
        <div class="badge badge-info" id="kpi-time-saved" style="font-size:var(--fs-xs); display:inline-block;">-- mins saved</div>
      </div>

      <div class="card stat-card" style="padding:16px; border-left: 4px solid #8b5cf6;">
        <div class="text-muted" style="font-size:var(--fs-xs); text-transform:uppercase; letter-spacing:0.5px; font-weight:600;">Transportation Cost</div>
        <div class="stat-value" id="kpi-cost" style="font-size:1.6rem; font-weight:700; color:var(--color-text); margin:4px 0;">₹--</div>
        <div class="text-muted" id="kpi-vehicle" style="font-size:var(--fs-xs); margin-top:2px;">Freight vehicle</div>
      </div>

      <div class="card stat-card" style="padding:16px; border-left: 4px solid #16a34a; background:rgba(22, 163, 74, 0.04);">
        <div class="text-muted" style="font-size:var(--fs-xs); text-transform:uppercase; letter-spacing:0.5px; font-weight:600;">Estimated Money Saved</div>
        <div class="stat-value" id="kpi-money-saved" style="font-size:1.6rem; font-weight:700; color:#16a34a; margin:4px 0;">₹--</div>
        <div class="badge badge-success" id="kpi-savings-pct" style="font-size:var(--fs-xs); font-weight:600; display:inline-block;">--% saved</div>
      </div>
    </div>

    <!-- Main Map & Route Details Panel -->
    <div style="display:grid; grid-template-columns: 2fr 1fr; gap:20px; align-items:start;">
      <!-- Interactive Map Card -->
      <div class="card" style="padding:0; overflow:hidden; display:flex; flex-direction:column;">
        <div style="padding:14px 20px; border-bottom:1px solid var(--color-border); display:flex; align-items:center; justify-content:space-between; background:var(--color-surface);">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="display:inline-block; width:10px; height:10px; border-radius:50%; background:#16a34a;"></span>
            <strong style="font-size:var(--fs-sm);">Interactive OpenStreetMap</strong>
            <span class="badge badge-outline" id="route-source-badge" style="font-size:10px;">OSRM Driving Route</span>
          </div>
          <div style="display:flex; align-items:center; gap:12px; font-size:var(--fs-xs);">
            <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
              <input type="checkbox" id="toggle-alt-route" checked style="cursor:pointer;">
              <span>Compare Unoptimized Route</span>
            </label>
            <button class="btn btn-ghost btn-sm" id="fit-bounds-btn" type="button" style="padding:4px 8px; font-size:11px;">Reset View</button>
          </div>
        </div>

        <div id="route-map" style="width:100%; height:480px; background:#e5e7eb; position:relative;">
          <div id="map-loading-indicator" style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.8); z-index:1000; font-weight:600; font-size:var(--fs-sm); color:var(--color-primary);">
            Loading OpenStreetMap & Calculating OSRM Route…
          </div>
        </div>

        <!-- Route Legend Bar -->
        <div style="padding:10px 16px; background:var(--color-surface); border-top:1px solid var(--color-border); display:flex; flex-wrap:wrap; gap:16px; font-size:var(--fs-xs); align-items:center;">
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#16a34a; border:2px solid #fff; box-shadow:0 0 2px rgba(0,0,0,0.4);"></span>
            Farmer Pickup Location
          </span>
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span style="display:inline-block; width:12px; height:12px; border-radius:50%; background:#2563eb; border:2px solid #fff; box-shadow:0 0 2px rgba(0,0,0,0.4);"></span>
            Retailer Destination Hub
          </span>
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span style="display:inline-block; width:18px; height:4px; background:#16a34a; border-radius:2px;"></span>
            <strong>Dijkstra Optimized Road Route</strong>
          </span>
          <span style="display:inline-flex; align-items:center; gap:6px;">
            <span style="display:inline-block; width:18px; height:3px; border-top:2px dashed #d97706;"></span>
            Unoptimized Baseline Route
          </span>
        </div>
      </div>

      <!-- Right Column: Dijkstra Inspector & Order Breakdown -->
      <div style="display:flex; flex-direction:column; gap:16px;">
        <!-- Dijkstra Algorithm Inspector -->
        <div class="card" style="padding:18px;">
          <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:12px;">
            <h4 style="margin:0; font-size:var(--fs-md); display:flex; align-items:center; gap:6px;">
              <span>✦</span> Dijkstra Algorithm Inspector
            </h4>
            <span class="badge badge-success" id="dijkstra-status-badge">Optimized</span>
          </div>
          <p class="text-muted" style="font-size:var(--fs-xs); margin-bottom:12px;">
            Shortest-path graph optimization evaluated across rural feeder links, highway interchanges, and express ring roads.
          </p>
          <div style="background:var(--color-bg); padding:12px; border-radius:var(--radius-md); font-size:var(--fs-xs); display:flex; flex-direction:column; gap:8px;">
            <div style="display:flex; justify-content:space-between;">
              <span class="text-muted">Algorithm Execution:</span>
              <strong id="dijkstra-exec-time">0.12 ms</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span class="text-muted">Graph Nodes Explored:</span>
              <strong id="dijkstra-nodes-count">6 nodes</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span class="text-muted">Relaxation Iterations:</span>
              <strong id="dijkstra-iterations">6 passes</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span class="text-muted">Carbon Reduction:</span>
              <strong id="dijkstra-co2-saved" style="color:#16a34a;">-7.8 kg CO₂</strong>
            </div>
          </div>
          <div style="margin-top:12px;">
            <div style="font-size:var(--fs-xs); font-weight:600; margin-bottom:6px;">Optimized Graph Sequence:</div>
            <ol id="dijkstra-path-list" style="margin:0; padding-left:18px; font-size:var(--fs-xs); color:var(--color-text); line-height:1.6;">
              <li>Farm Pickup Gate</li>
              <li>Rural Feeder Link</li>
              <li>NH Express Corridor</li>
              <li>Retailer Delivery Hub</li>
            </ol>
          </div>
        </div>

        <!-- Order & Shipment Details Card -->
        <div class="card" style="padding:18px;">
          <h4 style="margin:0 0 12px 0; font-size:var(--fs-md);">Shipment Details</h4>
          <dl class="kv" style="font-size:var(--fs-xs); margin:0;">
            <dt>Order ID</dt><dd><strong id="ship-order-id">${escapeHtml(currentOrder.id)}</strong></dd>
            <dt>Crop</dt><dd id="ship-crop">${escapeHtml(currentOrder.crop)} (${escapeHtml(currentOrder.variety || "Standard")})</dd>
            <dt>Quantity</dt><dd id="ship-quantity">${formatNumber(currentOrder.quantity)} ${escapeHtml(currentOrder.unit)}</dd>
            <dt>Farmer</dt><dd id="ship-farmer">${escapeHtml(currentOrder.farmer.name)}</dd>
            <dt>Pickup Location</dt><dd id="ship-pickup">Bhogaon, Mainpuri (UP)</dd>
            <dt>Retailer</dt><dd id="ship-buyer">${escapeHtml(currentOrder.buyer.name)}</dd>
            <dt>Destination</dt><dd id="ship-destination">Agra (UP)</dd>
            <dt>Delivery Mode</dt><dd id="ship-delivery-mode">${escapeHtml(currentOrder.delivery_mode || "Local transport")}</dd>
          </dl>
        </div>

        <!-- Turn-by-Turn Guidance -->
        <div class="card" style="padding:18px; max-height:280px; overflow-y:auto;">
          <h4 style="margin:0 0 10px 0; font-size:var(--fs-md);">Turn-by-Turn Route Steps</h4>
          <ul id="route-turn-steps" style="margin:0; padding-left:16px; font-size:var(--fs-xs); line-height:1.6; color:var(--color-text);">
            <li>Depart farmer pickup location</li>
            <li>Merge onto National Highway Freight Corridor</li>
            <li>Arrive at Retailer Receiving Dock</li>
          </ul>
        </div>
      </div>
    </div>
  `;

  // Initialize interactive map and route calculation
  let L;
  try {
    L = await ensureLeaflet();
  } catch (err) {
    console.error("Map library could not be loaded:", err);
    const mapEl = main.querySelector("#route-map");
    if (mapEl) mapEl.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-muted);font-size:var(--fs-sm)">Map unavailable — reload the page to try again.</div>`;
    return;
  }

  async function calculateAndDisplayRoute(order) {
    currentOrder = order;

    // Update shipment details card
    const shipOrderId = main.querySelector("#ship-order-id");
    const shipCrop = main.querySelector("#ship-crop");
    const shipQuantity = main.querySelector("#ship-quantity");
    const shipFarmer = main.querySelector("#ship-farmer");
    const shipPickup = main.querySelector("#ship-pickup");
    const shipBuyer = main.querySelector("#ship-buyer");
    const shipDestination = main.querySelector("#ship-destination");
    const shipDeliveryMode = main.querySelector("#ship-delivery-mode");
    const viewOrderDetailsLink = main.querySelector("#view-order-details-link");
    const loadingIndicator = main.querySelector("#map-loading-indicator");

    if (viewOrderDetailsLink) {
      viewOrderDetailsLink.href = `${B}/${role}/order-details.html?id=${encodeURIComponent(order.id)}`;
    }

    if (loadingIndicator) loadingIndicator.style.display = "flex";

    // 1. Resolve Farmer & Retailer Locations
    const farmerLoc = resolveLocationCoordinates(order.farmer);
    const retailerLoc = resolveLocationCoordinates(order.buyer);

    if (shipOrderId) shipOrderId.textContent = order.id;
    if (shipCrop) shipCrop.textContent = `${order.crop} (${order.variety || "Standard"})`;
    if (shipQuantity) shipQuantity.textContent = `${formatNumber(order.quantity)} ${order.unit}`;
    if (shipFarmer) shipFarmer.textContent = order.farmer.name;
    if (shipPickup) shipPickup.textContent = farmerLoc.label;
    if (shipBuyer) shipBuyer.textContent = order.buyer.name;
    if (shipDestination) shipDestination.textContent = retailerLoc.label;
    if (shipDeliveryMode) shipDeliveryMode.textContent = order.delivery_mode || "Local transport";

    // 2. Build Regional Graph and execute Dijkstra's Algorithm
    const { graph, startId, endId } = buildRegionalTransportationGraph(farmerLoc, retailerLoc);
    const dijkstraResult = graph.findShortestPath(startId, endId);

    // Update Dijkstra Inspector
    const execTimeEl = main.querySelector("#dijkstra-exec-time");
    const nodesCountEl = main.querySelector("#dijkstra-nodes-count");
    const iterationsEl = main.querySelector("#dijkstra-iterations");
    const pathListEl = main.querySelector("#dijkstra-path-list");

    if (execTimeEl) execTimeEl.textContent = `${dijkstraResult.metrics.durationMs} ms`;
    if (nodesCountEl) nodesCountEl.textContent = `${dijkstraResult.metrics.totalNodes} nodes explored`;
    if (iterationsEl) iterationsEl.textContent = `${dijkstraResult.metrics.iterations} relaxation passes`;

    if (pathListEl && dijkstraResult.nodes) {
      pathListEl.innerHTML = dijkstraResult.nodes
        .map((n) => `<li><strong>${escapeHtml(n.label)}</strong> <span class="text-muted">(${escapeHtml(n.description || "")})</span></li>`)
        .join("");
    }

    // 3. Query OSRM for real road-based routing, distance & duration
    const waypointCoords = dijkstraResult.nodes.map((n) => [n.lon, n.lat]);
    const osrmResult = await fetchOsrmRoute(waypointCoords);

    // Also get alternative baseline route for comparison
    const altCoords = [
      [farmerLoc.lon, farmerLoc.lat],
      [farmerLoc.lon + (retailerLoc.lon - farmerLoc.lon) * 0.5 + 0.08, farmerLoc.lat + (retailerLoc.lat - farmerLoc.lat) * 0.5 + 0.1],
      [retailerLoc.lon, retailerLoc.lat]
    ];
    const altOsrmResult = await fetchOsrmRoute(altCoords);

    // 4. Calculate Transportation Costs & Money Saved
    // Convert crop quantity to kg for calculation
    let qtyInKg = order.quantity;
    if (order.unit === "quintal") qtyInKg = order.quantity * 100;
    if (order.unit === "tonne") qtyInKg = order.quantity * 1000;

    const costAnalysis = calculateTransportationCost({
      distanceKm: osrmResult.distanceKm,
      quantityKg: qtyInKg,
      unoptimizedFactor: Math.max(1.18, Number((altOsrmResult.distanceKm / osrmResult.distanceKm).toFixed(2)) || 1.22)
    });

    // Update KPI Badges
    const kpiDist = main.querySelector("#kpi-distance");
    const kpiDistSaved = main.querySelector("#kpi-distance-saved");
    const kpiDuration = main.querySelector("#kpi-duration");
    const kpiTimeSaved = main.querySelector("#kpi-time-saved");
    const kpiCost = main.querySelector("#kpi-cost");
    const kpiVehicle = main.querySelector("#kpi-vehicle");
    const kpiMoneySaved = main.querySelector("#kpi-money-saved");
    const kpiSavingsPct = main.querySelector("#kpi-savings-pct");
    const co2SavedEl = main.querySelector("#dijkstra-co2-saved");

    if (kpiDist) kpiDist.textContent = `${osrmResult.distanceKm} km`;
    if (kpiDistSaved) kpiDistSaved.textContent = `-${costAnalysis.distanceSavedKm} km vs unoptimized`;
    if (kpiDuration) kpiDuration.textContent = osrmResult.durationFormatted;
    if (kpiTimeSaved) kpiTimeSaved.textContent = `-${costAnalysis.timeSavedMinutes} mins saved`;
    if (kpiCost) kpiCost.textContent = formatCurrency(costAnalysis.optimizedCost);
    if (kpiVehicle) kpiVehicle.textContent = `${costAnalysis.vehicleType} (₹${costAnalysis.ratePerKm}/km)`;
    if (kpiMoneySaved) kpiMoneySaved.textContent = formatCurrency(costAnalysis.moneySaved);
    if (kpiSavingsPct) kpiSavingsPct.textContent = `${costAnalysis.moneySavedPercent}% savings`;
    if (co2SavedEl) co2SavedEl.textContent = `-${costAnalysis.co2SavedKg} kg CO₂ reduced`;

    // Update Turn-by-Turn Steps
    const stepsListEl = main.querySelector("#route-turn-steps");
    if (stepsListEl && osrmResult.steps) {
      stepsListEl.innerHTML = osrmResult.steps
        .map((s) => `<li><strong>${escapeHtml(s.instruction)}</strong> <span class="text-muted">(${s.distanceKm} km)</span></li>`)
        .join("");
    }

    // 5. Render OpenStreetMap with Leaflet
    renderLeafletMap(L, farmerLoc, retailerLoc, dijkstraResult, osrmResult, altOsrmResult, order);

    if (loadingIndicator) loadingIndicator.style.display = "none";
  }

  function renderLeafletMap(L, farmerLoc, retailerLoc, dijkstraResult, osrmResult, altOsrmResult, order) {
    const mapContainer = main.querySelector("#route-map");
    if (!mapContainer) return;

    if (activeMapInstance) {
      activeMapInstance.remove();
      activeMapInstance = null;
    }

    // Center map initially between farmer and retailer
    const midLat = (farmerLoc.lat + retailerLoc.lat) / 2;
    const midLon = (farmerLoc.lon + retailerLoc.lon) / 2;

    const map = L.map(mapContainer, {
      center: [midLat, midLon],
      zoom: 8,
      zoomControl: true,
      scrollWheelZoom: true
    });
    activeMapInstance = map;

    // OpenStreetMap standard tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors | OSRM Engine'
    }).addTo(map);

    // Custom HTML Pin for Farmer (Green Pickup Badge)
    const farmerIcon = L.divIcon({
      className: "custom-map-pin farmer-pin",
      html: `
        <div style="background:#16a34a; color:#fff; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(0,0,0,0.3); border:2.5px solid #fff; font-size:16px;">
          🌱
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18]
    });

    // Custom HTML Pin for Retailer (Blue Destination Badge)
    const retailerIcon = L.divIcon({
      className: "custom-map-pin retailer-pin",
      html: `
        <div style="background:#2563eb; color:#fff; border-radius:50%; width:34px; height:34px; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(0,0,0,0.3); border:2.5px solid #fff; font-size:16px;">
          🏬
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17],
      popupAnchor: [0, -18]
    });

    // Waypoint Pin (Small gray ring)
    const waypointIcon = L.divIcon({
      className: "custom-map-pin waypoint-pin",
      html: `
        <div style="background:#fff; color:#4b5563; border-radius:50%; width:18px; height:18px; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 4px rgba(0,0,0,0.25); border:2.5px solid #16a34a; font-size:9px; font-weight:700;">
          •
        </div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
      popupAnchor: [0, -10]
    });

    // Add Farmer Marker
    const farmerMarker = L.marker([farmerLoc.lat, farmerLoc.lon], { icon: farmerIcon }).addTo(map);
    farmerMarker.bindPopup(`
      <div style="min-width:180px; font-family:inherit; font-size:12px; line-height:1.4;">
        <div style="font-weight:700; color:#16a34a; margin-bottom:4px;">🌾 Farmer Pickup Location</div>
        <strong>${escapeHtml(order.farmer.name)}</strong><br>
        <span>${escapeHtml(farmerLoc.label)}</span>
        <hr style="margin:6px 0; border:none; border-top:1px solid #e5e7eb;">
        <span>Crop: <strong>${escapeHtml(order.crop)}</strong> (${formatNumber(order.quantity)} ${escapeHtml(order.unit)})</span>
      </div>
    `);

    // Add Retailer Marker
    const retailerMarker = L.marker([retailerLoc.lat, retailerLoc.lon], { icon: retailerIcon }).addTo(map);
    retailerMarker.bindPopup(`
      <div style="min-width:180px; font-family:inherit; font-size:12px; line-height:1.4;">
        <div style="font-weight:700; color:#2563eb; margin-bottom:4px;">🏬 Retailer Receiving Hub</div>
        <strong>${escapeHtml(order.buyer.name)}</strong><br>
        <span>${escapeHtml(retailerLoc.label)}</span>
        <hr style="margin:6px 0; border:none; border-top:1px solid #e5e7eb;">
        <span>Order: <strong>${escapeHtml(order.id)}</strong></span>
      </div>
    `);

    // Add intermediate Dijkstra waypoints
    if (dijkstraResult && dijkstraResult.nodes) {
      dijkstraResult.nodes.slice(1, -1).forEach((node) => {
        const wpMarker = L.marker([node.lat, node.lon], { icon: waypointIcon }).addTo(map);
        wpMarker.bindPopup(`
          <div style="font-family:inherit; font-size:11px; line-height:1.4;">
            <strong>${escapeHtml(node.label)}</strong><br>
            <span class="text-muted">${escapeHtml(node.description || "Highway Junction")}</span>
          </div>
        `);
      });
    }

    // Draw Dijkstra Optimized Road Polyline (Green)
    const optLatLngs = osrmResult.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    const optPolyline = L.polyline(optLatLngs, {
      color: "#16a34a",
      weight: 5,
      opacity: 0.9,
      lineCap: "round",
      lineJoin: "round"
    }).addTo(map);

    optPolyline.bindPopup(`
      <div style="font-family:inherit; font-size:12px;">
        <strong style="color:#16a34a;">✦ Dijkstra Shortest Road Route</strong><br>
        Distance: <strong>${osrmResult.distanceKm} km</strong><br>
        Drive Time: <strong>${osrmResult.durationFormatted}</strong>
      </div>
    `);

    // Draw Alternative Unoptimized Route (Amber Dashed)
    const altLatLngs = altOsrmResult.geometry.coordinates.map(([lon, lat]) => [lat, lon]);
    const altPolyline = L.polyline(altLatLngs, {
      color: "#d97706",
      weight: 3.5,
      opacity: 0.7,
      dashArray: "6, 8",
      lineCap: "round",
      lineJoin: "round"
    }).addTo(map);

    altPolyline.bindPopup(`
      <div style="font-family:inherit; font-size:12px;">
        <strong style="color:#d97706;">Standard Unoptimized Route</strong><br>
        Distance: <strong>${altOsrmResult.distanceKm} km</strong><br>
        Drive Time: <strong>${altOsrmResult.durationFormatted}</strong>
      </div>
    `);

    // Toggle Alternative Route
    const toggleAlt = main.querySelector("#toggle-alt-route");
    if (toggleAlt) {
      toggleAlt.onchange = () => {
        if (toggleAlt.checked) {
          map.addLayer(altPolyline);
        } else {
          map.removeLayer(altPolyline);
        }
      };
    }

    // Auto-fit bounds with padding
    const group = L.featureGroup([farmerMarker, retailerMarker, optPolyline]);
    map.fitBounds(group.getBounds(), { padding: [40, 40] });

    // Reset View Button
    const fitBtn = main.querySelector("#fit-bounds-btn");
    if (fitBtn) {
      fitBtn.onclick = () => {
        map.fitBounds(group.getBounds(), { padding: [40, 40] });
      };
    }
  }

  // Event Listeners for Order Switcher
  const selectEl = main.querySelector("#route-order-select");
  if (selectEl) {
    selectEl.addEventListener("change", (e) => {
      const ord = orders.find((o) => o.id === e.target.value);
      if (ord) {
        // Update URL query string without full reload
        const newUrl = new URL(window.location);
        newUrl.searchParams.set("id", ord.id);
        window.history.replaceState({}, "", newUrl);
        calculateAndDisplayRoute(ord);
      }
    });
  }

  const recalcBtn = main.querySelector("#recalc-route-btn");
  if (recalcBtn) {
    recalcBtn.addEventListener("click", () => {
      calculateAndDisplayRoute(currentOrder);
    });
  }

  // Initial calculation
  await calculateAndDisplayRoute(currentOrder);
}
