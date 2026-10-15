import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  getKycApi,
  removeKycDocumentApi,
  saveKycDraftApi,
  submitKycApi,
  uploadKycDocumentApi,
  type KycDraft,
} from "../services/api/kyc";
import { apiClient } from "../services/configurations/apiConfig";
import {
  completedSteps,
  firstOpenStep,
} from "../pages/app/customer/verification/steps";

const KYC_KEY = ["kyc"];

type KycCache = Awaited<ReturnType<typeof getKycApi>>;

// Saves return the application only; keep the enforcement flag from the load.
const keepApplication = (
  queryClient: ReturnType<typeof useQueryClient>,
  data: KycCache["data"],
) =>
  queryClient.setQueryData<KycCache>(KYC_KEY, (old) => ({
    enforcement: old?.enforcement ?? true,
    data,
  }));

// Customers only: pass enabled=false for staff, who have no verification.
export const useKyc = (enabled = true) => {
  const { data, isPending, error } = useQuery({
    queryKey: KYC_KEY,
    queryFn: getKycApi,
    enabled,
  });

  return {
    application: data?.data,
    enforcement: data?.enforcement ?? true,
    isPending,
    error,
  };
};

// Drafts save quietly as the user goes; only failures are announced.
export const useSaveKycDraft = () => {
  const queryClient = useQueryClient();
  const { mutate: saveDraft, isPending } = useMutation({
    mutationFn: saveKycDraftApi,
    onSuccess: (response) => keepApplication(queryClient, response.data),
    onError: (err) => toast.error(err.message),
  });

  return { saveDraft, isPending };
};

export type AutosaveState = "idle" | "saving" | "saved" | "error";

const AUTOSAVE_DELAY = 1200;

/**
 * Saves a step's draft to the server while the customer types: a moment
 * after they stop, and once more as the page closes (refresh, closed tab),
 * so nothing typed is lost. The server stores drafts half-finished and
 * encrypts ID numbers; nothing is kept in the browser. Pass `paused` while
 * a file is still uploading so the old file isn't saved over the new one.
 */
export const useKycAutosave = (draft: KycDraft, paused = false) => {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AutosaveState>("idle");
  const body = JSON.stringify(draft);
  // What the server already has. Starts as the loaded draft: no save on open.
  const saved = useRef(body);
  const latest = useRef(body);
  const busy = useRef(false);
  const queued = useRef<string | null>(null);

  useEffect(() => {
    latest.current = body;
  }, [body]);

  const save = useCallback(
    async (next: string) => {
      if (busy.current) {
        queued.current = next;
        return;
      }
      busy.current = true;
      setState("saving");
      try {
        const response = await saveKycDraftApi(JSON.parse(next));
        saved.current = next;
        keepApplication(queryClient, response.data);
        setState("saved");
      } catch {
        setState("error");
      } finally {
        busy.current = false;
        const waiting = queued.current;
        queued.current = null;
        if (waiting && waiting !== saved.current) save(waiting);
      }
    },
    [queryClient],
  );

  useEffect(() => {
    if (paused || body === saved.current) return;
    const timer = setTimeout(() => save(body), AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  }, [body, paused, save]);

  // Refreshing or leaving mid-typing: send whatever hasn't been saved yet.
  // keepalive lets the request finish after the page has gone.
  useEffect(() => {
    const flush = () => {
      if (paused || latest.current === saved.current) return;
      fetch(`${apiClient.defaults.baseURL}/kyc/me`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        keepalive: true,
        body: latest.current,
      }).catch(() => {});
    };
    window.addEventListener("pagehide", flush);
    return () => window.removeEventListener("pagehide", flush);
  }, [paused]);

  return state;
};

// The upload field shows its own progress and errors, so no toasts here.
export const useUploadKycDocument = () => {
  const { mutateAsync: uploadDocument, isPending } = useMutation({
    mutationFn: uploadKycDocumentApi,
  });

  return { uploadDocument, isPending };
};

export const useRemoveKycDocument = () => {
  const { mutateAsync: removeDocument, isPending } = useMutation({
    mutationFn: removeKycDocumentApi,
  });

  return { removeDocument, isPending };
};

export const useSubmitKyc = () => {
  const queryClient = useQueryClient();
  const { mutate: submitKyc, isPending } = useMutation({
    mutationFn: submitKycApi,
    onSuccess: (response) => {
      toast.success(response.message);
      keepApplication(queryClient, response.data);
    },
    onError: (err) => toast.error(err.message),
  });

  return { submitKyc, isPending };
};

/**
 * The customer's verification at a glance, for the dashboard banner, the
 * Overview card and the live tracking lock. Freight requests and bookings
 * are open to everyone; `canTrack` is true once approved, or while the
 * backend isn't enforcing verification (KYC_ENFORCEMENT off).
 */
export const useKycStatus = (enabled = true) => {
  const { application, enforcement, isPending } = useKyc(enabled);
  const done = application ? completedSteps(application) : null;
  const doneCount = done ? Object.values(done).filter(Boolean).length : 0;

  return {
    application,
    isPending,
    status: application?.status,
    canTrack: application?.status === "approved" || !enforcement,
    enforcement,
    doneCount,
    totalSteps: done ? Object.keys(done).length : 3,
    nextStep: application ? firstOpenStep(application) : undefined,
  };
};
