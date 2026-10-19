import cn from "../utils/cn";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

// An on/off toggle with its label beside it.
const Switch = ({ checked, onChange, label, className }: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cn(
      "focus-visible:ring-brand/40 flex items-center gap-2.5 rounded-lg text-sm font-medium whitespace-nowrap text-slate-700 outline-none focus-visible:ring-2",
      className,
    )}
  >
    <span
      aria-hidden="true"
      className={cn(
        "relative h-5 w-9 shrink-0 rounded-full transition-colors motion-reduce:transition-none",
        checked ? "bg-brand" : "bg-slate-300",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform motion-reduce:transition-none",
          checked && "translate-x-4",
        )}
      />
    </span>
    {label}
  </button>
);

export default Switch;
