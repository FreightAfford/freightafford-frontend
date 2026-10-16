import moment from "moment";
import type { MaerskShipmentEvent, MaerskTracking } from "./booking";

// DEVELOPMENT ONLY. A made-up Maersk journey so the tracking panel can be
// seen moving without Maersk's API or touching live bookings. "Sync now"
// moves the journey on by one event. Production builds never use this.

const SWITCH_KEY = "fa:demo-tracking";
const stageKey = (id: string) => `fa:demo-tracking-stage:${id}`;

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};
const write = (key: string, value: string | null) => {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the demo just won't remember its place.
  }
};

export const isDemoTracking = () =>
  import.meta.env.DEV && read(SWITCH_KEY) === "on";

export const setDemoTracking = (on: boolean) =>
  write(SWITCH_KEY, on ? "on" : null);

export type DemoRoute = {
  origin?: string;
  originCode?: string;
  destination?: string;
  destinationCode?: string;
  vessel?: string;
  sailingDate?: string;
};

const title = (value?: string) =>
  (value ?? "").replace(/\b\w/g, (letter) => letter.toUpperCase());

// Every event in the journey, in order, with its day offset from sailing.
const journey = (route: DemoRoute) => {
  const origin = {
    name: title(route.origin) || "Apapa, Nigeria",
    code: route.originCode || "NGAPP",
  };
  const hub = { name: "Algeciras, Spain", code: "ESALG" };
  const destination = {
    name: title(route.destination) || "Rotterdam, Netherlands",
    code: route.destinationCode || "NLRTM",
  };
  const mainVessel = {
    name: (route.vessel || "Maersk Cubango").toUpperCase(),
    imo: "9784312",
  };
  // A deliberately long name, to show how long vessel names behave.
  const feeder = { name: "MAERSK MC-KINNEY MØLLER", imo: "9619907" };

  return [
    {
      day: -6,
      type: "EQUIPMENT",
      code: "GTOT",
      empty: true,
      location: origin,
      label: "Empty container picked up",
    },
    {
      day: -3,
      type: "EQUIPMENT",
      code: "GTIN",
      location: origin,
      label: "Full container gated in",
    },
    {
      day: -1,
      type: "EQUIPMENT",
      code: "LOAD",
      location: origin,
      vessel: mainVessel,
      voyage: "442W",
      label: "Loaded on vessel",
    },
    {
      day: 0,
      type: "TRANSPORT",
      code: "DEPA",
      location: origin,
      vessel: mainVessel,
      voyage: "442W",
      label: "Vessel departed",
    },
    {
      day: 8,
      type: "TRANSPORT",
      code: "ARRI",
      location: hub,
      vessel: mainVessel,
      voyage: "442W",
      label: "Vessel arrived",
    },
    {
      day: 9,
      type: "EQUIPMENT",
      code: "DISC",
      location: hub,
      vessel: mainVessel,
      voyage: "442W",
      label: "Discharged from vessel",
    },
    {
      day: 10,
      type: "EQUIPMENT",
      code: "LOAD",
      location: hub,
      vessel: feeder,
      voyage: "447N",
      label: "Loaded on vessel",
    },
    {
      day: 11,
      type: "TRANSPORT",
      code: "DEPA",
      location: hub,
      vessel: feeder,
      voyage: "447N",
      label: "Vessel departed",
    },
    {
      day: 18,
      type: "TRANSPORT",
      code: "ARRI",
      location: destination,
      vessel: feeder,
      voyage: "447N",
      label: "Vessel arrived",
    },
    {
      day: 19,
      type: "EQUIPMENT",
      code: "DISC",
      location: destination,
      vessel: feeder,
      voyage: "447N",
      label: "Discharged from vessel",
    },
    {
      day: 21,
      type: "EQUIPMENT",
      code: "GTOT",
      location: destination,
      label: "Full container gated out",
    },
  ] as const;
};

const JOURNEY_LENGTH = 11;
// Start just after departure, so the ship is already at sea.
const DEFAULT_STAGE = 3;

const getStage = (id: string) => {
  const saved = Number(read(stageKey(id)));
  return Number.isInteger(saved) && read(stageKey(id)) !== null
    ? saved
    : DEFAULT_STAGE;
};

export const demoTracking = (id: string, route: DemoRoute): MaerskTracking => {
  const stage = getStage(id);
  const sailing = route.sailingDate
    ? moment(route.sailingDate)
    : moment().subtract(4, "days");

  const events: MaerskShipmentEvent[] = journey(route).map((step, index) => {
    const actual = index <= stage;
    const at = sailing
      .clone()
      .add(step.day, "days")
      .hour(8 + (index % 5) * 2);
    return {
      id: `${id}-demo-${index}`,
      type: step.type,
      code: step.code,
      classifier: actual ? "ACT" : step.type === "TRANSPORT" ? "EST" : "PLN",
      dateTime: at.format(),
      label: actual
        ? step.label
        : step.label
            .replace("departed", "departure")
            .replace("arrived", "arrival"),
      location: step.location,
      vessel: "vessel" in step ? step.vessel : undefined,
      voyage: "voyage" in step ? step.voyage : undefined,
      // Like Maersk: only equipment events name the box, and say if it's empty
      ...(step.type === "EQUIPMENT" && {
        container: "MSKU7781230",
        empty: "empty" in step ? step.empty : false,
      }),
    };
  });

  const departure = events.find((e) => e.code === "DEPA")!;
  const arrival = [...events].reverse().find((e) => e.code === "ARRI")!;
  const milestone = (e: MaerskShipmentEvent) => ({
    at: e.dateTime,
    classifier: e.classifier,
    locationCode: e.location?.code,
    locationName: e.location?.name,
    vessel: e.vessel,
    voyage: e.voyage,
  });

  return {
    reference: "DEMO-279516382",
    events,
    summary: {
      departure: milestone(departure),
      arrival: milestone(arrival),
      hasDeparted: departure.classifier === "ACT",
      hasArrived: arrival.classifier === "ACT",
    },
  };
};

// Moves the demo journey on one event; after the last it starts again.
export const advanceDemoTracking = async (id: string) => {
  await new Promise((resolve) => setTimeout(resolve, 600));
  const next = getStage(id) + 1;
  write(stageKey(id), String(next >= JOURNEY_LENGTH ? 0 : next));
  return { outcome: "updated" };
};
