import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import { AxiosError } from "axios";
import { useProductCategories } from "../../../hooks/useProductCategories";
import productServices from "../../../services/productServices";
import { PodravkaProduct } from "../../../types/productInterface";

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
        const products = await productServices.getProducts();
        const product = products.find(
          (p: PodravkaProduct) => p.product_id === Number(id)
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
        elkos_code: data.elkos_code as number,
        product_category: data.product_category as string,
        weight: data.weight as number,
        business_unit: data.business_unit as string,
      });
      alert("Produkti u përditësua me sukses.");
    } catch (err) {
      console.error("Gabim gjatë përditësimit", err);
      const axiosError = err as AxiosError<{ error: string }>;
      alert(axiosError.response?.data?.error || "Gabim gjatë përditësimit.");
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-1 py-8">
        {loading ? (
          <p className="text-center text-white mt-10">Duke u ngarkuar...</p>
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
                step: "0.01",
              },
              { name: "weight", label: "Pesha (Kg)", type: "number", step: "0.01" },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default UpdatePodravkaProduct;
