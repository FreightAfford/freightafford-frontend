import { AxiosError } from "axios";
import { apiClient } from "../configurations/apiConfig";

// Maersk Commercial Schedules through our backend. Times are ISO strings
// that keep the port's own UTC offset.

export interface ScheduleTime {
  planned?: string;
  estimated?: string;
  actual?: string;
}

export interface PortCall {
  id: string;
  // null when Maersk hasn't assigned a vessel yet
  vessel: { name: string; imo?: string; flag?: string } | null;
  services: {
    name: string;
    code: string;
    voyageIn: string;
    voyageOut?: string;
  }[];
  arrival: ScheduleTime;
  departure: ScheduleTime;
  // DCO documents, FCO full container, VCO VGM, …
  cutOffs: { code: string; at: string }[];
}

export interface PortScheduleResult {
  port: { code: string; name: string; country: string; utcOffset: string };
  terminals: { name: string; smdgCode?: string; calls: PortCall[] }[];
  fetchedAt: string;
}

export interface ActivePort {
  code: string;
  name: string;
  countryCode: string;
  country: string;
}

export const SCHEDULE_DAYS = [3, 7, 10, 14];

// The port the page opens on
export const DEFAULT_PORT = "NGAPP";

const rethrow = (error: unknown): never => {
  if (error instanceof AxiosError) throw error.response?.data;
  if (error instanceof Error) throw error.message;
  throw error;
};

export const getActivePortsApi = async (): Promise<ActivePort[]> => {
  try {
    const response = await apiClient.get("/schedules/active-ports");
    return response.data.data;
  } catch (error) {
    return rethrow(error);
  }
};

export const getPortScheduleApi = async (
  port: string,
  from: string,
  days: number,
): Promise<PortScheduleResult> => {
  try {
    const response = await apiClient.get("/schedules/ports", {
      params: { port, from, days },
    });
    return response.data.data;
  } catch (error) {
    return rethrow(error);
  }
};
