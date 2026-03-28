import { Download, FileText, Plus, Ship, X } from "lucide-react";
import moment from "moment";
import { Link, useNavigate } from "react-router";
import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import SmallLoader from "../../../components/SmallLoader";
import { useGetInvoicesByCustomer } from "../../../hooks/useInvoiceService";

const CustomerInvoices = () => {
  const navigate = useNavigate();
  const { invoices, isPending, error, refetch, isRefetching } =
    useGetInvoicesByCustomer();

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
          <>
            <h1 className="text-2xl font-bold text-slate-900">Invoice</h1>
            <p className="mt-1 text-slate-500">
              Access and download your shipping invoice.
            </p>
          </>
        ) : null}
      </div>

      {invoices.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <Table
            headers={[
              "S/N",
              "Invoice #",
              "Booking #",
              "Amount",
              "Status",
              "Due Date",
              "Action",
            ]}
          >
            {invoices.map((invoice: any, index: number) => (
              <TableRow
                key={invoice._id}
                onClick={() =>
                  navigate(`/app/customer/invoices/${invoice.booking._id}`)
                }
              >
                <TableCell>{(index + 1).toString().padStart(2, "0")}</TableCell>
                <TableCell className="text-brand font-medium">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    {invoice.invoiceNumber}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {invoice.booking.bookingNumber}
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
                <TableCell>
                  <Link
                    to={invoice.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-brand flex items-center gap-2 font-medium hover:underline"
                    title="Download Invoice"
                  >
                    <Download className="h-5 w-5" /> Download
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </div>
      ) : null}

      {!invoices?.length && (
        <EmptyState
          icon={<Ship className="text-brand h-10 w-10" />}
          title="No Available Invoices Yet"
          description="You don't have any bookings made on Freight Afford. Yet to receive invoices through Bookings. Create a Freight Request."
          action={
            <Button
              onClick={() => navigate("/app/customer/requests")}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Create Request
            </Button>
          }
        />
      )}
    </>
  );
};

export default CustomerInvoices;
