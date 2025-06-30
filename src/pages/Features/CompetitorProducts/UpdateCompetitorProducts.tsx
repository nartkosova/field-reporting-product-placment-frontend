import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import competitorServices from "../../../services/competitorServices";
import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import { AxiosError } from "axios";
import { CompetitorProduct } from "../../../types/productInterface";
import { useProductCategories } from "../../../hooks/useProductCategories";
import productServices from "../../../services/productServices";

import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

const UpdateCompetitorProduct = () => {
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<
    Record<string, string | number>
  >({});
  const [loading, setLoading] = useState(true);
  const [competitorOptions, setCompetitorOptions] = useState<
    { label: string; value: number }[]
  >([]);
  const { categories } = useProductCategories();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const brands = await competitorServices.getAllCompetitorBrands();
        const formattedBrands = brands.map(
          (b: { brand_name: string; competitor_id: number }) => ({
            label: b.brand_name,
            value: b.competitor_id,
          })
        );
        setCompetitorOptions(formattedBrands);

        const products = await productServices.getCompetitorProducts({});
        const product = products.find(
          (p: CompetitorProduct) => p.competitor_product_id === Number(id)
        );

        if (!product) {
          alert("Produkti nuk u gjet.");
          return;
        }

        setInitialValues({
          name: product.name,
          category: product.category,
          weight: product.weight ?? "",
          competitor_id: product.competitor_id,
        });
      } catch (err) {
        console.error("Failed to load data", err);
        const axiosError = err as AxiosError<{ error: string }>;
        const backendMessage =
          axiosError.response?.data?.error ||
          "Gabim gjatë ngarkimit të të dhënave.";
        alert(backendMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleUpdate = async (
    data: Record<string, string | number | (string | number)[]>
  ) => {
    if (!id) return;
    try {
      await productServices.updateCompetitorProduct(Number(id), {
        name: data.name as string,
        category: data.category as string,
        weight: data.weight ? Number(data.weight) : undefined,
        competitor_id: Number(data.competitor_id),
      });
    } catch (err) {
      console.error("Gabim gjatë përditësimit", err);
      const axiosError = err as AxiosError<{ error: string }>;
      const backendMessage =
        axiosError.response?.data?.error || "Gabim gjatë përditësimit.";
      throw new Error(backendMessage);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-1 py-8">
        {loading ? (
          <LoadingSpinner className="mt-10" />
        ) : (
          <CreateUpdateForm
            title="Përditëso Produktin"
            fields={[
              { name: "name", label: "Emri i produktit" },
              {
                name: "category",
                label: "Kategoria",
                type: "select",
                options: categories.map((category) => ({
                  label: category,
                  value: category,
                })),
              },
              {
                name: "weight",
                label: "Pesha (kg)",
              },
              {
                name: "competitor_id",
                label: "Brandi Konkurrent",
                type: "select",
                options: competitorOptions,
              },
            ]}
            initialValues={initialValues}
            onSubmit={handleUpdate}
            submitText="Përditëso"
          />
        )}
      </div>
    </div>
  );
};

export default UpdateCompetitorProduct;
