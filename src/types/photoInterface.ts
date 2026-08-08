export const PHOTO_TYPE_OPTIONS = [
  { value: "regular_shelf", label: "Pozita Primare" },
  { value: "secondary_position", label: "Pozita Sekondare" },
  { value: "new_product", label: "Produkt i Ri" },
  { value: "sale", label: "Aksion" },
  { value: "fletushka", label: "Fletushka" },
  { value: "korporative", label: "Korporative" },
  { value: "staleness", label: "Afer afatit" },
  { value: "reward_game", label: "Loje shperblyese" },
  { value: "dimensioning_report", label: "Raport dimenzionime" },
  { value: "secondary_position_quarter", label: "Pozita sekondare kvartal" },
  { value: "other1", label: "Tjeter1" },
  { value: "other2", label: "Tjeter2" },
] as const;

export type PhotoType = (typeof PHOTO_TYPE_OPTIONS)[number]["value"];

export const PHOTO_TYPE_LABELS: Record<PhotoType, string> =
  PHOTO_TYPE_OPTIONS.reduce(
    (acc, option) => {
      acc[option.value] = option.label;
      return acc;
    },
    {} as Record<PhotoType, string>
  );

export interface PhotoInput {
  photo_type: PhotoType;
  photo_url: string;
  category: string;
  user_id: number;
  store_id: number;
  work_log_day_id?: number;
  work_date?: string;
}

export interface PhotoSchema {
  photo_id: number;
  photo_type: PhotoType;
  photo_url: string;
  category: string;
  company: "podravka" | "competitor";
  user_id: number;
  store_id: number;
  user: string;
  store_name: string;
  store_code?: number;
  created_at: string;
  photo_description?: string;
}

export interface PaginatedPhotoResponse {
  data: PhotoSchema[];
  total: number;
}
