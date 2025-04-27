export interface PriceCheckInput {
  user_id: number;
  store_id: number;
  product_id: number;
  category: string;
  regular_price: number;
  deal_price?: number;
  discount_description?: string;
}
