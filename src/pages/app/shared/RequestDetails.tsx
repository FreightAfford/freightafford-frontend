import {
  ArrowLeft,
  Ban,
  CalendarClock,
  CalendarDays,
  Check,
  CheckCircle2,
  Container,
  DollarSign,
  HandCoins,
  History,
  Mail,
  MessageCircle,
  MessageSquareText,
  NotebookPen,
  Ship,
  User,
  UserRound,
  X,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import Modal from "../../../components/Modal";
import SmallLoader from "../../../components/SmallLoader";
import CounterOfferForm from "../../../components/app/CounterOfferForm";
import RejectRequestForm from "../../../components/app/RejectRequestForm";
import StatusBadge from "../../../components/app/StatusBadge";
import {
  BackLink,
  MetaItem,
  PageHeader,
  Panel,
  Row,
} from "../../../components/app/details/DetailParts";
import ProgressTrack, {
  type TrackStep,
} from "../../../components/app/details/ProgressTrack";
import RouteLane from "../../../components/app/details/RouteLane";
import CargoPanel from "../../../components/app/details/CargoPanel";
import { useUser } from "../../../hooks/useAuthService";
import { useConfirm } from "../../../hooks/useConfirm";
import { containersLabel, initials, money } from "../../../utils/format";
import {
  useAcceptFreightRequest,
  useGetFreightRequest,
  useRespondToCounter,
} from "../../../hooks/useFreightService";

const day = (value?: string) =>
  value ? moment(value).format("D MMM YYYY") : undefined;
const stamp = (value?: string) =>
  value ? moment(value).format("D MMM YYYY, h:mm a") : undefined;

// Submitted → priced (or countered) → accepted, with rejection or expiry
// stopping the track at the last step.
const requestSteps = (
  request: { status: string; createdAt?: string; adminActionAt?: string },
  forCustomer: boolean,
): TrackStep[] => {
  const { status } = request;
  const open = status === "pending" || status === "countered";
  return [
    { label: "Submitted", detail: day(request.createdAt), state: "done" },
    {
      label: status === "countered" ? "Counter offer sent" : "Pricing review",
      detail:
        status === "pending"
          ? forCustomer
            ? "Our team is reviewing your price"
            : "Waiting for a price decision"
          : status === "countered"
            ? forCustomer
              ? "Waiting for your answer"
              : "Waiting for the customer's answer"
            : day(request.adminActionAt),
      state: open ? "current" : "done",
    },
    status === "rejected"
      ? {
          label: "Rejected",
          detail: day(request.adminActionAt),
          state: "stopped",
        }
      : status === "expired"
        ? { label: "Expired", state: "stopped" }
        : {
            label: "Accepted",
            detail:
              status === "accepted"
                ? day(request.adminActionAt)
                : "A booking is created on acceptance",
            state: status === "accepted" ? "done" : "upcoming",
          },
  ];
};

const RequestDetails = () => {
  const { user } = useUser();
  const { confirm, ConfirmDialog } = useConfirm();
  const [isCounterModalOpen, setIsCounterModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [isDecision, setIsDecision] = useState<"accept" | "reject">("accept");
  const navigate = useNavigate();
  const { id } = useParams();
  const { request, isPending, error } = useGetFreightRequest(id!);
  const { respondToCounter, isPending: isResponding } = useRespondToCounter(
    request?._id,
  );
  const { acceptFreight, isPending: isAccepting } = useAcceptFreightRequest(
    request?._id,
  );
  const handleDecision = (decision: "accept" | "reject") =>
    respondToCounter({ id: request._id, decision });
  const handleAccept = async () => {
    const ok = await confirm({
      title: "Accept Freight Request",
      message: "Are you sure you want to accept this freight request?",
      confirmText: "Yes, Accept",
      cancelText: "No, Cancel",
      variant: "warning",
    });

    if (ok) acceptFreight(request?._id);
  };

  if (isPending) return <SmallLoader />;

  if (error)
    return (
      <EmptyState
        icon={<X className="h-10 w-10 text-red-500" />}
        title="Error loading requests"
        description={error.message || "An unexpected error has occured."}
        action={
          <Button
            icon={ArrowLeft}
            variant="outline"
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
        }
      />
    );

  const isAdmin = user.role === "admin";
  const isCustomer = user.role === "customer";
  const reference = `REQ-${request._id?.slice(-8).toUpperCase() ?? "N/A"}`;
  const open = request.status === "pending" || request.status === "countered";
  const bookingId =
    typeof request.booking === "string"
      ? request.booking
      : request.booking?._id;
  const total = request.adminCounterPrice || request.proposedPrice || 0;
  const customer = request.customer ?? {};

  const startChat = async () => {
    const ok = await confirm({
      title: "Start Request Chat",
      message: "Do you want to start a chat regarding this freight request?",
      confirmText: "Yes, Start Chat",
      cancelText: "No, Cancel",
      variant: "primary",
    });
    if (!ok) return;
    sessionStorage.setItem("chat_intent", "true");
    navigate("/app/customer/chats", {
      state: {
        chatContext: {
          type: "request_linked",
          freightRequestId: request._id,
          bookingId,
          label: reference,
          route: `${request.originPort} → ${request.destinationPort}`,
        },
      },
    });
  };

  const actionClass = "h-11 rounded-xl px-4 font-semibold";

  return (
    <div className="@container">
      <BackLink label="Back to requests" onClick={() => navigate(-1)} />

      <PageHeader
        kicker="Freight request"
        title={reference}
        badge={<StatusBadge status={request.status} />}
        meta={
          <>
            <MetaItem icon={CalendarDays}>
              Submitted {day(request.createdAt)}
            </MetaItem>
            <MetaItem icon={Container}>
              {containersLabel(
                request.containerQuantity,
                request.containerSize,
              )}
            </MetaItem>
          </>
        }
        actions={
          <>
            {bookingId && (
              <Link to={`/app/${user.role}/bookings/${bookingId}`}>
                <Button
                  icon={Ship}
                  variant="outline"
                  className={`${actionClass} w-full`}
                >
                  View booking
                </Button>
              </Link>
            )}
            {isCustomer && (
              <Button
                icon={MessageCircle}
                onClick={startChat}
                className={actionClass}
              >
                Chat about this request
              </Button>
            )}
            {isAdmin && open && (
              <Button
                icon={CheckCircle2}
                onClick={handleAccept}
                isLoading={isAccepting}
                disabled={isAccepting}
                className={actionClass}
              >
                Accept
              </Button>
            )}
            {isAdmin && request.status === "pending" && (
              <Button
                icon={HandCoins}
                variant="outline"
                onClick={() => setIsCounterModalOpen(true)}
                className={actionClass}
              >
                Counter
              </Button>
            )}
            {isAdmin && open && (
              <Button
                icon={XCircle}
                variant="outline"
                onClick={() => setIsRejectModalOpen(true)}
                className={`${actionClass} border-red-200 text-red-700 hover:bg-red-50`}
              >
                Reject
              </Button>
            )}
          </>
        }
      />

      <RouteLane
        origin={{ name: request.originPort, code: request.originPortCode }}
        destination={{
          name: request.destinationPort,
          code: request.destinationPortCode,
        }}
        progress={request.status === "accepted" ? 0.5 : 0}
        middle={
          <span className="inline-flex items-center gap-1.5">
            <CalendarClock aria-hidden="true" className="h-4 w-4" />
            Cargo ready {day(request.cargoReadyDate)}
          </span>
        }
      />

      <ProgressTrack
        label="Request progress"
        steps={requestSteps(request, isCustomer)}
      />

      {/* Whatever needs an answer sits above the details. */}
      {request.status === "countered" && (
        <section className="border-brand/25 mb-6 rounded-2xl border bg-[#f2f8ff] p-5 @xl:p-6">
          <div className="flex flex-col gap-4 @xl:flex-row @xl:items-start @xl:justify-between">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2.5 text-base font-bold text-slate-900">
                <HandCoins aria-hidden="true" className="text-brand h-5 w-5" />
                Counter offer
              </h2>
              <p className="mt-3 max-w-xl leading-relaxed text-slate-600">
                {request.counterReason || "No message was added."}
              </p>
            </div>
            <div className="shrink-0 @xl:text-right">
              <p className="text-sm text-slate-500">Offered price</p>
              <p className="font-display text-3xl font-bold text-slate-900 tabular-nums">
                {money(request.adminCounterPrice)}
              </p>
            </div>
          </div>
          {isCustomer && (
            <div className="mt-5 flex flex-col gap-2 @md:flex-row">
              <Button
                icon={Check}
                isLoading={isResponding && isDecision === "accept"}
                disabled={isResponding}
                onClick={() => {
                  setIsDecision("accept");
                  handleDecision("accept");
                }}
                className="h-11 rounded-xl px-5 font-semibold"
              >
                Accept counter offer
              </Button>
              <Button
                icon={X}
                variant="outline"
                isLoading={isResponding && isDecision === "reject"}
                disabled={isResponding}
                onClick={() => {
                  setIsDecision("reject");
                  handleDecision("reject");
                }}
                className="h-11 rounded-xl bg-white px-5 font-semibold"
              >
                Decline
              </Button>
            </div>
          )}
        </section>
      )}

      {request.status === "rejected" && (
        <section className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 @xl:p-6">
          <h2 className="flex items-center gap-2.5 text-base font-bold text-red-900">
            <Ban aria-hidden="true" className="h-5 w-5 text-red-600" />
            Request rejected
          </h2>
          <p className="mt-3 leading-relaxed text-red-800">
            {request.rejectionReason ||
              "The counter offer was declined, so this request was closed."}
          </p>
        </section>
      )}

      <CargoPanel cargo={request}>
        <div className="mt-5 border-t border-slate-100 pt-5">
          <p className="flex items-center gap-2 text-sm text-slate-500">
            <NotebookPen
              aria-hidden="true"
              className="h-4 w-4 text-slate-400"
            />
            Notes
          </p>
          {request.notes ? (
            <p className="mt-1.5 max-w-3xl leading-relaxed whitespace-pre-line text-slate-700">
              {request.notes}
            </p>
          ) : (
            <p className="mt-1.5 text-slate-400">No notes were added.</p>
          )}
        </div>
      </CargoPanel>

      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-[minmax(0,1fr)_21rem]">
        {/* Price and customer come first on narrow pages. */}
        <aside className="grid content-start gap-6 @2xl:grid-cols-2 @4xl:order-2 @4xl:grid-cols-1">
          <Panel title="Price" icon={DollarSign} index={1}>
            <div className="space-y-3">
              <Row
                label={isCustomer ? "Your offer" : "Customer's offer"}
                value={money(request.proposedPrice)}
              />
              <Row
                label="Counter offer"
                value={
                  request.adminCounterPrice ? (
                    money(request.adminCounterPrice)
                  ) : (
                    <span className="text-slate-400">None</span>
                  )
                }
              />
              <div className="border-t border-slate-100 pt-3">
                <Row
                  strong
                  label={
                    request.status === "accepted" ? "Agreed price" : "Total"
                  }
                  value={
                    <>
                      {money(total)}
                      <span className="ml-1 text-xs font-medium text-slate-400">
                        USD
                      </span>
                    </>
                  }
                />
              </div>
            </div>
          </Panel>

          <Panel title={isAdmin ? "Customer" : "Account"} icon={User} index={2}>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="bg-harbour font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
              >
                {initials(customer.fullname || request.customerName)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900 capitalize">
                  {customer.fullname || request.customerName || "Unknown"}
                </p>
                <p className="flex items-center gap-1.5 truncate text-sm text-slate-500">
                  <Mail aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">
                    {customer.email || request.customerEmail}
                  </span>
                </p>
              </div>
            </div>
            <Link
              to={
                isAdmin
                  ? `/app/admin/users/${customer._id}`
                  : "/app/customer/profile"
              }
              className="mt-4 block"
            >
              <Button
                icon={UserRound}
                variant="outline"
                className="h-10 w-full rounded-xl font-semibold"
              >
                View profile
              </Button>
            </Link>
          </Panel>
        </aside>

        <div className="min-w-0 space-y-6">
          <Panel title="History" icon={History} index={3}>
            <ol className="space-y-5">
              <li className="flex gap-3">
                <span className="bg-brand/10 text-brand flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <MessageSquareText aria-hidden="true" className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">
                    Request submitted
                  </p>
                  <p className="text-sm text-slate-500">
                    {stamp(request.createdAt)}
                  </p>
                </div>
              </li>
              {request.adminActionAt && (
                <li className="flex gap-3">
                  <span
                    className={
                      request.status === "rejected"
                        ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600"
                        : "bg-kelp/10 text-kelp flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                    }
                  >
                    {request.status === "rejected" ? (
                      <Ban aria-hidden="true" className="h-4 w-4" />
                    ) : request.status === "countered" ? (
                      <HandCoins aria-hidden="true" className="h-4 w-4" />
                    ) : (
                      <Check aria-hidden="true" className="h-4 w-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">
                      {request.status === "accepted"
                        ? "Request accepted, booking created"
                        : request.status === "rejected"
                          ? "Request rejected"
                          : "Counter offer sent"}
                    </p>
                    <p className="text-sm text-slate-500">
                      {stamp(request.adminActionAt)}
                    </p>
                  </div>
                </li>
              )}
            </ol>
          </Panel>
        </div>
      </div>

      <Modal
        isOpen={isCounterModalOpen}
        onClose={() => setIsCounterModalOpen(false)}
        title="Send counter offer"
      >
        <CounterOfferForm
          request={request}
          onCancel={() => setIsCounterModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject freight request"
      >
        <RejectRequestForm
          request={request}
          onCancel={() => setIsRejectModalOpen(false)}
        />
      </Modal>
      {ConfirmDialog}
    </div>
  );
};

export default RequestDetails;
