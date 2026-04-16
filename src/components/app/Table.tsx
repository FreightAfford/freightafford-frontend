import { ArrowDown, ArrowUp } from "lucide-react";
import type { ReactNode } from "react";
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
    <div className={cn("overflow-x-auto border border-slate-100", className)}>
      <table className="w-full min-w-max border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {headers.map((header, i) => {
              const h = typeof header === "string" ? { label: header } : header;
              const isSorted = sortConfig?.key === h.key;

              return (
                <th
                  key={i}
                  className={cn(
                    "px-6 py-4 text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase",
                    h.sortable &&
                      "cursor-pointer transition-colors hover:bg-slate-100",
                  )}
                  onClick={() => h.sortable && h.key && onSort?.(h.key)}
                >
                  <div className="flex gap-1">
                    {h.label}
                    {h.sortable && h.key && (
                      <div className="text-slate-300">
                        {isSorted ? (
                          sortConfig?.direction === "asc" ? (
                            <ArrowUp className="text-brand h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="text-brand h-3.5 w-3.5" />
                          )
                        ) : (
                          <ArrowDown className="h-3.5 w-3.5" />
                        )}
                      </div>
                    )}
                  </div>
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
  return (
    <tr
      className={cn(
        "transition-colors hover:bg-slate-50",
        onClick && "cursor-pointer",
        className,
      )}
      onClick={onClick}
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
        "px-6 py-4 text-sm whitespace-nowrap text-slate-600",
        className,
      )}
    >
      {children}
    </td>
  );
};
