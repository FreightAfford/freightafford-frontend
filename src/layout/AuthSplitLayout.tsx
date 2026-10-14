import { type ReactNode } from "react";
import { Link } from "react-router";
import ContainerRow from "../components/ContainerRow";
import Logo from "../components/Logo";
import cn from "../utils/cn";

interface AuthSplitLayoutProps {
  children: ReactNode;
  // Shown in the navy panel: on desktop beside the form, on phones below it.
  aside: ReactNode;
  className?: string;
}

// Sign-up and log-in. The form sits on white for easy reading; the navy
// panel carries the landing page's harbour colours, grid and container row.
const AuthSplitLayout = ({
  children,
  aside,
  className,
}: AuthSplitLayoutProps) => (
  <div
    className={cn(
      "max-tablet:grid-cols-1 grid min-h-screen grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] bg-white",
      className,
    )}
  >
    <main className="max-small-mobile:px-4 flex flex-col px-10 py-8">
      <Link to="/" className="self-start" aria-label="Freightafford home">
        <Logo className="-ml-3 h-10" />
      </Link>
      <div className="max-tablet:py-10 flex flex-1 items-center justify-center py-12">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </main>

    <aside className="bg-harbour relative isolate flex flex-col overflow-hidden text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 80% 15%, rgb(30 144 255 / 0.22), transparent 70%), linear-gradient(to bottom, #061a31, var(--color-harbour))",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgb(255 255 255 / 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgb(255 255 255 / 0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(ellipse 85% 70% at 70% 30%, #000 20%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 70% at 70% 30%, #000 20%, transparent 100%)",
        }}
      />
      <div className="max-tablet:py-12 max-small-mobile:px-4 flex flex-1 items-center px-12 py-16">
        <div className="w-full max-w-lg">{aside}</div>
      </div>
      <ContainerRow />
    </aside>
  </div>
);

export default AuthSplitLayout;
