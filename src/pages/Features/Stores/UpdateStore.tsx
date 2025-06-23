import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import storeServices from "../../../services/storeServices";
import { StoreInput } from "../../../types/storeInterface";
import { userFields } from "./StoreFields";
import userService from "../../../services/userService";
import { UserInput } from "../../../types/userInterface";

const UpdateStore = () => {
  const { id } = useParams<{ id: string }>();
  const [initialValues, setInitialValues] = useState<StoreInput | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);
  const [userOptions, setUserOptions] = useState<
    { label: string; value: number }[]
  >([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await userService.getAllUsers();
        const formatted = users.map((u: UserInput) => ({
          label: `${u.user}`,
          value: u.user_id,
        }));
        setUserOptions(formatted);
      } catch (err) {
        console.error("Gabim gjate ngarkimit te perdoruesve:", err);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchStore = async () => {
      if (!id) return;
      try {
        const store = await storeServices.getStoreById(Number(id));
        setInitialValues({
          store_name: store.store_name,
          location: store.location,
          store_category: store.store_category,
          store_code: store.store_code,
          store_channel: store.store_channel,
          user_id: store.user_id,
          sales_rep: store.sales_rep,
        });
      } catch (err) {
        console.error("Error fetching store:", err);
        alert("Nuk mund të ngarkohet dyqani.");
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [id]);

  const handleUpdate = async (
    data: Record<string, string | number | (string | number)[]>
  ) => {
    if (!id) return;

    const payload: StoreInput = {
      store_name: data.store_name as string,
      location: data.location as string,
      store_category: data.store_category as string,
      store_code: data.store_code as number,
      store_channel: data.store_channel as string,
      user_id: data.user_id as number,
      sales_rep: data.sales_rep as string,
    };

    await storeServices.updateStore(Number(id), payload);
  };

  if (loading)
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-black p-0 sm:p-0">
        <p className="text-center text-white mt-10">Duke u ngarkuar...</p>
      </div>
    );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black p-0 sm:p-0">
      <div className="max-w-xl w-full">
        <CreateUpdateForm
          title="Përditëso Dyqanin"
          fields={userFields({ userOptions })}
          onSubmit={handleUpdate}
          initialValues={initialValues ? { ...initialValues } : undefined}
          submitText="Përditëso"
        />
      </div>
    </div>
  );
};

export default UpdateStore;
