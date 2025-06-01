import axios from "axios";
import { PodravkaFacingInput } from "../types/podravkaFacingInterface";
const baseUrl = import.meta.env.VITE_BASE_URL;
const getToken = () => localStorage.getItem("authToken");

const getPodravkaFacings = async () => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/api/facings/podravka-facing`, {
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

const getPodravkaFacingsWithCompetitors = async (params = {}) => {
  const token = getToken();
  const searchParams = new URLSearchParams(params).toString();
  const response = await axios.get(
    `${baseUrl}/api/facings/with-competitors?${searchParams}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};
const batchCreatePodravkaFacings = async (
  facingDataArray: PodravkaFacingInput[]
) => {
  const token = getToken();
  const response = await axios.post(
    `${baseUrl}/api/facings/podravka-facing/batch`,
    facingDataArray,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export const updatePodravkaBatch = async ({
  batchId,
  facings,
}: {
  batchId: string;
  facings: PodravkaFacingInput[];
}) => {
  const token = getToken();
  const response = await axios.put(
    `${baseUrl}/api/facings/podravka-facing/batch`,
    { batchId, facings },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const deletePodravkaFacingBatch = async (batchId: number | string) => {
  const token = getToken();
  const response = await axios.delete(
    `${baseUrl}/api/facings/podravka-facing/batch/${batchId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const getPodravkaFacingsByBatchId = async (batchId: string) => {
  const token = getToken();
  const response = await axios.get(
    `${baseUrl}/api/facings/podravka-facing/batch/${batchId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const getUserPPLBatches = async () => {
  const token = getToken();
  const response = await axios.get(
    `${baseUrl}/api/facings/podravka-facing/user-batches`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export default {
  getPodravkaFacings,
  getProductsByStoreId,
  getPodravkaFacingsWithCompetitors,
  batchCreatePodravkaFacings,
  updatePodravkaBatch,
  deletePodravkaFacingBatch,
  getPodravkaFacingsByBatchId,
  getUserPPLBatches,
};
