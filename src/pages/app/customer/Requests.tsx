import { Play, Plus, RotateCw, Ship, X } from "lucide-react";
import moment from "moment";
import { motion } from "motion/react";
import { stagger } from "../../../utils/motion";
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
import {
  DateCell,
  PriceCell,
  RouteCell,
  StackedCell,
} from "../../../components/app/TableCells";
import TableControls from "../../../components/app/TableControls";
import { useGetMyFreightRequests } from "../../../hooks/useFreightService";
import { useTableQuery } from "../../../hooks/useTableQuery";
import { containersLabel } from "../../../utils/format";

const CustomerRequests = () => {
  const navigate = useNavigate();
  const [playTutorial, setPlayTutorial] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  // Requests become bookings, so they need a verified business.

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
    filterKeys: ["status", "containerSize"],
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
          <Button icon={RotateCw} variant="outline" onClick={() => refetch()}>
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
            <motion.div {...stagger(0)}>
              <h1 className="text-2xl font-bold text-slate-900">
                My Freight Requests ({totalAll || 0})
              </h1>
              <p className="mt-1 text-slate-500">
                Manage and track your container freight inquiries.
              </p>
            </motion.div>

            <motion.div
              {...stagger(1)}
              className="flex flex-wrap items-center justify-end gap-2"
            >
              <Button
                icon={Plus}
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2"
              >
                New Request
              </Button>
              <Button
                icon={Play}
                onClick={() => setPlayTutorial(true)}
                className="flex items-center gap-2"
                variant="outline"
              >
                Watch Tutorial
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
        {...stagger(2)}
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
                  { value: "20ft Std", label: "20ft Standard" },
                  { value: "40ft Std", label: "40ft Standard" },
                  { value: "40ft HC", label: "40ft High Cube" },
                  { value: "45ft HC", label: "45ft High Cube" },
                ],
              },
            ]}
          />
        )}
        <Table
          headers={[
            { label: "Submitted", key: "createdAt", sortable: true },
            { label: "Route", key: "originPort", sortable: true },
            { label: "Cargo", key: "containerSize", sortable: true },
            { label: "Ready", key: "cargoReadyDate", sortable: true },
            { label: "Price", key: "proposedPrice", sortable: true },
            { label: "Status", key: "status", sortable: true },
          ]}
          sortConfig={sortConfig}
          onSort={handleSort}
        >
          {!isPending &&
            !isRefetching &&
            hasResults &&
            requests?.map((request: any) => (
              <TableRow
                key={request._id}
                onClick={() =>
                  navigate(`/app/customer/requests/${request._id}`)
                }
              >
                <TableCell>
                  <DateCell
                    date={request.createdAt}
                    secondary={moment(request.createdAt).fromNow()}
                  />
                </TableCell>
                <TableCell>
                  <RouteCell {...request} />
                </TableCell>
                <TableCell>
                  <StackedCell
                    primary={containersLabel(
                      request.containerQuantity,
                      request.containerSize,
                    )}
                    secondary={
                      <span className="capitalize">{request.commodity}</span>
                    }
                    title={request.commodity}
                  />
                </TableCell>
                <TableCell>
                  <DateCell date={request.cargoReadyDate} fallback="—" />
                </TableCell>
                <TableCell>
                  <PriceCell
                    proposed={request.proposedPrice}
                    counter={request.adminCounterPrice}
                    status={request.status}
                  />
                </TableCell>
                <TableCell>
                  <StatusBadge status={request.status} />
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
                icon={Plus}
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2"
              >
                Create Request
              </Button>
              <Button
                icon={Play}
                onClick={() => setPlayTutorial(true)}
                className="flex items-center gap-2"
                variant="outline"
              >
                Watch Tutorial
              </Button>
            </div>
          }
        />
      )}

      <Modal
        isOpen={isModalOpen}
        title="New freight request"
        size="lg"
        onClose={() => setIsModalOpen(false)}
      >
        <FreightRequestForm onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};

export default CustomerRequests;
