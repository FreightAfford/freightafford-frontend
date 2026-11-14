import { ImportFileError, type Cell, type SheetData } from "./types";

// Reads an uploaded .xlsx or .csv into plain rows of cell values.

export const MAX_FILE_BYTES = 5 * 1024 * 1024;

// A CSV reader: commas or semicolons (European Excel), quoted fields with
// "" escapes and line breaks inside quotes, CRLF or LF, and the byte order
// mark Excel puts at the start of a UTF-8 CSV.
export const parseCsv = (input: string): Cell[][] => {
  const text = input.replace(/^\uFEFF/, "");
  const firstLine = text.slice(0, text.search(/\r?\n|$/));
  const delimiter =
    (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0)
      ? ";"
      : ",";
  const rows: Cell[][] = [];
  let row: Cell[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === delimiter) {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
};

// exceljs cell values: plain values, or objects for formulas, rich text,
// hyperlinks and errors.
const cellValue = (value: unknown): Cell => {
  if (value === null || value === undefined) return null;
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    value instanceof Date
  )
    return value;
  if (typeof value === "object") {
    const v = value as Record<string, unknown>;
    if ("result" in v) return cellValue(v.result);
    if (Array.isArray(v.richText))
      return (v.richText as { text: string }[]).map((r) => r.text).join("");
    if ("text" in v) return cellValue(v.text);
    if ("error" in v) return null;
  }
  return String(value);
};

export const readXlsx = async (data: ArrayBuffer): Promise<SheetData[]> => {
  // Loaded only when a workbook is read, so the app doesn't carry it.
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(data);
  } catch {
    throw new ImportFileError(
      "This workbook couldn't be opened. It may be password protected or damaged: open it in Excel, save a copy without a password, and try that.",
    );
  }
  return workbook.worksheets.map((ws) => {
    const rows: Cell[][] = [];
    ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
      const values = (row.values as unknown[]).slice(1).map(cellValue);
      rows[rowNumber - 1] = values;
    });
    for (let i = 0; i < rows.length; i++) rows[i] ??= [];
    return { name: ws.name, rows };
  });
};

export const readImportFile = async (file: {
  name: string;
  size: number;
  arrayBuffer: () => Promise<ArrayBuffer>;
}): Promise<SheetData[]> => {
  const ext = file.name.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  if (ext === "xls")
    throw new ImportFileError(
      "This is an old Excel file (.xls). Open it in Excel and save it as .xlsx, then try again.",
    );
  if (ext !== "xlsx" && ext !== "csv")
    throw new ImportFileError(
      "Choose a Maersk quote export or our rates template, as .xlsx or .csv.",
    );
  if (file.size === 0) throw new ImportFileError("This file is empty.");
  if (file.size > MAX_FILE_BYTES)
    throw new ImportFileError(
      "This file is over 5 MB. Split it into smaller files and import them one at a time.",
    );

  const data = await file.arrayBuffer();
  if (ext === "csv") {
    const rows = parseCsv(new TextDecoder("utf-8").decode(data));
    return [{ name: file.name.replace(/\.csv$/i, ""), rows }];
  }
  return readXlsx(data);
};
