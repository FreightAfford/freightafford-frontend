import { z } from "zod";

export const uploadInvoiceSchema = z.object({
  dueDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), "Invalid date format"),
  description: z
    .string()
    .min(5, "Description is too short")
    .max(500, "Description is too long"),
  invoice: z
    .instanceof(FileList)
    .refine(
      (files) => files.length === 1 && files[0].size <= 5 * 1024 * 1024,
      "Max file size is 5MB",
    ),
});

export const submitPaymentProofSchema = z.object({
  paymentReference: z.string().min(3, "Payment reference is required"),
  file: z
    .instanceof(FileList)
    .refine(
      (files) => files.length === 1 && files[0].size <= 5 * 1024 * 1024,
      "Max file size is 5MB",
    )
    .optional(),
});

export type UploadInvoiceFormValues = z.infer<typeof uploadInvoiceSchema>;
export type submitPaymentFormValues = z.infer<typeof submitPaymentProofSchema>;
