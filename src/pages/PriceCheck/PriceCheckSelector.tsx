import CategorySelector from "../../components/CategorySelector/CategorySelector";
import React from "react";

const PriceCheckSelector = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-2xl flex flex-col items-center justify-center flex-1 py-8">
        <CategorySelector
          routeBase="/price-check"
          buttonLinks={[
            { label: "Shiko Qmimet Per Podravken", path: "/podravka" },
            { label: "Shiko Qmimet Per Konkurrencen", path: "/konkurrenca" },
          ]}
          categoryRequired={true}
        />
      </div>
    </div>
  );
};

export default PriceCheckSelector;
