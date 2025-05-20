export interface BasePriceCheckInput {
  user_id: number;
  store_id: number;
  category: string;
  regular_price: number;
  deal_price?: number;
  discount_description?: string;
  product_type: "podravka" | "competitor";
}

export interface PodravkaPriceCheckInput extends BasePriceCheckInput {
  product_type: "podravka";
  podravka_product_id: number;
}

export interface CompetitorPriceCheckInput extends BasePriceCheckInput {
  product_type: "competitor";
  competitor_product_id: number;
}

export type PriceCheckInput =
  | PodravkaPriceCheckInput
  | CompetitorPriceCheckInput;
