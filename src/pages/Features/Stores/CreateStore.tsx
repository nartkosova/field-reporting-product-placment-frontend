import { useEffect, useState } from "react";
import { CreateUpdateForm } from "../../../components/CreateBaseForm/CreateUpdateBaseForm";
import storeServices from "../../../services/storeServices";
import { StoreInput } from "../../../types/storeInterface";
import userService from "../../../services/userService";
import { UserInput } from "../../../types/userInterface";
import { userFields } from "./StoreFields";
const CreateStorePage = () => {
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

  const handleCreate = async (data: Record<string, string | number>) => {
    const payload: StoreInput = {
      store_name: data.store_name as string,
      location: data.location as string,
      store_category: data.store_category as string,
      store_channel: data.store_channel as string,
      sales_rep: data.sales_rep as string,
      user_id: data.user_id as number,
      store_code: data.store_code as number,
    };
    await storeServices.createStore(payload);
  };

  return (
    <CreateUpdateForm
      title="Krijo Dyqan të Ri"
      fields={userFields({ userOptions })}
      onSubmit={handleCreate}
      submitText="Krijo"
    />
  );
};

export default CreateStorePage;
