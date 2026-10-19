import moment, { type Moment } from "moment";
import type {
  RouteDateMode,
  RouteLeg,
  RouteOption,
} from "../services/api/schedule";
import { callStatus } from "./schedule";

// Whether cargo can still make this route, by the same rules as a port call.
// A route whose departure has passed counts as departed.
export const routeStatus = (route: RouteOption, now: Moment) =>
  callStatus(
    {
      cutOffs: route.cutOffs,
      departure: moment(route.departs.at).isBefore(now)
        ? { actual: route.departs.at }
        : { estimated: route.departs.at },
    },
    now,
  );

// Vessel-to-vessel changes only, as DCSA counts them: a barge or truck
// on to the final port isn't a transhipment.
export const transhipmentCount = (route: RouteOption) =>
  route.legs.filter(
    (leg, i) =>
      i > 0 && leg.mode === "VESSEL" && route.legs[i - 1].mode === "VESSEL",
  ).length;

// The ports where the cargo changes vessel, e.g. ["Tanjung Pelepas"]
export const transhipmentPorts = (route: RouteOption) =>
  route.legs
    .filter(
      (leg, i) =>
        i > 0 && leg.mode === "VESSEL" && route.legs[i - 1].mode === "VESSEL",
    )
    .map((leg) => leg.from.name);

// "Tanjung Pelepas", "Algeciras and Abidjan"
export const listJoin = (items: string[]) =>
  items.length < 2
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

// Maersk sends some terminal names in capitals ("YANGSHAN SGH GUANDONG
// TERMINAL"); show those in normal case, keeping short codes like "SGH".
export const tidyName = (name: string) =>
  name === name.toUpperCase()
    ? name
        .toLowerCase()
        .replace(/\b[a-z][a-z'-]*/g, (word) =>
          word.length <= 3 && !/^(and|of|the|de|du)$/.test(word)
            ? word.toUpperCase()
            : word[0].toUpperCase() + word.slice(1),
        )
    : name;

export const transhipmentLabel = (route: RouteOption) => {
  const n = transhipmentCount(route);
  return n === 0
    ? "Direct"
    : `${n} ${n === 1 ? "transhipment" : "transhipments"}`;
};

// Whole days between two port-local times, at least 1 when they differ
export const daysBetween = (from: string, to: string) => {
  const hours = moment(to).diff(moment(from), "hours", true);
  if (hours <= 0) return 0;
  return Math.max(1, Math.round(hours / 24));
};

export const daysLabel = (days: number) =>
  `${days} ${days === 1 ? "day" : "days"}`;

const MODE_LABELS: Record<string, string> = {
  VESSEL: "Vessel",
  BARGE: "Barge",
  RAIL: "Rail",
  TRUCK: "Truck",
};

// What carries the cargo on a leg: the vessel's name, else the mode
export const legCarrier = (leg: RouteLeg) =>
  leg.vessel?.name.toUpperCase() ??
  (leg.mode === "VESSEL"
    ? "Vessel to be named"
    : (MODE_LABELS[leg.mode] ?? leg.mode));

// Door to door from the real times, as Maersk shows it: "33 days 4 hours"
export const transitLabel = (route: RouteOption) => {
  // Whole hours, as Maersk counts them
  const hours = moment(route.arrives.at).diff(
    moment(route.departs.at),
    "hours",
  );
  if (hours <= 0) return daysLabel(route.transitDays);
  const days = Math.floor(hours / 24);
  const rest = hours % 24;
  return [
    days > 0 && daysLabel(days),
    rest > 0 && `${rest} ${rest === 1 ? "hour" : "hours"}`,
  ]
    .filter(Boolean)
    .join(" ");
};

const regionNames = (() => {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
})();

// "LR" → "Liberia (LR)"
export const flagLabel = (code: string) => {
  const name = regionNames?.of(code);
  return name && name !== code ? `${name} (${code})` : code;
};

// By departure, or by arrival when searching by the arrival date, as
// Maersk lists them
export const sortRoutes = (routes: RouteOption[], by: RouteDateMode) =>
  [...routes].sort((a, b) =>
    by === "arriving"
      ? moment(a.arrives.at).diff(moment(b.arrives.at))
      : moment(a.departs.at).diff(moment(b.departs.at)),
  );
