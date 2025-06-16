import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import competitorFacingsService from "../../../services/competitorFacingsService";
import {
  CompetitorFacingInput,
  CompetitorFacingWithMeta,
} from "../../../types/podravkaFacingInterface";
import { AxiosError } from "axios";

const UpdateCompetitorFacings = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const [facingsData, setFacingsData] = useState<CompetitorFacingWithMeta[]>(
    []
  );
  const [facings, setFacings] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const totalFacings = Object.values(facings).reduce(
    (sum, val) => sum + val,
    0
  );

  useEffect(() => {
    const fetchFacings = async () => {
      try {
        const data: CompetitorFacingWithMeta[] =
          await competitorFacingsService.getCompetitorFacingByBatchId(
            String(batchId)
          );

        setFacingsData(data);

        const initial = data.reduce<Record<string, number>>((acc, facing) => {
          acc[`${facing.store_id}-${facing.competitor_id}-${facing.category}`] =
            facing.facings_count;
          return acc;
        }, {});

        setFacings(initial);
      } catch (err) {
        const axiosError = err as AxiosError<{ error: string }>;
        const message =
          axiosError.response?.data?.error ||
          "Gabim gjatë ngarkimit të të dhënave.";
        alert(message);
      } finally {
        setLoading(false);
      }
    };

    fetchFacings();
  }, [batchId]);

  const handleFacingChange = (key: string, value: number) => {
    setFacings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const updatedFacings: CompetitorFacingInput[] = facingsData.map(
        (item) => {
          const key = `${item.store_id}-${item.competitor_id}-${item.category}`;
          return {
            user_id: item.user_id,
            store_id: item.store_id,
            competitor_id: item.competitor_id,
            category: item.category,
            facings_count: facings[key] || 0,
          };
        }
      );

      await competitorFacingsService.updateCompetitorFacingBatch({
        batchId: batchId!,
        facings: updatedFacings,
      });

      alert("Facings përditësuan me sukses!");
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      const message =
        axiosError.response?.data?.error || "Gabim gjatë përditësimit.";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Edit Competitor Facings</h2>
      {loading ? (
        <p>Duke i ngarkuar facings...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {facingsData.map((item) => {
            const key = `${item.store_id}-${item.competitor_id}-${item.category}`;
            return (
              <div key={key} className="border p-2 rounded">
                <label>
                  {item.brand_name || "Unknown"} ({item.category})
                </label>
                <input
                  type="number"
                  className="border p-2 w-full mt-1"
                  min={0}
                  value={facings[key] ?? ""}
                  onChange={(e) =>
                    handleFacingChange(key, Number(e.target.value))
                  }
                />
              </div>
            );
          })}
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

export default UpdateCompetitorFacings;
