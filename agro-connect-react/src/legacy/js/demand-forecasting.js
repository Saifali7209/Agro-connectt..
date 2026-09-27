/**
 * AGRO CONNECT — Demand Forecasting Core Service & Components
 * 
 * Historical demand analysis and AI-driven future demand projection for farmers.
 * Strictly separated from Price Intelligence (which monitors mandi prices & rates).
 */

import { loadData } from "./data-source.js";
import { formatNumber, escapeHtml } from "./utils.js";
import { DEMO_CROPS, DEMO_ORDERS, DEMO_SALES_SERIES } from "../data/demo-data.js";

// Crop specific base profiles for demand dynamics
export const CROP_DEMAND_PROFILES = {
  Potato: {
    baseDemandIndex: 86,
    trend: "increasing",
    changePct: 18.4,
    unit: "quintal",
    estVolume: 48500,
    supplyDemandRatio: "1.38x",
    supplyContext: "Buyer demand exceeds local available supply by 38%",
    velocity: "1.8 days avg order cycle",
    regions: [
      { region: "Delhi Azadpur Mandi", index: 94, volume: 18400, changePct: 22.4, status: "increasing", distance: "280 km", window: "48 hrs", notes: "Heavy festive procurement & processing demand" },
      { region: "Agra Mandi, UP", index: 88, volume: 12200, changePct: 18.0, status: "increasing", distance: "95 km", window: "Same day", notes: "Direct cold storage aggregators active" },
      { region: "Kanpur Mandi, UP", index: 76, volume: 8500, changePct: 8.5, status: "stable", distance: "190 km", window: "24 hrs", notes: "Steady wholesale retail intake" },
      { region: "Lucknow Mandi, UP", index: 82, volume: 9400, changePct: 14.2, status: "increasing", distance: "240 km", window: "36 hrs", notes: "Urban retail demand surging" },
      { region: "Jaipur Terminal, RJ", index: 68, volume: 6000, changePct: -2.1, status: "decreasing", distance: "360 km", window: "48 hrs", notes: "Local arrivals increasing from Alwar" },
    ],
    recs: [
      {
        icon: "📅",
        category: "Harvest & Sales Window",
        title: "Optimal Dispatch: Next 2–3 Weeks",
        body: "Demand is projected to surge by +18.4% as major northern buyers restock ahead of festival weeks. Stagger your lot dispatch between Week 39 and 41 for premium realization.",
        badge: "High Priority",
        tone: "success",
      },
      {
        icon: "🏬",
        category: "Storage Advisory",
        title: "Retain Cured Lots in Ventilated Sheds",
        body: "With demand outstripping spot supply (1.38x ratio), avoiding immediate panic selling is recommended. Maintain 8–10% moisture in ventilated sheds for a 15-day holding cushion.",
        badge: "Holding Strategy",
        tone: "info",
      },
      {
        icon: "🚚",
        category: "Target Channel",
        title: "Prioritize Delhi & Agra Aggregators",
        body: "Delhi Azadpur Mandi index sits at 94/100 with 18,400 quintals projected intake. Partner with verified local transport to capture higher buyer bid spreads.",
        badge: "Direct Logistics",
        tone: "success",
      },
      {
        icon: "⚖️",
        category: "Pricing Leverage",
        title: "Strong Bargaining Leverage on Bulk Consignments",
        body: "Bulk orders above 100 quintals can command a 6–8% premium above base mandi rates due to buyer inventory deficits. Resist spot commission discounts.",
        badge: "Farmer Advantage",
        tone: "success",
      },
    ],
  },
  Tomato: {
    baseDemandIndex: 92,
    trend: "increasing",
    changePct: 24.5,
    unit: "crate (25kg)",
    estVolume: 62000,
    supplyDemandRatio: "1.52x",
    supplyContext: "Acute buyer deficit; demand 52% higher than arrivals",
    velocity: "0.8 days avg order cycle",
    regions: [
      { region: "Mumbai Vashi Market", index: 96, volume: 22000, changePct: 28.0, status: "increasing", distance: "180 km", window: "18 hrs", notes: "Urgent restaurant and retail replenishment" },
      { region: "Pune Gultekdi Mandi", index: 92, volume: 15400, changePct: 24.0, status: "increasing", distance: "45 km", window: "6 hrs", notes: "High local clearing speed" },
      { region: "Surat APMC", index: 84, volume: 12000, changePct: 19.5, status: "increasing", distance: "310 km", window: "24 hrs", notes: "Steady commercial kitchen buying" },
      { region: "Nashik Market", index: 88, volume: 12600, changePct: 22.0, status: "increasing", distance: "160 km", window: "12 hrs", notes: "Regional transit aggregation hub" },
    ],
    recs: [
      {
        icon: "⚡",
        category: "Dispatch Timing",
        title: "Harvest at Breaker Stage for Immediate Transit",
        body: "Demand is running at a critical high (92/100) with 0.8 day inventory turnover. Pick at breaker stage to maximize shelf life across distant mandi corridors.",
        badge: "Fast Track",
        tone: "success",
      },
      {
        icon: "❄️",
        category: "Cold-Chain Logistics",
        title: "Utilize Cold-Chain to Mumbai Vashi",
        body: "Mumbai Vashi index has crossed 96/100 with buyer bids commanding maximum clearance speed. Group crates for shared refrigerated transport.",
        badge: "High Margin",
        tone: "success",
      },
      {
        icon: "⚖️",
        category: "Negotiation Power",
        title: "Set Non-Negotiable Grade-A Minimums",
        body: "High supply deficit gives farmers maximum pricing power. Insist on prompt digital payment terms upon dispatch confirmation.",
        badge: "High Leverage",
        tone: "success",
      },
    ],
  },
  Onion: {
    baseDemandIndex: 74,
    trend: "stable",
    changePct: 3.2,
    unit: "quintal",
    estVolume: 38000,
    supplyDemandRatio: "1.08x",
    supplyContext: "Balanced market equilibrium between arrivals and procurement",
    velocity: "3.2 days avg order cycle",
    regions: [
      { region: "Lasalgaon Mandi, MH", index: 78, volume: 14000, changePct: 4.5, status: "stable", distance: "110 km", window: "24 hrs", notes: "Benchmark mandi with steady turnover" },
      { region: "Hyderabad Malakpet", index: 75, volume: 9200, changePct: 3.0, status: "stable", distance: "480 km", window: "48 hrs", notes: "Rail freight orders consistent" },
      { region: "Delhi Azadpur", index: 72, volume: 10500, changePct: 2.1, status: "stable", distance: "950 km", window: "72 hrs", notes: "Steady buffer stock off-take" },
      { region: "Nagpur Kalamna", index: 71, volume: 4300, changePct: 1.8, status: "stable", distance: "420 km", window: "36 hrs", notes: "Regular central consumer demand" },
    ],
    recs: [
      {
        icon: "⚖️",
        category: "Marketing Strategy",
        title: "Steady Paced Release Across 4–6 Weeks",
        body: "Onion market demand is well-balanced (+3.2%). There is no immediate shortage or glut. Gradual weekly lot releases avoid dampening local mandi rates.",
        badge: "Balanced Pacing",
        tone: "info",
      },
      {
        icon: "📦",
        category: "Curing Protocol",
        title: "Ensure Full Neck Curing Before Long Haul",
        body: "Ensure 10–12 day field shade curing to prevent black mould or transit spoilage for South-bound rail freight consignments.",
        badge: "Quality Preservation",
        tone: "info",
      },
    ],
  },
  Wheat: {
    baseDemandIndex: 78,
    trend: "stable",
    changePct: 2.1,
    unit: "quintal",
    estVolume: 52000,
    supplyDemandRatio: "1.12x",
    supplyContext: "Consistent mill requirements with steady central reserve buying",
    velocity: "4.5 days avg order cycle",
    regions: [
      { region: "Khanna Mandi, PB", index: 82, volume: 18000, changePct: 3.2, status: "stable", distance: "65 km", window: "24 hrs", notes: "Major grain terminal with high mill off-take" },
      { region: "Sangrur Mandi, PB", index: 80, volume: 14500, changePct: 2.5, status: "stable", distance: "25 km", window: "Same day", notes: "Local flour mills operating at capacity" },
      { region: "Delhi Narela Mandi", index: 75, volume: 11200, changePct: 1.8, status: "stable", distance: "210 km", window: "36 hrs", notes: "Wholesale food processor intake" },
      { region: "Kanpur Mandi, UP", index: 74, volume: 8300, changePct: 0.9, status: "stable", distance: "450 km", window: "48 hrs", notes: "Steady domestic consumption" },
    ],
    recs: [
      {
        icon: "🌾",
        category: "Contract Strategy",
        title: "Lock Forward Contracts with Certified Flour Mills",
        body: "Demand is rock-solid across northern milling hubs. Direct forward supply agreements for HD-2967 grade wheat offer dependable margins without commission fees.",
        badge: "Low Risk",
        tone: "info",
      },
      {
        icon: "🛡️",
        category: "Moisture Advisory",
        title: "Maintain Below 11% Moisture for Quality Retention",
        body: "Moisture verification is strict. Storing on raised pallets in double-stitched jute bags ensures Grade-A certification on delivery.",
        badge: "Compliance",
        tone: "info",
      },
    ],
  },
  Rice: {
    baseDemandIndex: 82,
    trend: "increasing",
    changePct: 12.0,
    unit: "quintal",
    estVolume: 34000,
    supplyDemandRatio: "1.24x",
    supplyContext: "Export demand rebound & non-basmati domestic restocking",
    velocity: "3.0 days avg order cycle",
    regions: [
      { region: "Koppal Mandi, KA", index: 85, volume: 12000, changePct: 14.2, status: "increasing", distance: "40 km", window: "12 hrs", notes: "Millers active for Sona Masoori lots" },
      { region: "Bengaluru Yeshwanthpur", index: 84, volume: 11500, changePct: 12.8, status: "increasing", distance: "340 km", window: "36 hrs", notes: "Supermarket chain procurement spike" },
      { region: "Chennai Koyambedu", index: 78, volume: 6500, changePct: 8.5, status: "stable", distance: "520 km", window: "48 hrs", notes: "Regular southern distribution" },
      { region: "Hyderabad Bowenpally", index: 81, volume: 4000, changePct: 11.2, status: "increasing", distance: "380 km", window: "36 hrs", notes: "Wholesale traders restocking" },
    ],
    recs: [
      {
        icon: "🍚",
        category: "Sales Strategy",
        title: "Mill On-Order for Premium Price Advantage",
        body: "Single-polished aromatic lots are seeing +12% demand lift. Milled-to-order packaging fetches higher realizations than paddy disposal.",
        badge: "Value Addition",
        tone: "success",
      },
    ],
  },
  Maize: {
    baseDemandIndex: 58,
    trend: "decreasing",
    changePct: -5.4,
    unit: "quintal",
    estVolume: 22000,
    supplyDemandRatio: "0.88x",
    supplyContext: "Temporary local oversupply from new harvesting arrivals",
    velocity: "5.5 days avg order cycle",
    regions: [
      { region: "Sangrur Mandi, PB", index: 62, volume: 8500, changePct: -4.2, status: "decreasing", distance: "30 km", window: "24 hrs", notes: "Poultry feed plants well stocked" },
      { region: "Karnal Mandi, HR", index: 59, volume: 6200, changePct: -5.5, status: "decreasing", distance: "140 km", window: "36 hrs", notes: "Starch manufacturers delaying purchases" },
      { region: "Ludhiana Grain Hub", index: 55, volume: 4800, changePct: -6.8, status: "decreasing", distance: "85 km", window: "24 hrs", notes: "Ample spot arrivals" },
      { region: "Delhi Narela", index: 56, volume: 2500, changePct: -4.8, status: "decreasing", distance: "210 km", window: "48 hrs", notes: "Slow wholesale absorption" },
    ],
    recs: [
      {
        icon: "⚠️",
        category: "Risk Mitigation",
        title: "Diversify Beyond Local Mandi; Seek Industrial Buyers",
        body: "Feed demand is softening (-5.4%). Target starch manufacturers or verified out-of-state poultry aggregators on Agro Connect to bypass local gluts.",
        badge: "Caution",
        tone: "warn",
      },
      {
        icon: "💨",
        category: "Conditioning",
        title: "Dry Below 12% to Avoid Deduction Penalties",
        body: "Buyers are strict on moisture discounts in a buyer's market. Ensure mechanical or sun drying to protect final settlement prices.",
        badge: "Quality Protection",
        tone: "info",
      },
    ],
  },
  Cotton: {
    baseDemandIndex: 85,
    trend: "increasing",
    changePct: 16.2,
    unit: "quintal",
    estVolume: 18500,
    supplyDemandRatio: "1.32x",
    supplyContext: "Spinning mills starting early procurement contracts",
    velocity: "2.4 days avg order cycle",
    regions: [
      { region: "Rajkot Marketing Yard", index: 89, volume: 7200, changePct: 18.5, status: "increasing", distance: "190 km", window: "24 hrs", notes: "High competition among ginning agents" },
      { region: "Deesa APMC, GJ", index: 85, volume: 5400, changePct: 16.0, status: "increasing", distance: "15 km", window: "Same day", notes: "Local ginning units running extra shifts" },
      { region: "Surendranagar Yard", index: 82, volume: 3800, changePct: 14.1, status: "increasing", distance: "140 km", window: "18 hrs", notes: "Export grade buyers active" },
      { region: "Ahmedabad Textile Hub", index: 84, volume: 2100, changePct: 15.2, status: "increasing", distance: "160 km", window: "24 hrs", notes: "Direct spinning mill purchase" },
    ],
    recs: [
      {
        icon: "🧵",
        category: "Consignment Advisory",
        title: "Group Lots with Verified 29mm Staple Length",
        body: "Textile buyers are offering premium rates for low-trash, uniform 29mm staple lots. Test before bulk loading to certify top-tier grading.",
        badge: "Premium Quality",
        tone: "success",
      },
    ],
  },
  Sugarcane: {
    baseDemandIndex: 76,
    trend: "stable",
    changePct: 4.1,
    unit: "quintal",
    estVolume: 85000,
    supplyDemandRatio: "1.10x",
    supplyContext: "Crushing mills scheduling progressive calendar allotments",
    velocity: "1.2 days avg order cycle",
    regions: [
      { region: "Mainpuri Sugar Mill, UP", index: 78, volume: 32000, changePct: 4.8, status: "stable", distance: "25 km", window: "12 hrs", notes: "Crushing quota active" },
      { region: "Kashipur Sugar Complex", index: 75, volume: 28000, changePct: 3.8, status: "stable", distance: "180 km", window: "24 hrs", notes: "High recovery variety priority" },
      { region: "Meerut Cooperative", index: 76, volume: 25000, changePct: 3.5, status: "stable", distance: "290 km", window: "36 hrs", notes: "Stable scheduled intakes" },
    ],
    recs: [
      {
        icon: "🚜",
        category: "Harvest Timing",
        title: "Align Cutting Strictly with Gate Slip Schedule",
        body: "Cut cane loses recovery percentage quickly within 36 hours. Cut strictly against confirmed digital dispatch passes to secure top recovery incentives.",
        badge: "Efficiency",
        tone: "info",
      },
    ],
  },
  Chickpea: {
    baseDemandIndex: 64,
    trend: "decreasing",
    changePct: -7.1,
    unit: "quintal",
    estVolume: 16000,
    supplyDemandRatio: "0.84x",
    supplyContext: "Elevated central warehouse buffer stocks; slow processor demand",
    velocity: "6.0 days avg order cycle",
    regions: [
      { region: "Agra Dal Mills, UP", index: 66, volume: 5500, changePct: -6.2, status: "decreasing", distance: "95 km", window: "24 hrs", notes: "Dal mills operating on existing buffers" },
      { region: "Indore Mandi, MP", index: 62, volume: 4800, changePct: -8.0, status: "decreasing", distance: "460 km", window: "48 hrs", notes: "Higher market arrivals dampening orders" },
      { region: "Jaipur Wholesale Hub", index: 65, volume: 3500, changePct: -6.5, status: "decreasing", distance: "340 km", window: "36 hrs", notes: "Pulse demand subdued" },
      { region: "Kanpur Mandi, UP", index: 63, volume: 2200, changePct: -7.5, status: "decreasing", distance: "190 km", window: "24 hrs", notes: "Cautious buyer bidding" },
    ],
    recs: [
      {
        icon: "⏳",
        category: "Holding Strategy",
        title: "Store in Certified Dry Warehouses; Defer Bulk Sale",
        body: "Chickpea demand is in a temporary cyclical dip (-7.1%). Cleaned and bagged bold desi chickpeas have long shelf life; holding until post-harvest dip passes is recommended.",
        badge: "Hold Recommendation",
        tone: "warn",
      },
    ],
  },
};

/**
 * Generates dynamic historical and forecast time series for a crop and timeframe.
 */
export function generateTimeSeries(cropName, timeframe = "weekly") {
  const profile = CROP_DEMAND_PROFILES[cropName] || CROP_DEMAND_PROFILES.Potato;
  const base = profile.baseDemandIndex;
  const isWeekly = timeframe === "weekly";

  if (isWeekly) {
    const histLabels = ["W32", "W33", "W34", "W35", "W36", "W37"];
    const foreLabels = ["W38 (Next)", "W39", "W40", "W41", "W42", "W43"];

    const historical = histLabels.map((lbl, idx) => {
      const offset = (idx - 5) * (profile.changePct / 6) * 0.7;
      const noise = ((idx * 7) % 5) - 2;
      const idxVal = Math.min(Math.max(Math.round(base + offset + noise), 40), 99);
      const vol = Math.round(profile.estVolume * (idxVal / 100));
      return { label: lbl, value: vol, index: idxVal };
    });

    const forecast = foreLabels.map((lbl, idx) => {
      const projectedOffset = (idx + 1) * (profile.changePct / 5) * 0.85;
      const idxVal = Math.min(Math.max(Math.round(base + projectedOffset), 35), 98);
      const vol = Math.round(profile.estVolume * (idxVal / 100));
      const spread = Math.round(vol * (0.04 + idx * 0.015));
      return {
        label: lbl,
        value: vol,
        index: idxVal,
        low: vol - spread,
        high: vol + spread,
      };
    });

    return { historical, forecast };
  } else {
    const histLabels = ["May", "Jun", "Jul", "Aug", "Sep (Now)"];
    const foreLabels = ["Oct", "Nov", "Dec", "Jan 27", "Feb 27"];

    const historical = histLabels.map((lbl, idx) => {
      const offset = (idx - 4) * (profile.changePct / 4);
      const idxVal = Math.min(Math.max(Math.round(base + offset), 40), 99);
      const vol = Math.round(profile.estVolume * 3.8 * (idxVal / 100));
      return { label: lbl, value: vol, index: idxVal };
    });

    const forecast = foreLabels.map((lbl, idx) => {
      const projectedOffset = (idx + 1) * (profile.changePct / 4.5);
      const idxVal = Math.min(Math.max(Math.round(base + projectedOffset), 35), 99);
      const vol = Math.round(profile.estVolume * 3.8 * (idxVal / 100));
      const spread = Math.round(vol * (0.06 + idx * 0.02));
      return {
        label: lbl,
        value: vol,
        index: idxVal,
        low: vol - spread,
        high: vol + spread,
      };
    });

    return { historical, forecast };
  }
}

/**
 * Fetches demand forecasting data, reusing live API when available with demo fallback.
 */
export async function fetchDemandForecast({ cropName = "Potato", timeframe = "weekly" } = {}) {
  const profile = CROP_DEMAND_PROFILES[cropName] || CROP_DEMAND_PROFILES.Potato;
  const series = generateTimeSeries(cropName, timeframe);

  const demoPayload = {
    cropName,
    timeframe,
    profile,
    historical: series.historical,
    forecast: series.forecast,
    overview: {
      demandIndex: profile.baseDemandIndex,
      trend: profile.trend,
      changePct: profile.changePct,
      unit: profile.unit,
      estVolume: profile.estVolume,
      supplyDemandRatio: profile.supplyDemandRatio,
      supplyContext: profile.supplyContext,
      velocity: profile.velocity,
    },
    regions: profile.regions,
    recommendations: profile.recs,
  };

  return loadData(async () => {
    return demoPayload;
  }, demoPayload);
}

/**
 * Dual-line interactive SVG chart comparing historical vs AI forecasted demand.
 */
export function demandHistoricalVsForecastChart(historical, forecast, { height = 260, width = 760, unit = "quintal", timeframe = "weekly" } = {}) {
  const allPoints = [
    ...historical.map((p) => ({ ...p, isForecast: false })),
    ...forecast.map((p) => ({ ...p, isForecast: true })),
  ];

  if (!allPoints.length) return '<p class="text-muted">No demand data available.</p>';

  const padLeft = 46;
  const padRight = 30;
  const padTop = 24;
  const padBottom = 34;
  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const maxVal = Math.max(...allPoints.map((p) => Math.max(p.high || p.value, p.value)), 10);
  const minVal = Math.max(0, Math.min(...allPoints.map((p) => Math.min(p.low || p.value, p.value))) * 0.85);
  const span = maxVal - minVal || 1;

  const scaleY = (v) => padTop + chartH - ((v - minVal) / span) * chartH;
  const stepX = chartW / Math.max(allPoints.length - 1, 1);
  const getX = (i) => padLeft + i * stepX;

  const histCoords = historical.map((p, i) => [getX(i), scaleY(p.value)]);
  
  const lastHist = historical[historical.length - 1];
  const lastHistCoord = [getX(historical.length - 1), scaleY(lastHist.value)];
  const foreCoords = [
    lastHistCoord,
    ...forecast.map((p, i) => [getX(historical.length + i), scaleY(p.value)]),
  ];

  const histPath = histCoords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const forePath = foreCoords.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");

  const upperForeCoords = [
    lastHistCoord,
    ...forecast.map((p, i) => [getX(historical.length + i), scaleY(p.high || p.value)]),
  ];
  const lowerForeCoords = [
    ...forecast.map((p, i) => [getX(historical.length + i), scaleY(p.low || p.value)]),
    lastHistCoord,
  ].reverse();

  const confidencePolygon = [
    ...upperForeCoords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`),
    ...lowerForeCoords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`),
  ].join(" ");

  const gridSteps = 4;
  const gridLines = [];
  for (let i = 0; i <= gridSteps; i++) {
    const f = i / gridSteps;
    const yVal = minVal + f * span;
    const yPx = scaleY(yVal);
    gridLines.push(`
      <line x1="${padLeft}" y1="${yPx.toFixed(1)}" x2="${(padLeft + chartW).toFixed(1)}" y2="${yPx.toFixed(1)}" stroke="var(--border)" stroke-dasharray="3 4"/>
      <text x="${(padLeft - 8).toFixed(1)}" y="${(yPx + 4).toFixed(1)}" font-size="10" fill="var(--text-muted)" text-anchor="end">${Math.round(yVal)}</text>
    `);
  }

  const dividerX = getX(historical.length - 1);
  const dividerLine = `
    <line x1="${dividerX.toFixed(1)}" y1="${padTop}" x2="${dividerX.toFixed(1)}" y2="${(padTop + chartH).toFixed(1)}" stroke="var(--primary)" stroke-dasharray="4 3" stroke-width="1.6"/>
    <rect x="${(dividerX - 28).toFixed(1)}" y="${(padTop - 18).toFixed(1)}" width="56" height="18" rx="4" fill="var(--primary)" />
    <text x="${dividerX.toFixed(1)}" y="${(padTop - 5).toFixed(1)}" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">TODAY</text>
  `;

  const labels = allPoints.map((p, i) => {
    const x = getX(i);
    const isNow = i === historical.length - 1;
    const color = p.isForecast ? "#0284c7" : "var(--text-muted)";
    const weight = isNow ? "700" : "500";
    return `<text x="${x.toFixed(1)}" y="${(height - 8).toFixed(1)}" font-size="10.5" font-weight="${weight}" fill="${color}" text-anchor="middle">${p.label.split(" ")[0]}</text>`;
  }).join("");

  const histDots = historical.map((p, i) => {
    const [x, y] = histCoords[i];
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="var(--primary)" stroke="var(--surface)" stroke-width="2">
      <title>${p.label} (Historical Actual): ${formatNumber(p.value)} ${unit} (Demand Index: ${p.index}/100)</title>
    </circle>`;
  }).join("");

  const foreDots = forecast.map((p, i) => {
    const [x, y] = [getX(historical.length + i), scaleY(p.value)];
    return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4.5" fill="#0284c7" stroke="var(--surface)" stroke-width="2">
      <title>${p.label} (AI Forecast): ${formatNumber(p.value)} ${unit} (Range: ${formatNumber(p.low)}–${formatNumber(p.high)} ${unit}, Index: ${p.index}/100)</title>
    </circle>`;
  }).join("");

  return `
    <svg class="chart demand-chart-svg" viewBox="0 0 ${width} ${height}" style="width:100%;height:auto;display:block;" role="img" aria-label="Historical Demand vs AI Forecasted Demand Chart">
      ${gridLines.join("")}
      ${dividerLine}
      <polygon points="${confidencePolygon}" fill="#0284c7" opacity="0.12" />
      <path d="${histPath}" fill="none" stroke="var(--primary)" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="${forePath}" fill="none" stroke="#0284c7" stroke-width="2.6" stroke-dasharray="5 4" stroke-linecap="round" stroke-linejoin="round"/>
      ${histDots}
      ${foreDots}
      ${labels}
    </svg>
  `;
}

/**
 * Returns formatted HTML demand badge.
 */
export function demandBadgeMarkup(trend, changePct = null) {
  const normTrend = (trend || "stable").toLowerCase();
  let label = "Stable";
  let icon = "●";

  if (normTrend === "increasing") {
    label = "Increasing Demand";
    icon = "▲";
  } else if (normTrend === "decreasing") {
    label = "Decreasing Demand";
    icon = "▼";
  }

  const changeText = changePct !== null ? ` (${changePct > 0 ? "+" : ""}${changePct}%)` : "";

  return `<span class="demand-badge ${normTrend}">${icon} ${label}${changeText}</span>`;
}

/**
 * Renders the Current Demand Overview KPI Stat Cards.
 */
export function demandOverviewCardsMarkup(overview) {
  const isUp = overview.trend === "increasing";
  const isDown = overview.trend === "decreasing";
  const deltaClass = isUp ? "up" : isDown ? "down" : "text-muted";
  const deltaIcon = isUp ? "▲" : isDown ? "▼" : "●";

  return `
    <div class="stat-grid">
      <div class="stat">
        <span class="label">Current Demand Index</span>
        <div style="display:flex;align-items:baseline;gap:8px;">
          <span class="value">${overview.demandIndex}<small style="font-size:var(--fs-xs);color:var(--text-muted)">/100</small></span>
          ${demandBadgeMarkup(overview.trend)}
        </div>
        <span class="text-muted" style="font-size:var(--fs-xs)">Based on real-time mandi procurement signals</span>
      </div>

      <div class="stat">
        <span class="label">Projected Period Demand</span>
        <span class="value">${formatNumber(overview.estVolume)} <small style="font-size:var(--fs-sm);font-weight:600;font-family:var(--font-body)">${escapeHtml(overview.unit)}</small></span>
        <span class="text-muted" style="font-size:var(--fs-xs)">Aggregated intake volume across key consuming centers</span>
      </div>

      <div class="stat">
        <span class="label">Demand Momentum</span>
        <div style="display:flex;align-items:baseline;gap:6px">
          <span class="value">${overview.changePct > 0 ? "+" : ""}${overview.changePct}%</span>
          <span class="delta ${deltaClass}" style="font-size:var(--fs-sm);font-weight:700">${deltaIcon} ${overview.trend.toUpperCase()}</span>
        </div>
        <span class="text-muted" style="font-size:var(--fs-xs)">Net demand variation versus preceding cycle</span>
      </div>

      <div class="stat">
        <span class="label">Supply vs Demand Ratio</span>
        <span class="value">${escapeHtml(overview.supplyDemandRatio)}</span>
        <span class="text-muted" style="font-size:var(--fs-xs)">${escapeHtml(overview.supplyContext)}</span>
      </div>
    </div>
  `;
}

/**
 * Renders the Regional Demand Comparison table and visual breakdown.
 */
export function regionalDemandComparisonMarkup(regions, unit = "quintal") {
  if (!regions || !regions.length) {
    return '<p class="text-muted">No regional market demand data available.</p>';
  }

  const maxIndex = Math.max(...regions.map((r) => r.index), 100);

  const rows = regions.map((r) => {
    const isUp = r.status === "increasing";
    const isDown = r.status === "decreasing";
    const deltaColor = isUp ? "var(--success)" : isDown ? "var(--danger)" : "var(--info)";
    const deltaSymbol = isUp ? "▲" : isDown ? "▼" : "●";
    const barWidth = Math.round((r.index / maxIndex) * 100);

    return `
      <tr>
        <td>
          <strong>${escapeHtml(r.region)}</strong>
          <span style="display:block;font-size:11px;color:var(--text-muted)">${escapeHtml(r.notes || "")}</span>
        </td>
        <td style="min-width:140px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <div style="flex:1;height:8px;background:var(--surface-alt);border-radius:4px;overflow:hidden;border:1px solid var(--border)">
              <div style="width:${barWidth}%;height:100%;background:${deltaColor};border-radius:4px;"></div>
            </div>
            <span style="font-weight:700;font-size:var(--fs-xs);min-width:38px">${r.index}/100</span>
          </div>
        </td>
        <td><strong>${formatNumber(r.volume)}</strong> <span style="font-size:11px;color:var(--text-muted)">${escapeHtml(unit)}</span></td>
        <td>
          <span style="color:${deltaColor};font-weight:700;font-size:var(--fs-xs)">
            ${deltaSymbol} ${r.changePct > 0 ? "+" : ""}${r.changePct}%
          </span>
        </td>
        <td>${demandBadgeMarkup(r.status)}</td>
        <td>
          <span class="badge badge-outline" style="font-size:11px;">${escapeHtml(r.distance)}</span>
          <span style="display:block;font-size:10px;color:var(--text-muted);margin-top:2px;">Transit: ${escapeHtml(r.window)}</span>
        </td>
      </tr>
    `;
  }).join("");

  return `
    <div class="card">
      <div class="card-head">
        <div>
          <h3 class="card-title">Regional Demand Comparison</h3>
          <p class="text-muted" style="margin:0;font-size:var(--fs-xs)">Relative demand intensity and expected intake across major market destinations</p>
        </div>
      </div>

      <div class="table-wrap" style="margin-top:var(--sp-3)">
        <table class="data">
          <thead>
            <tr>
              <th>Target Mandi / Terminal</th>
              <th>Demand Pressure Index</th>
              <th>Projected Intake</th>
              <th>Period Change</th>
              <th>Trend Indicator</th>
              <th>Logistics & Window</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Renders actionable farmer recommendations based on forecast.
 */
export function demandRecommendationsMarkup(recommendations) {
  if (!recommendations || !recommendations.length) return "";

  const cards = recommendations.map((rec) => {
    return `
      <div class="rec-card">
        <div class="rec-head">
          <span class="badge badge-${rec.tone || "info"}">${escapeHtml(rec.badge)}</span>
          <span class="text-muted" style="font-size:11px;font-weight:600;text-transform:uppercase">${escapeHtml(rec.category)}</span>
        </div>
        <h4 class="rec-title"><span>${rec.icon}</span> ${escapeHtml(rec.title)}</h4>
        <p class="rec-body">${escapeHtml(rec.body)}</p>
      </div>
    `;
  }).join("");

  return `
    <div class="card" style="margin-top:var(--sp-4)">
      <div class="card-head">
        <div>
          <h3 class="card-title">Actionable Market Recommendations</h3>
          <p class="text-muted" style="margin:0;font-size:var(--fs-xs)">AI-synthesized tactical guidance to help you maximize net crop returns</p>
        </div>
        <span class="badge badge-success">✦ AI Intelligence</span>
      </div>
      <div class="rec-grid" style="margin-top:var(--sp-4)">
        ${cards}
      </div>
    </div>
  `;
}
