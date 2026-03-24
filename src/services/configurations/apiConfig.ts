import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:9000/api/v1",
  withCredentials: true,
});
