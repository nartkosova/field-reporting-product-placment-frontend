import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import podravkaFacingsService from "../../../services/podravkaFacingsService";
import {
  PodravkaFacingInput,
  PodravkaFacingWithMeta,
} from "../../../types/podravkaFacingInterface";
import { AxiosError } from "axios";

const UpdatePodravkaFacingsPage = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const [facingsData, setFacingsData] = useState<PodravkaFacingWithMeta[]>([]);
  const [facings, setFacings] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const totalFacings = Object.values(facings).reduce(
    (sum, count) => sum + count,
    0
  );

  useEffect(() => {
    const fetchFacings = async () => {
      try {
        const data: PodravkaFacingWithMeta[] =
          await podravkaFacingsService.getPodravkaFacingsByBatchId(
            String(batchId)
          );
        setFacingsData(data);

        const initial = data.reduce<Record<number, number>>((acc, facing) => {
          acc[facing.product_id] = facing.facings_count;
          return acc;
        }, {});
        setFacings(initial);
      } catch (err) {
        console.error("Error loading batch:", err);
        const axiosError = err as AxiosError<{ error: string }>;
        const backendMessage =
          axiosError.response?.data?.error || "Error, provo persëri.";
        alert(backendMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchFacings();
  }, [batchId]);

  const handleFacingChange = (productId: number, value: number) => {
    setFacings((prev) => ({ ...prev, [productId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const updatedFacings: PodravkaFacingInput[] = facingsData.map((item) => ({
        user_id: item.user_id,
        store_id: item.store_id,
        product_id: item.product_id,
        category: item.category,
        facings_count: facings[item.product_id] || 0,
      }));

      await podravkaFacingsService.updatePodravkaBatch({
        batchId: batchId!,
        facings: updatedFacings,
      });

      alert("Facings përditësuan me sukses!");
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      const backendMessage =
        axiosError.response?.data?.error || "Gabim gjatë ngarkimit të facings.";
      alert(backendMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Edit Podravka Facings</h2>
      {loading ? (
        <p>Duke i ngarkuar facings...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {facingsData.map((product) => (
            <div key={product.product_id} className="border p-2 rounded">
              <label>
                {product.name} ({product.category})
              </label>
              <input
                type="number"
                className="border p-2 w-full mt-1"
                min={0}
                value={facings[product.product_id] ?? ""}
                onChange={(e) =>
                  handleFacingChange(product.product_id, Number(e.target.value))
                }
              />
            </div>
          ))}
          Total facings: <span className="text-red-600">{totalFacings}</span>
          <button
            type="submit"
            disabled={submitting}
            className="bg-green-600 text-white px-4 py-2 w-full rounded hover:bg-green-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Duke u përditsuar..." : "Perditëso Facings"}
          </button>
        </form>
      )}
    </div>
  );
};

export default UpdatePodravkaFacingsPage;
