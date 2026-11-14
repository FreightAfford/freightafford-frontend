import {
  CalendarX2,
  Copy,
  Eye,
  MoreHorizontal,
  Pencil,
  Tags,
  Trash2,
} from "lucide-react";
import moment from "moment";
import { useLocation, useNavigate } from "react-router";
import { RATE_CONTAINER_SIZES } from "../../../../data/rates";
import { useRateActions } from "../../../../hooks/useRateActions";
import { useGetRates } from "../../../../hooks/useRateService";
import { useTableQuery } from "../../../../hooks/useTableQuery";
import type { Rate } from "../../../../services/api/rate";
import {
  formatAmount,
  formatValidity,
  RATE_STATUS_LABELS,
  rateStatus,
} from "../../../../utils/rates";
import EmptyState from "../../../EmptyState";
import ErrorState from "../../../ErrorState";
import SmallLoader from "../../../SmallLoader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import Pagination from "../../Pagination";
import { Table, TableCell, TableRow } from "../../Table";
import TableControls from "../../TableControls";
import RateStatusBadge from "./RateStatusBadge";

const LIMIT = 10;

interface RatesTableProps {
  onEdit: (rate: Rate) => void;
  onDuplicate: (rate: Rate) => void;
}

const laneText = (rate: Rate) =>
  `${rate.origin.city} → ${rate.destination.city}`;

// Every contract rate, newest change first. A row opens the rate's own page,
// with its full charges; the menu edits it in place.
const RatesTable = ({ onEdit, onDuplicate }: RatesTableProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    page,
    searchInput,
    sortConfig,
    filters,
    params,
    setPage,
    handleSort,
    handleFilterChange,
    handleSearchSubmit,
    handleSearchChange,
    resetSearch,
  } = useTableQuery({
    initialSortKey: "updatedAt",
    initialSortDirection: "desc",
    initialLimit: LIMIT,
    filterKeys: ["status", "containerSize"],
  });

  const { rates, total, totalAll, isPending, isRefetching, error, refetch } =
    useGetRates(params);
  const { confirmExpire, confirmDelete, ConfirmDialog } = useRateActions();

  // The page's "All rates" link comes back to this page, search and filters.
  const open = (rate: Rate) =>
    navigate(`/app/admin/rates/${rate._id}`, {
      state: { back: `${location.pathname}${location.search}` },
    });

  if (error)
    return (
      <ErrorState resource="rates" error={error} onRetry={() => refetch()} />
    );

  if (!isPending && totalAll === 0)
    return (
      <EmptyState
        icon={<Tags className="text-brand h-10 w-10" />}
        title="No contract rates yet"
        description="Add a rate from a Maersk quote, and verified customers can look it up straight away."
      />
    );

  const loading = isPending || isRefetching;
  const hasResults = rates.length > 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <TableControls
        searchTerm={searchInput}
        onSearchSubmit={handleSearchSubmit}
        onSearchChange={handleSearchChange}
        onSearchReset={resetSearch}
        filters={[
          {
            label: "Status",
            key: "status",
            value: filters.status || "",
            onChange: (val) => handleFilterChange("status", val),
            options: Object.entries(RATE_STATUS_LABELS).map(
              ([value, label]) => ({ value, label }),
            ),
          },
          {
            label: "Size",
            key: "containerSize",
            value: filters.containerSize || "",
            onChange: (val) => handleFilterChange("containerSize", val),
            options: RATE_CONTAINER_SIZES.map((c) => ({
              value: c.value,
              label: c.value,
            })),
          },
        ]}
      />

      <Table
        headers={[
          { label: "Lane", key: "origin", sortable: true },
          "Commodity",
          { label: "Size", key: "containerSize", sortable: true },
          "Basic freight",
          { label: "Valid", key: "validTo", sortable: true },
          { label: "Updated", key: "updatedAt", sortable: true },
          { label: "" },
        ]}
        sortConfig={sortConfig}
        onSort={handleSort}
      >
        {!loading &&
          rates.map((rate) => {
            const basic = rate.charges.find((c) => c.code === "BAS");
            const expired = rateStatus(rate) === "expired";
            return (
              <TableRow key={rate._id} onClick={() => open(rate)}>
                <TableCell>
                  <p className="font-medium text-slate-900">
                    {rate.origin.code} → {rate.destination.code}
                  </p>
                  <p className="text-xs text-slate-500">{laneText(rate)}</p>
                </TableCell>
                <TableCell className="max-w-48 truncate">
                  <span title={rate.commodity}>{rate.commodity}</span>
                </TableCell>
                <TableCell>{rate.containerSize}</TableCell>
                <TableCell className="font-medium text-slate-800">
                  {basic ? formatAmount(basic.amount, basic.currency) : "—"}
                </TableCell>
                <TableCell>
                  <p>{formatValidity(rate.validFrom, rate.validTo)}</p>
                  <p className="mt-1">
                    <RateStatusBadge rate={rate} />
                  </p>
                </TableCell>
                <TableCell>
                  <p>{moment(rate.updatedAt).format("D MMM YYYY")}</p>
                  {rate.updatedBy && (
                    <p className="text-xs text-slate-500">{rate.updatedBy}</p>
                  )}
                </TableCell>
                <TableCell className="w-12 pr-3 text-right">
                  {/* The menu's clicks stay out of the row's own click. */}
                  <div onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          aria-label={`Actions for ${laneText(rate)}, ${rate.containerSize}`}
                          className="focus-visible:ring-brand/40 rounded-lg p-2 text-slate-400 transition-colors outline-none hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700"
                        >
                          <MoreHorizontal className="h-[18px] w-[18px]" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onSelect={() => open(rate)}>
                          <Eye className="h-4 w-4 text-slate-500" /> View
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onEdit(rate)}>
                          <Pencil className="h-4 w-4 text-slate-500" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onDuplicate(rate)}>
                          <Copy className="h-4 w-4 text-slate-500" /> Duplicate
                        </DropdownMenuItem>
                        {!expired && (
                          <DropdownMenuItem
                            onSelect={() => confirmExpire(rate)}
                          >
                            <CalendarX2 className="h-4 w-4 text-slate-500" />{" "}
                            Expire now
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onSelect={() => confirmDelete(rate)}
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
      </Table>

      {loading && (
        <div className="flex items-center justify-center gap-2 bg-white p-10 text-slate-500">
          <SmallLoader /> {isPending ? "Loading…" : "Refreshing…"}
        </div>
      )}

      {!loading && !hasResults && (
        <div className="bg-white p-10 text-center text-slate-500">
          No rates match this search
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={Math.ceil(total / LIMIT)}
        onPageChange={setPage}
      />

      {ConfirmDialog}
    </div>
  );
};

export default RatesTable;
