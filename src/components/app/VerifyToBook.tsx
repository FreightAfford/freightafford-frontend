import { Lock } from "lucide-react";
import { Link } from "react-router";
import { useKycStatus } from "../../hooks/useKycService";
import { TEXT_LINK } from "../../utils/authStyles";
import cn from "../../utils/cn";

// The short note beside a disabled booking button, saying why it's disabled.
const VerifyToBook = ({ className }: { className?: string }) => {
  const { status } = useKycStatus();
  const reviewing = status === "submitted" || status === "in_review";

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-sm text-slate-500",
        className,
      )}
    >
      <Lock aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
      {reviewing ? (
        "You can book once your business is verified."
      ) : (
        <span>
          <Link to="/app/customer/verification" className={TEXT_LINK}>
            Verify your business
          </Link>{" "}
          to book.
        </span>
      )}
    </p>
  );
};

export default VerifyToBook;
