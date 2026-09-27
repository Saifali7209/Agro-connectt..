import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import FullPageLoader from "../components/FullPageLoader.jsx";

/**
 * AGRO CONNECT — the single access-control gate.
 *
 * Nothing protected renders until the session check has finished, so a
 * dashboard can never flash on screen before the answer arrives. Because the
 * check runs in the router, typing /admin/dashboard in the address bar hits
 * exactly the same gate as clicking a link — there is no path around it.
 *
 * Usage, as a layout route:
 *   <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
 *     <Route path="/admin/dashboard" element={<AdminDashboard />} />
 *   </Route>
 *
 * Or wrapping a single element:
 *   <ProtectedRoute><Dashboard /></ProtectedRoute>
 */
export default function ProtectedRoute({ allowedRoles, children }) {
  const { isInitialising, isAuthenticated, role, homePath } = useAuth();
  const location = useLocation();

  // 1. Still asking the backend — render nothing that depends on the answer.
  if (isInitialising) return <FullPageLoader label="Checking your session…" />;

  // 2. Not signed in — send to login, remembering where they were headed.
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  }

  // 3. Signed in but wrong role — never render the page, not even briefly.
  if (allowedRoles?.length && !allowedRoles.includes(role)) {
    return (
      <Navigate
        to="/403"
        replace
        state={{ attempted: location.pathname, role, allowedRoles, homePath }}
      />
    );
  }

  return children ?? <Outlet />;
}
