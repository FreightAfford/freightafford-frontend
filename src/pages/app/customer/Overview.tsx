import { CalendarCheck, FileSearch, FileText, Receipt, X } from "lucide-react";
import StatsCard from "../../../components/app/StatsCard";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import SmallLoader from "../../../components/SmallLoader";
import { useGetCustomerOverview } from "../../../hooks/usePipelineService";

const CustomerOverview = () => {
  const { data, isPending, error, isRefetching, refetch } =
    useGetCustomerOverview();

  if (isPending || isRefetching) return <SmallLoader />;

  if (error)
    return (
      <EmptyState
        icon={<X className="h-10 w-10 text-red-500" />}
        title="Error loading overview"
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
        <h1 className="text-2xl font-bold text-slate-900">
          Welcome back, Shipper
        </h1>
        <p className="mt-1 text-slate-500">
          Here's what's happening with your freight today.
        </p>
      </div>

      {/* Stats Grid */}
      {data && (
        <div className="max-medium-desktop:grid-cols-2 max-medium-mobile:grid-cols-1 mb-8 grid grid-cols-4 gap-6">
          <StatsCard
            title="Active Requests"
            value={data.totalRequests || 0}
            icon={FileSearch}
            // trend={{ value: "2+ this week", isPositive: true }}
          />
          <StatsCard
            title="Active Bookings"
            value={data.totalBookings || 0}
            icon={CalendarCheck}
          />
          <StatsCard
            title="Bill of Ladings"
            value={data.bills || 0}
            icon={FileText}
            trend={{ value: "Action required", isPositive: true }}
          />
          <StatsCard
            title="Outstanding Invoices"
            value={`$${data.totalInvoiceAmount || 0}`}
            icon={Receipt}
          />
        </div>
      )}
      {/* Recent Activity / Tables */}
      {/* <div className="max-medium-desktop:grid-cols-1 grid grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h2 className="font-bold text-slate-900">
              Recent Freight Requests
            </h2>
            <button className="text-brand flex items-center gap-1 text-sm font-medium hover:underline">
              View all <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <Table headers={["Container", "Origin", "Destination", "Status"]}>
            <TableRow>
              <TableCell className="font-medium">40ft HC</TableCell>
              <TableCell className="font-medium">Shanghai, CN</TableCell>
              <TableCell className="font-medium">Los Angeles, US</TableCell>
              <TableCell className="font-medium">
                <StatusBadge status="pending" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">20ft Std</TableCell>
              <TableCell>Ningbo, CN</TableCell>
              <TableCell>Rotterdam, NL</TableCell>
              <TableCell>
                <StatusBadge status="countered" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">40ft HC</TableCell>
              <TableCell>Ho Chi Minh, VN</TableCell>
              <TableCell>Hamburg, DE</TableCell>
              <TableCell>
                <StatusBadge status="approved" />
              </TableCell>
            </TableRow>
          </Table>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h2 className="font-bold text-slate-900">Active Bookings</h2>
            <button className="text-brand flex items-center gap-1 text-sm font-medium hover:underline">
              View all <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <Table
            headers={["Booking #", "Sailing Date", "Shipping Line", "Status"]}
          >
            <TableRow>
              <TableCell className="font-medium">FA-98210</TableCell>
              <TableCell>Oct 24, 2023</TableCell>
              <TableCell>Maersk</TableCell>
              <TableCell>
                <StatusBadge status="active" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">FA-98215</TableCell>
              <TableCell>Oct 28, 2023</TableCell>
              <TableCell>MSC</TableCell>
              <TableCell>
                <StatusBadge status="pending" />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">FA-98220</TableCell>
              <TableCell>Nov 02, 2023</TableCell>
              <TableCell>CMA CGM</TableCell>
              <TableCell>
                <StatusBadge status="active" />
              </TableCell>
            </TableRow>
          </Table>
        </motion.div>
      </div> */}
    </>
  );
};
export default CustomerOverview;
