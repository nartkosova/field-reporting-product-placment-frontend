import { useMemo } from "react";
import { useParams } from "react-router-dom";
import podravkaFacingsService from "../../../services/podravkaFacingsService";
import { useBatchFacings } from "../../../hooks/useBatchFacings";
import { BatchFacingsEditor } from "../../../components/BatchFacingsEditor/BatchFacingsEditor";
import {
  PodravkaFacingWithMeta,
  PodravkaFacingInput,
} from "../../../types/podravkaFacingInterface";
import React from "react";

const UpdatePodravkaFacingsPage = () => {
  const { batchId = "" } = useParams();

  const config = useMemo(
    () => ({
      fetchBatch: async (id: string) => {
        const raw = await podravkaFacingsService.getPodravkaFacingsByBatchId(
          id
        );
        return raw.map((item: PodravkaFacingWithMeta) => ({
          ...item,
          label: `${item.name} (${item.category})`,
        }));
      },
      makeKey: (m: PodravkaFacingWithMeta) => String(m.product_id),
      makeLabel: (m: PodravkaFacingWithMeta) => m.label,
      makePayload: (
        m: PodravkaFacingWithMeta,
        count: number
      ): PodravkaFacingInput => ({
        user_id: m.user_id,
        store_id: m.store_id,
        product_id: m.product_id,
        category: m.category,
        facings_count: count,
      }),
      submitBatch: (id: string, facings: PodravkaFacingInput[]) =>
        podravkaFacingsService.updatePodravkaBatch({ batchId: id, facings }),
    }),
    []
  );

  const hook = useBatchFacings<PodravkaFacingWithMeta, PodravkaFacingInput>(
    batchId,
    config
  );

  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-1 py-8">
        <BatchFacingsEditor title="Edito Podravka Facings" hook={hook} />
      </div>
    </div>
  );
};

export default UpdatePodravkaFacingsPage;
