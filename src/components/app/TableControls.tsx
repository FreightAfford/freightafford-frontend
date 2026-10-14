import { Search, X } from "lucide-react";
import cn from "../../utils/cn";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

// Radix Select can't use "" as an item value, so "All" goes through this.
const ALL = "__all";

interface FilterOption {
  label: string;
  value: string;
}

interface TableControlsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters?: {
    label: string;
    key: string;
    options: FilterOption[];
    value: string | undefined;
    onChange: (value: string) => void;
  }[];
  onSearchSubmit?: () => void;
  onSearchReset?: () => void;
  className?: string;
}

const TableControls = ({
  searchTerm,
  onSearchSubmit,
  onSearchChange,
  onSearchReset,
  filters,
  className,
}: TableControlsProps) => {
  return (
    <div
      className={cn(
        "max-medium-mobile:flex-col max-medium-mobile:items-stretch flex items-center justify-between gap-4 border-b border-slate-100 bg-white p-4",
        className,
      )}
    >
      <div className="max-medium-mobile:max-w-6xl group relative max-w-md flex-1">
        <button
          type="button"
          onClick={onSearchSubmit}
          aria-label="Search"
          className="group-focus-within:text-brand absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400 transition-colors"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>
        <input
          type="text"
          placeholder="Search..."
          className="focus:border-brand h-11 w-full rounded-xl border border-slate-200 bg-white pr-10 pl-11 text-[0.9375rem] text-slate-900 transition-[border-color,box-shadow] duration-150 outline-none placeholder:text-slate-400 hover:border-slate-300 focus:shadow-[0_0_0_3px_rgb(30_144_255/0.15)]"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSearchSubmit?.();
          }}
        />
        {searchTerm && (
          <button
            onClick={() => onSearchReset?.()}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 transition-colors hover:bg-slate-100"
          >
            <X className="h-3.5 w-3.5 text-slate-400" />
          </button>
        )}
      </div>
      {filters && filters.length > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {filters.map((filter) => (
            <div
              key={filter.key}
              className="max-medium-mobile:flex-1 flex items-center gap-2"
            >
              <label
                htmlFor={`filter-${filter.key}`}
                className="text-xs font-semibold tracking-wider whitespace-nowrap text-slate-400 uppercase"
              >
                {filter.label}
              </label>
              <Select
                value={filter.value || ALL}
                onValueChange={(next) =>
                  filter.onChange(next === ALL ? "" : next)
                }
              >
                <SelectTrigger
                  id={`filter-${filter.key}`}
                  className="focus-visible:border-brand data-[state=open]:border-brand max-medium-mobile:flex-1 h-11 min-w-36 rounded-xl border border-slate-200 bg-white pr-2.5 pl-3 text-sm text-slate-900 transition-[border-color,box-shadow] focus-visible:shadow-[0_0_0_3px_rgb(30_144_255/0.15)] data-[state=open]:shadow-[0_0_0_3px_rgb(30_144_255/0.15)] [&>svg]:h-4 [&>svg]:w-4"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value={ALL} className="py-2 text-sm">
                    All
                  </SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="py-2 text-sm"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default TableControls;
