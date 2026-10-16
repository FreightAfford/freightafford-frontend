import { ArrowRight, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import { Link } from "react-router";
import cn from "../../utils/cn";
import { stagger } from "../../utils/motion";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: { value: string; isPositive: boolean };
  className?: string;
  // Position in its grid, so cards arrive one after another.
  index?: number;
  // Makes the whole card a link to the page behind the number.
  to?: string;
}

const MotionLink = motion.create(Link);

const StatsCard = ({
  title,
  value,
  icon: Icon,
  description,
  trend,
  className,
  index,
  to,
}: StatsCardProps) => {
  const body = (
    <>
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
        <h3 className="flex items-center gap-1 text-sm font-medium text-slate-500">
          {title}
          {to && (
            <ArrowRight
              aria-hidden="true"
              className="group-hover:text-brand h-3.5 w-3.5 text-slate-300 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          )}
        </h3>
        <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        )}
      </div>
    </>
  );
  const classes = cn(
    "rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition-shadow hover:shadow-md",
    to &&
      "group focus-visible:ring-brand block outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    className,
  );

  return to ? (
    <MotionLink
      to={to}
      {...stagger(index)}
      whileHover={{ y: -1 }}
      className={classes}
    >
      {body}
    </MotionLink>
  ) : (
    <motion.div {...stagger(index)} whileHover={{ y: -1 }} className={classes}>
      {body}
    </motion.div>
  );
};
export default StatsCard;
