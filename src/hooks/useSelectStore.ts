import { useEffect, useState } from "react";
import { Store } from "../types/storeInterface";

export const useSelectedStore = () => {
  const [store, setStore] = useState<Store | null>(() => {
    const item = localStorage.getItem("selectedStore");
    return item ? JSON.parse(item) : null;
  });

  useEffect(() => {
    const handleStorageChange = () => {
      const item = localStorage.getItem("selectedStore");
      setStore(item ? JSON.parse(item) : null);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("selectedStoreChanged", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("selectedStoreChanged", handleStorageChange);
    };
  }, []);

  return store;
};
