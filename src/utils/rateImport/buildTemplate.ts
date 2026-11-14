import moment from "moment";
import {
  CHARGE_BASES,
  CHARGE_STAGES,
  PAY_TERMS,
  RATE_CONTAINER_SIZES,
  RATE_CURRENCIES,
} from "../../data/rates";
import { TEMPLATE_COLUMNS, TEMPLATE_SHEET } from "./template";

// FreightAfford's rates template as an .xlsx: the Rates sheet with
// dropdowns and an example rate, an Instructions sheet, and a hidden Lists
// sheet the dropdowns read from.

export const TEMPLATE_FILE_NAME = "freightafford-rates-template.xlsx";

const LISTS: Record<string, readonly string[]> = {
  "Container size": RATE_CONTAINER_SIZES.map((s) => s.value),
  "Charge type": CHARGE_STAGES.map((s) => s.label.replace(" charges", "")),
  Basis: CHARGE_BASES.map((b) => b.label),
  Payment: PAY_TERMS.map((p) => (p.value === "either" ? "Either" : p.label)),
  Floating: ["Yes", "No"],
  Currency: RATE_CURRENCIES,
};

const INSTRUCTIONS: [string, string][] = [
  [
    "How it works",
    "One row per charge, per container size. Rows with the same origin, destination, container size, commodity and dates make one rate.",
  ],
  [
    "Origin, Destination",
    'A port code such as NGAPP, or the port as Maersk names it: "Tin Can Island Port, Nigeria".',
  ],
  [
    "Container size",
    "20ft Std, 40ft Std, 40ft HC or 45ft HC (Maersk's 20DRY, 40DRY, 40HDRY and 45HDRY work too).",
  ],
  [
    "Commodity",
    "The commodity's name as the Maersk commodity search shows it. Anything it can't match, you choose once during the import.",
  ],
  [
    "Valid from, Valid to",
    "Dates such as 2026-12-01 or 1 Dec 2026. Both days are included. Dates with slashes are refused, because 01/12 means different days in different countries.",
  ],
  [
    "Charge code",
    "Maersk's code: BAS, EBS, DHC… A known code fills in its name, type and basis. For any other code, also give the charge name and type.",
  ],
  [
    "Basis",
    "Container (each container) or Document (once per bill of lading). Leave empty to use the code's usual basis.",
  ],
  [
    "Payment",
    "Prepaid, Collect or Either. Leave empty for the usual: prepaid for freight and origin, collect for destination.",
  ],
  [
    "Amount, Currency",
    "The amount for one container or one document, such as 1450 or 1,450.50, and a 3-letter currency. 0 is fine.",
  ],
  [
    "Floating",
    "Yes when the charge can change before shipment (bunker, congestion…).",
  ],
  [
    "Optional",
    "Service mode (CY/CY), transit time (59d 8h, or days), remarks. The first row of a rate that gives them is used.",
  ],
  [
    "Replacing rates",
    "A rate with the same lane, size, commodity and start date as a saved one replaces it. The import shows which before anything is saved.",
  ],
  [
    "Maersk quotes",
    "You don't need this template for a Maersk quote: upload the quote file exactly as Maersk sent it.",
  ],
];

const columnLetter = (index: number) => String.fromCharCode(65 + index);

export const buildTemplate = async (): Promise<Blob> => {
  const { default: ExcelJS } = await import("exceljs");
  const wb = new ExcelJS.Workbook();
  wb.creator = "FreightAfford";

  const rates = wb.addWorksheet(TEMPLATE_SHEET, {
    views: [{ state: "frozen", ySplit: 1 }],
  });
  rates.columns = TEMPLATE_COLUMNS.map((c) => ({
    header: c.name,
    key: c.name,
    width:
      c.name === "Commodity" || c.name === "Charge name" || c.name === "Remarks"
        ? 28
        : 15,
  }));
  const header = rates.getRow(1);
  header.font = { bold: true, color: { argb: "FFFFFFFF" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0F172B" },
  };
  TEMPLATE_COLUMNS.forEach((c, i) => {
    header.getCell(i + 1).note = c.required ? "Required" : "Optional";
  });

  // An example rate, priced next month: three charges for one size.
  const from = moment().add(1, "month").startOf("month").format("YYYY-MM-DD");
  const to = moment().add(1, "month").endOf("month").format("YYYY-MM-DD");
  const example = (over: Record<string, string | number>) => ({
    Origin: "NGAPP",
    Destination: "BEANR",
    "Container size": "40ft HC",
    Commodity: "Cocoa beans",
    "Valid from": from,
    "Valid to": to,
    ...over,
  });
  rates.addRows([
    example({
      "Charge code": "BAS",
      Amount: 1415,
      Currency: "USD",
      "Service mode": "CY/CY",
      "Transit time": "24d 18h",
    }),
    example({
      "Charge code": "EBS",
      Amount: 171,
      Currency: "EUR",
      Floating: "Yes",
    }),
    example({
      "Charge code": "ODF",
      Amount: 5000,
      Currency: "NGN",
      Floating: "Yes",
    }),
    example({
      "Charge type": "Destination",
      "Charge code": "TCF",
      "Charge name": "Terminal congestion fee",
      Basis: "Container",
      Payment: "Collect",
      Amount: 50,
      Currency: "EUR",
      Floating: "Yes",
    }),
  ]);

  // Dropdowns read from a hidden sheet; free text is still allowed where a
  // column takes other spellings (sizes) but warned about elsewhere.
  const lists = wb.addWorksheet("Lists", { state: "veryHidden" });
  Object.entries(LISTS).forEach(([name, values], i) => {
    lists.getCell(1, i + 1).value = name;
    values.forEach((v, j) => (lists.getCell(j + 2, i + 1).value = v));
    const col = TEMPLATE_COLUMNS.findIndex((c) => c.name === name);
    const letter = columnLetter(i);
    for (let row = 2; row <= 2000; row++)
      rates.getCell(row, col + 1).dataValidation = {
        type: "list",
        allowBlank: true,
        formulae: [`Lists!$${letter}$2:$${letter}$${values.length + 1}`],
        showErrorMessage: name !== "Container size",
        errorStyle: "warning",
        errorTitle: name,
        error: `Choose one of the ${name.toLowerCase()} options.`,
      };
  });

  // Dates as text in ISO form avoid Excel's regional date formats.
  for (const name of ["Valid from", "Valid to"] as const) {
    const col = TEMPLATE_COLUMNS.findIndex((c) => c.name === name) + 1;
    rates.getColumn(col).numFmt = "yyyy-mm-dd";
  }
  rates.getColumn(
    TEMPLATE_COLUMNS.findIndex((c) => c.name === "Amount") + 1,
  ).numFmt = "#,##0.##";

  const help = wb.addWorksheet("Instructions");
  help.columns = [
    { header: "Column", key: "column", width: 22 },
    { header: "What to put in it", key: "what", width: 100 },
  ];
  help.getRow(1).font = { bold: true };
  INSTRUCTIONS.forEach(([column, what]) => {
    const row = help.addRow({ column, what });
    row.alignment = { wrapText: true, vertical: "top" };
    row.getCell(1).font = { bold: true };
  });

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
};
