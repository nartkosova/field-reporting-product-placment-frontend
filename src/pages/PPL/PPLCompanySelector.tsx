import CategorySelector from "../../components/CategorySelector/CategorySelector";

const FacingsSelector = () => {
  return (
    <CategorySelector
      routeBase="/ppl-store"
      buttonLinks={[
        { label: "PPL Podravka", path: "/ppl-podravka" },
        { label: "PPL Konkurrenca", path: "/ppl-konkurrenca" },
      ]}
      categoryRequired={true}
    />
  );
};

export default FacingsSelector;
