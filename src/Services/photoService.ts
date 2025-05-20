import axios from "axios";
import { getToken } from "./authService";
import { PhotoSchema } from "../types/photoInterface";
const baseUrl = import.meta.env.VITE_BASE_URL;

const getPhotos = async (params: { category?: string; store_id?: number }) => {
  const token = getToken();
  const response = await axios.get(`${baseUrl}/api/photos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  });
  return response.data;
};

const createPhoto = async (formData: FormData) => {
  const token = getToken();
  const response = await axios.post(
    `${baseUrl}/api/photos/upload-photo`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const getAllReportPhotos = async (): Promise<PhotoSchema[]> => {
  const token = getToken();
  const res = await axios.get(`${baseUrl}/api/photos/report-photos`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

const bulkDeletePhotos = async (photoUrls: string[]) => {
  const token = getToken();
  const res = await axios.post(
    `${baseUrl}/api/photos/bulk-delete`,
    { photoUrls },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
  return res.data;
};

export default {
  getPhotos,
  createPhoto,
  getAllReportPhotos,
  bulkDeletePhotos,
};
