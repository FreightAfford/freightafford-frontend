import axios from "axios";

export const apiClient = axios.create({
  // baseURL: import.meta.env.VITE_API_URL + "/api/v1",
  baseURL: "http://localhost:9000" + "/api/v1",
  withCredentials: true,
});
