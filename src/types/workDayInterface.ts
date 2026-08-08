export const WORK_LOG_STATUS_OPTIONS = [
  { value: "planned_work", label: "Working day", tone: "work" },
  { value: "vacation", label: "Vacation", tone: "absence" },
  { value: "sick_day", label: "Sick day", tone: "absence" },
  { value: "other", label: "Other absence", tone: "absence" },
] as const;

export type WorkLogStatus = (typeof WORK_LOG_STATUS_OPTIONS)[number]["value"];

export const WORK_ACTIVITY_TYPE_OPTIONS = [
  { value: "ppl", label: "PPL" },
  { value: "photo_report", label: "Raport me Foto" },
  { value: "store_visit", label: "Vizite ne Market" },
] as const;

export type WorkActivityType =
  (typeof WORK_ACTIVITY_TYPE_OPTIONS)[number]["value"];

export interface WorkLogActivityInput {
  activity_type: WorkActivityType;
  planned?: boolean;
  completed?: boolean;
  note?: string | null;
}

export interface WorkLogDayCityInput {
  city_name: string;
  visit_order?: number | null;
  note?: string | null;
}

export interface WorkLogDayInput {
  work_date: string;
  status?: WorkLogStatus;
  plan?: string | null;
  summary?: string | null;
  absence_reason?: string | null;
  start_kilometers?: number | null;
  end_kilometers?: number | null;
  kilometers_driven?: number | null;
  fuel_cost?: number | null;
  fuel_liters?: number | null;
  other_travel_cost?: number | null;
  activities?: WorkLogActivityInput[];
  cities?: WorkLogDayCityInput[];
}

export interface WorkLogActivity extends WorkLogActivityInput {
  work_log_activity_id: number;
  work_log_day_id: number;
  created_at: string;
  updated_at: string;
}

export interface WorkLogDayCity extends WorkLogDayCityInput {
  work_log_day_city_id: number;
  work_log_day_id: number;
  created_at: string;
}

export interface WorkLogDay {
  work_log_day_id: number;
  user_id: number;
  user: string;
  role: string;
  work_date: string;
  status: WorkLogStatus;
  plan: string | null;
  summary: string | null;
  absence_reason: string | null;
  start_kilometers: number | null;
  end_kilometers: number | null;
  kilometers_driven: number | null;
  fuel_cost: number | null;
  fuel_liters: number | null;
  other_travel_cost: number | null;
  created_at: string;
  updated_at: string;
  report_photo_count: number;
  podravka_facing_count: number;
  competitor_facing_count: number;
  activity_count?: number;
  city_count?: number;
  activities: WorkLogActivity[];
  cities: WorkLogDayCity[];
}

export interface WorkLogDayListItem
  extends Omit<WorkLogDay, "activities" | "cities"> {}

export interface WorkDayListParams {
  user_id?: number;
  start_date?: string;
  end_date?: string;
  status?: WorkLogStatus;
}

export interface LatestWorkDayKilometers {
  work_log_day_id: number;
  work_date: string;
  start_kilometers: number | null;
  end_kilometers: number | null;
}

export interface ActiveWorkDaySelection {
  user_id: number;
  work_log_day_id: number | null;
  work_date: string;
  status: WorkLogStatus;
  selected_at: string;
}
