import { Loader2, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useSearchVessels } from "../../hooks/useVesselService";
import type { Vessel } from "../../services/api/vessel";
import cn from "../../utils/cn";

interface VesselSelectProps {
  label: string;
  placeholder?: string;
  value: string;
  imo?: string;
  onChange: (name: string, imo?: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

const vesselDetails = (vessel: Vessel) =>
  [
    vessel.imo && `IMO ${vessel.imo}`,
    vessel.flag,
    vessel.teu && `${vessel.teu.toLocaleString()} TEU`,
  ]
    .filter(Boolean)
    .join(" · ");

// Typeahead backed by the Maersk Vessels API. Suggestions only: free text is
// still accepted, since not every vessel is in Maersk's reference data. Picking
// a suggestion also reports the vessel's IMO; typing clears it.
const VesselSelect = ({
  label,
  placeholder,
  value,
  imo,
  onChange,
  error,
  disabled,
  className,
}: VesselSelectProps) => {
  const inputId = useId();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [debounced, setDebounced] = useState("");
  const [typing, setTyping] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const {
    vessels,
    isFetching,
    error: searchError,
  } = useSearchVessels(typing ? debounced : "");

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), 300);
    return () => clearTimeout(id);
  }, [value]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const choose = (vessel: Vessel) => {
    setTyping(false);
    setOpen(false);
    onChange(vessel.name, vessel.imo);
  };

  const clear = () => {
    setTyping(false);
    onChange("", undefined);
    // The clear button unmounts once empty, so hand focus back to the field
    inputRef.current?.focus();
  };

  const handleInput = (next: string) => {
    setTyping(true);
    setActive(0);
    setOpen(true);
    onChange(next, undefined);
  };

  const showDropdown = open && typing && value.trim().length >= 2;
  const isSearching = isFetching || value.trim() !== debounced.trim();
  const canPick = showDropdown && !isSearching && vessels.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") return setOpen(false);
    // Enter picks the highlighted suggestion instead of submitting the form
    if (e.key === "Enter" && canPick) {
      e.preventDefault();
      choose(vessels[active]);
      return;
    }
    if (!canPick) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % vessels.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + vessels.length) % vessels.length);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full space-y-1.5", className)}
    >
      <label
        htmlFor={inputId}
        className="leading-none font-medium tracking-wide text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={!!error || undefined}
          autoComplete="off"
          value={value}
          title={value || undefined}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            "focus-visible:ring-brand flex h-12 w-full truncate rounded-md border border-slate-200 bg-white px-3 py-2 ring-offset-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500",
            imo ? "pr-32" : "pr-10",
          )}
        />

        <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-2">
          {imo && (
            <span className="text-xs font-semibold tracking-wide text-slate-400">
              IMO {imo}
            </span>
          )}
          {value && !disabled && (
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
            aria-label={`${label} suggestions`}
            className="absolute top-full right-0 left-0 z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            {isSearching && !vessels.length ? (
              <li className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                Searching vessels
              </li>
            ) : searchError ? (
              <li className="px-4 py-3 text-sm text-red-600">
                {searchError.message ??
                  "Vessel search is unavailable right now. You can still type the name."}
              </li>
            ) : !vessels.length ? (
              <li className="px-4 py-3 text-sm text-slate-500">
                No Maersk match for “{value.trim()}”. You can keep what you
                typed.
              </li>
            ) : (
              vessels.map((vessel, i) => (
                <li
                  key={vessel.imo ?? vessel.name}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(vessel);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex cursor-pointer items-start justify-between gap-3 px-4 py-2.5",
                    i === active && "bg-slate-50",
                  )}
                >
                  <span className="min-w-0 truncate text-sm font-medium text-slate-900">
                    {vessel.name}
                  </span>
                  <span className="shrink-0 pt-0.5 text-xs font-semibold tracking-wide text-slate-400">
                    {vesselDetails(vessel)}
                  </span>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {error && <p className="font-medium text-red-500">{error}</p>}
    </div>
  );
};

export default VesselSelect;
