import { io, type Socket } from "socket.io-client";

// ─── Socket Service ───────────────────────────────────────────────────────────
//
// Singleton socket instance — one connection for the entire app lifetime.
// Since the JWT is in an HTTP-only cookie and apiClient uses
// withCredentials: true, the cookie is automatically forwarded during
// the Socket.io handshake. No manual token passing needed.
//
// Usage:
//   import { socketService } from "./socket.service";
//   socketService.connect();
//   socketService.emit.joinSession("abc123");
// ─────────────────────────────────────────────────────────────────────────────

// ── Event name constants ──────────────────────────────────────────────────────
// Mirrors the backend events.ts exactly
export const SOCKET_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
  CHAT_JOIN: "chat:join",
  CHAT_LEAVE: "chat:leave",
  CHAT_MESSAGE: "chat:message",
  CHAT_TYPING: "chat:typing",
  CHAT_STOP_TYPING: "chat:stop_typing",
  CHAT_READ: "chat:read",
  CHAT_READ_RECEIPT: "chat:read_receipt",
  CHAT_SESSION_UPDATED: "chat:session_updated",
  CHAT_NEW_SESSION: "chat:new_session",
  QUEUE_POSITION_UPDATE: "queue:position_update",
  PRESENCE_ONLINE: "presence:online",
  PRESENCE_OFFLINE: "presence:offline",
  PRESENCE_UPDATE: "presence:update",
  ERROR: "error",
} as const;

// ── Socket instance ───────────────────────────────────────────────────────────

let socket: Socket | null = null;

const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL ?? "http://localhost:9000", {
      // Cookie is forwarded automatically — no auth.token needed
      withCredentials: true,
      // Don't connect immediately — we call connect() manually after login
      autoConnect: false,
      // Reconnect up to 5 times before giving up
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  }
  return socket;
};

// ── Socket service ────────────────────────────────────────────────────────────

export const socketService = {
  // ── Lifecycle ─────────────────────────────────────────────────────────────

  connect: (): void => {
    const s = getSocket();
    if (!s.connected) s.connect();
  },

  disconnect: (): void => {
    if (socket?.connected) {
      socket.emit(SOCKET_EVENTS.PRESENCE_OFFLINE);
      socket.disconnect();
    }
  },

  isConnected: (): boolean => socket?.connected ?? false,

  getSocket: (): Socket => getSocket(),

  // ── Typed emitters ────────────────────────────────────────────────────────
  // Centralised so event names and payload shapes are never typed manually
  // in components or hooks

  emit: {
    joinSession: (sessionId: string): void => {
      getSocket().emit(SOCKET_EVENTS.CHAT_JOIN, { sessionId });
    },

    leaveSession: (sessionId: string): void => {
      getSocket().emit(SOCKET_EVENTS.CHAT_LEAVE, { sessionId });
    },

    sendMessage: (sessionId: string, content: string): void => {
      getSocket().emit(SOCKET_EVENTS.CHAT_MESSAGE, { sessionId, content });
    },

    typing: (sessionId: string): void => {
      getSocket().emit(SOCKET_EVENTS.CHAT_TYPING, { sessionId });
    },

    stopTyping: (sessionId: string): void => {
      getSocket().emit(SOCKET_EVENTS.CHAT_STOP_TYPING, { sessionId });
    },

    markRead: (sessionId: string): void => {
      getSocket().emit(SOCKET_EVENTS.CHAT_READ, { sessionId });
    },

    acceptSession: (sessionId: string): void => {
      getSocket().emit(SOCKET_EVENTS.CHAT_SESSION_UPDATED, {
        sessionId,
        action: "accept",
      });
    },

    closeSession: (sessionId: string): void => {
      getSocket().emit(SOCKET_EVENTS.CHAT_SESSION_UPDATED, {
        sessionId,
        action: "close",
      });
    },

    reassignSession: (sessionId: string, toCSOId: string): void => {
      getSocket().emit(SOCKET_EVENTS.CHAT_SESSION_UPDATED, {
        sessionId,
        action: "reassign",
        toCSOId,
      });
    },

    notifyNewSession: (sessionId: string): void => {
      getSocket().emit(SOCKET_EVENTS.CHAT_NEW_SESSION, { sessionId });
    },
  },
};
