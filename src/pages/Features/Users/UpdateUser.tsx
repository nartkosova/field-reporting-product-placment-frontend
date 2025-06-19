import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import userService from "../../../services/userService";
import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import { AxiosError } from "axios";
import { updateUserFields } from "./userFields";
const UpdateUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
      alert("Përdoruesi u përditësua me sukses.");
      navigate(`/settings/edit/users`);
    } catch (err) {
      console.error("Error updating user", err);
      const axiosError = err as AxiosError<{ error: string }>;
      const backendMessage =
        axiosError.response?.data?.error || "Gabim gjatë përditësimit.";
      alert(backendMessage);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      {loading ? (
        <p>Duke u ngarkuar...</p>
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
  );
};

export default UpdateUser;
