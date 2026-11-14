import type { RateContainerSize } from "../../data/rates";
import type { FreeTime, RateCharge } from "../../services/api/rate";

// What a spreadsheet cell can hold once read.
export type Cell = string | number | boolean | Date | null;

// One sheet of the file. rows[0] is spreadsheet row 1, so a row's number in
// messages is its index + 1.
export interface SheetData {
  name: string;
  rows: Cell[][];
}

export type ImportFormat = "maersk" | "template";

// A port as the file names it. Maersk writes "City, Country" (sometimes
// "City, Region, Country"); our template takes that or a UN/LOCODE.
export interface PortRef {
  raw: string;
  code?: string; // when the file gives a UN/LOCODE
  city?: string;
  country?: string;
}

// The commodity as the file names it: a Maersk quote code such as
// MINE_IRO_ORE_OTH_MET, or the text from our template (a commodity name or
// a 6-digit Maersk commodity code).
export type CommodityRef =
  | { kind: "maersk"; code: string }
  | { kind: "text"; text: string };

// One rate read from the file, before its ports and commodity are matched.
export interface DraftRate {
  key: string; // unique within the file
  origin: PortRef;
  destination: PortRef;
  containerSize: RateContainerSize;
  commodity: CommodityRef;
  validFrom: string;
  validTo: string;
  serviceMode?: string;
  transitHours?: number;
  remarks?: string;
  charges: RateCharge[];
  freeTime: FreeTime[];
  rows: number[]; // the spreadsheet rows it came from
}

export type IssueLevel = "error" | "warning";

// Something wrong or worth knowing. A rate with an error is left out; a
// warning is only shown.
export interface ImportIssue {
  level: IssueLevel;
  sheet: string;
  rows: number[];
  message: string;
}

export interface ParsedImport {
  format: ImportFormat;
  quoteNumber?: string; // Maersk's, e.g. CP-STS-053344_1
  rowCount: number; // data rows read
  rates: DraftRate[];
  issues: ImportIssue[];
}

// A problem with the file as a whole: nothing in it can be imported.
export class ImportFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImportFileError";
  }
}
