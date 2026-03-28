import { useQuery } from "@tanstack/react-query";
import { getBookingTrackingEventsApi } from "../services/api/tracking";

export const useGetBookingTrackingEvents = (bookingId: string) => {
  const { data, isPending, error } = useQuery({
    queryKey: ["trackingEvent", bookingId],
    queryFn: () => getBookingTrackingEventsApi(bookingId),
    enabled: !!bookingId,
  });

  return { events: data, isPending, error };
};
