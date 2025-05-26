export interface PodravkaFacingInput {
  user_id: number;
  store_id: number;
  product_id: number;
  category: string;
  facings_count: number;
}
export interface PodravkaFacingWithMeta extends PodravkaFacingInput {
  batch_id: string;
  name: string;
  store_name: string;
}
export interface CompetitorFacingInput {
  user_id: number;
  store_id: number;
  category: string;
  facings_count: number;
  competitor_id?: number;
  name?: string;
}
