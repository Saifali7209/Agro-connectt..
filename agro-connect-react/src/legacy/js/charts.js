/**
 * AGRO CONNECT — dependency-free SVG charts.
 * Every chart takes plain data arrays so backend payloads drop straight in.
 */
const C = {
  primary: "var(--primary)",
  accent: "var(--accent)",
  info: "var(--info)",
  danger: "var(--danger)",
  grid: "var(--border)",
  muted: "var(--text-muted)",
};

function scale(values, height, pad = 8) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  return (v) => height - pad - ((v - min) / span) * (height - pad * 2);
}

export function lineChart(points, { height = 220, width = 640, color = C.primary, fill = true, labelKey = "label", valueKey = "value", format = (v) => v } = {}) {
  if (!points?.length) return '<p class="text-muted">No data available.</p>';
  const values = points.map((p) => Number(p[valueKey]));
  const y = scale(values, height, 18);
  const stepX = width / Math.max(points.length - 1, 1);
  const coords = points.map((p, i) => [i * stepX, y(Number(p[valueKey]))]);
  const path = coords.map(([x, yy], i) => `${i ? "L" : "M"}${x.toFixed(1)},${yy.toFixed(1)}`).join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;
  const gridLines = [0.25, 0.5, 0.75, 1].map((f) => `<line x1="0" y1="${(height * f).toFixed(0)}" x2="${width}" y2="${(height * f).toFixed(0)}" stroke="${C.grid}" stroke-dasharray="3 4"/>`).join("");
  const dots = coords.map(([x, yy], i) => `<circle cx="${x.toFixed(1)}" cy="${yy.toFixed(1)}" r="3.5" fill="${color}"><title>${points[i][labelKey]}: ${format(points[i][valueKey])}</title></circle>`).join("");
  const labels = points.map((p, i) => (i % Math.ceil(points.length / 6) === 0
    ? `<text x="${(i * stepX).toFixed(0)}" y="${height + 16}" font-size="10" fill="${C.muted}" text-anchor="middle">${p[labelKey]}</text>` : "")).join("");

  return `<svg class="chart" viewBox="0 0 ${width} ${height + 24}" role="img" aria-label="Line chart">
    ${gridLines}
    ${fill ? `<path d="${area}" fill="${color}" opacity="0.10"/>` : ""}
    <path d="${path}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${dots}${labels}
  </svg>`;
}

export function barChart(points, { height = 220, width = 640, color = C.primary, labelKey = "label", valueKey = "value", format = (v) => v } = {}) {
  if (!points?.length) return '<p class="text-muted">No data available.</p>';
  const max = Math.max(...points.map((p) => Number(p[valueKey])), 1);
  const gap = 10;
  const bw = (width - gap * (points.length - 1)) / points.length;
  const bars = points.map((p, i) => {
    const h = (Number(p[valueKey]) / max) * (height - 24);
    const x = i * (bw + gap);
    return `<g><rect x="${x.toFixed(1)}" y="${(height - h).toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="5" fill="${color}" opacity="${0.55 + 0.45 * (Number(p[valueKey]) / max)}"><title>${p[labelKey]}: ${format(p[valueKey])}</title></rect>
      <text x="${(x + bw / 2).toFixed(1)}" y="${height + 16}" font-size="10" fill="${C.muted}" text-anchor="middle">${p[labelKey]}</text></g>`;
  }).join("");
  return `<svg class="chart" viewBox="0 0 ${width} ${height + 24}" role="img" aria-label="Bar chart">${bars}</svg>`;
}

export function donutChart(slices, { size = 190, thickness = 26 } = {}) {
  const total = slices.reduce((s, x) => s + Number(x.value), 0) || 1;
  const r = (size - thickness) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  let offset = 0;
  const palette = [C.primary, C.accent, C.info, C.danger, "var(--success)", "var(--warning)"];
  const arcs = slices.map((s, i) => {
    const len = (Number(s.value) / total) * circ;
    const el = `<circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${s.color || palette[i % palette.length]}"
      stroke-width="${thickness}" stroke-dasharray="${len.toFixed(2)} ${(circ - len).toFixed(2)}"
      stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 ${cx} ${cx})"><title>${s.label}: ${s.value}</title></circle>`;
    offset += len;
    return el;
  }).join("");
  return `<svg class="chart" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Donut chart">
    <circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${C.grid}" stroke-width="${thickness}"/>${arcs}</svg>`;
}

export function legend(items) {
  const palette = [C.primary, C.accent, C.info, C.danger, "var(--success)", "var(--warning)"];
  return `<div class="chart-legend">${items.map((it, i) => `<span><i style="background:${it.color || palette[i % palette.length]}"></i>${it.label}</span>`).join("")}</div>`;
}

export function sparkline(values, { width = 120, height = 34, color = C.primary } = {}) {
  if (!values?.length) return "";
  const y = scale(values, height, 4);
  const stepX = width / Math.max(values.length - 1, 1);
  const d = values.map((v, i) => `${i ? "L" : "M"}${(i * stepX).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  return `<svg class="chart" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true"><path d="${d}" fill="none" stroke="${color}" stroke-width="2"/></svg>`;
}

export function confidenceRing(confidence) {
  const pct = Math.round((Number(confidence) || 0) * 100);
  const r = 56, circ = 2 * Math.PI * r;
  const tone = pct >= 80 ? "var(--success)" : pct >= 60 ? "var(--warning)" : "var(--danger)";
  return `<div class="confidence-ring">
    <svg viewBox="0 0 132 132" aria-hidden="true">
      <circle cx="66" cy="66" r="${r}" fill="none" stroke="var(--border)" stroke-width="12"/>
      <circle cx="66" cy="66" r="${r}" fill="none" stroke="${tone}" stroke-width="12" stroke-linecap="round"
        stroke-dasharray="${((pct / 100) * circ).toFixed(1)} ${circ.toFixed(1)}"/>
    </svg><span class="val">${pct}%</span></div>`;
}
