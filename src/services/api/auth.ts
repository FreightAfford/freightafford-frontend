import { AxiosError } from "axios";
import type { ProfileFormValues } from "../../validations/authValidation";
import { apiClient } from "../configurations/apiConfig";

interface User {
  fullname?: string;
  email?: string;
  password?: string;
  acceptTerms?: boolean;
  acceptedFreightRules?: boolean;
  otp?: string;
}

export const registerApi = async (user: User) => {
  try {
    const response = await apiClient.post("/auth/register", user);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const verifyOtpApi = async ({ email, otp }: User) => {
  try {
    const response = await apiClient.post("/auth/verify-otp", { email, otp });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const resendOtpApi = async (email: string) => {
  try {
    const response = await apiClient.post("/auth/resend-otp", { email });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const loginApi = async ({ email, password }: User) => {
  try {
    const response = await apiClient.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const logoutApi = async () => {
  try {
    const response = await apiClient.post("/auth/logout");
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getMeApi = async () => {
  try {
    const response = await apiClient.get("/auth/me");
    return response.data.user;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getAllUsersApi = async () => {
  try {
    const response = await apiClient.get("/auth");
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getSingleUserApi = async (userId: string) => {
  try {
    const response = await apiClient.get(`/auth/${userId}`);
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const forgotPasswordApi = async (email: string) => {
  try {
    const response = await apiClient.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const resetPasswordApi = async ({
  token,
  password,
}: {
  token: string;
  password: string;
}) => {
  try {
    const response = await apiClient.post(`/auth/reset-password/${token}`, {
      password,
    });

    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const updateUserProfileApi = async (data: ProfileFormValues) => {
  try {
    const response = await apiClient.patch("/auth/update-profile", data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const changePasswordApi = async (data: {
  currentPassword: string;
  newPassword: string;
}) => {
  try {
    const response = await apiClient.patch("/auth/change-password", data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};
