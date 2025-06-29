import CategorySelector from "../../components/CategorySelector/CategorySelector";
import { reportSelectorFields } from "./reportSelectorFields";
import React from "react";

const ReportSelector = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const isAdmin = userInfo?.role === "admin";

  const filteredFields = isAdmin
    ? reportSelectorFields
    : reportSelectorFields.filter((_, index) => index !== 1);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8">
        <CategorySelector
          routeBase="/reports"
          buttonLinks={filteredFields}
          categoryRequired={false}
          textRendered={false}
          storeRequired={false}
        />
      </div>
    </div>
  );
};

export default ReportSelector;
