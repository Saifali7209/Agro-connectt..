import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import FullPageLoader from "../components/FullPageLoader.jsx";

/**
 * /dashboard is a role-agnostic entry point: it forwards each signed-in user to
 * their own console. Anonymous visitors fall through to the login redirect.
 */
export default function RoleHome() {
  const { isInitialising, isAuthenticated, homePath } = useAuth();

  if (isInitialising) return <FullPageLoader label="Checking your session…" />;
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: "/dashboard" }} />;
  return <Navigate to={homePath} replace />;
}
