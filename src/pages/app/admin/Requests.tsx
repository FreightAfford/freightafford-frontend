import { AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import StatusBadge from "../../../components/app/StatusBadge";
import { useState } from "react";
import Modal from "../../../components/Modal";
import CounterOfferForm from "../../../components/app/CounterOfferForm";
import RejectRequestForm from "../../../components/app/RejectRequestForm";

interface FreightRequest {
  id: string;
  customer: string;
  container: string;
  route: string;
  price: number;
  status: string;
  reason?: string;
}

const INITIAL_REQUESTS: FreightRequest[] = [
  {
    id: "1",
    customer: "Global Trade Co.",
    container: "40ft HC",
    route: "SHA → LAX",
    price: 2450,
    status: "pending",
  },
  {
    id: "2",
    customer: "Pacific Logistics",
    container: "20ft Std",
    route: "NGB → RTM",
    price: 1850,
    status: "countered",
    reason: "Market rates have increased for this route.",
  },
  {
    id: "3",
    customer: "EuroCargo Ltd",
    container: "40ft Std",
    route: "HCM → HAM",
    price: 3100,
    status: "pending",
  },
];

const AdminRequests = () => {
  const [isCounterModalOpen, setIsCounterModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Freight Requests</h1>
        <p className="mt-1 text-slate-500">
          Review and respond to customer freight inquiries.
        </p>
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
        <Table
          headers={[
            "Customer",
            "Container",
            "Route",
            "Price",
            "Status",
            "Date",
            "Actions",
          ]}
        >
          {INITIAL_REQUESTS.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.customer}</TableCell>
              <TableCell>{request.container}</TableCell>
              <TableCell>{request.route}</TableCell>
              <TableCell>${request.price.toLocaleString()}</TableCell>
              <TableCell>
                <div className="flex flex-col items-start gap-1">
                  <StatusBadge status={request.status} />
                  {request.reason && (
                    <span
                      className="max-w-37.5 truncate text-[10px] text-slate-400"
                      title={request.reason}
                    >
                      Note: {request.reason}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>Oct 15, 2023</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <>
                    <button
                      className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50"
                      title="Approve Request"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setIsCounterModalOpen(true)}
                      className="text-brand hover:bg-brand/5 rounded-lg p-2 transition-colors"
                      title="Send Counter Offer"
                    >
                      <AlertCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setIsRejectModalOpen(true)}
                      className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                      title="Reject Request"
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      </div>
      <Modal
        isOpen={isCounterModalOpen}
        onClose={() => setIsCounterModalOpen(false)}
        title="Send Counter Offer"
      >
        <CounterOfferForm onCancel={() => setIsCounterModalOpen(false)} />
      </Modal>
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Freight Requests"
      >
        <RejectRequestForm onCancel={() => setIsRejectModalOpen(false)} />
      </Modal>
    </>
  );
};
export default AdminRequests;
