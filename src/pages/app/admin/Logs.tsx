import { Table, TableCell, TableRow } from "../../../components/app/Table";

const AdminLogs = () => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
        <p className="mt-1 text-slate-500">
          Track all system activities and changes.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <Table
          headers={["Timestamp", "User", "Action", "Module", "Ip Address"]}
        >
          <TableRow>
            <TableCell className="font-medium">2023-10-24 14:22:10</TableCell>
            <TableCell>Frank Okoro</TableCell>
            <TableCell>Approved Booking FA-98210</TableCell>
            <TableCell>Bookings</TableCell>
            <TableCell>192.168.1.1</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">2023-10-24 14:15:05</TableCell>
            <TableCell>John Doe</TableCell>
            <TableCell>Created New Request</TableCell>
            <TableCell>Requests</TableCell>
            <TableCell>192.168.1.45</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">2023-10-24 13:45:30</TableCell>
            <TableCell>System</TableCell>
            <TableCell>Generated Invoice INV-2023-001</TableCell>
            <TableCell>Invoices</TableCell>
            <TableCell>{null}</TableCell>
          </TableRow>
        </Table>
      </div>
    </>
  );
};
export default AdminLogs;
