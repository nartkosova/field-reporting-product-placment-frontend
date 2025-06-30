import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import userService from "../../../services/userService";
import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import { AxiosError } from "axios";
import { updateUserFields } from "./userFields";

import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";

const UpdateUser = () => {
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<Record<string, string>>(
    {}
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await userService.getUserById(Number(id));
        setInitialValues({
          user: user.user,
          role: user.role,
          password: "", // password cannot be prefilled for security
        });
      } catch (err) {
        console.error("Failed to load user", err);
        const axiosError = err as AxiosError<{ error: string }>;
        const backendMessage =
          axiosError.response?.data?.error ||
          "Gabim gjatë ngarkimit të të dhënave.";
        alert(backendMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  const handleUpdate = async (
    data: Record<string, string | number | (string | number)[]>
  ) => {
    if (!id) return;
    try {
      await userService.updateUser(Number(id), {
        user: data.user as string,
        password: data.password as string,
        role: data.role as string,
      });
    } catch (err) {
      console.error("Error updating user", err);
      const axiosError = err as AxiosError<{ error: string }>;
      const backendMessage =
        axiosError.response?.data?.error || "Gabim gjatë përditësimit.";
      throw new Error(backendMessage);
    }
  };

  return (
    <div className="w-full flex items-center justify-center bg-black p-0 sm:p-0">
      <div className="max-w-2xl w-full">
        {loading ? (
          <LoadingSpinner className="mt-10" />
        ) : (
          <CreateUpdateForm
            title="Përditëso Përdoruesin"
            fields={updateUserFields}
            initialValues={initialValues}
            onSubmit={handleUpdate}
            submitText="Vazhdo"
          />
        )}
      </div>
    </div>
  );
};

export default UpdateUser;
