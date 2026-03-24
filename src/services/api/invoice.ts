import { AxiosError } from "axios";
import type {
  submitPaymentFormValues,
  UploadInvoiceFormValues,
} from "../../validations/invoiceValidation";
import { apiClient } from "../configurations/apiConfig";

export const uploadInvoiceApi = async ({
  bookingId,
  data,
}: {
  bookingId: string;
  data: UploadInvoiceFormValues;
}) => {
  try {
    const formData = new FormData();

    formData.append("dueDate", data.dueDate);
    formData.append("description", data.description);
    formData.append("invoice", data.invoice[0]);

    const response = await apiClient.post(`/invoice/${bookingId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getInvoiceByBookingApi = async (bookingId: string) => {
  try {
    const response = await apiClient.get(`/invoice/booking/${bookingId}`);
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getInvoicesByCustomer = async () => {
  try {
    const response = await apiClient.get(`/invoice/customer`);
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getAllInvoices = async () => {
  try {
    const response = await apiClient.get(`/invoice`);
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const submitPaymentProofApi = async ({
  invoiceId,
  data,
}: {
  invoiceId: string;
  data: submitPaymentFormValues;
}) => {
  try {
    const formData = new FormData();

    formData.append("paymentReference", data.paymentReference);

    if (data.file) formData.append("proof", data.file[0]);

    const response = await apiClient.post(
      `/invoice/${invoiceId}/payment`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const verifyPaymentApi = async ({
  invoiceId,
  action,
}: {
  invoiceId: string;
  action: "approve" | "reject";
}) => {
  try {
    const response = await apiClient.patch(`/invoice/${invoiceId}/verify`, {
      action,
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};
