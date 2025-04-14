import axios from "axios";

const baseUrl = "http://localhost:3000/api";

const getToken = () => localStorage.getItem("authToken");

const getStoresByUserId = async (userId: number) => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/stores/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getStoreById = async (store_id: number) => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/stores/${store_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getAllStores = async () => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/stores`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default {
  getStoresByUserId,
  getStoreById,
  getAllStores,
};
