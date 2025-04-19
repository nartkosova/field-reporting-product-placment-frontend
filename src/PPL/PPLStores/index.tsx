import { useEffect, useState } from "react";
import storeServices from "../../Services/storeServices";
import { NavLink } from "react-router-dom";
import { Store } from "../../types/storeInterface";
const StoreList = () => {
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

  return (
    <div className="flex flex-col p-6 max-w-xl space-y-4 mx-auto">
      <h2 className="text-2xl font-semibold">
        Marketet per perdoruesin: {user}
      </h2>
      <ul className="space-y-2">
        {stores.map((store: Store) => (
          <NavLink to={`/store/${store.store_id}`}>
            <li
              key={store.store_id}
              className="bg-blue-600 text-white cursor-pointer font-medium px-4 mb-2 py-2 rounded hover:bg-blue-800"
            >
              Shiko detajet <strong>{store.store_name}</strong> (
              {store.store_code})(
              {store.store_category})<p>{store.location}</p>
            </li>
          </NavLink>
        ))}
      </ul>
    </div>
  );
};

export default StoreList;
