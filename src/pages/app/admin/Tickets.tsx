import { CircleDot, Clock, Mail, Ship, X } from "lucide-react";
import moment from "moment";
import { motion } from "motion/react";
import { useNavigate } from "react-router";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import SmallLoader from "../../../components/SmallLoader";
import Pagination from "../../../components/app/Pagination";
import StatsCard from "../../../components/app/StatsCard";
import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import TableControls from "../../../components/app/TableControls";
import { useTableQuery } from "../../../hooks/useTableQuery";
import { useGetAllTickets } from "../../../hooks/useTicketService";

const Tickets = () => {
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

  const { tickets, error, isPending, isRefetching, refetch, total, totalAll } =
    useGetAllTickets(params);

  const totalPages = Math.ceil(total / limit!);

  const hasAnyData = totalAll > 0;
  const hasResults = tickets.length > 0;

  const pendingReview = tickets.filter(
    (ticket: any) => ticket.status === "pending",
  ).length;

  const openThreads = tickets.filter(
    (ticket: any) => ticket.status === "open",
  ).length;

  if (error)
    return (
      <EmptyState
        icon={<X className="h-10 w-10 text-red-500" />}
        title="Error loading tickets"
        description={error.message || "An unexpected error has occured."}
        action={
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        }
      />
    );

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <>
          <h1 className="text-2xl font-bold text-slate-900">
            Support Management
          </h1>
          <p className="mt-1 text-slate-500">
            Manage and resolve global logistics support requests.
          </p>
        </>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="grid grid-cols-3 gap-6"
      >
        <StatsCard title="Total Tickets" value={totalAll || 0} icon={Mail} />
        <StatsCard
          title="Pending Review"
          value={pendingReview || 0}
          icon={Clock}
        />
        <StatsCard
          title="Open Threads"
          value={openThreads || 0}
          icon={CircleDot}
        />
      </motion.div>

      {/* Table/List View */}
      {hasAnyData && (
        <motion.div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
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
                    { label: "Open", value: "open" },
                    { label: "Pending", value: "pending" },
                    { label: "Resolved", value: "resolved" },
                    { label: "Closed", value: "closed" },
                  ],
                },
              ]}
            />
          )}
          <Table
            headers={[
              "S/N",
              { label: "ID", key: "ticket_id", sortable: true },
              { label: "Subject", key: "subject", sortable: true },
              { label: "Assigned", key: "assigned_to", sortable: true },
              { label: "Status", key: "status", sortable: true },
              {
                label: "Last Activity",
                key: "last_message_at",
                sortable: true,
              },
            ]}
            sortConfig={sortConfig}
            onSort={handleSort}
          >
            {!isPending &&
              !isRefetching &&
              hasResults &&
              tickets?.map((ticket: any, index: number) => (
                <TableRow
                  key={ticket._id}
                  onClick={() => navigate(`/app/admin/tickets/${ticket._id}`)}
                >
                  <TableCell>
                    {(index + 1).toString().padStart(2, "0")}
                  </TableCell>
                  <TableCell className="text-brand font-medium">
                    {ticket.ticket_id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="group-hover:text-brand line-clamp-1 font-semibold text-slate-900 transition-colors">
                        {ticket.subject}
                      </span>
                      <span className="line-clamp-1 text-sm text-slate-400">
                        {ticket.customer_email}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize">
                    {ticket.assigned_to.fullname}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={ticket.status} />
                  </TableCell>
                  <TableCell>
                    {moment(ticket.last_message_at).format("ll")}
                  </TableCell>
                </TableRow>
              ))}
          </Table>

          {(isPending || isRefetching) && (
            <div className="bg-white p-10">
              <div className="flex items-center justify-center gap-2 text-slate-500">
                <SmallLoader /> {isPending ? "Loading..." : "Refreshing"}
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
      )}

      {!hasAnyData && !isPending && (
        <EmptyState
          icon={<Ship className="text-brand h-10 w-10" />}
          title="No Tickets Yet"
          description="There are no support tickets generated yet!"
        />
      )}
    </div>
  );
};

export default Tickets;
