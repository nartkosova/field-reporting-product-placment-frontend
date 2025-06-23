import CategorySelector from "../../components/CategorySelector/CategorySelector";

const SelectCreateEdit = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-0 sm:p-0">
      <CategorySelector
        routeBase="/settings"
        buttonLinks={[
          { label: "Krijo Shitore", path: "/create/store" },
          { label: "Krijo Konkurrenc", path: "/create/competitor-brand" },
          {
            label: "Krijo Produkt Konkurrence",
            path: "/create/competitor-product",
          },
          { label: "Krijo User Te Ri", path: "/create/user" },
          { label: "Edito Shitoren", path: "/edit/store" },
          { label: "Edito Konkurrencen", path: "/edit/competitor-brands" },
          {
            label: "Edito Produktet e Konkurrences",
            path: "/edit/competitor-products",
          },
          { label: "Edito Userat", path: "/edit/users" },
        ]}
        categoryRequired={false}
      />
    </div>
  );
};

export default SelectCreateEdit;
