import type { RateContainerSize } from "../../data/rates";
import type { FreeTime, FreeTimeTier } from "../../services/api/rate";
import { findHeaderRow, normalise, sentenceCase, text } from "./cells";
import type { ImportIssue, SheetData } from "./types";

// Maersk's "D&D Freetime Details" sheet: detention and demurrage free time
// per destination city, equipment and commodity, with up to four daily
// charge periods after it.

export const DD_SHEET = "D&D Freetime Details";

// The D&D sheet names equipment differently from the rates sheet.
const EQUIPMENT: Record<string, RateContainerSize> = {
  "20dry": "20ft Std",
  "40dry": "40ft Std",
  "40high": "40ft HC",
  "40hdry": "40ft HC",
  "45high": "45ft HC",
  "45hdry": "45ft HC",
};

// "Day 15 - Day 17" / "Day 15 - Day ∞"
const parsePeriod = (value: string) => {
  const m = value.match(/^day\s*(\d+)\s*[-–]\s*day\s*(\d+|∞|inf\w*)$/i);
  if (!m) return null;
  const fromDay = Number(m[1]);
  const toDay = /^\d+$/.test(m[2]) ? Number(m[2]) : undefined;
  if (toDay !== undefined && toDay < fromDay) return null;
  return { fromDay, toDay };
};

// "EUR 150 PER DAY"
const parsePrice = (value: string) => {
  const m = value.match(/^([A-Z]{3})\s*([\d,]+(?:\.\d+)?)\s*(?:per\s*day)?$/i);
  if (!m) return null;
  return {
    currency: m[1].toUpperCase(),
    amount: Number(m[2].replace(/,/g, "")),
  };
};

// "Combined (Excluding Storage invoiced separately by Maersk)"
//   → type "Combined", note "Excluding storage invoiced separately by Maersk"
const splitType = (value: string) => {
  const m = value.match(/^([^(]+?)\s*\((.+)\)\s*$/);
  const type = sentenceCase(m ? m[1] : value);
  const note = m ? sentenceCase(m[2]).replace(/\bmaersk\b/gi, "Maersk") : "";
  return { type, note: note || undefined };
};

// Where an entry applies: the rate's destination city and country, its
// size and its Maersk commodity code.
export const freeTimeKey = (
  city: string,
  country: string,
  size: RateContainerSize,
  commodity: string,
) =>
  [normalise(city), normalise(country), size, normalise(commodity)].join("|");

export interface FreeTimeTable {
  byKey: Map<string, FreeTime[]>;
  issues: ImportIssue[];
}

export const readFreeTime = (sheet: SheetData | undefined): FreeTimeTable => {
  const byKey = new Map<string, FreeTime[]>();
  const issues: ImportIssue[] = [];
  if (!sheet) return { byKey, issues };

  const header = findHeaderRow(sheet.rows, [
    "Location",
    "Equipment",
    "Total Freetime",
    "Commodity Name",
  ]);
  if (!header) {
    issues.push({
      level: "warning",
      sheet: sheet.name,
      rows: [],
      message:
        "The free time sheet doesn't have the columns Maersk uses, so free time wasn't read.",
    });
    return { byKey, issues };
  }
  const col = (name: string) => header.headers.indexOf(normalise(name));
  const c = {
    direction: col("Direction"),
    country: col("Country"),
    location: col("Location"),
    type: col("D&D Type"),
    equipment: col("Equipment"),
    days: col("Total Freetime"),
    commodity: col("Commodity Name"),
    dayType: col("Freetime Type"),
    start: col("Start Event"),
    end: col("End Event"),
  };
  const periods = [1, 2, 3, 4].map((n) => ({
    period: col(`Period ${n} after Freetime`),
    price: col(`Unit Price for Period ${n}`),
  }));

  const seen = new Set<string>();
  const unreadable: number[] = [];

  sheet.rows.slice(header.index + 1).forEach((row, i) => {
    const rowNumber = header.index + i + 2;
    const get = (index: number) => (index >= 0 ? text(row[index]) : "");
    if (!row.some((cell) => text(cell))) return;

    // Destination free time only: export rows are about the origin.
    if (c.direction >= 0 && normalise(get(c.direction)) !== "import") return;

    const size = EQUIPMENT[normalise(get(c.equipment))];
    // Equipment we don't price (reefers, flat racks…): nothing to attach to.
    if (!size) return;

    const days = Number(get(c.days));
    const tiers: FreeTimeTier[] = [];
    let bad = !Number.isInteger(days) || days < 0;
    for (const p of periods) {
      const period = get(p.period);
      const price = get(p.price);
      if (!period || period === "-") continue;
      const range = parsePeriod(period);
      const cost = parsePrice(price);
      if (!range || !cost) {
        bad = true;
        break;
      }
      tiers.push({ ...range, ...cost });
    }
    if (bad || !get(c.location)) {
      unreadable.push(rowNumber);
      return;
    }

    const { type, note } = splitType(get(c.type) || "Combined");
    const entry: FreeTime = {
      type,
      days,
      dayType: sentenceCase(get(c.dayType) || "Calendar days"),
      startEvent: sentenceCase(get(c.start) || "Discharge"),
      endEvent: sentenceCase(get(c.end) || "Gate-in empty"),
      tiers,
      ...(note ? { note } : {}),
    };

    const key = freeTimeKey(
      get(c.location),
      get(c.country),
      size,
      get(c.commodity),
    );
    // The sheet repeats identical rows (one per RFQ); keep one of each.
    const fingerprint = `${key}#${JSON.stringify(entry)}`;
    if (seen.has(fingerprint)) return;
    seen.add(fingerprint);
    byKey.set(key, [...(byKey.get(key) ?? []), entry]);
  });

  if (unreadable.length)
    issues.push({
      level: "warning",
      sheet: sheet.name,
      rows: unreadable,
      message: `${unreadable.length} free time ${unreadable.length === 1 ? "row" : "rows"} couldn't be read (free days or a "Day 15 - Day 17" / "EUR 150 PER DAY" period), so ${unreadable.length === 1 ? "it was" : "they were"} left out.`,
    });

  return { byKey, issues };
};
