import moment, { type Moment } from "moment";
import type { PortCall, ScheduleTime } from "../services/api/schedule";

// Maersk reports times in the port's local offset — keep them in port time.
export const portDate = (dateTime: string) =>
  moment.parseZone(dateTime).format("D MMM YYYY");
export const portHour = (dateTime: string) =>
  moment.parseZone(dateTime).format("HH:mm");

// "+01:00" → "UTC+1", "+05:30" → "UTC+5:30"
export const utcLabel = (offset: string) => {
  const match = /^([+-])(\d{2}):(\d{2})$/.exec(offset);
  if (!match) return "";
  const [, sign, hours, minutes] = match;
  return `UTC${sign}${Number(hours)}${minutes === "00" ? "" : `:${minutes}`}`;
};

// The most reliable time we have: actual, then estimated, then planned.
export const bestTime = (time: ScheduleTime) =>
  time.actual ?? time.estimated ?? time.planned;

// The deadlines shown for every call, in the order shippers meet them.
// `short` keeps a long name on one line inside its tile.
export const DEADLINES: { code: string; label: string; short?: string }[] = [
  { code: "ECP", label: "Empty container pickup" },
  { code: "FCO", label: "Container gate-in" },
  { code: "DCO", label: "Shipping instructions" },
  { code: "VCO", label: "Verified gross mass" },
  {
    code: "DGC",
    label: "Dangerous goods declaration",
    short: "Dangerous goods",
  },
];

export const deadline = (call: PortCall, code: string) =>
  call.cutOffs.find((c) => c.code === code)?.at;

// "639S | 642N", or the one voyage when import and export match.
export const voyageLabel = (call: PortCall) =>
  call.services
    .map((s) =>
      s.voyageOut && s.voyageOut !== s.voyageIn
        ? `${s.voyageIn} | ${s.voyageOut}`
        : s.voyageIn,
    )
    .join(", ");

// How far the best time has moved from the plan, in whole days; shifts
// under a day count as on time. Positive is late.
export const shiftDays = (time: ScheduleTime) => {
  const best = time.actual ?? time.estimated;
  if (!best || !time.planned) return 0;
  const hours = moment(best).diff(moment(time.planned), "hours", true);
  return Math.abs(hours) < 24
    ? 0
    : Math.sign(hours) * Math.round(Math.abs(hours) / 24);
};

// Under two days to go counts as closing soon.
export const SOON_HOURS = 48;

export type DeadlineState = "open" | "soon" | "closed";

export const deadlineState = (at: string, now: Moment): DeadlineState => {
  const hours = moment(at).diff(now, "hours", true);
  if (hours <= 0) return "closed";
  return hours < SOON_HOURS ? "soon" : "open";
};

export type CallStatus =
  | "accepting"
  | "soon"
  | "closed"
  | "departed"
  | "unknown";

// The dangerous goods deadline only applies to dangerous cargo, so it never
// closes a sailing for everyone else.
const APPLIES_TO_ALL_CARGO = (code: string) => code !== "DGC";

// Whether cargo can still make this call. Cargo has to meet every deadline,
// so one that has passed closes the sailing; otherwise the earliest one
// still open decides.
export const callStatus = (
  call: PortCall,
  now: Moment,
): {
  status: CallStatus;
  next?: { label: string; at: string };
} => {
  if (call.departure.actual && moment(call.departure.actual).isBefore(now))
    return { status: "departed" };

  const published = DEADLINES.flatMap(({ code, label }) => {
    const at = deadline(call, code);
    return at ? [{ code, label, at }] : [];
  }).sort((a, b) => moment(a.at).diff(moment(b.at)));
  if (!published.length) return { status: "unknown" };

  const missed = published.some(
    (d) =>
      APPLIES_TO_ALL_CARGO(d.code) && deadlineState(d.at, now) === "closed",
  );
  const next = published.find((d) => deadlineState(d.at, now) !== "closed");
  if (missed || !next) return { status: "closed" };
  return {
    status: deadlineState(next.at, now) === "soon" ? "soon" : "accepting",
    next,
  };
};

// Still worth showing to someone with cargo to ship.
export const isBookable = (status: CallStatus) =>
  status === "accepting" || status === "soon" || status === "unknown";

// Calls in order of arrival (departure when there's no arrival).
export const byArrival = (a: PortCall, b: PortCall) =>
  moment(bestTime(a.arrival) ?? bestTime(a.departure)).diff(
    moment(bestTime(b.arrival) ?? bestTime(b.departure)),
  );
