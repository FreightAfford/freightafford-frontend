import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  acceptSessionApi,
  closeSessionApi,
  createSessionApi,
  getAvailableCSOsApi,
  getAllSessionsApi,
  getMessagesApi,
  getMySessionsApi,
  getSessionByIdApi,
  markMessagesAsReadApi,
  reassignSessionApi,
  getBulkUnreadCountsApi,
} from "../services/api/chat";
import { socketService } from "../services/socket/socket.service";
// socketService is still used in useCreateSession and useMarkMessagesAsRead
import type {
  CreateSessionPayload,
  ReassignSessionPayload,
} from "../chat.types";

// ─── Query Key Factory ────────────────────────────────────────────────────────
// Centralised keys prevent cache mismatches across hooks

export const chatKeys = {
  all: ["chat"] as const,
  sessions: () => [...chatKeys.all, "sessions"] as const,
  sessionList: (filters: object) =>
    [...chatKeys.sessions(), "list", filters] as const,
  mySessions: (filters?: object) =>
    [...chatKeys.sessions(), "mine", filters] as const,
  session: (id: string) => [...chatKeys.sessions(), id] as const,
  messages: (sessionId: string) =>
    [...chatKeys.all, "messages", sessionId] as const,
  // Stable prefix key — not parameterised by sessionIds array.
  // Arrays as query key params are compared by reference, not value,
  // so setQueryData with a freshly constructed array never finds the cache entry.
  // Using a fixed key and storing all counts in one cache slot solves this.
  unreadCounts: () => [...chatKeys.all, "unread"] as const,
  availableCSOs: () => [...chatKeys.all, "csos"] as const,
};

// ─── Session Hooks ────────────────────────────────────────────────────────────

// Customer: create a new chat session
export const useCreateSession = () => {
  const queryClient = useQueryClient();

  const { mutate: createSession, isPending } = useMutation({
    mutationFn: (payload: CreateSessionPayload) => createSessionApi(payload),
    onSuccess: ({ session }) => {
      // Add to customer's session list cache immediately
      queryClient.invalidateQueries({ queryKey: chatKeys.mySessions() });

      // Notify the CSO lobby via socket that a new session is waiting
      socketService.emit.notifyNewSession(session._id);

      // Join the session room immediately
      socketService.emit.joinSession(session._id);

      toast.success("Connected to support queue");
    },
    onError: (err: any) => toast.error(err?.message ?? "Failed to start chat"),
  });

  return { createSession, isPending };
};

// CSO: get all sessions with filters
export const useGetAllSessions = (params: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const { data, isPending, error, refetch, isRefetching } = useQuery({
    queryKey: chatKeys.sessionList(params),
    queryFn: () => getAllSessionsApi(params),
  });

  return {
    sessions: data?.sessions ?? [],
    pagination: data?.pagination,
    isPending,
    error,
    refetch,
    isRefetching,
  };
};

// Customer: get their own sessions
export const useGetMySessions = (params?: { status?: string }) => {
  const { data, isPending, error, refetch } = useQuery({
    queryKey: chatKeys.mySessions(params),
    queryFn: () => getMySessionsApi(params),
  });

  return {
    sessions: data ?? [],
    isPending,
    error,
    refetch,
  };
};

// Both: get a single session by ID (used for ChatContextPanel)
export const useGetSession = (sessionId: string) => {
  const { data, isPending, error } = useQuery({
    queryKey: chatKeys.session(sessionId),
    queryFn: () => getSessionByIdApi(sessionId),
    enabled: !!sessionId,
  });

  return { session: data, isPending, error };
};

// CSO: accept a waiting session
export const useAcceptSession = () => {
  const queryClient = useQueryClient();

  const { mutate: acceptSession, isPending } = useMutation({
    mutationFn: (sessionId: string) => acceptSessionApi(sessionId),
    onSuccess: (session) => {
      // Write updated session directly into cache — no refetch needed
      queryClient.setQueryData(chatKeys.session(session._id), session);
      // Invalidate list so sidebar status badge and ordering updates
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
      toast.success("Chat session accepted");
    },
    onError: (err: any) =>
      toast.error(err?.message ?? "Failed to accept session"),
  });

  return { acceptSession, isPending };
};

// Both: close a session
export const useCloseSession = () => {
  const queryClient = useQueryClient();

  const { mutate: closeSession, isPending } = useMutation({
    mutationFn: (sessionId: string) => closeSessionApi(sessionId),
    onSuccess: (session) => {
      queryClient.setQueryData(chatKeys.session(session._id), session);
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
      toast.success("Chat session closed");
    },
    onError: (err: any) =>
      toast.error(err?.message ?? "Failed to close session"),
  });

  return { closeSession, isPending };
};

// CSO: reassign session to another CSO
export const useReassignSession = () => {
  const queryClient = useQueryClient();

  const { mutate: reassignSession, isPending } = useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: ReassignSessionPayload;
    }) => reassignSessionApi(sessionId, payload),
    onSuccess: (session) => {
      queryClient.setQueryData(chatKeys.session(session._id), session);
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
      toast.success("Session reassigned successfully");
    },
    onError: (err: any) =>
      toast.error(err?.message ?? "Failed to reassign session"),
  });

  return { reassignSession, isPending };
};

// CSO: get available CSOs for reassign dropdown
export const useGetAvailableCSOs = () => {
  const { data, isPending } = useQuery({
    queryKey: chatKeys.availableCSOs(),
    queryFn: getAvailableCSOsApi,
  });

  return { csos: data ?? [], isPending };
};

// ─── Message Hooks ────────────────────────────────────────────────────────────

// Both: message history for a session
// Uses a flat array in the cache — not infinite query — so that
// useChatSocket can append new messages via setQueryData with a simple
// array spread, with no risk of page structure mismatch.
// "Load earlier messages" is handled by fetching page 2+ and merging
// manually into the same flat cache key.
export const useGetMessages = (sessionId: string) => {
  const queryClient = useQueryClient();

  const { data, isPending, error } = useQuery({
    queryKey: chatKeys.messages(sessionId),
    queryFn: async () => {
      const result = await getMessagesApi(sessionId, { page: 1, limit: 30 });
      return {
        messages: result.messages, // flat array — newest 30, chronological
        hasMore: result.hasMore,
        page: result.page,
        total: result.total,
      };
    },
    enabled: !!sessionId,
    // Don't refetch on window focus — socket keeps messages live
    refetchOnWindowFocus: false,
    // Keep previous data while new session loads so ChatWindow
    // doesn't flash empty between session switches
    placeholderData: (prev) => prev,
  });

  // Load earlier messages — fetches the next page and prepends to cache
  const loadEarlierMessages = async () => {
    if (!data?.hasMore) return;
    const nextPage = data.page + 1;
    const result = await getMessagesApi(sessionId, {
      page: nextPage,
      limit: 30,
    });
    queryClient.setQueryData(chatKeys.messages(sessionId), (old: any) => {
      if (!old) return old;
      return {
        ...old,
        messages: [...result.messages, ...old.messages], // prepend older messages
        hasMore: result.hasMore,
        page: nextPage,
      };
    });
  };

  return {
    messages: data?.messages ?? [],
    isPending,
    hasMore: data?.hasMore ?? false,
    loadEarlierMessages,
    error,
  };
};

// Both: mark messages as read and invalidate unread counts
export const useMarkMessagesAsRead = () => {
  const queryClient = useQueryClient();

  const { mutate: markAsRead } = useMutation({
    mutationFn: (sessionId: string) => markMessagesAsReadApi(sessionId),
    onSuccess: (_, sessionId) => {
      // Zero this session's count directly in cache
      queryClient.setQueryData(
        chatKeys.unreadCounts(),
        (old: Record<string, number> | undefined) => {
          if (!old) return old;
          return { ...old, [sessionId]: 0 };
        },
      );
      // Emit socket read receipt so sender sees blue ticks
      socketService.emit.markRead(sessionId);
    },
  });

  return { markAsRead };
};

// CSO: bulk unread counts for all sidebar sessions
export const useGetBulkUnreadCounts = (sessionIds: string[]) => {
  const { data, isPending } = useQuery({
    queryKey: chatKeys.unreadCounts(),
    queryFn: () => getBulkUnreadCountsApi(sessionIds),
    enabled: sessionIds.length > 0,
  });

  return { counts: data ?? {}, isPending };
};
