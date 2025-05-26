import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import competitorServices from "../Services/competitorServices";
import Select from "react-select";
interface CompetitorEntry {
  id?: number;
  name: string;
  facings: number;
  isNew?: boolean;
}

const CompetitorFacingsFormPage = () => {
  const { id } = useParams<{ id: string }>();
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
        const brands = await competitorServices.getAllCompetitorBrands();
        setAllCompetitorBrands(brands);
        console.log("Fetched competitor brands:", brands);
      } catch (err) {
        console.error("Error fetching brands:", err);
      }
    };

    fetchBrands();
  }, []);

  const handleCompetitorChange = (
    index: number,
    field: keyof CompetitorEntry,
    value: string | number
  ) => {
    setCompetitors((prev) =>
      prev.map((entry, i) => {
        if (i === index) {
          if (field === "name" && value === "__new__") {
            return { ...entry, name: "", isNew: true };
          }
          return {
            ...entry,
            [field]: field === "facings" ? Number(value) : String(value),
            isNew: entry.isNew,
          };
        }
        return entry;
      })
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
      const facingData = competitors.map((competitor) => {
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
          competitor_id: existingBrand
            ? existingBrand.competitor_id
            : undefined,
          name: !existingBrand ? competitor.name : undefined,
        };
      });

      await competitorServices.batchCreateCompetitorFacings(facingData);

      alert("Competitor facings submitted!");
      setCompetitors([{ name: "", facings: 0 }]);
    } catch (err) {
      alert("Error submitting facings");
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Facings Konkurrenca</h2>
      <p>
        Kategoria e zgjedhur:{" "}
        <span className="text-blue-600">{selectedCategory}</span>
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        {competitors.map((comp, index) => (
          <div key={index} className="flex space-x-2">
            {!comp.isNew ? (
              <Select
                className="w-1/2"
                value={
                  comp.isNew
                    ? { label: "+ Add new competitor", value: "__new__" }
                    : comp.name
                    ? { label: comp.name, value: comp.name }
                    : null
                }
                onChange={(selected) => {
                  if (!selected) return;
                  if (selected.value === "__new__") {
                    handleCompetitorChange(index, "name", "__new__");
                  } else {
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
                      console.log("Selected existing brand:", selectedBrand);
                    }
                  }
                }}
                options={[
                  ...allCompetitorBrands.map((brand) => ({
                    label: brand.brand_name,
                    value: brand.brand_name,
                  })),
                  { label: "+ Add new competitor", value: "__new__" },
                ]}
                placeholder="Select competitor"
                isClearable
              />
            ) : (
              <input
                type="text"
                placeholder="New Competitor Name"
                className="border p-2 w-1/2"
                value={comp.name}
                onChange={(e) =>
                  handleCompetitorChange(index, "name", e.target.value)
                }
                required
              />
            )}
            <input
              type="number"
              placeholder="Facings"
              min={0}
              className="border p-2 w-1/2"
              value={comp.facings}
              onChange={(e) =>
                handleCompetitorChange(index, "facings", e.target.value)
              }
            />
          </div>
        ))}

        <button
          type="button"
          onClick={addCompetitor}
          className="bg-gray-200 px-4 py-1 rounded hover:bg-gray-300"
        >
          + Shto konkurent
        </button>

        <div className="text-left font-semibold">
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
