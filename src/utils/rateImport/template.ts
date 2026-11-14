import {
  chargePreset,
  type ChargeBasis,
  type ChargeStage,
  type PayTerm,
  type RateContainerSize,
} from "../../data/rates";
import type { RateCharge } from "../../services/api/rate";
import { parseTransit } from "../rates";
import {
  amountValue,
  dateValue,
  findHeaderRow,
  isNegativeAmount,
  normalise,
  portRef,
  text,
} from "./cells";
import { rowList } from "./maersk";
import type { DraftRate, ImportIssue, ParsedImport, SheetData } from "./types";

// FreightAfford's own rates template: one row per charge per container
// size. Rows with the same lane, size, commodity and dates make one rate.

export const TEMPLATE_SHEET = "Rates";

// Column headers, in the template's order. Matched ignoring case, so the
// columns can be in any order and extra columns are ignored.
export const TEMPLATE_COLUMNS = [
  { name: "Origin", required: true },
  { name: "Destination", required: true },
  { name: "Container size", required: true },
  { name: "Commodity", required: true },
  { name: "Valid from", required: true },
  { name: "Valid to", required: true },
  { name: "Charge type", required: false },
  { name: "Charge code", required: true },
  { name: "Charge name", required: false },
  { name: "Basis", required: false },
  { name: "Payment", required: false },
  { name: "Amount", required: true },
  { name: "Currency", required: true },
  { name: "Floating", required: false },
  { name: "Service mode", required: false },
  { name: "Transit time", required: false },
  { name: "Remarks", required: false },
] as const;

type Column = (typeof TEMPLATE_COLUMNS)[number]["name"];

const REQUIRED = TEMPLATE_COLUMNS.filter((c) => c.required).map((c) => c.name);

// The ways people write each size, including Maersk's equipment codes.
const SIZES: Record<string, RateContainerSize> = {
  "20ft std": "20ft Std",
  "20ft standard": "20ft Std",
  "20 std": "20ft Std",
  "20dry": "20ft Std",
  "20dv": "20ft Std",
  "20gp": "20ft Std",
  "40ft std": "40ft Std",
  "40ft standard": "40ft Std",
  "40 std": "40ft Std",
  "40dry": "40ft Std",
  "40dv": "40ft Std",
  "40gp": "40ft Std",
  "40ft hc": "40ft HC",
  "40ft high cube": "40ft HC",
  "40 hc": "40ft HC",
  "40hc": "40ft HC",
  "40hdry": "40ft HC",
  "40high": "40ft HC",
  "45ft hc": "45ft HC",
  "45ft high cube": "45ft HC",
  "45 hc": "45ft HC",
  "45hc": "45ft HC",
  "45hdry": "45ft HC",
  "45high": "45ft HC",
};

const STAGES: Record<string, ChargeStage> = {
  freight: "freight",
  "freight charges": "freight",
  origin: "origin",
  "origin charges": "origin",
  destination: "destination",
  "destination charges": "destination",
};

const BASES: Record<string, ChargeBasis> = {
  container: "container",
  "per container": "container",
  per_container: "container",
  document: "document",
  "per document": "document",
  per_document: "document",
  "b/l": "document",
  bl: "document",
};

const PAY_TERMS: Record<string, PayTerm> = {
  prepaid: "prepaid",
  collect: "collect",
  either: "either",
  "prepaid or collect": "either",
  "prepaid/collect": "either",
};

const DEFAULT_PAY: Record<ChargeStage, PayTerm> = {
  freight: "prepaid",
  origin: "prepaid",
  destination: "collect",
};

export const isTemplate = (sheets: SheetData[]) =>
  sheets.some((s) => findHeaderRow(s.rows, ["Origin", "Charge code"], 10));

export const parseTemplate = (
  sheets: SheetData[],
  today: string,
): ParsedImport => {
  const sheet =
    sheets.find(
      (s) =>
        s.name === TEMPLATE_SHEET &&
        findHeaderRow(s.rows, ["Origin", "Charge code"], 10),
    ) ??
    sheets.find((s) => findHeaderRow(s.rows, ["Origin", "Charge code"], 10))!;
  const header = findHeaderRow(sheet.rows, ["Origin", "Charge code"], 10)!;
  const issues: ImportIssue[] = [];

  const missing = REQUIRED.filter(
    (name) => !header.headers.includes(normalise(name)),
  );
  if (missing.length)
    return {
      format: "template",
      rowCount: 0,
      rates: [],
      issues: [
        {
          level: "error",
          sheet: sheet.name,
          rows: [header.index + 1],
          message: `The ${sheet.name} sheet is missing ${missing.length === 1 ? "the column" : "these columns"}: ${missing.join(", ")}. Start from the template.`,
        },
      ],
    };

  const col = Object.fromEntries(
    TEMPLATE_COLUMNS.map((c) => [
      c.name,
      header.headers.indexOf(normalise(c.name)),
    ]),
  ) as Record<Column, number>;

  const groups = new Map<
    string,
    { rate: DraftRate; bad: string[]; seen: Map<string, RateCharge> }
  >();
  let rowCount = 0;

  // A CSV row with more values than headings: a value with a comma in it
  // wasn't quoted, so everything after it moved one column right. Which
  // rate the row belongs to can't be trusted, and leaving it out could
  // import a rate missing a charge, so nothing is imported until it's fixed.
  // The moved values can all be empty (trailing columns), so a row that's
  // simply longer than the others counts too. A file that ends every row
  // with an extra comma has rows all the same length, and is fine.
  const dataRows = sheet.rows
    .slice(header.index + 1)
    .map((cells, i) => ({ cells, row: header.index + i + 2 }))
    .filter(({ cells }) => cells.some((cell) => text(cell)));
  const lengths = new Set(dataRows.map(({ cells }) => cells.length));
  const shifted = dataRows
    .filter(
      ({ cells }) =>
        cells.slice(header.headers.length).some((cell) => text(cell)) ||
        (cells.length > header.headers.length && lengths.size > 1),
    )
    .map(({ row }) => row);
  if (shifted.length)
    return {
      format: "template",
      rowCount: sheet.rows.length - header.index - 1,
      rates: [],
      issues: [
        {
          level: "error",
          sheet: sheet.name,
          rows: shifted,
          message: `${rowList(shifted).replace(/^r/, "R")} ${shifted.length === 1 ? "has" : "have"} more values than there are columns, so the columns after a comma have moved. A value with a comma in it, such as "Tin Can Island Port, Nigeria", needs quotes around it, or use the .xlsx template. Nothing was imported from this file: fix ${shifted.length === 1 ? "the row" : "the rows"} and import it again.`,
        },
      ],
    };

  sheet.rows.slice(header.index + 1).forEach((cells, i) => {
    const row = header.index + i + 2;
    if (!cells.some((cell) => text(cell))) return;
    rowCount++;
    const get = (name: Column) =>
      col[name] >= 0 ? text(cells[col[name]]) : "";
    const problems: string[] = [];

    const origin = portRef(cells[col.Origin]);
    const destination = portRef(cells[col.Destination]);
    if (!origin) problems.push("origin is empty");
    else if (!origin.code && !origin.country)
      problems.push(
        `origin "${origin.raw}" should be a port code like NGAPP or "City, Country"`,
      );
    if (!destination) problems.push("destination is empty");
    else if (!destination.code && !destination.country)
      problems.push(
        `destination "${destination.raw}" should be a port code like BEANR or "City, Country"`,
      );
    if (
      origin &&
      destination &&
      normalise(origin.raw) === normalise(destination.raw)
    )
      problems.push("origin and destination are the same port");

    const size =
      SIZES[
        normalise(get("Container size"))
          .replace(/['’]/g, "ft")
          .replace(/ftft/, "ft")
      ];
    if (!size)
      problems.push(
        `container size "${get("Container size")}" should be 20ft Std, 40ft Std, 40ft HC or 45ft HC`,
      );

    const commodity = get("Commodity");
    if (!commodity) problems.push("commodity is empty");

    const validFrom = dateValue(cells[col["Valid from"]]);
    const validTo = dateValue(cells[col["Valid to"]]);
    if (!validFrom)
      problems.push(
        `valid from "${get("Valid from")}" should be a date like 2026-12-01`,
      );
    if (!validTo)
      problems.push(
        `valid to "${get("Valid to")}" should be a date like 2026-12-31`,
      );
    if (validFrom && validTo && validTo < validFrom)
      problems.push("valid to is before valid from");

    const code = get("Charge code").toUpperCase();
    const preset = chargePreset(code);
    const name = get("Charge name") || preset?.name || "";
    if (!code) problems.push("charge code is empty");
    else if (!/^[A-Z0-9]{1,6}$/.test(code))
      problems.push(
        `charge code "${get("Charge code")}" should be up to 6 letters or numbers`,
      );
    else if (!name)
      problems.push(
        `charge ${code} isn't one of Maersk's usual codes, so it needs a charge name`,
      );

    const stageRaw = get("Charge type");
    const stage = stageRaw ? STAGES[normalise(stageRaw)] : preset?.stage;
    if (stageRaw && !stage)
      problems.push(
        `charge type "${stageRaw}" should be Freight, Origin or Destination`,
      );
    else if (!stage && code && name)
      problems.push(
        `charge ${code} needs a charge type (Freight, Origin or Destination)`,
      );

    const basisRaw = get("Basis");
    const basis = basisRaw
      ? BASES[normalise(basisRaw)]
      : (preset?.basis ?? "container");
    if (!basis)
      problems.push(`basis "${basisRaw}" should be Container or Document`);

    const payRaw = get("Payment");
    const payTerm = payRaw
      ? PAY_TERMS[normalise(payRaw)]
      : stage
        ? DEFAULT_PAY[stage]
        : undefined;
    if (payRaw && !payTerm)
      problems.push(`payment "${payRaw}" should be Prepaid, Collect or Either`);

    const amountCell = cells[col.Amount];
    const amount = amountValue(amountCell);
    if (!get("Amount")) problems.push("amount is empty");
    else if (amount === null)
      problems.push(
        isNegativeAmount(amountCell)
          ? `amount "${get("Amount")}" is negative`
          : `amount "${get("Amount")}" should be a number like 1450 or 1,450.50`,
      );

    const currency = get("Currency").toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency))
      problems.push(
        `currency "${get("Currency")}" should be a 3-letter code like USD`,
      );

    const floatingRaw = normalise(get("Floating"));
    if (
      floatingRaw &&
      !/^(yes|y|no|n|true|false|floating|fixed)$/.test(floatingRaw)
    )
      problems.push(`floating "${get("Floating")}" should be Yes or No`);

    const transitRaw = get("Transit time");
    const transitHours = !transitRaw
      ? undefined
      : /^\d+$/.test(transitRaw)
        ? Number(transitRaw) * 24
        : parseTransit(transitRaw);
    if (transitRaw && !transitHours)
      problems.push(
        `transit time "${transitRaw}" should look like 59d 8h, or a number of days`,
      );

    const key = [
      normalise(origin?.raw ?? ""),
      normalise(destination?.raw ?? ""),
      size ?? normalise(get("Container size")),
      normalise(commodity),
      validFrom ?? get("Valid from"),
      validTo ?? get("Valid to"),
    ].join("|");
    const group = groups.get(key) ?? {
      rate: {
        key,
        origin: origin ?? { raw: "" },
        destination: destination ?? { raw: "" },
        containerSize: size ?? "20ft Std",
        commodity: { kind: "text", text: commodity },
        validFrom: validFrom ?? "",
        validTo: validTo ?? "",
        charges: [],
        freeTime: [],
        rows: [],
      } as DraftRate,
      bad: [] as string[],
      seen: new Map<string, RateCharge>(),
    };
    group.rate.rows.push(row);
    groups.set(key, group);

    if (problems.length) {
      group.bad.push(`row ${row}: ${problems.join("; ")}`);
      return;
    }

    const charge: RateCharge = {
      code,
      name,
      amount: amount!,
      currency,
      basis: basis!,
      stage: stage!,
      payTerm: payTerm!,
      structure: /^(yes|y|true|floating)$/.test(floatingRaw)
        ? "floating"
        : "fixed",
    };
    const previous = group.seen.get(code);
    if (previous) {
      if (
        previous.amount !== charge.amount ||
        previous.currency !== charge.currency
      )
        group.bad.push(
          `row ${row}: ${code} appears twice with different amounts`,
        );
      return;
    }
    group.seen.set(code, charge);
    group.rate.charges.push(charge);

    // Rate-wide details: the first row that gives them wins.
    const serviceMode = get("Service mode");
    if (serviceMode && !group.rate.serviceMode)
      group.rate.serviceMode = serviceMode;
    if (transitHours && !group.rate.transitHours)
      group.rate.transitHours = transitHours;
    const remarks = get("Remarks");
    if (remarks && !group.rate.remarks) group.rate.remarks = remarks;
  });

  const rates: DraftRate[] = [];
  for (const { rate, bad } of groups.values()) {
    const name = `${rate.origin.raw || "?"} to ${rate.destination.raw || "?"}, ${rate.containerSize}`;
    if (bad.length) {
      issues.push({
        level: "error",
        sheet: sheet.name,
        rows: rate.rows,
        message: `${name}: ${bad.join("; ")}. This rate was left out.`,
      });
      continue;
    }
    if (rate.validTo < today) {
      issues.push({
        level: "warning",
        sheet: sheet.name,
        rows: rate.rows,
        message: `${name} expired on ${rate.validTo}, so it was left out (${rowList(rate.rows)}).`,
      });
      continue;
    }
    rates.push({ ...rate, serviceMode: rate.serviceMode ?? "CY/CY" });
  }

  return { format: "template", rowCount, rates, issues };
};
