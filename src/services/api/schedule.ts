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

// A port on a route; `at` keeps the port's own UTC offset
export interface RouteStop {
  code: string;
  name: string;
  terminal?: string;
  at: string;
}

export interface RouteLeg {
  // VESSEL, BARGE, RAIL, TRUCK, …
  mode: string;
  vessel: {
    name: string;
    imo?: string;
    // ISO country code of the flag, e.g. "LR"
    flag?: string;
    callSign?: string;
    builtYear?: number;
  } | null;
  service?: string;
  voyage?: string;
  from: RouteStop;
  to: RouteStop;
}

export interface RouteOption {
  // Maersk's routingReference, which booking will need later
  id: string;
  departs: RouteStop;
  arrives: RouteStop;
  transitDays: number;
  legs: RouteLeg[];
  cutOffs: { code: string; at: string }[];
}

export interface RouteSearchResult {
  origin: string;
  destination: string;
  routes: RouteOption[];
  fetchedAt: string;
}

export interface ActiveVessel {
  imo: string;
  name: string;
  // ISO country code of the flag, e.g. "DK"
  flag?: string;
  callSign?: string;
  // Maersk's own vessel code
  code: string;
}

// One port on a vessel's rotation
export interface VesselCall {
  id: string;
  port: { code: string; name: string; country: string };
  terminal?: string;
  service: { name: string; code: string };
  voyageIn: string;
  voyageOut?: string;
  arrival: ScheduleTime;
  departure: ScheduleTime;
  cutOffs: { code: string; at: string }[];
}

export interface VesselScheduleResult {
  vessel: {
    name: string;
    imo: string;
    flag?: string;
    callSign?: string;
    builtYear?: number;
  };
  services: { name: string; code: string }[];
  // In rotation order
  calls: VesselCall[];
  fetchedAt: string;
}

export const SCHEDULE_DAYS = [3, 7, 10, 14];
// A vessel schedule shows this many weeks from the chosen date
export const VESSEL_SCHEDULE_WEEKS = 12;
// Maersk's own default (the container types are in data/containers.ts)
export const DEFAULT_CONTAINER = "45G1";

// Search by departure date, or by the date the cargo must arrive by
export type RouteDateMode = "departing" | "arriving";

// Every search covers four weeks from (or up to) the chosen date
export const ROUTE_WINDOW_DAYS = 28;

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

// Maersk routes for four weeks from (departing) or up to (arriving by) the
// date, for one container type
export const getRoutesApi = async (
  origin: string,
  destination: string,
  mode: RouteDateMode,
  date: string,
  container: string,
): Promise<RouteSearchResult> => {
  try {
    const response = await apiClient.get("/schedules/routes", {
      params: { origin, destination, by: mode, date, container },
    });
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

// Every vessel Maersk runs; changes rarely
export const getActiveVesselsApi = async (): Promise<ActiveVessel[]> => {
  try {
    const response = await apiClient.get("/schedules/active-vessels");
    return response.data.data;
  } catch (error) {
    return rethrow(error);
  }
};

// One vessel's port calls for 12 weeks from the date
export const getVesselScheduleApi = async (
  imo: string,
  from: string,
): Promise<VesselScheduleResult> => {
  try {
    const response = await apiClient.get("/schedules/vessels", {
      params: { imo, from },
    });
    return response.data.data;
  } catch (error) {
    return rethrow(error);
  }
};
