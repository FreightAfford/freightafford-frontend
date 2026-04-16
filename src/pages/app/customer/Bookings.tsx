import { Plus, Ship, X } from "lucide-react";
import moment from "moment";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import Pagination from "../../../components/app/Pagination";
import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import TableControls from "../../../components/app/TableControls";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import SmallLoader from "../../../components/SmallLoader";
import { useGetMyBookings } from "../../../hooks/useBookingService";
import { useTableQuery } from "../../../hooks/useTableQuery";
const CustomerBookings = () => {
  const navigate = useNavigate();

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
  });

  const { bookings, isPending, error, refetch, isRefetching, total, totalAll } =
    useGetMyBookings(params);

  const totalPages = Math.ceil(total / limit!);

  const hasAnyData = totalAll > 0;
  const hasResults = bookings.length > 0;

  if (error)
    return (
      <EmptyState
        icon={<X className="h-10 w-10 text-red-500" />}
        title="Error loading bookings"
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
          <>
            <h1 className="text-2xl font-bold text-slate-900">
              My Bookings ({totalAll || 0})
            </h1>
            <p className="mt-1 text-slate-500">
              Track your confirmed shipments and their status.
            </p>
          </>
        </motion.div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
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
                  { label: "Pending", value: "awaiting_confirmation" },
                  { label: "Confirmed", value: "confirmed" },
                  { label: "In Transit", value: "in_transit" },
                  { label: "Arrived", value: "arrived" },
                  { label: "Delivered", value: "delivered" },
                  { label: "Cancelled", value: "cancelled" },
                ],
              },
            ]}
          />
        )}

        <Table
          headers={[
            "S/N",
            { label: "Booking #", key: "bookingNumber", sortable: true },
            { label: "Date Created", key: "createdAt", sortable: true },
            { label: "Sailing Date", key: "sailingDate", sortable: true },
            { label: "Status", key: "status", sortable: true },
            { label: "Shipping Line", key: "shippingLine", sortable: true },
            "Commodity",
            "Request",
          ]}
          sortConfig={sortConfig}
          onSort={handleSort}
        >
          {!isPending &&
            !isRefetching &&
            hasResults &&
            bookings?.map((booking: any, index: number) => (
              <TableRow
                key={booking._id}
                onClick={() =>
                  navigate(`/app/customer/bookings/${booking._id}`)
                }
              >
                <TableCell>{(index + 1).toString().padStart(2, "0")}</TableCell>
                <TableCell className="text-brand font-medium">
                  {booking.bookingNumber}
                </TableCell>
                <TableCell>{moment(booking.createdAt).format("ll")}</TableCell>
                <TableCell>
                  {booking.sailingDate ? (
                    moment(booking.sailingDate).format("ll")
                  ) : (
                    <span className="italic">TBA</span>
                  )}
                </TableCell>
                <TableCell>
                  <StatusBadge
                    status={
                      booking.status === "awaiting_confirmation"
                        ? "pending"
                        : booking.status
                    }
                  />
                </TableCell>
                <TableCell>
                  {booking.shippingLine || <span className="italic">TBA</span>}
                </TableCell>
                <TableCell className="capitalize">
                  {booking.freightRequest.commodity}
                </TableCell>
                <TableCell>
                  <StatusBadge status={booking.freightRequest.status} />
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
          title="No Available Bookings Yet"
          description="You don't have any bookings made on Freight Afford. Yet to receive shipping quotes through Freight Requests."
          action={
            <Button
              onClick={() => navigate("/app/customer/requests")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Request
            </Button>
          }
        />
      )}
    </>
  );
};
export default CustomerBookings;
