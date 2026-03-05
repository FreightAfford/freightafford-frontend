import { Download } from "lucide-react";
import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";

const CustomerInvoices = () => {
  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Documents</h1>
        <p className="mt-1 text-slate-500">
          Access and download your shipping documents.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <Table headers={["Invoice #", "Date", "Amount", "Status", "Action"]}>
          <TableRow>
            <TableCell className="font-medium">INV-2023-001</TableCell>
            <TableCell>Oct 23, 2023</TableCell>
            <TableCell>$2,450.00</TableCell>
            <TableCell>
              <StatusBadge status="completed" />
            </TableCell>
            <TableCell>
              <button className="text-brand flex items-center gap-2 font-medium hover:underline">
                <Download className="h-4 w-4" /> Download
              </button>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">INV-2023-002</TableCell>
            <TableCell>Oct 25, 2023</TableCell>
            <TableCell>$1,800.00</TableCell>
            <TableCell>
              <StatusBadge status="pending" />
            </TableCell>
            <TableCell>
              <button className="text-brand flex items-center gap-2 font-medium hover:underline">
                <Download className="h-4 w-4" /> Download
              </button>
            </TableCell>
          </TableRow>
        </Table>
      </div>
    </>
  );
};
export default CustomerInvoices;
