import { AxiosError } from "axios";
import { apiClient } from "../configurations/apiConfig";

export const getAdminOverviewApi = async () => {
  try {
    const response = await apiClient.get("/pipeline/admin");
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getCustomerOverviewApi = async () => {
  try {
    const response = await apiClient.get("/pipeline/customer");
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};
