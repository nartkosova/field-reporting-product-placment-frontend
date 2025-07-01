import axios from "axios";
import { getToken } from "./authService";

const baseUrl = import.meta.env.VITE_BASE_URL;

const getAllCompetitorBrands = async () => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/api/competitor-brands`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getCompetitorBrandById = async (competitorId: number) => {
  const token = getToken();
  const response = await axios.get(
    `${baseUrl}/api/competitor-brands/id/${competitorId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const getCompetitorByCategory = async (category: string) => {
  const token = getToken();
  const response = await axios.get(
    `${baseUrl}/api/competitor-brands/category/${category}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const getAllCompetitorsWithCategories = async () => {
  const token = getToken();
  const response = await axios.get(
    `${baseUrl}/api/competitor-brands/categories`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const createCompetitorBrand = async (competitorBrandData: {
  brand_name: string;
  categories?: string[];
}) => {
  const token = getToken();
  const response = await axios.post(
    `${baseUrl}/api/competitor-brands`,
    competitorBrandData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const updateCompetitorBrand = async (
  competitorId: number,
  competitorBrandData: { brand_name: string; categories?: string[] }
) => {
  const token = getToken();
  const response = await axios.put(
    `${baseUrl}/api/competitor-brands/${competitorId}`,
    competitorBrandData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const deleteCompetitorBrand = async (competitorId: number) => {
  const token = getToken();
  const response = await axios.delete(
    `${baseUrl}/api/competitor-brands/${competitorId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export default {
  createCompetitorBrand,
  updateCompetitorBrand,
  deleteCompetitorBrand,
  getAllCompetitorsWithCategories,
  getAllCompetitorBrands,
  getCompetitorByCategory,
  getCompetitorBrandById,
};
