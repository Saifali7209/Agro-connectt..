import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

/**
 * Wraps /login, /register and the password screens.
 *
 * These are PUBLIC pages: nothing about rendering the sign-in form, the
 * registration form, etc. depends on knowing whether a session already
 * exists — so, unlike <ProtectedRoute>, this must never block the page
 * behind a "Checking your session…" spinner. It renders the page
 * immediately, in every case (authenticated, anonymous, still checking,
 * or the auth check failed because the backend is unreachable).
 *
 * The auth result is only needed for one thing: if it turns out the
 * visitor already has a live session (e.g. they pressed Back after
 * signing in), send them to their own console instead of showing the
 * form again. That redirect fires once `isInitialising` resolves to
 * `true` for `isAuthenticated` — it never gates the initial render.
 */
export default function PublicOnlyRoute({ children }) {
  const { isInitialising, isAuthenticated, homePath } = useAuth();
  const location = useLocation();

  if (!isInitialising && isAuthenticated) {
    const intended = location.state?.from;
    return <Navigate to={intended || homePath} replace />;
  }

  return children ?? <Outlet />;
}
