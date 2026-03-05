import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";

const AdminBookings = () => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">
          Bookings Management
        </h1>
        <p className="mt-1 text-slate-500">
          Monitor and manage all confirmed shipments.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <Table
          headers={[
            "Booking #",
            "Customer",
            "Sailing Date",
            "Shipping Line",
            "Status",
            "Vessel",
          ]}
        >
          <TableRow>
            <TableCell className="text-brand font-medium">FA-98210</TableCell>
            <TableCell>Global Trade Co.</TableCell>
            <TableCell>Oct 24, 2023</TableCell>
            <TableCell>Maersk</TableCell>
            <TableCell>
              <StatusBadge status="active" />
            </TableCell>
            <TableCell>MAERSK SEOUL</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="text-brand font-medium">FA-98215</TableCell>
            <TableCell>Pacific Logistics</TableCell>
            <TableCell>Oct 28, 2023</TableCell>
            <TableCell>CMA</TableCell>
            <TableCell>
              <StatusBadge status="pending" />
            </TableCell>
            <TableCell>CMA CGM</TableCell>
          </TableRow>
        </Table>
      </div>
    </>
  );
};
export default AdminBookings;
