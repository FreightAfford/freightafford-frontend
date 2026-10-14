import { ChevronDown, type LucideIcon } from "lucide-react";
import { forwardRef, useId, type SelectHTMLAttributes } from "react";
import cn from "../utils/cn";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  options: readonly { value: string; label: string }[] | readonly string[];
  // "icon": matches Input's icon variant (auth and KYC forms).
  variant?: "default" | "icon";
  icon?: LucideIcon;
}

// A native select styled like Input, so it works with every keyboard and
// screen reader and opens the phone's own picker on mobile.
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      id,
      placeholder,
      options,
      variant = "default",
      icon: Icon,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    const hintId = `${selectId}-hint`;
    const describedBy = cn(error && errorId, hint && hintId) || undefined;
    const isIcon = variant === "icon";

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className={
              isIcon
                ? "font-display block text-sm font-semibold text-slate-800"
                : "leading-none font-medium tracking-wide text-slate-700"
            }
          >
            {label}
          </label>
        )}
        <div className="group relative">
          {isIcon && Icon && (
            <Icon
              aria-hidden="true"
              className={cn(
                "pointer-events-none absolute top-1/2 left-4 h-[18px] w-[18px] -translate-y-1/2 transition-colors",
                error
                  ? "text-red-400"
                  : "group-focus-within:text-brand text-slate-400",
              )}
            />
          )}
          <select
            id={selectId}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              isIcon
                ? cn(
                    "h-13 w-full cursor-pointer appearance-none rounded-xl border bg-white pr-10 text-slate-900 transition-[border-color,box-shadow] duration-150 outline-none disabled:cursor-not-allowed disabled:opacity-60",
                    Icon ? "pl-[2.875rem]" : "pl-4",
                    error
                      ? "border-red-400 bg-red-50/50 focus:shadow-[0_0_0_3px_rgb(239_68_68/0.15)]"
                      : "focus:border-brand border-slate-200 hover:border-slate-300 focus:shadow-[0_0_0_3px_rgb(30_144_255/0.15)]",
                  )
                : cn(
                    "focus-visible:ring-brand flex h-12 w-full appearance-none rounded-md border border-slate-200 bg-white py-2 pr-10 pl-3 ring-offset-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
                    error && "border-red-500 focus-visible:ring-red-500",
                  ),
              className,
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => {
              const { value, label } =
                typeof option === "string"
                  ? { value: option, label: option }
                  : option;
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-3.5 h-5 w-5 -translate-y-1/2 text-slate-400"
          />
        </div>
        {hint && !error && (
          <p id={hintId} className="text-sm text-slate-500">
            {hint}
          </p>
        )}
        {error && (
          <p
            id={errorId}
            className={
              isIcon
                ? "text-sm font-medium text-red-600"
                : "font-medium text-red-500"
            }
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
