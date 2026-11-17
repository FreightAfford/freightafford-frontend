import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  commitRateImportApi,
  createRateApi,
  deleteRateApi,
  expireRateApi,
  getRateApi,
  getRateLanesApi,
  getRateRequestsApi,
  getRatesApi,
  requestRateApi,
  resolveRateRequestApi,
  searchRatesApi,
  updateRateApi,
  type ListParams,
  type RateInput,
  type RateRequestInput,
  type RateSearchParams,
} from "../services/api/rate";

type ApiError = { message?: string; statusCode?: number } | null;

// Every rate change can show up in all three places.
const RATE_KEYS = [
  ["rates"],
  ["rate"],
  ["rateSearch"],
  ["rateLanes"],
  ["rateRequests"],
];

const useInvalidateRates = () => {
  const queryClient = useQueryClient();
  return () =>
    RATE_KEYS.forEach((queryKey) =>
      queryClient.invalidateQueries({ queryKey }),
    );
};

const toastError = (err: unknown) =>
  toast.error((err as ApiError)?.message ?? "Something went wrong");

// ---- Customer ------------------------------------------------------------

export const useSearchRates = (params: RateSearchParams) => {
  const { origin, destination } = params;
  const { data, isPending, isFetching, isPlaceholderData, error, refetch } =
    useQuery({
      queryKey: ["rateSearch", params],
      queryFn: () => searchRatesApi(params),
      enabled: !!destination && origin !== destination,
      // Keep the list on screen while the next page or filter loads
      placeholderData: keepPreviousData,
    });

  return {
    groups: data?.groups ?? [],
    total: data?.total ?? 0,
    totalAll: data?.totalAll ?? 0,
    months: data?.months ?? [],
    request: data?.request ?? null,
    isPending,
    isFetching,
    isRefetching: isFetching && isPlaceholderData,
    error: error as ApiError,
    refetch,
  };
};

export const useGetRateLanes = (enabled = true, month?: string) => {
  const { data, isPending, error } = useQuery({
    queryKey: ["rateLanes", month ?? ""],
    queryFn: () => getRateLanesApi(month),
    enabled,
    placeholderData: keepPreviousData,
  });

  return {
    lanes: data?.lanes ?? [],
    months: data?.months ?? [],
    isPending,
    error: error as ApiError,
  };
};

export const useRequestRate = () => {
  const invalidate = useInvalidateRates();
  const { mutate: requestRate, isPending } = useMutation({
    mutationFn: (input: RateRequestInput) => requestRateApi(input),
    onSuccess: (res) => {
      toast.success(res.message);
      invalidate();
    },
    onError: toastError,
  });

  return { requestRate, isPending };
};

// ---- Admin: rates --------------------------------------------------------

export const useGetRate = (id: string) => {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: ["rate", id],
    queryFn: () => getRateApi(id),
  });

  return { rate: data, isPending, error: error as ApiError, refetch };
};

export const useGetRates = (params: ListParams, enabled = true) => {
  const { data, isPending, isFetching, isPlaceholderData, error, refetch } =
    useQuery({
      queryKey: ["rates", params],
      queryFn: () => getRatesApi(params),
      placeholderData: keepPreviousData,
      enabled,
    });

  return {
    rates: data?.data ?? [],
    total: data?.total ?? 0,
    totalAll: data?.totalAll ?? 0,
    isPending,
    isRefetching: isFetching && isPlaceholderData,
    error: error as ApiError,
    refetch,
  };
};

export const useSaveRate = () => {
  const invalidate = useInvalidateRates();
  const { mutate: saveRate, isPending } = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: RateInput }) =>
      id ? updateRateApi(id, input) : createRateApi(input),
    onSuccess: (res) => {
      toast.success(res.message);
      invalidate();
    },
    onError: toastError,
  });

  return { saveRate, isPending };
};

export const useExpireRate = () => {
  const invalidate = useInvalidateRates();
  const { mutate: expireRate, isPending } = useMutation({
    mutationFn: (id: string) => expireRateApi(id),
    onSuccess: (res) => {
      toast.success(res.message);
      invalidate();
    },
    onError: toastError,
  });

  return { expireRate, isPending };
};

export const useDeleteRate = () => {
  const invalidate = useInvalidateRates();
  const { mutate: deleteRate, isPending } = useMutation({
    mutationFn: (id: string) => deleteRateApi(id),
    onSuccess: (res) => {
      toast.success(res.message);
      invalidate();
    },
    onError: toastError,
  });

  return { deleteRate, isPending };
};

// ---- Admin: rate requests ------------------------------------------------

export const useGetRateRequests = (params: ListParams) => {
  const { data, isPending, isFetching, isPlaceholderData, error, refetch } =
    useQuery({
      queryKey: ["rateRequests", params],
      queryFn: () => getRateRequestsApi(params),
      placeholderData: keepPreviousData,
    });

  return {
    requests: data?.data ?? [],
    total: data?.total ?? 0,
    totalAll: data?.totalAll ?? 0,
    open: data?.open ?? 0,
    isPending,
    isRefetching: isFetching && isPlaceholderData,
    error: error as ApiError,
    refetch,
  };
};

export const useResolveRateRequest = () => {
  const invalidate = useInvalidateRates();
  const { mutate: resolveRequest, isPending } = useMutation({
    mutationFn: (id: string) => resolveRateRequestApi(id),
    onSuccess: (res) => {
      toast.success(res.message);
      invalidate();
    },
    onError: toastError,
  });

  return { resolveRequest, isPending };
};

// ---- Admin: bulk import --------------------------------------------------
// Reading the file, matching and checking happen in the import window
// (components/app/rates/admin/import); saving goes through here.

export const useCommitRateImport = () => {
  const invalidate = useInvalidateRates();
  const { mutate: commitImport, isPending } = useMutation({
    mutationFn: commitRateImportApi,
    onSuccess: (res) => {
      toast.success(res.message);
      invalidate();
    },
    // The window shows what went wrong and keeps the review open.
  });

  return { commitImport, isPending };
};
