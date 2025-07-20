import { useEffect, useState } from "react";
import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import competitorServices from "../../../services/competitorServices";
import { useProductCategories } from "../../../hooks/useProductCategories";
import productServices from "../../../services/productServices";
import { useUser } from "../../../hooks/useUser";

const CreateCompetitorProductPage = () => {
  const { user: userInfo } = useUser();
  const { categories } = useProductCategories();
  const [competitorOptions, setCompetitorOptions] = useState<
    { label: string; value: number }[]
  >([]);

  useEffect(() => {
    const fetchBrands = async () => {
      const brands = await competitorServices.getAllCompetitorBrands();
      setCompetitorOptions(
        brands.map((b: { brand_name: string; competitor_id: number }) => ({
          label: b.brand_name,
          value: b.competitor_id,
        }))
      );
    };
    fetchBrands();
  }, []);

  const handleSubmit = async (
    data: Record<string, string | number | (string | number)[]>
  ) => {
    if (!userInfo?.user_id) {
      alert("User not authenticated");
      return;
    }
    const payload = {
      name: data.name as string,
      category: data.category as string,
      weight: data.weight ? Number(data.weight) : undefined,
      competitor_id: Number(data.competitor_id),
      created_by: userInfo.user_id,
    };

    await productServices.createCompetitorProduct(payload);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-1 py-8">
        <CreateUpdateForm
          title="Krijo Produkt Konkurrent"
          submitText="Krijo Produkt"
          fields={[
            { name: "name", label: "Emri i produktit" },
            {
              name: "category",
              label: "Kategoria",
              type: "select",
              options: categories.map((cat) => ({ label: cat, value: cat })),
            },
            { name: "weight", label: "Pesha (kg)", type: "number" },
            {
              name: "competitor_id",
              label: "Competitor Brand",
              type: "select",
              options: competitorOptions,
            },
          ]}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default CreateCompetitorProductPage;
