import { AxiosError } from "axios";
import { apiClient } from "../configurations/apiConfig";

export interface PortLocation {
  code: string;
  city: string;
  country: string;
  countryCode: string;
  region?: string;
  maerskServed: boolean;
}

export const searchLocationsApi = async (
  q: string,
): Promise<{ data: PortLocation[] }> => {
  try {
    const response = await apiClient.get("/locations", { params: { q } });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
    throw error;
  }
};

export const formatPortLabel = (loc: PortLocation) =>
  `${loc.city}, ${loc.country}`;
