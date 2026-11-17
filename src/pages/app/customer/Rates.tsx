import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  MapPin,
  Package,
  Route,
  Search,
  Tags,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useSearchParams } from "react-router";
import EmptyState from "../../../components/EmptyState";
import ErrorState from "../../../components/ErrorState";
import Input from "../../../components/Input";
import Modal from "../../../components/Modal";
import Select from "../../../components/Select";
import SmallLoader from "../../../components/SmallLoader";
import FreightRequestForm from "../../../components/app/FreightRequestForm";
import Pagination from "../../../components/app/Pagination";
import PortPair from "../../../components/app/PortPair";
import LockedRates from "../../../components/app/rates/LockedRates";
import NoRateCard from "../../../components/app/rates/NoRateCard";
import RateDetailView from "../../../components/app/rates/RateDetailView";
import ListSkeleton from "../../../components/app/schedule/ListSkeleton";
import {
  RATE_CONTAINER_SIZES,
  RATE_CONTAINER_VALUES,
} from "../../../data/rates";
import { useUser } from "../../../hooks/useAuthService";
import { useKycStatus } from "../../../hooks/useKycService";
import { useGetRateLanes, useSearchRates } from "../../../hooks/useRateService";
import type { PortLocation } from "../../../services/api/location";
import type { Rate, RateGroup, RateLane } from "../../../services/api/rate";
import cn from "../../../utils/cn";
import { stagger } from "../../../utils/motion";
import {
  formatAmount,
  formatValidity,
  isPremiumCustomer,
  monthLabel,
  rateStatus,
  thisMonth,
  toPortLocation,
  toRatePort,
} from "../../../utils/rates";

const PAGE_SIZE = 10;

// Short size names: "20ft · 40ft HC"
const shortSize = (size: string) => {
  const s = RATE_CONTAINER_SIZES.find((c) => c.value === size);
  return s ? (s.kind === "High Cube" ? `${s.size} HC` : s.size) : size;
};

// A lane we have rates for, picked in one click.
const LaneButton = ({
  lane,
  onPick,
}: {
  lane: RateLane;
  onPick: (lane: RateLane) => void;
}) => (
  <li>
    <button
      type="button"
      onClick={() => onPick(lane)}
      className="group hover:border-brand focus-visible:ring-brand/40 flex h-full w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3.5 text-left transition-colors outline-none focus-visible:ring-2"
    >
      <span className="min-w-0">
        <span className="text-harbour flex items-center gap-1.5 font-mono text-[13px] font-semibold tracking-wide">
          {lane.origin.code}
          <ArrowRight aria-label="to" className="h-3.5 w-3.5 text-slate-400" />
          {lane.destination.code}
        </span>
        <span className="mt-0.5 block text-sm font-medium break-words text-slate-900">
          {lane.origin.city} to {lane.destination.city}
        </span>
        <span className="mt-0.5 block text-xs text-slate-500">
          {lane.commodities}{" "}
          {lane.commodities === 1 ? "commodity" : "commodities"} ·{" "}
          {lane.sizes.map(shortSize).join(" · ")}
        </span>
      </span>
      <ArrowRight
        aria-hidden="true"
        className="group-hover:text-brand h-4 w-4 shrink-0 text-slate-300 transition-colors"
      />
    </button>
  </li>
);

// One commodity priced on a lane, in the results list.
const CommodityRow = ({
  group,
  showOrigin,
  onOpen,
}: {
  group: RateGroup;
  showOrigin: boolean;
  onOpen: (group: RateGroup) => void;
}) => {
  const endsSoon = group.rates.some((r) => rateStatus(r) === "expiring");
  return (
    <li>
      <button
        type="button"
        onClick={() => onOpen(group)}
        className="group focus-visible:ring-brand/40 hover:bg-mist/50 grid w-full grid-cols-2 gap-x-4 gap-y-3 px-4 py-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-inset @2xl:grid-cols-[minmax(0,1fr)_minmax(0,11rem)_minmax(0,9rem)_auto] @2xl:items-center @2xl:gap-6 @2xl:px-5"
      >
        <span className="col-span-2 flex min-w-0 items-start gap-3 @2xl:col-span-1">
          <span
            aria-hidden="true"
            className="bg-brand/10 text-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          >
            <Package className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block font-semibold break-words text-slate-900">
              {group.commodity}
            </span>
            <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              {showOrigin && (
                <span className="flex items-center gap-1">
                  <MapPin aria-hidden="true" className="h-3 w-3" />
                  From {group.origin.city}
                </span>
              )}
              {/* Each size once, though it may have two periods */}
              {[...new Set(group.rates.map((r) => r.containerSize))].map(
                (size) => (
                  <span
                    key={size}
                    className="rounded bg-slate-100 px-1.5 py-0.5 font-medium text-slate-600"
                  >
                    {shortSize(size)}
                  </span>
                ),
              )}
            </span>
          </span>
        </span>

        <span className="pl-12 @2xl:pl-0">
          {group.fromBasic ? (
            <>
              <span className="block text-xs text-slate-500">
                Basic freight from
              </span>
              <span className="font-display font-bold text-slate-900 tabular-nums">
                {formatAmount(group.fromBasic.amount, group.fromBasic.currency)}
              </span>
            </>
          ) : (
            <span className="text-sm text-slate-500">See charges</span>
          )}
        </span>

        <span className="text-sm">
          <span className="block text-xs text-slate-500">Valid</span>
          <span
            className={cn(
              "font-medium tabular-nums",
              endsSoon ? "text-[#9a6a0c]" : "text-slate-700",
            )}
          >
            {formatValidity(group.validFrom, group.validTo)}
          </span>
        </span>

        <span className="text-brand hidden items-center gap-1 text-sm font-semibold @2xl:flex">
          View rates
          <ChevronRight
            aria-hidden="true"
            className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </button>
    </li>
  );
};

// Ports travel in the URL as a code plus "City, Country", so a reload or
// Back shows the same ports without another lookup.
const portFromUrl = (code: string | null, name: string | null) => {
  if (!code || !/^[A-Z]{2}[A-Z2-9]{3}$/.test(code)) return null;
  const label = name ?? code;
  const cut = label.lastIndexOf(", ");
  return toPortLocation({
    code,
    city: cut > 0 ? label.slice(0, cut) : label,
    country: cut > 0 ? label.slice(cut + 2) : "",
  });
};

const portName = (loc: PortLocation) =>
  loc.country ? `${loc.city}, ${loc.country}` : loc.city;

// An opened commodity is "origin code~commodity name", e.g.
// "NGAPP~Sesame seeds".
const OPEN_SEPARATOR = "~";

// Search and results, for verified customers: a destination (and
// optionally where from), every commodity priced into it, then one
// commodity's rates. Everything that shapes the view lives in the URL
// (to, from, month, q, page, rate, size, qty), so a reload, a shared link
// or coming Back shows the same place.
const RateFinder = () => {
  const [params, setParams] = useSearchParams();
  const origin = portFromUrl(params.get("from"), params.get("fromName"));
  const destination = portFromUrl(params.get("to"), params.get("toName"));
  // The month looked at: this one unless the URL names a later one. Only a
  // later month goes to the API (and into the URL).
  const current = thisMonth();
  const monthParam = params.get("month") ?? "";
  const month =
    /^\d{4}-(0[1-9]|1[0-2])$/.test(monthParam) && monthParam > current
      ? monthParam
      : current;
  const laterMonth = month === current ? undefined : month;
  const inMonth = laterMonth ? `in ${monthLabel(month)}` : "this month";
  const q = params.get("q") ?? "";
  const pageParam = Number(params.get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 1 ? pageParam : 1;
  const [openOrigin, openCommodity] = (params.get("rate") ?? "").split(
    OPEN_SEPARATOR,
  );
  const isOpen = !!openOrigin && !!openCommodity;
  const sizeParam = params.get("size");
  const size = RATE_CONTAINER_VALUES.find((s) => s === sizeParam) ?? null;
  const qtyParam = Number(params.get("qty"));
  const containers =
    Number.isInteger(qtyParam) && qtyParam >= 1 && qtyParam <= 50
      ? qtyParam
      : 1;

  // Writes changes into the URL; empty values drop out. Opening or closing
  // a commodity adds a history entry, so Back returns to the list; the
  // rest replace it, so typing in the filter doesn't flood history.
  const update = (
    changes: Record<string, string | number | null | undefined>,
    { push = false } = {},
  ) =>
    setParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        for (const [key, value] of Object.entries(changes)) {
          const str = value === null || value === undefined ? "" : `${value}`;
          if (
            !str ||
            (key === "page" && str === "1") ||
            (key === "qty" && str === "1")
          )
            next.delete(key);
          else next.set(key, str);
        }
        return next;
      },
      { replace: !push },
    );

  const [filter, setFilter] = useState(q);
  // Keep the box in step when the URL changes from outside (Back, a link)
  const [syncedQ, setSyncedQ] = useState(q);
  if (syncedQ !== q) {
    setSyncedQ(q);
    setFilter(q);
  }

  const [quoting, setQuoting] = useState<{
    rate: Rate;
    containers: number;
  } | null>(null);
  const resultsRef = useRef<HTMLElement>(null);

  const samePort = !!origin && origin.code === destination?.code;
  const ready = !!destination && !samePort;

  // A new search starts on page one, with the list showing.
  const changeLane = (next: {
    origin?: PortLocation | null;
    destination?: PortLocation | null;
  }) => {
    const changes: Record<string, string | null> = {
      q: null,
      page: null,
      rate: null,
      size: null,
      qty: null,
    };
    if ("origin" in next) {
      changes.from = next.origin?.code ?? null;
      changes.fromName = next.origin ? portName(next.origin) : null;
    }
    if ("destination" in next) {
      changes.to = next.destination?.code ?? null;
      changes.toName = next.destination ? portName(next.destination) : null;
    }
    update(changes);
  };

  // Filter as they type, without a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      if (filter.trim() !== q) update({ q: filter.trim(), page: null });
    }, 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const {
    lanes,
    months: laneMonths,
    isPending: lanesPending,
  } = useGetRateLanes(!ready, laterMonth);
  const {
    groups,
    total,
    totalAll,
    months: searchMonths,
    request,
    isPending,
    isFetching,
    isRefetching,
    error,
    refetch,
  } = useSearchRates({
    origin: origin?.code,
    destination: ready ? destination.code : "",
    month: laterMonth,
    q: q || undefined,
    page,
    limit: PAGE_SIZE,
  });

  // The opened commodity, looked up on its own so it doesn't depend on
  // the page or filter the list is showing.
  const opened = useSearchRates({
    origin: openOrigin,
    destination: ready && isOpen ? destination.code : "",
    month: laterMonth,
    q: openCommodity,
    limit: 50,
  });
  const open = isOpen
    ? (opened.groups.find(
        (g) => g.origin.code === openOrigin && g.commodity === openCommodity,
      ) ?? null)
    : null;

  // This month, then the later months with rates (for the lane once one is
  // chosen), always including the month being looked at.
  const monthsShown = [
    ...new Set([current, ...(ready ? searchMonths : laneMonths), month]),
  ].sort();
  const monthsKnown = ready ? !isFetching && searchMonths.length > 0 : false;
  useEffect(() => {
    // A new lane may have no rates in the chosen month: back to this month
    if (monthsKnown && laterMonth && !searchMonths.includes(laterMonth))
      update({ month: null, page: null, rate: null, size: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthsKnown, laterMonth, searchMonths.join()]);

  const pickMonth = (next: string) =>
    update({
      month: next === current ? null : next,
      page: null,
      rate: null,
      size: null,
    });

  const showResults = () =>
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const openGroup = (group: RateGroup | null) => {
    update(
      group
        ? {
            rate: `${group.origin.code}${OPEN_SEPARATOR}${group.commodity}`,
            size: null,
          }
        : { rate: null, size: null },
      { push: true },
    );
    requestAnimationFrame(showResults);
  };

  const pickLane = (lane: RateLane) =>
    changeLane({
      origin: toPortLocation(lane.origin),
      destination: toPortLocation(lane.destination),
    });

  const title = ready
    ? origin
      ? `${origin.city} to ${destination.city}`
      : `Into ${destination.city}`
    : "";

  return (
    // Room at the bottom so the chat button never covers the last action.
    <div className="pb-20">
      <motion.div {...stagger(0)} className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900">Contract rates</h1>
        <p className="mt-1 max-w-2xl text-slate-500">
          Our Maersk contract rates by lane and commodity, with every charge
          listed. Choose where your cargo is going; adding where it ships from
          narrows the list.
        </p>
      </motion.div>

      {/* The search: a destination, and optionally where from */}
      <motion.div
        {...stagger(1)}
        className="@container mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm @xl:p-5"
      >
        <PortPair
          id="rate-lane"
          originPlaceholder="Optional: search a city or port, e.g. Apapa"
          destinationPlaceholder="Search a city or port, e.g. Antwerp"
          origin={origin}
          destination={destination}
          onOriginChange={(loc) => changeLane({ origin: loc })}
          onDestinationChange={(loc) => changeLane({ destination: loc })}
          destinationError={samePort}
          error={samePort ? "Choose two different ports" : undefined}
        />
        <div className="mt-3 @xl:max-w-xs">
          <Select
            icon={CalendarDays}
            label="Month"
            value={month}
            onChange={pickMonth}
            options={monthsShown.map((m) => ({
              value: m,
              label:
                m === current ? `${monthLabel(m)} (this month)` : monthLabel(m),
            }))}
          />
        </div>
      </motion.div>

      {!ready ? (
        <motion.section
          {...stagger(2)}
          aria-labelledby="lanes-title"
          className="@container rounded-2xl border border-slate-200 bg-white p-4 shadow-sm @xl:p-5"
        >
          <h2
            id="lanes-title"
            className="flex items-center gap-2 text-lg font-bold text-slate-900"
          >
            <Tags aria-hidden="true" className="text-brand h-5 w-5" />
            Lanes with rates {inMonth}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pick one, or search above. If we haven't priced your lane or
            commodity yet, you can ask us to.
          </p>
          {lanesPending ? (
            <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
              <SmallLoader /> Loading lanes…
            </div>
          ) : lanes.length ? (
            <ul className="mt-4 grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-3">
              {lanes.map((lane) => (
                <LaneButton
                  key={`${lane.origin.code}-${lane.destination.code}`}
                  lane={lane}
                  onPick={pickLane}
                />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={<Route className="text-brand h-10 w-10" />}
              title={`No lanes priced ${inMonth}`}
              description="Search the ports you ship between and ask us for a rate."
            />
          )}
        </motion.section>
      ) : (
        <motion.section
          {...stagger(2)}
          ref={resultsRef}
          aria-labelledby="rates-title"
          className="@container scroll-mt-20"
        >
          {isOpen && !open ? (
            // Opened from the URL: loading, or the rate has since ended
            opened.isPending ? (
              <div className="rounded-2xl border border-slate-200 bg-white">
                <ListSkeleton label="Loading rates" />
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white">
                <EmptyState
                  icon={<Package className="text-brand h-10 w-10" />}
                  title={`No rate for ${openCommodity.toLowerCase()} ${inMonth}`}
                  description={`It may have ended. Go back to see the commodities priced ${inMonth}.`}
                  action={
                    <button
                      type="button"
                      onClick={() => openGroup(null)}
                      className="text-brand text-sm font-semibold hover:underline"
                    >
                      See all commodities
                    </button>
                  }
                />
              </div>
            )
          ) : open ? (
            <RateDetailView
              key={open.key}
              group={open}
              request={request}
              size={size}
              onSizeChange={(next) => update({ size: next })}
              containers={containers}
              onContainersChange={(next) => update({ qty: next })}
              onBack={() => openGroup(null)}
              onRequestQuote={(rate, count) =>
                setQuoting({ rate, containers: count })
              }
            />
          ) : (
            <>
              <div className="mb-3">
                <h2
                  id="rates-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {title}
                </h2>
                {!isPending && !error && totalAll > 0 && (
                  <p className="text-sm text-slate-500">
                    {totalAll} {totalAll === 1 ? "commodity" : "commodities"}{" "}
                    priced {inMonth}
                    {!origin && " from all origins"}
                  </p>
                )}
              </div>

              {isPending ? (
                <div className="rounded-2xl border border-slate-200 bg-white">
                  <ListSkeleton label="Loading rates" />
                </div>
              ) : error ? (
                <div className="rounded-2xl border border-slate-200 bg-white">
                  <ErrorState
                    resource="rates"
                    error={error}
                    onRetry={() => refetch()}
                    isRetrying={isFetching}
                  />
                </div>
              ) : !totalAll ? (
                origin ? (
                  <NoRateCard
                    key={`${origin.code}-${destination.code}`}
                    origin={toRatePort(origin)}
                    destination={toRatePort(destination)}
                    sizes={RATE_CONTAINER_VALUES}
                    request={request}
                  />
                ) : (
                  <div className="rounded-2xl border border-slate-200 bg-white">
                    <EmptyState
                      icon={<Route className="text-brand h-10 w-10" />}
                      title={`No contract rates into ${destination.city} ${inMonth}`}
                      description="Add where your cargo ships from, and you can ask us to price the lane."
                    />
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 p-4 @2xl:px-5">
                      <Input
                        icon={Search}
                        aria-label="Filter commodities"
                        placeholder="Filter commodities, e.g. cashew"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="@2xl:max-w-md"
                      />
                    </div>
                    {isRefetching ? (
                      <div className="flex items-center justify-center gap-2 p-10 text-slate-500">
                        <SmallLoader /> Loading…
                      </div>
                    ) : groups.length ? (
                      <ul
                        aria-label={`Commodities priced ${origin ? `from ${origin.city} ` : ""}to ${destination.city}`}
                        className="divide-y divide-slate-100"
                      >
                        {groups.map((g) => (
                          <CommodityRow
                            key={g.key}
                            group={g}
                            showOrigin={!origin}
                            onOpen={openGroup}
                          />
                        ))}
                      </ul>
                    ) : (
                      <p className="p-10 text-center text-sm text-slate-500">
                        No commodity matches “{q}”.
                        {origin && " You can ask us to price it below."}
                      </p>
                    )}
                    <Pagination
                      currentPage={page}
                      totalPages={Math.ceil(total / PAGE_SIZE)}
                      onPageChange={(next) => {
                        update({ page: next });
                        showResults();
                      }}
                    />
                  </div>

                  {origin ? (
                    <NoRateCard
                      key={`${origin.code}-${destination.code}-other`}
                      compact
                      origin={toRatePort(origin)}
                      destination={toRatePort(destination)}
                      sizes={RATE_CONTAINER_VALUES}
                      request={request}
                      prompt={
                        <>
                          <span className="font-semibold text-slate-900">
                            Shipping something else?
                          </span>{" "}
                          If your commodity isn't listed, ask us to price it.
                        </>
                      }
                    />
                  ) : (
                    <p className="text-sm text-slate-500">
                      Not listed? Add where your cargo ships from to ask us for
                      a rate.
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </motion.section>
      )}

      <Modal
        isOpen={!!quoting}
        title="New freight request"
        size="lg"
        onClose={() => setQuoting(null)}
      >
        {quoting && (
          <>
            <FreightRequestForm
              key={quoting.rate._id}
              onCancel={() => setQuoting(null)}
              initial={{
                origin: toPortLocation(quoting.rate.origin),
                destination: toPortLocation(quoting.rate.destination),
                containerSize: quoting.rate.containerSize,
                containerQuantity: quoting.containers,
                rate: quoting.rate,
              }}
            />
          </>
        )}
      </Modal>
    </div>
  );
};

// Contract rates: staff always see them; commission customers once their
// business is verified; premium customers never (the API checks the same).
const CustomerRates = () => {
  const { user, isPending: userPending } = useUser();
  const isCustomer = user?.role === "customer";
  const premium = isPremiumCustomer(user);
  const { status, isPending: kycPending } = useKycStatus(
    isCustomer && !premium,
  );

  if (premium) return <Navigate to="/app/customer" replace />;

  if (userPending || (isCustomer && kycPending))
    return (
      <div className="flex items-center justify-center gap-2 p-10 text-slate-500">
        <SmallLoader /> Loading…
      </div>
    );

  if (isCustomer && status !== "approved") return <LockedRates />;

  return <RateFinder />;
};

export default CustomerRates;
