import axios from "axios";
import { getToken } from "./authService";
import { PhotoSchema } from "../types/photoInterface";

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

const getReportPhotosByPhotoId = async (
  photoId: string
): Promise<PhotoSchema> => {
  const token = getToken();
  const res = await axios.get(`${baseUrl}/api/photos/${photoId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return res.data;
};

const getAllReportPhotos = async (): Promise<PhotoSchema[]> => {
  const token = getToken();
  const res = await axios.get(`${baseUrl}/api/photos/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
