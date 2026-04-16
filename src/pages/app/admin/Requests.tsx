import { Ship, X } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import SmallLoader from "../../../components/SmallLoader";
import Pagination from "../../../components/app/Pagination";
import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import TableControls from "../../../components/app/TableControls";
import { useGetAllFreightRequests } from "../../../hooks/useFreightService";
import { useTableQuery } from "../../../hooks/useTableQuery";

const AdminRequests = () => {
  const navigate = useNavigate();
  const {
    page,
    limit,
    searchInput,
    sortConfig,
    filters,
    params,
    setPage,
    handleSearchChange, resetSearch,
    handleSort,
    handleFilterChange,
    handleSearchSubmit,
  } = useTableQuery({
    initialSortKey: "createdAt",
    initialSortDirection: "desc",
    initialLimit: 10,
  });

  const { requests, total, totalAll, isPending, error, refetch, isRefetching } =
    useGetAllFreightRequests(params);

  const totalPages = Math.ceil(total / limit!);

  const hasAnyData = totalAll > 0;
  const hasResults = requests.length > 0;

  if (error)
    return (
      <EmptyState
        icon={<X className="h-10 w-10 text-red-500" />}
        title="Error loading requests"
        description={error.message || "An unexpected error has occured."}
        action={
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        }
      />
    );

  return (
    <>
      {hasAnyData || !hasResults ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-slate-900">
            Freight Requests ({totalAll || 0})
          </h1>
          <p className="mt-1 text-slate-500">
            Review and respond to customer freight inquiries.
          </p>
        </motion.div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm"
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
                  { value: "20ft Std", label: "20' Standard" },
                  { value: "40ft Std", label: "40' Standard" },
                  { value: "40ft HC", label: "40' High Cube" },
                  { value: "45ft HC", label: "45' High Cube" },
                ],
              },
            ]}
          />
        )}
        <Table
          headers={[
            "S/N",
            { label: "Customer", key: "customerName", sortable: true },
            { label: "Container", key: "containerSize", sortable: true },
            { label: "Origin", key: "originPort", sortable: true },
            { label: "Destination", key: "destinationPort", sortable: true },
            { label: "Price", key: "price", sortable: true },
            { label: "Status", key: "status", sortable: true },
          ]}
          sortConfig={sortConfig}
          onSort={handleSort}
        >
          {!isPending &&
            !isRefetching &&
            hasResults &&
            requests?.map((request: any, index: number) => (
              <TableRow
                key={request._id}
                onClick={() => navigate(`/app/admin/requests/${request._id}`)}
              >
                <TableCell>{(index + 1).toString().padStart(2, "0")}</TableCell>
                <TableCell className="text-brand hover:text-brand/80 max-w-37.5 truncate font-medium capitalize">
                  {request.customer.companyName || request.customer.fullname}
                </TableCell>
                <TableCell className="uppercase">
                  {request.containerSize}
                </TableCell>
                <TableCell className="capitalize">
                  {request.originPort}
                </TableCell>
                <TableCell className="capitalize">
                  {request.destinationPort}
                </TableCell>
                <TableCell>${request.proposedPrice.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <StatusBadge status={request.status} />
                    {request.notes && (
                      <span
                        className="max-w-37.5 truncate text-[10px] text-slate-400"
                        title={request.notes}
                      >
                        Note: {request.notes}
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
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
          description="You don't have any customer freight request made on Freight Afford. Yet to receive shipping quotes through Freight Requests."
        />
      )}
    </>
  );
};
export default AdminRequests;
