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

const getPodravkaFacingsWithCompetitors = async (
  filters: Record<string, string | string[]> = {},
  limit = 50,
  offset = 0
) => {
  const token = getToken();

  const allParams = {
    ...filters,
    limit,
    offset,
  };

  const response = await axios.get(`${baseUrl}/api/facings/with-competitors`, {
    params: allParams,
    headers: { Authorization: `Bearer ${token}` },
  });

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

const getUserPPLBatches = async (offset = 0, limit = 20) => {
  const token = getToken();
  const response = await axios.get(
    `${baseUrl}/api/facings/podravka-facing/user-batches`,
    {
      params: { offset, limit },
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const getPodravkaFacingsReport = async (
  filters: Record<string, string | string[]> = {},
  limit = 50,
  offset = 0
) => {
  const token = getToken();

  const { user_ids, store_ids, ...rest } = filters;

  const allParams = {
    ...rest,
    ...(user_ids ? { user_id: user_ids } : {}),
    ...(store_ids ? { store_id: store_ids } : {}),
    limit,
    offset,
  };

  const response = await axios.get(
    `${baseUrl}/api/facings/podravka-facing/report`,
    {
      params: allParams,
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

const updatePodravkaBatch = async ({
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

export default {
  getPodravkaFacings,
  getPodravkaFacingsWithCompetitors,
  getPodravkaFacingsByBatchId,
  getUserPPLBatches,
  getPodravkaFacingsReport,
  batchCreatePodravkaFacings,
  updatePodravkaBatch,
  deletePodravkaFacingBatch,
};
