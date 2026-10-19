import { ChevronDown, Ship } from "lucide-react";
import type { Moment } from "moment";
import { useId, useState } from "react";
import type { VesselCall } from "../../../services/api/schedule";
import cn from "../../../utils/cn";
import { tidyName } from "../../../utils/routes";
import { callStatus } from "../../../utils/schedule";
import { callVoyage } from "../../../utils/vessels";
import CallTime from "./CallTime";
import { DeadlineTiles, NextStep, StatusBadge } from "./CargoDeadlines";

interface VesselCallRowProps {
  call: VesselCall;
  now: Moment;
  // The vessel has left this port, or is in it now
  left: boolean;
  here: boolean;
  last: boolean;
}

// One port on the vessel's rotation, on a rail that runs down the list: a
// grey dot for ports it has left, the ship where it is now.
const VesselCallRow = ({ call, now, left, here, last }: VesselCallRowProps) => {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const { status, next } = callStatus(call, now);

  return (
    <li className="relative grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 @xl:grid-cols-[2rem_minmax(0,1fr)] @xl:gap-x-4">
      {/* The rail */}
      <span aria-hidden="true" className="relative flex justify-center">
        {!last && (
          <span
            className={cn(
              "absolute top-6 -bottom-3 border-l-2 @xl:-bottom-4",
              left ? "border-slate-300" : "border-dashed border-slate-300",
            )}
          />
        )}
        {here ? (
          <span className="bg-brand ring-brand/20 relative mt-4 flex h-7 w-7 items-center justify-center rounded-full text-white ring-4 @xl:h-8 @xl:w-8">
            <Ship className="h-4 w-4" />
          </span>
        ) : (
          <span
            className={cn(
              "relative mt-5 h-3.5 w-3.5 rounded-full border-2",
              left
                ? "border-slate-300 bg-slate-300"
                : "border-harbour bg-white",
            )}
          />
        )}
      </span>

      <article
        aria-label={`${call.port.name}${here ? ", vessel is here now" : ""}`}
        className={cn(
          // Sized by its own width, not the page's: the rail and the
          // sidebar take space the page width doesn't show
          "@container rounded-xl border bg-white px-4 py-4 shadow-[0_1px_2px_rgb(15_23_43/0.05)] @xl:px-5",
          here ? "border-brand/40 ring-brand/10 ring-2" : "border-slate-200",
        )}
      >
        <div
          className={cn(
            // Phone: port, then arrival and departure side by side, voyage
            // below. Wider: the times and voyage in one row. Widest: all in
            // one row.
            "grid grid-cols-2 gap-x-4 gap-y-3 @md:grid-cols-3 @2xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.75fr)] @2xl:gap-x-6",
            left && "opacity-70",
          )}
        >
          <div className="col-span-2 min-w-0 @md:col-span-3 @2xl:col-span-1">
            <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span className="font-display text-[1.0625rem] font-bold text-slate-900">
                {call.port.name}
                {call.port.country && (
                  <span className="font-normal text-slate-500">
                    , {call.port.country}
                  </span>
                )}
              </span>
              {here && (
                <span className="bg-brand/10 text-brand rounded-full px-2 py-0.5 text-xs font-semibold">
                  Vessel is here
                </span>
              )}
            </h3>
            {call.terminal && (
              <p className="text-sm wrap-break-word text-slate-600">
                {tidyName(call.terminal)}
              </p>
            )}
          </div>
          <CallTime time={call.arrival} label="Arrival" />
          <CallTime time={call.departure} label="Departure" />
          <div className="col-span-2 min-w-0 @md:col-span-1">
            <p className="text-xs text-slate-500">Voyage</p>
            <p className="font-semibold whitespace-nowrap text-slate-900 tabular-nums">
              {callVoyage(call)}
            </p>
          </div>
        </div>

        {/* Ports it has left need no deadlines */}
        {!left && (
          <>
            {/* Badge, next step and button in one row on wide cards; on
                narrow ones the next step drops below the other two */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-3">
              <StatusBadge status={status} />
              {/* The badge already says when there are no deadlines */}
              {status !== "unknown" && (
                <div className="order-last min-w-0 basis-full @2xl:order-none @2xl:flex-1 @2xl:basis-auto">
                  <NextStep status={status} next={next} now={now} />
                </div>
              )}
              {call.cutOffs.length > 0 && (
                <button
                  type="button"
                  onClick={() => setOpen((value) => !value)}
                  aria-expanded={open}
                  aria-controls={detailsId}
                  className="text-brand focus-visible:ring-brand/40 ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-md text-sm font-semibold whitespace-nowrap outline-none hover:underline focus-visible:ring-2"
                >
                  <ChevronDown
                    aria-hidden="true"
                    className={cn(
                      "h-4 w-4 transition-transform motion-reduce:transition-none",
                      open && "rotate-180",
                    )}
                  />
                  {open ? "Hide deadlines" : "Show deadlines"}
                </button>
              )}
            </div>
            {open && (
              <div id={detailsId}>
                <DeadlineTiles cutOffs={call.cutOffs} next={next} now={now} />
              </div>
            )}
          </>
        )}
      </article>
    </li>
  );
};

export default VesselCallRow;
