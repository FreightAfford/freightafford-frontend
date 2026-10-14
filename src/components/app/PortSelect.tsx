import { Loader2, X, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useSearchLocations } from "../../hooks/useLocationService";
import {
  formatPortLabel,
  type PortLocation,
} from "../../services/api/location";
import cn from "../../utils/cn";
import { FieldIcon, FieldLabel, FieldMessage } from "../field";
import { FIELD_CONTROL, FIELD_MENU, fieldBox } from "../fieldStyles";

interface PortSelectProps {
  label: string;
  icon: LucideIcon;
  placeholder?: string;
  value: PortLocation | null;
  onChange: (location: PortLocation | null) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// Typeahead backed by the Maersk Locations API. Only a picked option sets a
// value, so free text can never be submitted as a port.
const PortSelect = ({
  label,
  icon,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  disabled,
  className,
}: PortSelectProps) => {
  const inputId = useId();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const {
    locations,
    isFetching,
    error: searchError,
  } = useSearchLocations(value ? "" : debounced);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(text), 300);
    return () => clearTimeout(id);
  }, [text]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const choose = (loc: PortLocation) => {
    setText("");
    setDebounced("");
    setOpen(false);
    onChange(loc);
  };

  const clear = () => {
    setText("");
    setDebounced("");
    onChange(null);
    // The clear button unmounts once empty, so hand focus back to the field
    inputRef.current?.focus();
  };

  const handleInput = (next: string) => {
    setText(next);
    setActive(0);
    setOpen(true);
    if (value) onChange(null);
  };

  const displayText = value ? formatPortLabel(value) : text;
  const showDropdown = open && !value && text.trim().length >= 2;
  const isSearching = isFetching || text.trim() !== debounced.trim();
  const canPick = showDropdown && !isSearching && locations.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter in a port search never submits the surrounding form
    if (e.key === "Enter") {
      e.preventDefault();
      if (canPick) choose(locations[active]);
      return;
    }
    if (e.key === "Escape") return setOpen(false);
    if (!canPick) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % locations.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + locations.length) % locations.length);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full space-y-1.5", className)}
    >
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>

      <div className={cn(fieldBox(!!error, disabled), "h-13")}>
        <FieldIcon icon={icon} error={!!error} />
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          autoComplete="off"
          value={displayText}
          title={displayText || undefined}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          className={cn(
            FIELD_CONTROL,
            "truncate",
            displayText ? "pr-24" : "pr-4",
          )}
        />

        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
          {value && (
            <span className="text-xs font-semibold tracking-wide text-slate-400">
              {value.code}
            </span>
          )}
          {displayText && !disabled && (
            <button
              type="button"
              onClick={clear}
              aria-label={`Clear ${label.toLowerCase()}`}
              className="focus-visible:ring-brand rounded p-0.5 text-slate-400 hover:text-slate-700 focus-visible:ring-2 focus-visible:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showDropdown && (
          <ul
            id={listId}
            role="listbox"
            aria-label={`${label} results`}
            className={FIELD_MENU}
          >
            {isSearching && !locations.length ? (
              <li className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                Searching ports
              </li>
            ) : searchError ? (
              <li className="px-4 py-3 text-sm text-red-600">
                {searchError.message ??
                  "Port search is unavailable right now. Try again in a minute."}
              </li>
            ) : !locations.length ? (
              <li className="px-4 py-3 text-sm text-slate-500">
                No ports match “{text.trim()}”. Try the city name, like Shanghai
                or Lagos.
              </li>
            ) : (
              locations.map((loc, i) => (
                <li
                  key={loc.code}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(loc);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5",
                    i === active && "bg-slate-100",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-900">
                      {formatPortLabel(loc)}
                    </span>
                    {loc.region && loc.region !== loc.city && (
                      <span className="block truncate text-xs text-slate-500">
                        {loc.region}
                      </span>
                    )}
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    {loc.maerskServed && (
                      <span className="text-brand text-xs font-medium">
                        Maersk port
                      </span>
                    )}
                    <span className="w-12 text-right text-xs font-semibold tracking-wide text-slate-400">
                      {loc.code}
                    </span>
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      <FieldMessage id={inputId} error={error} />
    </div>
  );
};

export default PortSelect;
