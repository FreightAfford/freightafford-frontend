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

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const getStatusStyles = (s: string) => {
    switch (s.toLowerCase()) {
      case "active":
      case "approved":
        return "bg-green-100 text-green-700 border-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-700";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-700";
      case "cancelled":
        return "bg-rose-100 text-rose-700 border-rose-700";
      case "rejected":
        return "bg-red-100 text-rose-700 border-rose-700";
      case "countered":
        return "bg-purple-100 text-purple-700 border-purple-700";
      case "default":
        return "bg-slate-100 text-slate-700 border-slate-700";
    }
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-sm font-medium",
        getStatusStyles(status),
        className,
      )}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};
export default StatusBadge;
