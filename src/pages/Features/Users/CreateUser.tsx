import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import { userFields } from "./userFields";
import userService from "../../../services/userService";

const CreateUser = () => {
  const handleSubmit = async (data: Record<string, string | number>) => {
    const { user, password } = data as { user: string; password: string };

    try {
      const response = await userService.createUser({ user, password });
      const successMessage =
        response?.data?.message || "User eshte krijuar me sukses!";
      alert(successMessage);
    } catch (error) {
      console.error("Error creating user:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Gabim gjatë krijimit të përdoruesit"
      );
    }
  };

  return (
    <CreateUpdateForm
      title="Create User"
      fields={userFields}
      submitText="Create"
      onSubmit={handleSubmit}
    />
  );
};

export default CreateUser;
