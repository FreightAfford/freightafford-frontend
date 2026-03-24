import { Plus, Ship } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import Modal from "../../../components/Modal";
import SmallLoader from "../../../components/SmallLoader";
import FreightRequestForm from "../../../components/app/FreightRequestForm";
import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import { useGetMyFreightRequests } from "../../../hooks/useFreightService";
import { useNavigate } from "react-router";

const CustomerRequests = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const { requests, isPending } = useGetMyFreightRequests();

  if (isPending) return <SmallLoader />;

  return (
    <>
      <div className="max-medium-mobile:flex-col max-medium-mobile:items-start mb-8 flex items-center justify-between gap-4">
        {/* Freight Request Heading */}
        {requests.length ? (
          <>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                My Freight Requests ({requests.length || 0})
              </h1>
              <p className="mt-1 text-slate-500">
                Manage and track your container freight inquiries.
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> New Request
            </Button>
          </>
        ) : null}
      </div>

      {/* Freight Request Table */}
      {requests.length ? (
        <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
          <Table
            headers={[
              "S/N",
              "Container",
              "Origin",
              "Destination",
              "Price",
              "Status",
              "Commodity",
              "Ready Date",
            ]}
          >
            {requests?.map((request: any, index: number) => (
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
                <TableCell>{request.originPort}</TableCell>
                <TableCell>{request.destinationPort}</TableCell>
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
        </div>
      ) : null}

      {/* Freight Request EmptyState */}
      {!requests.length && (
        <EmptyState
          icon={<Ship className="text-brand h-10 w-10" />}
          title="No Freight Requests Yet"
          description="You have not created any freight requests. Start by submitting your first request to receive shipping quotes."
          action={
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Request
            </Button>
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
