import { Fragment, useEffect, useRef, useState } from "react";
import {
  SERIES,
  formatNumber,
  formatPercent,
} from "../../components/Analytics/chartTheme";
import {
  PplGroupBy,
  PplRow,
  PplSortField,
} from "../../types/pplReportInterface";
import {
  BASE_COLUMNS,
  DEFAULT_VISIBLE,
  PplColumn,
  brandColumnId,
  formatDate,
} from "./pplColumns";

const ShareBar = ({ share }: { share: number | null }) =>
  share === null ? (
    <span className="text-neutral-500">-</span>
  ) : (
    <div className="flex items-center gap-2 min-w-[140px]">
      <div className="h-1.5 flex-1 rounded-full overflow-hidden bg-neutral-800 flex">
        <div style={{ width: `${share}%`, background: SERIES.podravka }} />
        <div
          style={{ width: `${100 - share}%`, background: SERIES.competitor }}
        />
      </div>
      <span className="tabular-nums text-neutral-200 w-12 text-right">
        {formatPercent(share)}
      </span>
    </div>
  );

const cellValue = (row: PplRow, column: PplColumn) => {
  if (column.id.startsWith("brand:")) {
    const count = row.competitors[column.label] ?? 0;
    return count ? (
      formatNumber(count)
    ) : (
      <span className="text-neutral-600">0</span>
    );
  }
  switch (column.id) {
    case "date":
      return formatDate(row.date);
    case "user":
      return row.user ?? "-";
    case "store_name":
      return row.store_name ?? "-";
    case "category":
      return row.category ?? "-";
    case "share":
      return <ShareBar share={row.share} />;
    default:
      return formatNumber(
        row[column.id as "podravka" | "competitor" | "total" | "entries"],
      );
  }
};

// Every brand on the shelf for one row, Podravka included, as share bars.
const Breakdown = ({ row }: { row: PplRow }) => {
  const items = [
    { brand: "Podravka", count: row.podravka, isPodravka: true },
    ...Object.entries(row.competitors).map(([brand, count]) => ({
      brand,
      count,
      isPodravka: false,
    })),
  ]
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count);

  if (!items.length)
    return <p className="text-sm text-neutral-500">Nuk ka facings.</p>;

  return (
    <div className="grid gap-1.5 max-w-xl">
      {items.map((item) => {
        const percent = row.total ? (item.count / row.total) * 100 : 0;
        return (
          <div
            key={item.brand}
            className="grid grid-cols-[8rem_1fr_6rem] items-center gap-3 text-xs"
          >
            <span
              className={
                item.isPodravka ? "text-white font-medium" : "text-neutral-300"
              }
            >
              {item.brand}
            </span>
            <div className="h-1.5 rounded-full bg-neutral-800 overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${percent}%`,
                  background: item.isPodravka
                    ? SERIES.podravka
                    : SERIES.competitor,
                }}
              />
            </div>
            <span className="tabular-nums text-neutral-400 text-right">
              {formatNumber(item.count)} · {formatPercent(percent)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export const ColumnPicker = ({
  groupBy,
  brands,
  visible,
  onChange,
}: {
  groupBy: PplGroupBy;
  brands: string[];
  visible: string[];
  onChange: (visible: string[]) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  const toggle = (id: string) =>
    onChange(
      visible.includes(id)
        ? visible.filter((item) => item !== id)
        : [...visible, id],
    );

  const brandIds = brands.map(brandColumnId);
  const allBrandsVisible =
    brandIds.length > 0 && brandIds.every((id) => visible.includes(id));

  const Option = ({ id, label }: { id: string; label: string }) => (
    <label className="flex items-center gap-2 px-2 py-1 rounded hover:bg-neutral-800 cursor-pointer text-sm text-neutral-200">
      <input
        type="checkbox"
        checked={visible.includes(id)}
        onChange={() => toggle(id)}
      />
      {label}
    </label>
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
      >
        Kolonat ▾
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 max-h-96 overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-950 p-2 shadow-2xl">
          {BASE_COLUMNS.filter(
            (column) => !column.groups || column.groups.includes(groupBy),
          ).map((column) => (
            <Option key={column.id} id={column.id} label={column.label} />
          ))}
          {brands.length > 0 && (
            <>
              <div className="mt-2 mb-1 flex items-center justify-between px-2">
                <span className="text-xs uppercase tracking-wide text-neutral-500">
                  Markat
                </span>
                <button
                  type="button"
                  className="text-xs text-neutral-400 hover:text-white"
                  onClick={() =>
                    onChange(
                      allBrandsVisible
                        ? visible.filter((id) => !brandIds.includes(id))
                        : [...new Set([...visible, ...brandIds])],
                    )
                  }
                >
                  {allBrandsVisible ? "Fshih të gjitha" : "Shfaq të gjitha"}
                </button>
              </div>
              {brands.map((brand) => (
                <Option key={brand} id={brandColumnId(brand)} label={brand} />
              ))}
            </>
          )}
          <button
            type="button"
            onClick={() => onChange(DEFAULT_VISIBLE)}
            className="mt-2 w-full rounded-lg px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            Rivendos
          </button>
        </div>
      )}
    </div>
  );
};

const PplTable = ({
  rows,
  columns,
  sort,
  direction,
  onSort,
}: {
  rows: PplRow[];
  columns: PplColumn[];
  sort: PplSortField;
  direction: "asc" | "desc";
  onSort: (field: PplSortField) => void;
}) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="card-inset p-0 overflow-x-auto">
      <table className="w-full text-sm text-white min-w-max">
        <thead className="text-neutral-400">
          <tr className="border-b border-neutral-800">
            {columns.map((column) => (
              <th
                key={column.id}
                className={`px-4 py-3 font-medium ${column.numeric ? "text-right" : "text-left"}`}
              >
                {column.sort ? (
                  <button
                    type="button"
                    onClick={() => onSort(column.sort!)}
                    className={`inline-flex items-center gap-1 hover:text-white ${
                      sort === column.sort ? "text-white" : ""
                    }`}
                  >
                    {column.label}
                    <span className="text-xs">
                      {sort === column.sort
                        ? direction === "asc"
                          ? "▲"
                          : "▼"
                        : ""}
                    </span>
                  </button>
                ) : (
                  column.label
                )}
              </th>
            ))}
            <th className="w-8" />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const isOpen = expanded === row.key;
            return (
              <Fragment key={row.key}>
                <tr
                  onClick={() => setExpanded(isOpen ? null : row.key)}
                  className={`border-b border-neutral-900 cursor-pointer hover:bg-neutral-900 ${
                    isOpen ? "bg-neutral-900" : ""
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={`px-4 py-2.5 ${column.numeric ? "text-right tabular-nums" : ""}`}
                    >
                      {cellValue(row, column)}
                    </td>
                  ))}
                  <td className="px-2 text-neutral-500 text-xs">
                    {isOpen ? "▲" : "▼"}
                  </td>
                </tr>
                {isOpen && (
                  <tr className="border-b border-neutral-900 bg-black">
                    <td colSpan={columns.length + 1} className="px-4 py-4">
                      <Breakdown row={row} />
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
          {!rows.length && (
            <tr>
              <td
                colSpan={columns.length + 1}
                className="px-4 py-10 text-center text-neutral-500"
              >
                Nuk ka PPL për këta filtra.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default PplTable;
