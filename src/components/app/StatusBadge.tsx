import cn from "../../utils/cn";

export type StatusType =
  | "pending"
  | "active"
  | "completed"
  | "cancelled"
  | "rejected"
  | "approved"
  | "countered";

interface StatusBadgeProps {
  status: StatusType | string;
  className?: string;
}

// Badge background/text, plus the colour of the leading dot.
const getStatusStyles = (s: string) => {
  switch (s?.toLowerCase()) {
    case "active":
    case "accepted":
    case "paid":
      return "bg-green-50 text-green-700 ring-green-600/20 before:bg-green-500";
    case "pending":
      return "bg-amber-50 text-amber-700 ring-amber-600/20 before:bg-amber-500";
    case "confirmed":
    case "verified":
    case "resolved":
      return "bg-teal-50 text-teal-700 ring-teal-600/20 before:bg-teal-500";
    case "delivered":
    case "in_transit":
    case "open":
      return "bg-blue-50 text-blue-700 ring-blue-600/20 before:bg-blue-500";
    case "arrived":
      return "bg-indigo-50 text-indigo-700 ring-indigo-600/20 before:bg-indigo-500";
    case "cancelled":
    case "closed":
    case "rejected":
      return "bg-rose-50 text-rose-700 ring-rose-600/20 before:bg-rose-500";
    case "countered":
      return "bg-purple-50 text-purple-700 ring-purple-600/20 before:bg-purple-500";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-500/20 before:bg-slate-400";
  }
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap capitalize ring-1 ring-inset before:h-1.5 before:w-1.5 before:shrink-0 before:rounded-full before:content-['']",
        getStatusStyles(status),
        className,
      )}
    >
      {status?.replace(/_/g, " ")}
    </span>
  );
};
export default StatusBadge;
