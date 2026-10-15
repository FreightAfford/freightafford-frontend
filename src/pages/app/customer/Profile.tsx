import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
  Clock,
  FileCheck2,
  Globe,
  KeyRound,
  Mail,
  MapPin,
  MessageSquareWarning,
  Pencil,
  Phone,
  ShieldAlert,
  ShieldCheck,
  Ship,
  User,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import moment from "moment";
import { useState, type ReactNode } from "react";
import { Link } from "react-router";
import Button from "../../../components/Button";
import Modal from "../../../components/Modal";
import EditProfileForm from "../../../components/app/EditProfileForm";
import UpdatePasswordForm from "../../../components/app/UpdatePasswordForm";
import { useUser } from "../../../hooks/useAuthService";
import { useKycStatus } from "../../../hooks/useKycService";
import type { KycStatus } from "../../../types/kyc";
import cn from "../../../utils/cn";

const VERIFY_PATH = "/app/customer/verification";

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  export_agent: "Export agent",
  exporter: "Exporter",
};

// How the verification card reads for each status.
const VERIFICATION: Record<
  KycStatus,
  {
    label: string;
    body: string;
    icon: LucideIcon;
    tone: string;
    action: string;
  }
> = {
  not_started: {
    label: "Not verified",
    body: "Verify to unlock live tracking on your bookings.",
    icon: ShieldAlert,
    tone: "bg-slate-100 text-slate-500",
    action: "Start verification",
  },
  draft: {
    label: "Not verified",
    body: "You've started. Pick up where you stopped.",
    icon: ShieldAlert,
    tone: "bg-slate-100 text-slate-500",
    action: "Continue verification",
  },
  submitted: {
    label: "In review",
    body: "We're checking your details and will email you.",
    icon: Clock,
    tone: "bg-ochre/15 text-[#9a6a0c]",
    action: "View details",
  },
  in_review: {
    label: "In review",
    body: "We're checking your details and will email you.",
    icon: Clock,
    tone: "bg-ochre/15 text-[#9a6a0c]",
    action: "View details",
  },
  changes_requested: {
    label: "Changes requested",
    body: "Update the details we flagged and submit again.",
    icon: MessageSquareWarning,
    tone: "bg-ochre/15 text-[#9a6a0c]",
    action: "See what to change",
  },
  approved: {
    label: "Verified business",
    body: "Live tracking is open on your bookings.",
    icon: BadgeCheck,
    tone: "bg-kelp/10 text-kelp",
    action: "View details",
  },
  rejected: {
    label: "Not approved",
    body: "Contact our team to find out what's needed.",
    icon: XCircle,
    tone: "bg-red-50 text-red-600",
    action: "View details",
  },
};

const initials = (name?: string) =>
  (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "?";

const formatDate = (value?: string) =>
  value ? moment(value).format("D MMM YYYY") : undefined;

const Panel = ({
  title,
  action,
  children,
  className,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section
    className={cn(
      "rounded-2xl border border-slate-200 bg-white p-5 @xl:p-6",
      className,
    )}
  >
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-base font-bold text-slate-900">{title}</h2>
      {action}
    </div>
    {children}
  </section>
);

// One labelled detail. Empty values offer a way to add them.
const Detail = ({
  icon: Icon,
  label,
  value,
  onAdd,
  extra,
}: {
  icon: LucideIcon;
  label: string;
  value?: ReactNode;
  onAdd?: () => void;
  extra?: ReactNode;
}) => (
  <div className="flex items-start gap-3.5 py-3.5">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
      <Icon aria-hidden="true" className="h-[18px] w-[18px]" />
    </span>
    <div className="min-w-0 flex-1">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        {value ? (
          <span className="font-medium break-words text-slate-900">
            {value}
          </span>
        ) : onAdd ? (
          <button
            type="button"
            onClick={onAdd}
            className="text-brand font-medium hover:underline"
          >
            Add {label.toLowerCase()}
          </button>
        ) : (
          <span className="text-slate-400">Not added</span>
        )}
        {value && extra}
      </dd>
    </div>
  </div>
);

const CustomerProfile = () => {
  const { user } = useUser();
  const { status, nextStep } = useKycStatus();
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] =
    useState<boolean>(false);

  const openEdit = () => setIsEditModalOpen(true);
  const verification = status ? VERIFICATION[status] : undefined;
  const verificationLink =
    status === "not_started" || status === "draft"
      ? `${VERIFY_PATH}?step=${nextStep ?? "business"}`
      : VERIFY_PATH;
  const accountType = ACCOUNT_TYPE_LABELS[user?.accountType] ?? undefined;

  // Sizes follow the page's own width (a container), not the window, since
  // the sidebar takes a share of the window on larger screens.
  return (
    <div className="@container">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Profile</h1>
        <p className="mt-1 text-slate-500">
          Your details, your company and your account settings.
        </p>
      </div>

      {/* Who you are */}
      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 @xl:p-6">
        <div className="flex flex-col items-stretch gap-5 @3xl:flex-row @3xl:items-center">
          <div className="flex min-w-0 flex-1 items-start gap-4 @xl:gap-5">
            <div
              aria-hidden="true"
              className="bg-harbour font-display flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-bold text-white @xl:h-16 @xl:w-16"
            >
              {initials(user?.fullname)}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold break-words text-slate-900 capitalize">
                {user?.fullname}
              </h2>
              <p
                className={cn(
                  "break-words text-slate-500",
                  user?.companyName && "capitalize",
                )}
              >
                {user?.companyName || user?.email}
              </p>
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                {verification && (
                  <Link
                    to={verificationLink}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-opacity hover:opacity-80",
                      verification.tone,
                    )}
                  >
                    <verification.icon
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    />
                    {verification.label}
                  </Link>
                )}
                {accountType && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    <Ship aria-hidden="true" className="h-3.5 w-3.5" />
                    {accountType}
                  </span>
                )}
                {user?.createdAt && (
                  <span className="inline-flex items-center gap-1.5 px-1 text-xs text-slate-500">
                    <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                    Member since {moment(user.createdAt).format("MMM YYYY")}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-2 @lg:flex-row @3xl:w-auto">
            <Button
              icon={Pencil}
              onClick={openEdit}
              className="h-11 rounded-xl px-5 font-semibold @lg:flex-1 @3xl:flex-none"
            >
              Edit profile
            </Button>
            <Button
              icon={KeyRound}
              variant="outline"
              onClick={() => setIsPasswordModalOpen(true)}
              className="h-11 rounded-xl px-5 font-semibold @lg:flex-1 @3xl:flex-none"
            >
              Change password
            </Button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 items-start gap-6 @3xl:grid-cols-2 @6xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="min-w-0 space-y-6">
          <Panel title="Contact details">
            <dl className="divide-y divide-slate-100">
              <Detail
                icon={User}
                label="Full name"
                value={
                  user?.fullname && (
                    <span className="capitalize">{user.fullname}</span>
                  )
                }
                onAdd={openEdit}
              />
              <Detail
                icon={Mail}
                label="Email"
                value={user?.email}
                extra={
                  user?.isEmailVerified && (
                    <span className="text-kelp inline-flex items-center gap-1 text-xs font-semibold">
                      <BadgeCheck aria-hidden="true" className="h-3.5 w-3.5" />
                      Confirmed
                    </span>
                  )
                }
              />
              <Detail
                icon={Phone}
                label="Phone number"
                value={user?.phoneNumber}
                onAdd={openEdit}
              />
              <Detail
                icon={Globe}
                label="Country"
                value={user?.country}
                onAdd={openEdit}
              />
            </dl>
          </Panel>

          <Panel title="Company">
            <dl className="divide-y divide-slate-100">
              <Detail
                icon={Building2}
                label="Company name"
                value={
                  user?.companyName && (
                    <span className="capitalize">{user.companyName}</span>
                  )
                }
                onAdd={openEdit}
              />
              <Detail
                icon={MapPin}
                label="Company address"
                value={
                  user?.companyAddress && (
                    <span className="capitalize">{user.companyAddress}</span>
                  )
                }
                onAdd={openEdit}
              />
              <Detail icon={Ship} label="Account type" value={accountType} />
            </dl>
          </Panel>
        </div>

        <div className="min-w-0 space-y-6">
          {verification && (
            <Panel title="Business verification">
              <div className="flex items-start gap-3.5">
                <span
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    verification.tone,
                  )}
                >
                  <verification.icon aria-hidden="true" className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-display font-semibold text-slate-900">
                    {verification.label}
                  </p>
                  <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                    {verification.body}
                  </p>
                </div>
              </div>
              <Link
                to={verificationLink}
                className="text-brand mt-4 inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
              >
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
                {verification.action}
              </Link>
            </Panel>
          )}

          <Panel title="Security">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                  <ShieldCheck
                    aria-hidden="true"
                    className="h-[18px] w-[18px]"
                  />
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">Password</p>
                  <p
                    aria-hidden="true"
                    className="text-sm tracking-widest text-slate-400"
                  >
                    ••••••••
                  </p>
                </div>
              </div>
              <Button
                icon={KeyRound}
                variant="outline"
                size="sm"
                onClick={() => setIsPasswordModalOpen(true)}
                className="h-9 shrink-0 rounded-lg px-3 text-sm"
              >
                Change
              </Button>
            </div>
          </Panel>

          <Panel title="Agreements">
            <dl className="divide-y divide-slate-100">
              <Detail
                icon={FileCheck2}
                label="Terms & Conditions accepted"
                value={formatDate(user?.acceptedTermsAt)}
              />
              <Detail
                icon={FileCheck2}
                label="Freight Rules accepted"
                value={formatDate(user?.acceptedFreightRulesAt)}
              />
            </dl>
          </Panel>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit profile"
      >
        <EditProfileForm
          initialData={{
            fullname: user?.fullname || "",
            email: user?.email || "",
            phoneNumber: user?.phoneNumber || "",
            companyName: user?.companyName || "",
            companyAddress: user?.companyAddress || "",
            country: user?.country || "",
          }}
          onCancel={() => setIsEditModalOpen(false)}
        />
      </Modal>
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Change password"
      >
        <UpdatePasswordForm onCancel={() => setIsPasswordModalOpen(false)} />
      </Modal>
    </div>
  );
};
export default CustomerProfile;
