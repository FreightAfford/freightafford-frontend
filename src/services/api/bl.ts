import { AxiosError } from "axios";
import { apiClient } from "../configurations/apiConfig";

export const uploadBillOfLadingApi = async (data: {
  bookingId: string;
  type: "house" | "master";
  file: FileList;
}) => {
  try {
    const formData = new FormData();

    formData.append("bookingId", data.bookingId);
    formData.append("type", data.type);
    formData.append("document", data.file[0]);
    console.log(formData);
    const response = await apiClient.post("/bl", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getBillOfLadingApi = async (bookingId: string) => {
  try {
    const response = await apiClient.get(`/bl/booking/${bookingId}`);
    return response.data.data || [];
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const deleteBillOfLadingApi = async (id: string) => {
  try {
    const response = await apiClient.delete(`/bl/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getCustomerBillOfLadingsApi = async () => {
  try {
    const response = await apiClient.get("/bl");
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getBillOfLadingsApi = async () => {
  try {
    const response = await apiClient.get("/bl/admin");
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};
