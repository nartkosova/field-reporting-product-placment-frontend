import axios from "axios";

const baseUrl = "http://localhost:3000/api/facings/podravka-facing";

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

export default { createPodravkaFacing };
