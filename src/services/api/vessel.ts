import { AxiosError } from "axios";
import { apiClient } from "../configurations/apiConfig";

export interface Vessel {
  name: string;
  imo?: string;
  callSign?: string;
  flag?: string;
  builtYear?: number;
  teu?: number;
}

export const searchVesselsApi = async (
  q: string,
): Promise<{ data: Vessel[] }> => {
  try {
    const response = await apiClient.get("/vessels", { params: { q } });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
    throw error;
  }
};
