/**
 * Categorical slots for the dark chart surface (#171717 / neutral-900).
 * Validated for lightness band, chroma floor, CVD separation, normal-vision
 * separation and contrast against that surface — do not substitute ad-hoc hues,
 * and assign slots in fixed order so a filter never repaints the survivors.
 */
export const SERIES = {
  podravka: "#3987e5",
  competitor: "#d95926",
  aqua: "#199e70",
  yellow: "#c98500",
} as const;

export const CHART_INK = {
  primary: "#ffffff",
  secondary: "#c3c2b7",
  muted: "#8a8a80",
  grid: "#2e2e2e",
  surface: "#171717",
} as const;

export const axisProps = {
  stroke: CHART_INK.muted,
  tick: { fill: CHART_INK.secondary, fontSize: 12 },
  tickLine: false,
} as const;

export const tooltipStyles = {
  contentStyle: {
    background: "#0a0a0a",
    border: "1px solid #3f3f3f",
    borderRadius: "0.5rem",
    color: CHART_INK.primary,
    fontSize: "0.8rem",
  },
  labelStyle: { color: CHART_INK.secondary },
  cursor: { stroke: CHART_INK.muted, strokeWidth: 1 },
} as const;

export const formatNumber = (value: number | null | undefined) =>
  value === null || value === undefined
    ? "-"
    : new Intl.NumberFormat("de-DE").format(Math.round(value * 100) / 100);

export const formatPercent = (value: number | null | undefined) =>
  value === null || value === undefined ? "-" : `${value.toFixed(1)}%`;
