import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import cn from "../utils/cn";

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="space-y-1.5">
        <div className="flex items-start space-x-2">
          <input
            type="checkbox"
            className={cn(
              "text-brand focus:ring-brand h-4 w-4 cursor-pointer rounded border-slate-300",
              className,
            )}
            ref={ref}
            {...props}
          />
          {label && (
            <label className="text-sm leading-tight font-medium text-slate-700">
              {label}
            </label>
          )}
        </div>
        {error && <p className="font-medium text-red-500">{error}</p>}
      </div>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
