import { useQuery } from "@tanstack/react-query";
import { searchLocationsApi } from "../services/api/location";

export const useSearchLocations = (q: string) => {
  const query = q.trim();

  const { data, isFetching, error } = useQuery({
    queryKey: ["locations", query.toLowerCase()],
    queryFn: () => searchLocationsApi(query),
    enabled: query.length >= 2,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    locations: data?.data ?? [],
    isFetching,
    error: error as { message?: string } | null,
  };
};
