import { ChevronLeft, ChevronRight, ChevronsRight } from "lucide-react";
import cn from "../../utils/cn";
import Button from "../Button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    if (totalPages <= 5) return i + 1;
    if (currentPage <= 3) return i + 1;
    if (currentPage >= totalPages - 2) return totalPages - 4 + i;
    return currentPage - 2 + i;
  });

  return (
    <div
      className={cn(
        "flex items-center justify-between border-t border-slate-100 bg-white px-6 py-3",
        className,
      )}
    >
      <div className="max-medium-mobile:flex hidden flex-1 justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
      <div className="max-medium-mobile:hidden flex flex-1 items-center justify-between">
        <div>
          <p className="text-sm text-slate-700">
            Showing page <span className="font-medium">{currentPage}</span> of{" "}
            <span className="font-medium">{totalPages}</span>
          </p>
        </div>
        <div>
          <nav
            className="relative z-0 inline-flex -space-x-px rounded-md shadow-sm"
            aria-label="Pagination"
          >
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md border border-slate-200 bg-white px-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="sr-only">First</span>
              <ChevronLeft className="h-4 w-4" />
            </button>

            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-md border border-slate-200 bg-white px-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft className="h-4 w-4" />
            </button>

            {pages.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={cn(
                  "relative inline-flex items-center border px-4 py-2 text-sm font-medium text-white transition-colors",
                  currentPage === page
                    ? "bg-brand border-brand z-10 text-white"
                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50",
                )}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center border border-slate-200 bg-white px-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="sr-only">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-md border border-slate-200 bg-white px-2 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="sr-only">Last</span>
              <ChevronsRight className="h-4 w-4" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
export default Pagination;
