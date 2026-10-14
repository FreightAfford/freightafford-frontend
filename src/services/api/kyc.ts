import type { AccountType, KycApplication, KycDocument } from "../../types/kyc";
import { checkKycFile } from "../../validations/kycValidation";

// MOCK: the backend has no KYC endpoints yet. These functions keep the shape
// the real API will have (resolve with `{ message, data }`, reject with
// `{ message }` like services/api/auth.ts), so swapping each body for an
// apiClient call won't change the hooks or screens. Data lives in this
// browser's localStorage only.

const STORAGE_KEY = "freightafford:kyc-mock";

// Object URLs for previews only live as long as the page, so they are kept
// in memory rather than stored.
const previews = new Map<string, string>();

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const emptyApplication = (
  accountType: AccountType = "export_agent",
): KycApplication => ({
  status: "not_started",
  accountType,
  business: {
    legalName: "",
    cacType: "RC",
    cacNumber: "",
    cacCertificate: null,
    tin: "",
    tinCertificate: null,
    nepcNumber: "",
    nepcExpiry: "",
    nepcCertificate: null,
    address: { street: "", city: "", state: "", proofOfAddress: null },
  },
  directors: [],
  authorisation: { letter: null, signedBy: "", issuedOn: "" },
  reviewNotes: {},
  updatedAt: new Date().toISOString(),
});

export const readMockApplication = (): KycApplication => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    // Filled over the empty shape, so data saved by an older version of
    // this mock still has every field.
    if (raw) return { ...emptyApplication(), ...JSON.parse(raw) };
  } catch {
    // Storage blocked or corrupt: start over.
  }
  return emptyApplication();
};

export const writeMockApplication = (application: KycApplication) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(application));
  } catch {
    // Storage blocked: the change lasts until the page reloads.
  }
};

// Put back any previews still available in this page session.
const withPreviews = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(withPreviews);
  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(([key, item]) => [
      key,
      withPreviews(item),
    ]);
    const result = Object.fromEntries(entries);
    if ("uploadedAt" in result && "mimeType" in result) {
      const previewUrl = previews.get(result.id as string);
      return previewUrl ? { ...result, previewUrl } : result;
    }
    return result;
  }
  return value;
};

const withoutPreviews = (application: KycApplication) =>
  JSON.parse(
    JSON.stringify(application, (key, item) =>
      key === "previewUrl" ? undefined : item,
    ),
  ) as KycApplication;

export const getKycApi = async () => {
  await wait(300);
  return { data: withPreviews(readMockApplication()) as KycApplication };
};

export type KycDraft = Partial<
  Pick<
    KycApplication,
    "accountType" | "business" | "directors" | "authorisation"
  >
>;

export const saveKycDraftApi = async (draft: KycDraft) => {
  await wait(400);
  const current = readMockApplication();
  if (current.status === "submitted" || current.status === "in_review")
    throw { message: "Your details are being reviewed and can't be changed." };

  const next: KycApplication = withoutPreviews({
    ...current,
    ...draft,
    status: current.status === "not_started" ? "draft" : current.status,
    updatedAt: new Date().toISOString(),
  });
  writeMockApplication(next);
  return {
    message: "Progress saved",
    data: withPreviews(next) as KycApplication,
  };
};

export const uploadKycDocumentApi = async ({
  file,
  onProgress,
}: {
  file: File;
  onProgress?: (percent: number) => void;
}) => {
  const problem = checkKycFile(file);
  if (problem) throw { message: problem };

  // Roughly 1.5s per 5 MB, never under half a second.
  const steps = 10;
  const stepTime = Math.max(50, (file.size / (5 * 1024 * 1024)) * 150);
  for (let step = 1; step <= steps; step++) {
    await wait(stepTime);
    onProgress?.(Math.round((step / steps) * 100));
  }

  const document: KycDocument = {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    mimeType: file.type,
    uploadedAt: new Date().toISOString(),
  };
  const previewUrl = URL.createObjectURL(file);
  previews.set(document.id, previewUrl);

  return { message: "Document uploaded", data: { ...document, previewUrl } };
};

export const removeKycDocumentApi = async (documentId: string) => {
  await wait(200);
  const previewUrl = previews.get(documentId);
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previews.delete(documentId);
  return { message: "Document removed" };
};

export const submitKycApi = async () => {
  await wait(700);
  const current = readMockApplication();
  if (!current.authorisation?.letter)
    throw {
      message: "Upload your company's letter of authority before submitting.",
    };

  const next: KycApplication = {
    ...current,
    status: "submitted",
    declarationAcceptedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    reviewNotes: {},
    rejectionReason: undefined,
    updatedAt: new Date().toISOString(),
  };
  writeMockApplication(next);
  return {
    message: "Verification submitted. We'll email you when it's reviewed.",
    data: withPreviews(next) as KycApplication,
  };
};

/** Mock only: clears the stored application so the flow can be tried again. */
export const resetKycMock = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored.
  }
  previews.forEach((url) => URL.revokeObjectURL(url));
  previews.clear();
};

/**
 * Mock only: jump to any status, so the dashboard banner, Overview card and
 * booking gate can be reviewed before the admin review screens exist.
 */
export const setKycMockStatus = (status: KycApplication["status"]) => {
  const current = readMockApplication();
  writeMockApplication({
    ...current,
    status,
    submittedAt:
      status === "draft" || status === "not_started"
        ? undefined
        : (current.submittedAt ?? new Date().toISOString()),
    reviewNotes:
      status === "changes_requested"
        ? {
            "business.address.proofOfAddress":
              "The utility bill is older than 3 months. Upload a recent one.",
          }
        : {},
    updatedAt: new Date().toISOString(),
  });
};
