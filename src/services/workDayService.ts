import axios from "axios";
import { getToken } from "./authService";
import {
  LatestWorkDayKilometers,
  WorkDayListParams,
  WorkLogDay,
  WorkLogDayInput,
  WorkLogDayListItem,
} from "../types/workDayInterface";
import { DetailedWorkDayReportRow } from "../types/workDayReportInterface";

const baseUrl = import.meta.env.VITE_BASE_URL;

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const listWorkDays = async (
  params: WorkDayListParams = {}
): Promise<WorkLogDayListItem[]> => {
  const response = await axios.get(`${baseUrl}/api/work-days`, {
    ...authHeaders(),
    params,
  });
  return response.data;
};

const getLatestKilometers = async (params: {
  user_id?: number;
  up_to_date?: string;
} = {}): Promise<LatestWorkDayKilometers | null> => {
  const response = await axios.get(`${baseUrl}/api/work-days/latest-kilometers`, {
    ...authHeaders(),
    params,
  });
  return response.data;
};

const getDetailedWorkDayReport = async (
  pageSize: number,
  offset: number,
  filters: Record<string, string | number | boolean | string[] | number[] | boolean[]>
): Promise<{ data: DetailedWorkDayReportRow[]; total: number }> => {
  const response = await axios.get(`${baseUrl}/api/work-days/report/detailed`, {
    ...authHeaders(),
    params: {
      ...filters,
      limit: pageSize,
      offset,
    },
  });

  return response.data;
};

const getWorkDayById = async (workLogDayId: number | string): Promise<WorkLogDay> => {
  const response = await axios.get(
    `${baseUrl}/api/work-days/${workLogDayId}`,
    authHeaders()
  );
  return response.data;
};

const createWorkDay = async (payload: WorkLogDayInput): Promise<WorkLogDay> => {
  const response = await axios.post(
    `${baseUrl}/api/work-days`,
    payload,
    authHeaders()
  );
  return response.data;
};

const updateWorkDay = async (
  workLogDayId: number | string,
  payload: Partial<WorkLogDayInput>
): Promise<WorkLogDay> => {
  const response = await axios.put(
    `${baseUrl}/api/work-days/${workLogDayId}`,
    payload,
    authHeaders()
  );
  return response.data;
};

const deleteWorkDay = async (workLogDayId: number | string) => {
  const response = await axios.delete(
    `${baseUrl}/api/work-days/${workLogDayId}`,
    authHeaders()
  );
  return response.data;
};

export default {
  listWorkDays,
  getWorkDayById,
  createWorkDay,
  updateWorkDay,
  deleteWorkDay,
  getLatestKilometers,
  getDetailedWorkDayReport,
};
