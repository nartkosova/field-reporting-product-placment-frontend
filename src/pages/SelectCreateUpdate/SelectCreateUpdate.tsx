import CategorySelector from "../../components/CategorySelector/CategorySelector";

const SelectCreateEdit = () => {
  return (
    <CategorySelector
      routeBase="/settings"
      buttonLinks={[
        { label: "Krijo Konkurrenc", path: "/create/competitor-brand" },
        {
          label: "Krijo Produkt Konkurrence",
          path: "/create/competitor-product",
        },
        { label: "Krijo User Te Ri", path: "/create/user" },
        { label: "Edito Konkurrencen", path: "/edit/competitor-brands" },
      ]}
      categoryRequired={false}
    />
  );
};

export default SelectCreateEdit;
