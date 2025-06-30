import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import competitorServices from "../../../services/competitorServices";
import { AxiosError } from "axios";
import competitorFacingsService from "../../../services/competitorFacingsService";
import { useSelectedStore } from "../../../hooks/useSelectStore";
import { isOnline } from "../../../utils/cacheManager";
import {
  getCachedBrandsByCategory,
  queueCompetitorFacings,
} from "../../../db/db";
import FacingsForm from "../../../components/FacingsForm/FacingsForm";

interface CompetitorEntry {
  id?: number;
  name: string;
  facings: number;
}

const PPLCompetitor = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const storeInfo = useSelectedStore();
  const storeId = storeInfo?.store_id || 0;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") || "";
  const userId = userInfo?.id;

  const [competitors, setCompetitors] = useState<CompetitorEntry[]>([
    { name: "", facings: 0 },
  ]);
  const [allCompetitorBrands, setAllCompetitorBrands] = useState<
    { competitor_id: number; brand_name: string }[]
  >([]);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      setBrandsLoading(true);
      try {
        let brands: { competitor_id: number; brand_name: string }[] = [];

        if (!isOnline()) {
          brands = await getCachedBrandsByCategory(selectedCategory);
        } else {
          brands = await competitorServices.getCompetitorByCategory(
            selectedCategory
          );
        }

        setAllCompetitorBrands(brands);

        setCompetitors(
          brands.map((b) => ({
            id: b.competitor_id,
            name: b.brand_name,
            facings: 0,
          }))
        );
      } catch (err) {
        console.error("Error fetching brands:", err);
      } finally {
        setBrandsLoading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const facingData = competitors
        .filter((comp) => comp.name.trim())
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

      if (!isOnline()) {
        await queueCompetitorFacings(facingData);
        alert("Jeni offline – të dhënat janë ruajtur dhe do dërgohen më vonë.");
      } else {
        await competitorFacingsService.batchCreateCompetitorFacings(facingData);
        alert("Facings te konkurencës janë dërguar me sukses.");
      }

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
  const entries = competitors.map((comp, index) => ({
    id: index,
    label: comp.name || `Konkurent ${index + 1}`,
    value: comp.facings,
  }));
  const handleFacingChange = (id: string | number, value: number) => {
    const index = typeof id === "number" ? id : parseInt(id, 10);
    if (!isNaN(index)) {
      handleCompetitorChange(index, "facings", value);
    }
  };
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-1 py-8">
        <FacingsForm
          title="Facings Konkurrenca"
          category={selectedCategory}
          entries={entries}
          onChange={handleFacingChange}
          onSubmit={handleSubmit}
          productsLoading={brandsLoading}
          loading={isSubmitting}
        />
      </div>
    </div>
  );
};

export default PPLCompetitor;
