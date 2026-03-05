import { type ReactNode } from "react";
import cn from "../utils/cn";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

const AuthLayout = ({ children, className }: AuthLayoutProps) => {
  return (
    <div
      className={cn(
        "max-small-mobile:px-4 relative flex min-h-screen flex-col justify-center overflow-hidden bg-slate-900 px-8 py-12",
        className,
      )}
    >
      <div className="bg-brand/20 absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full blur-3xl" />
      <div className="bg-brand/20 absolute bottom-0 left-0 -mt-20 -mr-20 h-96 w-96 rounded-full blur-3xl" />

      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default AuthLayout;
