import CategorySelector from "../../components/CategorySelector/CategorySelector";

const FacingsSelector = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8">
        <CategorySelector
          routeBase="/ppl-store"
          buttonLinks={[
            { label: "PPL Podravka", path: "/ppl-podravka" },
            { label: "PPL Konkurrenca", path: "/ppl-konkurrenca" },
          ]}
          categoryRequired={true}
        />
      </div>
    </div>
  );
};

export default FacingsSelector;
