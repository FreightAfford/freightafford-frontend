import {
  ArrowLeftRight,
  Container,
  MapPin,
  Navigation,
  Route,
} from "lucide-react";
import moment from "moment";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import {
  useGetActivePorts,
  useGetRoutes,
} from "../../../hooks/useScheduleService";
import { useUrlState } from "../../../hooks/useUrlState";
import {
  CONTAINER_CODES,
  CONTAINER_OPTIONS,
  containerLabel,
} from "../../../data/containers";
import {
  DEFAULT_CONTAINER,
  ROUTE_WINDOW_DAYS,
  type RouteDateMode,
} from "../../../services/api/schedule";
import { stagger } from "../../../utils/motion";
import { routeStatus, sortRoutes } from "../../../utils/routes";
import { isBookable } from "../../../utils/schedule";
import Button from "../../Button";
import DateInput from "../../DateInput";
import EmptyState from "../../EmptyState";
import ErrorState from "../../ErrorState";
import SearchSelect from "../../SearchSelect";
import Select from "../../Select";
import Switch from "../../Switch";
import ListSkeleton from "./ListSkeleton";
import RouteCard from "./RouteCard";

const ISO = "YYYY-MM-DD";

// Maersk returns routes departing up to 7 days back
const MIN_DAYS = 7;
const MAX_DAYS = 180;

const DATE_MODES: { value: RouteDateMode; label: string }[] = [
  { value: "departing", label: "Departing" },
  { value: "arriving", label: "Arriving by" },
];

// The Point to point tab: every Maersk route between two ports, as Maersk's
// own search: from, to, a departure or arrival date, and the container type.
const PointToPoint = () => {
  const { params, update } = useUrlState();
  const [now] = useState(() => moment());
  const today = now.format(ISO);

  const {
    ports,
    isPending: portsPending,
    error: portsError,
    refetch: refetchPorts,
  } = useGetActivePorts();
  const options = useMemo(
    () =>
      ports.map((p) => ({
        value: p.code,
        label: `${p.name}, ${p.country}`,
        hint: p.code,
      })),
    [ports],
  );
  const portName = (code: string) =>
    ports.find((p) => p.code === code)?.name ?? code;

  const origin = params.get("origin")?.toUpperCase() ?? "";
  const destination = params.get("destination")?.toUpperCase() ?? "";
  const mode: RouteDateMode =
    params.get("by") === "arriving" ? "arriving" : "departing";
  const date = params.get("date") || today;
  const containerParam = params.get("container") ?? "";
  const container = CONTAINER_CODES.includes(containerParam)
    ? containerParam
    : DEFAULT_CONTAINER;
  const showAll = params.get("all") === "1";

  const ready = !!origin && !!destination && origin !== destination;
  const { result, isPending, isFetching, error, refetch } = useGetRoutes(
    origin,
    destination,
    mode,
    date,
    container,
  );

  const routes = result?.routes ?? [];
  const bookable = routes.filter((r) => isBookable(routeStatus(r, now).status));
  const shown = sortRoutes(showAll ? routes : bookable, mode);

  // Four weeks from the date when departing, up to it when arriving by
  const chosen = moment(date, ISO);
  const range =
    mode === "arriving"
      ? `Arriving ${chosen
          .clone()
          .subtract(ROUTE_WINDOW_DAYS - 1, "days")
          .format("D MMM")} to ${chosen.format("D MMM YYYY")}`
      : `Departing ${chosen.format("D MMM")} to ${chosen
          .clone()
          .add(ROUTE_WINDOW_DAYS - 1, "days")
          .format("D MMM YYYY")}`;

  const noRoutesDescription = `Maersk has no sailings between these ports for a ${containerLabel(container)} in these dates. Try another date or container type.`;

  return (
    <>
      {/* The search, as Maersk lays it out */}
      <motion.div
        {...stagger(2)}
        className="@container mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm @xl:p-5"
      >
        <div className="grid gap-4">
          <div className="grid gap-4 @xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] @xl:gap-2">
            <SearchSelect
              label="From"
              icon={Navigation}
              noun="ports"
              searchPlaceholder="Search ports or countries"
              placeholder={portsPending ? "Loading ports…" : "Choose a port"}
              disabled={portsPending || !!portsError}
              options={options}
              value={origin || undefined}
              onChange={(code) => update({ origin: code })}
            />
            <button
              type="button"
              onClick={() =>
                update({ origin: destination, destination: origin })
              }
              disabled={!origin && !destination}
              aria-label="Swap From and To"
              title="Swap From and To"
              className="focus-visible:ring-brand/40 hidden h-13 w-10 items-center justify-center self-end rounded-xl text-slate-500 transition-colors outline-none hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 disabled:opacity-40 @xl:flex"
            >
              <ArrowLeftRight aria-hidden="true" className="h-4 w-4" />
            </button>
            <SearchSelect
              label="To"
              icon={MapPin}
              noun="ports"
              searchPlaceholder="Search ports or countries"
              placeholder={portsPending ? "Loading ports…" : "Choose a port"}
              disabled={portsPending || !!portsError}
              options={options}
              value={destination || undefined}
              onChange={(code) => update({ destination: code })}
            />
          </div>
          <div className="grid gap-4 @xl:grid-cols-2 @4xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
            <Select
              label="Date"
              options={DATE_MODES}
              value={mode}
              onChange={(value) =>
                update({ by: value === "arriving" ? "arriving" : "" })
              }
            />
            <DateInput
              label={mode === "arriving" ? "Arriving by" : "Departing from"}
              value={date}
              onChange={(value) => update({ date: value || today })}
              min={
                mode === "arriving"
                  ? today
                  : now.clone().subtract(MIN_DAYS, "days").format(ISO)
              }
              max={now.clone().add(MAX_DAYS, "days").format(ISO)}
            />
            <div className="@xl:col-span-2 @4xl:col-span-1">
              <Select
                label="Container type"
                icon={Container}
                options={CONTAINER_OPTIONS}
                value={container}
                onChange={(value) =>
                  update({
                    container: value === DEFAULT_CONTAINER ? "" : value,
                  })
                }
              />
            </div>
          </div>
        </div>
        {portsError && (
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-red-600">
            {portsError.message ?? "Couldn't load the list of ports."}
            <button
              type="button"
              onClick={() => refetchPorts()}
              className="text-brand font-semibold hover:underline"
            >
              Try again
            </button>
          </p>
        )}
      </motion.div>

      {!ready ? (
        <motion.section
          {...stagger(3)}
          aria-label="Choose a route"
          className="rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <EmptyState
            icon={<Route className="text-brand h-10 w-10" />}
            title={
              origin && origin === destination
                ? "Choose two different ports"
                : "Choose where your cargo starts and ends"
            }
            description="Pick a From and a To port to see every Maersk sailing between them, with transit times and cargo deadlines."
          />
        </motion.section>
      ) : (
        <motion.section
          {...stagger(3)}
          aria-labelledby="routes-title"
          className="@container overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-2 border-b border-slate-100 p-5 @2xl:flex-row @2xl:items-start @2xl:justify-between">
            <div className="min-w-0">
              <h2
                id="routes-title"
                className="flex flex-wrap items-center gap-2.5 text-lg font-bold text-slate-900"
              >
                <Route aria-hidden="true" className="text-brand h-5 w-5" />
                {portName(origin)} to {portName(destination)}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {range}, {containerLabel(container)}
              </p>
            </div>
            {result && (
              <p className="text-sm text-slate-500">
                Updated {moment(result.fetchedAt).fromNow()}
              </p>
            )}
          </div>

          {isPending ? (
            <ListSkeleton label="Loading routes" />
          ) : error ? (
            <ErrorState
              resource="routes"
              error={error}
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          ) : !routes.length ? (
            <EmptyState
              icon={<Route className="text-brand h-10 w-10" />}
              title={`No sailings from ${portName(origin)} to ${portName(destination)} in these dates`}
              description={noRoutesDescription}
            />
          ) : (
            <>
              <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3 @2xl:flex-row @2xl:items-center @2xl:justify-between">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">
                    {bookable.length} of {routes.length}
                  </span>{" "}
                  {routes.length === 1 ? "route is" : "routes are"} still
                  accepting cargo
                </p>
                <Switch
                  label="Only routes accepting cargo"
                  checked={!showAll}
                  onChange={(on) => update({ all: on ? "" : "1" })}
                  className="self-start @2xl:self-auto"
                />
              </div>

              {!shown.length ? (
                <EmptyState
                  icon={<Route className="text-brand h-10 w-10" />}
                  title="Every route in these dates has closed for cargo"
                  description="Pick a later date to see routes you can still book, or show the closed ones."
                  action={
                    <Button
                      variant="outline"
                      onClick={() => update({ all: "1" })}
                      className="rounded-xl"
                    >
                      Show closed routes
                    </Button>
                  }
                />
              ) : (
                <ul
                  aria-label={`Routes from ${portName(origin)} to ${portName(destination)}`}
                  className="space-y-3 bg-slate-50/70 p-3 @xl:space-y-4 @xl:p-4"
                >
                  {shown.map((route) => (
                    <RouteCard
                      key={`${route.id}-${route.departs.at}`}
                      route={route}
                      now={now}
                    />
                  ))}
                </ul>
              )}
            </>
          )}
        </motion.section>
      )}
    </>
  );
};

export default PointToPoint;
