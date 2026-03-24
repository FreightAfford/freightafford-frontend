import type { ReactNode } from "react";
import { Navigate } from "react-router";
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
  console.log(user);
  if (isPending) return <Loader />;

  // if (isError) return <Navigate to={redirectPath} replace />;

  if (!user) return <Navigate to={redirectPath} replace />;

  if (allowedRoles && !allowedRoles.includes(user.role))
    return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
