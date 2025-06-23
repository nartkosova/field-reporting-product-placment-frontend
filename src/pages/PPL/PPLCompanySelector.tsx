import CategorySelector from "../../components/CategorySelector/CategorySelector";

const FacingsSelector = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-0 sm:p-0">
      <CategorySelector
        routeBase="/ppl-store"
        buttonLinks={[
          { label: "PPL Podravka", path: "/ppl-podravka" },
          { label: "PPL Konkurrenca", path: "/ppl-konkurrenca" },
        ]}
        categoryRequired={true}
      />
    </div>
  );
};

export default FacingsSelector;
