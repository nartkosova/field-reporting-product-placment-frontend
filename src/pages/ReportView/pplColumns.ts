import { PplGroupBy, PplSortField } from "../../types/pplReportInterface";

export interface PplColumn {
  id: string;
  label: string;
  // Group views the column makes sense in; omitted means every view.
  groups?: PplGroupBy[];
  sort?: PplSortField;
  numeric?: boolean;
}

export const GROUP_OPTIONS: { value: PplGroupBy; label: string }[] = [
  { value: "entry", label: "Çdo PPL" },
  { value: "store", label: "Marketi" },
  { value: "category", label: "Kategoria" },
  { value: "user", label: "Raportuesi" },
  { value: "day", label: "Dita" },
];

export const BASE_COLUMNS: PplColumn[] = [
  { id: "date", label: "Data", groups: ["entry", "day"], sort: "date" },
  { id: "user", label: "Raportuesi", groups: ["entry", "user"], sort: "user" },
  {
    id: "store_name",
    label: "Marketi",
    groups: ["entry", "store"],
    sort: "store_name",
  },
  {
    id: "category",
    label: "Kategoria",
    groups: ["entry", "category"],
    sort: "category",
  },
  {
    id: "entries",
    label: "PPL",
    groups: ["store", "category", "user", "day"],
    sort: "entries",
    numeric: true,
  },
  { id: "podravka", label: "Podravka", sort: "podravka", numeric: true },
  { id: "competitor", label: "Konkurrenca", sort: "competitor", numeric: true },
  { id: "total", label: "Totali", sort: "total", numeric: true },
  { id: "share", label: "Pjesa Podravka", sort: "share" },
];

export const DEFAULT_VISIBLE = BASE_COLUMNS.map((column) => column.id).filter(
  (id) => id !== "total",
);

export const brandColumnId = (brand: string) => `brand:${brand}`;

export const columnsFor = (
  groupBy: PplGroupBy,
  visible: string[],
  brands: string[],
) => [
  ...BASE_COLUMNS.filter(
    (column) =>
      visible.includes(column.id) &&
      (!column.groups || column.groups.includes(groupBy)),
  ),
  ...brands
    .filter((brand) => visible.includes(brandColumnId(brand)))
    .map(
      (brand) =>
        ({
          id: brandColumnId(brand),
          label: brand,
          numeric: true,
        }) as PplColumn,
    ),
];

export const formatDate = (value: string | null) => {
  if (!value) return "-";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}.${month}.${year}`;
};
