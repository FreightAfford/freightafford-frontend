import { AlertCircle, FileSearch, Receipt, Ship, Users } from "lucide-react";
import StatsCard from "../../../components/app/StatsCard";
import EmptyState from "../../../components/EmptyState";
import SmallLoader from "../../../components/SmallLoader";
import { useGetAdminOverview } from "../../../hooks/usePipelineService";

const AdminOverview = () => {
  const { data, error, isPending } = useGetAdminOverview();

  if (isPending) return <SmallLoader />;

  if (error) return;
  <EmptyState
    icon={<AlertCircle className="h-10 w-10 text-red-500" />}
    title="An Error Occured"
    description="This may be due to server error or users don't exist."
  />;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">System Overview</h1>
        <p className="mt-1 text-slate-500">
          Global logistics monitoring and management.
        </p>
      </div>

      {/* Stats Grid */}
      {data && (
        <div className="max-medium-desktop:grid-cols-2 max-medium-mobile:grid-cols-1 mb-6 grid grid-cols-4 gap-4">
          <StatsCard
            title="Total Users"
            value={data.totalUsers || 0}
            icon={Users}
            // trend={{ value: "+12% this month", isPositive: true }}
          />
          <StatsCard
            title="Active Requests"
            value={data.totalRequests || 0}
            icon={FileSearch}
            trend={
              data.pendingRequests
                ? {
                    value: `${data.pendingRequests} pending reviews`,
                    isPositive: false,
                  }
                : undefined
            }
          />
          <StatsCard
            title="Total Bookings"
            value={data.totalBookings || 0}
            icon={Ship}
          />
          <StatsCard
            title="Total Invoice"
            value={`$${data.totalInvoiceAmount.toLocaleString() || 0}`}
            icon={Receipt}
            // trend={{ value: "+8.4%", isPositive: true }}
          />
        </div>
      )}

      {/* Recent Activity / Tables */}
      {/* <div className="max-medium-desktop:grid-cols-1 grid grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-medium-desktop:col-span-1 col-span-2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-6">
            <h2 className="font-bold text-slate-900">
              Pending Freight Requests
            </h2>
            <button className="text-brand flex items-center gap-1 text-sm font-medium hover:underline">
              Manage all <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <Table
            headers={["Customer", "Container", "Route", "Price", "Actions"]}
          >
            <TableRow>
              <TableCell className="font-medium">Global Trade Co.</TableCell>
              <TableCell className="font-medium">40ft HC</TableCell>
              <TableCell className="font-medium">SHA → LAX</TableCell>
              <TableCell className="font-medium">$2,450</TableCell>
              <TableCell className="font-medium">
                <div className="flex gap-2">
                  <button className="bg-brand hover:bg-brand/90 rounded-lg px-3 py-1 text-sm font-bold text-white">
                    Approve
                  </button>
                  <button className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-200">
                    Counter
                  </button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Pacific Logistics</TableCell>
              <TableCell className="font-medium">20ft Std</TableCell>
              <TableCell className="font-medium">NGB → RTM</TableCell>
              <TableCell className="font-medium">$1,850</TableCell>
              <TableCell className="font-medium">
                <div className="flex gap-2">
                  <button className="bg-brand hover:bg-brand/90 rounded-lg px-3 py-1 text-sm font-bold text-white">
                    Approve
                  </button>
                  <button className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-200">
                    Counter
                  </button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Pacific Logistics</TableCell>
              <TableCell className="font-medium">20ft Std</TableCell>
              <TableCell className="font-medium">NGB → RTM</TableCell>
              <TableCell className="font-medium">$1,850</TableCell>
              <TableCell className="font-medium">
                <div className="flex gap-2">
                  <button className="bg-brand hover:bg-brand/90 rounded-lg px-3 py-1 text-sm font-bold text-white">
                    Approve
                  </button>
                  <button className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-200">
                    Counter
                  </button>
                </div>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Pacific Logistics</TableCell>
              <TableCell className="font-medium">20ft Std</TableCell>
              <TableCell className="font-medium">NGB → RTM</TableCell>
              <TableCell className="font-medium">$1,850</TableCell>
              <TableCell className="font-medium">
                <div className="flex gap-2">
                  <button className="bg-brand hover:bg-brand/90 rounded-lg px-3 py-1 text-sm font-bold text-white">
                    Approve
                  </button>
                  <button className="rounded-lg bg-slate-100 px-3 py-1 text-sm font-bold text-slate-700 hover:bg-slate-200">
                    Counter
                  </button>
                </div>
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
            <h2 className="font-bold text-slate-900">System Activity</h2>
            <Activity className="h-4 w-4 text-slate-400" />
          </div>
          <div className="space-y-6 p-4">
            {[
              {
                user: "Admin",
                action: "Approved Booking FA-98210",
                time: "2 mins ago",
              },
              {
                user: "Customer",
                action: "New Request SHA → LAX",
                time: "15 mins ago",
              },
              {
                user: "System",
                action: "Invoice #INV-2023-001 Generated",
                time: "1 hour ago",
              },
              {
                user: "Admin",
                action: "Updated Sailing Schedule",
                time: "3 hours ago",
              },
            ].map((log, i) => (
              <div key={i} className="flex gap-3">
                <div className="bg-brand mt-2 h-2 w-2 shrink-0 rounded-full" />
                <div>
                  <p className="line-clamp-1 font-medium text-slate-900">
                    {log.action}
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {log.user} • {log.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div> */}
    </>
  );
};
export default AdminOverview;
