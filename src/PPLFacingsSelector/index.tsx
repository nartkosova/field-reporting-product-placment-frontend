import React, { useEffect, useState } from "react";
import { NavLink, useParams } from "react-router-dom";
import { Store } from "../types/storeInterface";
import podravkaFacingsService from "../Services/podravkaFacingsService";

const FacingsSelector: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const storeId = id ? parseInt(id) : NaN;
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const data = await podravkaFacingsService.getStoreById(storeId);
        setStore(data);
      } catch (error) {
        console.error("Error fetching store:", error);
      }
    };

    if (!isNaN(storeId)) fetchStore();
  }, [storeId]);

  return (
    <div className="flex flex-col justify-center align-middle p-6 max-w-xl space-y-4 mx-auto">
      <p className="text-2xl font-semibold">
        Jeni ne shitoren {store?.store_name}, zgjidhni njeren nga opsionet.
      </p>
      <NavLink to={`/ppl/store/${store?.store_id}/ppl-podravka`}>
        <button className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 max-w-lg w-full">
          PPL Podravka
        </button>
      </NavLink>
      <NavLink to={`/ppl/store/${store?.store_id}/ppl-konkurrenca`}>
        <button className=" bg-blue-600 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-700 max-w-lg w-full">
          PPL Konkurrenca
        </button>
      </NavLink>
    </div>
  );
};

export default FacingsSelector;
