import axios from "axios";
import { getToken } from "./authService";
import {
  cacheStoreProducts,
  getCachedStoreProducts,
  isOnline,
} from "../utils/cacheManager";
import { PodravkaProduct } from "../types/productInterface";

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

const createPodravkaProduct = async (data: PodravkaProduct) => {
  const token = getToken();
  const response = await axios.post(`${baseUrl}/api/products`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

const updatePodravkaProduct = async (
  productId: number,
  data: PodravkaProduct
) => {
  const token = getToken();
  const response = await axios.put(
    `${baseUrl}/api/products/${productId}`,
    data,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const deletePodravkaProduct = async (productId: number) => {
  const token = getToken();
  const response = await axios.delete(`${baseUrl}/api/products/${productId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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

export const getProductsByStoreId = async (storeId: number) => {
  const token = getToken();

  if (!isOnline() || localStorage.getItem(`store_${storeId}_products`)) {
    const cached = getCachedStoreProducts(storeId);
    if (cached) {
      return cached;
    }
    throw new Error("No cached data available for offline mode");
  }
  const response = await axios.get(
    `${baseUrl}/api/stores/${storeId}/products`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const products = response.data;

  cacheStoreProducts(storeId, products);

  return products;
};

export default {
  getCompetitorProducts,
  getProducts,
  getProductsByStoreId,
  createPodravkaProduct,
  updatePodravkaProduct,
  deletePodravkaProduct,
  createCompetitorProduct,
  updateCompetitorProduct,
  deleteCompetitorProduct,
};
