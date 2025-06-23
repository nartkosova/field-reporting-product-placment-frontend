import CategorySelector from "../../components/CategorySelector/CategorySelector";

const PriceCheckSelector = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-0 sm:p-0">
      <CategorySelector
        routeBase="/price-check"
        buttonLinks={[
          { label: "Shiko Qmimet Per Podravken", path: "/podravka" },
          { label: "Shiko Qmimet Per Konkurrencen", path: "/konkurrenca" },
        ]}
        categoryRequired={true}
      />
    </div>
  );
};

export default PriceCheckSelector;
