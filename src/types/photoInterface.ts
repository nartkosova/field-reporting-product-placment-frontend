export interface PhotoInput {
  photo_type:
    | "regular_shelf"
    | "secondary_position"
    | "new_product"
    | "sale"
    | "fletushka"
    | "korporative";
  photo_url: string;
  category: string;
  user_id: number;
  store_id: number;
}

export interface PhotoSchema {
  photo_id: number;
  photo_type:
    | "regular_shelf"
    | "secondary_position"
    | "new_product"
    | "sale"
    | "fletushka"
    | "korporative";
  photo_url: string;
  category: string;
  company: "podravka" | "competitor";
  user_id: number;
  store_id: number;
  user: string;
  store_name: string;
  created_at: string;
  photo_description?: string;
}

export interface PaginatedPhotoResponse {
  data: PhotoSchema[];
  total: number;
}
