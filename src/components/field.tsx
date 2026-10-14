import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import cn from "../utils/cn";
import { FIELD_LABEL } from "./fieldStyles";

// One look for every form field: the icon-led style from the sign-up form.
// Input, Select, DateInput, Textarea and the search pickers all build on these.

export const FieldIcon = ({
  icon: Icon,
  error,
  className,
}: {
  icon: LucideIcon;
  error?: boolean;
  className?: string;
}) => (
  <Icon
    aria-hidden="true"
    className={cn(
      "ml-4 h-[18px] w-[18px] shrink-0 transition-colors",
      error
        ? "text-red-400"
        : "group-focus-within:text-brand group-data-[state=open]:text-brand text-slate-400",
      className,
    )}
  />
);

export const FieldLabel = ({
  htmlFor,
  children,
  optional,
}: {
  htmlFor?: string;
  children: ReactNode;
  optional?: boolean;
}) => (
  <label htmlFor={htmlFor} className={FIELD_LABEL}>
    {children}
    {optional && (
      <span className="ml-1 font-sans font-normal text-slate-400">
        (optional)
      </span>
    )}
  </label>
);

// Hint under the field, replaced by the error when there is one.
export const FieldMessage = ({
  id,
  hint,
  error,
}: {
  id: string;
  hint?: ReactNode;
  error?: string;
}) =>
  error ? (
    <p id={`${id}-error`} className="text-sm font-medium text-red-600">
      {error}
    </p>
  ) : hint ? (
    <p id={`${id}-hint`} className="text-sm text-slate-500">
      {hint}
    </p>
  ) : null;
