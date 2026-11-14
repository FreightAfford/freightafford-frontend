import type { Rate } from "../../../services/api/rate";
import cn from "../../../utils/cn";
import { daysLeft, rateStatus } from "../../../utils/rates";

// How long the customer has to use this rate, louder as the end nears.
const RateValidity = ({ rate }: { rate: Rate }) => {
  const expiring = rateStatus(rate) === "expiring";
  const left = daysLeft(rate.validTo);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        expiring ? "bg-ochre/15 text-[#9a6a0c]" : "bg-kelp/10 text-kelp",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          expiring ? "bg-ochre" : "bg-kelp",
        )}
      />
      {expiring
        ? left <= 1
          ? "Ends today"
          : `Ends in ${left} days`
        : "Valid today"}
    </span>
  );
};

export default RateValidity;
