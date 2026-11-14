import type { Rate } from "../../../../services/api/rate";
import cn from "../../../../utils/cn";
import {
  RATE_STATUS_LABELS,
  rateStatus,
  type RateStatus,
} from "../../../../utils/rates";

const STYLES: Record<RateStatus, string> = {
  scheduled: "bg-blue-50 text-blue-700 ring-blue-600/20 before:bg-blue-500",
  active: "bg-green-50 text-green-700 ring-green-600/20 before:bg-green-500",
  expiring: "bg-amber-50 text-amber-700 ring-amber-600/20 before:bg-amber-500",
  expired: "bg-slate-100 text-slate-600 ring-slate-500/20 before:bg-slate-400",
};

// Worked out from the rate's dates, never stored.
const RateStatusBadge = ({
  rate,
}: {
  rate: Pick<Rate, "validFrom" | "validTo">;
}) => {
  const status = rateStatus(rate);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-inset before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:content-['']",
        STYLES[status],
      )}
    >
      {RATE_STATUS_LABELS[status]}
    </span>
  );
};

export default RateStatusBadge;
