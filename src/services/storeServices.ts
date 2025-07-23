import axios from "axios";
import { StoreInput } from "../types/storeInterface";
import { getToken } from "./authService";
import { isOnline } from "../utils/cacheManager";
const baseUrl = import.meta.env.VITE_BASE_URL;

const getStoresByUserId = async (userId: number) => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/api/stores/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getStoreById = async (store_id: number) => {
  const token = getToken();

  if (!isOnline()) {
    const local = localStorage.getItem("selectedStore");
    const storeInfo = local ? JSON.parse(local) : null;
    if (storeInfo?.store_id === store_id) {
      console.log("Using cached storeInfo for offline mode");
      return storeInfo;
    }
    throw new Error("Offline and no cached data available for this store");
  }

  const response = await axios.get(`${baseUrl}/api/stores/${store_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

const getAllStores = async (channel?: string) => {
  const token = getToken();
  const url = new URL(`${baseUrl}/api/stores`);
  if (channel) url.searchParams.append("channel", channel);

  const response = await axios.get(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  return response.data;
};

const getStoresWithUserId = async () => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/api/stores/user`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const getOtherStoreProducts = async (storeId: number) => {
  const token = getToken();
  const localKey = `store_${storeId}_other_products`;

  if (!isOnline() || localStorage.getItem(localKey)) {
    try {
      const cached = localStorage.getItem(localKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (err) {
      console.warn("Corrupt or unreadable cache:", err);
    }

    throw new Error(
      "Nuk ka të dhëna të ruajtura për produktet shtesë, lidhuni me internetin."
    );
  }

  const response = await axios.get(
    `${baseUrl}/api/stores/${storeId}/other-products`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const products = response.data;
  localStorage.setItem(localKey, JSON.stringify(products));
  return products;
};

const createStore = async (storeData: StoreInput) => {
  const token = getToken();
  const response = await axios.post(`${baseUrl}/api/stores`, storeData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const updateStore = async (store_id: number, storeData: StoreInput) => {
  const token = getToken();
  const response = await axios.put(
    `${baseUrl}/api/stores/${store_id}`,
    storeData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const deleteStore = async (store_id: number) => {
  const token = getToken();
  const response = await axios.delete(`${baseUrl}/api/stores/${store_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default {
  getStoresByUserId,
  getStoreById,
  getAllStores,
  getStoresWithUserId,
  getOtherStoreProducts,
  createStore,
  updateStore,
  deleteStore,
};
