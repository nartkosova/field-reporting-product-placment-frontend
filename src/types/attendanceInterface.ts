export type VerificationFlag =
  | "no_check_in"
  | "late_check_in"
  | "no_check_out"
  | "early_check_out"
  | "short_day"
  | "no_visits"
  | "open_visit"
  | "short_visit"
  | "activity_outside_visit"
  | "long_gap"
  | "no_arrival_photo";

export type VerificationStatus = "ok" | "warning" | "critical" | "absence" | "legacy";

export interface GalleryPhoto {
  photo_url: string;
  kind: "presence" | "report";
  label: string;
  store_name: string | null;
  created_at: string;
}

export interface StoreVisit {
  store_visit_id: number;
  work_log_day_id: number;
  store_id: number;
  store_name: string;
  store_code: string;
  check_in_at: string;
  check_out_at: string | null;
  duration_minutes: number | null;
  activity_count: number;
  photos: Array<{ store_visit_photo_id: number; photo_url: string; created_at: string }>;
}

export interface DayVerification {
  check_in_at: string | null;
  check_out_at: string | null;
  worked_minutes: number | null;
  in_store_minutes: number;
  longest_gap_minutes: number | null;
  // Past day with no check-out: last recorded activity, shown as an estimate.
  estimated_check_out_at: string | null;
  visit_count: number;
  photo_visit_count: number;
  activities_outside_visit: number;
  visits: StoreVisit[];
  flags: VerificationFlag[];
  verification_status: VerificationStatus;
  gallery: GalleryPhoto[];
  expected_start: string;
  expected_end: string;
}

export interface DayAttendance extends DayVerification {
  open_visit: StoreVisit | null;
}

export type LiveState =
  | "missing"
  | "absence"
  | "not_started"
  | "in_store"
  | "on_road"
  | "done"
  | "not_closed";

export interface BusinessTotals {
  ppl_batches: number;
  podravka_facings: number;
  competitor_facings: number;
  podravka_share: number | null;
  stores_covered: number;
  photos: number;
}

export interface DayOverview {
  date: string;
  expected_start: string;
  expected_end: string;
  business: BusinessTotals;
  previous_business: BusinessTotals;
  totals: {
    employees: number;
    started: number;
    late: number;
    in_store: number;
    missing: number;
    absent: number;
    visits: number;
    photos: number;
    ppl: number;
  };
  people: Array<{
    user_id: number;
    user: string;
    state: LiveState;
    check_in_at: string | null;
    check_out_at: string | null;
    late: boolean;
    current_store: string | null;
    visit_count: number;
    photo_count: number;
    ppl_count: number;
  }>;
}

