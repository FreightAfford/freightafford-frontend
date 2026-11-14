import { AxiosError } from "axios";
import type {
  ChargeBasis,
  ChargeStage,
  PayTerm,
  RateContainerSize,
  RateStructure,
} from "../../data/rates";
import { apiClient } from "../configurations/apiConfig";
import * as mock from "./rateMock";

// Contract rates: FreightAfford's own Maersk contract rates, kept by admin
// (Maersk has no rates API). Customers look a lane up; when nothing is
// priced they can ask for a rate.
//
// The backend endpoints don't exist yet. Until they do, development builds
// answer from an in-memory mock (rateMock.ts) with made-up sample prices,
// and the pages say so. Production calls the real endpoints below.
export const RATES_MOCK = import.meta.env.DEV;

export interface RatePort {
  code: string; // UN/LOCODE, e.g. CNSHA
  city: string;
  country: string;
}

// One line of a rate, as a row of Maersk's quote export.
export interface RateCharge {
  code: string; // Maersk charge code: BAS, EBS, DHC… or a custom one
  name: string;
  amount: number; // may be 0: Maersk lists zero-rated charges too
  currency: string; // ISO 4217
  basis: ChargeBasis; // per container, or per document (B/L)
  stage: ChargeStage; // freight, origin or destination
  payTerm: PayTerm; // prepaid, collect, or either
  structure: RateStructure; // fixed, or floating (can change)
}

// One step of the charge after free time runs out, e.g. days 15–17 at
// USD 120 a day. `toDay` is empty for the last, open-ended step.
export interface FreeTimeTier {
  fromDay: number;
  toDay?: number;
  amount: number;
  currency: string;
}

// Detention and demurrage free time at the destination, from Maersk's
// "D&D Freetime Details" sheet, for this rate's container size.
export interface FreeTime {
  type: string; // e.g. "Combined", "Detention", "Demurrage", "Storage"
  days: number;
  dayType: string; // e.g. "Calendar days"
  startEvent: string; // e.g. "Discharge"
  endEvent: string; // e.g. "Gate-in empty"
  tiers: FreeTimeTier[];
  note?: string; // e.g. "Storage invoiced separately by the terminal"
}

export interface Rate {
  _id: string;
  origin: RatePort;
  destination: RatePort;
  containerSize: RateContainerSize;
  validFrom: string; // YYYY-MM-DD, inclusive (Maersk's Effective Date)
  validTo: string; // YYYY-MM-DD, inclusive (Maersk's Expiry Date)
  commodity: string; // as Maersk names it, e.g. "Iron ore and other metal ores"
  serviceMode?: string; // e.g. "CY/CY"
  transitHours?: number; // Maersk gives "64d 14h"
  remarks?: string;
  charges: RateCharge[];
  freeTime?: FreeTime[];
  updatedAt: string;
  updatedBy?: string;
}

// What admin sends to create or edit a rate.
export type RateInput = Omit<Rate, "_id" | "updatedAt" | "updatedBy">;

export type RateRequestStatus = "open" | "resolved";

// What the customer ships, from the Maersk commodity search.
export interface RateCommodity {
  code: string; // Maersk commodity code, 6 digits
  name: string;
}

export interface RateRequest {
  _id: string;
  origin: RatePort;
  destination: RatePort;
  commodity: RateCommodity;
  containerSize?: RateContainerSize; // none = any size
  note?: string;
  customer: { name: string; company?: string; email: string };
  status: RateRequestStatus;
  createdAt: string;
  resolvedAt?: string;
}

export type RateRequestInput = {
  origin: RatePort;
  destination: RatePort;
  commodity: RateCommodity;
  containerSize?: RateContainerSize;
  note?: string;
};

// One commodity on one lane: its rates valid today, one per container
// size, so the customer can compare commodities before opening one.
export interface RateGroup {
  key: string; // origin|destination|commodity
  origin: RatePort;
  destination: RatePort;
  commodity: string;
  rates: Rate[]; // in size order
  // The lowest basic ocean freight across its sizes, for "from USD …".
  fromBasic: { amount: number; currency: string } | null;
  validTo: string; // the soonest any of its rates ends
}

// A customer's search: a destination, and optionally where from and a
// commodity filter. Results come back by commodity, a page at a time.
export interface RateSearchParams {
  origin?: string;
  destination: string;
  q?: string; // filters commodity names
  page?: number;
  limit?: number;
}

export interface RateSearchResult {
  groups: RateGroup[];
  total: number; // matching the filter
  totalAll: number; // every commodity priced into this search
  // The caller's open request for the lane (only when a From is given),
  // so "Requested on…" survives a reload.
  request: RateRequest | null;
}

// A lane with at least one rate valid today, for the quick picks.
export interface RateLane {
  origin: RatePort;
  destination: RatePort;
  sizes: RateContainerSize[];
  commodities: number;
}

export interface Paged<T> {
  data: T[];
  total: number; // matching the search and filters
  totalAll: number; // everything
}

export type ListParams = Record<string, string | number | undefined>;

// Bulk import: the file is read and checked first, then confirmed.
export interface ImportProblem {
  row: number; // spreadsheet row, header is row 1
  message: string;
}

export interface ImportPreviewRate {
  rate: RateInput;
  rows: number[]; // the charge rows that make up this rate
  replaces: string | null; // _id of the rate it overwrites
}

export interface ImportPreview {
  fileName: string;
  rowCount: number;
  rates: ImportPreviewRate[];
  problems: ImportProblem[];
}

// Services rethrow the response body, like the rest of the app.
const rethrow = (error: unknown): never => {
  if (error instanceof AxiosError) throw error.response?.data;
  if (error instanceof Error) throw error.message;
  throw error;
};

// ---- Customer ------------------------------------------------------------

export const searchRatesApi = async (
  params: RateSearchParams,
): Promise<RateSearchResult> => {
  if (RATES_MOCK) return mock.searchRates(params);
  try {
    const res = await apiClient.get("/rates/search", { params });
    return res.data.data;
  } catch (error) {
    return rethrow(error);
  }
};

export const getRateLanesApi = async (): Promise<RateLane[]> => {
  if (RATES_MOCK) return mock.getLanes();
  try {
    const res = await apiClient.get("/rates/lanes");
    return res.data.data;
  } catch (error) {
    return rethrow(error);
  }
};

export const requestRateApi = async (
  input: RateRequestInput,
): Promise<{ message: string; data: RateRequest }> => {
  if (RATES_MOCK) return mock.requestRate(input);
  try {
    const res = await apiClient.post("/rates/requests", input);
    return res.data;
  } catch (error) {
    return rethrow(error);
  }
};

// ---- Admin: rates --------------------------------------------------------

export const getRatesApi = async (params: ListParams): Promise<Paged<Rate>> => {
  if (RATES_MOCK) return mock.listRates(params);
  try {
    const res = await apiClient.get("/rates", { params });
    return res.data;
  } catch (error) {
    return rethrow(error);
  }
};

export const createRateApi = async (
  input: RateInput,
): Promise<{ message: string; data: Rate }> => {
  if (RATES_MOCK) return mock.createRate(input);
  try {
    const res = await apiClient.post("/rates", input);
    return res.data;
  } catch (error) {
    return rethrow(error);
  }
};

export const updateRateApi = async (
  id: string,
  input: RateInput,
): Promise<{ message: string; data: Rate }> => {
  if (RATES_MOCK) return mock.updateRate(id, input);
  try {
    const res = await apiClient.patch(`/rates/${id}`, input);
    return res.data;
  } catch (error) {
    return rethrow(error);
  }
};

export const expireRateApi = async (
  id: string,
): Promise<{ message: string; data: Rate }> => {
  if (RATES_MOCK) return mock.expireRate(id);
  try {
    const res = await apiClient.post(`/rates/${id}/expire`);
    return res.data;
  } catch (error) {
    return rethrow(error);
  }
};

export const deleteRateApi = async (
  id: string,
): Promise<{ message: string }> => {
  if (RATES_MOCK) return mock.deleteRate(id);
  try {
    const res = await apiClient.delete(`/rates/${id}`);
    return res.data;
  } catch (error) {
    return rethrow(error);
  }
};

// ---- Admin: rate requests ------------------------------------------------

export const getRateRequestsApi = async (
  params: ListParams,
): Promise<Paged<RateRequest> & { open: number }> => {
  if (RATES_MOCK) return mock.listRequests(params);
  try {
    const res = await apiClient.get("/rates/requests", { params });
    return res.data;
  } catch (error) {
    return rethrow(error);
  }
};

export const resolveRateRequestApi = async (
  id: string,
): Promise<{ message: string; data: RateRequest }> => {
  if (RATES_MOCK) return mock.resolveRequest(id);
  try {
    const res = await apiClient.patch(`/rates/requests/${id}/resolve`);
    return res.data;
  } catch (error) {
    return rethrow(error);
  }
};

// ---- Admin: bulk import --------------------------------------------------

// The backend serves an .xlsx template; the mock gives a CSV one.
export const downloadRateTemplateApi = async (): Promise<{
  blob: Blob;
  fileName: string;
}> => {
  if (RATES_MOCK) return mock.template();
  try {
    const res = await apiClient.get("/rates/import/template", {
      responseType: "blob",
    });
    return { blob: res.data, fileName: "freightafford-rates-template.xlsx" };
  } catch (error) {
    return rethrow(error);
  }
};

export const previewRateImportApi = async (
  file: File,
): Promise<ImportPreview> => {
  if (RATES_MOCK) return mock.previewImport(file);
  try {
    const body = new FormData();
    body.append("file", file);
    const res = await apiClient.post("/rates/import/preview", body);
    return res.data.data;
  } catch (error) {
    return rethrow(error);
  }
};

export const commitRateImportApi = async (
  rates: ImportPreviewRate[],
): Promise<{ message: string; created: number; replaced: number }> => {
  if (RATES_MOCK) return mock.commitImport(rates);
  try {
    const res = await apiClient.post("/rates/import", { rates });
    return res.data;
  } catch (error) {
    return rethrow(error);
  }
};
