import axios from "axios";
import { getToken } from "./authService";
import {
  AnalyticsFilterParams,
  AnalyticsOverview,
  BreakdownRow,
  EmployeeBreakdownRow,
  StoreCoverage,
  TimeseriesPoint,
} from "../types/analyticsInterface";

const baseUrl = import.meta.env.VITE_BASE_URL;

const authHeaders = () => ({
  headers: { Authorization: `Bearer ${getToken()}` },
});

const get = async <T>(
  path: string,
  params: AnalyticsFilterParams
): Promise<T> => {
  const response = await axios.get(`${baseUrl}/api/analytics/${path}`, {
    ...authHeaders(),
    params,
  });
  return response.data;
};

const getOverview = (params: AnalyticsFilterParams = {}) =>
  get<AnalyticsOverview>("overview", params);

const getTimeseries = (params: AnalyticsFilterParams = {}) =>
  get<TimeseriesPoint[]>("timeseries", params);

const getByEmployee = (params: AnalyticsFilterParams = {}) =>
  get<EmployeeBreakdownRow[]>("by-employee", params);

const getPhotoCategories = (params: AnalyticsFilterParams = {}) =>
  get<BreakdownRow[]>("photo-categories", params);

const getPhotoTypes = (params: AnalyticsFilterParams = {}) =>
  get<BreakdownRow[]>("photo-types", params);

const getStoreCoverage = (params: AnalyticsFilterParams = {}) =>
  get<StoreCoverage>("store-coverage", params);

export default {
  getOverview,
  getTimeseries,
  getByEmployee,
  getPhotoCategories,
  getPhotoTypes,
  getStoreCoverage,
};
