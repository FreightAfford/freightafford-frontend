import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileSpreadsheet,
  MapPin,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useMemo, type ReactNode } from "react";
import type { ImportIssue } from "../../../../../utils/rateImport";
import cn from "../../../../../utils/cn";
import {
  formatAmount,
  formatValidity,
  toPortLocation,
  toRatePort,
} from "../../../../../utils/rates";
import SmallLoader from "../../../../SmallLoader";
import CommoditySelect from "../../../CommoditySelect";
import PortSelect from "../../../PortSelect";
import {
  laneKey,
  portKey,
  type RateImportState,
  type ReviewRate,
} from "./useRateImport";

// ---- Summary ----------------------------------------------------------------

const Stat = ({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "good" | "warn" | "bad";
}) => (
  <div className="min-w-0 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5">
    <dt className="truncate text-xs font-medium text-slate-500">{label}</dt>
    <dd
      className={cn(
        "font-display text-xl font-bold tabular-nums",
        tone === "good" && "text-kelp",
        tone === "warn" && "text-[#9a6a0c]",
        tone === "bad" && "text-red-600",
        !tone && "text-slate-900",
      )}
    >
      {value}
    </dd>
  </div>
);

// ---- Names that didn't match ------------------------------------------------

// The search's closest answers, one click to pick.
const Chips = ({
  items,
}: {
  items: { key: string; label: string; pick: () => void }[];
}) =>
  items.length ? (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs text-slate-500">Closest:</span>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          onClick={item.pick}
          className="hover:border-brand hover:text-brand rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors"
        >
          {item.label}
        </button>
      ))}
    </div>
  ) : null;

const Unmatched = ({ state }: { state: RateImportState }) => {
  if (!state.unmatched.length) return null;
  const open = state.unmatched.filter((u) => !u.chosen).length;
  return (
    <section aria-labelledby="unmatched-title" className="space-y-3">
      <div>
        <h3
          id="unmatched-title"
          className="flex items-center gap-2 text-base font-bold text-slate-900"
        >
          {open ? (
            <AlertTriangle className="h-4 w-4 text-[#b07d14]" />
          ) : (
            <CheckCircle2 className="text-kelp h-4 w-4" />
          )}
          {open
            ? `Choose what ${open === 1 ? "this name means" : `these ${open} names mean`}`
            : "Names you matched"}
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">
          The file names {open === 1 ? "it" : "them"} differently from Maersk's
          search. Your choice is remembered for the next import.
        </p>
      </div>
      <ul className="space-y-3">
        {state.unmatched.map((u) => (
          <li
            key={u.kind === "port" ? `p:${u.ref.raw}` : `c:${u.key}`}
            className={cn(
              "@container rounded-xl border p-3.5",
              u.chosen ? "border-slate-200" : "border-ochre/50 bg-ochre/5",
            )}
          >
            <div className="grid gap-3 @2xl:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] @2xl:items-center">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-500">
                  {u.kind === "port"
                    ? "Port in the file"
                    : "Commodity in the file"}
                </p>
                <p className="font-mono text-sm font-semibold break-words text-slate-900">
                  {u.kind === "port"
                    ? u.ref.raw
                    : u.ref.kind === "maersk"
                      ? u.ref.code
                      : u.ref.text}
                </p>
                <p className="text-xs text-slate-500">
                  Used by {u.uses} {u.uses === 1 ? "rate" : "rates"}
                </p>
              </div>
              <div className="min-w-0 space-y-2">
                {u.kind === "port" ? (
                  <div className="rounded-xl border border-slate-200 bg-white">
                    <PortSelect
                      label={`Port for ${u.ref.raw}`}
                      kicker="Port"
                      end="destination"
                      icon={MapPin}
                      placeholder="Search the port, e.g. Tin Can Island"
                      value={u.chosen ? toPortLocation(u.chosen) : null}
                      onChange={(loc) =>
                        state.choosePort(
                          u.ref.raw,
                          loc ? toRatePort(loc) : null,
                        )
                      }
                      className="rounded-xl"
                    />
                  </div>
                ) : (
                  <CommoditySelect
                    label={`Commodity for ${u.ref.kind === "maersk" ? u.ref.code : u.ref.text}`}
                    placeholder="Search, e.g. iron ore"
                    value={
                      u.chosen
                        ? { ...u.chosen, hsCodes: [], cargoTypes: [] }
                        : null
                    }
                    onChange={(c) =>
                      state.chooseCommodity(
                        u.key,
                        c ? { code: c.code, name: c.name } : null,
                      )
                    }
                  />
                )}
                {!u.chosen && u.kind === "port" && (
                  <Chips
                    items={u.suggestions.map((p) => ({
                      key: p.code,
                      label: `${p.city}, ${p.country} (${p.code})`,
                      pick: () => state.choosePort(u.ref.raw, p),
                    }))}
                  />
                )}
                {!u.chosen && u.kind === "commodity" && (
                  <Chips
                    items={u.suggestions.map((c) => ({
                      key: c.code,
                      label: c.name,
                      pick: () => state.chooseCommodity(u.key, c),
                    }))}
                  />
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};

// ---- Problems ---------------------------------------------------------------

const IssueGroup = ({
  issues,
  title,
  tone,
  defaultOpen,
}: {
  issues: ImportIssue[];
  title: string;
  tone: "bad" | "warn";
  defaultOpen: boolean;
}) =>
  issues.length ? (
    <details
      open={defaultOpen}
      className={cn(
        "group rounded-xl border",
        tone === "bad"
          ? "border-red-200 bg-red-50/50"
          : "border-ochre/40 bg-ochre/5",
      )}
    >
      <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
        {tone === "bad" ? (
          <XCircle className="h-4 w-4 shrink-0 text-red-600" />
        ) : (
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#b07d14]" />
        )}
        {title} ({issues.length})
        <ChevronDown className="ml-auto h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
      </summary>
      <ul className="max-h-64 space-y-2 overflow-y-auto border-t border-slate-200/70 px-4 py-3 text-sm text-slate-700">
        {issues.map((issue, i) => (
          <li key={i} className="break-words">
            {issue.message}
            {issue.sheet && (
              <span className="text-slate-500"> — {issue.sheet}</span>
            )}
          </li>
        ))}
      </ul>
    </details>
  ) : null;

// ---- Rates by lane ----------------------------------------------------------

const STATUS_STYLES = {
  new: "bg-green-50 text-green-700 ring-green-600/20",
  replaces: "bg-blue-50 text-blue-700 ring-blue-600/20",
  overlaps: "bg-amber-50 text-amber-800 ring-amber-600/25",
  bad: "bg-red-50 text-red-700 ring-red-600/20",
  waiting: "bg-slate-100 text-slate-600 ring-slate-500/20",
} as const;

const rateStatus = (
  r: ReviewRate,
  checking: boolean,
): { label: string; style: keyof typeof STATUS_STYLES; title?: string } => {
  if (!r.input) return { label: "Needs a match", style: "waiting" };
  if (r.conflict)
    return {
      label: "In the file twice",
      style: "bad",
      title:
        "Another rate in this file has the same lane, size, commodity and start date.",
    };
  if (!r.check)
    return { label: checking ? "Checking…" : "Not checked", style: "waiting" };
  if (r.check.problems.length)
    return {
      label: "Can't save",
      style: "bad",
      title: r.check.problems.join("; "),
    };
  if (r.check.replaces) return { label: "Replaces saved", style: "replaces" };
  if (r.check.overlaps.length)
    return {
      label: "Overlaps saved",
      style: "overlaps",
      title: `Saved rate valid ${r.check.overlaps.map((o) => formatValidity(o.validFrom, o.validTo)).join(", ")}. Customers see the one saved last.`,
    };
  return { label: "New", style: "new" };
};

const Lanes = ({ state }: { state: RateImportState }) => {
  const lanes = useMemo(() => {
    const map = new Map<string, ReviewRate[]>();
    for (const r of state.review) {
      const k = laneKey(r.draft);
      map.set(k, [...(map.get(k) ?? []), r]);
    }
    return [...map.entries()];
  }, [state.review]);
  const allKeys = lanes.map(([k]) => k);
  const included = allKeys.filter((k) => !state.excluded.has(k)).length;

  return (
    <section aria-labelledby="lanes-title" className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 id="lanes-title" className="text-base font-bold text-slate-900">
            Rates in the file
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {lanes.length} {lanes.length === 1 ? "lane" : "lanes"}, {included}{" "}
            ticked. Untick a lane to leave it out.
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => state.setLanes(allKeys, true)}
            className="text-brand hover:bg-brand/10 rounded-lg px-2.5 py-1.5 text-sm font-semibold"
          >
            Tick all
          </button>
          <button
            type="button"
            onClick={() => state.setLanes(allKeys, false)}
            className="rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Untick all
          </button>
        </div>
      </div>

      <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200">
        {lanes.map(([key, rates]) => {
          const first = rates[0];
          const on = !state.excluded.has(key);
          const codes = first.input
            ? `${first.input.origin.code} → ${first.input.destination.code}`
            : null;
          const commodity =
            first.input?.commodity ??
            (first.draft.commodity.kind === "maersk"
              ? first.draft.commodity.code
              : first.draft.commodity.text);
          const freeTime = first.draft.freeTime.length;
          return (
            <li
              key={key}
              className={cn("@container px-3.5 py-3", !on && "bg-slate-50/80")}
            >
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() => state.toggleLane(key)}
                  className="accent-brand mt-1 h-4 w-4 shrink-0"
                />
                <span className={cn("min-w-0 flex-1", !on && "opacity-55")}>
                  <span className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold text-slate-900">
                      {first.draft.origin.city ?? first.draft.origin.raw} →{" "}
                      {first.draft.destination.city ??
                        first.draft.destination.raw}
                    </span>
                    {codes && (
                      <span className="font-mono text-xs text-slate-500">
                        {codes}
                      </span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {commodity} ·{" "}
                    {formatValidity(first.draft.validFrom, first.draft.validTo)}
                    {freeTime > 0 && (
                      <span className="ml-1.5 inline-flex items-center gap-1">
                        · <Clock className="h-3 w-3" /> free time
                      </span>
                    )}
                  </span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {rates.map((r) => {
                      const status = rateStatus(r, state.checking);
                      const basic = r.draft.charges.find(
                        (c) => c.code === "BAS",
                      );
                      return (
                        <span
                          key={r.draft.key}
                          title={status.title}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium ring-1 ring-inset",
                            STATUS_STYLES[status.style],
                          )}
                        >
                          <span className="font-semibold">
                            {r.draft.containerSize}
                          </span>
                          {basic && (
                            <span className="tabular-nums">
                              {formatAmount(basic.amount, basic.currency)}
                            </span>
                          )}
                          <span className="opacity-80">· {status.label}</span>
                        </span>
                      );
                    })}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

// ---- The review -------------------------------------------------------------

const Notice = ({
  children,
  onRetry,
}: {
  children: ReactNode;
  onRetry?: () => void;
}) => (
  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
    <span className="min-w-0 flex-1">{children}</span>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 font-semibold hover:underline"
      >
        <RefreshCw className="h-3.5 w-3.5" /> Try again
      </button>
    )}
  </div>
);

const ImportReview = ({ state }: { state: RateImportState }) => {
  const parsed = state.parsed!;
  const errors = parsed.issues.filter((i) => i.level === "error");
  const warnings = parsed.issues.filter((i) => i.level === "warning");
  const replacing = state.toSave.filter((r) => r.check?.replaces).length;
  const ports = new Set(
    parsed.rates.flatMap((r) => [
      portKey(r.origin.raw),
      portKey(r.destination.raw),
    ]),
  ).size;

  return (
    <div className="@container space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <span className="bg-brand/10 text-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-xl">
          <FileSpreadsheet className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">
            {state.file?.name}
          </p>
          <p className="text-sm text-slate-500">
            {parsed.format === "maersk"
              ? `Maersk quote${parsed.quoteNumber ? ` ${parsed.quoteNumber}` : ""}`
              : "FreightAfford rates template"}{" "}
            · {parsed.rowCount} {parsed.rowCount === 1 ? "row" : "rows"} read
          </p>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-2 @xl:grid-cols-4">
        <Stat label="Ready to import" value={state.toSave.length} tone="good" />
        <Stat label="Replacing saved rates" value={replacing} />
        <Stat
          label="Need a match"
          value={state.review.filter((r) => !r.input).length}
          tone={state.waiting ? "warn" : undefined}
        />
        <Stat
          label="Left out by problems"
          value={errors.length}
          tone={errors.length ? "bad" : undefined}
        />
      </dl>

      {state.matching && (
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <SmallLoader /> Matching {ports} {ports === 1 ? "port" : "ports"} with
          Maersk's port list…
        </p>
      )}
      {state.matchError && (
        <Notice onRetry={state.retryMatch}>
          Ports and commodities couldn't be matched:{" "}
          {state.matchError.message ?? "the search didn't answer"}.
        </Notice>
      )}
      {!state.matching && state.checking && (
        <p className="flex items-center gap-2 text-sm text-slate-600">
          <SmallLoader /> Checking against the rates already saved…
        </p>
      )}
      {state.checkError && (
        <Notice onRetry={state.retryCheck}>
          The rates couldn't be checked against the saved ones:{" "}
          {state.checkError.message ?? "no answer"}.
        </Notice>
      )}

      {parsed.rates.length === 0 && (
        <Notice>
          Nothing in this file can be imported. The problems below say why.
        </Notice>
      )}

      <Unmatched state={state} />

      {(errors.length > 0 || warnings.length > 0) && (
        <section aria-label="Problems in the file" className="space-y-2">
          <IssueGroup issues={errors} title="Left out" tone="bad" defaultOpen />
          <IssueGroup
            issues={warnings}
            title="Worth knowing"
            tone="warn"
            defaultOpen={errors.length === 0 && warnings.length <= 3}
          />
        </section>
      )}

      {parsed.rates.length > 0 && <Lanes state={state} />}
    </div>
  );
};

export default ImportReview;
