import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import { userFields } from "./userFields";
import userService from "../../../services/userService";
import { AxiosError } from "axios";

const CreateUserPage = () => {
  const handleSubmit = async (
    data: Record<string, string | number | (string | number)[]>
  ) => {
    const { user, password, role } = data as {
      user: string;
      password: string;
      role: string;
    };

    try {
      const response = await userService.createUser({ user, password, role });
      const successMessage =
        response?.data?.message || "User eshte krijuar me sukses!";
      alert(successMessage);
    } catch (error) {
      console.error("Error creating user:", error);
      const axiosError = error as AxiosError<{ error: string }>;
      const backendMessage =
        axiosError.response?.data?.error || "Gabim gjatë krijimit të userit.";
      alert(backendMessage);
    }
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
