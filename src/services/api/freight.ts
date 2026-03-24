import { AxiosError } from "axios";
import type { FreightRequestFormValues } from "../../validations/freightValidation";
import { apiClient } from "../configurations/apiConfig";

export const createFreightRequestApi = async (
  data: FreightRequestFormValues,
) => {
  try {
    const response = await apiClient.post("/freight-request", data);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getMyFreightRequestApi = async () => {
  try {
    const response = await apiClient.get("/freight-request/me");
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getAllFreightRequestApi = async () => {
  try {
    const response = await apiClient.get("/freight-request");
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const getFreightRequestApi = async (id: string) => {
  try {
    const response = await apiClient.get(`/freight-request/${id}`);
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const counterFreightRequestApi = async ({
  id,
  data,
}: {
  id: string;
  data: { counterPrice: number; reason: string };
}) => {
  try {
    const response = await apiClient.patch(
      `/freight-request/admin/${id}/counter`,
      data,
    );

    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const respondToCounterApi = async ({
  id,
  decision,
}: {
  id: string;
  decision: "accept" | "reject";
}) => {
  try {
    const response = await apiClient.patch(`/freight-request/${id}/respond`, {
      decision,
    });

    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};

export const acceptFreightRequestApi = async (id: string) => {
  try {
    const res = await apiClient.patch(`/freight-request/admin/${id}/accept`);
    return res.data.data;
  } catch (error) {
    console.error(error);
    if (error instanceof AxiosError) throw error.response?.data;
    if (error instanceof Error) throw error.message;
  }
};
