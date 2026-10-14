import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getKycReviewsApi,
  reviewKycApi,
  startKycReviewApi,
  type KycQueue,
} from "../services/api/kycAdmin";

export const useKycReviews = (queue: KycQueue, search: string) => {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["kyc-reviews", queue, search],
    queryFn: () => getKycReviewsApi({ queue, search }),
  });

  return {
    applications: data?.data ?? [],
    counts: data?.counts,
    isPending,
    error,
    refetch,
  };
};

// Loading an application also claims it: "submitted" becomes "in review".
export const useKycReview = (id: string) => {
  const { data, isPending, error } = useQuery({
    queryKey: ["kyc-review", id],
    queryFn: () => startKycReviewApi(id),
  });

  return { application: data?.data, isPending, error };
};

export const useReviewKyc = () => {
  const queryClient = useQueryClient();
  const { mutate: review, isPending } = useMutation({
    mutationFn: reviewKycApi,
    onSuccess: (response, decision) => {
      toast.success(response.message);
      queryClient.setQueryData(["kyc-review", decision.id], {
        data: response.data,
      });
      queryClient.invalidateQueries({ queryKey: ["kyc-reviews"] });
      // The customer's own view, for the application made on this browser.
      queryClient.invalidateQueries({ queryKey: ["kyc"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { review, isPending };
};
