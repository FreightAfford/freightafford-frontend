import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Hourglass,
  Loader2,
  Send,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import Button from "../../../../components/Button";
import type { AutosaveState } from "../../../../hooks/useKycService";
import cn from "../../../../utils/cn";

// Building blocks shared by the verification steps.

export const FormSection = ({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) => (
  <section className="max-mobile:p-5 rounded-2xl border border-slate-200 bg-white p-6">
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 className="font-display text-lg font-bold text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
    {children}
  </section>
);

// Two columns for short fields on wide screens; anything with
// className="col-span-full" (uploads, long fields) spans both.
export const FieldGrid = ({ children }: { children: ReactNode }) => (
  <div className="max-small-tablet:grid-cols-1 grid grid-cols-2 gap-x-5 gap-y-5">
    {children}
  </div>
);

export const RemoveButton = ({
  label,
  onClick,
  disabled,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
  >
    <Trash2 aria-hidden="true" className="h-4 w-4" />
    {label}
  </button>
);

export const AddButton = ({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="hover:border-brand/60 hover:text-brand focus-visible:ring-brand flex h-13 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 font-semibold text-slate-600 transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
  >
    {children}
  </button>
);

export const StepActions = ({
  onBack,
  isSaving,
  submitLabel = "Save and continue",
  submitDisabled,
  waitingForUploads,
  autosave = "idle",
}: {
  onBack?: () => void;
  isSaving?: boolean;
  submitLabel?: string;
  submitDisabled?: boolean;
  waitingForUploads?: boolean;
  autosave?: AutosaveState;
}) => (
  <div className="space-y-3 pt-2">
    <AutosaveStatus state={autosave} />
    <div
      className={cn(
        "max-small-mobile:flex-col-reverse flex items-center gap-3",
        onBack ? "justify-between" : "justify-end",
      )}
    >
      {onBack && (
        <Button
          icon={ArrowLeft}
          type="button"
          variant="outline"
          size="lg"
          onClick={onBack}
          disabled={isSaving}
          className="max-small-mobile:w-full h-12 rounded-xl text-base font-semibold"
        >
          Back
        </Button>
      )}
      <Button
        type="submit"
        size="lg"
        icon={
          waitingForUploads
            ? Hourglass
            : submitLabel === "Submit for review"
              ? Send
              : ArrowRight
        }
        isLoading={isSaving}
        disabled={isSaving || submitDisabled || waitingForUploads}
        className="max-small-mobile:w-full h-12 rounded-xl px-8 text-base font-semibold"
      >
        {waitingForUploads ? "Waiting for uploads…" : submitLabel}
      </Button>
    </div>
  </div>
);

// A quiet line saying whether what's on screen is safely stored.
const AutosaveStatus = ({ state }: { state: AutosaveState }) => (
  <p
    aria-live="polite"
    className={cn(
      "flex min-h-5 items-center justify-end gap-1.5 text-sm",
      state === "error" ? "text-red-600" : "text-slate-500",
    )}
  >
    {state === "saving" && (
      <>
        <Loader2
          aria-hidden="true"
          className="h-4 w-4 animate-spin motion-reduce:animate-none"
        />
        Saving…
      </>
    )}
    {state === "saved" && (
      <>
        <Check aria-hidden="true" className="text-kelp h-4 w-4" />
        All changes saved
      </>
    )}
    {state === "error" && (
      <>
        <AlertCircle aria-hidden="true" className="h-4 w-4" />
        Couldn't save your changes. Check your connection; we'll try again as
        you type.
      </>
    )}
  </p>
);
