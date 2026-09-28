import { Loader2, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useSearchCommodities } from "../../hooks/useCommodityService";
import type { Commodity } from "../../services/api/commodity";
import cn from "../../utils/cn";

interface CommoditySelectProps {
  label: string;
  placeholder?: string;
  value: Commodity | null;
  onChange: (commodity: Commodity | null) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// Typeahead backed by the Maersk Commodity Classifications API. Only a picked
// option sets a value, so free text can never be submitted as a commodity.
const CommoditySelect = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled,
  className,
}: CommoditySelectProps) => {
  const inputId = useId();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [debounced, setDebounced] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const {
    commodities,
    isFetching,
    error: searchError,
  } = useSearchCommodities(value ? "" : debounced);

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

  const choose = (commodity: Commodity) => {
    setText("");
    setDebounced("");
    setOpen(false);
    onChange(commodity);
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

  const displayText = value ? value.name : text;
  const showDropdown = open && !value && text.trim().length >= 2;
  const isSearching = isFetching || text.trim() !== debounced.trim();
  const canPick = showDropdown && !isSearching && commodities.length > 0;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter in a commodity search never submits the surrounding form
    if (e.key === "Enter") {
      e.preventDefault();
      if (canPick) choose(commodities[active]);
      return;
    }
    if (e.key === "Escape") return setOpen(false);
    if (!canPick) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % commodities.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + commodities.length) % commodities.length);
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
          value={displayText}
          title={value?.name}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => handleInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          className={cn(
            "focus-visible:ring-brand flex h-12 w-full truncate rounded-md border border-slate-200 bg-white px-3 py-2 ring-offset-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
            error && "border-red-500 focus-visible:ring-red-500",
            value ? "pr-24" : "pr-10",
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
            className="absolute top-full right-0 left-0 z-30 mt-1 max-h-72 overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            {isSearching && !commodities.length ? (
              <li className="flex items-center gap-2 px-4 py-3 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" />
                Searching commodities
              </li>
            ) : searchError ? (
              <li className="px-4 py-3 text-sm text-red-600">
                {searchError.message ??
                  "Commodity search is unavailable right now. Try again in a minute."}
              </li>
            ) : !commodities.length ? (
              <li className="px-4 py-3 text-sm text-slate-500">
                No match for “{text.trim()}”. Try a single word, like fish or
                furniture.
              </li>
            ) : (
              commodities.map((commodity, i) => (
                <li
                  key={commodity.code}
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(commodity);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex cursor-pointer items-start justify-between gap-3 px-4 py-2.5",
                    i === active && "bg-slate-50",
                  )}
                >
                  <span className="line-clamp-2 min-w-0 text-sm font-medium text-slate-900">
                    {commodity.name}
                  </span>
                  <span className="shrink-0 pt-0.5 text-xs font-semibold tracking-wide text-slate-400">
                    {commodity.code}
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

export default CommoditySelect;
