import axios from "axios";
import { getToken } from "./authService";

const baseUrl = import.meta.env.VITE_BASE_URL;

const getCompetitorProducts = async (params: {
  category?: string;
  competitor_id?: number;
}) => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/api/products/competitor`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
  return response.data;
};

const deleteCompetitorProduct = async (productId: number) => {
  const token = getToken();
  const response = await axios.delete(
    `${baseUrl}/api/products/competitor/${productId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const updateCompetitorProduct = async (
  productId: number,
  data: {
    name: string;
    category: string;
    weight?: number;
    competitor_id: number;
  }
) => {
  const token = getToken();
  const response = await axios.put(
    `${baseUrl}/api/products/competitor/${productId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const createCompetitorProduct = async (data: {
  name: string;
  category: string;
  weight?: number;
  competitor_id: number;
  created_by: number;
}) => {
  const token = getToken();
  const response = await axios.post(
    `${baseUrl}/api/products/competitor`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const getProducts = async () => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/api/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getProductsByStoreId = async (storeId: number) => {
  const token = getToken();
  const response = await axios.get(
    `${baseUrl}/api/stores/${storeId}/products`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export default {
  getCompetitorProducts,
  createCompetitorProduct,
  updateCompetitorProduct,
  deleteCompetitorProduct,
  getProducts,
  getProductsByStoreId,
};
