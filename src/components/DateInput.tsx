import { CalendarDays, type LucideIcon } from "lucide-react";
import moment from "moment";
import { forwardRef, useId, useRef, type ChangeEvent } from "react";
import cn from "../utils/cn";

interface DateInputProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  error?: string;
  hint?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  icon?: LucideIcon;
}

// A date field in the icon-led style. The browser's own picker does the
// choosing, but the field reads "Choose a date" when empty and "30 June 2027"
// when set, instead of the browser's mm/dd/yyyy. Values are YYYY-MM-DD.
const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  (
    {
      label,
      value = "",
      onChange,
      onBlur,
      name,
      placeholder = "Choose a date",
      error,
      hint,
      disabled,
      min,
      max,
      icon: Icon = CalendarDays,
    },
    ref,
  ) => {
    const id = useId();
    const inputRef = useRef<HTMLInputElement | null>(null);
    const shown = value ? moment(value).format("D MMMM YYYY") : "";

    const openPicker = () => {
      try {
        inputRef.current?.showPicker();
      } catch {
        // Older browsers: the focused field still accepts typed dates.
      }
    };

    return (
      <div className="w-full space-y-1.5">
        <label
          htmlFor={id}
          className="font-display block text-sm font-semibold text-slate-800"
        >
          {label}
        </label>
        <div
          className={cn(
            "group relative flex h-13 items-center rounded-xl border bg-white transition-[border-color,box-shadow] duration-150",
            error
              ? "border-red-400 bg-red-50/50 focus-within:shadow-[0_0_0_3px_rgb(239_68_68/0.15)]"
              : "focus-within:border-brand border-slate-200 focus-within:shadow-[0_0_0_3px_rgb(30_144_255/0.15)] hover:border-slate-300",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <Icon
            aria-hidden="true"
            className={cn(
              "ml-4 h-[18px] w-[18px] shrink-0 transition-colors",
              error
                ? "text-red-400"
                : "group-focus-within:text-brand text-slate-400",
            )}
          />
          <span
            aria-hidden="true"
            className={cn(
              "truncate px-3",
              shown ? "text-slate-900" : "text-slate-400",
            )}
          >
            {shown || placeholder}
          </span>
          {/* The real input covers the field but is invisible. */}
          <input
            id={id}
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === "function") ref(node);
              else if (ref) ref.current = node;
            }}
            type="date"
            name={name}
            value={value}
            min={min}
            max={max}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              error ? `${id}-error` : hint ? `${id}-hint` : undefined
            }
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onChange(event.target.value)
            }
            onBlur={onBlur}
            onClick={openPicker}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer"
          />
        </div>
        {hint && !error && (
          <p id={`${id}-hint`} className="text-sm text-slate-500">
            {hint}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} className="text-sm font-medium text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  },
);

DateInput.displayName = "DateInput";

export default DateInput;
