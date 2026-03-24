import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAllInvoices,
  getInvoiceByBookingApi,
  getInvoicesByCustomer,
  submitPaymentProofApi,
  uploadInvoiceApi,
  verifyPaymentApi,
} from "../services/api/invoice";

export const useUploadInvoice = (bookingId: string) => {
  const queryClient = useQueryClient();
  const { mutate: uploadInvoice, isPending } = useMutation({
    mutationFn: uploadInvoiceApi,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["invoice", bookingId] });
      toast.success(res.message);
    },
    onError: (err) => toast.error(err.message),
  });

  return { uploadInvoice, isPending };
};

export const useGetInvoiceByBooking = (bookingId: string) => {
  const {
    data: invoice,
    isPending,
    error,
  } = useQuery({
    queryKey: ["invoice", bookingId],
    queryFn: () => getInvoiceByBookingApi(bookingId),
    enabled: !!bookingId,
  });

  return { invoice, isPending, error };
};

export const useGetInvoicesByCustomer = () => {
  const {
    data: invoices,
    isPending,
    error,
  } = useQuery({ queryKey: ["invoices"], queryFn: getInvoicesByCustomer });

  return { invoices, isPending, error };
};

export const useGetAllInvoices = () => {
  const {
    data: invoices,
    isPending,
    error,
  } = useQuery({ queryKey: ["invoices"], queryFn: getAllInvoices });

  return { invoices, isPending, error };
};

export const useSubmitProofPayment = (bookingId: string) => {
  const queryClient = useQueryClient();

  const { mutate: submitProof, isPending } = useMutation({
    mutationFn: submitPaymentProofApi,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["invoice", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(res.message);
    },
    onError: (err) => toast.error(err.message),
  });

  return { submitProof, isPending };
};

export const useVerifyPayment = (bookingId: string) => {
  const queryClient = useQueryClient();
  const { mutate: verify, isPending } = useMutation({
    mutationFn: verifyPaymentApi,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["invoice", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      toast.success(res.message);
    },
    onError: (err) => toast.error(err.message),
  });

  return { verify, isPending };
};
