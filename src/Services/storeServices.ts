import axios from "axios";

const baseUrl = import.meta.env.VITE_BASE_URL;

const getToken = () => localStorage.getItem("authToken");

const getStoresByUserId = async (userId: number) => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/api/stores/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getStoreById = async (store_id: number) => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/api/stores/${store_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getAllStores = async () => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/api/stores`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default {
  getStoresByUserId,
  getStoreById,
  getAllStores,
};
