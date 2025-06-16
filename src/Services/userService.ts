import axios from "axios";
import { getToken } from "./authService";

const baseUrl = import.meta.env.VITE_BASE_URL;

const getAllUsers = async () => {
  const token = getToken();
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await axios.get(`${baseUrl}/api/users`, config);
  return response.data;
};

const getUserById = async (id: number) => {
  const token = getToken();
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await axios.get(`${baseUrl}/api/users/${id}`, config);
  return response.data;
};

const createUser = async (userData: {
  user: string;
  password: string;
  role: string;
}) => {
  const token = getToken();
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await axios.post(`${baseUrl}/api/users`, userData, config);
  return response.data;
};

const loginUser = async (credentials: { user: string; password: string }) => {
  const response = await axios.post(`${baseUrl}/api/users/login`, credentials);
  return response.data;
};

const deleteUser = async (id: number) => {
  const token = getToken();
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  await axios.delete(`${baseUrl}/api/users/${id}`, config);
};

const updateUser = async (
  id: number,
  data: { user: string; password: string; role: string }
) => {
  const token = getToken();
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  await axios.put(`${baseUrl}/api/users/${id}`, data, config);
};

export default {
  getAllUsers,
  getUserById,
  createUser,
  loginUser,
  deleteUser,
  updateUser,
};
