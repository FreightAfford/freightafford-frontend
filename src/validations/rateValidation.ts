import { z } from "zod";
import {
  CHARGE_BASES,
  CHARGE_STAGES,
  PAY_TERMS,
  RATE_CONTAINER_VALUES,
  RATE_CURRENCIES,
} from "../data/rates";
import type { Rate, RateInput, RatePort } from "../services/api/rate";
import { formatTransit, parseTransit } from "../utils/rates";

const values = <T extends { value: string }>(list: readonly T[]) =>
  list.map((item) => item.value) as [T["value"], ...T["value"][]];

export type RateCommodityValue = { code: string; name: string };

// Only set by picking from the Maersk port search.
const port = (message: string) =>
  z
    .object({ code: z.string(), city: z.string(), country: z.string() })
    .nullable()
    .refine((p): p is RatePort => p !== null, message);

const currency = z.enum(RATE_CURRENCIES, "Choose a currency");

const amount = z
  .number("Add an amount")
  .min(0, "Amount can't be negative")
  .max(10_000_000, "That amount looks too large");

const chargeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1, "Add a code")
    .max(6, "Codes are up to 6 characters")
    .regex(/^[A-Za-z0-9]+$/, "Letters and numbers only"),
  name: z.string().trim().min(2, "Add the charge name").max(80, "Too long"),
  amount,
  currency,
  basis: z.enum(values(CHARGE_BASES)),
  stage: z.enum(values(CHARGE_STAGES)),
  payTerm: z.enum(values(PAY_TERMS)),
  floating: z.boolean(),
});

const wholeDay = (message: string) =>
  z.number(message).int("Whole days only").min(1, "Day 1 or later");

const tierSchema = z
  .object({
    fromDay: wholeDay("Add the first day"),
    // Empty for the last, open-ended step.
    toDay: wholeDay("Add the last day").optional(),
    amount,
    currency,
  })
  .refine((t) => t.toDay === undefined || t.toDay >= t.fromDay, {
    message: "Ends before it starts",
    path: ["toDay"],
  });

const freeTimeSchema = z.object({
  type: z.string().trim().min(2, "Add the type"),
  days: z
    .number("Add the free days")
    .int("Whole days only")
    .min(0, "Can't be negative"),
  dayType: z.string().trim().min(2, "Add the day type"),
  startEvent: z.string().trim().min(2, "Add when it starts"),
  endEvent: z.string().trim().min(2, "Add when it ends"),
  note: z.string().trim().max(200, "Too long"),
  tiers: z.array(tierSchema),
});

export const rateFormSchema = z
  .object({
    origin: port("Choose an origin port from the search results"),
    destination: port("Choose a destination port from the search results"),
    containerSize: z.enum(RATE_CONTAINER_VALUES, "Choose a container size"),
    validFrom: z.string().min(1, "Choose the first day"),
    validTo: z.string().min(1, "Choose the last day"),
    // Picked from the Maersk commodity search. A rate saved before it had
    // a code keeps its name with an empty code.
    commodity: z
      .object({ code: z.string(), name: z.string() })
      .nullable()
      .refine(
        (c): c is RateCommodityValue => c !== null,
        "Choose a commodity from the search results",
      ),
    serviceMode: z.string().trim().max(20, "Too long"),
    // Maersk writes "59d 8h".
    transit: z
      .string()
      .trim()
      .refine((t) => !t || parseTransit(t) !== null, 'Write it as "59d 8h"'),
    remarks: z.string().trim().max(500, "Too long"),
    charges: z.array(chargeSchema).min(1, "Add at least one charge"),
    freeTime: z.array(freeTimeSchema),
  })
  .refine(
    (d) => !d.origin || !d.destination || d.origin.code !== d.destination.code,
    {
      message: "Origin and destination must be different ports",
      path: ["destination"],
    },
  )
  .refine((d) => !d.validFrom || !d.validTo || d.validTo >= d.validFrom, {
    message: "Ends before it starts",
    path: ["validTo"],
  });

// What the form holds while it's being filled in: ports can be empty, and
// the size is unset until one is picked.
export type RateFormValues = Omit<
  z.input<typeof rateFormSchema>,
  "origin" | "destination" | "containerSize" | "commodity"
> & {
  origin: RatePort | null;
  destination: RatePort | null;
  commodity: RateCommodityValue | null;
  containerSize?: z.input<typeof rateFormSchema>["containerSize"];
};
export type RateFormOutput = z.output<typeof rateFormSchema>;
export type ChargeFormValues = RateFormValues["charges"][number];
export type FreeTimeFormValues = RateFormValues["freeTime"][number];

export const EMPTY_RATE_FORM: RateFormValues = {
  origin: null,
  destination: null,
  containerSize: undefined,
  validFrom: "",
  validTo: "",
  commodity: null,
  serviceMode: "CY/CY",
  transit: "",
  remarks: "",
  charges: [],
  freeTime: [],
};

// A saved rate, back into the form's shape.
export const rateToForm = (rate: Rate): RateFormValues => ({
  origin: rate.origin,
  destination: rate.destination,
  containerSize: rate.containerSize,
  validFrom: rate.validFrom,
  validTo: rate.validTo,
  commodity: { code: rate.commodityCode ?? "", name: rate.commodity },
  serviceMode: rate.serviceMode ?? "",
  transit: rate.transitHours
    ? formatTransit(rate.transitHours)
        .replace(/ days?/, "d")
        .replace(/ hours?/, "h")
    : "",
  remarks: rate.remarks ?? "",
  charges: rate.charges.map((c) => ({
    code: c.code,
    name: c.name,
    amount: c.amount,
    currency: c.currency as ChargeFormValues["currency"],
    basis: c.basis,
    stage: c.stage,
    payTerm: c.payTerm,
    floating: c.structure === "floating",
  })),
  freeTime: (rate.freeTime ?? []).map((f) => ({
    type: f.type,
    days: f.days,
    dayType: f.dayType,
    startEvent: f.startEvent,
    endEvent: f.endEvent,
    note: f.note ?? "",
    tiers: f.tiers.map((t) => ({
      ...t,
      currency: t.currency as ChargeFormValues["currency"],
    })),
  })),
});

const optional = (text: string) => text || undefined;

// The checked form, in the shape the API takes.
export const formToRateInput = (data: RateFormOutput): RateInput => ({
  origin: data.origin,
  destination: data.destination,
  containerSize: data.containerSize,
  validFrom: data.validFrom,
  validTo: data.validTo,
  commodity: data.commodity.name,
  commodityCode: optional(data.commodity.code),
  serviceMode: optional(data.serviceMode),
  transitHours: data.transit
    ? (parseTransit(data.transit) ?? undefined)
    : undefined,
  remarks: optional(data.remarks),
  charges: data.charges.map(({ floating, ...c }) => ({
    ...c,
    code: c.code.toUpperCase(),
    structure: floating ? "floating" : "fixed",
  })),
  freeTime: data.freeTime.map(({ note, ...f }) => ({
    ...f,
    note: optional(note),
  })),
});
