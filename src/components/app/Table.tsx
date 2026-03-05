import type { ReactNode } from "react";
import cn from "../../utils/cn";

interface TableProps {
  headers: string[];
  children: ReactNode;
  className?: string;
}

export const Table = ({ headers, children, className }: TableProps) => {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-slate-100",
        className,
      )}
    >
      <table className="w-full min-w-max border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50">
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-6 py-4 text-xs font-semibold tracking-wider whitespace-nowrap text-slate-500 uppercase"
              >
                {header}
              </th>
            ))}
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
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({
  children,
  className,
}) => {
  return (
    <td
      className={cn(
        "px-6 py-4 text-sm whitespace-nowrap text-slate-600",
        className,
      )}
    >
      {children}
    </td>
  );
};
