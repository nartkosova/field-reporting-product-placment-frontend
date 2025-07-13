/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntityList } from "../../../components/EntityList/EntityList";
import podravkaFacingsService from "../../../services/podravkaFacingsService";
import { Batch } from "../../../types/podravkaFacingInterface";

const PodravkaPPLEditor = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8">
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
              Produkte: {(item as any).product_count}
            </div>
          )}
        />
      </div>
    </div>
  );
};
export default PodravkaPPLEditor;
