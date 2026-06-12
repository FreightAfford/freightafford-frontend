import { z } from "zod";

export const uploadBLSchema = z.object({
  type: z.enum(
    [
      "house",
      "master",
      "release_order",
      "booking_confirmation",
      "draft_bill_of_lading",
      "original_bill_of_lading",
    ],
    "Select a valid document type",
  ),
  status: z.enum(["drafted", "finalized"], "Select a valid status"),
  file: z
    .instanceof(FileList)
    .refine(
      (files) => files.length === 1 && files[0].size <= 5 * 1024 * 1024,
      "Max file size is 5MB",
    ),
});

export type UploadBLValues = z.infer<typeof uploadBLSchema>;
