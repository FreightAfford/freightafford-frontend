import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAllBookingsApi,
  getMyBookingsApi,
  getSingleBookingApi,
  updateBookingShippingApi,
  updateBookingStatusApi,
} from "../services/api/booking";

export const useGetMyBookings = () => {
  const { data, isPending, isError } = useQuery({
    queryKey: ["bookings"],
    queryFn: getMyBookingsApi,
  });

  return { bookings: data, isPending, isError };
};

export const useGetAllBookings = () => {
  const { data, isPending, error } = useQuery({
    queryKey: ["adminbookings"],
    queryFn: getAllBookingsApi,
  });

  return { bookings: data, isPending, error };
};

export const useGetSingleBooking = (id: string) => {
  const {
    data,
    isPending,
    error: sbError,
  } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => getSingleBookingApi(id),
    enabled: !!id,
  });

  return { booking: data, isPending, sbError };
};

export const useUpdateBookingShipping = () => {
  const queryClient = useQueryClient();

  const {
    mutate: updateBookingShipping,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateBookingShippingApi>[1];
    }) => updateBookingShippingApi(id, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
      toast.success(res.message);
    },
  });

  return { updateBookingShipping, isPending, isError };
};

export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  const {
    mutate: updateStatus,
    isPending,
    isError,
  } = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { status: string } }) =>
      updateBookingStatusApi(id, data),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
      toast.success(res.message);
    },
    onError: (err) => toast.error(err.message),
  });

  return { updateStatus, isPending, isError };
};
