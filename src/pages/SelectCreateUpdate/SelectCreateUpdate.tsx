import CategorySelector from "../../components/CategorySelector/CategorySelector";
import { useUser } from "../../hooks/useUser";
import {
  createLinks as baseCreateLinks,
  editLinks as baseEditLinks,
} from "./selectCreateUpdateFields";

const SelectCreateEdit = () => {
  const { user } = useUser();

  const createLinks = baseCreateLinks.filter((link) => {
    if (link.label === "Krijo User Te Ri") {
      return user?.user === "Ilir";
    }
    return true;
  });

  const editLinks = baseEditLinks.filter((link) => {
    if (link.label === "Edito Userat") {
      return user?.user === "Ilir";
    }
    return true;
  });

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

        <div className="max-w-4xl h-[1px] w-full bg-neutral-700 rounded-full my-6" />

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
