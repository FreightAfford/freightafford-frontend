import { Ship, X } from "lucide-react";
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
import { useGetAllUsers } from "../../../hooks/useAuthService";
import { useTableQuery } from "../../../hooks/useTableQuery";

const AdminUsers = () => {
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
  });

  const { users, isPending, error, refetch, isRefetching, total, totalAll } =
    useGetAllUsers(params);

  const totalPages = Math.ceil(total / limit!);

  const hasAnyData = totalAll > 0;
  const hasResults = users.length > 0;

  if (error)
    return (
      <EmptyState
        icon={<X className="h-10 w-10 text-red-500" />}
        title="Error loading users"
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
            User Management ({totalAll || 0})
          </h1>
          <p className="mt-1 text-slate-500">
            Manage system users and their permissions.
          </p>
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
                label: "Role",
                key: "role",
                value: filters.role || "",
                onChange: (val) => handleFilterChange("role", val),
                options: [
                  { label: "Admin", value: "admin" },
                  { label: "Customer", value: "customer" },
                  { label: "CSO", value: "customer_service" },
                ],
              },
            ]}
          />
        )}

        <Table
          headers={[
            "S/N",
            { label: "Name", key: "fullname", sortable: true },
            { label: "Email", key: "email", sortable: true },
            { label: "Role", key: "role", sortable: true },
            { label: "Company", key: "companyName", sortable: true },
            { label: "Status", key: "isEmailVerified", sortable: true },
            { label: "Joined Date", key: "createdAt", sortable: true },
          ]}
          sortConfig={sortConfig}
          onSort={handleSort}
        >
          {!isPending &&
            !isRefetching &&
            hasResults &&
            users?.map((user: any, index: number) => (
              <TableRow
                key={user._id}
                onClick={() => navigate(`/app/admin/users/${user._id}`)}
              >
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
          title="No Users Yet"
          description="You don't have any users / customers registered on FreightAfford."
        />
      )}
    </>
  );
};
export default AdminUsers;
