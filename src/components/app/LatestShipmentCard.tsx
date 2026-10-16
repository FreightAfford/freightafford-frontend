import {
  ArrowRight,
  CalendarClock,
  Clock,
  Radar,
  Ship,
  ShieldCheck,
} from "lucide-react";
import moment from "moment";
import { Link } from "react-router";
import { useGetBookingMaerskEvents } from "../../hooks/useBookingService";
import { useKycStatus } from "../../hooks/useKycService";
import { isDemoTracking } from "../../services/api/maerskMock";
import {
  trackedProgress,
  voyageMoving,
  voyageProgress,
} from "../../utils/voyage";
import LaneStatus from "./details/LaneStatus";
import RouteLane from "./details/RouteLane";
import StatusBadge from "./StatusBadge";

export type LatestShipment = {
  _id: string;
  bookingNumber: string;
  status: string;
  shippingLine?: string;
  vessel?: string;
  sailingDate?: string;
  eta?: string;
  carrierBookingNumber?: string;
  containers?: unknown[];
  maerskSync?: { lastSyncedAt?: string };
  freightRequest?: {
    originPort?: string;
    destinationPort?: string;
    originPortCode?: string;
    destinationPortCode?: string;
  };
};

const day = (value: string) => moment(value).format("D MMM YYYY");
// Maersk reports times in the port's local offset — keep them in port time.
const portDay = (value: string) => moment.parseZone(value).format("D MMM YYYY");

const FooterItem = ({
  icon: Icon,
  children,
}: {
  icon: typeof Ship;
  children: React.ReactNode;
}) => (
  <span className="inline-flex items-center gap-1.5">
    <Icon aria-hidden="true" className="h-4 w-4 text-[#8fb8e8]" />
    {children}
  </span>
);

// The customer's newest shipment on the Overview: the same route lane as
// Booking Details, fed by live Maersk events when the customer can track.
const LatestShipmentCard = ({
  shipment,
}: {
  shipment: LatestShipment | null;
}) => {
  const kyc = useKycStatus();
  const demo = isDemoTracking();
  const request = shipment?.freightRequest;
  const hasReference =
    !!shipment?.carrierBookingNumber || !!shipment?.containers?.length;
  const showsTracking = demo || shipment?.shippingLine === "Maersk";
  const locked = kyc.isPending || !kyc.canTrack;
  // Same query and cache as the Booking Details tracking panel.
  const { tracking } = useGetBookingMaerskEvents(
    shipment?._id ?? "",
    !!shipment && showsTracking && !locked && (hasReference || demo),
    {
      origin: request?.originPort,
      originCode: request?.originPortCode,
      destination: request?.destinationPort,
      destinationCode: request?.destinationPortCode,
      vessel: shipment?.vessel,
      sailingDate: shipment?.sailingDate,
    },
  );

  if (!shipment) return null;

  // The server applies Maersk's status on every fetch; show it straight away.
  const status = tracking?.bookingStatus ?? shipment.status;
  const booking = { ...shipment, status };
  const latestVessel = [...(tracking?.events ?? [])]
    .reverse()
    .find((e) => e.classifier === "ACT" && e.vessel?.name)?.vessel?.name;
  const vessel = shipment.vessel ?? latestVessel;
  const arrival = tracking?.summary.arrival;
  const arrived = tracking ? tracking.summary.hasArrived : false;

  const eta =
    arrived && arrival
      ? `Arrived ${portDay(arrival.at)}`
      : shipment.eta
        ? `ETA ${day(shipment.eta)}`
        : arrival
          ? `ETA ${portDay(arrival.at)} (est.)`
          : shipment.sailingDate && status !== "delivered"
            ? `Sails ${day(shipment.sailingDate)}`
            : null;
  const footer = [
    vessel && (
      <FooterItem key="vessel" icon={Ship}>
        {vessel}
      </FooterItem>
    ),
    eta && (
      <FooterItem key="eta" icon={CalendarClock}>
        {eta}
      </FooterItem>
    ),
    tracking && !demo && (
      <FooterItem key="synced" icon={Clock}>
        Live from Maersk
        {shipment.maerskSync?.lastSyncedAt &&
          `, updated ${moment(shipment.maerskSync.lastSyncedAt).fromNow()}`}
      </FooterItem>
    ),
    showsTracking && hasReference && locked && !kyc.isPending && (
      <FooterItem key="verify" icon={ShieldCheck}>
        <Link
          to="/app/customer/verification"
          className="font-semibold text-white underline-offset-2 hover:underline"
        >
          Verify your business to see live Maersk events
        </Link>
      </FooterItem>
    ),
  ].filter(Boolean);

  return (
    <section aria-labelledby="latest-shipment-title" className="mb-2">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-3.5">
          {/* A signal dot on the tile while Maersk data is coming in. */}
          <span className="bg-brand/10 text-brand relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl">
            <Radar aria-hidden="true" className="h-6 w-6" />
            {tracking && (
              <span
                aria-hidden="true"
                className="absolute -top-1 -right-1 flex h-3.5 w-3.5"
              >
                <span className="bg-kelp absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 motion-reduce:hidden" />
                <span className="bg-kelp relative inline-flex h-3.5 w-3.5 rounded-full ring-2 ring-white" />
              </span>
            )}
          </span>
          <div className="min-w-0">
            <h2
              id="latest-shipment-title"
              className="text-lg leading-tight font-bold text-slate-900 @xl:text-xl"
            >
              Latest shipment
            </h2>
            <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm font-semibold text-slate-600 tabular-nums">
              {shipment.bookingNumber}
              <StatusBadge
                status={status === "awaiting_confirmation" ? "pending" : status}
              />
              {tracking && demo && (
                <span className="bg-ochre/15 rounded-full px-2 py-0.5 text-xs font-semibold text-[#9a6a0c]">
                  Demo data
                </span>
              )}
            </p>
          </div>
        </div>
        <Link
          to={`/app/customer/bookings/${shipment._id}`}
          className="text-brand inline-flex items-center gap-1 text-sm font-semibold hover:underline"
        >
          View booking
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      </div>

      <RouteLane
        origin={{ name: request?.originPort, code: request?.originPortCode }}
        destination={{
          name: request?.destinationPort,
          code: request?.destinationPortCode,
        }}
        progress={trackedProgress(tracking) ?? voyageProgress(booking)}
        moving={voyageMoving(booking, tracking)}
        middle={<LaneStatus tracking={tracking} status={status} />}
        footer={footer.length ? footer : undefined}
      />
    </section>
  );
};

export default LatestShipmentCard;
