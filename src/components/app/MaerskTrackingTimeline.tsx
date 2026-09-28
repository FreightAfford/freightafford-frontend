import { Radar, RefreshCw, Ship } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import {
  useGetBookingMaerskEvents,
  useSyncBookingMaersk,
} from "../../hooks/useBookingService";
import type {
  MaerskMilestone,
  MaerskShipmentEvent,
} from "../../services/api/booking";
import cn from "../../utils/cn";
import Button from "../Button";

interface MaerskTrackingTimelineProps {
  bookingId: string;
  isStaff: boolean;
  hasReference: boolean;
  multipleContainers: boolean;
  lastSyncedAt?: string;
}

const COLLAPSED_COUNT = 6;

// Maersk reports times in the port's local offset — keep them in port time.
const portTime = (dateTime: string) =>
  moment.parseZone(dateTime).format("ll, HH:mm");

const vesselKey = (e: MaerskShipmentEvent) =>
  e.vessel ? `${e.vessel.imo ?? e.vessel.name}|${e.voyage ?? ""}` : null;

const Milestone = ({
  label,
  milestone,
}: {
  label: string;
  milestone: MaerskMilestone | null;
}) => (
  <div className="min-w-0 rounded-xl border border-slate-100 bg-slate-50 p-4">
    <div className="flex items-center justify-between gap-2">
      <p className="text-xs font-medium tracking-wider text-slate-400 uppercase">
        {label}
      </p>
      {milestone && milestone.classifier !== "ACT" && (
        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
          Estimated
        </span>
      )}
    </div>
    {milestone ? (
      <>
        <p className="mt-1 font-semibold text-slate-900">
          {portTime(milestone.at)}
        </p>
        <p className="mt-0.5 text-sm break-words text-slate-500">
          {milestone.locationName}
          {milestone.locationCode && (
            <span className="ml-1 font-mono text-xs text-slate-400">
              {milestone.locationCode}
            </span>
          )}
        </p>
      </>
    ) : (
      <p className="mt-1 font-medium text-slate-400">Not published yet</p>
    )}
  </div>
);

// Live Maersk Track & Trace events for a booking. Only rendered for Maersk
// bookings; the backend picks the carrier booking number or first container.
const MaerskTrackingTimeline = ({
  bookingId,
  isStaff,
  hasReference,
  multipleContainers,
  lastSyncedAt,
}: MaerskTrackingTimelineProps) => {
  const [expanded, setExpanded] = useState(false);
  const { tracking, isPending, error } = useGetBookingMaerskEvents(
    bookingId,
    hasReference,
  );
  const { syncBooking, isPending: isSyncing } = useSyncBookingMaersk();

  // Customers don't see the panel until there's something to track
  if (!hasReference && !isStaff) return null;

  const events = tracking?.events ?? [];
  const hidden =
    !expanded && events.length > COLLAPSED_COUNT + 2
      ? events.length - COLLAPSED_COUNT
      : 0;
  const visible = hidden ? events.slice(hidden) : events;
  const current = tracking?.summary.arrival ?? tracking?.summary.departure;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
            <Radar className="text-brand h-7 w-7" />
            Live Tracking
            <span className="text-sm font-medium text-slate-400">· Maersk</span>
          </h2>
          {tracking?.reference && (
            <p className="mt-1 text-sm text-slate-500">
              Tracking{" "}
              <span className="font-mono text-slate-700">
                {tracking.reference}
              </span>
              {lastSyncedAt && ` · synced ${moment(lastSyncedAt).fromNow()}`}
            </p>
          )}
        </div>
        {isStaff && hasReference && (
          <Button
            variant="outline"
            onClick={() => syncBooking(bookingId)}
            isLoading={isSyncing}
            disabled={isSyncing}
            className="flex items-center gap-2"
            title="Update dates, vessel and status from Maersk"
          >
            <RefreshCw className="h-4 w-4" /> Sync now
          </Button>
        )}
      </div>

      {!hasReference ? (
        <p className="rounded-xl bg-slate-50 p-4 text-slate-600">
          Add the carrier booking number (or a container number) to enable live
          tracking from Maersk.
        </p>
      ) : isPending ? (
        <div className="space-y-3" aria-label="Loading tracking events">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none"
            />
          ))}
        </div>
      ) : error ? (
        <p className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          {error.message ??
            "Live tracking is unavailable right now. Try again in a minute."}
        </p>
      ) : !events.length ? (
        <p className="rounded-xl bg-slate-50 p-4 text-slate-600">
          Maersk hasn't published events for{" "}
          <span className="font-mono">{tracking?.reference}</span> yet. They
          usually appear once the empty container is picked up.
        </p>
      ) : (
        <>
          <div className="max-small-mobile:grid-cols-1 mb-6 grid grid-cols-2 gap-3">
            <Milestone label="Departure" milestone={tracking!.summary.departure} />
            <Milestone label="Arrival" milestone={tracking!.summary.arrival} />
          </div>

          {current?.vessel?.name && (
            <p className="mb-5 flex items-center gap-2 text-sm text-slate-600">
              <Ship className="h-4 w-4 shrink-0 text-slate-400" />
              <span>
                {tracking!.summary.hasArrived ? "Arrived on" : "Vessel"}{" "}
                <span className="font-medium text-slate-900">
                  {current.vessel.name}
                </span>
                {current.voyage && ` · voyage ${current.voyage}`}
              </span>
            </p>
          )}

          {hidden > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="text-brand mb-4 text-sm font-medium hover:underline"
            >
              Show {hidden} earlier events
            </button>
          )}

          <ol className="relative">
            {visible.map((event, i) => {
              const key = vesselKey(event);
              const prevKey = [...events.slice(0, hidden + i)]
                .reverse()
                .map(vesselKey)
                .find(Boolean);
              const transshipment =
                key && prevKey && key !== prevKey && event.code === "LOAD";
              const actual = event.classifier === "ACT";
              const last = i === visible.length - 1;

              return (
                <li key={event.id}>
                  {transshipment && (
                    <div className="mb-4 ml-8 flex items-center gap-2 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                      <span className="h-px flex-1 bg-slate-100" />
                      Transshipment · {event.location?.code ?? "port"}
                      <span className="h-px flex-1 bg-slate-100" />
                    </div>
                  )}
                  <div className="relative flex gap-4 pb-5">
                    {!last && (
                      <span className="absolute top-4 bottom-0 left-[7px] w-px bg-slate-200" />
                    )}
                    <span
                      className={cn(
                        "relative mt-1 h-4 w-4 shrink-0 rounded-full border-2",
                        actual
                          ? "border-brand bg-brand"
                          : "border-slate-300 bg-white",
                      )}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                        <p
                          className={cn(
                            "font-medium",
                            actual ? "text-slate-900" : "text-slate-500",
                          )}
                        >
                          {event.label}
                          {!actual && (
                            <span className="ml-2 text-xs font-medium text-amber-600">
                              {event.classifier === "EST"
                                ? "Estimated"
                                : "Planned"}
                            </span>
                          )}
                        </p>
                        <time
                          dateTime={event.dateTime}
                          className="text-sm text-slate-500"
                        >
                          {portTime(event.dateTime)}
                        </time>
                      </div>
                      {(event.location?.name || event.vessel?.name) && (
                        <p className="mt-0.5 text-sm break-words text-slate-500">
                          {event.location?.name}
                          {event.location?.code && (
                            <span className="ml-1 font-mono text-xs text-slate-400">
                              {event.location.code}
                            </span>
                          )}
                          {event.vessel?.name && (
                            <>
                              {event.location?.name && " · "}
                              {event.vessel.name}
                              {event.voyage && ` ${event.voyage}`}
                            </>
                          )}
                        </p>
                      )}
                      {multipleContainers && event.container && (
                        <span className="mt-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-600">
                          {event.container}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}
    </div>
  );
};

export default MaerskTrackingTimeline;
