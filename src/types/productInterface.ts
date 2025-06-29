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
  created_by?: string;
}

export interface PodravkaProduct {
  product_id?: number;
  business_unit: string;
  category: string;
  name: string;
  podravka_code: string;
  elkos_code: number;
  product_category: string;
  weight: number;
}

export interface PodravkaProductWithRanking extends PodravkaProduct {
  year?: number;
  total_rank?: number;
  category_rank?: number;
  sales_last_year?: number;
  category_sales_share?: number;
}

export interface BrandCategory {
  competitor_id: number;
  brand_name: string;
}
