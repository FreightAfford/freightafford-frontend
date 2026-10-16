import {
  Check,
  ChevronDown,
  Container as ContainerIcon,
  FlaskConical,
  MapPin,
  Radar,
  RefreshCw,
  Ship,
} from "lucide-react";
import moment from "moment";
import { useState } from "react";
import {
  useGetBookingMaerskEvents,
  useSyncBookingMaersk,
} from "../../hooks/useBookingService";
import type { MaerskShipmentEvent } from "../../services/api/booking";
import {
  isDemoTracking,
  setDemoTracking,
  type DemoRoute,
} from "../../services/api/maerskMock";
import cn from "../../utils/cn";
import Button from "../Button";

interface MaerskTrackingTimelineProps {
  bookingId: string;
  isStaff: boolean;
  hasReference: boolean;
  lastSyncedAt?: string;
  // Only used to build the development demo journey.
  route?: DemoRoute;
}

// Maersk reports times in the port's local offset — keep them in port time.
const portTime = (dateTime: string) =>
  moment.parseZone(dateTime).format("D MMM YYYY, HH:mm");
const portDay = (dateTime: string) =>
  moment.parseZone(dateTime).format("D MMM");

const isActual = (e?: MaerskShipmentEvent) => e?.classifier === "ACT";

type Stop = {
  key: string;
  label: string;
  event?: MaerskShipmentEvent;
  minor?: boolean;
};

// The handful of moments people care about, picked out of the raw events.
const milestones = (events: MaerskShipmentEvent[]): Stop[] => {
  const first = (test: (e: MaerskShipmentEvent) => boolean) =>
    events.find(test);
  const last = (test: (e: MaerskShipmentEvent) => boolean) =>
    [...events].reverse().find(test);

  const arrivals = events.filter(
    (e) => e.type === "TRANSPORT" && e.code === "ARRI",
  );
  const finalArrival = arrivals[arrivals.length - 1];
  const stops: Stop[] = [
    {
      key: "pickup",
      label: "Picked up",
      event: first((e) => e.code === "GTOT" && !!e.empty),
    },
    {
      key: "gatein",
      label: "Gated in",
      event: first((e) => e.code === "GTIN" && !e.empty),
    },
    {
      key: "depart",
      label: "Departed",
      event: first((e) => e.type === "TRANSPORT" && e.code === "DEPA"),
    },
    // Ports the cargo changes vessel at, between departure and arrival.
    ...arrivals.slice(0, -1).map((e) => ({
      key: `via-${e.id}`,
      label: `Via ${e.location?.name?.split(",")[0] ?? e.location?.code ?? "port"}`,
      event: e,
      minor: true,
    })),
    { key: "arrive", label: "Arrived", event: finalArrival },
    {
      key: "deliver",
      label: "Delivered",
      event: last((e) => e.code === "GTOT" && !e.empty),
    },
  ];
  return stops.filter((stop) => stop.event || stop.key === "deliver");
};

const place = (e?: MaerskShipmentEvent) =>
  e?.location?.name ?? e?.location?.code ?? "the port";

// Where the cargo is, in one sentence, from the latest actual event.
const whereNow = (
  latest: MaerskShipmentEvent | undefined,
  finalArrival: MaerskShipmentEvent | undefined,
) => {
  if (!latest) return "Waiting for the first update from Maersk.";
  const atFinal =
    !!finalArrival && latest.location?.code === finalArrival.location?.code;
  const vessel = latest.vessel?.name;
  switch (latest.code) {
    case "GTOT":
      return latest.empty
        ? `Empty container picked up at ${place(latest)} for packing.`
        : atFinal
          ? `Delivered. The container left ${place(latest)}.`
          : `Container left ${place(latest)}.`;
    case "GTIN":
      // An empty box coming back after arrival is the end of the journey
      if (latest.empty)
        return isActual(finalArrival)
          ? `Delivered. The empty container was returned to ${place(latest)}.`
          : `Empty container returned to ${place(latest)}.`;
      return `At ${place(latest)}, waiting to be loaded.`;
    case "LOAD":
      return `Loaded${vessel ? ` on ${vessel}` : ""} at ${place(latest)}.`;
    case "DEPA":
      return `At sea${vessel ? ` on ${vessel}` : ""}, after leaving ${place(latest)}.`;
    case "ARRI":
      return atFinal
        ? `Arrived at ${place(latest)}.`
        : `At ${place(latest)}, changing vessels.`;
    case "DISC":
      return atFinal
        ? `Unloaded at ${place(latest)}, waiting for collection.`
        : `Unloaded to change vessels at ${place(latest)}.`;
    default:
      // Document events (booking confirmed, B/L issued) have no location
      return latest.location?.name || latest.location?.code
        ? `${latest.label} at ${place(latest)}.`
        : `${latest.label}.`;
  }
};

// Boxes carrying the cargo, the same rule the server uses to save them: a
// box only ever seen empty (picked up, then swapped) never held this cargo.
const cargoContainers = (events: MaerskShipmentEvent[]) => [
  ...new Set(
    events
      .filter((e) => e.type === "EQUIPMENT" && e.container && e.empty === false)
      .map((e) => e.container!),
  ),
];

const vesselKey = (e: MaerskShipmentEvent) =>
  e.vessel ? `${e.vessel.imo ?? e.vessel.name}|${e.voyage ?? ""}` : null;

// Live Maersk Track & Trace events for a booking. The backend picks the
// carrier booking number or first container to track.
const MaerskTrackingTimeline = ({
  bookingId,
  isStaff,
  hasReference,
  lastSyncedAt,
  route,
}: MaerskTrackingTimelineProps) => {
  const [expanded, setExpanded] = useState(false);
  const demo = isDemoTracking();
  const { tracking, isPending, isFetching, error } = useGetBookingMaerskEvents(
    bookingId,
    hasReference || demo,
    route,
  );
  const { syncBooking, isPending: isSyncing } = useSyncBookingMaersk();

  // Customers don't see the panel until there's something to track
  if (!hasReference && !isStaff && !demo) return null;

  const events = tracking?.events ?? [];
  const latest = [...events].reverse().find(isActual);
  // Where the cargo is comes from movements; a later document event (e.g.
  // "Bill of lading issued") says nothing about its position.
  const latestMove = [...events]
    .reverse()
    .find((e) => isActual(e) && e.type !== "SHIPMENT");
  const stops = milestones(events);
  const latestStop = [...stops].reverse().find((s) => isActual(s.event));
  const finalArrival = [...events]
    .reverse()
    .find((e) => e.type === "TRANSPORT" && e.code === "ARRI");
  const arrived = isActual(finalArrival);
  const containers = cargoContainers(events);
  // Label each event with its box only when there's more than one to tell apart
  const labelContainers =
    new Set(events.map((e) => e.container).filter(Boolean)).size > 1;
  const canSync = (isStaff && hasReference) || demo;

  return (
    <section
      aria-labelledby="tracking-title"
      className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 @xl:p-6"
    >
      <div className="@container">
        <div className="mb-6 flex flex-col gap-4 @2xl:flex-row @2xl:items-start @2xl:justify-between">
          <div className="min-w-0">
            <h2
              id="tracking-title"
              className="flex flex-wrap items-center gap-2.5 text-base font-bold text-slate-900"
            >
              <Radar aria-hidden="true" className="text-brand h-5 w-5" />
              Live tracking
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                Maersk
              </span>
              {demo && (
                <span className="bg-ochre/15 rounded-full px-2 py-0.5 text-xs font-semibold text-[#9a6a0c]">
                  Demo data
                </span>
              )}
            </h2>
            {tracking?.reference && (
              <p className="mt-1 text-sm text-slate-500">
                Tracking{" "}
                <span className="font-medium text-slate-700 tabular-nums">
                  {tracking.reference}
                </span>
                {!demo &&
                  lastSyncedAt &&
                  `, synced ${moment(lastSyncedAt).fromNow()}`}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {import.meta.env.DEV && (
              <Button
                icon={FlaskConical}
                variant="outline"
                onClick={() => {
                  setDemoTracking(!demo);
                  window.location.reload();
                }}
                className="h-10 rounded-xl px-3.5 text-sm font-semibold"
                title="Development only: show a made-up journey"
              >
                {demo ? "Use live data" : "Demo tracking"}
              </Button>
            )}
            {canSync && (
              <Button
                icon={RefreshCw}
                variant="outline"
                onClick={() => syncBooking(bookingId)}
                isLoading={isSyncing || isFetching}
                disabled={isSyncing || isFetching}
                className="h-10 rounded-xl px-3.5 text-sm font-semibold"
                title={
                  demo
                    ? "Move the demo journey on by one event"
                    : "Update dates, vessel and status from Maersk"
                }
              >
                Sync now
              </Button>
            )}
          </div>
        </div>

        {!hasReference && !demo ? (
          <p className="rounded-xl bg-slate-50 p-4 text-slate-600">
            Add the carrier booking number (or a container number) to start live
            tracking from Maersk.
          </p>
        ) : isPending ? (
          <div className="space-y-3" aria-label="Loading tracking events">
            <div className="h-20 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />
            <div className="h-32 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />
          </div>
        ) : error ? (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">
            {error.message ??
              "Live tracking is unavailable right now. Try again in a minute."}
          </p>
        ) : !events.length ? (
          <p className="rounded-xl bg-slate-50 p-4 text-slate-600">
            Maersk hasn't published events for {tracking?.reference} yet. They
            usually appear once the empty container is picked up.
          </p>
        ) : (
          <>
            {/* Where it is now, in plain words */}
            <div className="mb-6 rounded-xl bg-slate-50 px-5 py-4">
              <p className="font-display text-lg leading-snug font-bold text-slate-900 @xl:text-xl">
                {whereNow(latestMove ?? latest, finalArrival)}
              </p>
              <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                {!arrived && finalArrival && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin
                      aria-hidden="true"
                      className="h-4 w-4 text-slate-400"
                    />
                    Expected at {place(finalArrival)} around{" "}
                    {portDay(finalArrival.dateTime)}
                  </span>
                )}
                {containers.length > 0 && (
                  <span className="flex min-w-0 items-start gap-1.5">
                    <ContainerIcon
                      aria-hidden="true"
                      className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
                    />
                    <span className="min-w-0">
                      {containers.length === 1
                        ? "Container"
                        : `${containers.length} containers`}{" "}
                      <span className="font-medium text-slate-700 tabular-nums">
                        {containers.join(", ")}
                      </span>
                    </span>
                  </span>
                )}
                {latest && (
                  <span>
                    Last update {portTime(latest.dateTime)}, port time
                  </span>
                )}
              </p>
            </div>

            {/* Milestone rail */}
            <ol className="mb-6 grid gap-0 @3xl:auto-cols-fr @3xl:grid-flow-col">
              {stops.map((stop, index) => {
                const done = isActual(stop.event);
                const isLatest = stop.key === latestStop?.key;
                const lastItem = index === stops.length - 1;
                const nextDone = !lastItem && isActual(stops[index + 1].event);
                return (
                  <li
                    key={stop.key}
                    aria-current={isLatest ? "step" : undefined}
                    className="relative flex gap-3 pb-4 last:pb-0 @3xl:flex-col @3xl:gap-2 @3xl:pr-3 @3xl:pb-0"
                  >
                    {!lastItem && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "absolute top-7 bottom-0 left-[11px] w-0.5 rounded-full @3xl:top-[11px] @3xl:right-0 @3xl:bottom-auto @3xl:left-8 @3xl:h-0.5 @3xl:w-auto",
                          nextDone ? "bg-kelp" : "bg-slate-200",
                        )}
                      />
                    )}
                    <span
                      className={cn(
                        "relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        isLatest
                          ? "bg-brand motion-safe:animate-signal text-white"
                          : done
                            ? "bg-kelp text-white"
                            : stop.event
                              ? "border-ochre border-2 bg-white"
                              : "border-2 border-slate-200 bg-white",
                        stop.minor && "@3xl:mt-0",
                      )}
                    >
                      {isLatest ? (
                        <Ship aria-hidden="true" className="h-3.5 w-3.5" />
                      ) : done ? (
                        <Check
                          aria-hidden="true"
                          className="h-3.5 w-3.5"
                          strokeWidth={3}
                        />
                      ) : null}
                    </span>
                    <div className="min-w-0 pt-0.5 @3xl:pt-0">
                      <p
                        className={cn(
                          "font-display text-[0.9375rem] font-bold break-words",
                          done || isLatest
                            ? "text-slate-900"
                            : "text-slate-500",
                        )}
                      >
                        {stop.label}
                      </p>
                      {stop.event ? (
                        <p
                          className={cn(
                            "text-sm",
                            done ? "text-slate-500" : "text-[#9a6a0c]",
                          )}
                        >
                          {done ? "" : "Est. "}
                          {portDay(stop.event.dateTime)}
                          {stop.event.location?.code && !stop.minor && (
                            // Port codes only when the rail has room.
                            <span className="@3xl:hidden @5xl:inline">
                              {` · ${stop.event.location.code}`}
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-400">Not yet</p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Every event, oldest first, on request */}
            <div className="border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                aria-expanded={expanded}
                className="text-brand inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
              >
                <ChevronDown
                  aria-hidden="true"
                  className={cn(
                    "h-4 w-4 transition-transform",
                    expanded && "rotate-180",
                  )}
                />
                {expanded
                  ? "Hide event history"
                  : `Show all ${events.length} events`}
              </button>

              {expanded && (
                <ol className="mt-4">
                  {events.map((event, i) => {
                    const actual = isActual(event);
                    const earlier = events[i - 1];
                    const changedVessel =
                      earlier &&
                      vesselKey(event) &&
                      vesselKey(earlier) &&
                      vesselKey(event) !== vesselKey(earlier);
                    const lastRow = i === events.length - 1;
                    return (
                      <li key={event.id}>
                        {changedVessel && (
                          <p className="mb-4 ml-6 flex items-center gap-2 text-xs font-semibold text-slate-400">
                            <span className="h-px flex-1 bg-slate-100" />
                            Changed vessel at {place(event)}
                            <span className="h-px flex-1 bg-slate-100" />
                          </p>
                        )}
                        <div className="relative flex gap-3 pb-4">
                          {!lastRow && (
                            <span
                              aria-hidden="true"
                              className="absolute top-4 bottom-0 left-[5px] w-px bg-slate-200"
                            />
                          )}
                          <span
                            aria-hidden="true"
                            className={cn(
                              "relative mt-1.5 h-3 w-3 shrink-0 rounded-full border-2",
                              actual
                                ? "border-brand bg-brand"
                                : "border-slate-300 bg-white",
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                              <p
                                className={cn(
                                  "font-display font-semibold",
                                  actual ? "text-slate-900" : "text-slate-400",
                                )}
                              >
                                {event.label}
                                {!actual && (
                                  <span className="ml-2 font-sans text-xs font-semibold text-[#9a6a0c]">
                                    {event.classifier === "EST"
                                      ? "Estimated"
                                      : "Planned"}
                                  </span>
                                )}
                              </p>
                              <time
                                dateTime={event.dateTime}
                                className="text-sm text-slate-500 tabular-nums"
                              >
                                {portTime(event.dateTime)}
                              </time>
                            </div>
                            <p className="mt-0.5 text-sm break-words text-slate-500">
                              {[
                                event.location?.name,
                                event.vessel?.name &&
                                  `${event.vessel.name}${event.voyage ? ` ${event.voyage}` : ""}`,
                              ]
                                .filter(Boolean)
                                .join(" · ")}
                            </p>
                            {labelContainers && event.container && (
                              <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-xs font-medium text-slate-600 tabular-nums">
                                {event.container}
                              </span>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default MaerskTrackingTimeline;
