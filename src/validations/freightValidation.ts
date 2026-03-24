import { z } from "zod";

export const freightRequestSchema = z.object({
  originPort: z.string().min(2, "Origin port is required"),
  destinationPort: z.string().min(2, "Destination port is required"),
  commodity: z.string().min(2, "Commodity is required"),
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
    "Input your container size",
  ),
  containerQuantity: z
    .number("Add container quantity")
    .int("Container quantity must be a whole number")
    .positive("Container quantity must be at least 1"),
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

export type FreightRequestFormValues = z.infer<typeof freightRequestSchema>;
export type CounterFreightFormValues = z.infer<typeof counterFreightSchema>;
