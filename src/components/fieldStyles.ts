import type { ReactNode } from "react";
import cn from "../utils/cn";

// Class names for the icon-led field style (see field.tsx for the parts).

export const FIELD_LABEL =
  "font-display block text-sm font-semibold text-slate-800";

// The bordered box. Inputs sit inside it; Select and DateInput are buttons
// that carry these classes themselves.
export const fieldBox = (error?: boolean, disabled?: boolean) =>
  cn(
    "group relative flex min-h-13 w-full items-center rounded-xl border bg-white transition-[border-color,box-shadow] duration-150",
    error
      ? "border-red-400 bg-red-50/50 focus-within:shadow-[0_0_0_3px_rgb(239_68_68/0.15)]"
      : "focus-within:border-brand data-[state=open]:border-brand border-slate-200 hover:border-slate-300 focus-within:shadow-[0_0_0_3px_rgb(30_144_255/0.15)] data-[state=open]:shadow-[0_0_0_3px_rgb(30_144_255/0.15)]",
    disabled && "cursor-not-allowed opacity-60",
  );

// The text control inside a fieldBox.
export const FIELD_CONTROL =
  "h-full min-w-0 flex-1 bg-transparent px-3 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed";

// Dropdown panels under the search pickers (ports, commodities, vessels).
export const FIELD_MENU =
  "absolute top-full right-0 left-0 z-30 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-[0_12px_32px_-8px_rgb(15_23_43/0.18)]";

// aria-describedby for a field's hint or error line.
export const describedBy = (id: string, hint?: ReactNode, error?: string) =>
  error ? `${id}-error` : hint ? `${id}-hint` : undefined;
