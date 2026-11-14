import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useMemo, useState } from "react";
import {
  checkRateImportApi,
  commodityRefKey,
  matchRateImportApi,
  type ImportCheck,
  type ImportMappings,
  type ImportMatch,
  type RateCommodity,
  type RateInput,
  type RatePort,
} from "../../../../../services/api/rate";
import {
  ImportFileError,
  parseImport,
  readImportFile,
  type CommodityRef,
  type DraftRate,
  type ParsedImport,
  type PortRef,
} from "../../../../../utils/rateImport";

// The import window's state: read the file, match its ports and
// commodities, let admin settle the ones that didn't match, check every
// rate against the saved ones, and work out what will be saved.

export const portKey = (raw: string) =>
  raw.trim().toLowerCase().replace(/\s+/g, " ");

const commodityLabel = (ref: CommodityRef) =>
  ref.kind === "maersk" ? ref.code : ref.text;

// A rate's place: two rates in the same slot with the same start date
// would overwrite each other.
const slotKey = (input: RateInput) =>
  [
    input.origin.code,
    input.destination.code,
    input.containerSize,
    input.commodityCode ?? input.commodity.toLowerCase(),
    input.validFrom,
  ].join("|");

export const laneKey = (rate: DraftRate) =>
  `${portKey(rate.origin.raw)}>${portKey(rate.destination.raw)}|${commodityLabel(rate.commodity)}|${rate.validFrom}|${rate.validTo}`;

// A name the file uses that didn't match on its own, with admin's pick.
export type Unmatched =
  | {
      kind: "port";
      ref: PortRef;
      uses: number;
      suggestions: RatePort[];
      chosen: RatePort | null;
    }
  | {
      kind: "commodity";
      ref: CommodityRef;
      key: string;
      uses: number;
      suggestions: RateCommodity[];
      chosen: RateCommodity | null;
    };

export interface ReviewRate {
  draft: DraftRate;
  input: RateInput | null; // null until its ports and commodity are known
  check: ImportCheck | null;
  conflict: boolean; // another rate in the file takes the same place
  importable: boolean;
}

export const useRateImport = () => {
  const [file, setFile] = useState<File | null>(null);
  const [parsed, setParsed] = useState<ParsedImport | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  // Admin's picks for names that didn't match, by port key / commodity key.
  const [portChoices, setPortChoices] = useState<Record<string, RatePort>>({});
  const [commodityChoices, setCommodityChoices] = useState<
    Record<string, RateCommodity>
  >({});
  // Lanes admin unticked.
  const [excluded, setExcluded] = useState<Set<string>>(new Set());

  const readFile = async (next: File) => {
    setFile(next);
    setParsed(null);
    setFileError(null);
    setPortChoices({});
    setCommodityChoices({});
    setExcluded(new Set());
    setReading(true);
    try {
      const sheets = await readImportFile(next);
      setParsed(parseImport(sheets, moment().format("YYYY-MM-DD")));
    } catch (error) {
      setFileError(
        error instanceof ImportFileError
          ? error.message
          : "This file couldn't be read. Check it opens in Excel, then try again.",
      );
    } finally {
      setReading(false);
    }
  };

  const reset = () => {
    setFile(null);
    setParsed(null);
    setFileError(null);
    setReading(false);
  };

  // Every distinct port and commodity named in the file.
  const refs = useMemo(() => {
    const ports = new Map<string, { ref: PortRef; uses: number }>();
    const commodities = new Map<string, { ref: CommodityRef; uses: number }>();
    for (const rate of parsed?.rates ?? []) {
      for (const p of [rate.origin, rate.destination]) {
        const k = portKey(p.raw);
        ports.set(k, { ref: p, uses: (ports.get(k)?.uses ?? 0) + 1 });
      }
      const k = commodityRefKey(rate.commodity);
      commodities.set(k, {
        ref: rate.commodity,
        uses: (commodities.get(k)?.uses ?? 0) + 1,
      });
    }
    return { ports, commodities };
  }, [parsed]);

  const matchQuery = useQuery({
    queryKey: [
      "rateImportMatch",
      file?.name,
      file?.lastModified,
      [...refs.ports.keys()].join(","),
      [...refs.commodities.keys()].join(","),
    ],
    queryFn: () =>
      matchRateImportApi({
        ports: [...refs.ports.values()].map((p) => p.ref),
        commodities: [...refs.commodities.values()].map((c) => c.ref),
      }),
    enabled: !!parsed && parsed.rates.length > 0,
    staleTime: Infinity,
    retry: 1,
  });

  const portMatch = (ref: PortRef): RatePort | null =>
    portChoices[portKey(ref.raw)] ??
    matchQuery.data?.ports[ref.raw]?.match ??
    null;
  const commodityMatch = (ref: CommodityRef): RateCommodity | null => {
    const k = commodityRefKey(ref);
    return (
      commodityChoices[k] ?? matchQuery.data?.commodities[k]?.match ?? null
    );
  };

  // Names that didn't match on their own: still to pick first, then by use.
  const unmatched: Unmatched[] = useMemo(() => {
    if (!matchQuery.data) return [];
    const list: Unmatched[] = [];
    for (const [k, { ref, uses }] of refs.ports)
      if (!matchQuery.data.ports[ref.raw]?.match)
        list.push({
          kind: "port",
          ref,
          uses,
          suggestions: matchQuery.data.ports[ref.raw]?.suggestions ?? [],
          chosen: portChoices[k] ?? null,
        });
    for (const [k, { ref, uses }] of refs.commodities)
      if (!matchQuery.data.commodities[k]?.match)
        list.push({
          kind: "commodity",
          ref,
          key: k,
          uses,
          suggestions:
            (matchQuery.data.commodities[k] as ImportMatch<RateCommodity>)
              ?.suggestions ?? [],
          chosen: commodityChoices[k] ?? null,
        });
    return list.sort(
      (a, b) => Number(!!a.chosen) - Number(!!b.chosen) || b.uses - a.uses,
    );
  }, [matchQuery.data, refs, portChoices, commodityChoices]);

  // Each draft as the API will take it, once its names are known.
  const inputs = useMemo(
    () =>
      (parsed?.rates ?? []).map((draft): RateInput | null => {
        const origin = portMatch(draft.origin);
        const destination = portMatch(draft.destination);
        const commodity = commodityMatch(draft.commodity);
        if (!origin || !destination || !commodity) return null;
        return {
          origin,
          destination,
          containerSize: draft.containerSize,
          validFrom: draft.validFrom,
          validTo: draft.validTo,
          commodity: commodity.name,
          commodityCode: commodity.code || undefined,
          serviceMode: draft.serviceMode,
          transitHours: draft.transitHours,
          remarks: draft.remarks,
          charges: draft.charges,
          freeTime: draft.freeTime.length ? draft.freeTime : undefined,
        };
      }),
    // portMatch/commodityMatch read these
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [parsed, matchQuery.data, portChoices, commodityChoices],
  );

  const ready = inputs.filter((i): i is RateInput => i !== null);
  const checkQuery = useQuery({
    queryKey: [
      "rateImportCheck",
      file?.name,
      file?.lastModified,
      ready.map(slotKey).join(";"),
    ],
    queryFn: () => checkRateImportApi(ready),
    enabled: ready.length > 0 && !matchQuery.isFetching,
    staleTime: 0,
    retry: 1,
  });

  const review: ReviewRate[] = useMemo(() => {
    const checks = new Map<RateInput, ImportCheck>();
    if (checkQuery.data && checkQuery.data.length === ready.length)
      ready.forEach((input, i) => checks.set(input, checkQuery.data![i]));
    // Two rates of the file landing in the same place can't both be saved.
    const slots = new Map<string, number>();
    inputs.forEach((input) => {
      if (input)
        slots.set(slotKey(input), (slots.get(slotKey(input)) ?? 0) + 1);
    });
    return (parsed?.rates ?? []).map((draft, i) => {
      const input = inputs[i];
      const check = input ? (checks.get(input) ?? null) : null;
      const conflict = !!input && (slots.get(slotKey(input)) ?? 0) > 1;
      return {
        draft,
        input,
        check,
        conflict,
        importable: !!input && !!check && !check.problems.length && !conflict,
      };
    });
    // ready is derived from inputs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed, inputs, checkQuery.data]);

  const selected = review.filter((r) => !excluded.has(laneKey(r.draft)));
  const toSave = selected.filter((r) => r.importable);
  // Lanes admin kept that still need a port or commodity picked.
  const waiting = selected.filter((r) => !r.input).length;

  const toggleLane = (key: string) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const setLanes = (keys: string[], include: boolean) =>
    setExcluded((prev) => {
      const next = new Set(prev);
      keys.forEach((k) => (include ? next.delete(k) : next.add(k)));
      return next;
    });

  // What to remember: only what admin chose by hand.
  const mappings: ImportMappings = {
    ports: portChoices,
    commodities: commodityChoices,
  };

  return {
    file,
    parsed,
    fileError,
    reading,
    readFile,
    reset,
    matching: matchQuery.isFetching,
    matchError: matchQuery.error as { message?: string } | null,
    retryMatch: () => matchQuery.refetch(),
    checking: checkQuery.isFetching,
    checkError: checkQuery.error as { message?: string } | null,
    retryCheck: () => checkQuery.refetch(),
    unmatched,
    choosePort: (raw: string, port: RatePort | null) =>
      setPortChoices((prev) => {
        const next = { ...prev };
        if (port) next[portKey(raw)] = port;
        else delete next[portKey(raw)];
        return next;
      }),
    chooseCommodity: (key: string, commodity: RateCommodity | null) =>
      setCommodityChoices((prev) => {
        const next = { ...prev };
        if (commodity) next[key] = commodity;
        else delete next[key];
        return next;
      }),
    portChoices,
    commodityChoices,
    review,
    excluded,
    toggleLane,
    setLanes,
    toSave,
    waiting,
    mappings,
  };
};

export type RateImportState = ReturnType<typeof useRateImport>;
