import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  acceptFreightRequestApi,
  counterFreightRequestApi,
  createFreightRequestApi,
  getAllFreightRequestApi,
  getFreightRequestApi,
  getMyFreightRequestApi,
  respondToCounterApi,
} from "../services/api/freight";

export const useCreateFreightRequest = () => {
  const queryClient = useQueryClient();

  const { mutate: createRequest, isPending } = useMutation({
    mutationFn: createFreightRequestApi,
    onSuccess: (res) => {
      toast.success(res.message);

      queryClient.invalidateQueries({ queryKey: ["freightRequests"] });
    },
    onError: (err) => toast.error(err.message),
  });

  return { createRequest, isPending };
};

export const useGetMyFreightRequests = (params: any) => {
  console.log(params);
  const { data, isPending, error, isRefetching, refetch } = useQuery({
    queryKey: ["freightRequests", params],
    queryFn: () => getMyFreightRequestApi(params),
  });

  return {
    requests: data?.data ?? [],
    total: data?.total ?? 0,
    totalAll: data?.totalAll ?? 0,
    isPending,
    error,
    isRefetching,
    refetch,
  };
};

export const useGetAllFreightRequests = (params?: any) => {
  const { data, isPending, error, refetch, isRefetching } = useQuery({
    queryKey: ["adminFreightRequests", params],
    queryFn: () => getAllFreightRequestApi(params),
  });

  return {
    requests: data?.data ?? [],
    total: data?.total ?? 0,
    totalAll: data?.totalAll ?? 0,
    isPending,
    error,
    refetch,
    isRefetching,
  };
};

export const useGetFreightRequest = (id: string) => {
  const { data, isPending, error } = useQuery({
    queryKey: ["freightRequest", id],
    queryFn: () => getFreightRequestApi(id),
    enabled: !!id,
  });

  return { request: data, isPending, error };
};

export const useCounterFreightRequest = (id: string) => {
  const queryClient = useQueryClient();

  const { mutate: counterRequest, isPending } = useMutation({
    mutationFn: counterFreightRequestApi,
    onSuccess: () => {
      toast.success("Counter offer sent successfully!");

      queryClient.invalidateQueries({ queryKey: ["adminFreightRequests"] });
      queryClient.invalidateQueries({ queryKey: ["freightRequest", id] });
    },
    onError: (err) =>
      toast.error(err.message || "Unable to send counter offer"),
  });

  return { counterRequest, isPending };
};

export const useRespondToCounter = (id: string) => {
  const queryClient = useQueryClient();

  const { mutate: respondToCounter, isPending } = useMutation({
    mutationFn: respondToCounterApi,
    onSuccess: () => {
      toast.success("Response submitted successfully");

      queryClient.invalidateQueries({ queryKey: ["freightRequest", id] });
      queryClient.invalidateQueries({ queryKey: ["adminFreightRequests"] });
    },
    onError: (err) => toast.error(err.message || "Unable to submit response"),
  });

  return { respondToCounter, isPending };
};

export const useAcceptFreightRequest = (id: string) => {
  const queryClient = useQueryClient();

  const { mutate: acceptFreight, isPending } = useMutation({
    mutationFn: acceptFreightRequestApi,
    onSuccess: () => {
      toast.success("Freight request accepted");

      queryClient.invalidateQueries({ queryKey: ["freightRequest", id] });
      queryClient.invalidateQueries({ queryKey: ["adminFreightRequests"] });
    },
    onError: (err) => toast.error(err.message || "Unable to accept request"),
  });

  return { acceptFreight, isPending };
};
