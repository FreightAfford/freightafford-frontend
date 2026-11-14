import type {
  ChargeBasis,
  ChargeStage,
  PayTerm,
  RateContainerSize,
} from "../../data/rates";
import type { RateCharge } from "../../services/api/rate";
import { parseTransit } from "../rates";
import {
  amountValue,
  dateValue,
  findHeaderRow,
  isNegativeAmount,
  isNotApplicable,
  normalise,
  portRef,
  text,
} from "./cells";
import { DD_SHEET, freeTimeKey, readFreeTime } from "./freeTime";
import type {
  Cell,
  DraftRate,
  ImportIssue,
  ParsedImport,
  PortRef,
  SheetData,
} from "./types";

// Maersk's contract quote export, as downloaded from maersk.com: a
// QuoteOutput sheet with a few info rows, a row naming the equipment over
// each Rate / Currency / Rate structure block, the header row, then one row
// per lane and charge.

export const QUOTE_SHEET = "QuoteOutput";
const HEADER_MARKERS = [
  "Load Port",
  "Discharge Port",
  "Charge Code",
  "Rate Basis",
];

// Equipment we price, as the rates sheet names it.
const EQUIPMENT: Record<string, RateContainerSize> = {
  "20dry": "20ft Std",
  "40dry": "40ft Std",
  "40hdry": "40ft HC",
  "45hdry": "45ft HC",
};

const STAGES: Record<string, ChargeStage> = {
  freight: "freight",
  origin: "origin",
  destination: "destination",
};

const PAY_TERMS: Record<string, PayTerm> = {
  prepaid: "prepaid",
  collect: "collect",
  "prepaid/collect": "either",
  "collect/prepaid": "either",
};

const BASES: Record<string, ChargeBasis> = {
  per_container: "container",
  "per container": "container",
  per_document: "document",
  "per document": "document",
};

export const isMaerskQuote = (sheets: SheetData[]) =>
  sheets.some((s) => findHeaderRow(s.rows, HEADER_MARKERS));

const yes = (value: string) => /^(y|yes|true)$/i.test(value);

// "Rows 12, 13, 14 and 20" for messages, shortening long runs.
export const rowList = (rows: number[]) => {
  const sorted = [...new Set(rows)].sort((a, b) => a - b);
  const runs: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1] === sorted[j] + 1) j++;
    runs.push(j > i ? `${sorted[i]}–${sorted[j]}` : `${sorted[i]}`);
    i = j;
  }
  return `${sorted.length === 1 && !runs[0].includes("–") ? "row" : "rows"} ${runs.join(", ")}`;
};

const portLabel = (p: PortRef) => p.raw;

interface LaneGroup {
  origin: PortRef;
  destination: PortRef;
  commodity: string;
  validFrom: string;
  validTo: string;
  serviceMode: string;
  transitHours?: number;
  rows: number[];
  lines: { row: number; cells: Cell[] }[];
}

export const parseMaerskQuote = (
  sheets: SheetData[],
  today: string,
): ParsedImport => {
  const sheet =
    sheets.find(
      (s) => s.name === QUOTE_SHEET && findHeaderRow(s.rows, HEADER_MARKERS),
    ) ?? sheets.find((s) => findHeaderRow(s.rows, HEADER_MARKERS))!;
  const header = findHeaderRow(sheet.rows, HEADER_MARKERS)!;
  const issues: ImportIssue[] = [];
  const issue = (
    level: ImportIssue["level"],
    rows: number[],
    message: string,
  ) => issues.push({ level, sheet: sheet.name, rows, message });

  // Info rows above the table: "Quote Number | CP-STS-053344_1".
  let quoteNumber: string | undefined;
  for (const row of sheet.rows.slice(0, header.index)) {
    if (normalise(text(row[0])) === "quote number") quoteNumber = text(row[1]);
  }

  const col = (name: string) => header.headers.indexOf(normalise(name));
  const c = {
    from: col("From (City, Country/Region)"),
    load: col("Load Port"),
    discharge: col("Discharge Port"),
    to: col("To (City, Country/Region)"),
    effective: col("Effective Date"),
    expiry: col("Expiry Date"),
    serviceMode: col("Service Mode"),
    commodity: col("Commodity Name"),
    soc: col("SOC"),
    nor: col("NOR"),
    empty: col("Empty"),
    imo: col("IMO Class"),
    un: col("UN Number"),
    transit: col("Transit Time"),
    chargeType: col("Charge Type"),
    payTerm: col("Country PayTerm"),
    code: col("Charge Code"),
    name: col("Charge Name"),
    basis: col("Rate Basis"),
  };

  // The equipment row sits right above the header: each priced size names
  // the first column of its Rate / Currency / Rate structure block.
  const equipmentRow = sheet.rows[header.index - 1] ?? [];
  const blocks: {
    size: RateContainerSize;
    rate: number;
    currency: number;
    structure: number;
  }[] = [];
  const unknownEquipment = new Set<string>();
  header.headers.forEach((h, i) => {
    if (h !== "rate") return;
    const equipment = normalise(text(equipmentRow[i]));
    const size = EQUIPMENT[equipment];
    if (!size) {
      if (equipment) unknownEquipment.add(text(equipmentRow[i]));
      return;
    }
    if (blocks.some((b) => b.size === size)) return;
    blocks.push({
      size,
      rate: i,
      currency: header.headers[i + 1] === "currency" ? i + 1 : -1,
      structure: header.headers[i + 2] === "rate structure" ? i + 2 : -1,
    });
  });
  if (unknownEquipment.size)
    issue(
      "warning",
      [header.index],
      `${[...unknownEquipment].join(", ")} ${unknownEquipment.size === 1 ? "isn't a size" : "aren't sizes"} we price, so ${unknownEquipment.size === 1 ? "its" : "their"} rates were left out.`,
    );
  if (!blocks.length)
    return {
      format: "maersk",
      quoteNumber,
      rowCount: 0,
      rates: [],
      issues: [
        {
          level: "error",
          sheet: sheet.name,
          rows: [header.index],
          message:
            "No 20DRY, 40DRY or 40HDRY rate columns were found above the header row, so no rates could be read.",
        },
      ],
    };

  // Group the charge rows into lanes. Rows that can't belong to a lane are
  // reported and skipped.
  const lanes = new Map<string, LaneGroup>();
  const special: number[] = [];
  const inland = new Map<string, number[]>();
  let rowCount = 0;

  sheet.rows.slice(header.index + 1).forEach((cells, i) => {
    const row = header.index + i + 2;
    if (!cells.some((cell) => text(cell))) return;
    rowCount++;
    const get = (index: number) => (index >= 0 ? text(cells[index]) : "");

    // Dangerous goods, shipper-owned, non-operating reefer and empty
    // container rates are priced differently; our rates don't model them.
    if (
      yes(get(c.soc)) ||
      yes(get(c.nor)) ||
      yes(get(c.empty)) ||
      get(c.imo) ||
      get(c.un)
    ) {
      special.push(row);
      return;
    }

    const load = portRef(cells[c.load]);
    const discharge = portRef(cells[c.discharge]);
    const problems: string[] = [];
    if (!load) problems.push("the load port is empty");
    if (!discharge) problems.push("the discharge port is empty");
    if (load && discharge && normalise(load.raw) === normalise(discharge.raw))
      problems.push("the load and discharge ports are the same");

    const validFrom = dateValue(cells[c.effective]);
    const validTo = dateValue(cells[c.expiry]);
    if (!validFrom)
      problems.push(`the effective date "${get(c.effective)}" isn't a date`);
    if (!validTo)
      problems.push(`the expiry date "${get(c.expiry)}" isn't a date`);

    const commodity = get(c.commodity);
    if (!commodity) problems.push("the commodity is empty");

    if (problems.length) {
      issue("error", [row], `Row ${row}: ${problems.join("; ")}.`);
      return;
    }

    // Door or inland rates include haulage our rates don't show.
    const from = portRef(cells[c.from]);
    const to = portRef(cells[c.to]);
    const serviceMode = get(c.serviceMode) || "CY/CY";
    const viaInland =
      (from && normalise(from.raw) !== normalise(load!.raw)) ||
      (to && normalise(to.raw) !== normalise(discharge!.raw)) ||
      normalise(serviceMode) !== "cy/cy";
    const key = [
      normalise(load!.raw),
      normalise(discharge!.raw),
      normalise(commodity),
      validFrom,
      validTo,
    ].join("|");
    if (viaInland) {
      const label = `${from?.raw ?? load!.raw} to ${to?.raw ?? discharge!.raw} (${serviceMode})`;
      inland.set(label, [...(inland.get(label) ?? []), row]);
      return;
    }

    const transitRaw = get(c.transit);
    const transitHours = transitRaw
      ? (parseTransit(transitRaw) ?? undefined)
      : undefined;

    const lane = lanes.get(key) ?? {
      origin: load!,
      destination: discharge!,
      commodity,
      validFrom: validFrom!,
      validTo: validTo!,
      serviceMode,
      transitHours,
      rows: [],
      lines: [],
    };
    lane.rows.push(row);
    lane.lines.push({ row, cells });
    if (!lane.transitHours && transitHours) lane.transitHours = transitHours;
    lanes.set(key, lane);
  });

  if (special.length)
    issue(
      "warning",
      special,
      `Dangerous goods, shipper-owned, NOR or empty container rates (${rowList(special)}) were left out: our rates don't cover them yet.`,
    );
  for (const [label, rows] of inland)
    issue(
      "warning",
      rows,
      `${label} was left out (${rowList(rows)}): it includes inland or door transport, and our rates are port to port only.`,
    );

  const freeTime = readFreeTime(sheets.find((s) => s.name === DD_SHEET));
  issues.push(...freeTime.issues);

  const rates: DraftRate[] = [];
  for (const lane of lanes.values()) {
    const laneName = `${portLabel(lane.origin)} to ${portLabel(lane.destination)}`;

    if (lane.validTo < lane.validFrom) {
      issue(
        "error",
        lane.rows,
        `${laneName}: the expiry date is before the effective date (${rowList(lane.rows)}).`,
      );
      continue;
    }
    if (lane.validTo < today) {
      issue(
        "warning",
        lane.rows,
        `${laneName} expired on ${lane.validTo}, so it was left out (${rowList(lane.rows)}).`,
      );
      continue;
    }

    const basic = lane.lines.find(
      (l) => text(l.cells[c.code]).toUpperCase() === "BAS",
    );
    if (!basic) {
      issue(
        "error",
        lane.rows,
        `${laneName} has no Basic Ocean Freight (BAS) row, so it was left out (${rowList(lane.rows)}).`,
      );
      continue;
    }

    for (const block of blocks) {
      // A size is priced on this lane when its basic freight has a number.
      if (
        isNotApplicable(basic.cells[block.rate]) ||
        !text(basic.cells[block.rate])
      )
        continue;

      const charges: RateCharge[] = [];
      const rowErrors: string[] = [];
      const seen = new Map<string, RateCharge>();

      for (const { row, cells } of lane.lines) {
        const get = (index: number) => (index >= 0 ? text(cells[index]) : "");
        const raw = cells[block.rate];
        if (isNotApplicable(raw) || !text(raw)) continue;

        const code = get(c.code).toUpperCase();
        const amount = amountValue(raw);
        const currency = get(block.currency).toUpperCase();
        const stage = STAGES[normalise(get(c.chargeType))];
        const payTerm = PAY_TERMS[normalise(get(c.payTerm))] ?? "either";
        const basis = BASES[normalise(get(c.basis))];
        const problems: string[] = [];

        if (!code) problems.push("the charge code is empty");
        if (amount === null)
          problems.push(
            isNegativeAmount(raw)
              ? `the ${block.size} amount "${text(raw)}" is negative`
              : `the ${block.size} amount "${text(raw)}" isn't a number`,
          );
        if (!/^[A-Z]{3}$/.test(currency))
          problems.push(
            `the ${block.size} currency "${get(block.currency)}" isn't a 3-letter code`,
          );
        if (!stage)
          problems.push(
            `the charge type "${get(c.chargeType)}" should be FREIGHT, ORIGIN or DESTINATION`,
          );
        if (!basis)
          problems.push(
            `the rate basis "${get(c.basis)}" should be PER_CONTAINER or PER_DOCUMENT`,
          );
        if (problems.length) {
          rowErrors.push(`row ${row}: ${problems.join("; ")}`);
          continue;
        }

        const charge: RateCharge = {
          code,
          name: get(c.name) || code,
          amount: amount!,
          currency,
          basis: basis!,
          stage: stage!,
          payTerm,
          structure:
            normalise(get(block.structure)) === "floating"
              ? "floating"
              : "fixed",
        };
        const previous = seen.get(code);
        if (previous) {
          if (
            previous.amount !== charge.amount ||
            previous.currency !== charge.currency
          )
            rowErrors.push(
              `row ${row}: ${code} appears twice with different amounts`,
            );
          continue;
        }
        seen.set(code, charge);
        charges.push(charge);
      }

      if (rowErrors.length) {
        issue(
          "error",
          lane.rows,
          `${laneName}, ${block.size}: ${rowErrors.join("; ")}. This rate was left out.`,
        );
        continue;
      }

      const dest = lane.destination;
      rates.push({
        key: `${lane.origin.raw}|${dest.raw}|${block.size}|${lane.commodity}|${lane.validFrom}|${lane.validTo}`,
        origin: lane.origin,
        destination: dest,
        containerSize: block.size,
        commodity: { kind: "maersk", code: lane.commodity },
        validFrom: lane.validFrom,
        validTo: lane.validTo,
        serviceMode: lane.serviceMode,
        transitHours: lane.transitHours,
        charges,
        freeTime:
          freeTime.byKey.get(
            freeTimeKey(
              dest.city ?? "",
              dest.country ?? "",
              block.size,
              lane.commodity,
            ),
          ) ?? [],
        rows: lane.rows,
      });
    }
  }

  return { format: "maersk", quoteNumber, rowCount, rates, issues };
};
