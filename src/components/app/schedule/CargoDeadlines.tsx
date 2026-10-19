import {
  CircleCheck,
  CircleSlash,
  Clock,
  FileText,
  Lock,
  PackageOpen,
  Scale,
  Ship,
  TriangleAlert,
  Truck,
  type LucideIcon,
} from "lucide-react";
import moment, { type Moment } from "moment";
import type { PortCall } from "../../../services/api/schedule";
import cn from "../../../utils/cn";
import {
  deadline,
  DEADLINES,
  deadlineState,
  portDate,
  portHour,
  type CallStatus,
} from "../../../utils/schedule";

// The cargo status and deadline tiles, shared by port calls and routes.

const DEADLINE_ICONS: Record<string, LucideIcon> = {
  ECP: PackageOpen,
  FCO: Truck,
  DCO: FileText,
  VCO: Scale,
  DGC: TriangleAlert,
};

const STATUS: Record<
  CallStatus,
  { label: string; icon: LucideIcon; className: string }
> = {
  accepting: {
    label: "Accepting cargo",
    icon: CircleCheck,
    className: "bg-kelp/10 text-kelp",
  },
  soon: {
    label: "Closing soon",
    icon: Clock,
    className: "bg-ochre/15 text-[#9a6a0c]",
  },
  closed: {
    label: "Closed for cargo",
    icon: Lock,
    className: "bg-slate-100 text-slate-500",
  },
  departed: {
    label: "Departed",
    icon: Ship,
    className: "bg-slate-100 text-slate-500",
  },
  unknown: {
    label: "Deadlines not published",
    icon: CircleSlash,
    className: "bg-slate-100 text-slate-600",
  },
};

export const StatusBadge = ({ status }: { status: CallStatus }) => {
  const { label, icon: Icon, className } = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        className,
      )}
    >
      <Icon aria-hidden="true" className="h-3.5 w-3.5" />
      {label}
    </span>
  );
};

const TILE = {
  open: "border-brand/25 bg-white",
  soon: "border-ochre/50 bg-ochre/10",
  closed: "border-transparent bg-slate-50",
};

const Deadline = ({
  code,
  label,
  fullLabel,
  at,
  isNext,
  now,
}: {
  code: string;
  label: string;
  fullLabel: string;
  at: string;
  isNext: boolean;
  now: Moment;
}) => {
  const state = deadlineState(at, now);
  const Icon = DEADLINE_ICONS[code] ?? FileText;
  return (
    // A full-width row on narrow cards (name left, date right); a tile
    // once there's room for several side by side.
    <div
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border px-3 py-2.5 @xl:flex-col @xl:items-stretch @xl:justify-start @xl:gap-0 @xl:p-3",
        TILE[state],
        isNext && "ring-brand/30 ring-2",
      )}
    >
      <dt
        title={fullLabel}
        className={cn(
          "flex min-w-0 items-center gap-1.5 text-xs font-semibold whitespace-nowrap",
          state === "closed" ? "text-slate-500" : "text-slate-700",
        )}
      >
        <Icon
          aria-hidden="true"
          className={cn(
            "h-3.5 w-3.5 shrink-0",
            state === "open"
              ? "text-brand"
              : state === "soon"
                ? "text-[#9a6a0c]"
                : "text-slate-400",
          )}
        />
        <span className="truncate">{label}</span>
      </dt>
      <dd className="shrink-0 text-right @xl:mt-auto @xl:pt-2 @xl:text-left">
        <time
          dateTime={at}
          className={cn(
            "block text-sm font-semibold whitespace-nowrap tabular-nums",
            state === "closed" ? "text-slate-500" : "text-slate-900",
          )}
        >
          {portDate(at)}, {portHour(at)}
        </time>
        <span
          className={cn(
            "mt-0.5 flex items-center justify-end gap-1.5 text-xs font-medium whitespace-nowrap @xl:justify-start",
            state === "open" && "text-brand",
            state === "soon" && "text-[#9a6a0c]",
            state === "closed" && "text-slate-400",
          )}
        >
          {state === "closed" ? (
            <>
              <Lock aria-hidden="true" className="h-3 w-3" />
              Closed
            </>
          ) : (
            `Closes ${moment(at).from(now)}`
          )}
          {isNext && (
            <span className="bg-brand rounded px-1.5 py-px text-[11px] font-semibold text-white">
              Next
            </span>
          )}
        </span>
      </dd>
    </div>
  );
};

// "empty container pickup or dangerous goods declaration"
const orList = (labels: string[]) => {
  const items = labels.map((l) => l.toLowerCase());
  return items.length < 2
    ? (items[0] ?? "")
    : `${items.slice(0, -1).join(", ")} or ${items[items.length - 1]}`;
};

interface DeadlineTilesProps {
  cutOffs: PortCall["cutOffs"];
  // The deadline that decides the status, marked "Next"
  next?: { label: string; at: string };
  now: Moment;
}

// The deadlines Maersk published, then one line naming the ones it didn't.
export const DeadlineTiles = ({ cutOffs, next, now }: DeadlineTilesProps) => {
  const published = DEADLINES.flatMap(({ code, label, short }) => {
    const at = deadline({ cutOffs }, code);
    return at ? [{ code, label: short ?? label, fullLabel: label, at }] : [];
  });
  const missing = DEADLINES.filter((d) => !deadline({ cutOffs }, d.code));

  return (
    <>
      <h4 className="sr-only">Deadlines</h4>
      {published.length ? (
        <>
          <dl className="mt-4 grid gap-2 @xl:grid-cols-[repeat(auto-fill,minmax(12.5rem,1fr))]">
            {published.map((d) => (
              <Deadline
                key={d.code}
                {...d}
                isNext={d.at === next?.at && d.fullLabel === next?.label}
                now={now}
              />
            ))}
          </dl>
          {missing.length > 0 && (
            <p className="mt-2 text-xs text-slate-600">
              No deadline set for {orList(missing.map((d) => d.label))}.
            </p>
          )}
        </>
      ) : (
        <p className="mt-4 rounded-xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500">
          Maersk hasn't published deadlines for this sailing yet.
        </p>
      )}
    </>
  );
};
