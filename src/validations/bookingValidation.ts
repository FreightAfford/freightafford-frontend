import { z } from "zod";

export const updateShippingSchema = z.object({
  shippingLine: z.string().min(1, "Shipping line is required"),
  vessel: z.string().min(1, "Vessel is required"),
  sailingDate: z.string().min(1, "Sailing date is required"),
  carrierBookingNumber: z.string().min(1, "Carrier booking number is required"),
});

export type UpdateBookingShippingFormValues = z.infer<
  typeof updateShippingSchema
>;

export const updateStatusSchema = z.object({
  status: z.enum([
    "awaiting_confirmation",
    "confirmed",
    "in_transit",
    "arrived",
    "delivered",
    "cancelled",
  ]),
});

export type UpdateStatusFormValues = z.infer<typeof updateStatusSchema>;
