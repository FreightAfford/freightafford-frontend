import { ChevronDown, Clock, Lock, Ship } from "lucide-react";
import moment, { type Moment } from "moment";
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
import {
  deadlineState,
  portDate,
  portHour,
  type CallStatus,
} from "../../../utils/schedule";
import { DeadlineTiles, StatusBadge } from "./CargoDeadlines";
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

// One line under the summary saying what the customer has to do next
const NextStep = ({
  status,
  next,
  now,
}: {
  status: CallStatus;
  next?: { label: string; at: string };
  now: Moment;
}) => {
  if (next) {
    const soon = deadlineState(next.at, now) === "soon";
    return (
      <p
        className={cn(
          "flex items-start gap-2 text-sm",
          soon ? "text-[#9a6a0c]" : "text-slate-700",
        )}
      >
        <Clock
          aria-hidden="true"
          className={cn(
            "mt-0.5 h-4 w-4 shrink-0",
            soon ? "text-[#9a6a0c]" : "text-brand",
          )}
        />
        <span>
          Next deadline:{" "}
          <span className="font-semibold">
            {next.label}, {portDate(next.at)} {portHour(next.at)}
          </span>{" "}
          (closes {moment(next.at).from(now)})
        </span>
      </p>
    );
  }
  const text: Partial<Record<CallStatus, string>> = {
    // Closed when any deadline every cargo must meet has passed
    closed: "Too late to book: a cargo deadline for this sailing has passed.",
    departed: "This sailing has already departed.",
    unknown: "Maersk hasn't published the deadlines for this sailing yet.",
  };
  return (
    <p className="flex items-start gap-2 text-sm text-slate-600">
      {status === "departed" ? (
        <Ship aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <Lock aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      {text[status]}
    </p>
  );
};

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
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] @4xl:items-start @4xl:gap-x-6">
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
          <div className="col-span-2 @4xl:col-span-1">
            <StatusBadge status={status} />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3 @2xl:flex-row @2xl:items-center @2xl:justify-between">
          <NextStep status={status} next={next} now={now} />
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls={detailsId}
            className="text-brand focus-visible:ring-brand/40 inline-flex shrink-0 items-center gap-1.5 self-start rounded-md text-sm font-semibold outline-none hover:underline focus-visible:ring-2 @2xl:self-auto"
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
