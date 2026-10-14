import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import Loader from "../components/Loader";
import { useUser } from "../hooks/useAuthService";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  redirectPath?: string;
  children: ReactNode;
}

const ProtectedRoute = ({
  allowedRoles,
  redirectPath = "/login",
  children,
}: ProtectedRouteProps) => {
  const { user, isPending } = useUser();
  const location = useLocation();

  if (isPending) return <Loader />;

  // if (isError) return <Navigate to={redirectPath} replace />;

  // Remember where they were going, so login can send them back there.
  if (!user)
    return (
      <Navigate
        to={redirectPath}
        replace
        state={{ from: location.pathname + location.search }}
      />
    );

  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
