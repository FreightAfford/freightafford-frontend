import { Eye, FileText, Ship, X } from "lucide-react";
import moment from "moment";
import { useNavigate } from "react-router";
import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import SmallLoader from "../../../components/SmallLoader";
import { useGetAllInvoices } from "../../../hooks/useInvoiceService";

const AdminInvoices = () => {
  const navigate = useNavigate();
  const { invoices, isPending, error, refetch, isRefetching } =
    useGetAllInvoices();

  if (isPending || isRefetching) return <SmallLoader />;

  if (error)
    return (
      <EmptyState
        icon={<X className="h-10 w-10 text-red-500" />}
        title="Error loading invoices"
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
      <div className="mb-8">
        {invoices.length > 0 ? (
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Invoices Management
            </h1>
            <p className="mt-1 text-slate-500">
              Generate and track customer invoices.
            </p>
          </div>
        ) : null}
      </div>

      {invoices.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <Table
            headers={[
              "S/N",
              "Invoice #",
              "Customer",
              "Amount",
              "Status",
              "Due Date",
            ]}
          >
            {invoices.map((invoice: any, index: number) => (
              <TableRow
                key={invoice._id}
                onClick={() =>
                  navigate(`/app/admin/invoices/${invoice.booking._id}`)
                }
              >
                <TableCell>{(index + 1).toString().padStart(2, "0")}</TableCell>
                <TableCell className="text-brand font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {invoice.invoiceNumber}
                  </div>
                </TableCell>
                <TableCell className="truncate font-medium">
                  {invoice.customer.companyName || invoice.customer.fullname}
                </TableCell>
                <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <StatusBadge
                    status={
                      invoice.status === "awaiting_verification"
                        ? "pending"
                        : invoice.status
                    }
                  />
                </TableCell>
                <TableCell>{moment(invoice.dueDate).format("ll")}</TableCell>
              </TableRow>
            ))}
          </Table>
        </div>
      ) : null}

      {!invoices?.length && (
        <EmptyState
          icon={<Ship className="text-brand h-10 w-10" />}
          title="No Available Invoices Yet"
          description="You have not sent any invoices yet through Bookings."
          action={
            <Button
              className="flex items-center gap-2"
              onClick={() => navigate("/app/admin/bookings")}
            >
              <Eye className="h-6 w-6" />
              See Bookings
            </Button>
          }
        />
      )}
    </>
  );
};
export default AdminInvoices;
