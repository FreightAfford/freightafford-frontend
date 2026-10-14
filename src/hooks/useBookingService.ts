import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  addContainersApi,
  getAllBookingsApi,
  getBookingMaerskEventsApi,
  getMyBookingsApi,
  getSingleBookingApi,
  syncBookingMaerskApi,
  updateBookingShippingApi,
  updateBookingStatusApi,
} from "../services/api/booking";
import {
  advanceDemoTracking,
  demoTracking,
  isDemoTracking,
  type DemoRoute,
} from "../services/api/maerskMock";

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
    queryKey: ["adminBookings", params],
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

// `route` only feeds the development demo journey (see maerskMock.ts).
export const useGetBookingMaerskEvents = (
  id: string,
  enabled: boolean,
  route: DemoRoute = {},
) => {
  const demo = isDemoTracking();
  const { data, isPending, isFetching, error } = useQuery({
    queryKey: ["maerskEvents", id, demo ? "demo" : "live"],
    queryFn: () =>
      demo ? demoTracking(id, route) : getBookingMaerskEventsApi(id),
    enabled: !!id && enabled,
    // Maersk's public tracking quota is small: no retries or focus refetches
    staleTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    tracking: data,
    isPending,
    isFetching,
    error: error as { message?: string } | null,
  };
};

const SYNC_MESSAGES: Record<string, string> = {
  updated: "Booking updated from Maersk tracking.",
  unchanged: "Already up to date with Maersk.",
  not_found: "Maersk has no events for this booking yet.",
};

export const useSyncBookingMaersk = () => {
  const queryClient = useQueryClient();

  const { mutate: syncBooking, isPending } = useMutation({
    // The demo journey never calls the real sync, which writes to the booking.
    mutationFn: (id: string) =>
      isDemoTracking() ? advanceDemoTracking(id) : syncBookingMaerskApi(id),
    onSuccess: (res, id) => {
      if (!isDemoTracking())
        queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["maerskEvents", id] });
      toast.success(
        isDemoTracking()
          ? "Demo journey moved on to the next event."
          : (SYNC_MESSAGES[res.outcome] ?? "Synced with Maersk."),
      );
    },
    onError: (err) => toast.error(err.message),
  });

  return { syncBooking, isPending };
};
