import { Navigation, Ship } from "lucide-react";
import moment from "moment";
import { motion } from "motion/react";
import { Fragment, useMemo, useState } from "react";
import {
  useGetActiveVessels,
  useGetVesselSchedule,
} from "../../../hooks/useScheduleService";
import { useUrlState } from "../../../hooks/useUrlState";
import {
  VESSEL_SCHEDULE_WEEKS,
  type VesselScheduleResult,
} from "../../../services/api/schedule";
import { stagger } from "../../../utils/motion";
import { flagLabel } from "../../../utils/routes";
import { portDate, portHour } from "../../../utils/schedule";
import {
  hasLeft,
  vesselPosition,
  type VesselPosition,
} from "../../../utils/vessels";
import DateInput from "../../DateInput";
import EmptyState from "../../EmptyState";
import ErrorState from "../../ErrorState";
import SearchSelect from "../../SearchSelect";
import ListSkeleton from "./ListSkeleton";
import VesselCallRow from "./VesselCallRow";

const ISO = "YYYY-MM-DD";

// Maersk serves vessel schedules from 3 months back to 6 months ahead
const MIN_DAYS = 90;
const MAX_DAYS = 180;

const when = (at: string) => `${portDate(at)}, ${portHour(at)}`;

// IMO, flag, built, call sign and services, as on the route details
const VesselFacts = ({ schedule }: { schedule: VesselScheduleResult }) => {
  const v = schedule.vessel;
  const facts = [
    ["IMO Number", v.imo],
    ["Flag", v.flag && flagLabel(v.flag)],
    ["Built", v.builtYear && String(v.builtYear)],
    ["Call Sign", v.callSign],
    [
      schedule.services.length > 1 ? "Services" : "Service",
      schedule.services.map((s) => s.name).join(", "),
    ],
  ].filter((f): f is [string, string] => !!f[1]);

  return (
    <dl className="mt-3 flex flex-wrap gap-x-8 gap-y-3">
      {facts.map(([label, value]) => (
        <div key={label}>
          <dt className="text-xs font-medium text-slate-600">{label}</dt>
          <dd className="text-sm font-medium whitespace-nowrap text-slate-900 tabular-nums">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
};

// One line saying where the vessel is right now
const PositionLine = ({ position }: { position: VesselPosition }) => (
  <p className="bg-mist text-harbour flex items-start gap-2 rounded-xl px-4 py-3 text-sm">
    <Navigation aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
    {position.state === "in-port" ? (
      <span>
        In port at{" "}
        <span className="font-semibold">{position.call.port.name}</span>
        {position.until && <> until {when(position.until)}</>}
      </span>
    ) : (
      <span>
        Sailing to{" "}
        <span className="font-semibold">{position.to.port.name}</span>
        {position.due && <>, due {when(position.due)}</>}
      </span>
    )}
  </p>
);

// A line between two ports on the rail: the vessel at sea, or a change of
// service. The rail runs on through it.
const RailNote = ({
  atSea,
  children,
}: {
  atSea?: boolean;
  children: string;
}) => (
  <li className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 @xl:grid-cols-[2rem_minmax(0,1fr)] @xl:gap-x-4">
    <span aria-hidden="true" className="relative flex justify-center">
      <span className="absolute -top-3 -bottom-3 border-l-2 border-dashed border-slate-300 @xl:-top-4 @xl:-bottom-4" />
      {atSea && (
        <span className="bg-brand ring-brand/20 relative flex h-7 w-7 items-center justify-center rounded-full text-white ring-4 @xl:h-8 @xl:w-8">
          <Ship className="h-4 w-4" />
        </span>
      )}
    </span>
    <p
      className={
        atSea
          ? "text-brand self-center text-sm font-semibold"
          : "self-center text-xs font-semibold text-slate-500"
      }
    >
      {children}
    </p>
  </li>
);

// The Vessel schedule tab: every port one vessel calls at, in order, with
// where it is now and the deadlines at the ports still ahead.
const VesselSchedule = () => {
  const { params, update } = useUrlState();
  const [now] = useState(() => moment());
  const today = now.format(ISO);

  const {
    vessels,
    isPending: vesselsPending,
    error: vesselsError,
    refetch: refetchVessels,
  } = useGetActiveVessels();
  const options = useMemo(
    () =>
      vessels
        .map((v) => ({
          value: v.imo,
          label: v.name.toUpperCase(),
          hint: v.imo,
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [vessels],
  );

  const imo = params.get("imo") ?? "";
  const from = params.get("from") || today;

  const { schedule, isPending, error, refetch, isFetching } =
    useGetVesselSchedule(imo, from);

  const name = (
    schedule?.vessel.name ??
    vessels.find((v) => v.imo === imo)?.name ??
    `IMO ${imo}`
  ).toUpperCase();
  const calls = schedule?.calls ?? [];
  // Where it is now only makes sense when the list starts today or earlier
  const position = from <= today ? vesselPosition(calls, now) : null;

  const fromDate = moment(from, ISO);
  const range = `${fromDate.format("D MMM")} to ${fromDate
    .clone()
    .add(VESSEL_SCHEDULE_WEEKS, "weeks")
    .subtract(1, "day")
    .format("D MMM YYYY")}`;

  return (
    <>
      {/* The search */}
      <motion.div
        {...stagger(2)}
        className="@container mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm @xl:p-5"
      >
        <div className="grid gap-4 @xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <SearchSelect
            label="Vessel"
            icon={Ship}
            noun="vessels"
            searchPlaceholder="Search by name or IMO number"
            placeholder={
              vesselsPending ? "Loading vessels…" : "Choose a vessel"
            }
            disabled={vesselsPending || !!vesselsError}
            options={options}
            value={vessels.length ? imo : undefined}
            onChange={(value) => update({ imo: value })}
            maxResults={50}
          />
          <DateInput
            label="Date from"
            value={from}
            onChange={(value) => update({ from: value || today })}
            min={now.clone().subtract(MIN_DAYS, "days").format(ISO)}
            max={now.clone().add(MAX_DAYS, "days").format(ISO)}
          />
        </div>
        {vesselsError && (
          <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-red-600">
            {vesselsError.message ?? "Couldn't load the list of vessels."}
            <button
              type="button"
              onClick={() => refetchVessels()}
              className="text-brand font-semibold hover:underline"
            >
              Try again
            </button>
          </p>
        )}
      </motion.div>

      {!imo ? (
        <motion.section
          {...stagger(3)}
          aria-label="Choose a vessel"
          className="rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <EmptyState
            icon={<Ship className="text-brand h-10 w-10" />}
            title="Choose a vessel"
            description="Search by vessel name or IMO number to see every port it calls at, where it is now and the cargo deadlines at each port."
          />
        </motion.section>
      ) : (
        <motion.section
          {...stagger(3)}
          aria-labelledby="vessel-title"
          className="@container overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col gap-2 @2xl:flex-row @2xl:items-start @2xl:justify-between">
              <div className="min-w-0">
                <h2
                  id="vessel-title"
                  className="text-harbour flex flex-wrap items-center gap-2.5 text-lg font-bold wrap-break-word"
                >
                  <Ship aria-hidden="true" className="text-brand h-5 w-5" />
                  {name}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {range}, times local to each port
                </p>
              </div>
              {schedule && (
                <p className="text-sm text-slate-500">
                  Updated {moment(schedule.fetchedAt).fromNow()}
                </p>
              )}
            </div>
            {schedule && <VesselFacts schedule={schedule} />}
            {position && (
              <div className="mt-4">
                <PositionLine position={position} />
              </div>
            )}
          </div>

          {isPending ? (
            <ListSkeleton label="Loading the vessel's schedule" />
          ) : error ? (
            <ErrorState
              resource="vessel schedule"
              error={error}
              onRetry={() => refetch()}
              isRetrying={isFetching}
            />
          ) : !calls.length ? (
            <EmptyState
              icon={<Ship className="text-brand h-10 w-10" />}
              title={`${name} has no port calls listed from ${range}`}
              description="Maersk has nothing scheduled for this vessel in these dates. Try a later date."
            />
          ) : (
            <ol
              aria-label={`Ports ${name} calls at`}
              className="space-y-3 bg-slate-50/70 p-3 @xl:space-y-4 @xl:p-4"
            >
              {calls.map((call, i) => {
                const left = hasLeft(call, now);
                const here =
                  position?.state === "in-port" && position.call.id === call.id;
                const atSea =
                  position?.state === "sailing" && position.to.id === call.id;
                const newService =
                  i > 0 && call.service.code !== calls[i - 1].service.code;
                return (
                  <Fragment key={call.id}>
                    {newService && (
                      <RailNote>{`Continues on service ${call.service.name}`}</RailNote>
                    )}
                    {atSea && (
                      <RailNote
                        atSea
                      >{`At sea, sailing to ${call.port.name}`}</RailNote>
                    )}
                    <VesselCallRow
                      call={call}
                      now={now}
                      left={left}
                      here={here}
                      last={i === calls.length - 1}
                    />
                  </Fragment>
                );
              })}
            </ol>
          )}
        </motion.section>
      )}
    </>
  );
};

export default VesselSchedule;
