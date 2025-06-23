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
  label: string;
}

export interface CompetitorFacingInput {
  user_id: number;
  store_id: number;
  category: string;
  facings_count: number;
  competitor_id?: number;
  name?: string;
}

export interface CompetitorFacingWithMeta extends CompetitorFacingInput {
  batch_id: string;
  store_name: string;
  competitor_id: number;
  brand_name: string;
}

export interface Batch {
  batch_id: number | string;
  store_name: string;
  created_at: string;
  category: string;
  product_count: number;
}

export interface QueuedPodravkaBatch {
  meta: {
    store_name: string;
    created_at: string;
    category: string;
    product_count: number;
  };
  facings: PodravkaFacingInput[];
}
