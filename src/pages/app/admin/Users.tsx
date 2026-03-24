import { AlertCircle, Ship } from "lucide-react";
import moment from "moment";
import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import EmptyState from "../../../components/EmptyState";
import SmallLoader from "../../../components/SmallLoader";
import { useGetAllUsers } from "../../../hooks/useAuthService";

const AdminUsers = () => {
  const { users, isPending, error } = useGetAllUsers();

  if (isPending) return <SmallLoader />;

  if (error) return;
  <EmptyState
    icon={<AlertCircle className="h-10 w-10 text-red-500" />}
    title="An Error Occured"
    description="This may be due to server error or users don't exist."
  />;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
        <p className="mt-1 text-slate-500">
          Manage system users and their permissions.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        {users && (
          <Table
            headers={[
              "S/N",
              "Name",
              "Email",
              "Role",
              "Company",
              "Status",
              "Joined Date",
            ]}
          >
            {users.map((user: any, index: number) => (
              <TableRow key={user._id}>
                <TableCell>{(index + 1).toString().padStart(2, "0")}</TableCell>
                <TableCell className="text-brand font-medium capitalize">
                  {user.fullname}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell className="uppercase italic">{user.role}</TableCell>
                <TableCell>{user.companyName || "N/A"}</TableCell>
                <TableCell>
                  {user.isEmailVerified ? (
                    <StatusBadge status="verified" />
                  ) : (
                    <StatusBadge status="not_verified" />
                  )}
                </TableCell>
                <TableCell>{moment(user.createdAt).format("ll")}</TableCell>
              </TableRow>
            ))}
          </Table>
        )}
      </div>
      {!users?.length && (
        <EmptyState
          icon={<Ship className="text-brand h-10 w-10" />}
          title="No Users Yet"
          description="You don't have any users / customers registered on FreightAfford."
        />
      )}
    </>
  );
};
export default AdminUsers;
