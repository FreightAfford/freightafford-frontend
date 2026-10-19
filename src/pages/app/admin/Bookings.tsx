import { Eye, Ship } from "lucide-react";
import { motion } from "motion/react";
import { stagger } from "../../../utils/motion";
import { useNavigate } from "react-router";
import Pagination from "../../../components/app/Pagination";
import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import {
  BookingCargoCell,
  BookingRefCell,
  CarrierCell,
  RouteCell,
  SailingCell,
  StackedCell,
} from "../../../components/app/TableCells";
import TableControls from "../../../components/app/TableControls";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import ErrorState from "../../../components/ErrorState";
import SmallLoader from "../../../components/SmallLoader";
import { useGetAllBookings } from "../../../hooks/useBookingService";
import { useTableQuery } from "../../../hooks/useTableQuery";

const AdminBookings = () => {
  const navigate = useNavigate();

  const {
    page,
    limit,
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
    initialLimit: 10,
    filterKeys: ["status"],
  });
  const { bookings, isPending, error, refetch, isRefetching, total, totalAll } =
    useGetAllBookings(params);

  const totalPages = Math.ceil(total / limit!);

  const hasAnyData = totalAll > 0;
  const hasResults = bookings.length > 0;

  if (error)
    return (
      <ErrorState resource="bookings" error={error} onRetry={() => refetch()} />
    );

  return (
    <>
      {hasAnyData || !hasResults ? (
        <motion.div {...stagger(0)} className="mb-8">
          <>
            <h1 className="text-2xl font-bold text-slate-900">
              Bookings Management ({totalAll || 0})
            </h1>
            <p className="mt-1 text-slate-500">
              Monitor and manage all confirmed shipments.
            </p>
          </>
        </motion.div>
      ) : null}

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
            { label: "Booking", key: "bookingNumber", sortable: true },
            { label: "Customer", key: "customerName", sortable: true },
            "Route",
            "Cargo",
            { label: "Carrier", key: "shippingLine", sortable: true },
            { label: "Sailing / ETA", key: "sailingDate", sortable: true },
            { label: "Status", key: "status", sortable: true },
          ]}
          sortConfig={sortConfig}
          onSort={handleSort}
        >
          {!isPending &&
            !isRefetching &&
            hasResults &&
            bookings?.map((booking: any) => {
              const customer =
                booking.customer?.companyName ||
                booking.customer?.fullname ||
                booking.customerName;

              return (
                <TableRow
                  key={booking._id}
                  onClick={() => navigate(`/app/admin/bookings/${booking._id}`)}
                >
                  <TableCell>
                    <BookingRefCell booking={booking} />
                  </TableCell>
                  <TableCell>
                    <StackedCell
                      primary={customer}
                      secondary={booking.customerEmail}
                      primaryClassName="capitalize"
                      title={`${customer} · ${booking.customerEmail}`}
                    />
                  </TableCell>
                  <TableCell>
                    <RouteCell {...booking.freightRequest} />
                  </TableCell>
                  <TableCell>
                    <BookingCargoCell booking={booking} />
                  </TableCell>
                  <TableCell>
                    <CarrierCell booking={booking} />
                  </TableCell>
                  <TableCell>
                    <SailingCell booking={booking} />
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
          title="No Available Bookings Yet"
          description="You don't have any bookings made on Freightafford. Yet to receive shipping quotes through Freight Requests."
          action={
            <Button
              icon={Eye}
              className="flex items-center gap-2"
              onClick={() => navigate("/app/admin/requests")}
            >
              Freight Requests
            </Button>
          }
        />
      )}
    </>
  );
};
export default AdminBookings;
