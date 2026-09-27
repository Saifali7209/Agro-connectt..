/**
 * AGRO CONNECT — Farmer Console: Demand Forecasting Page
 * 
 * Displays historical demand analytics, upcoming week/month AI demand predictions,
 * regional comparisons, and actionable tactical recommendations for growers.
 */

import { pageHead, el, els, demoBanner, showError, B } from "./_builders.js";
import { fetchMyCrops } from "../crops.js";
import {
  fetchDemandForecast,
  demandHistoricalVsForecastChart,
  demandOverviewCardsMarkup,
  regionalDemandComparisonMarkup,
  demandRecommendationsMarkup,
  CROP_DEMAND_PROFILES,
} from "../demand-forecasting.js";
import { escapeHtml } from "../utils.js";
import { icon } from "../navigation.js";

export const meta = { title: "Demand Forecasting", navKey: "demand-forecasting" };

export async function render(main) {
  main.innerHTML = pageHead(
    "Demand Forecasting",
    "Analyze historical demand and predict future market demand across major agricultural corridors.",
    `<a class="btn btn-outline" href="${B}/pages/ai-crop-doctor.html">${icon.robot || ""} AI Crop Doctor</a>`
  ) + `
    <!-- AI Suite Header Context -->
    <div class="ai-suite-bar">
      <div class="ai-suite-pills">
        <span style="font-size:var(--fs-xs);font-weight:700;text-transform:uppercase;color:var(--text-muted);letter-spacing:.08em;margin-right:4px;">AI Features:</span>
        <a class="ai-pill" href="${B}/pages/ai-crop-doctor.html">
          ${icon.robot || ""} <span>AI Crop Doctor</span>
        </a>
        <a class="ai-pill active" href="${B}/farmer/demand-forecasting.html">
          ${icon.trendingUp || icon.chart || ""} <span>Demand Forecasting</span>
        </a>
        <a class="ai-pill" href="${B}/farmer/route-optimization.html">
          ${icon.mapPin || ""} <span>Route Optimization</span>
        </a>
      </div>
      <div style="display:flex;align-items:center;gap:10px;">
        <span class="badge badge-info" style="font-size:11px;">Model: demand_forecast v2.1</span>
        <span class="text-muted" style="font-size:var(--fs-xs)">Refreshed daily from APMC mandi signals</span>
      </div>
    </div>

    <!-- Active Area Host -->
    <div id="df-root">
      <div class="skeleton" style="height:520px;border-radius:var(--radius-lg)"></div>
    </div>
  `;

  const host = el("#df-root", main);

  try {
    let myCrops = [];
    let isDemo = true;
    try {
      fetchMyCrops().then((cropRes) => {
        if (cropRes && cropRes.data && cropRes.data.length > 0) {
          myCrops = cropRes.data;
        }
      }).catch(() => {});
    } catch {}

    const availableCropNames = [
      ...new Set([
        ...myCrops.map((c) => c.name),
        ...Object.keys(CROP_DEMAND_PROFILES),
      ]),
    ];

    let activeCrop = "Potato";
    let activeTimeframe = "weekly"; // "weekly" | "monthly"

    async function updateView() {
      const { data, demo } = await fetchDemandForecast({
        cropName: activeCrop,
        timeframe: activeTimeframe,
      });

      const profile = CROP_DEMAND_PROFILES[activeCrop] || CROP_DEMAND_PROFILES.Potato;

      // Render Crop Selector Chips
      const cropChipsHtml = availableCropNames.map((cropName) => {
        const cProf = CROP_DEMAND_PROFILES[cropName] || { trend: "stable" };
        const isActive = cropName === activeCrop;
        return `
          <button type="button" class="crop-filter-chip ${isActive ? "active" : ""}" data-crop="${escapeHtml(cropName)}">
            <span class="chip-dot ${cProf.trend}"></span>
            <span>${escapeHtml(cropName)}</span>
          </button>
        `;
      }).join("");

      host.innerHTML = `
        ${demo || isDemo ? demoBanner("Projected demand values synthesized from regional mandi procurement data.") : ""}

        <!-- Crop & Timeframe Controls -->
        <div class="card" style="margin-bottom:var(--sp-4)">
          <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--sp-3)">
            <div>
              <span class="label" style="font-size:var(--fs-xs);text-transform:uppercase;color:var(--text-muted);font-weight:700;display:block;margin-bottom:6px">Select Crop / Product</span>
              <div class="crop-filter-chips">
                ${cropChipsHtml}
              </div>
            </div>

            <div>
              <span class="label" style="font-size:var(--fs-xs);text-transform:uppercase;color:var(--text-muted);font-weight:700;display:block;margin-bottom:6px">Forecast Horizon</span>
              <div class="timeframe-filter">
                <button type="button" class="timeframe-btn ${activeTimeframe === "weekly" ? "active" : ""}" data-timeframe="weekly">Upcoming Weeks</button>
                <button type="button" class="timeframe-btn ${activeTimeframe === "monthly" ? "active" : ""}" data-timeframe="monthly">Upcoming Months</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Demand Overview -->
        <div style="margin-bottom:var(--sp-4)">
          ${demandOverviewCardsMarkup(data.overview)}
        </div>

        <!-- Historical vs Forecasted Demand SVG Chart -->
        <div class="demand-chart-wrap" style="margin-bottom:var(--sp-4)">
          <div class="demand-chart-header">
            <div>
              <h3 class="card-title" style="margin:0">Historical Demand vs AI Forecast</h3>
              <p class="text-muted" style="margin:0;font-size:var(--fs-xs)">
                Observed actual buyer procurement vs projected future market absorption (${activeTimeframe === "weekly" ? "Week-by-Week" : "Month-by-Month"})
              </p>
            </div>

            <div class="chart-legend-box">
              <span class="legend-item">
                <span class="legend-line historical"></span>
                <span>Historical Actuals</span>
              </span>
              <span class="legend-item">
                <span class="legend-line forecast"></span>
                <span>AI Forecast</span>
              </span>
              <span class="legend-item">
                <span class="legend-line confidence"></span>
                <span>90% Confidence Range</span>
              </span>
            </div>
          </div>

          <div style="margin-top:var(--sp-2)">
            ${demandHistoricalVsForecastChart(data.historical, data.forecast, {
              unit: data.overview.unit,
              timeframe: activeTimeframe,
            })}
          </div>
        </div>

        <!-- Regional Demand Comparison -->
        <div style="margin-bottom:var(--sp-4)">
          ${regionalDemandComparisonMarkup(data.regions, data.overview.unit)}
        </div>

        <!-- Actionable Farmer Recommendations -->
        <div>
          ${demandRecommendationsMarkup(data.recommendations)}
        </div>
      `;

      // Bind events on crop filter chips
      els("[data-crop]", host).forEach((btn) => {
        btn.addEventListener("click", () => {
          activeCrop = btn.dataset.crop;
          updateView();
        });
      });

      // Bind events on timeframe buttons
      els("[data-timeframe]", host).forEach((btn) => {
        btn.addEventListener("click", () => {
          activeTimeframe = btn.dataset.timeframe;
          updateView();
        });
      });
    }

    // Initial render
    await updateView();

  } catch (err) {
    showError(host, err);
  }
}
