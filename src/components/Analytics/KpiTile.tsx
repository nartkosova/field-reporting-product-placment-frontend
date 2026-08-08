interface KpiTileProps {
  label: string;
  value: string;
  hint?: string;
  accent?: string;
  isLoading?: boolean;
}

/**
 * A single headline number. Used where the data's job is "one figure", which a
 * chart would only dilute.
 */
const KpiTile = ({ label, value, hint, accent, isLoading }: KpiTileProps) => (
  <div className="border border-neutral-800 bg-black rounded-xl p-4 flex flex-col gap-1">
    <div className="flex items-center gap-2">
      {accent && (
        <span
          aria-hidden="true"
          className="inline-block w-2.5 h-2.5 rounded-sm shrink-0"
          style={{ background: accent }}
        />
      )}
      <p className="text-sm text-neutral-400">{label}</p>
    </div>
    <p className="text-2xl font-semibold text-white tabular-nums">
      {isLoading ? "…" : value}
    </p>
    {hint && <p className="text-xs text-neutral-500">{hint}</p>}
  </div>
);

export default KpiTile;
