import {
  ArrowLeft,
  CalendarRange,
  Info,
  Minus,
  Package,
  Plus,
  Repeat,
  Send,
  Timer,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import {
  RATE_CONTAINER_VALUES,
  type RateContainerSize,
} from "../../../data/rates";
import type { Rate, RateGroup, RateRequest } from "../../../services/api/rate";
import cn from "../../../utils/cn";
import {
  formatTransit,
  formatValidity,
  rateSizeLabel,
} from "../../../utils/rates";
import Button from "../../Button";
import NoRateCard from "./NoRateCard";
import RateFreeTime from "./RateFreeTime";
import RateTable from "./RateTable";
import RateValidity from "./RateValidity";

const MAX_CONTAINERS = 50;

// How many containers to price the table for.
const ContainerCount = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) => {
  const set = (next: number) =>
    onChange(Math.min(MAX_CONTAINERS, Math.max(1, next || 1)));
  return (
    <div className="flex items-center gap-3">
      <span
        id="containers-label"
        className="text-sm font-medium text-slate-600"
      >
        Containers
      </span>
      <div
        role="group"
        aria-labelledby="containers-label"
        className="focus-within:border-brand flex h-10 items-center rounded-xl border border-slate-200 bg-white"
      >
        <button
          type="button"
          onClick={() => set(value - 1)}
          disabled={value <= 1}
          aria-label="Fewer containers"
          className="flex h-full w-9 items-center justify-center rounded-l-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
        >
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="number"
          min={1}
          max={MAX_CONTAINERS}
          value={value}
          aria-label="Number of containers"
          onChange={(e) => set(Number(e.target.value))}
          className="h-full w-12 [appearance:textfield] border-x border-slate-200 bg-transparent text-center font-semibold text-slate-900 tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <button
          type="button"
          onClick={() => set(value + 1)}
          disabled={value >= MAX_CONTAINERS}
          aria-label="More containers"
          className="flex h-full w-9 items-center justify-center rounded-r-xl text-slate-500 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// One labelled fact about the rate, e.g. its transit time.
const RateDetail = ({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: ReactNode;
}) => (
  <div className="flex min-w-0 items-start gap-2.5">
    <Icon
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
    />
    <div className="min-w-0">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="text-sm font-semibold text-slate-900">{children}</dd>
    </div>
  </div>
);

interface RateDetailViewProps {
  group: RateGroup;
  // The customer's open request for this lane, if any.
  request: RateRequest | null;
  // The size tab and container count, kept in the URL by the page.
  size: RateContainerSize | null;
  onSizeChange: (size: RateContainerSize) => void;
  containers: number;
  onContainersChange: (containers: number) => void;
  onBack: () => void;
  onRequestQuote: (rate: Rate, containers: number) => void;
}

// One commodity on one lane: a tab per container size, what the rate
// covers, its charges for the containers chosen, and free time.
const RateDetailView = ({
  group,
  request,
  size,
  onSizeChange,
  containers,
  onContainersChange,
  onBack,
  onRequestQuote,
}: RateDetailViewProps) => {
  const rate =
    group.rates.find((r) => r.containerSize === size) ?? group.rates[0];
  const missingSizes = RATE_CONTAINER_VALUES.filter(
    (s) => !group.rates.some((r) => r.containerSize === s),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <button
            type="button"
            onClick={onBack}
            className="text-brand focus-visible:ring-brand/40 -ml-1 inline-flex items-center gap-1.5 rounded-md px-1 text-sm font-semibold outline-none hover:underline focus-visible:ring-2"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            All commodities
          </button>
          <h3 className="mt-1 text-lg font-bold text-slate-900">
            {group.commodity}
          </h3>
          <p className="text-sm text-slate-500">
            {group.origin.city} to {group.destination.city}
          </p>
        </div>

        {/* The sizes priced for this commodity, one shown at a time */}
        <div
          role="tablist"
          aria-label="Container size"
          className="flex w-full flex-wrap gap-1 rounded-xl bg-slate-100 p-1 @xl:w-auto"
        >
          {group.rates.map((r) => {
            const on = r._id === rate._id;
            return (
              <button
                key={r._id}
                type="button"
                role="tab"
                id={`size-tab-${r._id}`}
                aria-selected={on}
                aria-controls="rate-panel"
                onClick={() => onSizeChange(r.containerSize)}
                className={cn(
                  "focus-visible:ring-brand/40 h-9 flex-1 rounded-lg px-3.5 text-sm font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-2 @xl:flex-none",
                  on
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800",
                )}
              >
                {rateSizeLabel(r.containerSize)}
              </button>
            );
          })}
        </div>
      </div>

      <div
        id="rate-panel"
        role="tabpanel"
        aria-labelledby={`size-tab-${rate._id}`}
        className="space-y-4"
      >
        {/* What the rate covers, how many, and the next step */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <dl className="grid gap-x-6 gap-y-4 p-4 @xl:grid-cols-2 @3xl:px-5 @4xl:grid-cols-4">
            <RateDetail icon={CalendarRange} label="Valid">
              <span className="tabular-nums">
                {formatValidity(rate.validFrom, rate.validTo)}
              </span>
              <span className="mt-1 block">
                <RateValidity rate={rate} />
              </span>
            </RateDetail>
            {rate.transitHours ? (
              <RateDetail icon={Timer} label="Transit time">
                {formatTransit(rate.transitHours)}
              </RateDetail>
            ) : null}
            {rate.serviceMode ? (
              <RateDetail icon={Repeat} label="Service">
                {rate.serviceMode}
                <span className="block text-xs font-normal text-slate-500">
                  Port to port
                </span>
              </RateDetail>
            ) : null}
            <RateDetail icon={Package} label="Commodity">
              {rate.commodity}
            </RateDetail>
          </dl>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-4 @3xl:px-5">
            <ContainerCount value={containers} onChange={onContainersChange} />
            <Button
              icon={Send}
              onClick={() => onRequestQuote(rate, containers)}
              className="h-10 rounded-xl px-5 font-semibold"
            >
              Request a quote
            </Button>
          </div>
        </div>

        <RateTable rate={rate} containers={containers} />

        {rate.freeTime?.length ? (
          <RateFreeTime
            freeTime={rate.freeTime}
            place={rate.destination.city}
          />
        ) : null}

        {rate.remarks && (
          <p className="flex items-start gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            <Info
              aria-hidden="true"
              className="mt-0.5 h-4 w-4 shrink-0 text-slate-400"
            />
            {rate.remarks}
          </p>
        )}
      </div>

      {missingSizes.length > 0 && (
        <NoRateCard
          key={`${group.key}-more`}
          compact
          origin={group.origin}
          destination={group.destination}
          sizes={missingSizes}
          request={request}
          forCommodity={{ name: group.commodity, code: rate.commodityCode }}
          prompt={
            <>
              <span className="font-semibold text-slate-900">
                Need another size?
              </span>{" "}
              We don't have a{" "}
              {missingSizes.map((s) => rateSizeLabel(s)).join(" or ")} rate for{" "}
              {group.commodity.toLowerCase()} on this lane yet.
            </>
          }
        />
      )}
    </div>
  );
};

export default RateDetailView;
