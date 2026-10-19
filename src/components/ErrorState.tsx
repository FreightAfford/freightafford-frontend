import {
  ArrowLeft,
  LockKeyhole,
  LogIn,
  RotateCw,
  SearchX,
  ShieldAlert,
  TriangleAlert,
  WifiOff,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { useLocation, useNavigate } from "react-router";
import cn from "../utils/cn";
import Button from "./Button";

type ErrorKind = "auth" | "forbidden" | "notFound" | "offline" | "generic";

interface ErrorStateProps {
  // What failed to load, read into the copy: "your requests", "this booking".
  resource: string;
  // Services rethrow the response body; the api client adds its statusCode.
  error: { message?: string; statusCode?: number } | null | undefined;
  onRetry?: () => void;
  isRetrying?: boolean;
  // Detail pages offer a way back alongside (or instead of) retrying.
  showBack?: boolean;
}

const getKind = (error: ErrorStateProps["error"]): ErrorKind => {
  if (typeof navigator !== "undefined" && !navigator.onLine) return "offline";
  if (error?.statusCode === 401) return "auth";
  if (error?.statusCode === 403) return "forbidden";
  if (error?.statusCode === 404) return "notFound";
  return "generic";
};

const KINDS: Record<
  ErrorKind,
  {
    icon: LucideIcon;
    tone: string;
    eyebrow: string;
    title: (resource: string) => string;
    body: (resource: string) => string;
  }
> = {
  auth: {
    icon: LockKeyhole,
    tone: "bg-amber-50 text-amber-600 ring-amber-50/50",
    eyebrow: "Session ended",
    title: () => "You've been signed out",
    body: (r) => `Log in again to see ${r}.`,
  },
  forbidden: {
    icon: ShieldAlert,
    tone: "bg-amber-50 text-amber-600 ring-amber-50/50",
    eyebrow: "No access",
    title: (r) => `You can't view ${r}`,
    body: () =>
      "Your account doesn't have permission for this. Contact support if you think it should.",
  },
  notFound: {
    icon: SearchX,
    tone: "bg-slate-100 text-slate-500 ring-slate-100/60",
    eyebrow: "Not found",
    title: (r) => `We couldn't find ${r}`,
    body: () => "It may have been removed, or the link is out of date.",
  },
  offline: {
    icon: WifiOff,
    tone: "bg-slate-100 text-slate-500 ring-slate-100/60",
    eyebrow: "You're offline",
    title: (r) => `Couldn't load ${r}`,
    body: () => "Check your internet connection, then try again.",
  },
  generic: {
    icon: TriangleAlert,
    tone: "bg-red-50 text-red-500 ring-red-50/50",
    eyebrow: "Something went wrong",
    title: (r) => `Couldn't load ${r}`,
    body: () => "This is usually temporary. Give it another try in a moment.",
  },
};

const ErrorState = ({
  resource,
  error,
  onRetry,
  isRetrying,
  showBack,
}: ErrorStateProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const kind = getKind(error);
  const { icon: Icon, tone, eyebrow, title, body } = KINDS[kind];
  // The server's own wording only adds anything when we can't explain it ourselves.
  const detail = kind === "generic" ? error?.message : undefined;

  const canRetry = onRetry && (kind === "generic" || kind === "offline");
  const canGoBack = showBack || kind === "forbidden" || kind === "notFound";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      role="alert"
      className="flex flex-col items-center justify-center px-4 py-20 text-center"
    >
      <div
        className={cn(
          "mb-6 flex h-20 w-20 items-center justify-center rounded-2xl ring-8",
          tone,
        )}
      >
        <Icon aria-hidden="true" className="h-9 w-9" strokeWidth={1.75} />
      </div>

      <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
        {eyebrow}
      </p>
      <h3 className="mt-1.5 text-xl font-semibold text-balance text-slate-900">
        {title(resource)}
      </h3>
      <p className="mt-2 max-w-sm text-pretty text-slate-500">
        {body(resource)}
      </p>

      {detail && (
        <p className="mt-3 max-w-sm text-sm break-words text-slate-400">
          {detail}
        </p>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {kind === "auth" && (
          <Button
            icon={LogIn}
            onClick={() =>
              navigate("/login", { state: { from: location.pathname } })
            }
          >
            Log in
          </Button>
        )}
        {canRetry && (
          <Button
            icon={RotateCw}
            variant="outline"
            isLoading={isRetrying}
            onClick={onRetry}
          >
            Try again
          </Button>
        )}
        {canGoBack && (
          <Button
            icon={ArrowLeft}
            variant={kind === "auth" || canRetry ? "ghost" : "outline"}
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default ErrorState;
