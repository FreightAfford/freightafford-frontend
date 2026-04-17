import { zodResolver } from "@hookform/resolvers/zod";
import {
  Anchor,
  ArrowLeft,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Edit2,
  FileText,
  Mail,
  Package,
  Save,
  Shield,
  X,
} from "lucide-react";
import moment from "moment";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router";
import Button from "../../../components/Button";
import EmptyState from "../../../components/EmptyState";
import Input from "../../../components/Input";
import SmallLoader from "../../../components/SmallLoader";
import {
  useGetSingleUser,
  useUpdateUserByAdmin,
} from "../../../hooks/useAuthService";
import cn from "../../../utils/cn";
import {
  userSchema,
  type UserFormValues,
} from "../../../validations/authValidation";

const UserDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    user,
    requests,
    bookings,
    invoices,
    isPending,
    error,
    refetch,
    isRefetching,
  } = useGetSingleUser(id!);
  const [activeTab, setActiveTab] = useState<"edit" | "overview">("overview");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: user,
  });

  useEffect(() => {
    if (user) {
      reset({
        fullname: user.fullname,
        email: user.email,
        phoneNumber: user.phoneNumber || "",
        companyName: user.companyName || "",
        companyAddress: user.companyAddress || "",
        country: user.country || "",
        status: user.status,
      });
    }
  }, [user, reset]);

  const { updateUser, isPending: isUpdating } = useUpdateUserByAdmin();

  const onUpdateUser = (data: UserFormValues) =>
    updateUser({ userId: id as string, data });

  if (isPending || isRefetching) return <SmallLoader />;

  if (error)
    return (
      <EmptyState
        icon={<X className="h-10 w-10 text-red-500" />}
        title="Error loading user"
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
      <button
        onClick={() => navigate(-1)}
        className="group mb-4 flex items-center gap-2 text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
        Back
      </button>
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 capitalize">
                {user.fullname}
              </h1>
              <span
                className={cn(
                  "rounded-full border px-2.5 py-0.5 text-sm font-medium capitalize",
                  user.status === "active"
                    ? "border-green-200 bg-green-50 text-green-700"
                    : user.status === "inactive"
                      ? "border-slate-200 bg-slate-50 text-slate-700"
                      : "border-red-200 bg-red-50 text-red-700",
                )}
              >
                {user.status}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-2 text-slate-500">
              <Mail className="h-6 w-6" /> {user.email}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {activeTab !== "edit" ? (
            <Button
              onClick={() => setActiveTab("edit")}
              className="flex items-center gap-2"
            >
              <Edit2 className="h-5 w-5" /> Edit Profile
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={() => setActiveTab("overview")}
              className="flex items-center gap-2"
            >
              <X className="h-5 w-5" /> Cancel
            </Button>
          )}
        </div>
      </div>
      {/* Tabs */}
      <div className="mb-8 flex overflow-x-auto border-b border-slate-200">
        <button
          onClick={() => setActiveTab("overview")}
          className={cn(
            "relative px-6 py-3 font-medium whitespace-nowrap transition-colors",
            activeTab === "overview"
              ? "text-brand"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          Overview{" "}
          {activeTab === "overview" && (
            <motion.div
              layoutId="activeTab"
              className="bg-brand absolute right-0 bottom-0 left-0 h-0.5"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("edit")}
          className={cn(
            "relative px-6 py-3 font-medium whitespace-nowrap transition-colors",
            activeTab === "edit"
              ? "text-brand"
              : "text-slate-500 hover:text-slate-700",
          )}
        >
          Edit Information{" "}
          {activeTab === "edit" && (
            <motion.div
              layoutId="activeTab"
              className="bg-brand absolute right-0 bottom-0 left-0 h-0.5"
            />
          )}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "overview" && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="max-small-mobile:p-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="max-small-mobile:flex-col max-small-mobile:text-center flex items-center gap-4">
                  <div className="rounded-xl bg-slate-50 p-3">
                    <Anchor className="h-6.5 w-6.5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500"> Requests</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {requests}
                    </p>
                  </div>
                </div>
              </div>
              <div className="max-small-mobile:p-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="max-small-mobile:flex-col max-small-mobile:text-center flex items-center gap-4">
                  <div className="bg-brand/10 rounded-xl p-3">
                    <Package className="text-brand h-6.5 w-6.5" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500"> Bookings</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {bookings}
                    </p>
                  </div>
                </div>
              </div>
              <div className="max-small-mobile:p-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <div className="max-small-mobile:flex-col max-small-mobile:text-center flex items-center gap-4">
                  <div className="rounded-xl bg-emerald-100 p-3">
                    <FileText className="h-6.5 w-6.5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500"> Invoices</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {invoices}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="my-4 space-y-6">
              {/* Details Card */}
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                <div className="border-b border-slate-50 p-6">
                  <h3 className="text-lg font-bold text-slate-900">
                    Contact Information
                  </h3>
                </div>
                <div className="max-small-mobile:grid-cols-1 grid grid-cols-2 gap-6 p-6">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
                      Full Name
                    </p>
                    <p className="font-medium text-slate-900 capitalize">
                      {user.fullname}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
                      Email Address
                    </p>
                    <p className="font-medium text-slate-900">{user.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
                      Phone Number
                    </p>
                    <p className="font-medium text-slate-900">
                      {user.phoneNumber || (
                        <span className="italic">Not provided</span>
                      )}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
                      Company
                    </p>
                    <p className="font-medium text-slate-900 capitalize">
                      {user.companyName || (
                        <span className="italic">Not provided</span>
                      )}
                    </p>
                  </div>
                  <div className="max-small-mobile:col-span-1 col-span-2 space-y-1">
                    <p className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
                      Address
                    </p>
                    <p className="font-medium text-slate-900 capitalize">
                      {[user.companyAddress, user.country]
                        .filter(Boolean)
                        .join(", ") || (
                        <span className="italic">Not provided</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-lg font-bold text-slate-900">
                  Account Details
                </h3>
                <div className="flex flex-wrap gap-6.5">
                  <div className="flex grow gap-3">
                    <Shield className="h-5.5 w-5.5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Role</p>
                      <p className="font-medium text-slate-900 capitalize">
                        {user.role}
                      </p>
                    </div>
                  </div>
                  <div className="flex grow gap-3">
                    <CheckCircle2 className="h-5.5 w-5.5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Email Status</p>
                      <p
                        className={cn(
                          "font-medium",
                          user.isEmailVerified
                            ? "text-green-600"
                            : "text-amber-600",
                        )}
                      >
                        {user.isEmailVerified ? "Verified" : "Unverified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex grow gap-3">
                    <Calendar className="h-5.5 w-5.5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Joined Date</p>
                      <p className="font-medium text-slate-900">
                        {moment(user.createdAt).format("ll")}
                      </p>
                    </div>
                  </div>
                  <div className="flex grow gap-3">
                    <CalendarCheck className="h-5.5 w-5.5 text-slate-400" />
                    <div>
                      <p className="text-sm text-slate-500">Date Updated</p>
                      <p className="font-medium text-slate-900">
                        {moment(user.updatedAt).format("ll")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "edit" && (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <form className="p-8" onSubmit={handleSubmit(onUpdateUser)}>
              <div className="max-medium-mobile:grid-cols-1 mb-8 grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Input
                    label="Full Name"
                    placeholder="Frank Andy"
                    {...register("fullname")}
                    disabled={isUpdating}
                    error={errors.fullname?.message}
                    className="capitalize"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="frank@example.com"
                    {...register("email")}
                    error={errors.email?.message}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    label="Phone Number"
                    placeholder="+234 000 000 0000"
                    {...register("phoneNumber")}
                    error={errors.phoneNumber?.message}
                    disabled={isUpdating}
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    label="Company Name"
                    placeholder="Example Corporation"
                    {...register("companyName")}
                    error={errors.companyName?.message}
                    disabled={isUpdating}
                    className="capitalize"
                  />
                </div>
                <div className="space-y-2">
                  <Input
                    label="Country"
                    placeholder="Nigeria"
                    {...register("country")}
                    error={errors.country?.message}
                    disabled={isUpdating}
                    className="capitalize"
                  />
                </div>
                <div className="space-y-2">
                  <label className="leading-none font-medium tracking-wide text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Status
                  </label>
                  <select
                    {...register("status")}
                    disabled={isUpdating}
                    className="focus-visible:ring-brand flex h-12 w-full rounded-md border border-slate-200 bg-white px-3 py-2 ring-offset-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div className="max-medium-mobile:col-span-1 col-span-2 space-y-2">
                  <label className="leading-none font-medium tracking-wide text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Address
                  </label>
                  <textarea
                    {...register("companyAddress")}
                    disabled={isUpdating}
                    rows={3}
                    className="focus-visible:ring-brand flex h-16 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 capitalize ring-offset-white placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-6">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setActiveTab("overview")}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button
                  disabled={isUpdating}
                  isLoading={isUpdating}
                  type="submit"
                  className="flex items-center gap-2"
                >
                  {!isUpdating && <Save className="h-5 w-5" />}Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UserDetails;
