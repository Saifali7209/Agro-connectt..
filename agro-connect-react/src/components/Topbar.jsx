import { Link } from "react-router-dom";
import Icon from "./Icon.jsx";
import useAuth from "../hooks/useAuth.js";
import { initials } from "../legacy/js/utils.js";

/**
 * Console topbar. The avatar and title come from the authenticated profile, so
 * the old "Signed-out preview" placeholder is no longer reachable — a console
 * only renders behind <ProtectedRoute>.
 */
export default function Topbar({ title, role }) {
  const { user } = useAuth();
  const notificationsPath = `/${role}/notifications`;
  const messagesPath = `/${role}/messages`;
  const hasInbox = role === "farmer" || role === "buyer";

  return (
    <header className="app-topbar">
      <h1>{title}</h1>
      <div className="topbar-spacer" />
      {hasInbox && (
        <>
          <Link className="icon-btn" to={notificationsPath} aria-label="Notifications">
            <Icon name="bell" />
            <span className="dot" />
          </Link>
          <Link className="icon-btn" to={messagesPath} aria-label="Messages">
            <Icon name="chat" />
          </Link>
        </>
      )}
      <span className="avatar" title={user?.name || "Account"}>
        {initials(user?.name || "AC")}
      </span>
    </header>
  );
}
