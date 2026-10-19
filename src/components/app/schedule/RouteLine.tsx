import { Ship } from "lucide-react";
import moment from "moment";
import { Fragment } from "react";
import type { RouteOption, RouteStop } from "../../../services/api/schedule";
import cn from "../../../utils/cn";
import { daysBetween, daysLabel, legCarrier } from "../../../utils/routes";

// "22 Oct, 09:30" in the port's own time
const shortTime = (at: string) => moment.parseZone(at).format("D MMM, HH:mm");
const shortDay = (at: string) => moment.parseZone(at).format("D MMM");

type Stop = {
  stop: RouteStop;
  kind: "origin" | "via" | "destination";
  // At a transhipment port: when the cargo arrives there
  arrivedAt?: string;
};

const stopsOf = (route: RouteOption): Stop[] => [
  { stop: route.legs[0]?.from ?? route.departs, kind: "origin" },
  ...route.legs.slice(1).map((leg, i) => ({
    stop: leg.from,
    kind: "via" as const,
    arrivedAt: route.legs[i].to.at,
  })),
  {
    stop: route.legs[route.legs.length - 1]?.to ?? route.arrives,
    kind: "destination",
  },
];

const LANE = "border-dashed border-slate-300";

// The line runs across once the card has room for it, down before that.
// Three or more legs need a wider card than one or two. Both sets are
// written out in full so Tailwind sees every class.
const LAYOUTS = {
  roomy: {
    box: "pb-0 @3xl:pb-4",
    list: "@3xl:flex-row @3xl:items-start",
    stop: "@3xl:w-28 @3xl:shrink-0 @3xl:flex-col @3xl:items-center @3xl:gap-2 @3xl:text-center",
    across: "hidden @3xl:block",
    down: "@3xl:hidden",
    dot: "@3xl:mt-0",
    stopText: "@3xl:pb-0",
    leg: "@3xl:flex-1 @3xl:px-1 @3xl:pb-0",
    legText: "@3xl:pt-4 @3xl:text-center",
    legName: "",
  },
  long: {
    box: "pb-0 @min-[910px]:pb-4",
    list: "@min-[910px]:flex-row @min-[910px]:items-start",
    stop: "@min-[910px]:w-28 @min-[910px]:shrink-0 @min-[910px]:flex-col @min-[910px]:items-center @min-[910px]:gap-2 @min-[910px]:text-center",
    across: "hidden @min-[910px]:block",
    down: "@min-[910px]:hidden",
    dot: "@min-[910px]:mt-0",
    stopText: "@min-[910px]:pb-0",
    leg: "@min-[910px]:flex-1 @min-[910px]:pb-0",
    legText: "@min-[910px]:pt-4 @min-[910px]:text-center",
    // Measured in px: the app shrinks rem below 1000px. Vessel names a size
    // down, so three legs fit across
    legName: "@min-[910px]:text-xs @min-[910px]:tracking-tight",
  },
};

type Layout = (typeof LAYOUTS)["roomy"];

const StopItem = ({
  item,
  last,
  l,
}: {
  item: Stop;
  last: boolean;
  l: Layout;
}) => {
  const first = item.kind === "origin";
  const wait = item.arrivedAt && daysBetween(item.arrivedAt, item.stop.at);
  return (
    <li className={cn("relative flex gap-3", l.stop)}>
      {/* The lane through the dot: across on wide cards, down on narrow */}
      <span
        aria-hidden="true"
        className={cn("absolute top-[5px] border-t-2", l.across, LANE)}
        style={{ left: first ? "50%" : 0, right: last ? "50%" : 0 }}
      />
      {!last && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-4 bottom-0 left-[5px] border-l-2",
            l.down,
            LANE,
          )}
        />
      )}
      <span
        aria-hidden="true"
        className={cn(
          "relative z-10 mt-1 h-3 w-3 shrink-0 rounded-full",
          l.dot,
          item.kind === "origin" && "bg-brand",
          item.kind === "destination" && "bg-harbour",
          item.kind === "via" && "border-2 border-slate-400 bg-white",
        )}
      />
      <div className={cn("min-w-0 pb-4", l.stopText)}>
        <p className="text-sm font-semibold wrap-break-word text-slate-900">
          {item.stop.name}
        </p>
        <p className="text-xs text-slate-500 tabular-nums">
          {item.kind === "via" && item.arrivedAt
            ? `${shortDay(item.arrivedAt)} to ${shortDay(item.stop.at)}`
            : shortTime(item.stop.at)}
        </p>
        {item.kind === "via" && !!wait && (
          <p className="text-xs font-medium text-slate-600">
            Waits {daysLabel(wait)}
          </p>
        )}
      </div>
    </li>
  );
};

// The journey: each port as a dot, and between two ports the vessel (or
// barge) that carries the cargo, with its days at sea.
const RouteLine = ({ route }: { route: RouteOption }) => {
  const stops = stopsOf(route);
  const l = route.legs.length >= 3 ? LAYOUTS.long : LAYOUTS.roomy;
  return (
    <div className={cn("rounded-xl bg-slate-50 px-4 pt-4", l.box)}>
      <ol aria-label="Route" className={cn("flex flex-col", l.list)}>
        {stops.map((item, i) => {
          const leg = route.legs[i];
          const last = i === stops.length - 1;
          return (
            <Fragment key={`${item.stop.code}-${i}`}>
              <StopItem item={item} last={last} l={l} />
              {leg && !last && (
                <li className={cn("relative min-w-0 pb-4 pl-[22px]", l.leg)}>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-0 bottom-0 left-[5px] border-l-2",
                      l.down,
                      LANE,
                      leg.mode !== "VESSEL" && "border-dotted",
                    )}
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute top-[5px] right-0 left-0 border-t-2",
                      l.across,
                      LANE,
                      leg.mode !== "VESSEL" && "border-dotted",
                    )}
                  />
                  <div className={l.legText}>
                    <p
                      className={cn(
                        "inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold wrap-break-word",
                        l.legName,
                        leg.vessel ? "text-harbour" : "text-slate-600",
                      )}
                    >
                      {/* On the lane itself the icon only takes room */}
                      <Ship
                        aria-hidden="true"
                        className={cn(
                          "h-3.5 w-3.5 shrink-0 text-slate-400",
                          l.down,
                        )}
                      />
                      {legCarrier(leg)}
                    </p>
                    {(leg.service || leg.voyage) && (
                      <p className="text-xs text-slate-500 tabular-nums">
                        {[leg.service, leg.voyage].filter(Boolean).join(" ")}
                      </p>
                    )}
                    <p className="text-xs text-slate-500 tabular-nums">
                      {daysLabel(daysBetween(leg.from.at, leg.to.at))}
                    </p>
                  </div>
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </div>
  );
};

export default RouteLine;
