import { useMemo } from "react";
import { useParams } from "react-router-dom";
import podravkaFacingsService from "../../../services/podravkaFacingsService";
import { useBatchFacings } from "../../../hooks/useBatchFacings";
import { BatchFacingsEditor } from "../../../components/BatchFacingsEditor/BatchFacingsEditor";
import {
  PodravkaFacingWithMeta,
  PodravkaFacingInput,
} from "../../../types/podravkaFacingInterface";

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
    [batchId]
  );

  const hook = useBatchFacings<PodravkaFacingWithMeta, PodravkaFacingInput>(
    batchId,
    config
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-2 sm:p-0">
      <div className="max-w-xl w-full">
        <BatchFacingsEditor title="Edito Podravka Facings" hook={hook} />
      </div>
    </div>
  );
};

export default UpdatePodravkaFacingsPage;
