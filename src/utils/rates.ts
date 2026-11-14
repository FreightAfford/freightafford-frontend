import moment from "moment";
import {
  CHARGE_STAGES,
  EXPIRING_SOON_DAYS,
  RATE_CONTAINER_SIZES,
  type ChargeStage,
} from "../data/rates";
import type { PortLocation } from "../services/api/location";
import type { Rate, RateCharge, RatePort } from "../services/api/rate";

const ISO = "YYYY-MM-DD";

// A rate's port in the shape the port pickers use, and back again.
export const toPortLocation = (port: RatePort): PortLocation => ({
  code: port.code,
  city: port.city,
  country: port.country,
  countryCode: port.code.slice(0, 2),
  maerskServed: true,
});

export const toRatePort = (loc: PortLocation): RatePort => ({
  code: loc.code,
  city: loc.city,
  country: loc.country,
});

export type RateStatus = "scheduled" | "active" | "expiring" | "expired";

export const RATE_STATUS_LABELS: Record<RateStatus, string> = {
  scheduled: "Scheduled",
  active: "Active",
  expiring: "Expiring soon",
  expired: "Expired",
};

// Never stored: worked out from the dates, both of which are inclusive.
export const rateStatus = (
  rate: Pick<Rate, "validFrom" | "validTo">,
  today = moment().format(ISO),
): RateStatus => {
  if (rate.validFrom > today) return "scheduled";
  if (rate.validTo < today) return "expired";
  const daysLeft = moment(rate.validTo, ISO).diff(moment(today, ISO), "days");
  return daysLeft <= EXPIRING_SOON_DAYS ? "expiring" : "active";
};

// Days left including today: a rate ending today has 1 day left.
export const daysLeft = (validTo: string, today = moment().format(ISO)) =>
  moment(validTo, ISO).diff(moment(today, ISO), "days") + 1;

export const isValidOn = (
  rate: Pick<Rate, "validFrom" | "validTo">,
  day: string,
) => rate.validFrom <= day && day <= rate.validTo;

// Two date ranges share at least one day.
export const overlaps = (
  a: Pick<Rate, "validFrom" | "validTo">,
  b: Pick<Rate, "validFrom" | "validTo">,
) => a.validFrom <= b.validTo && b.validFrom <= a.validTo;

// "USD 2,450" / "NGN 185,000.50"
export const formatAmount = (amount: number, currency: string) =>
  `${currency} ${amount.toLocaleString("en-US", {
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

export type CurrencyTotal = { currency: string; amount: number };

// Sums by currency: USD first, then the others in the order their charges
// appear (freight, origin, destination). Amounts in different currencies
// aren't comparable, so they're never ranked by size.
const sumByCurrency = (charges: RateCharge[]): CurrencyTotal[] => {
  const totals = new Map<string, number>();
  for (const c of charges)
    totals.set(c.currency, (totals.get(c.currency) ?? 0) + c.amount);
  return [...totals]
    .map(([currency, amount]) => ({ currency, amount }))
    .sort(
      (a, b) => Number(b.currency === "USD") - Number(a.currency === "USD"),
    );
};

// What one container costs, and what's added once per document (B/L).
// Currencies are never converted.
export const rateTotals = (charges: RateCharge[]) => ({
  perContainer: sumByCurrency(charges.filter((c) => c.basis === "container")),
  perDocument: sumByCurrency(charges.filter((c) => c.basis === "document")),
});

// Per-container charges count every container; per-document ones are
// billed once for the shipment.
export const chargeQuantity = (charge: RateCharge, containers: number) =>
  charge.basis === "document" ? 1 : containers;

// The whole shipment, one total per currency.
export const shipmentTotals = (charges: RateCharge[], containers: number) =>
  sumByCurrency(
    charges.map((c) => ({
      ...c,
      amount: c.amount * chargeQuantity(c, containers),
    })),
  );

export const formatTotals = (totals: CurrencyTotal[]) =>
  totals.length
    ? totals.map((t) => formatAmount(t.amount, t.currency)).join(" + ")
    : "—";

// Charges in stage order, Freight → Origin → Destination, empty stages left out.
export const chargesByStage = (charges: RateCharge[]) =>
  CHARGE_STAGES.map((stage) => ({
    stage: stage.value as ChargeStage,
    label: stage.label,
    charges: charges.filter((c) => c.stage === stage.value),
  })).filter((group) => group.charges.length > 0);

// 1550 → "64 days 14 hours", as Maersk's "64d 14h" reads in full.
export const formatTransit = (hours?: number) => {
  if (!hours) return "";
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  const parts = [
    days ? `${days} ${days === 1 ? "day" : "days"}` : "",
    rest ? `${rest} ${rest === 1 ? "hour" : "hours"}` : "",
  ];
  return parts.filter(Boolean).join(" ");
};

// Maersk's "64d 14h" → 1550 hours; null when it isn't that shape.
export const parseTransit = (text: string) => {
  const m = text.trim().match(/^(?:(\d+)\s*d)?\s*(?:(\d+)\s*h)?$/i);
  if (!m || (!m[1] && !m[2])) return null;
  return Number(m[1] ?? 0) * 24 + Number(m[2] ?? 0);
};

// Sizes in the order the freight form lists them.
export const sizeOrder = (size: string) =>
  RATE_CONTAINER_SIZES.findIndex((c) => c.value === size);

// "40ft High Cube"
export const rateSizeLabel = (size?: string) => {
  const s = RATE_CONTAINER_SIZES.find((c) => c.value === size);
  return s ? `${s.size} ${s.kind}` : (size ?? "");
};

// "1 Nov – 30 Nov 2026", dropping the first year when both share it.
export const formatValidity = (validFrom: string, validTo: string) => {
  const from = moment(validFrom, ISO);
  const to = moment(validTo, ISO);
  return `${from.format(from.year() === to.year() ? "D MMM" : "D MMM YYYY")} – ${to.format("D MMM YYYY")}`;
};

// "Shanghai, China"
export const portLabel = (port: { city: string; country: string }) =>
  `${port.city}, ${port.country}`;
