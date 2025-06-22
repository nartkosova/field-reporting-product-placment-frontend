import { NavButton } from "../../components/NavButton/NavButton";
import { editPPLFields } from "./EditPPLFields";

const EditPPL = () => {
  return (
    <div className="flex flex-col justify-center align-middle p-6 max-w-xl space-y-4 mx-auto">
      {editPPLFields.map((item) => (
        <NavButton key={item.to} to={item.to}>
          {item.label}
        </NavButton>
      ))}
    </div>
  );
};

export default EditPPL;
