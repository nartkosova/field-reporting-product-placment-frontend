import { ReactNode } from "react";
import { SERIES, formatNumber } from "./chartTheme";

type StatCardProps = {
  label: string;
  value: number | null | undefined;
  previous: number | null | undefined;
  format?: (value: number) => string;
  // Percent values compare in percentage points, counts in absolute numbers.
  deltaUnit?: "pp";
  detail?: string | false | null;
  isLoading: boolean;
  // What the change pill is measured against, shown on hover.
  deltaTitle?: string;
  children?: ReactNode;
};

export const StatCard = ({
  label,
  value,
  previous,
  format = (v) => formatNumber(v),
  deltaUnit,
  detail,
  isLoading,
  deltaTitle = "Krahasuar me ditën e kaluar",
  children,
}: StatCardProps) => {
  const delta =
    value !== null &&
    value !== undefined &&
    previous !== null &&
    previous !== undefined
      ? value - previous
      : null;

  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm text-neutral-400">{label}</p>
        {delta !== null && (
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs tabular-nums ${
              delta > 0
                ? "bg-green-950 text-green-300"
                : delta < 0
                  ? "bg-red-950 text-red-300"
                  : "bg-neutral-800 text-neutral-400"
            }`}
            title={deltaTitle}
          >
            {delta > 0 ? "↑ +" : delta < 0 ? "↓ " : "= "}
            {deltaUnit ? `${delta.toFixed(1)} pp` : formatNumber(delta)}
          </span>
        )}
      </div>
      <p className="text-4xl font-semibold tracking-tight text-white tabular-nums">
        {isLoading
          ? "…"
          : value === null || value === undefined
            ? "–"
            : format(value)}
      </p>
      {children}
      {detail && <p className="text-xs text-neutral-500">{detail}</p>}
    </div>
  );
};

export const ShelfSplit = ({
  podravka,
  competitor,
}: {
  podravka: number;
  competitor: number;
}) => {
  const total = podravka + competitor;
  const share = total ? (podravka / total) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="h-2 rounded-full overflow-hidden flex bg-neutral-800">
        {total > 0 && (
          <>
            <div style={{ width: `${share}%`, background: SERIES.podravka }} />
            <div
              style={{
                width: `${100 - share}%`,
                background: SERIES.competitor,
              }}
            />
          </>
        )}
      </div>
      <div className="flex justify-between text-xs text-neutral-500 tabular-nums">
        <span>Podravka {formatNumber(podravka)}</span>
        <span>Konkurrenca {formatNumber(competitor)}</span>
      </div>
    </div>
  );
};

export default StatCard;
