import {
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Package,
  Shield,
  UserIcon,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import type { ChatSession } from "../../../chat.types";
import StatusBadge from "../../../components/app/StatusBadge";
import {
  useAcceptSession,
  useCloseSession,
  useGetAvailableCSOs,
  useReassignSession,
} from "../../../hooks/useChatService";
import cn from "../../../utils/cn";

// ─── ChatContextPanel ─────────────────────────────────────────────────────────
//
// Changes from original:
//   - Accepts session prop and onSessionUpdate callback
//   - Accept / Close / Reassign buttons wired to real mutations
//   - Reassign shows a dropdown of available CSOs
//   - All hardcoded values replaced with session data
// ─────────────────────────────────────────────────────────────────────────────

interface ChatContextPanelProps {
  session: ChatSession | null;
  onSessionUpdate: (session: ChatSession | null) => void;
}

const ChatContextPanel = ({
  session,
  onSessionUpdate,
}: ChatContextPanelProps) => {
  const [showReassignDropdown, setShowReassignDropdown] = useState(false);

  const { acceptSession, isPending: isAccepting } = useAcceptSession();
  const { closeSession, isPending: isClosing } = useCloseSession();
  const { reassignSession, isPending: isReassigning } = useReassignSession();
  const { csos, isPending: isCSOsLoading } = useGetAvailableCSOs();

  if (!session) {
    return (
      <div className="flex w-full flex-col items-center justify-center bg-slate-50 p-8 text-center text-slate-400">
        <Package className="mb-4 h-12 w-12 opacity-20" />
        <p className="text-sm font-medium">
          Select a conversation to view customer context.
        </p>
      </div>
    );
  }

  const { customer, freightRequest, booking } = session;

  const handleAccept = () => {
    acceptSession(session._id, {
      onSuccess: (updated) => {
        // Update local state immediately — don't wait for socket event
        onSessionUpdate(updated);
      },
    });
  };

  const handleClose = () => {
    closeSession(session._id, {
      onSuccess: () => {
        // Clear active session from dashboard immediately
        onSessionUpdate(null);
      },
    });
  };

  const handleReassign = (toCSOId: string) => {
    reassignSession(
      { sessionId: session._id, payload: { toCSOId } },
      {
        onSuccess: () => {
          setShowReassignDropdown(false);
          // Clear active session — it's now assigned to someone else
          onSessionUpdate(null);
        },
      },
    );
  };

  return (
    <div className="flex h-full w-full flex-col overflow-auto bg-white">
      {/* Customer Profile */}
      <div className="border-b border-slate-200 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            Customer Details
          </h3>
          <Link
            to={`/app/admin/users/${customer._id}`}
            className="text-blue-600 hover:text-blue-700"
          >
            <ExternalLink className="h-4 w-4" />
          </Link>
        </div>
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-slate-100 shadow-sm">
            <UserIcon className="h-7 w-7 text-slate-400" />
          </div>
          <div className="min-w-0">
            <h4 className="truncate font-bold text-slate-900 capitalize">
              {customer.fullname}
            </h4>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="rounded border border-blue-100 bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold tracking-wider text-blue-600 uppercase">
                customer
              </span>
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  customer.status === "active"
                    ? "bg-green-500"
                    : "bg-slate-300",
                )}
              />
            </div>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sm text-slate-600">
            <Mail className="h-4.5 w-4.5 text-slate-400" />
            <span className="truncate">{customer.email}</span>
          </div>
          {customer.companyName && (
            <div className="flex items-start gap-3 text-sm text-slate-600">
              <Shield className="h-4.5 w-4.5 text-slate-400" />
              <span className="line-clamp-2">{customer.companyName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Related Request */}
      {freightRequest ? (
        <div className="border-b border-slate-200 bg-slate-50/50 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
              Related Request
            </h3>
            <Link
              to={`/app/admin/requests/${freightRequest._id}`}
              className="text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          <div className="rounded-xl bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-slate-900">Info</span>
              <StatusBadge status={freightRequest.status} />
            </div>
            <div className="mb-3 space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4.5 w-4.5 text-slate-400" />
                <div className="flex-1">
                  <p className="font-medium text-slate-500">Origin</p>
                  <p className="line-clamp-2 font-bold text-slate-900 capitalize">
                    {freightRequest.originPort}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="mt-0.5 h-4.5 w-4.5 text-slate-400" />
                <div className="flex-1">
                  <p className="font-medium text-slate-500">Destination</p>
                  <p className="line-clamp-2 font-bold text-slate-900 capitalize">
                    {freightRequest.destinationPort}
                  </p>
                </div>
              </div>
            </div>
            <p className="rounded-lg bg-slate-50 p-2 text-sm text-slate-500 italic">
              {freightRequest.containerQuantity} x{" "}
              {freightRequest.containerSize}
            </p>
          </div>
        </div>
      ) : (
        <div className="border-b border-slate-200 bg-slate-50/50 p-6">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            Related Request
          </h3>
          <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4 text-center text-sm text-slate-400 shadow-sm">
            No freight request associated with this chat.
          </div>
        </div>
      )}

      {/* Booking Info */}
      {booking ? (
        <div className="border-b border-slate-200 p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="mb-4 text-xs font-bold tracking-widest text-slate-400 uppercase">
              Booking Info
            </h3>
            <Link
              to={`/app/admin/bookings/${booking._id}`}
              className="text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Booking ID</span>
              <span className="font-bold text-slate-900">
                {booking.bookingNumber}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Vessel</span>
              <span className="font-bold text-slate-900">
                {booking.vessel ?? "TBA"}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Status</span>
              <span className="font-bold text-slate-900 capitalize">
                {booking.status === "awaiting_confirmation"
                  ? "pending"
                  : booking.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="mb-1 text-[11px] font-bold text-slate-400 uppercase">
                  ETD
                </p>
                <p className="text-sm font-bold text-slate-900 italic">
                  {booking.sailingDate ? (
                    <>{new Date(booking.sailingDate!).toLocaleDateString()}</>
                  ) : (
                    "TBA"
                  )}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="mb-1 text-[11px] font-bold text-slate-400 uppercase">
                  S. Line
                </p>
                <p className="text-sm font-bold text-slate-900 capitalize italic">
                  {booking.shippingLine ?? "TBA"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-b border-slate-200 p-6">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            Booking Info
          </h3>
          <div className="mt-4 rounded-xl border border-slate-100 bg-white p-4 text-center text-sm text-slate-400 shadow-sm">
            No booking associated with this chat.
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-auto space-y-3 p-6">
        {session.status === "waiting" && (
          <button
            onClick={handleAccept}
            disabled={isAccepting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-60"
          >
            {isAccepting && <Loader2 className="h-4 w-4 animate-spin" />}
            Accept Chat
          </button>
        )}

        {session.status !== "closed" && (
          <>
            <button
              onClick={handleClose}
              disabled={isClosing}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-100 active:scale-95 disabled:opacity-60"
            >
              {isClosing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Close Chat
            </button>

            {/* Reassign */}
            <div className="relative">
              <button
                onClick={() => setShowReassignDropdown((s) => !s)}
                className="w-full rounded-xl border border-slate-100 bg-slate-50 py-3 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
              >
                Reassign Chat
              </button>

              {showReassignDropdown && (
                <div className="absolute right-0 bottom-full left-0 mb-2 rounded-xl border border-slate-100 bg-white shadow-xl">
                  {isCSOsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    </div>
                  ) : csos.length === 0 ? (
                    <p className="p-4 text-center text-sm text-slate-400">
                      No other CSOs available
                    </p>
                  ) : (
                    <div className="max-h-48 overflow-y-auto p-2">
                      {csos.map((cso) => (
                        <button
                          key={cso._id}
                          onClick={() => handleReassign(cso._id)}
                          disabled={isReassigning}
                          className="flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm transition-all hover:bg-slate-50 disabled:opacity-60"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100">
                            <UserIcon className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-bold text-slate-900 capitalize">
                              {cso.fullname}
                            </p>
                            <p className="truncate text-xs text-slate-400">
                              {cso.email}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatContextPanel;
