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

// Photo types whose "category" carries the reporting quarter instead of a
// product category.
export const QUARTER_PHOTO_TYPES: PhotoType[] = ["secondary_position_quarter"];

export const isQuarterPhotoType = (photoType: PhotoType) =>
  QUARTER_PHOTO_TYPES.includes(photoType);

export const getQuarterValue = (year: number, quarter: number) =>
  `Q${quarter}-${year}`;

export const getCurrentQuarter = (date: Date = new Date()) => ({
  year: date.getFullYear(),
  quarter: Math.floor(date.getMonth() / 3) + 1,
});

/**
 * Quarters offered in the upload form, newest first: the current quarter, the
 * previous `back` quarters, and the next one (for work logged just ahead of a
 * quarter rollover).
 */
export const getQuarterOptions = (date: Date = new Date(), back = 5) => {
  const { year, quarter } = getCurrentQuarter(date);
  const options: { value: string; label: string }[] = [];

  for (let offset = 1; offset >= -back; offset -= 1) {
    const absolute = year * 4 + (quarter - 1) + offset;
    const optionYear = Math.floor(absolute / 4);
    const optionQuarter = (absolute % 4) + 1;
    options.push({
      value: getQuarterValue(optionYear, optionQuarter),
      label: `Kvartali ${optionQuarter} - ${optionYear}`,
    });
  }

  return options;
};

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
