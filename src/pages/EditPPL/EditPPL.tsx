import { NavButton } from "../../components/NavButton/NavButton";
import { editPPLFields } from "./EditPPLFields";

const EditPPL = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-2 sm:p-0">
      <div className="flex flex-col justify-center align-middle p-6 max-w-xl w-full space-y-6 bg-black rounded-2xl shadow-md border border-neutral-800">
        {editPPLFields.map((item) => (
          <NavButton key={item.to} to={item.to} variant="card">
            {item.label}
          </NavButton>
        ))}
      </div>
    </div>
  );
};

export default EditPPL;
