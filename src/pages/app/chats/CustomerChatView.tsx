import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  MessageCircle,
  Package,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
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

const CHAT_INTENT_KEY = "chat_intent";

const CustomerChatView = () => {
  const location = useLocation();
  const chatContext = location.state?.chatContext as ChatContext | undefined;

  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);
  const [queuePosition, setQueuePosition] = useState<number | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingName, setTypingName] = useState<string | undefined>(undefined);
  const [startingFresh, setStartingFresh] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(false);

  const createAttemptedRef = useRef(false);
  const intentionalNavigationRef = useRef(false);

  const { sessions, isPending: isLoadingSessions } = useGetMySessions();
  const { createSession } = useCreateSession();

  useEffect(() => {
    const intent = sessionStorage.getItem(CHAT_INTENT_KEY);
    if (intent) {
      intentionalNavigationRef.current = true;
      sessionStorage.removeItem(CHAT_INTENT_KEY);
    }
  }, []);

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

  useEffect(() => {
    if (isLoadingSessions) return;
    if (createAttemptedRef.current) return;
    if (activeSession) return;

    if (
      chatContext?.type === "request_linked" &&
      chatContext.freightRequestId
    ) {
      const openLinkedSession = sessions.find(
        (s) =>
          (s.status === "waiting" || s.status === "active") &&
          s.freightRequest?._id?.toString() === chatContext.freightRequestId,
      );

      if (openLinkedSession) {
        setActiveSession(openLinkedSession);
        if (openLinkedSession.status === "waiting") {
          setQueuePosition(openLinkedSession.queuePosition);
        }
        return;
      }

      if (intentionalNavigationRef.current) {
        createAttemptedRef.current = true;
        setIsSessionLoading(true);
        createSession(
          {
            type: "request_linked",
            freightRequestId: chatContext.freightRequestId,
            bookingId: chatContext.bookingId,
          },
          {
            onSuccess: ({ session, queuePosition: pos }) => {
              setIsSessionLoading(false);
              setActiveSession(session);
              setQueuePosition(pos);
            },
            onError: (err: any) => {
              setIsSessionLoading(false);
              const openFallback = sessions.find(
                (s) =>
                  (s.status === "waiting" || s.status === "active") &&
                  s.freightRequest?._id?.toString() ===
                    chatContext.freightRequestId,
              );
              if (openFallback) {
                setActiveSession(openFallback);
              } else {
                toast.error(err?.message ?? "Failed to start chat");
                createAttemptedRef.current = false;
              }
            },
          },
        );
        return;
      }
    }

    const openSession =
      sessions.find((s) => s.status === "waiting" || s.status === "active") ??
      sessions[0];

    if (openSession) {
      setActiveSession(openSession);
      if (openSession.status === "waiting") {
        setQueuePosition(openSession.queuePosition);
      }
    }
  }, [isLoadingSessions, sessions]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleQueueUpdate = useCallback(
    (payload: SocketQueueUpdate) => {
      if (payload.sessionId.toString() === activeSession?._id?.toString()) {
        setQueuePosition(payload.queuePosition);
      }
    },
    [activeSession?._id],
  );

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

  const handleStartChat = () => {
    const payload =
      !startingFresh &&
      chatContext?.type === "request_linked" &&
      chatContext.freightRequestId
        ? {
            type: "request_linked" as const,
            freightRequestId: chatContext.freightRequestId,
            bookingId: chatContext.bookingId,
          }
        : { type: "general" as const };

    setIsSessionLoading(true);
    createSession(payload, {
      onSuccess: ({ session, queuePosition: pos }) => {
        setIsSessionLoading(false);
        setActiveSession(session);
        setQueuePosition(pos);
        setStartingFresh(false);
      },
      onError: () => {
        setIsSessionLoading(false);
      },
    });
  };

  if (isLoadingSessions || isSessionLoading) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
        <p className="font-medium text-slate-600">
          {isSessionLoading
            ? "Starting your chat..."
            : "Connecting to support..."}
        </p>
      </div>
    );
  }

  if (!activeSession) {
    const showRouteContext =
      !startingFresh &&
      chatContext?.type === "request_linked" &&
      !!chatContext.route;

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50">
          <MessageCircle className="h-10 w-10 text-blue-600" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">
          Need help? Chat with us
        </h3>
        <p className="max-w-xs text-sm text-slate-500">
          {showRouteContext
            ? `Start a chat about your shipment: ${chatContext!.route}`
            : "Our support team is available to assist you with your freight and booking inquiries."}
        </p>
        <button
          onClick={handleStartChat}
          disabled={isSessionLoading}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 disabled:opacity-60"
        >
          {isSessionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Start Chat
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col overflow-hidden bg-white">
      {activeSession.freightRequest && (
        <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50 px-4 py-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              Chatting about:{" "}
              <span className="font-bold capitalize">
                {`${activeSession.freightRequest.originPort} → ${activeSession.freightRequest.destinationPort}`}
              </span>
            </span>
          </div>
          <StatusBadge status={activeSession.freightRequest.status} />
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
              {` • ${activeSession.freightRequest?.containerSize}`}
            </span>
          </div>
          <StatusBadge
            status={
              activeSession.booking.status === "awaiting_confirmation"
                ? "pending"
                : activeSession.booking.status
            }
          />
        </div>
      )}

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
            {activeSession.assignedCSO?.fullname ?? "Support"} joined the chat
          </div>
        )}
        {activeSession.status === "closed" && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
              <AlertCircle className="h-4 w-4" />
              This chat session is closed
            </div>
            <button
              onClick={() => {
                createAttemptedRef.current = false;
                setActiveSession(null);
                setQueuePosition(null);
                setStartingFresh(true);
              }}
              className="rounded-lg bg-blue-600 px-3 py-1 text-xs font-bold text-white transition-all hover:bg-blue-700 active:scale-95"
            >
              Start New Chat
            </button>
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
