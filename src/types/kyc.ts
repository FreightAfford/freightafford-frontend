// KYC (know your customer) records. Exporters and export agents go through
// the same checks for now; the account type is kept so the two can diverge.

export type AccountType = "exporter" | "export_agent";

export type KycStatus =
  | "not_started"
  | "draft"
  | "submitted"
  | "in_review"
  | "changes_requested"
  | "approved"
  | "rejected";

// RC: registered company. BN: registered business name.
export type CacType = "RC" | "BN";

export type IdType = "nin" | "passport" | "drivers_licence";

export interface KycDocument {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  // Only set while the file is available to preview in this browser.
  previewUrl?: string;
  uploadedAt: string;
}

export interface BusinessAddress {
  street: string;
  city: string;
  state: string;
  // Utility bill or similar, dated within the last 3 months.
  proofOfAddress: KycDocument | null;
}

export interface BusinessDetails {
  legalName: string;
  cacType: CacType;
  cacNumber: string;
  cacCertificate: KycDocument | null;
  tin: string;
  tinCertificate: KycDocument | null;
  nepcNumber: string;
  nepcExpiry: string;
  nepcCertificate: KycDocument | null;
  address: BusinessAddress;
}

export interface Director {
  id: string;
  fullName: string;
  role: string;
  idType: IdType;
  idNumber: string;
  idExpiry: string;
  idDocument: KycDocument | null;
}

// The company's own letter of authority: on its letterhead, signed by a
// director, allowing the account holder to book shipments for it.
export interface Authorisation {
  letter: KycDocument | null;
  // Name of the director who signed it.
  signedBy: string;
  // The date written on the letter (YYYY-MM-DD).
  issuedOn: string;
}

export interface KycApplication {
  status: KycStatus;
  accountType: AccountType;
  business: BusinessDetails;
  directors: Director[];
  authorisation: Authorisation;
  declarationAcceptedAt?: string;
  // Reviewer notes keyed by field path, e.g. "business.tin" or "directors.0.idDocument".
  reviewNotes: Record<string, string>;
  // Set when our team rejects the application.
  rejectionReason?: string;
  reviewedAt?: string;
  submittedAt?: string;
  updatedAt: string;
}

export const KYC_STEPS = [
  { id: "business", label: "Business" },
  { id: "directors", label: "Directors" },
  { id: "authorisation", label: "Authorisation" },
  { id: "review", label: "Review & submit" },
] as const;

export type KycStepId = (typeof KYC_STEPS)[number]["id"];

export const ID_TYPE_LABELS: Record<IdType, string> = {
  nin: "National ID (NIN)",
  passport: "International passport",
  drivers_licence: "Driver's licence",
};

export const CAC_TYPE_LABELS: Record<CacType, string> = {
  RC: "Registered company (RC)",
  BN: "Business name (BN)",
};
