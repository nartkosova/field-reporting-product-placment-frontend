import { WorkActivityType, WorkLogStatus } from "./workDayInterface";

export interface DetailedWorkDayReportRow {
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
  report_photo_count: number;
  podravka_facing_count: number;
  competitor_facing_count: number;
  city_count: number;
  activity_count: number;
  cities: Array<{
    city_name: string;
    visit_order: number | null;
    note: string | null;
  }>;
  activities: Array<{
    activity_type: WorkActivityType;
    planned: boolean;
    completed: boolean;
    note: string | null;
  }>;
}
