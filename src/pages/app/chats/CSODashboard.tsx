import {
  CheckCircle2,
  ChevronLeft,
  Clock,
  Info,
  LayoutDashboard,
  MessageCircle,
  PanelLeft,
  PanelRight,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import type {
  ChatSession,
  SocketNewSession,
  SocketSessionUpdate,
  SocketTyping,
} from "../../../chat.types";
import { useGetAllSessions } from "../../../hooks/useChatService";
import { useChatSocket } from "../../../hooks/useChatSocket";
import {
  SOCKET_EVENTS,
  socketService,
} from "../../../services/socket/socket.service";
import cn from "../../../utils/cn";
import ChatContextPanel from "./ChatContextPanel";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

const CSODashboard = () => {
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [showContext, setShowContext] = useState<boolean>(true);
  const [activeSession, setActiveSession] = useState<ChatSession | null>(null);

  // sessionId → typer's fullname
  // Key is always normalised to a plain string via .toString()
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});

  const { sessions: waitingSessions } = useGetAllSessions({
    status: "waiting",
  });
  const { sessions: activeSessions } = useGetAllSessions({ status: "active" });

  // ── Socket error feedback ──────────────────────────────────────────────────
  // Listen for server-side errors (e.g. "Sender is not a participant") and
  // surface them as toasts so the CSO knows why a message failed
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

  // ── Typing handlers ────────────────────────────────────────────────────────
  // Normalise sessionId to string — fixes the ObjectId vs string mismatch
  // that caused typingUsers[activeSession._id] to always be undefined
  const handleTyping = useCallback((payload: SocketTyping) => {
    const sessionId = payload.sessionId.toString();
    setTypingUsers((prev) => ({ ...prev, [sessionId]: payload.fullname }));
  }, []);

  const handleStopTyping = useCallback(
    (payload: { sessionId: string; userId: string }) => {
      const sessionId = payload.sessionId.toString();
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[sessionId];
        return next;
      });
    },
    [],
  );

  const handleNewSession = useCallback((_payload: SocketNewSession) => {
    // React Query cache is already invalidated inside useChatSocket
  }, []);

  // ── Socket: session status changes ─────────────────────────────────────────
  const handleSessionUpdated = useCallback((payload: SocketSessionUpdate) => {
    setActiveSession((prev: any) => {
      if (!prev || prev._id !== payload.sessionId.toString()) return prev;
      return {
        ...prev,
        status: payload.status,
        ...(payload.assignedCSO && { assignedCSO: payload.assignedCSO }),
      };
    });

    if (payload.status === "closed" || payload.status === "reassigned") {
      setActiveSession(null);
    }
  }, []);

  // ── Session update handler passed to ChatContextPanel ──────────────────────
  //
  // Bug 2 fix: acceptSessionApi returns a lean session without populated
  // fields (customer, freightRequest, booking). If we replace activeSession
  // wholesale, ChatContextPanel loses all the display data.
  //
  // Instead: when updated is non-null (accept), merge only the changed
  // fields (status, assignedCSO, metadata) into the existing rich session.
  // When updated is null (close/reassign), clear active session normally.
  //
  const handleSessionUpdate = useCallback((updated: ChatSession | null) => {
    if (updated === null) {
      setActiveSession(null);
      return;
    }
    setActiveSession((prev) => {
      if (!prev) return updated;
      return {
        ...prev, // keep all populated fields (customer, freightRequest, booking)
        status: updated.status,
        assignedCSO: updated.assignedCSO ?? prev.assignedCSO,
        metadata: updated.metadata ?? prev.metadata,
        updatedAt: updated.updatedAt,
      };
    });
  }, []);

  useChatSocket({
    activeSessionId: activeSession?._id,
    onTyping: handleTyping,
    onStopTyping: handleStopTyping,
    onNewSession: handleNewSession,
    onSessionUpdated: handleSessionUpdated,
  });

  // Normalise activeSession._id too so the lookup always matches
  const activeSessionId = activeSession?._id?.toString();
  const isTyping = activeSessionId ? !!typingUsers[activeSessionId] : false;
  const typingName = activeSessionId ? typingUsers[activeSessionId] : undefined;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-slate-50">
      {/* Stats Header */}
      <div className="max-medium-tablet:px-4 max-medium-tablet:py-3 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="max-medium-tablet:p-2 rounded-2xl bg-indigo-600 p-2.5 shadow-lg shadow-indigo-600/20">
            <LayoutDashboard className="max-medium-tablet:h-5 max-medium-tablet:w-5 h-6 w-6 text-white" />
          </div>
          <div className="max-small-mobile:hidden">
            <h1 className="max-medium-mobile:text-lg text-xl font-bold tracking-tight text-slate-900">
              CSO Command Center
            </h1>
            <p className="text-[10px] font-medium tracking-widest text-slate-500 uppercase">
              Real-time Support
            </p>
          </div>
        </div>
        <div className="max-tablet:gap-2 flex items-center gap-6">
          <div className="max-medium-mobile:py-1.5 max-medium-mobile:px-2 flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2">
            <Clock className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-xs font-black text-amber-900">
              {waitingSessions.length}
            </span>
          </div>
          <div className="max-medium-mobile:py-1.5 max-medium-mobile:px-2 flex items-center gap-2 rounded-2xl border border-green-100 bg-green-50 px-4 py-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            <span className="text-xs font-black text-green-900">
              {activeSessions.length}
            </span>
          </div>
          <div className="max-medium-mobile:hidden mx-1 h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowSidebar((s) => !s)}
              className={cn(
                "rounded-xl p-2 transition-all",
                showSidebar
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-400 hover:bg-slate-100",
              )}
            >
              <PanelLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowContext((c) => !c)}
              className={cn(
                "rounded-xl p-2 transition-all",
                showContext
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-400 hover:bg-slate-50",
              )}
            >
              <PanelRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div
          className={cn(
            "max-medium-tablet:absolute relative z-40 h-full border-r border-slate-200 bg-white transition-all duration-300 ease-in-out",
            showSidebar
              ? "max-mobile:w-full w-80 translate-x-0"
              : "w-0 -translate-x-full overflow-hidden",
          )}
        >
          <ChatSidebar
            activeSessionId={activeSession?._id}
            onSelectSession={setActiveSession}
          />
          <button
            className="max-mobile:hidden absolute top-4 right-4 rounded-full bg-slate-100 p-2"
            onClick={() => setShowSidebar(false)}
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>

        {/* Main Chat Panel */}
        <div className="relative z-10 flex min-h-0 flex-1 flex-col bg-white">
          {activeSession ? (
            <ChatWindow
              session={activeSession}
              isTyping={isTyping}
              typingName={typingName}
              leftAction={
                !showSidebar && (
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="max-mobile:hidden rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
                  >
                    <PanelLeft className="h-5 w-5" />
                  </button>
                )
              }
              rightAction={
                !showContext && (
                  <button
                    onClick={() => setShowContext(true)}
                    className="max-mobile:hidden rounded-xl bg-slate-100 p-2 text-slate-600 transition-colors hover:bg-slate-200"
                  >
                    <Info className="h-5 w-5" />
                  </button>
                )
              }
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center bg-slate-50 p-6 text-center text-slate-400">
              <div className="max-mobile:h-20 max-mobile:w-20 max-mobile:rounded-4xl max-mobile:mb-6 mb-8 flex h-24 w-24 rotate-3 items-center justify-center rounded-[2.5rem] bg-white shadow-xl">
                <MessageCircle className="max-mobile:h-10 max-mobile:w-10 h-12 w-12 text-slate-200" />
              </div>
              <h3 className="max-mobile:text-lg mb-2 text-xl font-black text-slate-900">
                No Active Conversation
              </h3>
              <p className="max-w-xs text-sm leading-relaxed text-slate-500">
                Select a customer from the sidebar to begin providing support.
              </p>
              <button
                onClick={() => setShowSidebar(true)}
                className="max-mobile:block mt-6 hidden rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/20"
              >
                View Conversations
              </button>
            </div>
          )}
        </div>

        {/* Right Context Panel */}
        <div
          className={cn(
            "max-small-desktop:absolute max-tablet:relative max-medium-tablet:absolute right-0 z-40 h-full border-l border-slate-200 bg-white transition-all duration-300 ease-in-out",
            showContext
              ? "max-mobile:w-full w-80 translate-x-0"
              : "w-0 translate-x-full overflow-hidden",
          )}
        >
          <ChatContextPanel
            session={activeSession}
            onSessionUpdate={handleSessionUpdate}
          />
          {/* Mobile Close Button */}
          <button
            onClick={() => setShowContext(false)}
            className="max-mobile:hidden absolute top-4 right-4 rounded-full bg-slate-100 p-2 lg:hidden"
          >
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSODashboard;
