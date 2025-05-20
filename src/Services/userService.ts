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

const createUser = async (userData: { user: string; password: string }) => {
  const response = await axios.post(`${baseUrl}/api/users`, userData);
  return response.data;
};

const loginUser = async (credentials: { user: string; password: string }) => {
  const response = await axios.post(`${baseUrl}/api/users/login`, credentials);
  return response.data;
};

export default {
  getAllUsers,
  createUser,
  loginUser,
};
