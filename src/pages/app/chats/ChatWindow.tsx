import { Check, CheckCheck, Send, UserIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ChatSession } from "../../../chat.types";
import { useUser } from "../../../hooks/useAuthService";
import { useGetMessages } from "../../../hooks/useChatService";
import { socketService } from "../../../services/socket/socket.service";
import cn from "../../../utils/cn";

// ─── ChatWindow ───────────────────────────────────────────────────────────────
//
// Changes from original:
//   - Accepts session prop (replaces all hardcoded values)
//   - Loads real message history via useGetMessages
//   - Sends messages via socketService.emit.sendMessage
//   - Typing indicator emitted on input change, cleared on send
//   - Message status shown via Check / CheckCheck icons
//   - Auto-scrolls to bottom on new messages
// ─────────────────────────────────────────────────────────────────────────────

interface ChatWindowProps {
  session: ChatSession;
  isTyping?: boolean;
  typingName?: string;
  leftAction?: ReactNode;
  rightAction?: ReactNode;
}

// Debounce delay for stop_typing signal
const STOP_TYPING_DELAY = 1500;

const ChatWindow = ({
  session,
  isTyping = false,
  typingName,
  leftAction,
  rightAction,
}: ChatWindowProps) => {
  const { user } = useUser();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const stopTypingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isCSO = user?.role === "admin";

  const { messages, isPending, hasMore, loadEarlierMessages } = useGetMessages(
    session._id,
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Auto-resize textarea height as content grows
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, [input]);

  // ── Input handlers ─────────────────────────────────────────────────────────

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);

      socketService.emit.typing(session._id);

      if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
      stopTypingTimer.current = setTimeout(() => {
        socketService.emit.stopTyping(session._id);
      }, STOP_TYPING_DELAY);
    },
    [session._id],
  );

  const handleSend = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!input.trim()) return;

      socketService.emit.sendMessage(session._id, input.trim());
      setInput("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
      socketService.emit.stopTyping(session._id);
    },
    [input, session._id],
  );

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (stopTypingTimer.current) clearTimeout(stopTypingTimer.current);
    };
  }, []);

  const isClosed = session.status === "closed";
  // CSO cannot send messages until they have accepted (status: active)
  // Customer cannot send on a closed session
  const isInputDisabled = isClosed || session.status === "waiting";

  // ── Header label ───────────────────────────────────────────────────────────
  const headerName = isCSO
    ? session.customer.fullname
    : session.assignedCSO?.fullname === undefined
      ? "Support"
      : session.assignedCSO?.fullname;

  const headerStatus =
    session.status === "waiting"
      ? "Waiting for support..."
      : session.status === "active"
        ? "Connected"
        : "Session closed";

  return (
    <div className="relative flex h-full flex-1 flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 p-4 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {leftAction}
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-blue-100 shadow-sm">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            {session.status === "active" && (
              <div className="absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 shadow-sm" />
            )}
          </div>
          <div>
            <h3 className="truncate font-bold text-slate-900 capitalize">
              {headerName}
            </h3>
            <span className="text-[11px] font-medium tracking-wider text-slate-500 uppercase">
              {headerStatus}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {rightAction}
          {/* <button className="rounded-xl p-2.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600">
            <Phone className="h-5 w-5" />
          </button>
          <button className="rounded-xl p-2.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600">
            <Video className="h-5 w-5" />
          </button>
          <button className="rounded-xl p-2.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600">
            <MoreVertical className="h-5 w-5" />
          </button> */}
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto bg-slate-50/50 p-6">
        {/* Load earlier messages */}
        {hasMore && (
          <div className="flex justify-center">
            <button
              onClick={loadEarlierMessages}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50"
            >
              Load earlier messages
            </button>
          </div>
        )}

        {isPending ? (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={cn(
                  "h-12 w-2/3 animate-pulse rounded-2xl bg-slate-100",
                  i % 2 === 0 && "ml-auto",
                )}
              />
            ))}
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message) => {
              const isMe = message.sender._id === user?._id;
              const isCSOMessage = message.senderRole === "cso";

              // System messages render as timeline markers
              if (message.type === "system") {
                return (
                  <motion.div
                    key={message._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center justify-center"
                  >
                    <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-center text-[11px] font-medium text-slate-400">
                      {message.content}
                    </span>
                  </motion.div>
                );
              }

              return (
                <motion.div
                  key={message._id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex items-end gap-2",
                    isMe ? "flex-row-reverse" : "flex-row",
                  )}
                >
                  <div className="mb-5 flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-200">
                    <UserIcon className="h-3.5 w-3.5 text-slate-900" />
                  </div>
                  <div
                    className={cn(
                      "flex max-w-[75%] flex-col",
                      isMe ? "items-end" : "items-start",
                    )}
                  >
                    <div
                      className={cn(
                        "mb-1 flex items-center gap-1.5 px-1",
                        isMe ? "flex-row-reverse" : "flex-row",
                      )}
                    >
                      <span className="text-xs font-bold text-slate-700 capitalize">
                        {isMe ? "You" : message.sender.fullname}
                      </span>
                      {isCSOMessage && (
                        <span className="rounded border border-indigo-200 bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold tracking-wider text-indigo-600 uppercase">
                          Support
                        </span>
                      )}
                      {!isCSOMessage && !isMe && (
                        <span className="rounded border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-slate-500 uppercase">
                          Customer
                        </span>
                      )}
                    </div>
                    <div
                      className={cn(
                        "px-4 py-3 text-sm whitespace-pre-wrap shadow-sm",
                        isMe
                          ? isCSOMessage
                            ? "rounded-2xl rounded-br-none bg-indigo-600 text-white"
                            : "rounded-2xl rounded-br-none bg-blue-600 text-white"
                          : isCSOMessage
                            ? "rounded-2xl rounded-bl-none border border-l-4 border-slate-100 border-l-indigo-500 bg-white text-slate-800"
                            : "rounded-2xl rounded-bl-none border border-slate-100 bg-white text-slate-800",
                      )}
                    >
                      {message.content}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 px-1">
                      <span className="text-[10px] font-medium text-slate-400 uppercase">
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      {isMe && (
                        <span
                          className={cn(
                            message.status === "read"
                              ? "text-blue-500"
                              : "text-slate-300",
                          )}
                        >
                          {message.status === "sent" ? (
                            <Check className="h-3 w-3" />
                          ) : (
                            <CheckCheck className="h-3 w-3" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {/* Typing indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 text-xs font-medium text-slate-400"
          >
            <div className="flex gap-1 capitalize">
              {[0, 150, 300].map((delay) => (
                <span
                  key={delay}
                  className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-300"
                  style={{ animationDelay: `${delay}ms` }}
                />
              ))}
            </div>
            {typingName ?? "Someone"} is typing...
          </motion.div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 bg-white p-4">
        {isClosed ? (
          <div className="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-slate-100 p-3 text-center text-sm font-medium text-slate-500">
            This conversation has been closed. You can no longer send messages.
          </div>
        ) : session.status === "waiting" && isCSO ? (
          // CSO must accept the session before they can send messages
          <div className="mx-auto max-w-4xl rounded-xl border border-amber-100 bg-amber-50 p-3 text-center text-sm font-medium text-amber-700">
            Accept this chat to start sending messages.
          </div>
        ) : (
          <form
            onSubmit={handleSend}
            className="mx-auto flex max-w-4xl items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-2 transition-all focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/5"
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              disabled={isInputDisabled}
              placeholder="Type your message here..."
              rows={1}
              className="flex-1 resize-none bg-transparent px-3 py-1 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              style={{ maxHeight: "120px", overflowY: "auto" }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isInputDisabled}
              className="mb-0.5 shrink-0 self-end rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        )}
        <p className="mt-3 text-center text-[10px] font-medium tracking-widest text-slate-400 uppercase">
          End-to-end encrypted support chat
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;
