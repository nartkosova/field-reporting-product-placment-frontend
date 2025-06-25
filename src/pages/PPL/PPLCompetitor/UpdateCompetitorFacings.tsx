import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { useBatchFacings } from "../../../hooks/useBatchFacings";
import { BatchFacingsEditor } from "../../../components/BatchFacingsEditor/BatchFacingsEditor";
import {
  CompetitorFacingWithMeta,
  CompetitorFacingInput,
} from "../../../types/podravkaFacingInterface";
import competitorFacingsService from "../../../services/competitorFacingsService";

const UpdateCompetitorFacingsPage = () => {
  const { batchId = "" } = useParams();

  const config = useMemo(
    () => ({
      fetchBatch: competitorFacingsService.getCompetitorFacingByBatchId,
      makeKey: (m: CompetitorFacingWithMeta) => String(m.competitor_id),
      makeLabel: (m: CompetitorFacingWithMeta) =>
        `${m.brand_name} (${m.category})`,
      makePayload: (
        m: CompetitorFacingWithMeta,
        count: number
      ): CompetitorFacingInput => ({
        user_id: m.user_id,
        store_id: m.store_id,
        category: m.category,
        facings_count: count,
        competitor_id: m.competitor_id,
        name: m.brand_name,
      }),
      submitBatch: (id: string, facings: CompetitorFacingInput[]) =>
        competitorFacingsService.updateCompetitorFacingBatch({
          batchId: id,
          facings,
        }),
    }),
    [batchId]
  );

  const hook = useBatchFacings<CompetitorFacingWithMeta, CompetitorFacingInput>(
    batchId,
    config
  );

  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-1 py-8">
        <BatchFacingsEditor title="Edito Facings të konkurrencës" hook={hook} />
      </div>
    </div>
  );
};

export default UpdateCompetitorFacingsPage;
