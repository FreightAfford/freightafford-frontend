import { AxiosError } from "axios";
import type { UpdateBookingShippingFormValues } from "../../validations/bookingValidation";
import { apiClient } from "../configurations/apiConfig";

export const getMyBookingsApi = async () => {
  try {
    const response = await apiClient.get("/booking/me");

    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getAllBookingsApi = async () => {
  try {
    const response = await apiClient.get("/booking/admin");
    return response.data.data;
  } catch (error) {
    console.error(error);
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getSingleBookingApi = async (id: string) => {
  try {
    const response = await apiClient.get(`/booking/${id}/single`);

    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const updateBookingShippingApi = async (
  id: string,
  data: UpdateBookingShippingFormValues,
) => {
  try {
    const response = await apiClient.patch(
      `/booking/admin/${id}/shipping`,
      data,
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const updateBookingStatusApi = async (
  id: string,
  data: { status: string },
) => {
  try {
    const response = await apiClient.patch(`/booking/admin/${id}/status`, data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};
