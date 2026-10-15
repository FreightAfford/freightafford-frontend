import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { KeyboardEvent, ReactNode } from "react";
import cn from "../../utils/cn";

interface TableHeader {
  label: string;
  key?: string;
  sortable?: boolean;
}

interface TableProps {
  headers: (string | TableHeader)[];
  children: ReactNode;
  className?: string;
  sortConfig?: { key: string; direction: "asc" | "desc" };
  onSort?: (key: string) => void;
}

export const Table = ({
  headers,
  children,
  className,
  sortConfig,
  onSort,
}: TableProps) => {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-max border-collapse text-left">
        <thead>
          <tr className="bg-mist/70 border-b border-slate-200">
            {headers.map((header, i) => {
              const h = typeof header === "string" ? { label: header } : header;
              const canSort = Boolean(h.sortable && h.key);
              const isSorted = canSort && sortConfig?.key === h.key;
              const SortIcon = isSorted
                ? sortConfig?.direction === "asc"
                  ? ArrowUp
                  : ArrowDown
                : ArrowUpDown;

              return (
                <th
                  key={i}
                  scope="col"
                  aria-sort={
                    isSorted
                      ? sortConfig?.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className="px-5 py-3 text-[11px] font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase"
                >
                  {canSort ? (
                    <button
                      type="button"
                      onClick={() => onSort?.(h.key!)}
                      className={cn(
                        "group/sort focus-visible:ring-brand/40 -mx-1.5 inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 uppercase transition-colors outline-none hover:text-slate-900 focus-visible:ring-2",
                        isSorted && "text-slate-900",
                      )}
                    >
                      {h.label}
                      <SortIcon
                        aria-hidden="true"
                        className={cn(
                          "h-3.5 w-3.5 transition-opacity",
                          isSorted
                            ? "text-brand"
                            : "text-slate-400 opacity-0 group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100",
                        )}
                      />
                    </button>
                  ) : (
                    h.label
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
      </table>
    </div>
  );
};

interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const TableRow = ({ onClick, className, children }: TableRowProps) => {
  const handleKeyDown = (e: KeyboardEvent<HTMLTableRowElement>) => {
    if (e.key === "Enter" && e.target === e.currentTarget) onClick?.();
  };

  return (
    <tr
      className={cn(
        "group transition-colors",
        onClick &&
          "hover:bg-mist/50 focus-visible:bg-mist/50 cursor-pointer outline-none [&>td:first-child]:shadow-[inset_3px_0_0_transparent] [&>td:first-child]:transition-shadow hover:[&>td:first-child]:shadow-[inset_3px_0_0_var(--color-brand)] focus-visible:[&>td:first-child]:shadow-[inset_3px_0_0_var(--color-brand)]",
        className,
      )}
      onClick={onClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </tr>
  );
};

interface TableCellProps {
  children: React.ReactNode;
  colSpan?: number;
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  colSpan,
  className,
}) => {
  return (
    <td
      colSpan={colSpan}
      className={cn(
        "px-5 py-3.5 align-middle text-sm whitespace-nowrap text-slate-600 tabular-nums",
        className,
      )}
    >
      {children}
    </td>
  );
};
