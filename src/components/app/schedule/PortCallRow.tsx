import type { Moment } from "moment";
import type { PortCall } from "../../../services/api/schedule";
import cn from "../../../utils/cn";
import { callStatus, voyageLabel } from "../../../utils/schedule";
import CallTime from "./CallTime";
import { DeadlineTiles, StatusBadge } from "./CargoDeadlines";

interface PortCallRowProps {
  call: PortCall;
  terminal: string;
  now: Moment;
}

// One vessel call at the port: whether it still takes cargo, the vessel and
// its times, then the deadlines Maersk has published for it.
const PortCallRow = ({ call, terminal, now }: PortCallRowProps) => {
  const name = call.vessel?.name ?? "Vessel to be named";
  const { status, next } = callStatus(call, now);

  return (
    // Each call is its own card, so one ends clearly before the next
    <li className="rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-[0_1px_2px_rgb(15_23_43/0.05)] @xl:px-5">
      {/* Sized by the card's own width */}
      <article aria-label={name} className="@container">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 @xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] @xl:gap-x-6">
          <div className="col-span-2 min-w-0 @md:col-span-1">
            <p className="text-xs text-slate-500">Vessel/Voyage</p>
            <h3
              className={cn(
                "text-[1.0625rem] font-bold wrap-break-word",
                call.vessel
                  ? "text-harbour uppercase"
                  : "text-slate-500 italic",
              )}
            >
              {name}
            </h3>
            <p className="text-sm text-slate-500 tabular-nums">
              {voyageLabel(call)}
            </p>
            <div className="mt-2">
              <StatusBadge status={status} />
            </div>
          </div>
          <div className="col-span-2 min-w-0 @md:col-span-1">
            <p className="text-xs text-slate-500">Terminal</p>
            <p className="font-semibold wrap-break-word text-slate-900">
              {terminal}
            </p>
          </div>
          <CallTime time={call.arrival} label="Arrival" />
          <CallTime time={call.departure} label="Departure" />
        </div>

        <DeadlineTiles cutOffs={call.cutOffs} next={next} now={now} />
      </article>
    </li>
  );
};

export default PortCallRow;
