import storeServices from "../../services/storeServices";
import StoreList from "./StoreList";
import { useUser } from "../../hooks/useUser";
import { useEffect, useState } from "react";

const StoreSelector = () => {
  const [stores, setStores] = useState([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        if (!user?.user_id) return;
        const userStores = await storeServices.getStoresByUserId(user.user_id);
        setStores(userStores);
      } catch (error) {
        console.error("Failed to fetch stores:", error);
      }
    };
    fetchStores();
  }, [user?.user_id]);

  return <StoreList stores={stores} user={user?.user || null} showLocation={true} />;
};

export default StoreSelector;
