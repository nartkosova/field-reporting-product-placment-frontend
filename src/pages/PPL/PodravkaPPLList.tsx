/* eslint-disable @typescript-eslint/no-explicit-any */
import { EntityList } from "../../components/EntityList/EntityList";
import podravkaFacingsService from "../../services/podravkaFacingsService";
import { formattedDate } from "../../utils/utils";

interface Batch {
  batch_id: number;
  store_name: string;
  report_date: string;
  report_time: string;
  category: string;
  product_count: number;
}

const PodravkaPPLEditor = () => {
  return (
    <EntityList
      title="PPL Reports"
      fetchAll={async () => {
        const data = await podravkaFacingsService.getUserPPLBatches();
        return data.map((batch: Batch) => ({
          id: batch.batch_id,
          name: batch.store_name,
          created_at: { date: batch.report_date, time: batch.report_time },
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
      itemLabel="raportin PPL"
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
