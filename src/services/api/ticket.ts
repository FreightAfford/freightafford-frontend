import { AxiosError } from "axios";
import { apiClient } from "../configurations/apiConfig";

export const getAllTicketsApi = async (params: any) => {
  try {
    const response = await apiClient.get("/tickets", { params });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getSingleTicketApi = async (ticketId: string) => {
  try {
    const response = await apiClient.get(`/tickets/${ticketId}`);
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const replyToTicketMessageApi = async ({
  ticketId,
  formData,
}: {
  ticketId: string;
  formData: FormData;
}) => {
  try {
    const response = await apiClient.post(
      `/tickets/${ticketId}/reply`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
    if (error instanceof Error) return error.message;
  }
};

export const updateTicketStatusApi = async ({
  ticketId,
  status,
}: {
  ticketId: string;
  status: string;
}) => {
  try {
    const response = await apiClient.patch(`/tickets/${ticketId}/status`, {
      status,
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) return error.response?.data;
    if (error instanceof Error) return error.message;
  }
};
