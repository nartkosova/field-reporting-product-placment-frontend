export interface Product {
  product_id: number;
  name: string;
  category: string;
  business_unit: string;
  product_category: string;
}

export interface CompetitorProduct {
  competitor_product_id: number;
  name: string;
  category: string;
  weight?: number;
  competitor_id: number;
  created_at: string;
}
