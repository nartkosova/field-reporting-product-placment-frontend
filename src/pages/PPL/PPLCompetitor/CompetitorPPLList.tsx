/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntityList } from "../../../components/EntityList/EntityList";
import competitorFacingsService from "../../../services/competitorFacingsService";
import { formattedDate } from "../../../utils/utils";
import { Batch } from "../../../types/podravkaFacingInterface";
import React from "react";

const CompetitorPPLEditor = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8">
        <EntityList
          title="Raportet PPL"
          fetchAll={async () => {
            const data =
              await competitorFacingsService.getCompetitorFacingByUserId();
            return data.map((batch: Batch) => ({
              id: batch.batch_id,
              name: batch.store_name,
              created_at: batch.created_at,
              category: batch.category,
              product_count: batch.product_count,
            }));
          }}
          onDelete={async (batchId: number | string) => {
            await competitorFacingsService.deleteCompetitorFacingBatch(
              batchId.toString()
            );
          }}
          editPath="/ppl-konkurrenca/edit"
          itemLabel="raport PPL"
          renderDetails={(item) => (
            <div className="text-sm text-gray-600">
              Kategoria: {(item as any).category} | Konkurrent:{" "}
              {(item as any).product_count} | Data:{" "}
              {formattedDate(item.created_at!)}
            </div>
          )}
        />
      </div>
    </div>
  );
};
export default CompetitorPPLEditor;
