import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getKycApi,
  removeKycDocumentApi,
  saveKycDraftApi,
  submitKycApi,
  uploadKycDocumentApi,
} from "../services/api/kyc";
import {
  completedSteps,
  firstOpenStep,
} from "../pages/app/customer/verification/steps";

const KYC_KEY = ["kyc"];

export const useKyc = () => {
  const { data, isPending, error } = useQuery({
    queryKey: KYC_KEY,
    queryFn: getKycApi,
  });

  return { application: data?.data, isPending, error };
};

// Drafts save quietly as the user goes; only failures are announced.
export const useSaveKycDraft = () => {
  const queryClient = useQueryClient();
  const { mutate: saveDraft, isPending } = useMutation({
    mutationFn: saveKycDraftApi,
    onSuccess: (response) => queryClient.setQueryData(KYC_KEY, response),
    onError: (err) => toast.error(err.message),
  });

  return { saveDraft, isPending };
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
      queryClient.setQueryData(KYC_KEY, response);
    },
    onError: (err) => toast.error(err.message),
  });

  return { submitKyc, isPending };
};

/**
 * The customer's verification at a glance, for the dashboard banner, the
 * Overview card and the booking gate. `canBook` is true only once approved.
 */
export const useKycStatus = () => {
  const { application, isPending } = useKyc();
  const done = application ? completedSteps(application) : null;
  const doneCount = done ? Object.values(done).filter(Boolean).length : 0;

  return {
    application,
    isPending,
    status: application?.status,
    canBook: application?.status === "approved",
    doneCount,
    totalSteps: done ? Object.keys(done).length : 3,
    nextStep: application ? firstOpenStep(application) : undefined,
  };
};
