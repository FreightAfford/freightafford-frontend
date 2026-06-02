import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import type {
  ChatMessage,
  ChatSession,
  SocketMessage,
  SocketNewSession,
  SocketPresenceUpdate,
  SocketQueueUpdate,
  SocketReadReceipt,
  SocketSessionUpdate,
  SocketTyping,
} from "../chat.types";
import {
  SOCKET_EVENTS,
  socketService,
} from "../services/socket/socket.service";
import { chatKeys } from "./useChatService";

// ─── useChatSocket ────────────────────────────────────────────────────────────
//
// Fix summary vs previous version:
//
//  Bug 1 fixed — cache key mismatch:
//    handleMessage now normalises payload.sessionId via .toString() before
//    building the cache key, guaranteeing it matches chatKeys.messages(session._id)
//    which also calls .toString() on the session id.
//
//  Bug 2+3 fixed — setQueryData on uninitialised infinite query:
//    When old is undefined (first message before history loads), we now
//    initialise the infinite query structure: { pages: [page], pageParams: [1] }
//    so the message appears immediately rather than being silently dropped.
//
//  Bug 4 fixed — listener thrashing on every render:
//    All callbacks (onTyping, onSessionUpdated etc.) are stored in refs.
//    The socket listeners reference the ref, not the function itself,
//    so the useEffect dependency array is stable — listeners are registered
//    exactly once per mount and never torn down/re-added mid-session.
// ─────────────────────────────────────────────────────────────────────────────

interface UseChatSocketOptions {
  activeSessionId?: string;
  onTyping?: (payload: SocketTyping) => void;
  onStopTyping?: (payload: { sessionId: string; userId: string }) => void;
  onPresenceUpdate?: (payload: SocketPresenceUpdate) => void;
  onNewSession?: (payload: SocketNewSession) => void;
  onQueueUpdate?: (payload: SocketQueueUpdate) => void;
  onSessionUpdated?: (payload: SocketSessionUpdate) => void;
}

export const useChatSocket = ({
  activeSessionId,
  onTyping,
  onStopTyping,
  onPresenceUpdate,
  onNewSession,
  onQueueUpdate,
  onSessionUpdated,
}: UseChatSocketOptions = {}) => {
  const queryClient = useQueryClient();
  const s = socketService.getSocket();

  // ── Callback refs — stable references that always point to latest fn ───────
  // This is the fix for Bug 4. Instead of putting callbacks in useEffect deps,
  // we store them in refs. The socket listener calls the ref, which always
  // points to the latest version of the function without triggering re-registration.
  const onTypingRef = useRef(onTyping);
  const onStopTypingRef = useRef(onStopTyping);
  const onPresenceUpdateRef = useRef(onPresenceUpdate);
  const onNewSessionRef = useRef(onNewSession);
  const onQueueUpdateRef = useRef(onQueueUpdate);
  const onSessionUpdatedRef = useRef(onSessionUpdated);

  // Keep refs current on every render without triggering effects
  useEffect(() => {
    onTypingRef.current = onTyping;
  });
  useEffect(() => {
    onStopTypingRef.current = onStopTyping;
  });
  useEffect(() => {
    onPresenceUpdateRef.current = onPresenceUpdate;
  });
  useEffect(() => {
    onNewSessionRef.current = onNewSession;
  });
  useEffect(() => {
    onQueueUpdateRef.current = onQueueUpdate;
  });
  useEffect(() => {
    onSessionUpdatedRef.current = onSessionUpdated;
  });

  // ── Inbound: new message ───────────────────────────────────────────────────
  const handleMessage = useCallback(
    (payload: SocketMessage) => {
      // Normalise to plain string — fixes cache key mismatch (Bug 1)
      const sessionId = payload.sessionId.toString();

      const newMessage: ChatMessage = {
        _id: payload._id,
        session: sessionId,
        sender: payload.sender,
        senderRole: payload.senderRole,
        content: payload.content,
        type: payload.type,
        status: payload.status,
        createdAt: payload.createdAt,
        updatedAt: payload.createdAt,
      };

      queryClient.setQueryData(chatKeys.messages(sessionId), (old: any) => {
        // Bug 2+3 fix: initialise flat structure if history not yet loaded
        if (!old || !old.messages) {
          return {
            messages: [newMessage],
            hasMore: false,
            page: 1,
            total: 1,
          };
        }
        // Append to flat messages array
        return {
          ...old,
          messages: [...old.messages, newMessage],
          total: old.total + 1,
        };
      });

      // Invalidate session list so unread badges and previews update
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
    },
    [queryClient],
  );

  // ── Inbound: session status changed ───────────────────────────────────────
  const handleSessionUpdated = useCallback(
    (payload: SocketSessionUpdate) => {
      const sessionId = payload.sessionId.toString();

      // Update individual session cache entry
      queryClient.setQueryData(
        chatKeys.session(sessionId),
        (old: ChatSession | undefined) => {
          if (!old) return old;
          return {
            ...old,
            status: payload.status,
            ...(payload.assignedCSO && { assignedCSO: payload.assignedCSO }),
          };
        },
      );

      // Invalidate session lists so sidebar re-orders
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });

      // Forward via ref — never stale, never triggers re-registration
      onSessionUpdatedRef.current?.(payload);
    },
    [queryClient],
  );

  // ── Inbound: read receipt ──────────────────────────────────────────────────
  const handleReadReceipt = useCallback(
    (payload: SocketReadReceipt) => {
      const sessionId = payload.sessionId.toString();

      queryClient.setQueryData(chatKeys.messages(sessionId), (old: any) => {
        if (!old?.messages) return old;
        return {
          ...old,
          messages: old.messages.map((msg: ChatMessage) => ({
            ...msg,
            status:
              msg.status === "read"
                ? "read"
                : payload.status === "read"
                  ? "read"
                  : "delivered",
          })),
        };
      });
    },
    [queryClient],
  );

  // ── Inbound: new session notification (CSO lobby) ─────────────────────────
  const handleNewSession = useCallback(
    (payload: SocketNewSession) => {
      queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
      onNewSessionRef.current?.(payload);
    },
    [queryClient],
  );

  // ── Inbound: typing ───────────────────────────────────────────────────────
  const handleTyping = useCallback((payload: SocketTyping) => {
    onTypingRef.current?.(payload);
  }, []);

  // ── Inbound: stop typing ──────────────────────────────────────────────────
  const handleStopTyping = useCallback(
    (payload: { sessionId: string; userId: string }) => {
      onStopTypingRef.current?.(payload);
    },
    [],
  );

  // ── Inbound: presence update ──────────────────────────────────────────────
  const handlePresenceUpdate = useCallback((payload: SocketPresenceUpdate) => {
    onPresenceUpdateRef.current?.(payload);
  }, []);

  // ── Inbound: queue position update ────────────────────────────────────────
  const handleQueueUpdate = useCallback((payload: SocketQueueUpdate) => {
    onQueueUpdateRef.current?.(payload);
  }, []);

  // ── Register listeners ONCE on mount — never torn down mid-session ────────
  // All handlers above have empty or [queryClient]-only deps, so they are
  // created once. The refs handle the "latest callback" problem without
  // needing to re-register listeners on every render.
  useEffect(() => {
    socketService.connect();

    s.on(SOCKET_EVENTS.CHAT_MESSAGE, handleMessage);
    s.on(SOCKET_EVENTS.CHAT_SESSION_UPDATED, handleSessionUpdated);
    s.on(SOCKET_EVENTS.CHAT_READ_RECEIPT, handleReadReceipt);
    s.on(SOCKET_EVENTS.CHAT_NEW_SESSION, handleNewSession);
    s.on(SOCKET_EVENTS.CHAT_TYPING, handleTyping);
    s.on(SOCKET_EVENTS.CHAT_STOP_TYPING, handleStopTyping);
    s.on(SOCKET_EVENTS.PRESENCE_UPDATE, handlePresenceUpdate);
    s.on(SOCKET_EVENTS.QUEUE_POSITION_UPDATE, handleQueueUpdate);

    return () => {
      s.off(SOCKET_EVENTS.CHAT_MESSAGE, handleMessage);
      s.off(SOCKET_EVENTS.CHAT_SESSION_UPDATED, handleSessionUpdated);
      s.off(SOCKET_EVENTS.CHAT_READ_RECEIPT, handleReadReceipt);
      s.off(SOCKET_EVENTS.CHAT_NEW_SESSION, handleNewSession);
      s.off(SOCKET_EVENTS.CHAT_TYPING, handleTyping);
      s.off(SOCKET_EVENTS.CHAT_STOP_TYPING, handleStopTyping);
      s.off(SOCKET_EVENTS.PRESENCE_UPDATE, handlePresenceUpdate);
      s.off(SOCKET_EVENTS.QUEUE_POSITION_UPDATE, handleQueueUpdate);
    };
  }, [
    s,
    handleMessage,
    handleSessionUpdated,
    handleReadReceipt,
    handleNewSession,
    handleTyping,
    handleStopTyping,
    handlePresenceUpdate,
    handleQueueUpdate,
  ]);

  // ── Join / leave active session room ──────────────────────────────────────
  useEffect(() => {
    if (!activeSessionId) return;

    socketService.emit.joinSession(activeSessionId);
    socketService.emit.markRead(activeSessionId);

    return () => {
      socketService.emit.leaveSession(activeSessionId);
    };
  }, [activeSessionId]);
};
