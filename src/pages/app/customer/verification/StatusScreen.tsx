import {
  BadgeCheck,
  Clock,
  LayoutDashboard,
  MessageSquare,
  type LucideIcon,
  XCircle,
} from "lucide-react";
import moment from "moment";
import { Link } from "react-router";
import Button from "../../../../components/Button";
import type { KycApplication } from "../../../../types/kyc";
import cn from "../../../../utils/cn";
import { CONTACT_EMAIL } from "../../../../utils/contact";

import type { ReviewedStatus } from "./steps";

const SCREENS: Record<
  ReviewedStatus,
  { icon: LucideIcon; tone: string; title: string; body: string }
> = {
  submitted: {
    icon: Clock,
    tone: "bg-ochre/15 text-[#9a6a0c]",
    title: "Verification submitted",
    body: "Our team is checking your details and documents. We'll email you as soon as it's done. You can't change anything while it's being reviewed.",
  },
  in_review: {
    icon: Clock,
    tone: "bg-ochre/15 text-[#9a6a0c]",
    title: "Your verification is being reviewed",
    body: "Our team is checking your details and documents. We'll email you as soon as it's done. You can't change anything while it's being reviewed.",
  },
  approved: {
    icon: BadgeCheck,
    tone: "bg-kelp/10 text-kelp",
    title: "Your business is verified",
    body: "Live tracking is now open on your bookings. If any of your documents expire, we'll ask you to upload a new one.",
  },
  rejected: {
    icon: XCircle,
    tone: "bg-red-50 text-red-600",
    title: "We couldn't verify your business",
    body: "Contact our team to find out what's needed before you apply again.",
  },
};

// Shown instead of the form once the details are with our team.
const StatusScreen = ({
  application,
}: {
  application: KycApplication & { status: ReviewedStatus };
}) => {
  const screen = SCREENS[application.status];
  const Icon = screen.icon;

  return (
    <section className="max-mobile:p-6 rounded-2xl border border-slate-200 bg-white p-10">
      <span
        className={cn(
          "flex h-12 w-12 items-center justify-center rounded-xl",
          screen.tone,
        )}
      >
        <Icon aria-hidden="true" className="h-6 w-6" />
      </span>
      <h2 className="font-display mt-6 text-2xl font-extrabold tracking-tight text-slate-900">
        {screen.title}
      </h2>
      <p className="mt-2 max-w-xl leading-relaxed text-slate-500">
        {screen.body}
      </p>
      {application.status === "rejected" && application.rejectionReason && (
        <div className="mt-5 max-w-xl rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="font-display text-sm font-semibold text-red-800">
            Reason from our team
          </p>
          <p className="mt-1 text-sm leading-relaxed text-red-900">
            {application.rejectionReason}
          </p>
        </div>
      )}
      {application.submittedAt && (
        <p className="mt-4 text-sm text-slate-500">
          Submitted{" "}
          {moment(application.submittedAt).format("D MMM YYYY, h:mm a")}
        </p>
      )}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/app/customer">
          <Button
            icon={LayoutDashboard}
            size="lg"
            className="h-12 rounded-xl text-base font-semibold"
          >
            Go to overview
          </Button>
        </Link>
        {application.status === "rejected" && (
          <a href={`mailto:${CONTACT_EMAIL}`}>
            <Button
              icon={MessageSquare}
              size="lg"
              variant="outline"
              className="h-12 rounded-xl text-base font-semibold"
            >
              Contact our team
            </Button>
          </a>
        )}
      </div>
    </section>
  );
};

export default StatusScreen;
