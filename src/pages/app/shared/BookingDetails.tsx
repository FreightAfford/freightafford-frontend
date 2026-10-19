import {
  Anchor,
  CalendarDays,
  ChartNoAxesGantt,
  Container,
  DollarSign,
  FileSearch,
  History,
  Info,
  Mail,
  MessageCircle,
  Plus,
  Receipt,
  RefreshCw,
  Ship,
  User,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useNavigate, useParams } from "react-router";
import AmendmentsManager from "../../../components/app/AmendmentsManager";
import { BillOfLadingManager } from "../../../components/app/BillOfLadingManager";
import ContainerManifestManager from "../../../components/app/ContainerManifestManager";
import CreateInvoiceForm from "../../../components/app/CreateInvoiceForm";
import MaerskTrackingTimeline from "../../../components/app/MaerskTrackingTimeline";
import StatusBadge from "../../../components/app/StatusBadge";
import UpdateShippingForm from "../../../components/app/UpdateShippingForm";
import UpdateStatusForm from "../../../components/app/UpdateStatusForm";
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
import LaneStatus from "../../../components/app/details/LaneStatus";
import RouteLane from "../../../components/app/details/RouteLane";
import CargoPanel from "../../../components/app/details/CargoPanel";
import LockedTracking from "../../../components/app/details/LockedTracking";
import VoyagePanel from "../../../components/app/details/VoyagePanel";
import Button from "../../../components/Button";
import ErrorState from "../../../components/ErrorState";
import Modal from "../../../components/Modal";
import SmallLoader from "../../../components/SmallLoader";
import { useUser } from "../../../hooks/useAuthService";
import {
  useGetBookingMaerskEvents,
  useGetSingleBooking,
} from "../../../hooks/useBookingService";
import { isDemoTracking } from "../../../services/api/maerskMock";
import { useConfirm } from "../../../hooks/useConfirm";
import { useKycStatus } from "../../../hooks/useKycService";
import { containersLabel, initials, money } from "../../../utils/format";
import { useGetInvoiceByBooking } from "../../../hooks/useInvoiceService";
import {
  trackedProgress,
  voyageMoving,
  voyageProgress,
} from "../../../utils/voyage";

const day = (value?: string) =>
  value ? moment(value).format("D MMM YYYY") : undefined;
const stamp = (value?: string) =>
  value ? moment(value).format("D MMM YYYY, h:mm a") : undefined;

const STAGES = [
  "awaiting_confirmation",
  "confirmed",
  "in_transit",
  "arrived",
  "delivered",
] as const;

type BookingLike = {
  status: string;
  createdAt?: string;
  sailingDate?: string;
  eta?: string;
  updatedAt?: string;
};

// Booked → confirmed → at sea → arrived → delivered. A cancelled booking
// shows where it stopped.
const bookingSteps = (booking: BookingLike): TrackStep[] => {
  if (booking.status === "cancelled")
    return [
      { label: "Booked", detail: day(booking.createdAt), state: "done" },
      { label: "Cancelled", detail: day(booking.updatedAt), state: "stopped" },
    ];

  const at = Math.max(
    0,
    STAGES.indexOf(booking.status as (typeof STAGES)[number]),
  );
  const state = (index: number): TrackStep["state"] =>
    booking.status === "delivered" || index < at
      ? "done"
      : index === at
        ? "current"
        : "upcoming";

  return [
    {
      label: "Booked",
      detail:
        at === 0 ? "Waiting for carrier confirmation" : day(booking.createdAt),
      state: state(0),
    },
    {
      label: "Confirmed",
      detail: at === 1 ? "Ready to sail" : undefined,
      state: state(1),
    },
    {
      label: "In transit",
      detail: booking.sailingDate
        ? `Sails ${day(booking.sailingDate)}`
        : undefined,
      state: state(2),
    },
    {
      label: "Arrived",
      detail: booking.eta ? `ETA ${day(booking.eta)}` : undefined,
      state: state(3),
    },
    { label: "Delivered", state: state(4) },
  ];
};

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const { confirm, ConfirmDialog } = useConfirm();
  const { booking, isPending, sbError } = useGetSingleBooking(id!);
  const { isPending: isLoading, invoice } = useGetInvoiceByBooking(id!);
  // Live tracking is for verified businesses; requests and bookings aren't.
  // Staff always see it. While the customer's status loads, nothing shows.
  const customerView = user?.role === "customer";
  const kyc = useKycStatus(customerView);
  const trackingLocked = customerView && (kyc.isPending || !kyc.canTrack);
  // Same query as the tracking panel (shared cache), used to move the ship.
  const demo = isDemoTracking();
  const hasReference =
    !!booking?.carrierBookingNumber || !!booking?.containers?.length;
  const showsTracking = demo || booking?.shippingLine === "Maersk";
  const demoRoute = {
    origin: booking?.freightRequest?.originPort,
    originCode: booking?.freightRequest?.originPortCode,
    destination: booking?.freightRequest?.destinationPort,
    destinationCode: booking?.freightRequest?.destinationPortCode,
    vessel: booking?.vessel,
    sailingDate: booking?.sailingDate,
  };
  const { tracking } = useGetBookingMaerskEvents(
    id!,
    !!booking && showsTracking && !trackingLocked && (hasReference || demo),
    demoRoute,
  );
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState<boolean>(false);
  const [isUpdateShippingModalOpen, setIsUpdateShippingModalOpen] =
    useState<boolean>(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] =
    useState<boolean>(false);

  if (isPending) return <SmallLoader />;

  if (sbError)
    return <ErrorState resource="this booking" error={sbError} showBack />;

  const isAdmin = user?.role === "admin";
  const isCustomer = user?.role === "customer";
  const request = booking.freightRequest;
  const customer = typeof booking.customer === "object" ? booking.customer : {};
  const agreedPrice = request
    ? request.adminCounterPrice || request.proposedPrice
    : undefined;
  const carrierRef = booking.carrierBookingNumber || booking.mainBookingNumber;

  const startChat = async () => {
    const ok = await confirm({
      title: "Start Booking Chat",
      message: "Do you want to start a chat about this booking?",
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
          // Booking is always tied to a FreightRequest
          freightRequestId:
            request?._id ?? (typeof request === "string" ? request : undefined),
          bookingId: booking._id,
          label: booking.bookingNumber,
          route: request
            ? `${request.originPort} → ${request.destinationPort}`
            : booking.bookingNumber,
        },
      },
    });
  };

  const actionClass = "h-11 rounded-xl px-4 font-semibold";

  return (
    <div className="@container">
      <BackLink label="Back to bookings" onClick={() => navigate(-1)} />

      <PageHeader
        kicker="Booking"
        title={booking.bookingNumber}
        badge={
          <StatusBadge
            status={
              booking.status === "awaiting_confirmation"
                ? "pending"
                : booking.status
            }
          />
        }
        meta={
          <>
            <MetaItem icon={CalendarDays}>
              Booked {day(booking.createdAt)}
            </MetaItem>
            {booking.shippingLine && (
              <MetaItem icon={Anchor}>{booking.shippingLine}</MetaItem>
            )}
            {request && (
              <MetaItem icon={Container}>
                {containersLabel(
                  request.containerQuantity,
                  request.containerSize,
                )}
              </MetaItem>
            )}
          </>
        }
        actions={
          <>
            {isCustomer && (
              <Button
                icon={MessageCircle}
                onClick={startChat}
                className={actionClass}
              >
                Chat about this booking
              </Button>
            )}
            {isAdmin && (
              <>
                <Button
                  icon={Ship}
                  onClick={() => setIsUpdateShippingModalOpen(true)}
                  className={actionClass}
                >
                  Shipping
                </Button>
                <Button
                  icon={ChartNoAxesGantt}
                  variant="outline"
                  onClick={() => setIsUpdateStatusModalOpen(true)}
                  className={actionClass}
                >
                  Status
                </Button>
                <Button
                  icon={Plus}
                  variant="outline"
                  onClick={() => setIsInvoiceModalOpen(true)}
                  className={actionClass}
                >
                  Invoice
                </Button>
              </>
            )}
          </>
        }
      />

      {request && (
        <RouteLane
          origin={{ name: request.originPort, code: request.originPortCode }}
          destination={{
            name: request.destinationPort,
            code: request.destinationPortCode,
          }}
          progress={trackedProgress(tracking) ?? voyageProgress(booking)}
          moving={voyageMoving(booking, tracking)}
          middle={<LaneStatus tracking={tracking} status={booking.status} />}
        />
      )}

      <ProgressTrack label="Booking progress" steps={bookingSteps(booking)} />

      <VoyagePanel
        shippingLine={booking.shippingLine}
        vessel={booking.vessel}
        vesselImo={
          booking.vesselImo ??
          tracking?.events.find((e) => e.vessel?.imo)?.vessel?.imo
        }
        voyage={
          [...(tracking?.events ?? [])]
            .reverse()
            .find((e) => e.classifier === "ACT" && e.voyage)?.voyage
        }
        carrierRef={carrierRef}
        bookingNumber={booking.bookingNumber}
        sailingDate={booking.sailingDate}
        eta={booking.eta ?? tracking?.summary.arrival?.at}
        etaEstimated={
          !booking.eta && tracking?.summary.arrival?.classifier !== "ACT"
        }
      />

      {showsTracking && trackingLocked && !kyc.isPending && (
        <LockedTracking status={kyc.status} nextStep={kyc.nextStep} />
      )}
      {showsTracking && !trackingLocked && (
        <MaerskTrackingTimeline
          bookingId={booking._id}
          isStaff={user?.role === "admin" || user?.role === "cso"}
          hasReference={hasReference}
          lastSyncedAt={booking.maerskSync?.lastSyncedAt}
          route={demoRoute}
        />
      )}

      {request && (
        <CargoPanel cargo={request}>
          <div className="mt-5 border-t border-slate-100 pt-5">
            <ContainerManifestManager
              booking={booking}
              freightRequest={request}
              userRole={user.role}
            />
          </div>

          {request.notes && (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="flex items-center gap-2 text-sm text-slate-500">
                <Info aria-hidden="true" className="h-4 w-4 text-slate-400" />
                Special instructions
              </p>
              <p className="mt-1.5 max-w-3xl leading-relaxed whitespace-pre-line text-slate-700">
                {request.notes}
              </p>
            </div>
          )}
        </CargoPanel>
      )}

      <div className="grid grid-cols-1 gap-6 @4xl:grid-cols-[minmax(0,1fr)_21rem]">
        <aside className="grid content-start gap-6 @2xl:grid-cols-2 @4xl:order-2 @4xl:grid-cols-1">
          <Panel title={isAdmin ? "Customer" : "Account"} icon={User} index={1}>
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="bg-harbour font-display flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
              >
                {initials(customer.companyName || customer.fullname)}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900 capitalize">
                  {customer.companyName || customer.fullname || "Unknown"}
                </p>
                {customer.companyName && customer.fullname && (
                  <p className="truncate text-sm text-slate-500 capitalize">
                    {customer.fullname}
                  </p>
                )}
              </div>
            </div>
            {customer.email && (
              <p className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                <Mail
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-slate-400"
                />
                <span className="truncate">{customer.email}</span>
              </p>
            )}
            {request?._id && (
              <Button
                icon={FileSearch}
                variant="outline"
                className="mt-4 h-10 w-full rounded-xl font-semibold"
                onClick={() =>
                  navigate(`/app/${user.role}/requests/${request._id}`)
                }
              >
                Original request
              </Button>
            )}
          </Panel>

          {request && (
            <Panel title="Price" icon={DollarSign} index={2}>
              <div className="space-y-3">
                <Row
                  label="Customer's offer"
                  value={money(request.proposedPrice)}
                />
                {request.adminCounterPrice && (
                  <Row
                    label="Counter offer"
                    value={money(request.adminCounterPrice)}
                  />
                )}
                <div className="border-t border-slate-100 pt-3">
                  <Row
                    strong
                    label="Agreed price"
                    value={
                      <>
                        {money(agreedPrice)}
                        <span className="ml-1 text-xs font-medium text-slate-400">
                          USD
                        </span>
                      </>
                    }
                  />
                </div>
              </div>
              {isLoading ? (
                <div className="mt-4">
                  <SmallLoader />
                </div>
              ) : invoice ? (
                <Button
                  icon={Receipt}
                  variant="outline"
                  className="mt-4 h-10 w-full rounded-xl font-semibold"
                  onClick={() =>
                    navigate(`/app/${user.role}/invoices/${booking._id}`)
                  }
                >
                  View invoice
                </Button>
              ) : (
                <p className="mt-4 text-sm text-slate-500">
                  No invoice has been issued yet.
                </p>
              )}
            </Panel>
          )}

          <Panel title="Activity" icon={History} index={3}>
            <ol className="space-y-4">
              <li className="flex gap-3">
                <span className="bg-brand/10 text-brand flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                  <CalendarDays aria-hidden="true" className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-900">
                    Booking created
                  </p>
                  <p className="text-sm text-slate-500">
                    {stamp(booking.createdAt)}
                  </p>
                </div>
              </li>
              {booking.updatedAt && booking.updatedAt !== booking.createdAt && (
                <li className="flex gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                    <RefreshCw aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      Last updated
                    </p>
                    <p className="text-sm text-slate-500">
                      {stamp(booking.updatedAt)}
                    </p>
                  </div>
                </li>
              )}
            </ol>
          </Panel>
        </aside>

        <div className="min-w-0 space-y-6">
          <BillOfLadingManager bookingId={booking._id} role={isAdmin} />

          <AmendmentsManager bookingId={booking._id} role={user.role} />
        </div>
      </div>

      <Modal
        title="Update shipping details"
        isOpen={isUpdateShippingModalOpen}
        onClose={() => setIsUpdateShippingModalOpen(false)}
      >
        <UpdateShippingForm
          bookingId={booking._id}
          initialData={{
            shippingLine: booking.shippingLine,
            vessel: booking.vessel,
            vesselImo: booking.vesselImo,
            sailingDate: booking.sailingDate,
            carrierBookingNumber: booking.carrierBookingNumber,
          }}
          onCancel={() => setIsUpdateShippingModalOpen(false)}
        />
      </Modal>
      <Modal
        title="Update booking status"
        isOpen={isUpdateStatusModalOpen}
        onClose={() => setIsUpdateStatusModalOpen(false)}
      >
        <UpdateStatusForm
          initialStatus={booking.status}
          bookingId={booking._id}
          onCancel={() => setIsUpdateStatusModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        title="Create invoice"
      >
        <CreateInvoiceForm
          bookingId={booking._id}
          onCancel={() => setIsInvoiceModalOpen(false)}
        />
      </Modal>
      {ConfirmDialog}
    </div>
  );
};

// One line under the lane: the latest tracking event, or the booking status.
export default BookingDetails;
