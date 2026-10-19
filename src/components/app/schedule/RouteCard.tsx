import { ChevronDown } from "lucide-react";
import type { Moment } from "moment";
import { useId, useState } from "react";
import type { RouteOption, RouteStop } from "../../../services/api/schedule";
import cn from "../../../utils/cn";
import {
  listJoin,
  routeStatus,
  tidyName,
  transhipmentLabel,
  transhipmentPorts,
  transitLabel,
} from "../../../utils/routes";
import { portDate } from "../../../utils/schedule";
import { DeadlineTiles, NextStep, StatusBadge } from "./CargoDeadlines";
import RouteDetails from "./RouteDetails";
import RouteLine from "./RouteLine";

const LABEL = "text-xs font-medium text-slate-600";

// The date and the terminal, as Maersk shows each end of a route
const End = ({ label, stop }: { label: string; stop: RouteStop }) => (
  <div className="min-w-0">
    <p className={LABEL}>{label}</p>
    <time
      dateTime={stop.at}
      className="block font-semibold whitespace-nowrap text-slate-900 tabular-nums"
    >
      {portDate(stop.at)}
    </time>
    <p className="text-sm wrap-break-word text-slate-600">
      {stop.terminal ? tidyName(stop.terminal) : stop.name}
    </p>
  </div>
);

interface RouteCardProps {
  route: RouteOption;
  now: Moment;
}

// One way to get the cargo there, kept short so sailings are easy to
// compare: when and where it leaves and arrives, the first vessel, how long
// it takes and the next deadline. The route, every deadline and every
// vessel's details open below on request.
const RouteCard = ({ route, now }: RouteCardProps) => {
  const [open, setOpen] = useState(false);
  const detailsId = useId();
  const { status, next } = routeStatus(route, now);
  const first = route.legs.find((leg) => leg.vessel) ?? route.legs[0];
  const otherVessels = route.legs.filter(
    (leg) => leg.vessel && leg !== first,
  ).length;
  const via = transhipmentPorts(route);

  return (
    // Each route is its own card, so one ends clearly before the next
    <li className="rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-[0_1px_2px_rgb(15_23_43/0.05)] @xl:px-5">
      <article
        aria-label={`Departs ${portDate(route.departs.at)}, arrives ${portDate(route.arrives.at)}`}
      >
        {/* The summary is sized by the card's own width; the route below
            keeps the page's */}
        <div className="@container">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3 @xl:grid-cols-[minmax(0,0.9fr)_minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(0,1.3fr)] @xl:gap-x-5 @3xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1.2fr)_auto] @3xl:items-start @3xl:gap-x-6">
            <End label="Departure" stop={route.departs} />
            <End label="Arrival" stop={route.arrives} />
            <div className="min-w-0">
              <p className={LABEL}>Vessel/Voyage</p>
              <p className="text-harbour font-semibold wrap-break-word uppercase">
                {first?.vessel?.name ?? "To be named"}
              </p>
              <p className="text-sm text-slate-600 tabular-nums">
                {first?.voyage}
                {otherVessels > 0 &&
                  ` + ${otherVessels} more ${otherVessels === 1 ? "vessel" : "vessels"}`}
              </p>
            </div>
            <div className="min-w-0">
              <p className={LABEL}>Transit time</p>
              <p className="font-semibold text-slate-900">
                {transitLabel(route)}
              </p>
              <p className="text-sm text-slate-600">
                {transhipmentLabel(route)}
                {via.length > 0 && ` via ${listJoin(via)}`}
              </p>
            </div>
            <div className="col-span-2 @xl:col-span-4 @3xl:col-span-1">
              <StatusBadge status={status} />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3 @xl:flex-row @xl:items-center @xl:justify-between">
            <NextStep status={status} next={next} now={now} />
            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls={detailsId}
              className="text-brand focus-visible:ring-brand/40 inline-flex shrink-0 items-center gap-1.5 self-start rounded-md text-sm font-semibold outline-none hover:underline focus-visible:ring-2 @xl:self-auto"
            >
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "h-4 w-4 transition-transform motion-reduce:transition-none",
                  open && "rotate-180",
                )}
              />
              {open ? "Hide route and deadlines" : "Show route and deadlines"}
            </button>
          </div>
        </div>

        {open && (
          <div id={detailsId} className="mt-4">
            <RouteLine route={route} />
            <DeadlineTiles cutOffs={route.cutOffs} next={next} now={now} />
            <RouteDetails route={route} />
          </div>
        )}
      </article>
    </li>
  );
};

export default RouteCard;
