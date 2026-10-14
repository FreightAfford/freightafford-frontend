import type { KycApplication, KycDocument, KycStatus } from "../../types/kyc";
import { readMockApplication, writeMockApplication } from "./kyc";

// MOCK: the admin side of KYC. Same promise shapes the real endpoints will
// have. The queue holds a few sample businesses plus, once submitted, the
// application filled in on this browser (id "your-application"), so a
// decision here shows up on the customer's screens.

export interface KycReviewItem extends KycApplication {
  id: string;
  applicant: { fullname: string; email: string };
}

export type KycDecision =
  | { id: string; decision: "approve" }
  | { id: string; decision: "changes"; notes: Record<string, string> }
  | { id: string; decision: "reject"; reason: string };

const SAMPLES_KEY = "freightafford:kyc-admin-mock";
export const OWN_APPLICATION_ID = "your-application";

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 3_600_000).toISOString();
const doc = (name: string, size = 420_000): KycDocument => ({
  id: crypto.randomUUID(),
  name,
  size,
  mimeType: "application/pdf",
  uploadedAt: hoursAgo(30),
});

const sample = (
  id: string,
  status: KycStatus,
  submittedHoursAgo: number,
  applicant: KycReviewItem["applicant"],
  business: {
    name: string;
    cac: string;
    cacType?: "RC" | "BN";
    tin?: string;
    city: string;
    state: string;
    street: string;
  },
  director: { name: string; role: string },
  accountType: KycApplication["accountType"] = "export_agent",
  extra: Partial<KycApplication> = {},
): KycReviewItem => ({
  id,
  applicant,
  status,
  accountType,
  business: {
    legalName: business.name,
    cacType: business.cacType ?? "RC",
    cacNumber: business.cac,
    cacCertificate: doc(`cac-certificate-${business.cac}.pdf`),
    tin: business.tin ?? "",
    tinCertificate: business.tin ? doc("tin-certificate.pdf") : null,
    nepcNumber: `NEPC/${business.state.slice(0, 3).toUpperCase()}/2025/${business.cac.slice(-5)}`,
    nepcExpiry: "2027-09-30",
    nepcCertificate: doc("nepc-certificate.pdf"),
    address: {
      street: business.street,
      city: business.city,
      state: business.state,
      proofOfAddress: doc("utility-bill.pdf", 180_000),
    },
  },
  directors: [
    {
      id: crypto.randomUUID(),
      fullName: director.name,
      role: director.role,
      idType: "nin",
      idNumber: "2" + business.cac.padStart(10, "4"),
      idExpiry: "",
      idDocument: doc("nin-slip.jpg", 260_000),
    },
  ],
  authorisation: {
    letter: doc("letter-of-authority.pdf"),
    signedBy: director.name,
    issuedOn: hoursAgo(24 * 9).slice(0, 10),
  },
  reviewNotes: {},
  submittedAt: hoursAgo(submittedHoursAgo),
  updatedAt: hoursAgo(submittedHoursAgo),
  ...extra,
});

const seed = (): KycReviewItem[] => [
  sample(
    "kyc-1042",
    "submitted",
    3,
    { fullname: "Chinedu Okonkwo", email: "chinedu@okonkwofreight.ng" },
    {
      name: "Okonkwo Freight Agencies Ltd",
      cac: "1873405",
      tin: "23104587-0001",
      street: "22 Creek Road, Apapa",
      city: "Lagos",
      state: "Lagos",
    },
    { name: "Chinedu Okonkwo", role: "Managing Director" },
  ),
  sample(
    "kyc-1039",
    "submitted",
    20,
    { fullname: "Aisha Bello", email: "aisha@sahelsesame.com" },
    {
      name: "Sahel Sesame Exports Ltd",
      cac: "1520981",
      street: "7 Zoo Road",
      city: "Kano",
      state: "Kano",
    },
    { name: "Aisha Bello", role: "Director" },
    "exporter",
  ),
  sample(
    "kyc-1031",
    "in_review",
    50,
    { fullname: "Tunde Adeyemi", email: "tunde@ogbacashew.ng" },
    {
      name: "Ogba Cashew Processors Ltd",
      cac: "1298774",
      tin: "19873310-0001",
      street: "4 Olowu Street, Ikeja",
      city: "Lagos",
      state: "Lagos",
    },
    { name: "Tunde Adeyemi", role: "Chief Executive Officer" },
    "exporter",
  ),
  sample(
    "kyc-1017",
    "changes_requested",
    120,
    { fullname: "Ngozi Eze", email: "ngozi@riversgateway.com" },
    {
      name: "Rivers Gateway Logistics",
      cac: "3301284",
      cacType: "BN",
      street: "15 Trans-Amadi Road",
      city: "Port Harcourt",
      state: "Rivers",
    },
    { name: "Ngozi Eze", role: "Owner" },
    "export_agent",
    {
      reviewNotes: {
        "business.address.proofOfAddress":
          "The bill is from March. Upload one from the last 3 months.",
      },
      reviewedAt: hoursAgo(96),
    },
  ),
  sample(
    "kyc-1008",
    "approved",
    240,
    { fullname: "Emeka Obi", email: "emeka@deltacocoa.com" },
    {
      name: "Delta Cocoa Ltd",
      cac: "1104552",
      tin: "15520981-0001",
      street: "3 Nnebisi Road",
      city: "Asaba",
      state: "Delta",
    },
    { name: "Emeka Obi", role: "Managing Director" },
    "exporter",
    { reviewedAt: hoursAgo(200) },
  ),
];

const readSamples = (): KycReviewItem[] => {
  try {
    const raw = localStorage.getItem(SAMPLES_KEY);
    if (raw) return JSON.parse(raw) as KycReviewItem[];
  } catch {
    // Fall through and re-seed.
  }
  const samples = seed();
  writeSamples(samples);
  return samples;
};

const writeSamples = (samples: KycReviewItem[]) => {
  try {
    localStorage.setItem(SAMPLES_KEY, JSON.stringify(samples));
  } catch {
    // Storage blocked: changes last until reload.
  }
};

// This browser's own application joins the queue once it's been submitted.
const ownApplication = (): KycReviewItem | null => {
  const application = readMockApplication();
  if (application.status === "not_started" || application.status === "draft")
    return null;
  const signer = application.directors[0]?.fullName || "You";
  return {
    ...application,
    id: OWN_APPLICATION_ID,
    applicant: { fullname: signer, email: "your account" },
  };
};

const allApplications = () => {
  const own = ownApplication();
  return [...(own ? [own] : []), ...readSamples()];
};

const save = (item: KycReviewItem) => {
  if (item.id === OWN_APPLICATION_ID) {
    const application: Partial<KycReviewItem> = { ...item };
    delete application.id;
    delete application.applicant;
    writeMockApplication(application as KycApplication);
    return;
  }
  writeSamples(
    readSamples().map((sampleItem) =>
      sampleItem.id === item.id ? item : sampleItem,
    ),
  );
};

export type KycQueue =
  | "awaiting"
  | "changes_requested"
  | "approved"
  | "rejected";

const QUEUES: Record<KycQueue, KycStatus[]> = {
  awaiting: ["submitted", "in_review"],
  changes_requested: ["changes_requested"],
  approved: ["approved"],
  rejected: ["rejected"],
};

export const getKycReviewsApi = async ({
  queue,
  search = "",
}: {
  queue: KycQueue;
  search?: string;
}) => {
  await wait(300);
  const all = allApplications();
  const term = search.trim().toLowerCase();
  const data = all
    .filter((item) => QUEUES[queue].includes(item.status))
    .filter(
      (item) =>
        !term ||
        item.business.legalName.toLowerCase().includes(term) ||
        item.applicant.fullname.toLowerCase().includes(term) ||
        item.business.cacNumber.includes(term),
    )
    // Oldest first while waiting, so nobody waits longest; newest first after.
    .sort((a, b) =>
      queue === "awaiting"
        ? (a.submittedAt ?? "").localeCompare(b.submittedAt ?? "")
        : (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
    );
  const counts = Object.fromEntries(
    (Object.keys(QUEUES) as KycQueue[]).map((key) => [
      key,
      all.filter((item) => QUEUES[key].includes(item.status)).length,
    ]),
  ) as Record<KycQueue, number>;
  return { data, counts };
};

export const getKycReviewApi = async (id: string) => {
  await wait(250);
  const item = allApplications().find((candidate) => candidate.id === id);
  if (!item) throw { message: "This application doesn't exist any more." };
  return { data: item };
};

// Opening a submitted application claims it for review.
export const startKycReviewApi = async (id: string) => {
  const { data } = await getKycReviewApi(id);
  if (data.status !== "submitted") return { data };
  const next = { ...data, status: "in_review" as const };
  save(next);
  return { data: next };
};

export const reviewKycApi = async (decision: KycDecision) => {
  await wait(500);
  const { data: item } = await getKycReviewApi(decision.id);
  if (item.status !== "submitted" && item.status !== "in_review")
    throw { message: "This application has already been reviewed." };

  const reviewedAt = new Date().toISOString();
  const next: KycReviewItem =
    decision.decision === "approve"
      ? { ...item, status: "approved", reviewNotes: {}, reviewedAt }
      : decision.decision === "changes"
        ? {
            ...item,
            status: "changes_requested",
            reviewNotes: decision.notes,
            reviewedAt,
          }
        : {
            ...item,
            status: "rejected",
            rejectionReason: decision.reason,
            reviewNotes: {},
            reviewedAt,
          };
  save({ ...next, updatedAt: reviewedAt });

  const messages = {
    approve: `${item.business.legalName} is verified.`,
    changes: `Changes requested from ${item.business.legalName}.`,
    reject: `${item.business.legalName} was rejected.`,
  };
  return { message: messages[decision.decision], data: next };
};

/** Mock only: puts the sample queue back as it started. */
export const resetKycAdminMock = () => {
  try {
    localStorage.removeItem(SAMPLES_KEY);
  } catch {
    // Nothing stored.
  }
};
