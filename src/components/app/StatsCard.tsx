import { type LucideIcon } from "lucide-react";
import cn from "../../utils/cn";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: string; isPositive: boolean };
  className?: string;
}

const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
}: StatsCardProps) => {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-100 bg-white p-4 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="bg-brand/10 rounded-xl p-2">
          <Icon className="text-brand h-6 w-6" />
        </div>
        {trend && (
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-medium",
              trend.isPositive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700",
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-sm font-medium text-slate-500">{title}</h3>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        )}
      </div>
    </div>
  );
};
export default StatsCard;
