import axios from "axios";
import { PriceCheckInput } from "../types/priceCheckInterface";
const baseUrl = import.meta.env.VITE_BASE_URL;
const getToken = () => localStorage.getItem("authToken");

const batchCreatePriceCheck = async (priceDataArray: PriceCheckInput[]) => {
  const token = getToken();
  const response = await axios.post(
    `${baseUrl}/api/price-checks/batch`,
    priceDataArray,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const getPriceCheck = async (params: {
  store_id?: number;
  category?: string;
  product_type?: "podravka" | "competitor";
}): Promise<PriceCheckInput[]> => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/api/price-checks`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });

  return response.data;
};

export default {
  batchCreatePriceCheck,
};
