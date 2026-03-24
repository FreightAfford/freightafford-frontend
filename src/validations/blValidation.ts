import { z } from "zod";

export const uploadBLSchema = z.object({
  type: z.enum(["house", "master"], "Choose one of the two type option"),
  file: z
    .instanceof(FileList)
    .refine(
      (files) => files.length === 1 && files[0].size <= 5 * 1024 * 1024,
      "Max file size is 5MB",
    ),
});

export type UploadBLValues = z.infer<typeof uploadBLSchema>;
