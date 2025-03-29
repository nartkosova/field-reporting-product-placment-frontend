import axios from "axios";

const baseUrl = "http://localhost:3000/api/facings/podravka-facing";

const getStoresByUserId = async (userId: number) => {
  const token = localStorage.getItem("authToken");
  const response = await axios.get(
    `http://localhost:3000/api/stores/user/${userId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const getStoreById = async (store_id: number) => {
  const token = localStorage.getItem("authToken");
  const response = await axios.get(
    `http://localhost:3000/api/stores/${store_id}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const createPodravkaFacing = async (facingData: {
  user_id: number;
  store_id: number;
  product_id: number;
  facings_count: number;
  report_date: string;
}) => {
  const token = localStorage.getItem("authToken");
  const response = await axios.post(baseUrl, facingData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getProductsByStoreId = async (storeId: number) => {
  const token = localStorage.getItem("authToken");
  const response = await axios.get(
    `http://localhost:3000/api/stores/${storeId}/products`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export default {
  createPodravkaFacing,
  getStoresByUserId,
  getStoreById,
  getProductsByStoreId,
};
