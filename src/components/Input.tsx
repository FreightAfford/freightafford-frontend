import type { LucideIcon } from "lucide-react";
import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import cn from "../utils/cn";
import { FieldIcon, FieldLabel, FieldMessage } from "./field";
import { describedBy, FIELD_CONTROL, fieldBox } from "./fieldStyles";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  // Fixed content inside the field, before or after the text (e.g. +234, a toggle).
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  icon?: LucideIcon;
}

// The icon-led text field used across the app.
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      hint,
      optional,
      type,
      id,
      startAdornment,
      endAdornment,
      icon,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <FieldLabel htmlFor={inputId} optional={optional}>
            {label}
          </FieldLabel>
        )}
        <div className={cn(fieldBox(!!error, props.disabled), "h-13")}>
          {icon && <FieldIcon icon={icon} error={!!error} />}
          {startAdornment && (
            <span
              className={cn(
                "shrink-0 font-medium text-slate-500",
                icon ? "pl-2.5" : "pl-4",
              )}
            >
              {startAdornment}
            </span>
          )}
          <input
            id={inputId}
            type={type}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(inputId, hint, error)}
            className={cn(
              FIELD_CONTROL,
              !icon && !startAdornment && "px-4",
              type === "number" &&
                "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
              className,
            )}
            ref={ref}
            {...props}
          />
          {endAdornment && (
            <span className="mr-1.5 shrink-0">{endAdornment}</span>
          )}
        </div>
        <FieldMessage id={inputId} hint={hint} error={error} />
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
