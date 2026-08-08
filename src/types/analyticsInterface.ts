export type Granularity = "day" | "week" | "month" | "quarter";

export interface AnalyticsFilterParams {
  user_ids?: string[] | number[];
  store_ids?: string[] | number[];
  start_date?: string;
  end_date?: string;
  company?: string;
  granularity?: Granularity;
}

export interface AnalyticsOverview {
  photos: number;
  podravkaFacings: number;
  podravkaFacingsTotal: number;
  competitorFacings: number;
  competitorFacingsTotal: number;
  storesVisited: number;
  activeEmployees: number;
  workDays: number;
  absenceDays: number;
  kilometersDriven: number;
  fuelCost: number;
  fuelLiters: number;
  otherTravelCost: number;
  shareOfShelf: number | null;
}

export interface TimeseriesPoint {
  bucket: string;
  photos: number;
  podravkaFacings: number;
  competitorFacings: number;
  kilometersDriven: number;
}

export interface EmployeeBreakdownRow {
  user_id: number;
  user: string;
  photos: number;
  podravkaFacingsTotal: number;
  competitorFacingsTotal: number;
  storesVisited: number;
  workDays: number;
  absenceDays: number;
  kilometersDriven: number;
  fuelCost: number;
}

export interface BreakdownRow {
  label: string;
  value: number;
}

export interface StoreCoverageRow {
  store_id: number;
  store_name: string;
  store_code: string | null;
  store_category: string | null;
  photo_count: number;
  facing_count: number;
  last_activity: string | null;
}

export interface StoreCoverage {
  stores: StoreCoverageRow[];
  total: number;
  covered: number;
  uncovered: number;
  coverageRate: number | null;
}
