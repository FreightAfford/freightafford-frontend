import { z } from "zod";

// UN/LOCODE, e.g. NGLOS, CNSHA — only set by picking from the Maersk port search
const portCode = (label: string) =>
  z
    .string(`Choose ${label} port from the search results`)
    .regex(
      /^[A-Z]{2}[A-Z2-9]{3}$/,
      `Choose ${label} port from the search results`,
    );

export const freightRequestSchema = z
  .object({
    originPortCode: portCode("an origin"),
    destinationPortCode: portCode("a destination"),
    // Maersk commodity code — only set by picking from the commodity search
    commodityCode: z
      .string("Choose a commodity from the search results")
      .regex(/^\d{6}$/, "Choose a commodity from the search results"),
    cargoWeight: z
      .number("Add cargo weight")
      .positive("Cargo weight must be greater than 0"),
    cargoReadyDate: z.string().min(1, "Cargo ready date is required"),
    proposedPrice: z
      .number("Add proposed price")
      .positive("Proposed price must be greater than 0"),
    notes: z.string().optional(),
    containerSize: z.enum(
      ["20ft Std", "40ft Std", "40ft HC", "45ft HC"],
      "Choose a container size",
    ),
    containerQuantity: z
      .number("Add container quantity")
      .int("Container quantity must be a whole number")
      .positive("Container quantity must be at least 1"),
  })
  .refine((data) => data.originPortCode !== data.destinationPortCode, {
    message: "Origin and destination must be different ports",
    path: ["destinationPortCode"],
  });

export const counterFreightSchema = z.object({
  counterPrice: z
    .number("Counter price is required.")
    .positive("Counter price must be greater than 0"),
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason is too long"),
});

export const rejectFreightSchema = z.object({
  reason: z
    .string()
    .min(10, "Reason must be at least 10 characters")
    .max(500, "Reason is too long"),
});

export type FreightRequestFormValues = z.infer<typeof freightRequestSchema>;
export type CounterFreightFormValues = z.infer<typeof counterFreightSchema>;
export type RejectFreightFormValues = z.infer<typeof rejectFreightSchema>;
