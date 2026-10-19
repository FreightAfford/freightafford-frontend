import type { ScheduleTime } from "../../../services/api/schedule";
import cn from "../../../utils/cn";
import {
  bestTime,
  portDate,
  portHour,
  shiftDays,
} from "../../../utils/schedule";

// An arrival or departure in port time, with how far it has moved from plan
const CallTime = ({ time, label }: { time: ScheduleTime; label: string }) => {
  const at = bestTime(time);
  const shift = shiftDays(time);
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      {at ? (
        <>
          <time dateTime={at} className="block tabular-nums">
            <span className="block font-semibold whitespace-nowrap text-slate-900">
              {portDate(at)}
            </span>
            <span className="block text-sm text-slate-500">{portHour(at)}</span>
          </time>
          {shift !== 0 && (
            <p
              className={cn(
                "mt-1 text-xs font-semibold",
                shift > 0 ? "text-[#9a6a0c]" : "text-kelp",
              )}
              title={
                time.planned
                  ? `Planned for ${portDate(time.planned)}, ${portHour(time.planned)}`
                  : undefined
              }
            >
              {shift > 0
                ? `Delayed ${shift} ${shift === 1 ? "day" : "days"}`
                : `${-shift} ${shift === -1 ? "day" : "days"} early`}
            </p>
          )}
        </>
      ) : (
        <p className="text-slate-400">N/A</p>
      )}
    </div>
  );
};

export default CallTime;
