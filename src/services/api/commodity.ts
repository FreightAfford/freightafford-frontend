import { AxiosError } from "axios";
import { apiClient } from "../configurations/apiConfig";

export interface Commodity {
  code: string;
  name: string;
  hsCodes: string[];
  cargoTypes: string[];
}

export const searchCommoditiesApi = async (
  q: string,
): Promise<{ data: Commodity[] }> => {
  try {
    const response = await apiClient.get("/commodities", { params: { q } });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
    throw error;
  }
};
