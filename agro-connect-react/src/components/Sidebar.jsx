import { Link, NavLink, useNavigate } from "react-router-dom";
import Brand from "./Brand.jsx";
import Icon from "./Icon.jsx";
import useAuth from "../hooks/useAuth.js";
import { CONSOLE_NAV } from "../config/navigation.js";

/**
 * Console sidebar, one per role. Same structure, classes and grouping as the
 * original renderSidebar(). Sign out now clears the real session and returns
 * the user to the login screen.
 */
export default function Sidebar({ role, activeKey }) {
  const nav = CONSOLE_NAV[role];
  const navigate = useNavigate();
  const { logout } = useAuth();

  if (!nav) return null;

  const isCurrent = (key) =>
    key === activeKey || (key === "ai" && activeKey === "ai-crop-doctor");

  const renderItem = (item) => (
    <NavLink
      key={item.key}
      to={item.to}
      title={item.label}
      aria-current={isCurrent(item.key) ? "page" : undefined}
    >
      <Icon name={item.icon} />
      <span>{item.label}</span>
    </NavLink>
  );

  const handleSignOut = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <aside className="app-sidebar" id="app-sidebar">
      <Brand compact />
      <p className="side-role">{nav.label}</p>

      <nav className="side-nav" aria-label={nav.label}>
        {nav.items.map((item) =>
          item.isGroup ? (
            <div key={item.key} className="side-nav-group side-ai-group" role="group" aria-label={item.label}>
              <div className="side-group-label">{item.label}</div>
              {item.children.map(renderItem)}
            </div>
          ) : (
            renderItem(item)
          )
        )}
      </nav>

      <div className="side-foot">
        <Link to="/" style={{ color: "inherit" }}>← Back to public site</Link>
        <button className="btn btn-sm btn-outline" type="button" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    </aside>
  );
}
