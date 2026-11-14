import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import cn from "../../../../utils/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../ui/select";

// Smaller controls for the rows of the charges and free time editors, where
// the full-size fields would make one charge taller than the screen.

const CONTROL =
  "h-10 w-full min-w-0 rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-slate-400 hover:border-slate-300 focus:border-brand focus:shadow-[0_0_0_3px_rgb(30_144_255/0.15)] disabled:cursor-not-allowed disabled:opacity-60";

const controlBorder = (invalid?: boolean) =>
  invalid ? "border-red-400 bg-red-50/50" : "border-slate-200";

// The label shows above the control in a narrow layout; where the editor has
// column headings it's kept for screen readers only.
export const RowField = ({
  label,
  children,
  wideLabel = false,
  className,
}: {
  label: string;
  children: ReactNode;
  // Keep the label visible in the wide layout too (no column heading there).
  wideLabel?: boolean;
  className?: string;
}) => (
  <label className={cn("relative block min-w-0 space-y-1", className)}>
    <span
      className={cn(
        "block text-xs font-semibold text-slate-500",
        !wideLabel && "@3xl:sr-only",
      )}
    >
      {label}
    </span>
    {children}
  </label>
);

export const RowInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(({ invalid, className, type, ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    aria-invalid={invalid || undefined}
    className={cn(
      CONTROL,
      controlBorder(invalid),
      type === "number" &&
        "[appearance:textfield] text-right tabular-nums [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
      className,
    )}
    {...props}
  />
));
RowInput.displayName = "RowInput";

export const RowSelect = ({
  value,
  onChange,
  options,
  invalid,
  disabled,
  label,
}: {
  value?: string;
  onChange: (value: string) => void;
  options: readonly { value: string; label: string }[] | readonly string[];
  invalid?: boolean;
  disabled?: boolean;
  // Names the trigger, since Radix's button isn't tied to a <label>.
  label: string;
}) => {
  const items = options.map((o) =>
    typeof o === "string" ? { value: o, label: o } : o,
  );
  return (
    <Select value={value ?? ""} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger
        aria-label={label}
        aria-invalid={invalid || undefined}
        className={cn(
          CONTROL,
          controlBorder(invalid),
          "data-[state=open]:border-brand flex items-center justify-between gap-1 pr-2 text-left data-[state=open]:shadow-[0_0_0_3px_rgb(30_144_255/0.15)] [&>svg]:h-4 [&>svg]:w-4",
        )}
      >
        <span className="truncate">
          <SelectValue placeholder="Choose" />
        </span>
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value} className="text-sm">
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// A form section with its title and a line on what goes in it.
export const FormSection = ({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section className="space-y-4">
    <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
      <div className="min-w-0">
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {action}
    </div>
    {children}
  </section>
);

// The first problem in a row, under it.
export const RowError = ({ message }: { message?: string }) =>
  message ? (
    <p role="alert" className="text-sm font-medium text-red-600">
      {message}
    </p>
  ) : null;
