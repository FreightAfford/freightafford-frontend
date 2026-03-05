import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";

const AdminUsers = () => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="mt-1 text-slate-500">
          Manage system users and their permissions.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <Table
          headers={[
            "Name",
            "Email",
            "Role",
            "Company",
            "Status",
            "Joined Date",
          ]}
        >
          <TableRow>
            <TableCell className="text-brand font-medium">John Doe</TableCell>
            <TableCell>john@example.com</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Global Trade Co.</TableCell>
            <TableCell>
              <StatusBadge status="active" />
            </TableCell>
            <TableCell>Oct 10, 2023</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="text-brand font-medium">Jane Smith</TableCell>
            <TableCell>jane@example.com</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Jane Logistics</TableCell>
            <TableCell>
              <StatusBadge status="active" />
            </TableCell>
            <TableCell>Oct 12, 2023</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="text-brand font-medium">
              Franklin Okoro
            </TableCell>
            <TableCell>frank@example.com</TableCell>
            <TableCell>Customer</TableCell>
            <TableCell>Consumer Details Ltd.</TableCell>
            <TableCell>
              <StatusBadge status="active" />
            </TableCell>
            <TableCell>Oct 14, 2023</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="text-brand font-medium">Ewebal Ceo</TableCell>
            <TableCell>admin@freightafford.com</TableCell>
            <TableCell>Admin</TableCell>
            <TableCell>FreightAfford Logistics</TableCell>
            <TableCell>
              <StatusBadge status="active" />
            </TableCell>
            <TableCell>Oct 01, 2023</TableCell>
          </TableRow>
        </Table>
      </div>
    </>
  );
};
export default AdminUsers;
