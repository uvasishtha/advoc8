// Chart colours as hex. Recharts writes these into SVG attributes, where CSS
// custom properties are unreliable, so they are duplicated here rather than
// read from the theme. Contrast against #FFFFFF is kept above 3:1 for lines
// and fills so the charts stay legible for low-vision users.

export const CHART_COLORS = {
  primary: "#FF91BD",
  strong: "#C4307F",
  teal: "#4F8F86",
  amber: "#B5793A",
  grid: "#F0E2EA",
  axis: "#978A93",
  text: "#241C22",
  muted: "#6E6169",
};

/** Colour per symptom, assigned in order of how often it appears. */
export function seriesColor(index) {
  return [CHART_COLORS.primary, CHART_COLORS.strong, CHART_COLORS.teal, CHART_COLORS.amber][
    index % 4
  ];
}

/** Severity 1–10 mapped to a light-to-strong pink ramp. */
export const SEVERITY_RAMP = [
  "#FFE4EF",
  "#FFD3E5",
  "#FFBBD8",
  "#FFA1C9",
  "#FF91BD",
  "#F470A6",
  "#E24F90",
  "#C4307F",
  "#A8276B",
  "#7E1C52",
];