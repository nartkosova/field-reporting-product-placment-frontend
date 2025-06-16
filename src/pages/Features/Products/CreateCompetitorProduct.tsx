import { useEffect, useState } from "react";
import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import competitorServices from "../../../services/competitorServices";
import { useProductCategories } from "../../../hooks/useProductCategories";
import productServices from "../../../services/productServices";

const CreateCompetitorProductPage = () => {
  const [competitorOptions, setCompetitorOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const { categories } = useProductCategories();
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");

  useEffect(() => {
    const fetchBrands = async () => {
      const brands = await competitorServices.getAllCompetitorBrands();
      const formatted = brands.map(
        (b: { brand_name: string; competitor_id: number }) => ({
          label: b.brand_name,
          value: b.competitor_id,
        })
      );
      setCompetitorOptions(formatted);
    };
    fetchBrands();
  }, []);

  const handleSubmit = async (formData: Record<string, string | number>) => {
    const payload = {
      name: formData.name as string,
      category: formData.category as string,
      weight: formData.weight ? Number(formData.weight) : undefined,
      competitor_id: Number(formData.competitor_id),
      created_by: userInfo?.id,
    };

    await productServices.createCompetitorProduct(payload);
  };

  return (
    <CreateUpdateForm
      title="Create Competitor Product"
      submitText="Create Product"
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
  );
};

export default CreateCompetitorProductPage;
