import { NavLink, Link } from "react-router-dom";
import Brand from "./Brand.jsx";
import useAuth from "../hooks/useAuth.js";
import { PUBLIC_LINKS } from "../config/navigation.js";

/**
 * Public site header. Identical classes and link order to the original
 * renderPublicHeader(), with one addition: when a session is live the
 * Sign in / Get started pair becomes a link into that user's own console
 * plus a working Sign out.
 */
export default function Navbar() {
  const { isAuthenticated, user, homePath, logout } = useAuth();

  return (
    <header className="site-header">
      <div className="container">
        <Brand compact />
        <nav className="site-nav" id="site-nav" aria-label="Main">
          {PUBLIC_LINKS.map((l) => (
            // NavLink sets aria-current="page" when active, which is exactly what
            // the existing stylesheet targets — no class changes needed.
            <NavLink key={l.key} to={l.to}>{l.label}</NavLink>
          ))}
        </nav>
        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <Link className="btn btn-outline btn-sm" to={homePath}>
                {user?.name ? `${user.name.split(" ")[0]}'s console` : "My console"}
              </Link>
              <button className="btn btn-primary btn-sm" type="button" onClick={logout}>
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link className="btn btn-outline btn-sm" to="/login">Sign in</Link>
              <Link className="btn btn-primary btn-sm" to="/register">Get started</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
