import { useQuery } from "@tanstack/react-query";
import {
  getActivePortsApi,
  getPortScheduleApi,
  type ActivePort,
  type PortScheduleResult,
} from "../services/api/schedule";

type ApiError = { message?: string; statusCode?: number } | null;

// Every port Maersk calls at; changes rarely
export const useGetActivePorts = () => {
  const { data, isPending, error, refetch, isFetching } = useQuery<
    ActivePort[]
  >({
    queryKey: ["activePorts"],
    queryFn: getActivePortsApi,
    staleTime: 24 * 60 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });

  return {
    ports: data ?? [],
    isPending,
    isFetching,
    error: error as ApiError,
    refetch,
  };
};

export const useGetPortSchedule = (
  code: string,
  from: string,
  days: number,
) => {
  const { data, isPending, isFetching, error, refetch } =
    useQuery<PortScheduleResult>({
      queryKey: ["portSchedule", code, from, days],
      queryFn: () => getPortScheduleApi(code, from, days),
      enabled: !!code && !!from,
      // Maersk allows 50 schedule calls an hour: no retries or focus refetches
      staleTime: 6 * 60 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    });

  return {
    schedule: data,
    isPending,
    isFetching,
    error: error as ApiError,
    refetch,
  };
};
