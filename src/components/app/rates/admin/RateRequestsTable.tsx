import { CheckCheck, Inbox, MoreHorizontal, Plus } from "lucide-react";
import moment from "moment";
import { useConfirm } from "../../../../hooks/useConfirm";
import {
  useGetRateRequests,
  useResolveRateRequest,
} from "../../../../hooks/useRateService";
import { useTableQuery } from "../../../../hooks/useTableQuery";
import type { RateRequest } from "../../../../services/api/rate";
import EmptyState from "../../../EmptyState";
import ErrorState from "../../../ErrorState";
import SmallLoader from "../../../SmallLoader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../ui/dropdown-menu";
import Pagination from "../../Pagination";
import StatusBadge from "../../StatusBadge";
import { Table, TableCell, TableRow } from "../../Table";
import TableControls from "../../TableControls";

const LIMIT = 10;

const laneText = (r: RateRequest) => `${r.origin.city} → ${r.destination.city}`;

interface RateRequestsTableProps {
  // Opens the rate form with the request's lane, commodity and size.
  onAddRate: (request: RateRequest) => void;
}

// What customers asked for when a lane had no rate. Saving a matching rate
// resolves a request; one that can't be priced can be marked resolved.
const RateRequestsTable = ({ onAddRate }: RateRequestsTableProps) => {
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
    initialSortKey: "createdAt",
    initialSortDirection: "desc",
    initialLimit: LIMIT,
    filterKeys: ["status"],
  });

  const { requests, total, totalAll, isPending, isRefetching, error, refetch } =
    useGetRateRequests(params);
  const { resolveRequest } = useResolveRateRequest();
  const { confirm, ConfirmDialog } = useConfirm();

  const onResolve = async (request: RateRequest) => {
    const ok = await confirm({
      title: "Mark as resolved?",
      message: (
        <>
          The request for{" "}
          <span className="font-medium text-slate-800">
            {request.commodity.name}, {laneText(request)}
          </span>{" "}
          leaves the open list. Use this when it was answered another way, or
          can't be priced. Adding a matching rate resolves it on its own.
        </>
      ),
      confirmText: "Mark resolved",
      variant: "primary",
      icon: CheckCheck,
    });
    if (ok) resolveRequest(request._id);
  };

  if (error)
    return (
      <ErrorState
        resource="rate requests"
        error={error}
        onRetry={() => refetch()}
      />
    );

  if (!isPending && totalAll === 0)
    return (
      <EmptyState
        icon={<Inbox className="text-brand h-10 w-10" />}
        title="No rate requests yet"
        description="When a customer finds no rate for a lane and asks for one, it shows here."
      />
    );

  const loading = isPending || isRefetching;

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
            options: [
              { label: "Open", value: "open" },
              { label: "Resolved", value: "resolved" },
            ],
          },
        ]}
      />

      <Table
        headers={[
          { label: "Lane", key: "origin", sortable: true },
          "Commodity",
          "Size",
          { label: "Customer", key: "customer", sortable: true },
          { label: "Requested", key: "createdAt", sortable: true },
          // Open requests show their actions here, resolved ones their badge.
          { label: "Status", key: "status", sortable: true },
        ]}
        sortConfig={sortConfig}
        onSort={handleSort}
      >
        {!loading &&
          requests.map((request) => {
            const open = request.status === "open";
            return (
              <TableRow key={request._id}>
                <TableCell>
                  <p className="font-medium text-slate-900">
                    {request.origin.code} → {request.destination.code}
                  </p>
                  <p className="text-xs text-slate-500">{laneText(request)}</p>
                </TableCell>
                <TableCell className="max-w-48">
                  <p className="truncate" title={request.commodity.name}>
                    {request.commodity.name}
                  </p>
                  {request.note && (
                    <p
                      className="truncate text-xs text-slate-500 italic"
                      title={request.note}
                    >
                      “{request.note}”
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {request.containerSize ? (
                    request.containerSize
                  ) : (
                    <span className="text-slate-400">Any size</span>
                  )}
                </TableCell>
                <TableCell className="max-w-44">
                  <p className="truncate font-medium text-slate-800">
                    {request.customer.company || request.customer.name}
                  </p>
                  <p
                    className="truncate text-xs text-slate-500"
                    title={request.customer.email}
                  >
                    {request.customer.company
                      ? request.customer.name
                      : request.customer.email}
                  </p>
                </TableCell>
                <TableCell>
                  <p>{moment(request.createdAt).format("D MMM YYYY")}</p>
                  <p className="text-xs text-slate-500">
                    {moment(request.createdAt).fromNow()}
                  </p>
                </TableCell>
                <TableCell className="pr-3">
                  {!open && (
                    <>
                      <StatusBadge status={request.status} />
                      {request.resolvedAt && (
                        <p className="mt-1 text-xs text-slate-500">
                          {moment(request.resolvedAt).format("D MMM YYYY")}
                        </p>
                      )}
                    </>
                  )}
                  {open && (
                    <div className="-ml-2.5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onAddRate(request)}
                        className="text-brand hover:bg-brand/10 focus-visible:ring-brand/40 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-semibold transition-colors outline-none focus-visible:ring-2"
                      >
                        <Plus className="h-4 w-4" /> Add rate
                      </button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            aria-label={`More for the ${request.commodity.name} request`}
                            className="focus-visible:ring-brand/40 rounded-lg p-2 text-slate-400 transition-colors outline-none hover:bg-slate-100 hover:text-slate-700 focus-visible:ring-2 data-[state=open]:bg-slate-100 data-[state=open]:text-slate-700"
                          >
                            <MoreHorizontal className="h-[18px] w-[18px]" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onSelect={() => onResolve(request)}>
                            <CheckCheck className="h-4 w-4 text-slate-500" />{" "}
                            Mark resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
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

      {!loading && requests.length === 0 && (
        <div className="bg-white p-10 text-center text-slate-500">
          No requests match this search
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

export default RateRequestsTable;
