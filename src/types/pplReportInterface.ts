export type PplGroupBy = "entry" | "store" | "category" | "user" | "day";

export type PplSortField =
  | "date"
  | "user"
  | "store_name"
  | "category"
  | "podravka"
  | "competitor"
  | "total"
  | "share"
  | "entries";

export interface PplRow {
  key: string;
  date: string | null;
  user_id: number | null;
  user: string | null;
  store_id: number | null;
  store_name: string | null;
  category: string | null;
  podravka: number;
  competitor: number;
  total: number;
  share: number | null;
  competitors: Record<string, number>;
  entries: number;
  last_at: string | null;
}

export interface PplSummary {
  podravka: number;
  competitor: number;
  share: number | null;
  entries: number;
  stores: number;
  reporters: number;
}

export interface PplCharts {
  trend: Array<{ date: string; podravka: number; competitor: number; share: number | null }>;
  categories: Array<{ category: string; podravka: number; competitor: number; share: number | null }>;
  brands: Array<{ brand: string; facings: number; is_podravka: boolean }>;
}

export interface PplReportResponse {
  group_by: PplGroupBy;
  sort: PplSortField;
  direction: "asc" | "desc";
  total: number;
  data: PplRow[];
  brands: string[];
  summary: PplSummary;
  previous_summary: PplSummary | null;
  previous_range: { start: string; end: string } | null;
  charts: PplCharts;
}
