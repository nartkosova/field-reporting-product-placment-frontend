import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import { userFields } from "./userFields";
import userService from "../../../services/userService";

const CreateUserPage = () => {
  const handleSubmit = async (
    data: Record<string, string | number | (string | number)[]>
  ) => {
    const payload = {
      user: data.user as string,
      password: data.password as string,
      role: data.role as string,
    };

    await userService.createUser(payload);
  };

  return (
    <div className="w-full flex items-center justify-center bg-black p-0 sm:p-0">
      <div className="max-w-2xl w-full">
        <CreateUpdateForm
          title="Krijo Përdorues të Ri"
          fields={userFields}
          submitText="Krijo Përdorues"
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
};

export default CreateUserPage;
