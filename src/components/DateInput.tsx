import { CalendarDays, X, type LucideIcon } from "lucide-react";
import moment from "moment";
import { forwardRef, useId, useState, type ReactNode } from "react";
import cn from "../utils/cn";
import { FieldIcon, FieldLabel, FieldMessage } from "./field";
import { describedBy, fieldBox } from "./fieldStyles";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface DateInputProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  placeholder?: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  disabled?: boolean;
  min?: string;
  max?: string;
  icon?: LucideIcon;
}

const ISO = "YYYY-MM-DD";
// Local midnight for a YYYY-MM-DD string, so the calendar never shifts a day.
const toDate = (value?: string) =>
  value && moment(value, ISO, true).isValid()
    ? moment(value, ISO).toDate()
    : undefined;

// A date field on the shadcn Calendar. It reads "Choose a date" when empty
// and "30 Jun 2027" when set. Values in and out are YYYY-MM-DD.
const DateInput = forwardRef<HTMLButtonElement, DateInputProps>(
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
      optional,
      disabled,
      min,
      max,
      icon = CalendarDays,
    },
    ref,
  ) => {
    const id = useId();
    const [open, setOpen] = useState(false);
    const selected = toDate(value);
    const minDate = toDate(min);
    const maxDate = toDate(max);
    const shown = selected ? moment(selected).format("D MMM YYYY") : "";

    // Month and year menus cover a sensible range around the allowed dates.
    const thisYear = new Date().getFullYear();
    const startMonth = minDate ?? new Date(thisYear - 80, 0);
    const endMonth = maxDate ?? new Date(thisYear + 15, 11);

    const choose = (date?: Date) => {
      onChange(date ? moment(date).format(ISO) : "");
      setOpen(false);
    };

    return (
      <div className="w-full space-y-1.5">
        <FieldLabel htmlFor={id} optional={optional}>
          {label}
        </FieldLabel>
        <Popover
          open={open}
          onOpenChange={(next) => {
            setOpen(next);
            if (!next) onBlur?.();
          }}
        >
          <div className="relative">
            <PopoverTrigger asChild>
              <button
                id={id}
                ref={ref}
                type="button"
                name={name}
                disabled={disabled}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(id, hint, error)}
                className={cn(
                  fieldBox(!!error, disabled),
                  "h-13 text-left outline-none disabled:cursor-not-allowed",
                )}
              >
                <FieldIcon icon={icon} error={!!error} />
                <span
                  className={cn(
                    "truncate pr-10 pl-3",
                    shown ? "text-slate-900" : "text-slate-400",
                  )}
                >
                  {shown || placeholder}
                </span>
              </button>
            </PopoverTrigger>
            {shown && !disabled && (
              <button
                type="button"
                onClick={() => choose(undefined)}
                aria-label={`Clear ${label.toLowerCase()}`}
                className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <PopoverContent className="w-auto p-3">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={choose}
              defaultMonth={selected ?? minDate ?? maxDate}
              captionLayout="dropdown"
              startMonth={startMonth}
              endMonth={endMonth}
              disabled={[
                ...(minDate ? [{ before: minDate }] : []),
                ...(maxDate ? [{ after: maxDate }] : []),
              ]}
              autoFocus
            />
          </PopoverContent>
        </Popover>
        <FieldMessage id={id} hint={hint} error={error} />
      </div>
    );
  },
);

DateInput.displayName = "DateInput";

export default DateInput;
