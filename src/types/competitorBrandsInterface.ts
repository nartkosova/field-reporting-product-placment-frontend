export type CompetitorBrand = {
  competitor_id: number;
  brand_name: string;
};

export type CompetitorCategoryCache = {
  category: string;
  brands: CompetitorBrand[];
};
