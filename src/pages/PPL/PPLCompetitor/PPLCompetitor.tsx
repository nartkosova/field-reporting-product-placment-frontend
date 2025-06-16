import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import competitorServices from "../../../services/competitorServices";
import Select from "react-select";
import { AxiosError } from "axios";
import competitorFacingsService from "../../../services/competitorFacingsService";

interface CompetitorEntry {
  id?: number;
  name: string;
  facings: number;
}

const CompetitorFacingsFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const storeId = id ? parseInt(id) : NaN;
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const userId = userInfo?.id;

  const [competitors, setCompetitors] = useState<CompetitorEntry[]>([
    { name: "", facings: 0 },
  ]);
  const [allCompetitorBrands, setAllCompetitorBrands] = useState<
    { competitor_id: number; brand_name: string }[]
  >([]);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brands = await competitorServices.getCompetitorByCategory(
          selectedCategory
        );
        setAllCompetitorBrands(brands);
      } catch (err) {
        console.error("Error fetching brands:", err);
      }
    };

    fetchBrands();
  }, [selectedCategory]);

  const handleCompetitorChange = (
    index: number,
    field: keyof CompetitorEntry,
    value: string | number
  ) => {
    setCompetitors((prev) =>
      prev.map((entry, i) =>
        i === index
          ? {
              ...entry,
              [field]: field === "facings" ? Number(value) : String(value),
            }
          : entry
      )
    );
  };

  const addCompetitor = () => {
    setCompetitors([...competitors, { name: "", facings: 0 }]);
  };

  const totalCompetitorFacings = competitors.reduce(
    (sum, comp) => sum + comp.facings,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const facingData = competitors
        .filter((comp) => comp.name)
        .map((competitor) => {
          const existingBrand = allCompetitorBrands.find(
            (b) =>
              b.brand_name.trim().toLowerCase() ===
              competitor.name.trim().toLowerCase()
          );

          return {
            user_id: userId,
            store_id: Number(storeId),
            category: selectedCategory,
            facings_count: competitor.facings,
            competitor_id: existingBrand?.competitor_id,
          };
        });

      await competitorFacingsService.batchCreateCompetitorFacings(facingData);

      alert("Facings te konkurencës janë dërguar me sukses.");
      setCompetitors([{ name: "", facings: 0 }]);
      navigate(-1);
    } catch (err) {
      const axiosError = err as AxiosError<{ error: string }>;
      const backendMessage =
        axiosError.response?.data?.error || "Error, provo persëri.";
      alert(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-8 border border-gray-200 rounded-2xl shadow-lg space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Facings Konkurrenca</h2>

      <p className="text-gray-700">
        Kategoria e zgjedhur:{" "}
        <span className="text-blue-600 font-medium">{selectedCategory}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {competitors.map((comp, index) => (
          <div key={index} className="flex gap-4">
            <div className="w-1/2">
              <Select
                className="react-select-container"
                classNamePrefix="react-select"
                value={
                  comp.name ? { label: comp.name, value: comp.name } : null
                }
                onChange={(selected) => {
                  if (!selected) return;
                  handleCompetitorChange(index, "name", selected.value);
                  const selectedBrand = allCompetitorBrands.find(
                    (b) => b.brand_name === selected.value
                  );
                  if (selectedBrand) {
                    handleCompetitorChange(
                      index,
                      "id",
                      selectedBrand.competitor_id
                    );
                  }
                }}
                options={allCompetitorBrands.map((brand) => ({
                  label: brand.brand_name,
                  value: brand.brand_name,
                }))}
                placeholder="Zgjedh markën"
                isClearable
              />
            </div>
            <div className="w-1/2">
              <input
                type="number"
                placeholder="Facings"
                min={0}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={comp.facings}
                onChange={(e) =>
                  handleCompetitorChange(index, "facings", e.target.value)
                }
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addCompetitor}
          className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300"
        >
          + Shto konkurent
        </button>

        <div className="text-left font-semibold text-gray-700">
          Total facings:{" "}
          <span className="text-red-600">{totalCompetitorFacings}</span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-4 py-2 w-full rounded hover:bg-blue-700"
        >
          Submit
        </button>
      </form>
    </div>
  );
};

export default CompetitorFacingsFormPage;
