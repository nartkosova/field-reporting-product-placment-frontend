export interface Store {
  store_id: number;
  store_name: string;
  store_code: number;
  store_category: string;
  location: string;
}
export interface StoreListProps {
  stores: Store[];
  user: string | null;
  showLocation?: boolean;
}

export interface StoreInput extends Omit<Store, "store_id"> {
  store_channel: string;
  user_id: number;
  sales_rep: string;
}
