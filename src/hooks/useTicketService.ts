import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  getAllTicketsApi,
  getSingleTicketApi,
  replyToTicketMessageApi,
  updateTicketStatusApi,
} from "../services/api/ticket";

export const useGetAllTickets = (params: any) => {
  const { data, isPending, error, refetch, isRefetching } = useQuery({
    queryKey: ["tickets", params],
    queryFn: () => getAllTicketsApi(params),
  });

  return {
    tickets: data?.data ?? [],
    total: data?.total ?? 0,
    totalAll: data?.totalAll ?? 0,
    isPending,
    error,
    refetch,
    isRefetching,
  };
};

export const useGetSingleTicket = (ticketId: string) => {
  const { data, isPending, error } = useQuery({
    queryKey: ["ticket", ticketId],
    queryFn: () => getSingleTicketApi(ticketId),
    enabled: !!ticketId,
  });

  return {
    ticket: data?.ticket ?? {},
    messages: data?.messages ?? [],
    isPending,
    error,
  };
};

export const useReplyToTicketMessage = () => {
  const queryClient = useQueryClient();

  const {
    mutate: reply,
    isPending: isSending,
    error,
  } = useMutation({
    mutationFn: replyToTicketMessageApi,
    onSuccess: (_, variables) => {
      toast.success("Reply sent successfully");

      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.ticketId],
      });
    },
    onError: (error) => toast.error(error.message || "Failed to send reply"),
  });

  return { isSending, reply, error };
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();

  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: updateTicketStatusApi,
    onSuccess: (data, variables) => {
      toast.success(data.message);

      queryClient.invalidateQueries({
        queryKey: ["ticket", variables.ticketId],
      });

      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },

    onError: (error) =>
      toast.error(error.message || "Failed to update ticket status"),
  });

  return { updateStatus, isUpdating };
};
