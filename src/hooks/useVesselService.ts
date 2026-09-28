import { useQuery } from "@tanstack/react-query";
import { searchVesselsApi } from "../services/api/vessel";

export const useSearchVessels = (q: string) => {
  const query = q.trim();

  const { data, isFetching, error } = useQuery({
    queryKey: ["vessels", query.toLowerCase()],
    queryFn: () => searchVesselsApi(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    vessels: data?.data ?? [],
    isFetching,
    error: error as { message?: string } | null,
  };
};
