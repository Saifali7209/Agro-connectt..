import { Link } from "react-router-dom";
import Brand from "../components/Brand.jsx";
import useAuth from "../hooks/useAuth.js";

/** 404 — the route does not exist. */
export default function NotFound() {
  const { isAuthenticated, homePath } = useAuth();

  return (
    <main id="main" className="container section" style={{ minHeight: "70vh", display: "grid", placeItems: "center" }}>
      <div className="card" style={{ maxWidth: "52ch", textAlign: "center" }}>
        <Brand compact />
        <h1 style={{ marginTop: "var(--sp-4)" }}>Page not found</h1>
        <p className="text-muted">
          The page you asked for doesn’t exist, or it may have moved.
        </p>
        <div className="btn-group" style={{ justifyContent: "center", marginTop: "var(--sp-4)" }}>
          <Link className="btn btn-primary" to="/">Back to home</Link>
          <Link className="btn btn-outline" to="/marketplace">Browse the marketplace</Link>
          {isAuthenticated && <Link className="btn btn-ghost" to={homePath}>My dashboard</Link>}
        </div>
      </div>
    </main>
  );
}
