import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  deleteBillOfLadingApi,
  getBillOfLadingApi,
  getBillOfLadingsApi,
  getCustomerBillOfLadingsApi,
  uploadBillOfLadingApi,
} from "../services/api/bl";

export const useUploadBL = () => {
  const queryClient = useQueryClient();

  const {
    mutate: uploadBL,
    isPending,
    error,
  } = useMutation({
    mutationFn: uploadBillOfLadingApi,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["billOfLading"] });
      toast.success(res.message);
    },
    onError: (err) => toast.error(err.message),
  });

  return { uploadBL, isPending, error };
};

export const useGetBL = (bookingId: string) => {
  const {
    data: bls,
    isPending,
    error,
  } = useQuery({
    queryKey: ["billOfLading"],
    queryFn: () => getBillOfLadingApi(bookingId),
  });

  return { bls, isPending, error };
};

export const useDeleteBL = () => {
  const queryClient = useQueryClient();

  const { mutate: deleteBL, isPending } = useMutation({
    mutationFn: deleteBillOfLadingApi,
    onSuccess: (res, id: string) => {
      queryClient.setQueryData<any[]>(["billOfLading"], (old: any) => {
        if (!old) return [];
        return old.filter((bl: any) => bl._id !== id);
      });
      toast.success(res.message);
    },
    onError: (err) => toast.error(err.message),
  });

  return { deleteBL, isPending };
};

export const useGetCustomerBLs = () => {
  const { data, isPending, error, refetch, isRefetching } = useQuery({
    queryKey: ["billOfLadings"],
    queryFn: getCustomerBillOfLadingsApi,
  });

  return { bls: data, isPending, error, refetch, isRefetching };
};

export const useGetBLs = () => {
  const { data, isPending, error, refetch, isRefetching } = useQuery({
    queryKey: ["billOfLadings"],
    queryFn: getBillOfLadingsApi,
  });

  return { bls: data, isPending, error, refetch, isRefetching };
};
