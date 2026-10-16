import { Loader2, X, type LucideIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useSearchLocations } from "../../hooks/useLocationService";
import {
  formatPortLabel,
  type PortLocation,
} from "../../services/api/location";
import cn from "../../utils/cn";
import { FIELD_MENU } from "../fieldStyles";

interface PortSelectProps {
  // Full name for screen readers and messages, e.g. "Origin port".
  label: string;
  // The short visible label, e.g. "From".
  kicker: string;
  icon: LucideIcon;
  // Which end of the route this row is: the lane runs down from the origin
  // marker and into the destination marker.
  end: "origin" | "destination";
  placeholder?: string;
  value: PortLocation | null;
  onChange: (location: PortLocation | null) => void;
  onBlur?: () => void;
  error?: boolean;
  disabled?: boolean;
  className?: string;
}

// The dashed shipping lane between the two markers.
const LANE =
  "repeating-linear-gradient(180deg, var(--color-slate-300) 0 4px, transparent 4px 8px)";

// "Ho Chi Minh, Vietnam" under the city, without repeating the city.
const placeLine = (loc: PortLocation) =>
  [loc.region && loc.region !== loc.city ? loc.region : null, loc.country]
    .filter(Boolean)
    .join(", ");

// One end of the route card in the freight request form: a typeahead backed
// by the Maersk Locations API. Only a picked option sets a value, so free
// text can never be submitted as a port. The row spans the full width, so
// long names show in full, and the results list does too.
const PortSelect = ({
  label,
  kicker,
  icon: Icon,
  end,
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
  // Searching again for a port that's already picked. The pick stays until
  // a new one replaces it.
  const [editing, setEditing] = useState(false);
  const searching = !value || editing;

  const {
    locations,
    isFetching,
    error: searchError,
  } = useSearchLocations(searching ? debounced : "");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(text), 300);
    return () => clearTimeout(id);
  }, [text]);

  const stopEditing = () => {
    setEditing(false);
    setText("");
    setDebounced("");
  };

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
      setEditing(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // The search input mounts when editing starts, so focus it then.
  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const choose = (loc: PortLocation) => {
    stopEditing();
    setOpen(false);
    onChange(loc);
  };

  const clear = () => {
    stopEditing();
    onChange(null);
    // The picked view unmounts once empty, so hand focus to the search field
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  const handleInput = (next: string) => {
    setText(next);
    setActive(0);
    setOpen(true);
  };

  const showDropdown = open && searching && text.trim().length >= 2;
  const isSearching = isFetching || text.trim() !== debounced.trim();
  const canPick = showDropdown && !isSearching && locations.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter in a port search never submits the surrounding form
    if (e.key === "Enter") {
      e.preventDefault();
      if (canPick) choose(locations[active]);
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      if (editing) stopEditing();
      return;
    }
    if (!canPick) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % locations.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + locations.length) % locations.length);
    }
  };

  const picked = value && !editing ? value : null;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex min-h-16 items-center gap-3 px-4 py-3 transition-colors focus-within:bg-slate-50/80",
        error && "bg-red-50/50",
        className,
      )}
    >
      {/* Marker, with its half of the lane */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-[31px] w-0.5",
          end === "origin" ? "top-1/2 bottom-0" : "top-0 bottom-1/2",
        )}
        style={{ backgroundImage: LANE }}
      />
      <span
        aria-hidden="true"
        className={cn(
          "relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-4 ring-white",
          error
            ? "bg-red-100 text-red-500"
            : end === "origin"
              ? "bg-mist text-harbour"
              : "bg-brand/10 text-brand",
        )}
      >
        <Icon className="h-4 w-4" />
      </span>

      <div className="min-w-0 flex-1">
        <label
          htmlFor={inputId}
          className="block text-[11px] font-semibold tracking-wider text-slate-400 uppercase"
        >
          {kicker}
        </label>

        {picked ? (
          // The picked port in full. Clicking it searches again.
          <button
            type="button"
            id={inputId}
            disabled={disabled}
            onClick={() => {
              setEditing(true);
              setOpen(true);
            }}
            onBlur={onBlur}
            aria-label={`${label}: ${formatPortLabel(picked)}. Change`}
            className="focus-visible:ring-brand/40 -mx-1 mt-0.5 block max-w-full rounded-md px-1 text-left outline-none focus-visible:ring-2 disabled:cursor-not-allowed"
          >
            <span className="font-semibold break-words text-slate-900">
              {picked.city}
            </span>
            {/* Inline after the city when there is room; its own line on
                narrow cards, so it never breaks mid-phrase. */}
            <span className="break-words text-slate-500 @max-sm:mt-0.5 @max-sm:block @max-sm:text-sm">
              <span className="@max-sm:hidden">, </span>
              {placeLine(picked)}
            </span>
          </button>
        ) : (
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-label={label}
            aria-invalid={error || undefined}
            autoComplete="off"
            value={text}
            placeholder={
              editing && value
                ? `Replace ${formatPortLabel(value)}`
                : placeholder
            }
            disabled={disabled}
            onChange={(e) => handleInput(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={onBlur}
            onKeyDown={handleKeyDown}
            className="mt-0.5 block w-full truncate bg-transparent text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
        )}
      </div>

      <span className="flex shrink-0 items-center gap-2">
        {picked && (
          <span className="bg-mist text-harbour rounded-md px-1.5 py-0.5 font-mono text-xs font-semibold tracking-wide">
            {picked.code}
          </span>
        )}
        {showDropdown && isSearching && (
          <Loader2
            aria-hidden="true"
            className="h-4 w-4 animate-spin text-slate-400 motion-reduce:animate-none"
          />
        )}
        {(picked || text) && !disabled && (
          <button
            type="button"
            onClick={() => {
              if (picked) return clear();
              setText("");
              setDebounced("");
              inputRef.current?.focus();
            }}
            aria-label={
              picked ? `Clear ${label.toLowerCase()}` : "Clear search"
            }
            className="focus-visible:ring-brand rounded p-0.5 text-slate-400 hover:text-slate-700 focus-visible:ring-2 focus-visible:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </span>

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
                  <span className="block text-sm font-medium break-words text-slate-900">
                    {loc.city}
                  </span>
                  <span className="block text-xs break-words text-slate-500">
                    {placeLine(loc)}
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  {loc.maerskServed && (
                    <span className="text-brand text-xs font-medium">
                      Maersk port
                    </span>
                  )}
                  <span className="w-12 text-right font-mono text-xs font-semibold tracking-wide text-slate-400">
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
