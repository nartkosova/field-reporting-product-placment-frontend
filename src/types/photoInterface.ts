export interface PhotoInput {
  photo_type: "regular_shelf" | "secondary_position" | "other_position";
  photo_url: string;
  category: string;
  user_id: number;
  store_id: number;
}

export interface PhotoSchema {
  photo_type: "regular_shelf" | "secondary_position" | "other_position";
  photo_url: string;
  category: string;
  user_id: number;
  store_id: number;
  user: string;
  store_name: string;
  uploaded_at: string;
}
