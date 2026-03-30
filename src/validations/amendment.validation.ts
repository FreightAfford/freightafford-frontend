import { z } from "zod";

export const amendmentSchema = z
  .object({
    content: z.string().optional(),
    file: z.instanceof(FileList).optional(),
  })
  .superRefine((data, ctx) => {
    const content = data.content?.trim();
    const hasText = !!content && content.length > 0;
    const hasFile = data.file && data.file.length > 0;

    // ❗ attach error to BOTH fields so UI always catches it
    if (!hasText && !hasFile) {
      ctx.addIssue({
        code: "custom",
        message: "Provide either amendment text or a PDF file",
        path: ["content"],
      });

      ctx.addIssue({
        code: "custom",
        message: "Provide either amendment text or a PDF file",
        path: ["file"],
      });
    }

    if (hasFile) {
      const file = data.file![0];

      if (file.size > 5 * 1024 * 1024) {
        ctx.addIssue({
          code: "custom",
          message: "Max file size is 5MB",
          path: ["file"],
        });
      }

      if (file.type !== "application/pdf") {
        ctx.addIssue({
          code: "custom",
          message: "Only PDF files are allowed",
          path: ["file"],
        });
      }
    }
  });

export type AmendmentFormValues = z.infer<typeof amendmentSchema>;
