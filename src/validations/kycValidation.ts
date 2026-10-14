import { z } from "zod";
import { formatFileSize } from "../utils/helpers";
import { isNigerianPhone } from "../utils/phone";

// Shared field rules for KYC. The per-step form schemas build on these.

export const KYC_FILE_TYPES = {
  "application/pdf": "PDF",
  "image/jpeg": "JPG",
  "image/png": "PNG",
} as const;

export const KYC_MAX_FILE_SIZE = 5 * 1024 * 1024;

export const KYC_FILE_ACCEPT = Object.keys(KYC_FILE_TYPES).join(",");

/** A plain-language reason the file can't be used, or null if it's fine. */
export const checkKycFile = (
  file: File,
  maxSize: number = KYC_MAX_FILE_SIZE,
): string | null => {
  if (!(file.type in KYC_FILE_TYPES))
    return `${file.name} isn't a PDF, JPG or PNG. Upload one of those instead.`;
  if (file.size > maxSize)
    return `This file is ${formatFileSize(file.size)}. Upload one under ${formatFileSize(maxSize).replace(".00", "")}.`;
  return null;
};

export const kycDocumentSchema = z.object(
  {
    id: z.string(),
    name: z.string(),
    size: z.number(),
    mimeType: z.string(),
    previewUrl: z.string().optional(),
    uploadedAt: z.string(),
  },
  { error: "Upload this document" },
);

const strip = (value: string) => value.replace(/[\s-]/g, "").toUpperCase();

// CAC numbers are digits; people often type them with the RC/BN prefix.
export const cacNumberSchema = z
  .string()
  .trim()
  .min(1, "Enter the CAC registration number")
  .transform((value) => strip(value).replace(/^(RC|BN)/, ""))
  .refine((value) => /^\d{4,8}$/.test(value), {
    message: "Enter the number on the CAC certificate, e.g. RC 1234567",
  });

// FIRS TINs look like 12345678-0001; Joint Tax Board TINs are 10 digits.
export const tinSchema = z
  .string()
  .trim()
  .min(1, "Enter the tax identification number")
  .refine(
    (value) => /^\d{8}-?\d{4}$/.test(value) || /^\d{10}$/.test(strip(value)),
    { message: "Enter a TIN like 12345678-0001, or a 10-digit JTB TIN" },
  );

export const ninSchema = z
  .string()
  .trim()
  .refine((value) => /^\d{11}$/.test(value.replace(/\s/g, "")), {
    message: "A NIN is 11 digits",
  });

export const nigerianPhoneSchema = z
  .string()
  .trim()
  .min(1, "Enter a phone number")
  .refine(isNigerianPhone, {
    message: "Enter a Nigerian number, e.g. 0803 123 4567",
  });

// Dates come from <input type="date"> as YYYY-MM-DD.
export const futureDateSchema = (label: string) =>
  z
    .string()
    .min(1, `Enter the ${label}`)
    .refine((value) => new Date(value) > new Date(), {
      message: `The ${label} has passed. Upload a current document.`,
    });

// ---- Per-step form schemas ----

const requiredDocument = (message: string) =>
  kycDocumentSchema.nullable().refine((value) => value !== null, { message });

const text = (min: number, message: string) =>
  z.string().trim().min(min, message);

export const businessStepSchema = z
  .object({
    legalName: text(
      2,
      "Enter the name exactly as it is on the CAC certificate",
    ),
    cacType: z.enum(["RC", "BN"]),
    cacNumber: cacNumberSchema,
    cacCertificate: requiredDocument("Upload the CAC certificate"),
    // Optional: not every business has a TIN. If one is given, it must be
    // valid and come with its certificate.
    tin: z
      .string()
      .trim()
      .refine((value) => !value || tinSchema.safeParse(value).success, {
        message: "Enter a TIN like 12345678-0001, or a 10-digit JTB TIN",
      }),
    tinCertificate: kycDocumentSchema.nullable(),
    nepcNumber: text(1, "Enter the NEPC registration number"),
    nepcExpiry: futureDateSchema("NEPC certificate's expiry date"),
    nepcCertificate: requiredDocument("Upload the NEPC certificate"),
    address: z.object({
      street: text(5, "Enter the street address"),
      city: text(2, "Enter the city or town"),
      state: z.string().min(1, "Choose a state"),
      proofOfAddress: requiredDocument("Upload a recent utility bill"),
    }),
  })
  .superRefine((business, ctx) => {
    if (business.tin && !business.tinCertificate)
      ctx.addIssue({
        code: "custom",
        path: ["tinCertificate"],
        message: "Upload the TIN certificate, or clear the TIN",
      });
  });

const directorSchema = z
  .object({
    id: z.string(),
    fullName: text(2, "Enter their full name, as on their ID"),
    role: text(2, "Enter their role, e.g. Managing Director"),
    idType: z.enum(["nin", "passport", "drivers_licence"]),
    idNumber: text(1, "Enter the ID number"),
    // NIN slips don't expire; passports and licences do.
    idExpiry: z.string(),
    idDocument: requiredDocument("Upload a copy of the ID"),
  })
  .superRefine((director, ctx) => {
    const number = director.idNumber.replace(/\s/g, "").toUpperCase();
    if (director.idType === "nin" && number && !/^\d{11}$/.test(number))
      ctx.addIssue({
        code: "custom",
        path: ["idNumber"],
        message: "A NIN is 11 digits",
      });
    if (
      director.idType === "passport" &&
      number &&
      !/^[A-Z]\d{8}$/.test(number)
    )
      ctx.addIssue({
        code: "custom",
        path: ["idNumber"],
        message:
          "A Nigerian passport number is a letter and 8 digits, e.g. A12345678",
      });
    if (director.idType !== "nin") {
      if (!director.idExpiry)
        ctx.addIssue({
          code: "custom",
          path: ["idExpiry"],
          message: "Enter the ID's expiry date",
        });
      else if (new Date(director.idExpiry) <= new Date())
        ctx.addIssue({
          code: "custom",
          path: ["idExpiry"],
          message: "This ID has expired. Use a current one.",
        });
    }
  });

export const directorsStepSchema = z.object({
  directors: z
    .array(directorSchema)
    .min(1, "Add at least one director or owner"),
});

export const authorisationStepSchema = z.object({
  letter: requiredDocument("Upload the letter of authority"),
  signedBy: z.string().min(1, "Choose the director who signed it"),
  issuedOn: z
    .string()
    .min(1, "Enter the date on the letter")
    .refine((value) => new Date(value) <= new Date(), {
      message: "The date on the letter can't be in the future",
    }),
});

export const declarationSchema = z.object({
  declaration: z.boolean().refine((value) => value, {
    message: "Confirm the declaration to submit",
  }),
});

export type BusinessStepInput = z.input<typeof businessStepSchema>;
export type BusinessStepValues = z.output<typeof businessStepSchema>;
export type DirectorsStepInput = z.input<typeof directorsStepSchema>;
export type DirectorsStepValues = z.output<typeof directorsStepSchema>;
export type AuthorisationStepInput = z.input<typeof authorisationStepSchema>;
export type AuthorisationStepValues = z.output<typeof authorisationStepSchema>;
