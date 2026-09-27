import { Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import ConsoleLayout from "../layouts/ConsoleLayout.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import PublicOnlyRoute from "./PublicOnlyRoute.jsx";
import RoleHome from "./RoleHome.jsx";

import LegacyPage from "../components/LegacyPage.jsx";
import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import Forbidden from "../pages/Forbidden.jsx";
import NotFound from "../pages/NotFound.jsx";

import { PUBLIC_ROUTES, CONSOLE_ROUTES, CONSOLE_ROLES } from "./manifest.js";

/**
 * AGRO CONNECT — the complete route table.
 *
 * Three zones, and a route can only ever be in one of them:
 *
 *   1. Public       — anyone, signed in or not.
 *   2. Public-only  — the auth screens; a signed-in user is bounced to their console.
 *   3. Protected    — every console screen, wrapped in <ProtectedRoute allowedRoles>.
 *
 * Because the guard is a parent route rather than a check inside each page, an
 * unauthenticated request for /admin/dashboard is redirected before the admin
 * module is even imported. There is no code path that renders a console screen
 * without first passing the guard.
 */
export default function AppRoutes() {
  return (
    <Routes>
      {/* ---------------- 1. Public ---------------- */}
      <Route element={<PublicLayout />}>
        {PUBLIC_ROUTES.map((r) => (
          <Route
            key={r.path}
            path={r.path}
            element={<LegacyPage moduleId={r.moduleId} />}
          />
        ))}
      </Route>

      {/* ---------------- 2. Authentication (signed-out only) ---------------- */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<LegacyPage moduleId="pages-forgot-password" />} />
          <Route path="/reset-password" element={<LegacyPage moduleId="pages-reset-password" />} />
        </Route>
      </Route>

      {/* Legacy aliases so old bookmarks keep working. */}
      <Route path="/signup" element={<Navigate to="/register" replace />} />
      <Route path="/signin" element={<Navigate to="/login" replace />} />
      <Route path="/index.html" element={<Navigate to="/" replace />} />

      {/*
        The old build exposed /pages/demand-forecasting.html as a public duplicate
        of the farmer console screen — one of the doors that let anyone reach
        console content. It now forwards to the guarded route instead of being a
        second, unprotected copy.
      */}
      <Route path="/demand-forecasting" element={<Navigate to="/farmer/demand-forecasting" replace />} />
      <Route path="/route-optimization" element={<Navigate to="/buyer/route-optimization" replace />} />

      {/* Role-agnostic entry point: sends each user to their own console. */}
      <Route path="/dashboard" element={<RoleHome />} />

      {/* ---------------- 3. Protected consoles ---------------- */}
      {CONSOLE_ROLES.map((role) => (
        <Route
          key={role}
          path={`/${role}`}
          element={
            <ProtectedRoute allowedRoles={[role]}>
              <ConsoleLayout role={role} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          {CONSOLE_ROUTES[role].map((r) => (
            <Route
              key={r.path}
              path={r.path}
              element={<LegacyPage moduleId={r.moduleId} isConsole />}
            />
          ))}
          {/* An unknown path inside a console is still a 404, not a blank shell. */}
          <Route path="*" element={<NotFound />} />
        </Route>
      ))}

      {/* ---------------- Errors ---------------- */}
      <Route path="/403" element={<Forbidden />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
