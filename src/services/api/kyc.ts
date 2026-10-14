import { AxiosError } from "axios";
import type { KycApplication, KycDocument } from "../../types/kyc";
import { apiClient } from "../configurations/apiConfig";

// Business verification (KYC), customer side: /api/v1/kyc/me...

export type KycDraft = Partial<
  Pick<
    KycApplication,
    "accountType" | "business" | "directors" | "authorisation"
  >
>;

// Same error shape as services/api/auth.ts: `{ message }`.
const toError = (error: unknown) => {
  if (error instanceof AxiosError)
    return (
      error.response?.data ?? {
        message:
          "Can't reach Freightafford. Check your connection and try again.",
      }
    );
  return {
    message: error instanceof Error ? error.message : "Something went wrong.",
  };
};

const request = async <T>(run: () => Promise<{ data: T }>) => {
  try {
    return (await run()).data;
  } catch (error) {
    throw toError(error);
  }
};

/** Documents open through the API, which hands out a short-lived signed link. */
export const documentUrl = (id: string) =>
  `${apiClient.defaults.baseURL}/kyc/documents/${id}`;

// Adds previewUrl to every document in a response, for links and thumbnails.
export const withLinks = <T>(value: T): T => {
  if (Array.isArray(value)) return value.map(withLinks) as T;
  if (value && typeof value === "object") {
    const entries = Object.entries(value).map(([key, item]) => [
      key,
      withLinks(item),
    ]);
    const result = Object.fromEntries(entries) as Record<string, unknown>;
    if (
      typeof result.id === "string" &&
      "mimeType" in result &&
      "uploadedAt" in result
    )
      result.previewUrl = documentUrl(result.id);
    return result as T;
  }
  return value;
};

export const getKycApi = async (): Promise<{
  data: KycApplication;
  enforcement: boolean;
}> => {
  const body = await request<{ data: KycApplication; enforcement: boolean }>(
    () => apiClient.get("/kyc/me"),
  );
  return { data: withLinks(body.data), enforcement: body.enforcement };
};

export const saveKycDraftApi = async (draft: KycDraft) => {
  const body = await request<{ message: string; data: KycApplication }>(() =>
    apiClient.patch("/kyc/me", draft),
  );
  return { message: body.message, data: withLinks(body.data) };
};

export const uploadKycDocumentApi = async ({
  file,
  onProgress,
}: {
  file: File;
  onProgress?: (percent: number) => void;
}) => {
  const form = new FormData();
  form.append("file", file);
  const body = await request<{ message: string; data: KycDocument }>(() =>
    apiClient.post("/kyc/me/documents", form, {
      onUploadProgress: (event) => {
        if (event.total)
          onProgress?.(Math.round((event.loaded / event.total) * 100));
      },
    }),
  );
  return { message: body.message, data: withLinks(body.data) };
};

export const removeKycDocumentApi = async (documentId: string) => {
  return request<{ message: string }>(() =>
    apiClient.delete(`/kyc/me/documents/${documentId}`),
  );
};

export const submitKycApi = async () => {
  const body = await request<{ message: string; data: KycApplication }>(() =>
    apiClient.post("/kyc/me/submit"),
  );
  return { message: body.message, data: withLinks(body.data) };
};
