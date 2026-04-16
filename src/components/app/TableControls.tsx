import { Search, X } from "lucide-react";
import cn from "../../utils/cn";

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
      <div className="max-medium-mobile:max-w-6xl relative max-w-md flex-1">
        <button
          onClick={onSearchSubmit}
          className="absolute top-1/2 left-3 -translate-y-1/2"
        >
          <Search className="h-4.5 w-4.5 text-slate-400" />
        </button>
        <input
          type="text"
          placeholder="Search..."
          className="focus:ring-brand/20 focus:border-brand w-full rounded-md border border-slate-200 px-10 py-2.5 text-sm transition-all outline-none focus:ring-2"
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
              <label className="text-xs font-semibold tracking-wider whitespace-nowrap text-slate-400 uppercase">
                {filter.label}
              </label>
              <select
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="focus:ring-brand/20 focus:border-brand max-medium-mobile:flex-1 rounded-md border border-slate-200 bg-white py-2.5 pl-3 text-sm transition-all outline-none focus:ring-2"
              >
                <option value="">All</option>
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default TableControls;
