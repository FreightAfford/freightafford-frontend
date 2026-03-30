import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  createAmendmentApi,
  getAmendmentsByBookingApi,
} from "../services/api/amendment";

export const useCreateAmendment = () => {
  const queryClient = useQueryClient();

  const {
    mutate: createAmendment,
    isPending,
    error,
  } = useMutation({
    mutationFn: createAmendmentApi,
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["amendments"] });
      queryClient.invalidateQueries({
        queryKey: ["booking", variables.bookingId],
      });
      toast.success(res.message);
    },
    onError: (err) =>
      toast.error(err.message || "Unable to send amendment. Try again."),
  });

  return { createAmendment, isPending, error };
};

export const useGetAmendmentsByBooking = (bookingId: string) => {
  const {
    data: amendments,
    error,
    isPending,
  } = useQuery({
    queryKey: ["amendments"],
    queryFn: () => getAmendmentsByBookingApi(bookingId),
  });

  return { amendments, error, isPending };
};
