import { useQuery } from "@tanstack/react-query";
import { searchCommoditiesApi } from "../services/api/commodity";

export const useSearchCommodities = (q: string) => {
  const query = q.trim();

  const { data, isFetching, error } = useQuery({
    queryKey: ["commodities", query.toLowerCase()],
    queryFn: () => searchCommoditiesApi(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    commodities: data?.data ?? [],
    isFetching,
    error: error as { message?: string } | null,
  };
};
