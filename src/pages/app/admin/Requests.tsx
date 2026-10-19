import { Check, Ship, X } from "lucide-react";
import moment from "moment";
import { motion } from "motion/react";
import { stagger } from "../../../utils/motion";
import { useNavigate, useSearchParams } from "react-router";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import ErrorState from "../../../components/ErrorState";
import SmallLoader from "../../../components/SmallLoader";
import Pagination from "../../../components/app/Pagination";
import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import {
  DateCell,
  PriceCell,
  RouteCell,
  StackedCell,
} from "../../../components/app/TableCells";
import TableControls from "../../../components/app/TableControls";
import { useConfirm } from "../../../hooks/useConfirm";
import {
  useAcceptFreightRequestBatch,
  useGetAllFreightRequests,
} from "../../../hooks/useFreightService";
import { useTableQuery } from "../../../hooks/useTableQuery";
import { containersLabel } from "../../../utils/format";

const AdminRequests = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const batchId = searchParams.get("batchId");
  // Drop only the batch, keeping the table's search/filter/sort/page in the URL
  const clearBatch = () =>
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("batchId");
        return next;
      },
      { replace: true },
    );
  const { confirm, ConfirmDialog } = useConfirm();
  const {
    page,
    limit,
    searchInput,
    sortConfig,
    filters,
    params,
    setPage,
    handleSearchChange,
    resetSearch,
    handleSort,
    handleFilterChange,
    handleSearchSubmit,
  } = useTableQuery({
    initialSortKey: "createdAt",
    initialSortDirection: "desc",
    initialLimit: 10,
    filterKeys: ["status", "containerSize"],
  });

  const { requests, total, totalAll, isPending, error, refetch, isRefetching } =
    useGetAllFreightRequests(batchId ? { batchId } : params);
  const { acceptBatch, isPending: isAccepting } =
    useAcceptFreightRequestBatch();

  const totalPages = Math.ceil(total / limit!);

  const hasAnyData = totalAll > 0;
  const hasResults = requests.length > 0;

  if (error)
    return (
      <ErrorState resource="requests" error={error} onRetry={() => refetch()} />
    );

  return (
    <>
      {ConfirmDialog}
      {hasAnyData || hasResults ? (
        <motion.div {...stagger(0)} className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Freight Requests ({totalAll || 0})
          </h1>
          <p className="mt-1 text-slate-500">
            Review and respond to customer freight inquiries.
          </p>
        </motion.div>
      ) : null}
      {batchId && (
        <div className="mb-4 flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <span className="text-sm text-amber-800">
            Showing {requests.length} request{requests.length !== 1 ? "s" : ""}{" "}
            from this batch
          </span>
          <div className="flex items-center gap-3">
            <Button
              icon={Check}
              size="sm"
              onClick={async () => {
                const ok = await confirm({
                  title: "Accept entire batch?",
                  message: `This will accept all pending requests in this batch (${requests.length} total).`,
                  confirmText: "Yes, Accept All",
                  cancelText: "Cancel",
                  variant: "primary",
                });
                if (ok)
                  acceptBatch(batchId, {
                    onSuccess: clearBatch,
                  });
              }}
              isLoading={isAccepting}
            >
              Accept All
            </Button>
            <button
              onClick={clearBatch}
              className="inline-flex items-center gap-1 text-sm font-medium text-amber-700 hover:underline"
            >
              <X className="h-4 w-4" />
              Clear filter
            </button>
          </div>
        </div>
      )}
      <motion.div
        {...stagger(1)}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        {totalAll >= 10 && (
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
                  { label: "Pending", value: "pending" },
                  { label: "Accepted", value: "accepted" },
                  { label: "Rejected", value: "rejected" },
                  { label: "Countered", value: "countered" },
                  { label: "Expired", value: "expired" },
                ],
              },
              {
                label: "Size",
                key: "containerSize",
                value: filters.containerSize || "",
                onChange: (val) => handleFilterChange("containerSize", val),
                options: [
                  { value: "20ft Std", label: "20ft Standard" },
                  { value: "40ft Std", label: "40ft Standard" },
                  { value: "40ft HC", label: "40ft High Cube" },
                  { value: "45ft HC", label: "45ft High Cube" },
                ],
              },
            ]}
          />
        )}
        <Table
          headers={[
            { label: "Submitted", key: "createdAt", sortable: true },
            { label: "Customer", key: "customerName", sortable: true },
            { label: "Route", key: "originPort", sortable: true },
            { label: "Cargo", key: "containerSize", sortable: true },
            { label: "Ready", key: "cargoReadyDate", sortable: true },
            { label: "Price", key: "proposedPrice", sortable: true },
            { label: "Status", key: "status", sortable: true },
          ]}
          sortConfig={sortConfig}
          onSort={handleSort}
        >
          {!isPending &&
            !isRefetching &&
            hasResults &&
            requests?.map((request: any) => {
              const customer =
                request.customer?.companyName ||
                request.customer?.fullname ||
                request.customerName;

              return (
                <TableRow
                  key={request._id}
                  onClick={() => navigate(`/app/admin/requests/${request._id}`)}
                >
                  <TableCell>
                    <DateCell
                      date={request.createdAt}
                      secondary={moment(request.createdAt).fromNow()}
                    />
                  </TableCell>
                  <TableCell>
                    <StackedCell
                      primary={customer}
                      secondary={request.customerEmail}
                      primaryClassName="capitalize"
                      title={`${customer} · ${request.customerEmail}`}
                    />
                  </TableCell>
                  <TableCell>
                    <RouteCell {...request} />
                  </TableCell>
                  <TableCell>
                    <StackedCell
                      primary={containersLabel(
                        request.containerQuantity,
                        request.containerSize,
                      )}
                      secondary={
                        <span className="capitalize">{request.commodity}</span>
                      }
                      title={request.commodity}
                    />
                  </TableCell>
                  <TableCell>
                    <DateCell date={request.cargoReadyDate} fallback="—" />
                  </TableCell>
                  <TableCell>
                    <PriceCell
                      proposed={request.proposedPrice}
                      counter={request.adminCounterPrice}
                      status={request.status}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <StatusBadge status={request.status} />
                      {request.batchId && (
                        <span
                          className="bg-mist text-harbour rounded-md px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase"
                          title={`Part of a batch of ${request.batchSize ?? "several"} requests`}
                        >
                          Batch
                        </span>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
        </Table>

        {(isPending || isRefetching) && (
          <div className="bg-white p-10">
            <div className="flex items-center justify-center gap-2 text-slate-500">
              <SmallLoader /> {isPending ? "Loading..." : "Refreshing..."}
            </div>
          </div>
        )}

        {!hasResults && !isPending && !isRefetching && (
          <div className="bg-white p-10 text-center text-slate-500">
            No results found
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </motion.div>

      {!hasAnyData && !isPending && (
        <EmptyState
          icon={<Ship className="text-brand h-10 w-10" />}
          title="No Freight Requests Yet"
          description="You don't have any customer freight request made on Freightafford. Yet to receive shipping quotes through Freight Requests."
        />
      )}
    </>
  );
};
export default AdminRequests;
