import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL + "/api/v1",
  // baseURL: "http://localhost:9000" + "/api/v1",
  withCredentials: true,
});

// Services rethrow the response body, which drops the HTTP status. Copy it
// onto the body so screens can tell a signed-out user from a failed request.
apiClient.interceptors.response.use(undefined, (error) => {
  const data = error instanceof AxiosError ? error.response?.data : undefined;
  if (data && typeof data === "object")
    data.statusCode ??= error.response.status;
  return Promise.reject(error);
});
