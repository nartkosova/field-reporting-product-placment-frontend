import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import { AxiosError } from "axios";
import { useProductCategories } from "../../../hooks/useProductCategories";
import productServices from "../../../services/productServices";
import React from "react";
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

const UpdatePodravkaProduct = () => {
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<
    Record<string, string | number>
  >({});
  const [loading, setLoading] = useState(true);
  const { categories, businessUnits } = useProductCategories();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const product = await productServices.getProductsByIdWithRanking(
          Number(id)
        );

        if (!product) {
          alert("Produkti nuk u gjet.");
          return;
        }

        setInitialValues({
          name: product.name,
          category: product.category,
          podravka_code: product.podravka_code,
          elkos_code: product.elkos_code,
          product_category: product.product_category,
          business_unit: product.business_unit,
          weight: product.weight ?? "",
          total_rank: product.total_rank ?? "",
          category_rank: product.category_rank ?? "",
          sales_last_year: product.sales_last_year ?? "",
          category_sales_share: product.category_sales_share ?? "",
          year: product.year ?? 2024,
        });
      } catch (err) {
        console.error("Gabim gjatë ngarkimit", err);
        const axiosError = err as AxiosError<{ error: string }>;
        alert(
          axiosError.response?.data?.error ||
            "Gabim gjatë ngarkimit të të dhënave."
        );
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
      await productServices.updatePodravkaProduct(Number(id), {
        name: data.name as string,
        category: data.category as string,
        podravka_code: data.podravka_code as string,
        elkos_code: Number(data.elkos_code),
        product_category: data.product_category as string,
        weight: Number(data.weight),
        business_unit: data.business_unit as string,
        total_rank: data.total_rank ? Number(data.total_rank) : undefined,
        category_rank: data.category_rank
          ? Number(data.category_rank)
          : undefined,
        sales_last_year: data.sales_last_year
          ? Number(data.sales_last_year)
          : undefined,
        category_sales_share: data.category_sales_share
          ? Number(data.category_sales_share)
          : undefined,
        year: data.year ? Number(data.year) : 2024,
      });
    } catch (err) {
      console.error("Gabim gjatë përditësimit", err);
      const axiosError = err as AxiosError<{ error: string }>;
      throw new Error(
        axiosError.response?.data?.error || "Gabim gjatë përditësimit."
      );
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-1 py-8">
        {loading ? (
          <LoadingSpinner className="mt-10" />
        ) : (
          <CreateUpdateForm
            title="Përditëso Produktin Podravka"
            submitText="Përditëso"
            initialValues={initialValues}
            onSubmit={handleUpdate}
            fields={[
              { name: "name", label: "Emri i produktit" },
              {
                name: "business_unit",
                label: "PP",
                type: "select",
                options: businessUnits.map((cat) => ({
                  label: cat,
                  value: cat,
                })),
              },
              {
                name: "category",
                label: "Kategoria",
                type: "select",
                options: categories.map((cat) => ({ label: cat, value: cat })),
              },
              {
                name: "product_category",
                label: "Kategoria e produktit",
                type: "select",
                options: ["A", "B", "C", "D", "E", "F", "G"].map((val) => ({
                  label: val,
                  value: val,
                })),
              },
              { name: "podravka_code", label: "Kodi Podravka" },
              {
                name: "elkos_code",
                label: "Kodi Elkos",
                type: "number",
                step: "1",
              },
              {
                name: "weight",
                label: "Pesha (Kg)",
                type: "number",
                step: "0.01",
              },
              {
                name: "total_rank",
                label: "Rang Totali",
                type: "number",
                step: "1",
              },
              {
                name: "category_rank",
                label: "Rang Kategoria",
                type: "number",
                step: "1",
              },
              {
                name: "sales_last_year",
                label: "Shitjet vitin e kaluar",
                type: "number",
                step: "0.01",
              },
              {
                name: "category_sales_share",
                label: "Pjesa e tregut në kategori",
                type: "number",
                step: "0.01",
              },
              {
                name: "year",
                label: "Viti i shitjes",
                type: "number",
                step: "1",
              },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default UpdatePodravkaProduct;
