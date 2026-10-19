// Maersk's 14 container types for the Point to point search, by ISO 6346
// code, in the order Maersk's own schedule search lists them.
// "Shipper-owned" ones are containers the shipper supplies.
export const CONTAINER_TYPES = [
  { code: "22G1", size: "20'", kind: "Dry Standard" },
  { code: "42G1", size: "40'", kind: "Dry Standard" },
  { code: "45G1", size: "40'", kind: "Dry High" },
  { code: "L5G1", size: "45'", kind: "Dry High" },
  { code: "22R1", size: "20'", kind: "Reefer Standard" },
  { code: "45R1", size: "40'", kind: "Reefer High" },
  { code: "22U1", size: "20'", kind: "Open Top" },
  { code: "42U1", size: "40'", kind: "Open Top" },
  { code: "45U1", size: "40'", kind: "Open Top High" },
  { code: "42P1", size: "40'", kind: "Flat Standard" },
  { code: "45P3", size: "40'", kind: "Flat High" },
  { code: "22P1", size: "20'", kind: "Flat (shipper-owned)" },
  { code: "22T3", size: "20'", kind: "Tank (shipper-owned)" },
  { code: "42T3", size: "40'", kind: "Tank (shipper-owned)" },
] as const;

export const CONTAINER_CODES: readonly string[] = CONTAINER_TYPES.map(
  (c) => c.code,
);

export const CONTAINER_OPTIONS = CONTAINER_TYPES.map((c) => ({
  value: c.code,
  label: `${c.size} ${c.kind}`,
}));

// "45G1" → "40' Dry High"
export const containerLabel = (code?: string | null) => {
  const type = CONTAINER_TYPES.find((c) => c.code === code);
  return type ? `${type.size} ${type.kind}` : (code ?? "");
};
