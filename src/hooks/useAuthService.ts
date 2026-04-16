import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  changePasswordApi,
  forgotPasswordApi,
  getAllUsersApi,
  getMeApi,
  getSingleUserApi,
  loginApi,
  logoutApi,
  registerApi,
  resendOtpApi,
  resetPasswordApi,
  updateUserByAdminApi,
  updateUserProfileApi,
  verifyOtpApi,
} from "../services/api/auth";

export const useRegister = () => {
  const { mutate: register, isPending } = useMutation({
    mutationFn: registerApi,
    onSuccess: (response) => toast.success(response.message),
    onError: (err) => toast.error(err.message),
  });

  return { register, isPending };
};

export const useVerifyOtp = () => {
  const { mutate: verifyOtp, isPending } = useMutation({
    mutationFn: verifyOtpApi,
    onSuccess: (response) => toast.success(response.message),
    onError: (err) => toast.error(err.message),
  });

  return { verifyOtp, isPending };
};

export const useResendOtp = () => {
  const { mutate: resendOtp, isPending } = useMutation({
    mutationFn: resendOtpApi,
    onSuccess: (response) => toast.success(response.message),
    onError: (err) => toast.error(err.message),
  });

  return { resendOtp, isPending };
};

export const useLogin = () => {
  const queryClient = useQueryClient();
  const { mutate: login, isPending } = useMutation({
    mutationFn: loginApi,
    onSuccess: (response) => {
      toast.success(response.message);
      queryClient.setQueryData(["user"], response.user);
    },
    onError: (err) => toast.error(err.message),
  });

  return { login, isPending };
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const { mutate: logout, isPending } = useMutation({
    mutationFn: logoutApi,
    onSuccess: (response) => {
      queryClient.clear();
      toast.success(response.message);
    },
    onError: (err) => toast.error(err.message),
  });

  return { logout, isPending };
};

export const useUser = () => {
  const {
    isPending,
    isError,
    data: user,
  } = useQuery({
    queryKey: ["user"],
    queryFn: getMeApi,
  });

  return { isPending, isError, user };
};

export const useGetAllUsers = (params: any) => {
  const { data, isPending, error, refetch, isRefetching } = useQuery({
    queryKey: ["users", params],
    queryFn: () => getAllUsersApi(params),
  });

  return {
    users: data?.data ?? [],
    total: data?.total ?? 0,
    totalAll: data?.totalAll ?? 0,
    isPending,
    error,
    refetch,
    isRefetching,
  };
};

export const useGetSingleUser = (userId: string) => {
  const { data, isPending, error, refetch, isRefetching } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getSingleUserApi(userId),
  });
  return {
    user: data?.user ?? {},
    requests: data?.requests ?? 0,
    bookings: data?.bookings ?? 0,
    invoices: data?.invoices ?? 0,
    isPending,
    error,
    refetch,
    isRefetching,
  };
};

export const useForgotPassword = () => {
  const { mutate: forgotPassword, isPending } = useMutation({
    mutationFn: forgotPasswordApi,
    onSuccess: (res) => toast.success(res.message),
    onError: (err) => toast.error(err.message),
  });

  return { forgotPassword, isPending };
};

export const useResetPassword = () => {
  const { mutate: resetPassword, isPending } = useMutation({
    mutationFn: resetPasswordApi,
    onSuccess: (res) => toast.success(res.message),
    onError: (err) => toast.error(err.message),
  });

  return { resetPassword, isPending };
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { mutate: updateUserProfile, isPending } = useMutation({
    mutationFn: updateUserProfileApi,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success(res.message);
    },
    onError: (err) => toast.error(err.message),
  });

  return { updateUserProfile, isPending };
};

export const useUpdateUserByAdmin = () => {
  const queryClient = useQueryClient();
  const { mutate: updateUser, isPending } = useMutation({
    mutationFn: updateUserByAdminApi,
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      toast.success(res.message);
    },
    onError: (err) => toast.error(err.message),
  });

  return { updateUser, isPending };
};

export const useChangePassword = () => {
  const { mutate: changePassword, isPending } = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: (res) => toast.success(res.message),
    onError: (err) => toast.error(err.message || "Something went wrong!"),
  });

  return { changePassword, isPending };
};
