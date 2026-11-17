import { AxiosError } from "axios";
import type {
  ChargeBasis,
  ChargeStage,
  PayTerm,
  RateContainerSize,
  RateStructure,
} from "../../data/rates";
import { apiClient } from "../configurations/apiConfig";

// Contract rates: FreightAfford's own Maersk contract rates, kept by admin
// (Maersk has no rates API). Customers look a lane up; when nothing is
// priced they can ask for a rate.

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
  commodityCode?: string; // Maersk commodity code, when picked from its search
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

// One commodity on one lane: its rates in the chosen month, by container
// size and then date. A size can have two in a month (1–14 Dec, then 15–31
// Dec), each with its own dates.
export interface RateGroup {
  key: string; // origin|destination|commodity
  origin: RatePort;
  destination: RatePort;
  commodity: string;
  rates: Rate[]; // in size order, then by start date
  // The lowest basic ocean freight across its sizes, for "from USD …".
  fromBasic: { amount: number; currency: string } | null;
  validFrom: string; // the first day any of its rates starts
  validTo: string; // the last day any of its rates runs to
}

// A customer's search: a destination, and optionally where from, a month
// (this one by default) and a commodity filter. Results come back by
// commodity, a page at a time.
export interface RateSearchParams {
  origin?: string;
  destination: string;
  month?: string; // YYYY-MM, this month or later
  q?: string; // filters commodity names
  page?: number;
  limit?: number;
}

export interface RateSearchResult {
  groups: RateGroup[];
  total: number; // matching the filter
  totalAll: number; // every commodity priced into this search
  // This month, then each later month with rates for this lane (YYYY-MM)
  months: string[];
  // The caller's open request for the lane (only when a From is given),
  // so "Requested on…" survives a reload.
  request: RateRequest | null;
}

// A lane with at least one rate in the chosen month, for the quick picks.
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

// Bulk import. The browser reads the file (see utils/rateImport); the
// backend matches its ports and commodities, checks the rates against the
// ones already saved, then saves them in one go.

// A port or commodity as the file names it, to be matched.
export interface ImportPortRef {
  raw: string;
  code?: string;
  city?: string;
  country?: string;
}
export type ImportCommodityRef =
  | { kind: "maersk"; code: string } // e.g. MINE_IRO_ORE_OTH_MET
  | { kind: "text"; text: string }; // a commodity name from our template

// What a name matched, or the closest options when it matched nothing.
export interface ImportMatch<T> {
  match: T | null;
  suggestions: T[];
}

export interface ImportMatchResult {
  ports: Record<string, ImportMatch<RatePort>>; // by raw text
  commodities: Record<string, ImportMatch<RateCommodity>>; // by commodityRefKey
}

// Admin's choices for names that didn't match, remembered for next time.
export interface ImportMappings {
  ports: Record<string, RatePort>;
  commodities: Record<string, RateCommodity>;
}

// How one rate sits against the saved ones.
export interface ImportCheck {
  replaces: string | null; // same lane, size, commodity and start date
  overlaps: { _id: string; validFrom: string; validTo: string }[];
  problems: string[]; // what the rate form would refuse
}

export interface ImportResult {
  message: string;
  created: number;
  replaced: number;
  resolvedRequests: number;
}

// The key a commodity reference is matched and remembered under.
export const commodityRefKey = (ref: ImportCommodityRef) =>
  ref.kind === "maersk"
    ? `maersk:${ref.code.trim().toUpperCase()}`
    : `text:${ref.text.trim().toLowerCase().replace(/\s+/g, " ")}`;

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
  try {
    const res = await apiClient.get("/rates/search", { params });
    return res.data.data;
  } catch (error) {
    return rethrow(error);
  }
};

// Lanes with rates in a month, and the months that have any rates.
export const getRateLanesApi = async (
  month?: string,
): Promise<{ lanes: RateLane[]; months: string[] }> => {
  try {
    const res = await apiClient.get("/rates/lanes", { params: { month } });
    return { lanes: res.data.data, months: res.data.months ?? [] };
  } catch (error) {
    return rethrow(error);
  }
};

export const requestRateApi = async (
  input: RateRequestInput,
): Promise<{ message: string; data: RateRequest }> => {
  try {
    const res = await apiClient.post("/rates/requests", input);
    return res.data;
  } catch (error) {
    return rethrow(error);
  }
};

// ---- Admin: rates --------------------------------------------------------

export const getRateApi = async (id: string): Promise<Rate> => {
  try {
    const res = await apiClient.get(`/rates/${id}`);
    return res.data.data;
  } catch (error) {
    return rethrow(error);
  }
};

export const getRatesApi = async (params: ListParams): Promise<Paged<Rate>> => {
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
  try {
    const res = await apiClient.patch(`/rates/requests/${id}/resolve`);
    return res.data;
  } catch (error) {
    return rethrow(error);
  }
};

// ---- Admin: bulk import --------------------------------------------------

export const matchRateImportApi = async (body: {
  ports: ImportPortRef[];
  commodities: ImportCommodityRef[];
}): Promise<ImportMatchResult> => {
  try {
    const res = await apiClient.post("/rates/import/match", body);
    return res.data.data;
  } catch (error) {
    return rethrow(error);
  }
};

export const checkRateImportApi = async (
  rates: RateInput[],
): Promise<ImportCheck[]> => {
  try {
    const res = await apiClient.post("/rates/import/check", { rates });
    return res.data.data;
  } catch (error) {
    return rethrow(error);
  }
};

export const commitRateImportApi = async (body: {
  rates: { rate: RateInput; replaces: string | null }[];
  mappings: ImportMappings;
}): Promise<ImportResult> => {
  try {
    const res = await apiClient.post("/rates/import", body);
    return res.data;
  } catch (error) {
    return rethrow(error);
  }
};
