import type { LucideIcon } from "lucide-react";
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import cn from "../utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  // Fixed content inside the field, before or after the text (e.g. +234, a toggle).
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  // "icon": a taller field led by an icon (auth and KYC forms).
  variant?: "default" | "icon";
  icon?: LucideIcon;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      type,
      id,
      startAdornment,
      endAdornment,
      variant = "default",
      icon: Icon,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const hintId = `${inputId}-hint`;
    const describedBy = cn(error && errorId, hint && hintId) || undefined;

    if (variant === "icon")
      return (
        <div className="w-full space-y-1.5">
          {label && (
            <label
              htmlFor={inputId}
              className="font-display block text-sm font-semibold text-slate-800"
            >
              {label}
            </label>
          )}
          <div
            className={cn(
              "group flex h-13 items-center rounded-xl border bg-white transition-[border-color,box-shadow] duration-150",
              error
                ? "border-red-400 bg-red-50/50 focus-within:shadow-[0_0_0_3px_rgb(239_68_68/0.15)]"
                : "focus-within:border-brand border-slate-200 focus-within:shadow-[0_0_0_3px_rgb(30_144_255/0.15)] hover:border-slate-300",
              props.disabled && "cursor-not-allowed opacity-60",
            )}
          >
            {Icon && (
              <Icon
                aria-hidden="true"
                className={cn(
                  "ml-4 h-[18px] w-[18px] shrink-0 transition-colors",
                  error
                    ? "text-red-400"
                    : "group-focus-within:text-brand text-slate-400",
                )}
              />
            )}
            {startAdornment && (
              <span
                className={cn(
                  "shrink-0 font-medium text-slate-500",
                  Icon ? "pl-2.5" : "pl-4",
                )}
              >
                {startAdornment}
              </span>
            )}
            <input
              id={inputId}
              type={type}
              aria-invalid={error ? true : undefined}
              aria-describedby={describedBy}
              className={cn(
                "h-full min-w-0 flex-1 bg-transparent px-3 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed",
                !Icon && !startAdornment && "px-4",
                className,
              )}
              ref={ref}
              {...props}
            />
            {endAdornment && (
              <span className="mr-1.5 shrink-0">{endAdornment}</span>
            )}
          </div>
          {hint && !error && (
            <p id={hintId} className="text-sm text-slate-500">
              {hint}
            </p>
          )}
          {error && (
            <p id={errorId} className="text-sm font-medium text-red-600">
              {error}
            </p>
          )}
        </div>
      );

    const input = (
      <input
        id={inputId}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={cn(
          "focus-visible:ring-brand flex h-12 w-full rounded-md border border-slate-200 bg-white px-3 py-2 ring-offset-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus-visible:ring-red-500",
          startAdornment && "pl-16",
          endAdornment && "pr-12",
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="leading-none font-medium tracking-wide text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {label}
          </label>
        )}
        {startAdornment || endAdornment ? (
          <div className="relative">
            {startAdornment && (
              <div className="pointer-events-none absolute inset-y-0 left-0 flex w-14 items-center justify-center border-r border-slate-200 text-slate-600">
                {startAdornment}
              </div>
            )}
            {input}
            {endAdornment && (
              <div className="absolute inset-y-0 right-0 flex items-center pr-1.5">
                {endAdornment}
              </div>
            )}
          </div>
        ) : (
          input
        )}
        {hint && !error && (
          <p id={hintId} className="text-sm text-slate-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} className="font-medium text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
