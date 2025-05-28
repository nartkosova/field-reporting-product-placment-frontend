import axios from "axios";
import { getToken } from "./authService";
import { CompetitorFacingInput } from "../types/podravkaFacingInterface";

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
const batchCreateCompetitorFacings = async (
  facingDataArray: CompetitorFacingInput[]
) => {
  const token = getToken();
  const response = await axios.post(
    `${baseUrl}/api/facings/competitor-facing/batch`,
    facingDataArray,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const getCompetitorBrandByName = async (brandName: string) => {
  const token = getToken();
  const response = await axios.get(
    `${baseUrl}/api/products/competitor-brand/${brandName}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const getAllCompetitorBrands = async () => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/api/products/competitor-brand`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const getCompetitorBrandById = async (competitorId: number) => {
  const token = getToken();
  const response = await axios.get(
    `${baseUrl}/api/products/competitor-brand/${competitorId}`,
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
    `${baseUrl}/api/products/competitor-brand`,
    competitorBrandData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const updateCompetitorBrand = async (
  competitorId: number,
  competitorBrandData: { brand_name: string }
) => {
  const token = getToken();
  const response = await axios.put(
    `${baseUrl}/api/products/competitor-brand/${competitorId}`,
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
    `${baseUrl}/api/products/competitor-brand/${competitorId}`,
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
}) => {
  const token = getToken();
  const response = await axios.post(
    `${baseUrl}/api/facings/competitor-facing`,
    competitorFacingData,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
export default {
  getCompetitorProducts,
  createCompetitorProduct,
  createCompetitorFacing,
  createCompetitorBrand,
  updateCompetitorBrand,
  deleteCompetitorBrand,
  getCompetitorBrandByName,
  getAllCompetitorBrands,
  getCompetitorBrandById,
  batchCreateCompetitorFacings,
};
