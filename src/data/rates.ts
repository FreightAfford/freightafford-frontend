// Reference lists for contract rates, modelled on Maersk's contract quote
// export (QuoteOutput sheet): the container sizes we price, the charges a
// rate is made of, how each is billed and paid, and the currencies.

// The same four sizes as the freight request form, so a rate maps straight
// onto a request. Maersk's equipment codes are kept for the import.
export const RATE_CONTAINER_SIZES = [
  { value: "20ft Std", size: "20ft", kind: "Standard", maersk: "20DRY" },
  { value: "40ft Std", size: "40ft", kind: "Standard", maersk: "40DRY" },
  { value: "40ft HC", size: "40ft", kind: "High Cube", maersk: "40HDRY" },
  { value: "45ft HC", size: "45ft", kind: "High Cube", maersk: "45HDRY" },
] as const;

export type RateContainerSize = (typeof RATE_CONTAINER_SIZES)[number]["value"];

export const RATE_CONTAINER_VALUES = RATE_CONTAINER_SIZES.map(
  (c) => c.value,
) as [RateContainerSize, ...RateContainerSize[]];

// Maersk's "Charge Type".
export const CHARGE_STAGES = [
  { value: "freight", label: "Freight charges" },
  { value: "origin", label: "Origin charges" },
  { value: "destination", label: "Destination charges" },
] as const;

export type ChargeStage = (typeof CHARGE_STAGES)[number]["value"];

// Maersk's "Rate Basis": PER_CONTAINER or PER_DOCUMENT (the bill of lading).
export const CHARGE_BASES = [
  { value: "container", label: "Container" },
  { value: "document", label: "Document" },
] as const;

export type ChargeBasis = (typeof CHARGE_BASES)[number]["value"];

// Maersk's "Country PayTerm": who pays, and where.
export const PAY_TERMS = [
  { value: "prepaid", label: "Prepaid" },
  { value: "collect", label: "Collect" },
  { value: "either", label: "Prepaid or collect" },
] as const;

export type PayTerm = (typeof PAY_TERMS)[number]["value"];

// Maersk's "Rate structure": a floating charge can change before shipment
// (bunker, congestion…); a fixed one can't.
export type RateStructure = "fixed" | "floating";

// The charges on Maersk contract quotes, by Maersk's code. Picking one fills
// in its name, stage and basis; anything else is "Other".
export const CHARGE_PRESETS: {
  code: string;
  name: string;
  stage: ChargeStage;
  basis: ChargeBasis;
}[] = [
  // Freight
  {
    code: "BAS",
    name: "Basic Ocean Freight",
    stage: "freight",
    basis: "container",
  },
  {
    code: "CFD",
    name: "Congestion Fee Destination",
    stage: "freight",
    basis: "container",
  },
  {
    code: "CFO",
    name: "Congestion Fee Origin",
    stage: "freight",
    basis: "container",
  },
  {
    code: "EBS",
    name: "Emergency Bunker Surcharge",
    stage: "freight",
    basis: "container",
  },
  {
    code: "ERS",
    name: "Emergency Risk Surcharge",
    stage: "freight",
    basis: "container",
  },
  {
    code: "ESS",
    name: "Emission Surcharge",
    stage: "freight",
    basis: "container",
  },
  {
    code: "PSS",
    name: "Peak Season Surcharge",
    stage: "freight",
    basis: "container",
  },
  {
    code: "VP1",
    name: "Value Protect Starter",
    stage: "freight",
    basis: "container",
  },
  // Origin
  { code: "EXP", name: "Export Service", stage: "origin", basis: "container" },
  {
    code: "EHE",
    name: "Equipment Handling Export",
    stage: "origin",
    basis: "container",
  },
  {
    code: "PSE",
    name: "Port Security Service Export",
    stage: "origin",
    basis: "container",
  },
  {
    code: "PAE",
    name: "Port Additionals / Port Dues Export",
    stage: "origin",
    basis: "container",
  },
  {
    code: "ODF",
    name: "Documentation Fee Origin",
    stage: "origin",
    basis: "document",
  },
  {
    code: "OCG",
    name: "Origin Certificate Charge",
    stage: "origin",
    basis: "document",
  },
  {
    code: "DSE",
    name: "Document Stamp Tax Export",
    stage: "origin",
    basis: "document",
  },
  {
    code: "GTE",
    name: "Government and Port Tax Export",
    stage: "origin",
    basis: "document",
  },
  // Destination
  {
    code: "DHC",
    name: "Terminal Handling Service - Destination",
    stage: "destination",
    basis: "container",
  },
  {
    code: "CP1",
    name: "Container Protect Essential",
    stage: "destination",
    basis: "container",
  },
  {
    code: "EHI",
    name: "Equipment Handling Import",
    stage: "destination",
    basis: "container",
  },
  {
    code: "IMP",
    name: "Import Service",
    stage: "destination",
    basis: "container",
  },
  {
    code: "FDH",
    name: "Discharge Fee - Destination",
    stage: "destination",
    basis: "container",
  },
  {
    code: "FRO",
    name: "Free Out Service",
    stage: "destination",
    basis: "container",
  },
  {
    code: "PAI",
    name: "Port Additionals / Port Dues Import",
    stage: "destination",
    basis: "container",
  },
  {
    code: "DDF",
    name: "Documentation Fee - Destination",
    stage: "destination",
    basis: "document",
  },
  {
    code: "CAI",
    name: "Customs Additional Item Charge - Import",
    stage: "destination",
    basis: "document",
  },
];

export const chargePreset = (code?: string) =>
  CHARGE_PRESETS.find((p) => p.code === code?.toUpperCase());

export const RATE_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "NGN",
  "XOF",
  "EGP",
] as const;

// How close to its end date a rate counts as "expiring soon".
export const EXPIRING_SOON_DAYS = 7;
