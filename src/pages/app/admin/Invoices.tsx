import { useState } from "react";
import Button from "../../../components/Button";
import { Plus } from "lucide-react";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import StatusBadge from "../../../components/app/StatusBadge";
import Modal from "../../../components/Modal";
import CreateInvoiceForm from "../../../components/app/CreateInvoiceForm";

const AdminInvoices = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  return (
    <>
      <div className="max-medium-mobile:flex-col max-medium-mobile:items-start mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Invoices Management
          </h1>
          <p className="mt-1 text-slate-500">
            Generate and track customer invoices.
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Create Invoice
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <Table headers={["Invoice #", "Customer", "Date", "Amount", "Status"]}>
          <TableRow>
            <TableCell className="font-medium">INV-2023-001</TableCell>
            <TableCell>Global Trade Co.</TableCell>
            <TableCell>Oct 22, 2023</TableCell>
            <TableCell>$2,450.00</TableCell>
            <TableCell>
              <StatusBadge status="completed" />
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">INV-2023-002</TableCell>
            <TableCell>Pacific Logistics</TableCell>
            <TableCell>Oct 25, 2023</TableCell>
            <TableCell>$1,800.00</TableCell>
            <TableCell>
              <StatusBadge status="pending" />
            </TableCell>
          </TableRow>
        </Table>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Invoice"
      >
        <CreateInvoiceForm onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};
export default AdminInvoices;
