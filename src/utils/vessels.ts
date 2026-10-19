import moment, { type Moment } from "moment";
import type { VesselCall } from "../services/api/schedule";
import { bestTime } from "./schedule";

const arrivesAt = (call: VesselCall) =>
  bestTime(call.arrival) ?? bestTime(call.departure);
const leavesAt = (call: VesselCall) =>
  bestTime(call.departure) ?? bestTime(call.arrival);

// The vessel has left this port
export const hasLeft = (call: VesselCall, now: Moment) => {
  const leaves = leavesAt(call);
  return !!leaves && moment(leaves).isBefore(now);
};

export type VesselPosition =
  | { state: "in-port"; call: VesselCall; until?: string }
  | { state: "sailing"; to: VesselCall; due?: string };

// Where the vessel is now, going by actual and estimated times: in a port
// on the list, or on its way to the next one. Null once it's past the list.
export const vesselPosition = (
  calls: VesselCall[],
  now: Moment,
): VesselPosition | null => {
  const here = calls.find((call) => {
    const arrives = arrivesAt(call);
    return arrives && !moment(arrives).isAfter(now) && !hasLeft(call, now);
  });
  if (here)
    return { state: "in-port", call: here, until: bestTime(here.departure) };

  const next = calls.find((call) => {
    const arrives = arrivesAt(call);
    return arrives && moment(arrives).isAfter(now);
  });
  return next
    ? { state: "sailing", to: next, due: bestTime(next.arrival) }
    : null;
};

// "638W", or "638W | 641E" when the voyage number changes at the port
export const callVoyage = (call: VesselCall) =>
  call.voyageOut && call.voyageOut !== call.voyageIn
    ? `${call.voyageIn} | ${call.voyageOut}`
    : call.voyageIn;
