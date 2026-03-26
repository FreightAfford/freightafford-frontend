import { Eye, Ship } from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router";
import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import SmallLoader from "../../../components/SmallLoader";
import { useGetAllBookings } from "../../../hooks/useBookingService";

const AdminBookings = () => {
  const navigate = useNavigate();
  const { bookings, isPending, error } = useGetAllBookings();
  if (isPending) return <SmallLoader />;
  console.log(error?.message);
  return (
    <>
      <div className="mb-8">
        {bookings.length ? (
          <>
            <h1 className="text-2xl font-bold text-slate-900">
              Bookings Management ({bookings.length || 0})
            </h1>
            <p className="mt-1 text-slate-500">
              Monitor and manage all confirmed shipments.
            </p>
          </>
        ) : null}
      </div>

      {bookings.length ? (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <Table
            headers={[
              "S/N",
              "Booking #",
              "Date Created",
              "Status",
              "Container",
              "Commodity",
              "Request",
            ]}
          >
            {bookings?.map((booking: any, index: number) => (
              <TableRow
                key={booking._id}
                onClick={() => navigate(`/app/admin/bookings/${booking._id}`)}
              >
                <TableCell>{(index + 1).toString().padStart(2, "0")}</TableCell>
                <TableCell className="text-brand font-medium">
                  {booking.bookingNumber}
                </TableCell>
                <TableCell>{moment(booking.createdAt).format("ll")}</TableCell>
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
                  {booking.freightRequest.containerSize.toUpperCase()}
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
        </div>
      ) : null}

      {!bookings?.length && (
        <EmptyState
          icon={<Ship className="text-brand h-10 w-10" />}
          title="No Available Bookings Yet"
          description="You don't have any bookings made on Freight Afford. Yet to receive shipping quotes through Freight Requests."
          action={
            <Button
              className="flex items-center gap-2"
              onClick={() => navigate("/app/admin/requests")}
            >
              <Eye className="h-6 w-6" />
              Freight Requests
            </Button>
          }
        />
      )}
    </>
  );
};
export default AdminBookings;
