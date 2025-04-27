import axios from "axios";
import { PriceCheckInput } from "../types/priceCheckInterface";
const baseUrl = "http://localhost:5000";
const getToken = () => localStorage.getItem("authToken");

const batchCreatePriceCheck = async (priceDataArray: PriceCheckInput[]) => {
  const token = getToken();
  const response = await axios.post(
    `${baseUrl}/price-checker/batch`,
    priceDataArray,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export default {
  batchCreatePriceCheck,
};
