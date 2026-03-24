import { AxiosError } from "axios";
import { apiClient } from "../configurations/apiConfig";

export const getBookingTrackingEventsApi = async (bookingId: string) => {
  try {
    const response = await apiClient.get(`/tracking/bookings/${bookingId}`);
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};
