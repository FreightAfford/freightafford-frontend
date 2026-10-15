import { ArrowRight } from "lucide-react";
import moment from "moment";
import type { ReactNode } from "react";
import cn from "../../utils/cn";
import { containersLabel, money } from "../../utils/format";

// Cell contents shared by the request and booking tables. Each renders inside
// a TableCell, so they only handle the two-line layout and fallbacks.

const Muted = ({ children }: { children: ReactNode }) => (
  <span className="text-slate-400 italic">{children}</span>
);

// A main value with a muted line under it.
export const StackedCell = ({
  primary,
  secondary,
  title,
  className,
  primaryClassName,
}: {
  primary: ReactNode;
  secondary?: ReactNode;
  title?: string;
  className?: string;
  primaryClassName?: string;
}) => (
  <div className={cn("max-w-56 min-w-0", className)} title={title}>
    <p className={cn("truncate font-medium text-slate-900", primaryClassName)}>
      {primary}
    </p>
    {secondary && (
      <p className="mt-0.5 truncate text-xs text-slate-500">{secondary}</p>
    )}
  </div>
);

type RouteProps = {
  originPort?: string;
  originPortCode?: string;
  destinationPort?: string;
  destinationPortCode?: string;
};

// "CNSHA → NGLOS" over the port names. Legacy requests have no codes, so
// those show the names as the main line instead.
export const RouteCell = ({
  originPort,
  originPortCode,
  destinationPort,
  destinationPortCode,
}: RouteProps) => {
  if (!originPort && !destinationPort) return <Muted>—</Muted>;

  const hasCodes = Boolean(originPortCode && destinationPortCode);
  const names = `${originPort ?? "—"} → ${destinationPort ?? "—"}`;

  return (
    <div className="max-w-60 min-w-0" title={names}>
      <p
        className={cn(
          "text-harbour flex items-center gap-1.5 font-semibold",
          hasCodes ? "font-mono text-[13px] tracking-wide" : "capitalize",
        )}
      >
        <span className="truncate">
          {hasCodes ? originPortCode : originPort}
        </span>
        <ArrowRight
          aria-label="to"
          className="h-3.5 w-3.5 shrink-0 text-slate-400"
        />
        <span className="truncate">
          {hasCodes ? destinationPortCode : destinationPort}
        </span>
      </p>
      {hasCodes && (
        <p className="mt-0.5 truncate text-xs text-slate-500 capitalize">
          {names}
        </p>
      )}
    </div>
  );
};

// The customer's price, or the counter offer with their price struck out.
export const PriceCell = ({
  proposed,
  counter,
  status,
}: {
  proposed?: number;
  counter?: number;
  status?: string;
}) => {
  const isCountered = status === "countered" && typeof counter === "number";

  if (!isCountered)
    return (
      <span className="font-semibold text-slate-900">{money(proposed)}</span>
    );

  return (
    <div>
      <p className="font-semibold text-purple-700" title="Counter offer">
        {money(counter)}
      </p>
      <p className="mt-0.5 text-xs text-slate-400 line-through">
        {money(proposed)}
      </p>
    </div>
  );
};

// A date with an optional muted line, or a muted fallback when unset.
export const DateCell = ({
  date,
  secondary,
  fallback = "TBA",
}: {
  date?: string | Date | null;
  secondary?: ReactNode;
  fallback?: string;
}) => (
  <div>
    <p className="font-medium text-slate-900">
      {date ? moment(date).format("ll") : <Muted>{fallback}</Muted>}
    </p>
    {secondary && <p className="mt-0.5 text-xs text-slate-500">{secondary}</p>}
  </div>
);

// Booking rows. `booking.freightRequest` is populated by the list endpoints.

export const BookingRefCell = ({ booking }: { booking: any }) => (
  <StackedCell
    primary={booking.bookingNumber}
    primaryClassName="text-brand font-semibold"
    secondary={
      booking.carrierBookingNumber
        ? `Carrier No. ${booking.carrierBookingNumber}`
        : `Booked ${moment(booking.createdAt).format("ll")}`
    }
  />
);

export const BookingCargoCell = ({ booking }: { booking: any }) => {
  const request = booking.freightRequest;
  if (!request?.containerSize) return <Muted>—</Muted>;

  return (
    <StackedCell
      primary={containersLabel(
        request.containerQuantity,
        request.containerSize,
      )}
      secondary={<span className="capitalize">{request.commodity}</span>}
      title={request.commodity}
    />
  );
};

export const CarrierCell = ({ booking }: { booking: any }) =>
  booking.shippingLine ? (
    <StackedCell
      primary={booking.shippingLine}
      secondary={
        booking.vessel ? (
          <span className="capitalize">{booking.vessel}</span>
        ) : (
          "Vessel TBA"
        )
      }
      title={booking.vessel}
    />
  ) : (
    <Muted>TBA</Muted>
  );

export const SailingCell = ({ booking }: { booking: any }) => (
  <DateCell
    date={booking.sailingDate}
    secondary={
      booking.eta ? `ETA ${moment(booking.eta).format("ll")}` : undefined
    }
  />
);
