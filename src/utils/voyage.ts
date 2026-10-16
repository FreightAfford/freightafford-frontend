import moment from "moment";
import type { MaerskTracking } from "../services/api/booking";

export type VoyageLike = {
  status: string;
  sailingDate?: string;
  eta?: string;
};

// Where the ship sits on the route lane. At sea, it follows the time
// elapsed between departure and arrival when both dates are known.
export const voyageProgress = (booking: VoyageLike) => {
  if (booking.status === "arrived" || booking.status === "delivered") return 1;
  if (booking.status !== "in_transit") return 0;
  const start = moment(booking.sailingDate);
  const end = moment(booking.eta);
  if (!booking.sailingDate || !booking.eta || !end.isAfter(start)) return 0.5;
  const elapsed = moment().diff(start) / end.diff(start);
  return Math.min(0.9, Math.max(0.1, elapsed));
};

// From tracking: how far between departure and arrival the latest actual
// event sits.
export const trackedProgress = (tracking?: MaerskTracking) => {
  if (!tracking?.summary.departure) return undefined;
  if (tracking.summary.hasArrived) return 1;
  if (!tracking.summary.hasDeparted) return 0;
  const latest = [...tracking.events]
    .reverse()
    .find((e) => e.classifier === "ACT");
  const start = moment(tracking.summary.departure.at);
  const end = moment(tracking.summary.arrival?.at);
  if (!latest || !end.isAfter(start)) return 0.5;
  const share = moment(latest.dateTime).diff(start) / end.diff(start);
  return Math.min(0.92, Math.max(0.08, share));
};

// The ship's lane flows while the cargo is at sea.
export const voyageMoving = (booking: VoyageLike, tracking?: MaerskTracking) =>
  tracking
    ? tracking.summary.hasDeparted && !tracking.summary.hasArrived
    : booking.status === "in_transit";
