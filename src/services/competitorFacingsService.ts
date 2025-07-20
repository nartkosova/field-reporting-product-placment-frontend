import axios from "axios";
import { getToken } from "./authService";
import { CompetitorFacingInput } from "../types/podravkaFacingInterface";

const baseUrl = import.meta.env.VITE_BASE_URL;

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

const getCompetitorFacingByBatchId = async (bachtId: string) => {
  const token = getToken();
  const response = await axios.get(
    `${baseUrl}/api/facings/competitor-facing/${bachtId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const getCompetitorFacingByUserId = async (offset = 0, limit = 20) => {
  const token = getToken();
  const response = await axios.get(
    `${baseUrl}/api/facings/competitor-facing/user`,
    {
      headers: { Authorization: `Bearer ${token}` },
      params: { offset, limit },
    }
  );
  return response.data;
};

const updateCompetitorFacingBatch = async ({
  batchId,
  facings,
}: {
  batchId: string;
  facings: Pick<
    CompetitorFacingInput,
    "user_id" | "store_id" | "competitor_id" | "category" | "facings_count"
  >[];
}) => {
  const token = getToken();
  const response = await axios.put(
    `${baseUrl}/api/facings/competitor-facing/batch`,
    { batchId, facings },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

const deleteCompetitorFacingBatch = async (batchId: string) => {
  const token = getToken();
  const response = await axios.delete(
    `${baseUrl}/api/facings/competitor-facing/batch/${batchId}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.data;
};

export default {
  batchCreateCompetitorFacings,
  getCompetitorFacingByBatchId,
  getCompetitorFacingByUserId,
  updateCompetitorFacingBatch,
  deleteCompetitorFacingBatch,
};
