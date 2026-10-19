import { MapPin, Ship, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type {
  RouteLeg,
  RouteOption,
  RouteStop,
} from "../../../services/api/schedule";
import cn from "../../../utils/cn";
import { flagLabel, legCarrier, tidyName } from "../../../utils/routes";
import { portDate, portHour } from "../../../utils/schedule";

const when = (at: string) => `${portDate(at)} ${portHour(at)}`;

// IMO, flag, built, service and call sign of the vessel on a leg
const VesselFacts = ({ leg }: { leg: RouteLeg }) => {
  const v = leg.vessel;
  const facts = [
    ["IMO Number", v?.imo],
    ["Flag", v?.flag && flagLabel(v.flag)],
    ["Built", v?.builtYear && String(v.builtYear)],
    ["Service", leg.service],
    ["Call Sign", v?.callSign],
  ].filter((f): f is [string, string] => !!f[1]);

  if (!facts.length) return null;

  return (
    <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-medium text-slate-600">{label}</dt>
          <dd className="text-sm font-medium whitespace-nowrap text-slate-900 tabular-nums">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
};

// An arrival (location pin) or a departure (ship), with its details beside
const Event = ({
  icon: Icon,
  tone,
  children,
}: {
  icon: LucideIcon;
  tone: "arrival" | "departure";
  children: ReactNode;
}) => (
  <div className="flex gap-3">
    <span
      aria-hidden="true"
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        tone === "arrival" ? "bg-mist text-harbour" : "bg-brand/10 text-brand",
      )}
    >
      <Icon className="h-4 w-4" />
    </span>
    <div className="min-w-0 flex-1">{children}</div>
  </div>
);

type Stop = { stop: RouteStop; arrival?: string; leaving?: RouteLeg };

const stopsOf = (route: RouteOption): Stop[] => {
  if (!route.legs.length)
    return [
      { stop: route.departs },
      { stop: route.arrives, arrival: route.arrives.at },
    ];
  return [
    ...route.legs.map((leg, i) => ({
      stop: leg.from,
      arrival: i > 0 ? route.legs[i - 1].to.at : undefined,
      leaving: leg,
    })),
    {
      stop: route.legs[route.legs.length - 1].to,
      arrival: route.legs[route.legs.length - 1].to.at,
    },
  ];
};

// Every port on the route with its terminal, when the cargo arrives and
// leaves, and the vessel it leaves on: Maersk's "route details".
const RouteDetails = ({ route }: { route: RouteOption }) => (
  <ol
    aria-label="Route details"
    className="mt-4 rounded-xl border border-slate-200"
  >
    {stopsOf(route).map(({ stop, arrival, leaving }, i, all) => (
      <li
        key={`${stop.code}-${i}`}
        className={cn(
          "grid gap-3 p-4 @2xl:grid-cols-[minmax(0,0.9fr)_minmax(0,2.1fr)] @2xl:gap-6",
          i < all.length - 1 && "border-b border-slate-100",
        )}
      >
        <div className="min-w-0">
          <p className="font-display font-bold text-slate-900">{stop.name}</p>
          {stop.terminal && (
            <p className="text-sm wrap-break-word text-slate-600">
              {tidyName(stop.terminal)}
            </p>
          )}
        </div>
        <div className="min-w-0 space-y-4">
          {arrival && (
            <Event icon={MapPin} tone="arrival">
              <p className="text-xs font-medium text-slate-600">Arrival</p>
              <p className="text-sm font-semibold text-slate-900 tabular-nums">
                {when(arrival)}
              </p>
            </Event>
          )}
          {leaving && (
            <Event icon={Ship} tone="departure">
              <p className="text-xs font-medium text-slate-600">
                {leaving.vessel
                  ? `Departing on ${leaving.vessel.name.toUpperCase()}${leaving.voyage ? ` / ${leaving.voyage}` : ""}`
                  : leaving.mode === "VESSEL"
                    ? "Departing on a vessel Maersk hasn't named yet"
                    : `Departing by ${legCarrier(leaving).toLowerCase()}`}
              </p>
              <p className="text-sm font-semibold text-slate-900 tabular-nums">
                {when(leaving.from.at)}
              </p>
              <VesselFacts leg={leaving} />
            </Event>
          )}
        </div>
      </li>
    ))}
  </ol>
);

export default RouteDetails;
