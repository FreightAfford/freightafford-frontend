import { AxiosError } from "axios";
import type {
  AvailableCSO,
  ChatSession,
  CreateSessionPayload,
  PaginatedMessages,
  ReassignSessionPayload,
  SessionsResponse,
} from "../../chat.types";
import { apiClient } from "../configurations/apiConfig"; // adjust path to your existing apiClient

// ─── Chat API Service ─────────────────────────────────────────────────────────
//
// Follows the exact same pattern as your existing auth API functions:
//   - Manual response unwrapping (response.data.data)
//   - AxiosError caught and re-thrown as the server's error payload
// ─────────────────────────────────────────────────────────────────────────────

const handleError = (error: unknown): never => {
  if (error instanceof AxiosError) throw error.response?.data;
  if (error instanceof Error) throw error.message;
  throw error;
};

// ── Sessions ──────────────────────────────────────────────────────────────────

export const createSessionApi = async (
  payload: CreateSessionPayload,
): Promise<{ session: ChatSession; queuePosition: number }> => {
  try {
    const response = await apiClient.post("/chat/sessions", payload);
    return response.data.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getAllSessionsApi = async (params: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<SessionsResponse> => {
  try {
    const response = await apiClient.get("/chat/sessions", { params });
    return response.data.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getMySessionsApi = async (params?: {
  status?: string;
}): Promise<ChatSession[]> => {
  try {
    const response = await apiClient.get("/chat/sessions/mine", { params });
    return response.data.data.sessions;
  } catch (error) {
    return handleError(error);
  }
};

export const getSessionByIdApi = async (
  sessionId: string,
): Promise<ChatSession> => {
  try {
    const response = await apiClient.get(`/chat/sessions/${sessionId}`);
    return response.data.data.session;
  } catch (error) {
    return handleError(error);
  }
};

export const acceptSessionApi = async (
  sessionId: string,
): Promise<ChatSession> => {
  try {
    const response = await apiClient.patch(
      `/chat/sessions/${sessionId}/accept`,
    );
    return response.data.data.session;
  } catch (error) {
    return handleError(error);
  }
};

export const closeSessionApi = async (
  sessionId: string,
): Promise<ChatSession> => {
  try {
    const response = await apiClient.patch(`/chat/sessions/${sessionId}/close`);
    return response.data.data.session;
  } catch (error) {
    return handleError(error);
  }
};

export const reassignSessionApi = async (
  sessionId: string,
  payload: ReassignSessionPayload,
): Promise<ChatSession> => {
  try {
    const response = await apiClient.patch(
      `/chat/sessions/${sessionId}/reassign`,
      payload,
    );
    return response.data.data.session;
  } catch (error) {
    return handleError(error);
  }
};

export const getAvailableCSOsApi = async (): Promise<AvailableCSO[]> => {
  try {
    const response = await apiClient.get("/chat/sessions/csos");
    return response.data.data.csos;
  } catch (error) {
    return handleError(error);
  }
};

// ── Messages ──────────────────────────────────────────────────────────────────

export const getMessagesApi = async (
  sessionId: string,
  params?: { page?: number; limit?: number },
): Promise<PaginatedMessages> => {
  try {
    const response = await apiClient.get(
      `/chat/sessions/${sessionId}/messages`,
      { params },
    );
    return response.data.data;
  } catch (error) {
    return handleError(error);
  }
};

export const markMessagesAsReadApi = async (
  sessionId: string,
): Promise<{ updatedCount: number }> => {
  try {
    const response = await apiClient.patch(
      `/chat/sessions/${sessionId}/messages/read`,
    );
    return response.data.data;
  } catch (error) {
    return handleError(error);
  }
};

export const getUnreadCountApi = async (sessionId: string): Promise<number> => {
  try {
    const response = await apiClient.get(
      `/chat/sessions/${sessionId}/messages/unread`,
    );

    return response.data.data.unreadCount;
  } catch (error) {
    return handleError(error);
  }
};

export const getBulkUnreadCountsApi = async (
  sessionIds: string[],
): Promise<Record<string, number>> => {
  try {
    const response = await apiClient.post("/chat/sessions/unread-counts", {
      sessionIds,
    });
    return response.data.data.counts;
  } catch (error) {
    return handleError(error);
  }
};
