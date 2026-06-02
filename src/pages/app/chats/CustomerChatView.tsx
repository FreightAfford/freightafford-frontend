import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Package,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router";
import { toast } from "react-toastify";
import type {
  ChatSession,
  SocketQueueUpdate,
  SocketSessionUpdate,
  SocketTyping,
} from "../../../chat.types";
import StatusBadge from "../../../components/app/StatusBadge";
import {
  useCreateSession,
  useGetMySessions,
} from "../../../hooks/useChatService";
import { useChatSocket } from "../../../hooks/useChatSocket";
import type { ChatContext } from "../../../pages/app/chats/ChatButton";
import {
  SOCKET_EVENTS,
  socketService,
} from "../../../services/socket/socket.service";
import ChatWindow from "./ChatWindow";

// ─── CustomerChatView ─────────────────────────────────────────────────────────
//
// Route state flow:
//   ChatButton (on any page) → navigate("/app/customer/chats", { state: { chatContext } })
//   CustomerChatView reads location.state.chatContext on mount
//
// Three cases:
//   1. request_linked context + existing session for that request → restore it
//   2. request_linked context + no existing session → auto-create one
//   3. general / no context → restore any open session, or show Start Chat prompt
// ─────────────────────────────────────────────────────────────────────────────

const CustomerChatView = () => {
  const location = useLocation();
  const chatContext = location.state?.chatContext as ChatContext | undefined;

  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingName, setTypingName] = useState<string | undefined>(undefined);
  const [autoCreateAttempted, setAutoCreateAttempted] = useState(false);

  const { sessions, isPending: isLoadingSessions } = useGetMySessions();
  const { createSession, isPending: isCreating } = useCreateSession();

  // ── Socket error feedback ──────────────────────────────────────────────────
  useEffect(() => {
    const s = socketService.getSocket();
    const handleError = (payload: { event: string; message: string }) => {
      toast.error(payload.message ?? "Something went wrong");
    };
    s.on(SOCKET_EVENTS.ERROR, handleError);
    return () => {
      s.off(SOCKET_EVENTS.ERROR, handleError);
    };
  }, []);

  // ── Session initialisation ─────────────────────────────────────────────────
  useEffect(() => {
    if (isLoadingSessions || autoCreateAttempted) return;

    if (
      chatContext?.type === "request_linked" &&
      chatContext.freightRequestId
    ) {
      // Case 1: restore existing session for this request
      const existingLinkedSession = sessions.find(
        (s) =>
          s.status !== "closed" &&
          s.freightRequest?._id === chatContext.freightRequestId,
      );

      if (existingLinkedSession) {
        setActiveSession(existingLinkedSession);
        if (existingLinkedSession.status === "waiting") {
          setQueuePosition(existingLinkedSession.queuePosition);
        }
        return;
      }

      // Case 2: auto-create request_linked session
      setAutoCreateAttempted(true);
      createSession(
        {
          type: "request_linked",
          freightRequestId: chatContext.freightRequestId,
          bookingId: chatContext.bookingId,
        },
        {
          onSuccess: ({ session, queuePosition: pos }) => {
            setActiveSession(session);
            setQueuePosition(pos);
          },
          onError: (err: any) => {
            // If already exists (race), fall back to any open session
            const fallback = sessions.find((s) => s.status !== "closed");
            if (fallback) setActiveSession(fallback);
            else toast.error(err?.message ?? "Failed to start chat");
          },
        },
      );
      return;
    }

    // Case 3: general — restore any open session
    if (activeSession) return;
    const openSession = sessions.find((s) => s.status !== "closed");
    if (openSession) {
      setActiveSession(openSession);
      if (openSession.status === "waiting") {
        setQueuePosition(openSession.queuePosition);
      }
    }
  }, [isLoadingSessions, sessions]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Socket: typing ────────────────────────────────────────────────────────
  const handleTyping = useCallback(
    (payload: SocketTyping) => {
      if (payload.sessionId.toString() !== activeSession?._id?.toString())
        return;
      setIsTyping(true);
      setTypingName(payload.fullname);
    },
    [activeSession?._id],
  );

  const handleStopTyping = useCallback(
    (payload: { sessionId: string; userId: string }) => {
      if (payload.sessionId.toString() !== activeSession?._id?.toString())
        return;
      setIsTyping(false);
      setTypingName(undefined);
    },
    [activeSession?._id],
  );

  // ── Socket: queue position ────────────────────────────────────────────────
  const handleQueueUpdate = useCallback(
    (payload: SocketQueueUpdate) => {
      if (payload.sessionId.toString() === activeSession?._id?.toString()) {
        setQueuePosition(payload.queuePosition);
      }
    },
    [activeSession?._id],
  );

  // ── Socket: session status changed ────────────────────────────────────────
  const handleSessionUpdated = useCallback(
    (payload: SocketSessionUpdate) => {
      if (payload.sessionId.toString() !== activeSession?._id?.toString())
        return;
      setActiveSession((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          status: payload.status,
          ...(payload.assignedCSO && {
            assignedCSO: {
              ...payload.assignedCSO,
              email: prev.assignedCSO?.email ?? "",
              role: "admin" as const,
              status: "active" as const,
            },
          }),
        };
      });
      if (payload.status !== "waiting") setQueuePosition(null);
      setIsTyping(false);
      setTypingName(undefined);
    },
    [activeSession?._id],
  );

  useChatSocket({
    activeSessionId: activeSession?._id,
    onTyping: handleTyping,
    onStopTyping: handleStopTyping,
    onQueueUpdate: handleQueueUpdate,
    onSessionUpdated: handleSessionUpdated,
  });

  // ── Manual session creation ────────────────────────────────────────────────
  const handleStartChat = () => {
    const payload =
      chatContext?.type === "request_linked" && chatContext.freightRequestId
        ? {
            type: "request_linked" as const,
            freightRequestId: chatContext.freightRequestId,
            bookingId: chatContext.bookingId,
          }
        : { type: "general" as const };

    createSession(payload, {
      onSuccess: ({ session, queuePosition: pos }) => {
        setActiveSession(session);
        setQueuePosition(pos);
      },
    });
  };

  console.log(activeSession);
  // ── Loading ────────────────────────────────────────────────────────────────
  if (
    isLoadingSessions ||
    (chatContext?.type === "request_linked" && isCreating)
  ) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
        <p className="font-medium text-slate-600">
          {isCreating ? "Starting your chat..." : "Connecting to support..."}
        </p>
      </div>
    );
  }

  // ── No session — prompt to start ───────────────────────────────────────────
  if (!activeSession) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
          <MessageCircle className="h-10 w-10 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Need help? Chat with us
        </h3>
        <p className="max-w-xs text-sm text-slate-500">
          {chatContext?.type === "request_linked" && chatContext.route
            ? `Start a chat about your shipment: ${chatContext.route}`
            : "Our support team is available to assist you with your freight and booking inquiries."}
        </p>
        <button
          onClick={handleStartChat}
          disabled={isCreating}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-60"
        >
          {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
          Start Chat
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-white">
      {/* Context Banner — from route state (more descriptive) or session data */}
      {(chatContext?.route || activeSession.freightRequest) && (
        <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-4 py-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Chatting about:{" "}
              <span className="font-bold capitalize">
                {chatContext?.route ??
                  `${activeSession.freightRequest?.originPort} → ${activeSession.freightRequest?.destinationPort}`}
              </span>
            </span>
          </div>
          {activeSession.freightRequest && (
            <StatusBadge
              status={activeSession.freightRequest?.status.replace("_", " ")}
            />
          )}
        </div>
      )}

      {activeSession.booking && (
        <div className="flex items-center justify-between border-b border-indigo-100 bg-indigo-50 px-4 py-2">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-800">
              Booking:{" "}
              <span className="font-bold">
                {activeSession.booking.bookingNumber}
              </span>
              {activeSession.booking.vessel &&
                ` • ${activeSession.booking.vessel}`}
            </span>
          </div>
          <StatusBadge
            status={
              activeSession.booking?.status === "awaiting_confirmation"
                ? "pending"
                : activeSession.booking.status
            }
          />
        </div>
      )}

      {/* Status Banner */}
      <div className="flex items-center justify-center gap-4 border-b border-slate-100 bg-slate-100/50 px-4 py-1.5">
        {activeSession.status === "waiting" && (
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-amber-600 uppercase">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>
              Position in queue:{" "}
              <span className="text-amber-700">
                {queuePosition ?? activeSession.queuePosition}
              </span>
            </span>
          </div>
        )}
        {activeSession.status === "active" && (
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-green-600 uppercase">
            <CheckCircle2 className="h-4 w-4" />
            {activeSession.assignedCSO?.fullname.split(" ")[0] ??
              "Support"}{" "}
            joined the chat
          </div>
        )}
        {activeSession.status === "closed" && (
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
            <AlertCircle className="h-4 w-4" />
            This chat session is closed
          </div>
        )}
      </div>

      <div className="relative min-h-0 flex-1">
        <ChatWindow
          session={activeSession}
          isTyping={isTyping}
          typingName={typingName}
        />
      </div>
    </div>
  );
};

export default CustomerChatView;
