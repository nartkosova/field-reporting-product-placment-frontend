import { useEffect, useState } from "react";
import storeServices from "../../Services/storeServices";
import StoreList from "../../Components/StoreList/StoreList";
const StoreSelector = () => {
  const [stores, setStores] = useState([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const paredUserInfo = JSON.parse(userInfo);
      setUserId(paredUserInfo.id);
      setUser(paredUserInfo.user);
    }
  }, []);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        if (!userId) return;

        const userStores = await storeServices.getStoresByUserId(userId);
        setStores(userStores);
      } catch (error) {
        console.error("Failed to fetch stores:", error);
      }
    };

    fetchStores();
  }, [userId]);

  return <StoreList stores={stores} user={user} showLocation={true} />;
};

export default StoreSelector;
