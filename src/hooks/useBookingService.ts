import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  addContainersApi,
  getAllBookingsApi,
  getMyBookingsApi,
  getSingleBookingApi,
  updateBookingShippingApi,
  updateBookingStatusApi,
} from "../services/api/booking";

export const useGetMyBookings = (params: any) => {
  const { data, isPending, error, refetch, isRefetching } = useQuery({
    queryKey: ["bookings", params],
    queryFn: () => getMyBookingsApi(params),
  });

  return {
    bookings: data?.data ?? [],
    total: data?.total ?? 0,
    totalAll: data?.totalAll ?? 0,
    isPending,
    error,
    refetch,
    isRefetching,
  };
};

export const useGetAllBookings = (params: any) => {
  const { data, isPending, error, refetch, isRefetching } = useQuery({
    queryKey: ["adminbookings", params],
    queryFn: () => getAllBookingsApi(params),
  });

  return {
    bookings: data?.data ?? [],
    total: data?.total ?? 0,
    totalAll: data?.totalAll ?? 0,
    isPending,
    error,
    refetch,
    isRefetching,
  };
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
    onError: (err) => toast.error(err.message),
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

export const useAddContainer = () => {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: addContainersApi,
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      queryClient.invalidateQueries({
        queryKey: ["booking", variables.bookingId],
      });

      toast.success(res.message);
    },
    onError: (err) => toast.error(err.message),
  });

  return { mutate, isPending };
};
