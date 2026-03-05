import { Plus } from "lucide-react";
import Button from "../../../components/Button";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import StatusBadge from "../../../components/app/StatusBadge";
import Modal from "../../../components/Modal";
import FreightRequestForm from "../../../components/app/FreightRequestForm";
import { useState } from "react";

const CustomerRequests = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  return (
    <>
      <div className="max-medium-mobile:flex-col max-medium-mobile:items-start mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            My Freight Requests
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
      </div>
      <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
        <Table
          headers={[
            "Container Size",
            "Origin",
            "Destination",
            "Proposed Price",
            "Status",
            "Date",
          ]}
        >
          <TableRow>
            <TableCell className="font-medium">40ft HC</TableCell>
            <TableCell>Shanghai, CN</TableCell>
            <TableCell>Los Angeles, US</TableCell>
            <TableCell>$2,450</TableCell>
            <TableCell>
              <StatusBadge status="pending" />
            </TableCell>
            <TableCell>Oct 20, 2023</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">20ft Std</TableCell>
            <TableCell>Ningbo, CN</TableCell>
            <TableCell>Rotterdam, NL</TableCell>
            <TableCell>$1,850</TableCell>
            <TableCell>
              <StatusBadge status="countered" />
            </TableCell>
            <TableCell>Oct 18, 2023</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">40ft HC</TableCell>
            <TableCell>Ho Chi Minh, VN</TableCell>
            <TableCell>Hamburg, DE</TableCell>
            <TableCell>$3,100</TableCell>
            <TableCell>
              <StatusBadge status="approved" />
            </TableCell>
            <TableCell>Oct 15, 2023</TableCell>
          </TableRow>
        </Table>
      </div>

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
