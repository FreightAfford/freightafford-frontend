import { Loader2, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useSearchLocations } from "../../hooks/useLocationService";
import {
  formatPortLabel,
  type PortLocation,
} from "../../services/api/location";
import cn from "../../utils/cn";

interface PortSelectProps {
  label: string;
  // Short visible prefix shown inside the field, e.g. "From" / "To"
  prefix: string;
  marker: "origin" | "destination";
  placeholder?: string;
  value: PortLocation | null;
  onChange: (location: PortLocation | null) => void;
  onBlur?: () => void;
  invalid?: boolean;
  disabled?: boolean;
  className?: string;
}

// Typeahead backed by the Maersk Locations API. Only a picked option sets a
// value, so free text can never be submitted as a port.
const PortSelect = ({
  label,
  prefix,
  marker,
  placeholder,
  value,
  onChange,
  onBlur,
  invalid,
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

  const { locations, isFetching, error } = useSearchLocations(
    value ? "" : debounced,
  );

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
    <div ref={containerRef} className={cn("relative", className)}>
      <label htmlFor={inputId} className="sr-only">
        {label}
      </label>

      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1/2 left-4 z-10 h-2.5 w-2.5 -translate-y-1/2 rounded-full ring-4 ring-white",
          marker === "origin" ? "bg-brand" : "border-brand border-2 bg-white",
        )}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-10 -translate-y-1/2 text-sm text-slate-500"
      >
        {prefix}
      </span>

      <input
        ref={inputRef}
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-invalid={invalid || undefined}
        autoComplete="off"
        value={displayText}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => setOpen(true)}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        className={cn(
          "focus-visible:ring-brand/40 h-14 w-full bg-transparent pl-20 font-medium text-slate-900 placeholder:font-normal placeholder:text-slate-400 focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset disabled:cursor-not-allowed disabled:opacity-50",
          displayText ? "pr-36" : "pr-14",
        )}
      />

      <div className="absolute top-1/2 right-14 flex -translate-y-1/2 items-center gap-2">
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
          className="absolute top-full right-0 left-0 z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          {isSearching && !locations.length ? (
            <li className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
              Searching ports
            </li>
          ) : error ? (
            <li className="px-4 py-3 text-sm text-red-600">
              {error.message ??
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
                  "flex cursor-pointer items-center justify-between gap-3 px-4 py-2.5",
                  i === active && "bg-slate-50",
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
  );
};

export default PortSelect;
