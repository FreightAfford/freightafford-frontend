import { Clock } from "lucide-react";
import type { FreeTime, FreeTimeTier } from "../../../services/api/rate";
import { formatAmount } from "../../../utils/rates";

// "Days 15–17" / "Day 18 onwards"
const tierDays = (t: FreeTimeTier) =>
  t.toDay
    ? t.fromDay === t.toDay
      ? `Day ${t.fromDay}`
      : `Days ${t.fromDay}–${t.toDay}`
    : `Day ${t.fromDay} onwards`;

const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

// Detention and demurrage free time at the destination: how long the
// container is free, and what each day costs after that.
const RateFreeTime = ({
  freeTime,
  place,
}: {
  freeTime: FreeTime[];
  place: string;
}) => (
  <section
    aria-labelledby="free-time-title"
    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm @2xl:p-5"
  >
    <h3
      id="free-time-title"
      className="flex items-center gap-2 text-base font-bold text-slate-900"
    >
      <Clock aria-hidden="true" className="text-brand h-4 w-4" />
      Free time at {place}
    </h3>
    <ul className="mt-3 divide-y divide-slate-100">
      {freeTime.map((f) => (
        <li
          key={`${f.type}-${f.startEvent}`}
          className="grid gap-x-6 gap-y-2 py-3 first:pt-0 last:pb-0 @2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        >
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">
              {f.days} {lower(f.dayType)}{" "}
              <span className="font-normal text-slate-500">({f.type})</span>
            </p>
            <p className="mt-0.5 text-sm text-slate-600">
              From {lower(f.startEvent)} until {lower(f.endEvent)}.
            </p>
            {f.note && (
              <p className="mt-0.5 text-xs text-slate-500">{f.note}</p>
            )}
          </div>
          <dl className="text-sm">
            {f.tiers.map((t) => (
              <div
                key={t.fromDay}
                className="flex justify-between gap-3 py-0.5 @2xl:justify-start"
              >
                <dt className="text-slate-600 @2xl:w-36">{tierDays(t)}</dt>
                <dd className="font-medium whitespace-nowrap text-slate-900 tabular-nums">
                  {formatAmount(t.amount, t.currency)} per day
                </dd>
              </div>
            ))}
          </dl>
        </li>
      ))}
    </ul>
  </section>
);

export default RateFreeTime;
