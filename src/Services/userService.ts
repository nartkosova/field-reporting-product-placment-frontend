import axios from "axios";

const baseUrl = "http://127.0.0.1:3000/api/users";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let token = null;

const setToken = (newToken: string) => {
  token = `${newToken}`;
};
const getToken = () => localStorage.getItem("authToken");
const getAllUsers = async () => {
  const token = getToken();
  const config = {
    headers: { Authorization: `Bearer ${token}` },
  };
  const response = await axios.get(baseUrl, config);
  return response.data;
};

const createUser = async (userData: { user: string; password: string }) => {
  const response = await axios.post(baseUrl, userData);
  return response.data;
};

const loginUser = async (credentials: { user: string; password: string }) => {
  const response = await axios.post(`${baseUrl}/login`, credentials);
  return response.data;
};

export default {
  setToken,
  getAllUsers,
  createUser,
  loginUser,
};
