import moment from "moment";
import {
  CHARGE_STAGES,
  RATE_CONTAINER_SIZES,
  chargePreset,
  type ChargeBasis,
  type ChargeStage,
  type PayTerm,
  type RateContainerSize,
} from "../../data/rates";
import {
  isValidOn,
  parseTransit,
  rateStatus,
  sizeOrder,
} from "../../utils/rates";
import type {
  FreeTime,
  ImportPreview,
  ImportPreviewRate,
  ImportProblem,
  ListParams,
  Paged,
  Rate,
  RateCharge,
  RateInput,
  RateLane,
  RatePort,
  RateRequest,
  RateGroup,
  RateRequestInput,
  RateSearchParams,
  RateSearchResult,
} from "./rate";

// DEVELOPMENT ONLY. Stands in for the rates API until the backend exists.
// Everything lives in memory and resets on a full reload. All prices are
// made up. The pages show a "Sample data" banner while this is in use.

const ISO = "YYYY-MM-DD";
const day = (offset: number) => moment().add(offset, "days").format(ISO);
const startOfMonth = (offset = 0) =>
  moment().add(offset, "months").startOf("month").format(ISO);
const endOfMonth = (offset = 0) =>
  moment().add(offset, "months").endOf("month").format(ISO);

const wait = (ms = 250 + Math.random() * 350) =>
  new Promise((resolve) => setTimeout(resolve, ms));

// Errors look like the backend's response body.
const fail = (message: string, statusCode = 400): never => {
  throw { message, statusCode };
};

const copy = <T>(value: T): T => structuredClone(value);

let nextId = 1;
const newId = () => `mock${String(nextId++).padStart(4, "0")}`;

// Port names for the codes the seed and the CSV template use. The backend
// resolves any code through the Maersk Locations data.
const PORTS: Record<string, RatePort> = Object.fromEntries(
  [
    ["NGAPP", "Apapa", "Nigeria"],
    ["NGTIN", "Tin Can Island", "Nigeria"],
    ["NGONN", "Onne", "Nigeria"],
    ["CIABJ", "Abidjan", "Ivory Coast"],
    ["TGLFW", "Lome", "Togo"],
    ["SNDKR", "Dakar", "Senegal"],
    ["BEANR", "Antwerp", "Belgium"],
    ["NLRTM", "Rotterdam", "Netherlands"],
    ["ITGOA", "Genoa", "Italy"],
    ["ESBCN", "Barcelona", "Spain"],
    ["ESVLC", "Valencia", "Spain"],
    ["TRMER", "Mersin", "Turkey"],
    ["GBLGP", "London Gateway", "United Kingdom"],
    ["EGDAM", "Damietta", "Egypt"],
    ["GRSKG", "Thessaloniki", "Greece"],
    ["PLGDN", "Gdansk", "Poland"],
    ["IEDUB", "Dublin", "Ireland"],
  ].map(([code, city, country]) => [code, { code, city, country }]),
);
const port = (code: string): RatePort =>
  PORTS[code] ?? { code, city: code, country: "" };

// Who pays each stage by default, as on Maersk quotes: freight and
// destination prepaid or collect, origin prepaid.
const DEFAULT_PAY: Record<ChargeStage, PayTerm> = {
  freight: "either",
  origin: "prepaid",
  destination: "either",
};

// Basic freight and Value Protect are fixed; surcharges float.
const FIXED = ["BAS", "VP1"];

// One charge line from a Maersk charge code.
const charge = (
  code: string,
  amount: number,
  currency = "USD",
  extra: Partial<RateCharge> = {},
): RateCharge => {
  const preset = chargePreset(code)!;
  return {
    code,
    name: preset.name,
    stage: preset.stage,
    basis: preset.basis,
    payTerm: DEFAULT_PAY[preset.stage],
    structure: FIXED.includes(code) ? "fixed" : "floating",
    amount,
    currency,
    ...extra,
  };
};

// A West Africa export make-up like the Maersk quote's: freight in USD with
// a bunker surcharge in EUR, zero-rated congestion and risk fees, origin
// charges in local currency, destination handling at the far end.
const westAfricaExport = (o: {
  bas: number;
  ebs: number;
  local: string; // origin currency, e.g. NGN or XOF
  exp: number;
  odf: number;
  dhc: number;
  dhcCurrency: string;
  ddf?: number;
}) => [
  charge("BAS", o.bas),
  charge("CFD", 0),
  charge("CFO", 0),
  charge("EBS", o.ebs, "EUR"),
  charge("ERS", 0),
  charge("PSS", 0),
  charge("VP1", 24),
  charge("EXP", o.exp, o.local),
  charge("OCG", o.local === "NGN" ? 250 : 1500, o.local),
  charge("ODF", o.odf, o.local),
  charge("CP1", 42),
  charge("DHC", o.dhc, o.dhcCurrency),
  ...(o.ddf ? [charge("DDF", o.ddf, o.dhcCurrency)] : []),
];

// Free time at the destination: so many days, then a charge per day.
const freeTime = (
  type: string,
  days: number,
  startEvent: string,
  tiers: [number, number | undefined, number, string][],
  note?: string,
): FreeTime => ({
  type,
  days,
  dayType: "Calendar days",
  startEvent,
  endEvent: "Gate-in empty",
  tiers: tiers.map(([fromDay, toDay, amount, currency]) => ({
    fromDay,
    toDay,
    amount,
    currency,
  })),
  note,
});

const COMMODITY = "Iron ore and other metal ores";

const seedRate = (
  origin: string,
  destination: string,
  containerSize: RateContainerSize,
  validFrom: string,
  validTo: string,
  charges: RateCharge[],
  extra: Partial<Rate> = {},
): Rate => ({
  _id: newId(),
  origin: port(origin),
  destination: port(destination),
  containerSize,
  validFrom,
  validTo,
  commodity: COMMODITY,
  serviceMode: "CY/CY",
  charges,
  updatedAt: moment()
    .subtract(Math.floor(Math.random() * 12) + 1, "days")
    .toISOString(),
  updatedBy: "Admin",
  ...extra,
});

const antwerpFreeTime = (perDay: number) => [
  freeTime(
    "Detention",
    14,
    "Gate-out full",
    [[15, undefined, perDay, "EUR"]],
    "Storage and demurrage are invoiced separately by Maersk.",
  ),
];

let rates: Rate[] = [
  seedRate(
    "NGAPP",
    "BEANR",
    "20ft Std",
    startOfMonth(),
    endOfMonth(),
    westAfricaExport({
      bas: 945,
      ebs: 120,
      local: "NGN",
      exp: 19800,
      odf: 4500,
      dhc: 210,
      dhcCurrency: "EUR",
    }),
    { transitHours: 52 * 24 + 6, freeTime: antwerpFreeTime(97) },
  ),
  seedRate(
    "NGAPP",
    "BEANR",
    "40ft Std",
    startOfMonth(),
    endOfMonth(),
    westAfricaExport({
      bas: 1365,
      ebs: 175,
      local: "NGN",
      exp: 26500,
      odf: 4500,
      dhc: 290,
      dhcCurrency: "EUR",
    }),
    { transitHours: 52 * 24 + 6, freeTime: antwerpFreeTime(137) },
  ),
  seedRate(
    "NGAPP",
    "BEANR",
    "40ft HC",
    startOfMonth(),
    endOfMonth(),
    westAfricaExport({
      bas: 1365,
      ebs: 175,
      local: "NGN",
      exp: 26500,
      odf: 4500,
      dhc: 290,
      dhcCurrency: "EUR",
    }),
    {
      transitHours: 52 * 24 + 6,
      freeTime: antwerpFreeTime(137),
      remarks: "Subject to equipment availability at Apapa.",
    },
  ),
  // Next month's rate, already loaded
  seedRate(
    "NGAPP",
    "BEANR",
    "40ft HC",
    startOfMonth(1),
    endOfMonth(1),
    westAfricaExport({
      bas: 1415,
      ebs: 180,
      local: "NGN",
      exp: 26500,
      odf: 4500,
      dhc: 290,
      dhcCurrency: "EUR",
    }),
    { transitHours: 52 * 24 + 6, freeTime: antwerpFreeTime(137) },
  ),
  seedRate(
    "NGAPP",
    "ITGOA",
    "40ft Std",
    startOfMonth(),
    endOfMonth(),
    westAfricaExport({
      bas: 1515,
      ebs: 175,
      local: "NGN",
      exp: 26500,
      odf: 4500,
      dhc: 260,
      dhcCurrency: "EUR",
      ddf: 57,
    }),
    {
      transitHours: 48 * 24 + 10,
      freeTime: [
        freeTime(
          "Combined",
          14,
          "Discharge",
          [[15, undefined, 83, "EUR"]],
          "Storage is invoiced separately by Maersk.",
        ),
      ],
    },
  ),
  seedRate(
    "NGTIN",
    "NLRTM",
    "20ft Std",
    startOfMonth(),
    endOfMonth(),
    westAfricaExport({
      bas: 900,
      ebs: 120,
      local: "NGN",
      exp: 19800,
      odf: 4500,
      dhc: 225,
      dhcCurrency: "EUR",
    }),
    {
      transitHours: 21 * 24 + 4,
      freeTime: [
        freeTime(
          "Detention",
          14,
          "Gate-out full",
          [[15, undefined, 93, "EUR"]],
          "Storage and demurrage are invoiced separately by Maersk.",
        ),
      ],
    },
  ),
  seedRate(
    "NGTIN",
    "TRMER",
    "40ft HC",
    startOfMonth(),
    endOfMonth(),
    westAfricaExport({
      bas: 1700,
      ebs: 175,
      local: "NGN",
      exp: 26500,
      odf: 4500,
      dhc: 240,
      dhcCurrency: "USD",
    }),
    {
      transitHours: 30 * 24 + 12,
      freeTime: [
        freeTime(
          "Combined",
          14,
          "Discharge",
          [
            [15, 17, 103, "USD"],
            [18, undefined, 138, "USD"],
          ],
          "Storage is invoiced separately by the terminal.",
        ),
      ],
    },
  ),
  seedRate(
    "NGAPP",
    "GBLGP",
    "40ft HC",
    startOfMonth(),
    endOfMonth(),
    westAfricaExport({
      bas: 1600,
      ebs: 175,
      local: "NGN",
      exp: 26500,
      odf: 4500,
      dhc: 245,
      dhcCurrency: "GBP",
    }),
    {
      transitHours: 34 * 24 + 20,
      freeTime: [
        freeTime(
          "Combined",
          14,
          "Discharge",
          [[15, undefined, 95, "GBP"]],
          "Storage is invoiced separately by Maersk.",
        ),
      ],
    },
  ),
  seedRate(
    "CIABJ",
    "ESBCN",
    "20ft Std",
    startOfMonth(),
    endOfMonth(),
    westAfricaExport({
      bas: 850,
      ebs: 120,
      local: "XOF",
      exp: 95000,
      odf: 25000,
      dhc: 205,
      dhcCurrency: "EUR",
    }),
    {
      transitHours: 23 * 24 + 9,
      freeTime: [
        freeTime(
          "Combined",
          14,
          "Discharge",
          [[15, undefined, 63, "EUR"]],
          "Storage is invoiced separately by Maersk.",
        ),
      ],
    },
  ),
  // Ends in a few days
  seedRate(
    "NGAPP",
    "EGDAM",
    "40ft HC",
    day(-25),
    day(4),
    westAfricaExport({
      bas: 1800,
      ebs: 175,
      local: "NGN",
      exp: 26500,
      odf: 4500,
      dhc: 230,
      dhcCurrency: "USD",
    }),
    {
      transitHours: 41 * 24 + 3,
      freeTime: [
        freeTime(
          "Combined",
          14,
          "Discharge",
          [
            [15, 17, 107, "USD"],
            [18, undefined, 153, "USD"],
          ],
          "Storage is invoiced separately by Maersk.",
        ),
      ],
    },
  ),
  // Already expired
  seedRate(
    "NGTIN",
    "GRSKG",
    "20ft Std",
    day(-40),
    day(-10),
    westAfricaExport({
      bas: 1100,
      ebs: 120,
      local: "NGN",
      exp: 19800,
      odf: 4500,
      dhc: 180,
      dhcCurrency: "EUR",
    }),
    { transitHours: 29 * 24 + 16 },
  ),
];

// More commodities on two lanes, so the list has something to filter and
// page through. Basic freight is the iron ore rate plus an offset.
const MORE_COMMODITIES: [string, number][] = [
  ["Cashew kernels", -55],
  ["Cocoa beans", 35],
  ["Sesame seeds", -25],
  ["Shea nuts", -45],
  ["Dried ginger", 15],
  ["Dried hibiscus flowers", -10],
  ["Natural rubber", 65],
  ["Ferrous waste and scrap", 115],
  ["Aluminium waste and scrap", 95],
  ["Cotton lint", 25],
  ["Soya beans", -15],
];

const moreCommodities = (
  origin: string,
  destination: string,
  sizes: RateContainerSize[],
  base: number,
  pick = MORE_COMMODITIES.length,
) =>
  MORE_COMMODITIES.slice(0, pick).flatMap(([commodity, offset]) =>
    sizes.map((size) =>
      seedRate(
        origin,
        destination,
        size,
        startOfMonth(),
        endOfMonth(),
        westAfricaExport({
          bas: base + offset + (size === "20ft Std" ? 0 : 417),
          ebs: size === "20ft Std" ? 118 : 173,
          local: "NGN",
          exp: size === "20ft Std" ? 19800 : 26500,
          odf: 4500,
          dhc: size === "20ft Std" ? 213 : 287,
          dhcCurrency: "EUR",
        }),
        { commodity, transitHours: 52 * 24 + 6 },
      ),
    ),
  );

rates = [
  ...rates,
  ...moreCommodities("NGAPP", "BEANR", ["20ft Std", "40ft HC"], 945),
  ...moreCommodities("NGTIN", "BEANR", ["40ft HC"], 905, 4),
  ...moreCommodities("NGTIN", "NLRTM", ["20ft Std", "40ft HC"], 905, 3),
];

// Sample commodities for the seeded requests (codes made up).
const SAMPLE_COMMODITIES = {
  ore: { code: "260100", name: "Iron ores and concentrates" },
  scrap: { code: "720400", name: "Ferrous waste and scrap" },
  cashew: { code: "080130", name: "Cashew nuts" },
  cocoa: { code: "180100", name: "Cocoa beans" },
};

// Requests "you" (the demo customer) made, so the search can return them.
const mine = new Set<string>();

let requests: RateRequest[] = [
  {
    _id: newId(),
    origin: port("NGAPP"),
    destination: port("ESVLC"),
    commodity: SAMPLE_COMMODITIES.ore,
    containerSize: "40ft HC",
    note: "Monthly volume of about 6 containers from January.",
    customer: {
      name: "Adaeze Okafor",
      company: "Lekki Metals Export Ltd",
      email: "adaeze@example.com",
    },
    status: "open",
    createdAt: moment().subtract(2, "hours").toISOString(),
  },
  {
    _id: newId(),
    origin: port("NGTIN"),
    destination: port("PLGDN"),
    commodity: SAMPLE_COMMODITIES.scrap,
    customer: {
      name: "Tunde Bello",
      company: "Bello Steel Trading",
      email: "tunde@example.com",
    },
    status: "open",
    createdAt: moment().subtract(1, "day").toISOString(),
  },
  {
    _id: newId(),
    origin: port("TGLFW"),
    destination: port("IEDUB"),
    commodity: SAMPLE_COMMODITIES.cashew,
    containerSize: "20ft Std",
    customer: { name: "Kwame Mensah", email: "kwame@example.com" },
    status: "open",
    createdAt: moment().subtract(3, "days").toISOString(),
  },
  {
    _id: newId(),
    origin: port("NGAPP"),
    destination: port("NLRTM"),
    commodity: SAMPLE_COMMODITIES.cocoa,
    containerSize: "40ft HC",
    customer: {
      name: "Ifeoma Nwosu",
      company: "Nwosu Commodities",
      email: "ifeoma@example.com",
    },
    status: "resolved",
    createdAt: moment().subtract(9, "days").toISOString(),
    resolvedAt: moment().subtract(8, "days").toISOString(),
  },
];

const today = () => moment().format(ISO);

const sameLane = (
  a: { origin: RatePort; destination: RatePort },
  origin: string,
  destination: string,
) => a.origin.code === origin && a.destination.code === destination;

// Saving a rate answers the open requests for its lane: those for its size
// and those for any size.
const resolveMatching = (rate: Rate) => {
  const now = new Date().toISOString();
  requests = requests.map((r) =>
    r.status === "open" &&
    sameLane(r, rate.origin.code, rate.destination.code) &&
    (!r.containerSize || r.containerSize === rate.containerSize)
      ? { ...r, status: "resolved", resolvedAt: now }
      : r,
  );
};

// ---- Sorting, filtering and paging, as the backend will -------------------

const sortValue = (rate: Rate, key: string): string | number => {
  switch (key) {
    case "origin":
      return `${rate.origin.code}-${rate.destination.code}`;
    case "containerSize":
      return sizeOrder(rate.containerSize);
    case "validTo":
      return rate.validTo;
    case "validFrom":
      return rate.validFrom;
    default:
      return rate.updatedAt;
  }
};

const applySort = <T>(
  items: T[],
  sort: string | undefined,
  value: (item: T, key: string) => string | number,
  fallback: string,
) => {
  const s = sort || fallback;
  const key = s.replace(/^-/, "");
  const dir = s.startsWith("-") ? -1 : 1;
  return [...items].sort((a, b) => {
    const va = value(a, key);
    const vb = value(b, key);
    return va < vb ? -dir : va > vb ? dir : 0;
  });
};

const paginate = <T>(items: T[], params: ListParams) => {
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  return items.slice((page - 1) * limit, page * limit);
};

const matchesSearch = (
  item: { origin: RatePort; destination: RatePort },
  search: string,
  extra = "",
) => {
  const haystack = [
    item.origin.code,
    item.origin.city,
    item.origin.country,
    item.destination.code,
    item.destination.city,
    item.destination.country,
    extra,
  ]
    .join(" ")
    .toLowerCase();
  return search
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((word) => haystack.includes(word));
};

// ---- Customer --------------------------------------------------------------

export const searchRates = async (
  params: RateSearchParams,
): Promise<RateSearchResult> => {
  await wait();
  const now = today();
  const { origin, destination } = params;
  const words = (params.q ?? "").toLowerCase().split(/s+/).filter(Boolean);

  // Rates valid today into this destination (and from this origin, if set),
  // grouped by lane and commodity, one per size: the latest update wins.
  const groups = new Map<string, RateGroup>();
  rates
    .filter(
      (r) =>
        r.destination.code === destination &&
        (!origin || r.origin.code === origin) &&
        isValidOn(r, now),
    )
    .forEach((r) => {
      const key = `${r.origin.code}|${r.destination.code}|${r.commodity}`;
      const group = groups.get(key) ?? {
        key,
        origin: r.origin,
        destination: r.destination,
        commodity: r.commodity,
        rates: [],
        fromBasic: null,
        validTo: r.validTo,
      };
      const held = group.rates.findIndex(
        (x) => x.containerSize === r.containerSize,
      );
      if (held < 0) group.rates.push(r);
      else if (group.rates[held].updatedAt < r.updatedAt) group.rates[held] = r;
      groups.set(key, group);
    });

  const all = [...groups.values()].map((g) => {
    const sorted = [...g.rates].sort(
      (a, b) => sizeOrder(a.containerSize) - sizeOrder(b.containerSize),
    );
    const basics = sorted
      .map((r) => r.charges.find((c) => c.code === "BAS"))
      .filter((c): c is RateCharge => !!c);
    const cheapest = basics.sort((a, b) => a.amount - b.amount)[0];
    return {
      ...g,
      rates: sorted,
      fromBasic: cheapest
        ? { amount: cheapest.amount, currency: cheapest.currency }
        : null,
      validTo: sorted.map((r) => r.validTo).sort()[0],
    };
  });

  const matching = all
    .filter((g) => words.every((w) => g.commodity.toLowerCase().includes(w)))
    .sort(
      (a, b) =>
        a.origin.city.localeCompare(b.origin.city) ||
        a.commodity.localeCompare(b.commodity),
    );

  const request = origin
    ? (requests.find(
        (r) =>
          mine.has(r._id) &&
          r.status === "open" &&
          sameLane(r, origin, destination),
      ) ?? null)
    : null;

  return copy({
    groups: paginate(matching, { page: params.page, limit: params.limit }),
    total: matching.length,
    totalAll: all.length,
    request,
  });
};

export const getLanes = async (): Promise<RateLane[]> => {
  await wait(200);
  const now = today();
  const lanes = new Map<string, RateLane>();
  rates
    .filter((r) => isValidOn(r, now))
    .forEach((r) => {
      const key = `${r.origin.code}-${r.destination.code}`;
      const lane = lanes.get(key) ?? {
        origin: r.origin,
        destination: r.destination,
        sizes: [],
        commodities: 0,
      };
      if (!lane.sizes.includes(r.containerSize))
        lane.sizes.push(r.containerSize);
      lanes.set(key, lane);
    });
  return copy(
    [...lanes.values()].map((l) => ({
      ...l,
      commodities: new Set(
        rates
          .filter(
            (r) =>
              isValidOn(r, now) &&
              sameLane(r, l.origin.code, l.destination.code),
          )
          .map((r) => r.commodity),
      ).size,
      sizes: l.sizes.sort((a, b) => sizeOrder(a) - sizeOrder(b)),
    })),
  );
};

export const requestRate = async (input: RateRequestInput) => {
  await wait();
  const existing = requests.find(
    (r) =>
      mine.has(r._id) &&
      r.status === "open" &&
      sameLane(r, input.origin.code, input.destination.code) &&
      r.commodity.code === input.commodity.code &&
      (r.containerSize ?? "") === (input.containerSize ?? ""),
  );
  if (existing)
    return copy({
      message: "You've already asked for this rate. We'll be in touch.",
      data: existing,
    });

  const request: RateRequest = {
    _id: newId(),
    origin: input.origin,
    destination: input.destination,
    commodity: input.commodity,
    containerSize: input.containerSize,
    note: input.note?.trim() || undefined,
    customer: {
      name: "Demo customer",
      company: "Your company",
      email: "you@example.com",
    },
    status: "open",
    createdAt: new Date().toISOString(),
  };
  requests = [request, ...requests];
  mine.add(request._id);
  return copy({
    message: "Request sent. Our team will get back to you with a rate.",
    data: request,
  });
};

// ---- Admin: rates ------------------------------------------------------------

export const getRate = async (id: string): Promise<Rate> => {
  await wait();
  const rate = rates.find((r) => r._id === id);
  if (!rate) return fail("This rate no longer exists", 404);
  return copy(rate);
};

export const listRates = async (params: ListParams): Promise<Paged<Rate>> => {
  await wait();
  const search = String(params.search ?? "");
  const status = String(params.status ?? "");
  const size = String(params.containerSize ?? "");
  const now = today();

  const filtered = rates.filter(
    (r) =>
      (!search || matchesSearch(r, search)) &&
      (!status || rateStatus(r, now) === status) &&
      (!size || r.containerSize === size),
  );
  const sorted = applySort(
    filtered,
    params.sort as string | undefined,
    sortValue,
    "-updatedAt",
  );
  return copy({
    data: paginate(sorted, params),
    total: filtered.length,
    totalAll: rates.length,
  });
};

const checkInput = (input: RateInput) => {
  if (input.origin.code === input.destination.code)
    fail("Origin and destination must be different ports");
  if (input.validTo < input.validFrom)
    fail("The rate must end on or after the day it starts");
  if (!input.charges.length) fail("Add at least one charge");
};

export const createRate = async (input: RateInput) => {
  await wait();
  checkInput(input);
  const rate: Rate = {
    ...copy(input),
    _id: newId(),
    updatedAt: new Date().toISOString(),
    updatedBy: "You",
  };
  rates = [rate, ...rates];
  resolveMatching(rate);
  return copy({ message: "Rate added", data: rate });
};

export const updateRate = async (id: string, input: RateInput) => {
  await wait();
  checkInput(input);
  const index = rates.findIndex((r) => r._id === id);
  if (index < 0) fail("This rate no longer exists", 404);
  const rate: Rate = {
    ...copy(input),
    _id: id,
    updatedAt: new Date().toISOString(),
    updatedBy: "You",
  };
  rates[index] = rate;
  resolveMatching(rate);
  return copy({ message: "Rate updated", data: rate });
};

// Ends the rate yesterday, so customers stop seeing it at once.
export const expireRate = async (id: string) => {
  await wait();
  const rate = rates.find((r) => r._id === id);
  if (!rate) return fail("This rate no longer exists", 404);
  const yesterday = day(-1);
  rate.validTo = yesterday;
  if (rate.validFrom > yesterday) rate.validFrom = yesterday;
  rate.updatedAt = new Date().toISOString();
  rate.updatedBy = "You";
  return copy({ message: "Rate expired", data: rate });
};

export const deleteRate = async (id: string) => {
  await wait();
  if (!rates.some((r) => r._id === id)) fail("This rate no longer exists", 404);
  rates = rates.filter((r) => r._id !== id);
  return { message: "Rate deleted" };
};

// ---- Admin: rate requests ------------------------------------------------------

export const listRequests = async (
  params: ListParams,
): Promise<Paged<RateRequest> & { open: number }> => {
  await wait();
  const search = String(params.search ?? "");
  const status = String(params.status ?? "");
  const filtered = requests.filter(
    (r) =>
      (!search ||
        matchesSearch(
          r,
          search,
          `${r.customer.name} ${r.customer.company ?? ""} ${r.customer.email}`,
        )) &&
      (!status || r.status === status),
  );
  const sorted = applySort(
    filtered,
    params.sort as string | undefined,
    (r, key) =>
      key === "origin"
        ? `${r.origin.code}-${r.destination.code}`
        : key === "customer"
          ? (r.customer.company ?? r.customer.name).toLowerCase()
          : key === "status"
            ? r.status
            : r.createdAt,
    "-createdAt",
  );
  return copy({
    data: paginate(sorted, params),
    total: filtered.length,
    totalAll: requests.length,
    open: requests.filter((r) => r.status === "open").length,
  });
};

export const resolveRequest = async (id: string) => {
  await wait();
  const request = requests.find((r) => r._id === id);
  if (!request) return fail("This request no longer exists", 404);
  request.status = "resolved";
  request.resolvedAt = new Date().toISOString();
  return copy({ message: "Request marked as resolved", data: request });
};

// ---- Admin: bulk import ----------------------------------------------------------

const COLUMNS = [
  "Origin",
  "Destination",
  "Container size",
  "Commodity",
  "Valid from",
  "Valid to",
  "Transit time",
  "Charge code",
  "Charge name",
  "Amount",
  "Currency",
  "Basis",
  "Stage",
  "Remarks",
] as const;

export const template = async () => {
  await wait(100);
  const from = startOfMonth(1);
  const to = endOfMonth(1);
  const rows = [
    COLUMNS.join(","),
    `NGAPP,BEANR,40ft HC,Iron ore and other metal ores,${from},${to},52d 6h,BAS,,1415,USD,,,"Subject to equipment availability"`,
    `NGAPP,BEANR,40ft HC,Iron ore and other metal ores,${from},${to},52d 6h,EBS,,180,EUR,,,`,
    `NGAPP,BEANR,40ft HC,Iron ore and other metal ores,${from},${to},52d 6h,PSS,,0,USD,,,`,
    `NGAPP,BEANR,40ft HC,Iron ore and other metal ores,${from},${to},52d 6h,EXP,,26500,NGN,,,`,
    `NGAPP,BEANR,40ft HC,Iron ore and other metal ores,${from},${to},52d 6h,ODF,,4500,NGN,Per document,,`,
    `NGAPP,BEANR,40ft HC,Iron ore and other metal ores,${from},${to},52d 6h,DHC,,290,EUR,,,`,
    `NGAPP,BEANR,40ft HC,Iron ore and other metal ores,${from},${to},52d 6h,XYZ,Terminal congestion,50,EUR,Per container,Destination,`,
  ];
  return {
    blob: new Blob([rows.join("\r\n") + "\r\n"], { type: "text/csv" }),
    fileName: "freightafford-rates-template.csv",
  };
};

// A small CSV reader: commas, quoted fields with "" escapes, CRLF or LF.
const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
};

const normalise = (value: string) =>
  value.trim().toLowerCase().replace(/\s+/g, " ");

const SIZE_ALIASES: Record<string, RateContainerSize> = Object.fromEntries(
  RATE_CONTAINER_SIZES.flatMap((s) => [
    [normalise(s.value), s.value],
    [normalise(`${s.size} ${s.kind}`), s.value],
  ]),
);

const BASIS_ALIASES: Record<string, ChargeBasis> = {
  container: "container",
  "per container": "container",
  ctr: "container",
  per_container: "container",
  document: "document",
  "per document": "document",
  per_document: "document",
  bl: "document",
  "b/l": "document",
  "per b/l": "document",
};

const STAGE_ALIASES: Record<string, ChargeStage> = Object.fromEntries(
  CHARGE_STAGES.flatMap((s) => [
    [s.value, s.value],
    [normalise(s.label), s.value],
  ]),
);

const isDate = (value: string) => moment(value, ISO, true).isValid();

export const previewImport = async (file: File): Promise<ImportPreview> => {
  await wait(500);
  if (!/\.csv$/i.test(file.name))
    fail(
      "For now, upload the CSV template. Excel (.xlsx) files will be read once the rates backend is connected.",
    );

  const table = parseCsv(await file.text()).filter((r) =>
    r.some((cell) => cell.trim()),
  );
  if (!table.length) fail("This file is empty");

  const header = table[0].map(normalise);
  const col = Object.fromEntries(
    COLUMNS.map((name) => [name, header.indexOf(normalise(name))]),
  ) as Record<(typeof COLUMNS)[number], number>;
  const missing = (
    [
      "Origin",
      "Destination",
      "Container size",
      "Valid from",
      "Valid to",
      "Charge code",
      "Amount",
      "Currency",
    ] as const
  ).filter((name) => col[name] < 0);
  if (missing.length)
    fail(
      `The file is missing these columns: ${missing.join(", ")}. Start from the template.`,
    );

  const problems: ImportProblem[] = [];
  const groups = new Map<
    string,
    { rate: RateInput; rows: number[]; bad: boolean }
  >();

  table.slice(1).forEach((cells, i) => {
    const rowNumber = i + 2;
    const get = (name: (typeof COLUMNS)[number]) =>
      col[name] >= 0 ? (cells[col[name]] ?? "").trim() : "";
    const rowProblems: string[] = [];

    const origin = get("Origin").toUpperCase();
    const destination = get("Destination").toUpperCase();
    if (!/^[A-Z]{2}[A-Z2-9]{3}$/.test(origin))
      rowProblems.push(
        `origin "${get("Origin")}" isn't a port code like NGAPP`,
      );
    if (!/^[A-Z]{2}[A-Z2-9]{3}$/.test(destination))
      rowProblems.push(
        `destination "${get("Destination")}" isn't a port code like BEANR`,
      );
    if (origin && origin === destination)
      rowProblems.push("origin and destination are the same port");

    const size = SIZE_ALIASES[normalise(get("Container size"))];
    if (!size)
      rowProblems.push(
        `container size "${get("Container size")}" should be 20ft Std, 40ft Std, 40ft HC or 45ft HC`,
      );

    const validFrom = get("Valid from");
    const validTo = get("Valid to");
    if (!isDate(validFrom))
      rowProblems.push(
        `valid from "${validFrom}" should be a date like 2026-12-01`,
      );
    if (!isDate(validTo))
      rowProblems.push(
        `valid to "${validTo}" should be a date like 2026-12-31`,
      );
    if (isDate(validFrom) && isDate(validTo) && validTo < validFrom)
      rowProblems.push("valid to is before valid from");

    // "64d 14h" as Maersk writes it, or a plain number of days
    const transitRaw = get("Transit time");
    const transitHours = !transitRaw
      ? undefined
      : /^d+$/.test(transitRaw)
        ? Number(transitRaw) * 24
        : (parseTransit(transitRaw) ?? NaN);
    if (transitRaw && !(transitHours! > 0))
      rowProblems.push(
        `transit time "${transitRaw}" should look like 64d 14h, or a number of days`,
      );

    const code = get("Charge code").toUpperCase();
    const preset = chargePreset(code);
    const name = get("Charge name") || preset?.name || "";
    if (!code) rowProblems.push("charge code is empty");
    else if (!name)
      rowProblems.push(
        `charge "${code}" isn't a standard code, so it needs a charge name`,
      );

    const amount = Number(get("Amount").replace(/,/g, ""));
    if (!get("Amount") || !Number.isFinite(amount) || amount < 0)
      rowProblems.push(
        `amount "${get("Amount")}" should be a number, 0 or more`,
      );

    const currency = get("Currency").toUpperCase();
    if (!/^[A-Z]{3}$/.test(currency))
      rowProblems.push(
        `currency "${get("Currency")}" should be a 3-letter code like USD`,
      );

    const basisRaw = get("Basis");
    const basis = basisRaw
      ? BASIS_ALIASES[normalise(basisRaw)]
      : (preset?.basis ?? "container");
    if (!basis)
      rowProblems.push(
        `basis "${basisRaw}" should be Per container or Per document`,
      );

    const stageRaw = get("Stage");
    const stage = stageRaw
      ? STAGE_ALIASES[normalise(stageRaw)]
      : (preset?.stage ?? "freight");
    if (!stage)
      rowProblems.push(
        `stage "${stageRaw}" should be Freight, Origin or Destination`,
      );

    const commodity = get("Commodity") || "General cargo";
    const key = [origin, destination, size, commodity, validFrom, validTo].join(
      "|",
    );
    const group = groups.get(key) ?? {
      rate: {
        origin: port(origin),
        destination: port(destination),
        containerSize: size,
        commodity,
        validFrom,
        validTo,
        charges: [],
      },
      rows: [],
      bad: false,
    };
    group.rows.push(rowNumber);

    if (rowProblems.length) {
      problems.push({
        row: rowNumber,
        message: `Row ${rowNumber}: ${rowProblems.join("; ")}.`,
      });
      group.bad = true;
    } else {
      group.rate.charges.push({
        code,
        name,
        amount,
        currency,
        basis,
        stage,
        payTerm: DEFAULT_PAY[stage],
        structure: FIXED.includes(code) ? "fixed" : "floating",
      });
      if (transitHours && !group.rate.transitHours)
        group.rate.transitHours = transitHours;
      const remarks = get("Remarks");
      if (remarks && !group.rate.remarks) group.rate.remarks = remarks;
    }
    groups.set(key, group);
  });

  // A rate with any bad row is left out whole: half a rate would mislead.
  const previews: ImportPreviewRate[] = [];
  for (const group of groups.values()) {
    if (group.bad) continue;
    const r = group.rate;
    const duplicateCode = r.charges.find(
      (c, i) => r.charges.findIndex((d) => d.code === c.code) !== i,
    );
    if (duplicateCode) {
      problems.push({
        row: group.rows[0],
        message: `Rows ${group.rows.join(", ")}: ${duplicateCode.code} appears twice in the same rate.`,
      });
      continue;
    }
    const replaces =
      rates.find(
        (x) =>
          sameLane(x, r.origin.code, r.destination.code) &&
          x.containerSize === r.containerSize &&
          x.commodity === r.commodity &&
          x.validFrom === r.validFrom,
      )?._id ?? null;
    previews.push({ rate: r, rows: group.rows, replaces });
  }

  return copy({
    fileName: file.name,
    rowCount: table.length - 1,
    rates: previews,
    problems: problems.sort((a, b) => a.row - b.row),
  });
};

export const commitImport = async (items: ImportPreviewRate[]) => {
  await wait(600);
  let created = 0;
  let replaced = 0;
  for (const item of items) {
    const rate: Rate = {
      ...copy(item.rate),
      _id: item.replaces ?? newId(),
      updatedAt: new Date().toISOString(),
      updatedBy: "You (import)",
    };
    const index = item.replaces
      ? rates.findIndex((r) => r._id === item.replaces)
      : -1;
    if (index >= 0) {
      rates[index] = rate;
      replaced++;
    } else {
      rates = [rate, ...rates];
      created++;
    }
    resolveMatching(rate);
  }
  const parts = [
    created && `${created} added`,
    replaced && `${replaced} replaced`,
  ].filter(Boolean);
  return {
    message: `Import done: ${parts.join(", ") || "nothing to import"}`,
    created,
    replaced,
  };
};
