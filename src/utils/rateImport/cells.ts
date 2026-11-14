import moment from "moment";
import type { Cell, PortRef } from "./types";

// Turning spreadsheet cells into the values a rate needs. Each parser
// returns null for "not a valid value", so callers word the problem.

const ISO = "YYYY-MM-DD";
const UN_LOCODE = /^[A-Z]{2}[A-Z2-9]{3}$/;

export const text = (cell: Cell | undefined): string => {
  if (cell === null || cell === undefined) return "";
  if (cell instanceof Date) return dateValue(cell) ?? "";
  return String(cell).replace(/\s+/g, " ").trim();
};

// For comparing headers and option names: lower case, single spaces.
export const normalise = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

// Maersk writes "NA" where a size or charge isn't priced.
export const isNotApplicable = (cell: Cell | undefined) =>
  /^(na|n\/a|-|–)$/i.test(text(cell));

// Excel counts days from 30 Dec 1899; this range covers 1954 to 2119.
const EXCEL_EPOCH = Date.UTC(1899, 11, 30);
const fromSerial = (serial: number) =>
  serial > 20000 && serial < 80000 && Number.isInteger(serial)
    ? new Date(EXCEL_EPOCH + serial * 86_400_000)
    : null;

// Written-out dates people type. Slashed dates are refused: 01/12/2026 is
// 1 December in Lagos and 12 January in a US-set Excel.
const DATE_FORMATS = [
  ISO,
  "YYYY-MM-DDTHH:mm:ss",
  "YYYY-MM-DDTHH:mm:ss.SSSZ",
  "D MMM YYYY",
  "D MMMM YYYY",
  "DD-MMM-YYYY",
  "D-MMM-YYYY",
  "MMM D, YYYY",
  "MMMM D, YYYY",
];

// A date cell, an Excel serial number or written text → "YYYY-MM-DD".
// Excel date cells arrive as midnight UTC, so the UTC day is the one shown.
export const dateValue = (cell: Cell | undefined): string | null => {
  if (cell instanceof Date)
    return Number.isNaN(cell.getTime()) ? null : moment.utc(cell).format(ISO);
  if (typeof cell === "number") {
    const d = fromSerial(cell);
    return d ? moment.utc(d).format(ISO) : null;
  }
  const t = text(cell);
  if (!t || t.includes("/")) return null;
  const m = moment.utc(t, DATE_FORMATS, "en", true);
  return m.isValid() ? m.format(ISO) : null;
};

// "1200", 1200, "1,200.50" → a number. Spaces and decimal commas are
// refused rather than guessed: "1.200" means 1.2 here, 1200 in Europe.
export const amountValue = (cell: Cell | undefined): number | null => {
  if (typeof cell === "number") return Number.isFinite(cell) ? cell : null;
  const t = text(cell);
  if (/^\d+(\.\d+)?$/.test(t)) return Number(t);
  if (/^\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) return Number(t.replace(/,/g, ""));
  return null;
};

export const isNegativeAmount = (cell: Cell | undefined) =>
  (typeof cell === "number" && cell < 0) || /^-\s*\d/.test(text(cell));

// A port written as a UN/LOCODE, "City, Country" or "City, Region, Country".
export const portRef = (cell: Cell | undefined): PortRef | null => {
  const raw = text(cell);
  if (!raw) return null;
  if (UN_LOCODE.test(raw.toUpperCase()) && !raw.includes(","))
    return { raw, code: raw.toUpperCase() };
  const parts = raw
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length < 2) return { raw, city: parts[0] };
  return { raw, city: parts[0], country: parts[parts.length - 1] };
};

// "GATE-OUT FULL" → "Gate-out full"
export const sentenceCase = (value: string) => {
  const t = value.trim().toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

// Finds the first row (within the first `scan` rows) whose cells include
// every one of `needed`, ignoring case. Returns its index and a column
// lookup by normalised header.
export const findHeaderRow = (rows: Cell[][], needed: string[], scan = 40) => {
  for (let i = 0; i < Math.min(rows.length, scan); i++) {
    const headers = (rows[i] ?? []).map((c) => normalise(text(c)));
    if (needed.every((n) => headers.includes(normalise(n))))
      return { index: i, headers };
  }
  return null;
};
