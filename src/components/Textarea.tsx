import type { LucideIcon } from "lucide-react";
import {
  forwardRef,
  useId,
  type ReactNode,
  type TextareaHTMLAttributes,
} from "react";
import cn from "../utils/cn";
import { FieldIcon, FieldLabel, FieldMessage } from "./field";
import { describedBy, fieldBox } from "./fieldStyles";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
  icon?: LucideIcon;
}

// A multi-line field in the icon-led style; the icon sits on the first line.
const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, error, hint, optional, id, icon, rows = 3, ...props },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <FieldLabel htmlFor={textareaId} optional={optional}>
            {label}
          </FieldLabel>
        )}
        <div
          className={cn(fieldBox(!!error, props.disabled), "items-start py-3")}
        >
          {icon && (
            <FieldIcon icon={icon} error={!!error} className="mt-[3px]" />
          )}
          <textarea
            id={textareaId}
            ref={ref}
            rows={rows}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy(textareaId, hint, error)}
            className={cn(
              "min-h-[3rem] w-full flex-1 resize-y bg-transparent leading-relaxed text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed",
              icon ? "pr-4 pl-3" : "px-4",
              className,
            )}
            {...props}
          />
        </div>
        <FieldMessage id={textareaId} hint={hint} error={error} />
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
