import CategorySelector from "../../components/CategorySelector/CategorySelector";
import { createLinks, editLinks } from "./selectCreateUpdateFields";
import React from "react";

const SelectCreateEdit = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8">
        <div className="w-full max-w-4xl text-center mb-6">
          <h2 className="text-3xl font-bold text-white">Panel i Menaxhimit</h2>
          <p className="text-neutral-400 mt-2">
            Zgjidh një veprim për të krijuar ose edituar të dhënat
          </p>
        </div>
        <CategorySelector
          routeBase="/settings"
          buttonLinks={createLinks}
          categoryRequired={false}
          textRendered={false}
          storeRequired={false}
        />

        <div className="max-w-2xl h-[1px] w-full bg-neutral-700 rounded-full my-6" />

        <CategorySelector
          routeBase="/settings"
          buttonLinks={editLinks}
          categoryRequired={false}
          textRendered={false}
          storeRequired={false}
        />
      </div>
    </div>
  );
};

export default SelectCreateEdit;
