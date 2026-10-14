import { AxiosError } from "axios";
import type { BusinessDetails, KycApplication } from "../../types/kyc";
import { apiClient } from "../configurations/apiConfig";
import { withLinks } from "./kyc";

// Business verification (KYC), staff side: /api/v1/kyc/admin...

export interface KycReviewItem extends KycApplication {
  id: string;
  applicant: { fullname: string; email: string };
}

export type KycDecision =
  | { id: string; decision: "approve" }
  | { id: string; decision: "changes"; notes: Record<string, string> }
  | { id: string; decision: "reject"; reason: string };

export type KycQueue =
  | "awaiting"
  | "changes_requested"
  | "approved"
  | "rejected";

/** One row of the review queue: just what the list shows. */
export type KycReviewRow = Pick<
  KycReviewItem,
  "id" | "status" | "accountType" | "applicant" | "submittedAt" | "updatedAt"
> & { business: Pick<BusinessDetails, "legalName" | "cacType" | "cacNumber"> };

const request = async <T>(run: () => Promise<{ data: T }>) => {
  try {
    return (await run()).data;
  } catch (error) {
    if (error instanceof AxiosError)
      throw (
        error.response?.data ?? {
          message:
            "Can't reach Freightafford. Check your connection and try again.",
        }
      );
    throw {
      message: error instanceof Error ? error.message : "Something went wrong.",
    };
  }
};

export const getKycReviewsApi = async ({
  queue,
  search = "",
}: {
  queue: KycQueue;
  search?: string;
}): Promise<{ data: KycReviewRow[]; counts: Record<KycQueue, number> }> => {
  const body = await request<{
    data: KycReviewRow[];
    counts: Record<KycQueue, number>;
  }>(() =>
    apiClient.get("/kyc/admin", {
      params: { queue, search: search || undefined, limit: 50 },
    }),
  );
  return { data: body.data, counts: body.counts };
};

// Opening an application also claims it: "submitted" becomes "in review".
export const startKycReviewApi = async (
  id: string,
): Promise<{ data: KycReviewItem }> => {
  const body = await request<{ data: KycReviewItem }>(() =>
    apiClient.get(`/kyc/admin/${id}`),
  );
  return { data: withLinks(body.data) };
};

export const reviewKycApi = async (
  decision: KycDecision,
): Promise<{ message: string; data: KycReviewItem }> => {
  const { id, ...body } = decision;
  const response = await request<{ message: string; data: KycReviewItem }>(() =>
    apiClient.patch(`/kyc/admin/${id}/review`, body),
  );
  return { message: response.message, data: withLinks(response.data) };
};
