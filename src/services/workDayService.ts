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
import {
  DayAttendance,
  DayOverview,
} from "../types/attendanceInterface";

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

const getAttendance = async (workLogDayId: number): Promise<DayAttendance> => {
  const response = await axios.get(
    `${baseUrl}/api/work-days/${workLogDayId}/attendance`,
    authHeaders()
  );
  return response.data;
};

const checkIn = async (workLogDayId: number): Promise<DayAttendance> => {
  const response = await axios.post(
    `${baseUrl}/api/work-days/${workLogDayId}/check-in`,
    {},
    authHeaders()
  );
  return response.data;
};

const checkOut = async (workLogDayId: number): Promise<DayAttendance> => {
  const response = await axios.post(
    `${baseUrl}/api/work-days/${workLogDayId}/check-out`,
    {},
    authHeaders()
  );
  return response.data;
};

const reopenDay = async (workLogDayId: number): Promise<DayAttendance> => {
  const response = await axios.post(
    `${baseUrl}/api/work-days/${workLogDayId}/reopen`,
    {},
    authHeaders()
  );
  return response.data;
};

const startStoreVisit = async (
  workLogDayId: number,
  storeId: number
): Promise<DayAttendance> => {
  const response = await axios.post(
    `${baseUrl}/api/work-days/${workLogDayId}/visits`,
    { store_id: storeId },
    authHeaders()
  );
  return response.data;
};

const endStoreVisit = async (
  workLogDayId: number,
  storeVisitId: number
): Promise<DayAttendance> => {
  const response = await axios.post(
    `${baseUrl}/api/work-days/${workLogDayId}/visits/${storeVisitId}/check-out`,
    {},
    authHeaders()
  );
  return response.data;
};

const uploadStoreVisitPhoto = async (
  workLogDayId: number,
  storeVisitId: number,
  photo: File
): Promise<DayAttendance> => {
  const formData = new FormData();
  // customName must precede the file: multer reads fields in order and the
  // Cloudinary storage uses it as a unique public id.
  formData.append("customName", `visit-${storeVisitId}-${Date.now()}`);
  formData.append("photo", photo);
  const response = await axios.post(
    `${baseUrl}/api/work-days/${workLogDayId}/visits/${storeVisitId}/photos`,
    formData,
    authHeaders()
  );
  return response.data;
};

const getDayOverview = async (date: string): Promise<DayOverview> => {
  const response = await axios.get(`${baseUrl}/api/work-days/report/overview`, {
    ...authHeaders(),
    params: { date },
  });
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
  getAttendance,
  checkIn,
  checkOut,
  reopenDay,
  startStoreVisit,
  endStoreVisit,
  uploadStoreVisitPhoto,
  getDayOverview,
};
