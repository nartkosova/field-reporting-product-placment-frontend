import axios from "axios";
import { getToken } from "./authService";
import { PaginatedPhotoResponse, PhotoSchema } from "../types/photoInterface";

const baseUrl = import.meta.env.VITE_BASE_URL;

const getReportPhotosByUserId = async (): Promise<PhotoSchema[]> => {
  const token = getToken();
  const res = await axios.get(`${baseUrl}/api/photos/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

export const getReportPhotosByPhotoId = async (
  photoId: string
): Promise<PhotoSchema> => {
  const token = getToken();

  const res = await axios.get(`${baseUrl}/api/photos/${photoId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

export const getAllReportPhotos = async (
  limit: number,
  offset: number,
  filters: Record<string, string[] | string>
): Promise<PaginatedPhotoResponse> => {
  const token = getToken();

  const params: Record<string, string | number> = { limit, offset };

  for (const [key, value] of Object.entries(filters)) {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        params[key] = value.join(","); // backend handles comma-separated
      }
    } else if (typeof value === "string" && value.trim() !== "") {
      params[key] = value;
    }
  }

  const res = await axios.get(`${baseUrl}/api/photos`, {
    params,
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
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

const updateReportPhoto = async (
  photoId: string,
  formData: FormData
): Promise<PhotoSchema> => {
  const token = getToken();
  const res = await axios.put(`${baseUrl}/api/photos/${photoId}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

const deleteReportPhoto = async (photoId: string) => {
  const token = getToken();
  const res = await axios.delete(`${baseUrl}/api/photos/${photoId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

const bulkDeletePhotos = async (photoUrls: string[]) => {
  const token = getToken();
  const res = await axios.delete(`${baseUrl}/api/photos/bulk-delete`, {
    data: { photoUrls },
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

export default {
  getReportPhotosByPhotoId,
  getReportPhotosByUserId,
  getAllReportPhotos,
  createPhoto,
  updateReportPhoto,
  deleteReportPhoto,
  bulkDeletePhotos,
};
