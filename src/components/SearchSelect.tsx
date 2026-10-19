import { ChevronDown, type LucideIcon } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import cn from "../utils/cn";
import { FieldIcon, FieldLabel } from "./field";
import { FIELD_CONTROL, FIELD_MENU, fieldBox } from "./fieldStyles";

export type SearchOption = { value: string; label: string; hint?: string };

interface SearchSelectProps {
  label: string;
  options: SearchOption[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  // What the list is of, for the "no match" line: "countries"
  noun?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
}

// Options whose label starts with the query first, then any word starting
// with it, then anything containing it.
const rank = (options: SearchOption[], query: string) => {
  const q = query.trim().toLowerCase();
  if (!q) return options;
  const score = (o: SearchOption) => {
    const label = o.label.toLowerCase();
    if (label.startsWith(q)) return 0;
    if (label.split(/[\s,()-]+/).some((word) => word.startsWith(q))) return 1;
    if (label.includes(q) || o.hint?.toLowerCase() === q) return 2;
    return 3;
  };
  return options
    .map((o) => ({ o, s: score(o) }))
    .filter(({ s }) => s < 3)
    .sort((a, b) => a.s - b.s)
    .map(({ o }) => o);
};

// A dropdown you can type into: click to see the whole list, type to narrow
// it. Only a picked option sets the value, so the field always holds one.
const SearchSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder = "Choose an option",
  searchPlaceholder = "Type to search",
  noun = "options",
  icon,
  disabled,
  className,
}: SearchSelectProps) => {
  const inputId = useId();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const selected = options.find((o) => o.value === value);
  const results = useMemo(() => rank(options, query), [options, query]);

  const close = () => {
    setOpen(false);
    setQuery("");
  };

  const openList = () => {
    if (disabled) return;
    setOpen(true);
    // Start on the current choice so arrows move from there
    const index = options.findIndex((o) => o.value === value);
    setActive(Math.max(index, 0));
  };

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // Keep the highlighted option in view while arrowing through a long list
  // (scrolls the list only; scrollIntoView would move the page too)
  useEffect(() => {
    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!open || !list || !item) return;
    if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop;
    else if (
      item.offsetTop + item.offsetHeight >
      list.scrollTop + list.clientHeight
    )
      list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
  }, [active, open]);

  const choose = (option: SearchOption) => {
    onChange(option.value);
    close();
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") return close();
    if (!open && (e.key === "ArrowDown" || e.key === "Enter")) {
      e.preventDefault();
      return openList();
    }
    if (!results.length) return;
    if (e.key === "Enter") {
      e.preventDefault();
      choose(results[Math.min(active, results.length - 1)]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => (i - 1 + results.length) % results.length);
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full space-y-1.5", className)}
    >
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>

      <div
        className={cn(fieldBox(false, disabled), "h-13", !icon && "pl-1")}
        data-state={open ? "open" : "closed"}
      >
        {icon && <FieldIcon icon={icon} />}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            open && results[active] ? `${listId}-${active}` : undefined
          }
          autoComplete="off"
          disabled={disabled}
          // Closed, it shows the choice; open, it's a search box
          value={open ? query : (selected?.label ?? "")}
          placeholder={
            open ? selected?.label || searchPlaceholder : placeholder
          }
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(0);
            setOpen(true);
          }}
          onFocus={openList}
          onClick={() => !open && openList()}
          onKeyDown={handleKeyDown}
          className={cn(
            FIELD_CONTROL,
            "truncate pr-10",
            open && "placeholder:text-slate-500",
          )}
        />
        <ChevronDown
          aria-hidden="true"
          onMouseDown={(e) => {
            e.preventDefault();
            if (open) close();
            else inputRef.current?.focus();
          }}
          className={cn(
            "absolute top-1/2 right-3.5 h-4 w-4 -translate-y-1/2 cursor-pointer text-slate-400 transition-transform motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />

        {open && (
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            className={FIELD_MENU}
          >
            {!results.length ? (
              <li className="px-4 py-3 text-sm text-slate-500">
                No {noun} match “{query.trim()}”.
              </li>
            ) : (
              results.map((option, i) => (
                <li
                  key={option.value}
                  id={`${listId}-${i}`}
                  data-index={i}
                  role="option"
                  aria-selected={option.value === value}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(option);
                  }}
                  onMouseEnter={() => setActive(i)}
                  className={cn(
                    "flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm",
                    i === active && "bg-slate-100",
                    option.value === value
                      ? "text-brand font-semibold"
                      : "text-slate-900",
                  )}
                >
                  <span className="min-w-0 truncate">{option.label}</span>
                  {option.hint && (
                    <span className="shrink-0 font-mono text-xs font-semibold tracking-wide text-slate-400">
                      {option.hint}
                    </span>
                  )}
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SearchSelect;
