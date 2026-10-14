import { ArrowLeft, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import cn from "../../../utils/cn";

// Building blocks shared by the request and booking detail pages. The pages
// set `@container` on their root, so these size to the page, not the window.

export const BackLink = ({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
  >
    <ArrowLeft
      aria-hidden="true"
      className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
    />
    {label}
  </button>
);

export const PageHeader = ({
  kicker,
  title,
  badge,
  meta,
  actions,
}: {
  kicker: string;
  title: string;
  badge?: ReactNode;
  meta?: ReactNode;
  actions?: ReactNode;
}) => (
  <header className="mb-6 flex flex-col gap-4 @3xl:flex-row @3xl:items-end @3xl:justify-between">
    <div className="min-w-0">
      <p className="text-sm font-medium text-slate-500">{kicker}</p>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
        <h1 className="text-2xl font-bold break-all text-slate-900 @xl:text-[1.75rem]">
          {title}
        </h1>
        {badge}
      </div>
      {meta && (
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500">
          {meta}
        </div>
      )}
    </div>
    {actions && (
      <div className="flex flex-wrap gap-2 *:@max-md:flex-1 @3xl:shrink-0 @3xl:justify-end">
        {actions}
      </div>
    )}
  </header>
);

export const MetaItem = ({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) => (
  <span className="inline-flex items-center gap-1.5">
    <Icon aria-hidden="true" className="h-4 w-4 text-slate-400" />
    {children}
  </span>
);

export const Panel = ({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section
    className={cn(
      "min-w-0 rounded-2xl border border-slate-200 bg-white p-5 @xl:p-6",
      className,
    )}
  >
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <h2 className="flex items-center gap-2.5 text-base font-bold text-slate-900">
        {Icon && (
          <Icon aria-hidden="true" className="text-brand h-5 w-5 shrink-0" />
        )}
        {title}
      </h2>
      {action}
    </div>
    {children}
  </section>
);

// A label and value on one line, for money and short lists.
export const Row = ({
  label,
  value,
  strong,
}: {
  label: string;
  value: ReactNode;
  strong?: boolean;
}) => (
  <div className="flex items-baseline justify-between gap-4">
    <span
      className={cn(
        "text-sm",
        strong ? "font-semibold text-slate-900" : "text-slate-500",
      )}
    >
      {label}
    </span>
    <span
      className={cn(
        "text-right tabular-nums",
        strong
          ? "text-lg font-bold text-slate-900"
          : "font-medium text-slate-900",
      )}
    >
      {value}
    </span>
  </div>
);
