import { useQuery } from "@tanstack/react-query";
import {
  getAdminOverviewApi,
  getCustomerOverviewApi,
} from "../services/api/pipeline";

export const useGetAdminOverview = () => {
  const { data, isPending, error, refetch, isRefetching } = useQuery({
    queryKey: ["adminPipeline"],
    queryFn: getAdminOverviewApi,
  });

  return { data, isPending, error, refetch, isRefetching };
};

export const useGetCustomerOverview = () => {
  const { data, isPending, error, refetch, isRefetching } = useQuery({
    queryKey: ["adminPipeline"],
    queryFn: getCustomerOverviewApi,
  });

  return { data, isPending, error, refetch, isRefetching };
};
