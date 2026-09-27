/** Admin console — AI usage analytics (values come from the AI service only). */
import { pageHead, statCards, chartCard, el, demoBanner, showError, formatNumber, lineChart, barChart, donutChart, legend } from "./_builders.js";
import { fetchAiAnalytics } from "../admin.js";

export const meta = { title: "AI Analytics", navKey: "ai-analytics" };

export async function render(main) {
  main.innerHTML = pageHead("AI analytics", "Volume, confidence and expert verification of AI crop analyses.")
    + `<div id="host"><div class="skeleton" style="height:360px;border-radius:var(--radius-lg)"></div></div>`;
  const host = el("#host", main);
  try {
    const { data: a, demo } = await fetchAiAnalytics();
    host.innerHTML = (demo ? demoBanner("Sample analytics for layout review — not real model output.") : "")
      + statCards([
        { label: "Total analyses", value: formatNumber(a.total) },
        { label: "High confidence", value: formatNumber(a.high_confidence) },
        { label: "Low confidence", value: formatNumber(a.low_confidence) },
        { label: "Expert verified", value: formatNumber(a.expert_verified) },
      ])
      + `<div style="margin-top:var(--sp-5)">${chartCard("Analyses per month", lineChart(a.volume, { format: (v) => formatNumber(v) }))}</div>
        <div class="grid-2" style="margin-top:var(--sp-5)">
          ${chartCard("Most reported conditions", barChart(a.by_disease, { format: (v) => formatNumber(v) }),
            "Reported conditions are model outputs and require expert confirmation before advisory use.")}
          ${chartCard("Analyses by crop", donutChart(a.by_crop) + legend(a.by_crop))}
        </div>`;
  } catch (error) { showError(host, error); }
}
