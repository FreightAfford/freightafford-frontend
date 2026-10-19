import { Anchor, Globe } from "lucide-react";
import moment from "moment";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { useSearchParams } from "react-router";
import PortCallRow from "../../../components/app/schedule/PortCallRow";
import Button from "../../../components/Button";
import DateInput from "../../../components/DateInput";
import EmptyState from "../../../components/EmptyState";
import ErrorState from "../../../components/ErrorState";
import SearchSelect from "../../../components/SearchSelect";
import Select from "../../../components/Select";
import {
  useGetActivePorts,
  useGetPortSchedule,
} from "../../../hooks/useScheduleService";
import { DEFAULT_PORT, SCHEDULE_DAYS } from "../../../services/api/schedule";
import cn from "../../../utils/cn";
import { stagger } from "../../../utils/motion";
import {
  byArrival,
  callStatus,
  isBookable,
  utcLabel,
} from "../../../utils/schedule";

const ISO = "YYYY-MM-DD";

// Maersk serves port schedules from 90 days back to 180 days ahead.
const MIN_DAYS = 90;
const MAX_DAYS = 180;

const Skeleton = () => (
  <div className="space-y-3 p-5" aria-label="Loading port calls">
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        className="h-28 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none"
      />
    ))}
  </div>
);

const AdminSchedules = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [now] = useState(() => moment());
  const today = now.format(ISO);

  const {
    ports,
    isPending: portsPending,
    error: portsError,
    refetch: refetchPorts,
  } = useGetActivePorts();
  const countries = useMemo(
    () =>
      [...new Map(ports.map((p) => [p.countryCode, p.country]))]
        .map(([value, label]) => ({ value, label, hint: value }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [ports],
  );

  // The search lives in the URL, so a reload or shared link keeps it. A
  // country with no port yet (just switched) waits for one to be picked.
  const countryParam = searchParams.get("country")?.toUpperCase() ?? "";
  const portCode = (
    searchParams.get("port") || (countryParam ? "" : DEFAULT_PORT)
  ).toUpperCase();
  const from = searchParams.get("from") || today;
  const days = SCHEDULE_DAYS.includes(Number(searchParams.get("days")))
    ? Number(searchParams.get("days"))
    : 7;

  // An empty value removes the key
  const update = (next: Record<string, string>) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(next).forEach(([key, value]) =>
      value ? params.set(key, value) : params.delete(key),
    );
    setSearchParams(params, { replace: true });
  };

  const { schedule, isPending, error, refetch, isFetching } =
    useGetPortSchedule(portCode, from, days);

  // Names come from the port list, or from the schedule until it loads
  const port = !portCode
    ? null
    : (ports.find((p) => p.code === portCode) ?? {
        code: portCode,
        name: schedule?.port.name ?? portCode,
        countryCode: portCode.slice(0, 2),
        country: schedule?.port.country ?? "",
      });
  const countryCode = port?.countryCode ?? countryParam;
  const countryName =
    countries.find((c) => c.value === countryCode)?.label ?? countryCode;
  const countryPorts = ports.filter((p) => p.countryCode === countryCode);

  const calls = (schedule?.terminals ?? [])
    .flatMap((t) => t.calls.map((call) => ({ call, terminal: t.name })))
    .sort((a, b) => byArrival(a.call, b.call));
  // Closed and departed sailings are hidden unless asked for.
  const showAll = searchParams.get("all") === "1";
  const bookable = calls.filter(({ call }) =>
    isBookable(callStatus(call, now).status),
  );
  const shown = showAll ? calls : bookable;

  const fromDate = moment(from, ISO);
  const range = `${fromDate.format("D MMM")} to ${fromDate
    .clone()
    .add(days - 1, "days")
    .format("D MMM YYYY")}`;
  const offset = schedule?.port.utcOffset
    ? utcLabel(schedule.port.utcOffset)
    : "";

  return (
    <>
      <motion.div {...stagger(0)} className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Sailing schedules</h1>
        {/* Becomes the category line ("by port, by route or by vessel") once
            Point to point and Vessel schedule join as tabs */}
        <p className="mt-1 max-w-xl text-slate-500">
          Vessels arriving at and leaving a port, with their cargo deadlines.
          All times are local to the port.
        </p>
      </motion.div>

      {/* The search */}
      <motion.div
        {...stagger(1)}
        className="@container mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm @xl:p-5"
      >
        <div className="grid gap-4 @xl:grid-cols-[repeat(2,minmax(0,1fr))] @4xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.7fr)]">
          <SearchSelect
            label="Country / Region"
            icon={Globe}
            noun="countries"
            searchPlaceholder="Search countries"
            placeholder={
              portsPending ? "Loading countries…" : "Choose a country"
            }
            disabled={portsPending || !!portsError}
            options={countries}
            value={ports.length ? countryCode : undefined}
            onChange={(code) => {
              if (code !== countryCode) update({ country: code, port: "" });
            }}
          />
          <Select
            label="Port"
            placeholder={portsPending ? "Loading ports…" : "Choose a port"}
            disabled={portsPending || !!portsError}
            options={countryPorts.map((p) => ({
              value: p.code,
              label: p.name,
            }))}
            value={ports.length && port ? port.code : undefined}
            onChange={(code) => update({ port: code, country: "" })}
          />
          <DateInput
            label="Date from"
            value={from}
            onChange={(value) => update({ from: value || today })}
            min={now.clone().subtract(MIN_DAYS, "days").format(ISO)}
            max={now.clone().add(MAX_DAYS, "days").format(ISO)}
          />
          <Select
            label="Days"
            options={SCHEDULE_DAYS.map((d) => ({
              value: String(d),
              label: `${d} days`,
            }))}
            value={String(days)}
            onChange={(value) => update({ days: value })}
          />
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

      {!port ? (
        <motion.section
          {...stagger(2)}
          aria-label="Choose a port"
          className="rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <EmptyState
            icon={<Anchor className="text-brand h-10 w-10" />}
            title={`Choose a port in ${countryName}`}
            description={
              countryPorts.length
                ? `Maersk calls at ${countryPorts.length} ${countryPorts.length === 1 ? "port" : "ports"} there. Pick one to see its vessels and cargo deadlines.`
                : "Pick a port to see its vessels and cargo deadlines."
            }
          />
        </motion.section>
      ) : (
        <motion.section
          {...stagger(2)}
          aria-labelledby="port-calls-title"
          className="@container overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex flex-col gap-2 border-b border-slate-100 p-5 @2xl:flex-row @2xl:items-start @2xl:justify-between">
            <div className="min-w-0">
              <h2
                id="port-calls-title"
                className="flex flex-wrap items-center gap-2.5 text-lg font-bold text-slate-900"
              >
                <Anchor aria-hidden="true" className="text-brand h-5 w-5" />
                {port.country ? `${port.name}, ${port.country}` : port.name}
                <span className="bg-mist text-harbour rounded-md px-1.5 py-0.5 font-mono text-xs font-semibold tracking-wide">
                  {port.code}
                </span>
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {range}
                {offset && `, times in ${offset}`}
              </p>
            </div>
            {schedule && (
              <p className="text-sm text-slate-500">
                Updated {moment(schedule.fetchedAt).fromNow()}
              </p>
            )}
          </div>

          {isPending ? (
            <Skeleton />
          ) : error ? (
            <ErrorState
              resource="port calls"
              error={error}
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          ) : !calls.length ? (
            <EmptyState
              icon={<Anchor className="text-brand h-10 w-10" />}
              title={`No vessels calling at ${port.name} from ${range}`}
              description="Maersk has no vessels listed at this port for these dates. Try more days or a later date."
            />
          ) : (
            <>
              <div className="flex flex-col gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-3 @2xl:flex-row @2xl:items-center @2xl:justify-between">
                <p className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">
                    {bookable.length} of {calls.length}
                  </span>{" "}
                  {calls.length === 1 ? "sailing is" : "sailings are"} still
                  accepting cargo
                </p>
                <button
                  type="button"
                  role="switch"
                  aria-checked={!showAll}
                  onClick={() => update({ all: showAll ? "0" : "1" })}
                  className="group focus-visible:ring-brand/40 flex items-center gap-2.5 self-start rounded-lg text-sm font-medium text-slate-700 outline-none focus-visible:ring-2 @2xl:self-auto"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative h-5 w-9 rounded-full transition-colors motion-reduce:transition-none",
                      showAll ? "bg-slate-300" : "bg-brand",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none",
                        !showAll && "translate-x-4",
                      )}
                    />
                  </span>
                  Only sailings accepting cargo
                </button>
              </div>

              {!shown.length ? (
                <EmptyState
                  icon={<Anchor className="text-brand h-10 w-10" />}
                  title="Every sailing in these dates has closed for cargo"
                  description="Pick a later date to see sailings you can still book, or show the closed ones."
                  action={
                    <Button
                      variant="outline"
                      onClick={() => update({ all: "1" })}
                      className="rounded-xl"
                    >
                      Show closed sailings
                    </Button>
                  }
                />
              ) : (
                <ul
                  aria-label={`Vessels calling at ${port.name}`}
                  className="divide-y divide-slate-100"
                >
                  {shown.map(({ call, terminal }) => (
                    <PortCallRow
                      key={call.id}
                      call={call}
                      terminal={terminal}
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
export default AdminSchedules;
