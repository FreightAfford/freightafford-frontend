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

export const containerSchema = z
  .object({
    containers: z.array(
      z.object({
        number: z
          .string()
          .min(1, "Required")
          .regex(/^[A-Z]{4}\d{7}$/, "Invalid format (e.g. ABCD1234567)"),
      }),
    ),
  })
  .superRefine((data, ctx) => {
    const numbers = data.containers.map((c) => c.number.toUpperCase());
    numbers.forEach((num, index) => {
      if (num !== "" && numbers.indexOf(num) !== index)
        ctx.addIssue({
          code: "custom",
          message: "Duplicate container number",
          path: ["containers", index, "number"],
        });
    });
  });

export type ContainerFormData = z.infer<typeof containerSchema>;
