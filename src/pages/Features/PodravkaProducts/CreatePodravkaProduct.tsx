import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import { useProductCategories } from "../../../hooks/useProductCategories";
import productServices from "../../../services/productServices";

const CreatePodravkaProduct = () => {
  // const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const { categories, businessUnits } = useProductCategories();

  const handleSubmit = async (
    data: Record<string, string | number | (string | number)[]>
  ) => {
    const payload = {
      name: data.name as string,
      category: data.category as string,
      podravka_code: data.podravka_code as string,
      elkos_code: data.elkos_code as number,
      product_category: data.product_category as string,
      weight: data.weight as number,
      business_unit: data.business_unit as string,
      // created_by: userInfo?.id,  // <--- check schema
    };

    await productServices.createPodravkaProduct(payload);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-1 py-8">
        <CreateUpdateForm
          title="Krijo Produkt Podravka"
          submitText="Krijo Produkt"
          fields={[
            { name: "name", label: "Emri i produktit" },
            {
              name: "business_unit",
              label: "PP",
              type: "select",
              options: businessUnits.map((cat) => ({ label: cat, value: cat })),
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
            { name: "elkos_code", label: "Kodi Elkos", type: "number" },
            { name: "weight", label: "Pesha (Kg)", type: "number", step: "0.01" },
          ]}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default CreatePodravkaProduct;
