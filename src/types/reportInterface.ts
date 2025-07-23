export interface User {
  user_id: string | number;
  user: string;
}

export interface Store {
  store_id: string | number;
  store_name: string;
  user_id: string | number;
}

export interface Facing {
  user: string;
  user_id: number;
  store_name: string;
  store_id: number;
  category: string;
  total_facings: number;
  created_at: string;
  competitors: Record<string, number>;
}

export interface FilterState {
  user_ids: string[];
  store_ids: string[];
  categories: string[];
  report_month: string[];
}
