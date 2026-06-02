import { MessageCircle, Search, UserIcon } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import cn from "../../../utils/cn";
import {
  chatKeys,
  useGetAllSessions,
  useGetBulkUnreadCounts,
} from "../../../hooks/useChatService";
import type { ChatSession } from "../../../chat.types";

interface ChatSidebarProps {
  activeSessionId?: string;
  onSelectSession: (session: ChatSession) => void;
}

const STATUS_FILTERS = ["all", "waiting", "active", "closed"] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

const ChatSidebar = ({ activeSessionId, onSelectSession }: ChatSidebarProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const queryClient = useQueryClient();

  const { sessions, isPending } = useGetAllSessions({
    status: statusFilter === "all" ? undefined : statusFilter,
  });

  const sessionIds = sessions.map((s) => s._id);
  const { counts: unreadCounts } = useGetBulkUnreadCounts(sessionIds);

  const filtered = sessions.filter((s) =>
    s.customer.fullname.toLowerCase().includes(search.toLowerCase()),
  );

  // Zero the unread badge immediately when the CSO opens a session
  const handleSelectSession = (session: ChatSession) => {
    queryClient.setQueryData(
      chatKeys.unreadCounts(),
      (old: Record<string, number> | undefined) => {
        if (!old) return old;
        return { ...old, [session._id]: 0 };
      },
    );
    onSelectSession(session);
  };

  return (
    <div className="flex h-full w-full flex-col bg-slate-50/50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Messages
          </h2>
          <div className="rounded-full bg-slate-100 p-2">
            <MessageCircle className="h-5 w-5 text-slate-600"/>
          </div>
        </div>
        <div className="relative mb-3">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-xl border-none bg-slate-100 py-2 pr-4 pl-9 text-sm transition-all focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        {/* Status filter tabs */}
        <div className="flex gap-1">
          {STATUS_FILTERS.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={cn(
                "flex-1 rounded-lg py-1 text-[10px] font-bold uppercase tracking-wider transition-all",
                statusFilter === status
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:bg-slate-100",
              )}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Session list */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {isPending ? (
          <div className="flex flex-col gap-3 p-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <MessageCircle className="h-8 w-8 opacity-20" />
            </div>
            <p className="text-sm font-medium">No conversations found</p>
          </div>
        ) : (
          filtered.map((session) => {
            const isActive = session._id === activeSessionId;
            const unread = unreadCounts[session._id] ?? 0;
            const hasUnread = unread > 0;

            return (
              <button
                key={session._id}
                onClick={() => handleSelectSession(session)}
                className={cn(
                  "group relative flex w-full items-start gap-3 border-b border-slate-100 p-4 text-left transition-all",
                  isActive ? "z-10 bg-white shadow-sm" : "hover:bg-white/80",
                )}
              >
                {isActive && (
                  <div className="absolute top-0 bottom-0 left-0 w-1 rounded-r-full bg-blue-600" />
                )}
                <div className="relative shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-200 shadow-sm transition-transform group-hover:scale-105">
                    <UserIcon className="h-6 w-6 text-slate-500" />
                  </div>
                  <div
                    className={cn(
                      "absolute -right-0.5 -bottom-0.5 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm",
                      session.customer.status === "active"
                        ? "bg-green-500"
                        : "bg-slate-300",
                    )}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={cn(
                          "truncate text-slate-900 capitalize",
                          hasUnread ? "font-bold" : "font-semibold",
                        )}
                      >
                        {session.customer.fullname}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 rounded border px-1 py-0.5 text-[8px] font-bold uppercase",
                          session.status === "waiting"
                            ? "border-amber-100 bg-amber-50 text-amber-600"
                            : session.status === "active"
                              ? "border-green-100 bg-green-50 text-green-600"
                              : "border-slate-100 bg-slate-50 text-slate-500",
                        )}
                      >
                        {session.status}
                      </span>
                    </div>
                    <span className="ml-1 shrink-0 text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                      {moment(session.updatedAt).format("hh:mm a")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "flex-1 truncate text-sm",
                        hasUnread
                          ? "font-medium text-slate-900"
                          : "text-slate-500",
                      )}
                    >
                      {session.type === "request_linked" && session.freightRequest
                        ? `${session.freightRequest.originPort} → ${session.freightRequest.destinationPort}`
                        : "General enquiry"}
                    </p>
                    {hasUnread && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white shadow-sm">
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ChatSidebar;