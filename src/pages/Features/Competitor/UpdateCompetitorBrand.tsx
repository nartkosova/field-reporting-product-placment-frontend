import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import competitorServices from "../../../services/competitorServices";
import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import { AxiosError } from "axios";
import { competitorFields } from "./CompetitorFields";
import { useProductCategories } from "../../../hooks/useProductCategories";
import React from "react";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

const UpdateCompetitorBrand = () => {
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const { categories } = useProductCategories();
  useEffect(() => {
    const fetchBrand = async () => {
      try {
        const brand = await competitorServices.getCompetitorBrandById(
          Number(id)
        );
        setInitialValues({
          brand_name: brand.brand_name,
          categories: brand.categories,
        });
      } catch (err) {
        console.error("Failed to load brand", err);
        const axiosError = err as AxiosError<{ error: string }>;
        const backendMessage =
          axiosError.response?.data?.error ||
          "Gabim gjatë ngarkimit të dhenave.";
        alert(backendMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchBrand();
  }, [id]);

  const handleUpdate = async (
    data: Record<string, string | number | (string | number)[]>
  ) => {
    if (!id) return;
    try {
      await competitorServices.updateCompetitorBrand(Number(id), {
        brand_name: data.brand_name as string,
        categories: data.categories as string[],
      });
    } catch (err) {
      console.error("Error updating brand", err);
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
            title="Përditëso Konkurrencën"
            fields={competitorFields({
              categoryOptions: categories.map((cat) => ({
                label: cat,
                value: cat,
              })),
            })}
            initialValues={initialValues}
            onSubmit={handleUpdate}
            submitText="Vazhdo"
          />
        )}
      </div>
    </div>
  );
};

export default UpdateCompetitorBrand;
