import { Ship, X } from "lucide-react";
import { useNavigate } from "react-router";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import SmallLoader from "../../../components/SmallLoader";
import StatusBadge from "../../../components/app/StatusBadge";
import { Table, TableCell, TableRow } from "../../../components/app/Table";
import { useGetAllFreightRequests } from "../../../hooks/useFreightService";

const AdminRequests = () => {
  const navigate = useNavigate();
  const { requests, isPending, error, refetch, isRefetching } =
    useGetAllFreightRequests();

  if (isPending || isRefetching) return <SmallLoader />;

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
      {requests?.length > 0 ? (
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Freight Requests
          </h1>
          <p className="mt-1 text-slate-500">
            Review and respond to customer freight inquiries.
          </p>
        </div>
      ) : null}

      {requests?.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-slate-100 shadow-sm">
          <Table
            headers={[
              "S/N",
              "Customer",
              "Container",
              "Origin",
              "Destination",
              "Price",
              "Status",
            ]}
          >
            {requests?.map((request: any, index: number) => (
              <TableRow
                key={request._id}
                onClick={() => navigate(`/app/admin/requests/${request._id}`)}
              >
                <TableCell>{(index + 1).toString().padStart(2, "0")}</TableCell>
                <TableCell className="text-brand hover:text-brand/80 max-w-37.5 truncate font-medium capitalize">
                  {request.customer.companyName || request.customer.fullname}
                </TableCell>
                <TableCell className="uppercase">
                  {request.containerSize}
                </TableCell>
                <TableCell className="capitalize">
                  {request.originPort}
                </TableCell>
                <TableCell className="capitalize">
                  {request.destinationPort}
                </TableCell>
                <TableCell>${request.proposedPrice.toLocaleString()}</TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <StatusBadge status={request.status} />
                    {request.notes && (
                      <span
                        className="max-w-37.5 truncate text-[10px] text-slate-400"
                        title={request.notes}
                      >
                        Note: {request.notes}
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </div>
      ) : null}

      {!requests?.length && (
        <EmptyState
          icon={<Ship className="text-brand h-10 w-10" />}
          title="No Freight Requests Yet"
          description="You don't have any customer freight request made on Freight Afford. Yet to receive shipping quotes through Freight Requests."
        />
      )}
    </>
  );
};
export default AdminRequests;
