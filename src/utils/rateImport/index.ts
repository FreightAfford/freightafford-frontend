import { normalise } from "./cells";
import { isMaerskQuote, parseMaerskQuote, rowList } from "./maersk";
import { isTemplate, parseTemplate } from "./template";
import {
  ImportFileError,
  type DraftRate,
  type ParsedImport,
  type SheetData,
} from "./types";

export * from "./types";
export { readImportFile } from "./readFile";
export { rowList } from "./maersk";

const commodityText = (rate: DraftRate) =>
  rate.commodity.kind === "maersk" ? rate.commodity.code : rate.commodity.text;

const sameRate = (a: DraftRate, b: DraftRate) =>
  normalise(a.origin.raw) === normalise(b.origin.raw) &&
  normalise(a.destination.raw) === normalise(b.destination.raw) &&
  a.containerSize === b.containerSize &&
  normalise(commodityText(a)) === normalise(commodityText(b));

// Reads the rates out of a file's sheets: a Maersk quote export or our
// template. `today` (YYYY-MM-DD) decides what has already expired.
export const parseImport = (
  sheets: SheetData[],
  today: string,
): ParsedImport => {
  if (
    !sheets.some((s) =>
      s.rows.some((r) => r.some((c) => c !== null && c !== "")),
    )
  )
    throw new ImportFileError("This file is empty.");

  const parsed = isMaerskQuote(sheets)
    ? parseMaerskQuote(sheets, today)
    : isTemplate(sheets)
      ? parseTemplate(sheets, today)
      : null;
  if (!parsed)
    throw new ImportFileError(
      "This doesn't look like a Maersk quote export or our rates template: no sheet has their column headings. Download the template, or upload the quote file exactly as Maersk sent it.",
    );

  // Two rates in the file for the same lane, size and commodity whose dates
  // overlap: customers would only see one of them.
  const { rates } = parsed;
  for (let i = 0; i < rates.length; i++) {
    for (let j = i + 1; j < rates.length; j++) {
      const a = rates[i];
      const b = rates[j];
      if (
        sameRate(a, b) &&
        a.validFrom <= b.validTo &&
        b.validFrom <= a.validTo
      )
        parsed.issues.push({
          level: "warning",
          sheet: "",
          rows: [...a.rows, ...b.rows],
          message: `${a.origin.raw} to ${a.destination.raw}, ${a.containerSize}: two rates in this file overlap (${a.validFrom} to ${a.validTo} and ${b.validFrom} to ${b.validTo}, ${rowList([...a.rows, ...b.rows])}). Customers only see the one saved last.`,
        });
    }
  }

  parsed.issues.sort(
    (a, b) =>
      Number(b.level === "error") - Number(a.level === "error") ||
      (a.rows[0] ?? 0) - (b.rows[0] ?? 0),
  );
  return parsed;
};
