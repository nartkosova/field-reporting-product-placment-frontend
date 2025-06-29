import CategorySelector from "../../components/CategorySelector/CategorySelector";
import { editPPLFields } from "./EditPPLFields";
import React from "react";

const EditPPL = () => {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-4xl flex flex-col items-center justify-center flex-1 py-8">
        <CategorySelector
          routeBase="/edit-ppl"
          buttonLinks={editPPLFields}
          categoryRequired={false}
          textRendered={false}
          storeRequired={false}
        />
      </div>
    </div>
  );
};

export default EditPPL;
