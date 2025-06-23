/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntityList } from "../../../components/EntityList/EntityList";
import podravkaFacingsService from "../../../services/podravkaFacingsService";
import { formattedDate } from "../../../utils/utils";
import { Batch } from "../../../types/podravkaFacingInterface";

const PodravkaPPLEditor = () => {
  return (
    <EntityList
      title="Raportet PPL"
      fetchAll={async () => {
        const data = await podravkaFacingsService.getUserPPLBatches();
        return data.map((batch: Batch) => ({
          id: batch.batch_id,
          name: batch.store_name,
          created_at: batch.created_at,
          category: batch.category,
          product_count: batch.product_count,
        }));
      }}
      onDelete={async (batchId: number | string) => {
        await podravkaFacingsService.deletePodravkaFacingBatch(
          batchId.toString()
        );
      }}
      editPath="/ppl-podravka/edit"
      itemLabel="raport PPL"
      renderDetails={(item) => (
        <div className="text-sm text-gray-600">
          Kategoria: {(item as any).category} | Produkte:{" "}
          {(item as any).product_count} | Data:{" "}
          {formattedDate(item.created_at!)}
        </div>
      )}
    />
  );
};
export default PodravkaPPLEditor;
