import moment from "moment";
import type { Rate } from "../../../services/api/rate";
import cn from "../../../utils/cn";
import { daysLeft, rateStatus } from "../../../utils/rates";

// When the customer can use this rate: from a later day, today, or only a
// few more days (louder as the end nears).
const RateValidity = ({ rate }: { rate: Rate }) => {
  const status = rateStatus(rate);
  const left = daysLeft(rate.validTo);
  const tone =
    status === "scheduled"
      ? { badge: "bg-brand/10 text-brand", dot: "bg-brand" }
      : status === "expiring"
        ? { badge: "bg-ochre/15 text-[#9a6a0c]", dot: "bg-ochre" }
        : { badge: "bg-kelp/10 text-kelp", dot: "bg-kelp" };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        tone.badge,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("h-1.5 w-1.5 rounded-full", tone.dot)}
      />
      {status === "scheduled"
        ? `Starts ${moment(rate.validFrom, "YYYY-MM-DD").format("D MMM")}`
        : status === "expiring"
          ? left <= 1
            ? "Ends today"
            : `Ends in ${left} days`
          : "Valid today"}
    </span>
  );
};

export default RateValidity;
