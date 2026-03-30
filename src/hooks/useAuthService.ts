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
  });

  return { login, isPending };
};

export const useLogout = () => {
  const { mutate: logout, isPending } = useMutation({
    mutationFn: logoutApi,
    onSuccess: (response) => toast.success(response.message),
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
    retry: false,
    refetchOnWindowFocus: false,
  });

  return { isPending, isError, user };
};

export const useGetAllUsers = () => {
  const {
    data: users,
    isPending,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getAllUsersApi,
  });

  return { users, isPending, error, refetch, isRefetching };
};

export const useGetSingleUser = (userId: string) => {
  const {
    data: users,
    isPending,
    error,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => getSingleUserApi(userId),
  });

  return { users, isPending, error };
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

export const useChangePassword = () => {
  const { mutate: changePassword, isPending } = useMutation({
    mutationFn: changePasswordApi,
    onSuccess: (res) => toast.success(res.message),
    onError: (err) => toast.error(err.message || "Something went wrong!"),
  });

  return { changePassword, isPending };
};
