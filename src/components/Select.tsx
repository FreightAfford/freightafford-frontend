import type { LucideIcon } from "lucide-react";
import { forwardRef, useId, type ReactNode } from "react";
import cn from "../utils/cn";
import { FieldIcon, FieldLabel, FieldMessage } from "./field";
import { describedBy, fieldBox } from "./fieldStyles";
import {
  Select as SelectRoot,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

export type SelectOption = { value: string; label: string };

interface SelectProps {
  label?: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  placeholder?: string;
  options: readonly SelectOption[] | readonly string[];
  value?: string;
  // Called with the chosen value, so it plugs straight into a Controller.
  onChange?: (value: string) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  icon?: LucideIcon;
}

// A labelled field on the shadcn Select: a styled listbox that keeps full
// keyboard support (arrows, type-to-find, Enter, Escape).
const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      className,
      label,
      error,
      hint,
      optional,
      id,
      placeholder = "Choose an option",
      options,
      value,
      onChange,
      onBlur,
      name,
      disabled,
      icon,
    },
    ref,
  ) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const items = options.map((option) =>
      typeof option === "string" ? { value: option, label: option } : option,
    );

    return (
      // relative: Radix adds a hidden native select for forms; keep it
      // positioned inside the field so it never stretches the page.
      <div className="relative w-full space-y-1.5">
        {label && (
          <FieldLabel htmlFor={selectId} optional={optional}>
            {label}
          </FieldLabel>
        )}
        <SelectRoot
          value={value ?? ""}
          onValueChange={(next) => onChange?.(next)}
          onOpenChange={(open) => !open && onBlur?.()}
          name={name}
          disabled={disabled}
        >
          <SelectTrigger
            id={selectId}
            ref={ref}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(selectId, hint, error)}
            className={cn(
              fieldBox(!!error, disabled),
              "h-13 pr-3.5 text-slate-900",
              !icon && "pl-1",
              className,
            )}
          >
            <span className="flex min-w-0 items-center">
              {icon && <FieldIcon icon={icon} error={!!error} />}
              <span className={cn("truncate px-3", !value && "text-slate-400")}>
                <SelectValue placeholder={placeholder} />
              </span>
            </span>
          </SelectTrigger>
          <SelectContent>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectRoot>
        <FieldMessage id={selectId} hint={hint} error={error} />
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
