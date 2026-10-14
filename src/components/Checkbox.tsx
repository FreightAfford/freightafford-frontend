import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import cn from "../utils/cn";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    return (
      <div className="space-y-1.5">
        <div className="flex items-start space-x-2">
          <input
            id={inputId}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              "text-brand focus:ring-brand mt-px h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 disabled:cursor-not-allowed",
              className,
            )}
            ref={ref}
            {...props}
          />
          {label && (
            <label
              htmlFor={inputId}
              className="cursor-pointer text-sm leading-tight font-medium text-slate-700"
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p id={errorId} className="font-medium text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
