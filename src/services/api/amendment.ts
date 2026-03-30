import { AxiosError } from "axios";
import { apiClient } from "../configurations/apiConfig";

export const createAmendmentApi = async (data: {
  bookingId: string;
  content: string;
  file: FileList;
}) => {
  try {
    const formData = new FormData();

    formData.append("bookingId", data.bookingId);

    if (data.content && data.content.trim().length > 0)
      formData.append("content", data.content.trim());

    if (data.file && data.file.length > 0)
      formData.append("amendment", data.file[0]);

    const response = await apiClient.post("/amendment", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getAmendmentsByBookingApi = async (bookingId: string) => {
  try {
    const response = await apiClient.get(`/amendment/${bookingId}`);

    return response.data.amendments;
  } catch (error) {
    console.error(error);
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};
