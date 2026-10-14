// Small display helpers shared across pages.

export const initials = (name?: string) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

export const money = (value?: number) =>
  typeof value === "number"
    ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : "—";

// Container sizes in full: "40ft HC" → "40ft High Cube", "20ft Std" → "20ft Standard".
export const containerSizeLabel = (size?: string) =>
  (size ?? "")
    .replace(/\bstd\b/i, "Standard")
    .replace(/\bhc\b/i, "High Cube")
    .replace(/^(\d+)FT\b/i, "$1ft");

// "2 × 40ft High Cube"
export const containersLabel = (quantity?: number, size?: string) =>
  `${quantity ?? 0} × ${containerSizeLabel(size)}`;
