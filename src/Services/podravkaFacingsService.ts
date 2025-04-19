import axios from "axios";

const baseUrl = "http://localhost:3000/api";

const getToken = () => localStorage.getItem("authToken");

const createPodravkaFacing = async (facingData: {
  user_id: number;
  store_id: number;
  category: string;
  product_id: number;
  facings_count: number;
  // report_date: string;
}) => {
  const token = getToken();
  const response = await axios.post(
    `${baseUrl}/facings/podravka-facing`,
    facingData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
const createCompetitorBrand = async (competitorBrandData: {
  brand_name: string;
}) => {
  const token = getToken();
  const response = await axios.post(
    `${baseUrl}/products/competitor-brand`,
    competitorBrandData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const createCompetitorFacing = async (competitorFacingData: {
  user_id: number;
  store_id: number;
  competitor_id: number;
  category: string;
  facings_count: number;
  // report_date: string;
}) => {
  const token = getToken();
  const response = await axios.post(
    `${baseUrl}/facings/competitor-facing`,
    competitorFacingData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const createCategoryFacing = async (categoryData: {
  user_id: number;
  store_id: number;
  category: string;
  total_facings: number;
  competitor_total_facings: number;
  report_date: string;
}) => {
  const token = getToken();
  const response = await axios.post(
    `${baseUrl}/facings/category-facing`,
    categoryData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
const getPodravkaFacings = async () => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/facings/podravka-facing`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getProductsByStoreId = async (storeId: number) => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/stores/${storeId}/products`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getCompetitorBrandByName = async (brandName: string) => {
  const token = getToken();
  const response = await axios.get(
    `${baseUrl}/products/competitor-brand/${brandName}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const getAllCompetitorBrands = async () => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/products/competitor-brand`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
const getPodravkaFacingsWithCompetitors = async (params = {}) => {
  const token = getToken();
  const searchParams = new URLSearchParams(params).toString();
  const response = await axios.get(
    `${baseUrl}/facings/with-competitors?${searchParams}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export default {
  createPodravkaFacing,
  createCategoryFacing,
  createCompetitorFacing,
  createCompetitorBrand,
  getPodravkaFacings,
  getProductsByStoreId,
  getCompetitorBrandByName,
  getAllCompetitorBrands,
  getPodravkaFacingsWithCompetitors,
};
