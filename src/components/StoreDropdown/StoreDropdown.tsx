/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";
import storeServices from "../../services/storeServices";
import { Store } from "../../types/storeInterface";
import productServices from "../../services/productServices";
import { clearApiCache } from "../../utils/cacheManager";
import { useSelectedStore } from "../../hooks/useSelectStore";

interface StoreOption {
  value: number;
  label: string;
  data: Store;
}

export const StoreDropdown = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const storeInfo = useSelectedStore();
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  useEffect(() => {
    setUserId(userInfo?.id ?? null);
  }, [userInfo]);

  useEffect(() => {
    const fetchStores = async () => {
      if (!userId) return;
      try {
        const userStores: Store[] = await storeServices.getStoresByUserId(
          userId
        );
        setStores(
          userStores.sort((a, b) => a.store_name.localeCompare(b.store_name))
        );
      } catch (error) {
        console.error("Failed to fetch stores:", error);
      }
    };
    fetchStores();
  }, [userId]);

  const storeOptions: StoreOption[] = stores.map((store) => ({
    value: store.store_id,
    label: `${store.store_name} (${store.store_code}) - ${store.store_category}`,
    data: store,
  }));

  const handleChange = async (selected: SingleValue<StoreOption>) => {
    if (!selected) {
      setSelectedStore(null);
      localStorage.removeItem("selectedStore");
      localStorage.removeItem(`store_${storeInfo?.store_id}_products`);
      window.dispatchEvent(new Event("selectedStoreChanged"));
      return;
    }

    const s = selected.data;
    setSelectedStore(s);
    localStorage.setItem("selectedStore", JSON.stringify(s));
    window.dispatchEvent(new Event("selectedStoreChanged"));

    try {
      const products = await productServices.getProductsByStoreId(s.store_id);
      console.log("Loaded products:", products);
    } catch (err) {
      console.error(err);
    }

    await clearApiCache();
  };

  return (
    <div>
      <h2 className="font-extrabold text-white mb-6 tracking-tight text-center drop-shadowtext-lg ">
        Zgjedh Marketin
      </h2>
      <Select<StoreOption>
        options={storeOptions}
        onChange={handleChange}
        placeholder="Zgjedh një market..."
        value={
          selectedStore
            ? {
                value: selectedStore.store_id,
                label: `${selectedStore.store_name} (${selectedStore.store_code}) - ${selectedStore.store_category}`,
                data: selectedStore,
              }
            : storeInfo?.store_id
            ? {
                value: storeInfo.store_id,
                label: `${storeInfo.store_name} (${storeInfo.store_code}) - ${storeInfo.store_category}`,
                data: storeInfo,
              }
            : null
        }
        isClearable
        styles={{
          control: (provided: any) => ({
            ...provided,
            backgroundColor: "#18181b",
            borderColor: "#27272a",
            color: "#fff",
          }),
          menu: (provided: any) => ({
            ...provided,
            backgroundColor: "#18181b",
            color: "#fff",
          }),
          option: (provided: any, state: any) => ({
            ...provided,
            backgroundColor: state.isSelected
              ? "#27272a"
              : state.isFocused
              ? "#27272a"
              : "#18181b",
            color: "#fff",
          }),
          singleValue: (provided: any) => ({
            ...provided,
            color: "#fff",
          }),
          multiValue: (provided: any) => ({
            ...provided,
            backgroundColor: "#27272a",
            color: "#fff",
          }),
          input: (provided: any) => ({
            ...provided,
            color: "#fff",
          }),
        }}
      />
    </div>
  );
};
