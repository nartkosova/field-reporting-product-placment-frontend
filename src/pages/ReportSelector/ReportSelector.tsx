import CategorySelector from "../../components/CategorySelector/CategorySelector";
import { reportSelectorFIelds } from "./reportSelectorFields";

const ReportSelector = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8">
        <CategorySelector
          routeBase="/reports"
          buttonLinks={reportSelectorFIelds}
          categoryRequired={false}
          textRendered={false}
          storeRequired={false}
        />
      </div>
    </div>
  );
};

export default ReportSelector;
