import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import Brand from "../components/Brand.jsx";

/**
 * 403 — signed in, but this area belongs to a different role.
 * Reached only via <ProtectedRoute>; the page they aimed at never rendered.
 */
export default function Forbidden() {
  const { role, homePath, logout } = useAuth();
  const { state } = useLocation();

  return (
    <main id="main" className="container section" style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
      <div className="card" style={{ maxWidth: "52ch", textAlign: "center" }}>
        <Brand compact />
        <h1 style={{ marginTop: "var(--sp-4)" }}>Access denied</h1>
        <p className="text-muted">
          {state?.attempted
            ? <>Your account doesn’t have permission to open <strong>{state.attempted}</strong>.</>
            : "Your account doesn’t have permission to open that page."}
        </p>
        {role && (
          <p className="text-muted" style={{ fontSize: "var(--fs-sm)" }}>
            You are signed in as <strong>{role}</strong>
            {state?.allowedRoles?.length ? <> — that area is for {state.allowedRoles.join(" or ")} accounts.</> : "."}
          </p>
        )}
        <div className="btn-group" style={{ justifyContent: "center", marginTop: "var(--sp-4)" }}>
          <Link className="btn btn-primary" to={homePath}>Go to my dashboard</Link>
          <Link className="btn btn-outline" to="/">Public site</Link>
          <button className="btn btn-ghost" type="button" onClick={logout}>Sign out</button>
        </div>
      </div>
    </main>
  );
}
