import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";

const CustomerBookings = () => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
        <p className="mt-1 text-slate-500">
          Track your confirmed shipments and their status.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <Table
          headers={[
            "Booking Number",
            "Sailing Date",
            "Status",
            "Shipping Line",
            "Vessel",
          ]}
        >
          <TableRow>
            <TableCell className="text-brand font-medium">FA-98210</TableCell>
            <TableCell>Oct 24, 2023</TableCell>
            <TableCell>
              <StatusBadge status="active" />
            </TableCell>
            <TableCell>Maersk</TableCell>
            <TableCell>MAERSK SEOUL</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="text-brand font-medium">FA-98220</TableCell>
            <TableCell>Nov 02, 2023</TableCell>
            <TableCell>
              <StatusBadge status="active" />
            </TableCell>
            <TableCell>CMA CGM</TableCell>
            <TableCell>CMA CGM MARCO POLO</TableCell>
          </TableRow>
        </Table>
      </div>
    </>
  );
};
export default CustomerBookings;
