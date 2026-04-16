import { Play, Plus, Ship, X } from "lucide-react";
import moment from "moment";
import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import Modal from "../../../components/Modal";
import PlayTutorial from "../../../components/PlayTutorial";
import SmallLoader from "../../../components/SmallLoader";
import FreightRequestForm from "../../../components/app/FreightRequestForm";
import Pagination from "../../../components/app/Pagination";
import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import TableControls from "../../../components/app/TableControls";
import { useGetMyFreightRequests } from "../../../hooks/useFreightService";
import { useTableQuery } from "../../../hooks/useTableQuery";

const CustomerRequests = () => {
  const navigate = useNavigate();
  const [playTutorial, setPlayTutorial] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

  const { requests, isPending, error, refetch, isRefetching, total, totalAll } =
    useGetMyFreightRequests(params);

  const totalPages = Math.ceil(total / limit!);

  const hasAnyData = totalAll! > 0;
  const hasResults = requests.length > 0;

  if (error)
    return (
      <EmptyState
        icon={<X className="h-10 w-10 text-red-500" />}
        title="Error loading requests"
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
      <div className="max-medium-mobile:flex-col max-medium-mobile:items-start mb-8 flex items-center justify-between gap-4">
        {/* Freight Request Heading */}
        {hasAnyData || !hasResults ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-2xl font-bold text-slate-900">
                My Freight Requests ({totalAll || 0})
              </h1>
              <p className="mt-1 text-slate-500">
                Manage and track your container freight inquiries.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex flex-wrap items-center justify-end gap-2"
            >
              <Button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> New Request
              </Button>
              <Button
                onClick={() => setPlayTutorial(true)}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Play className="h-4 w-4" /> Watch Tutorial
              </Button>
            </motion.div>
          </>
        ) : null}
      </div>

      <PlayTutorial
        playTutorial={playTutorial}
        onCloseTutorial={() => setPlayTutorial(false)}
      />

      {/* Freight Request Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm"
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
                  { label: "Pending", value: "pending" },
                  { label: "Accepted", value: "accepted" },
                  { label: "Rejected", value: "rejected" },
                  { label: "Countered", value: "countered" },
                  { label: "Expired", value: "expired" },
                ],
              },
              {
                label: "Size",
                key: "containerSize",
                value: filters.containerSize || "",
                onChange: (val) => handleFilterChange("containerSize", val),
                options: [
                  { value: "20ft Std", label: "20' Standard" },
                  { value: "40ft Std", label: "40' Standard" },
                  { value: "40ft HC", label: "40' High Cube" },
                  { value: "45ft HC", label: "45' High Cube" },
                ],
              },
            ]}
          />
        )}
        <Table
          headers={[
            "S/N",
            { label: "Container", key: "containerSize", sortable: true },
            { label: "Origin", key: "originPort", sortable: true },
            { label: "Destination", key: "destinationPort", sortable: true },
            { label: "Price", key: "price", sortable: true },
            { label: "Status", key: "status", sortable: true },
            { label: "Commodity", key: "commodity", sortable: true },
            { label: "Ready Date", key: "cargoReadyDate", sortable: true },
          ]}
          sortConfig={sortConfig}
          onSort={handleSort}
        >
          {!isPending &&
            !isRefetching &&
            hasResults &&
            requests?.map((request: any, index: number) => (
              <TableRow
                key={request._id}
                onClick={() =>
                  navigate(`/app/customer/requests/${request._id}`)
                }
              >
                <TableCell>{(index + 1).toString().padStart(2, "0")}</TableCell>
                <TableCell className="font-medium">
                  {request.containerSize.toUpperCase()}
                </TableCell>
                <TableCell className="capitalize">
                  {request.originPort}
                </TableCell>
                <TableCell className="capitalize">
                  {request.destinationPort}
                </TableCell>
                <TableCell>${request.proposedPrice.toLocaleString()}</TableCell>
                <TableCell>
                  <StatusBadge status={request.status} />
                </TableCell>
                <TableCell>{request.commodity}</TableCell>
                <TableCell>
                  {moment(request.cargoReadyDate).format("LL")}
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

      {/* Freight Request EmptyState */}
      {!hasAnyData && !isPending && (
        <EmptyState
          icon={<Ship className="text-brand h-10 w-10" />}
          title="No Freight Requests Yet"
          description="You have not created any freight requests. Start by submitting your first request to receive shipping quotes."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create Request
              </Button>
              <Button
                onClick={() => setPlayTutorial(true)}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Play className="h-4 w-4" /> Watch Tutorial
              </Button>
            </div>
          }
        />
      )}

      <Modal
        isOpen={isModalOpen}
        title="Create Freight Request"
        onClose={() => setIsModalOpen(false)}
      >
        <FreightRequestForm onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};

export default CustomerRequests;
