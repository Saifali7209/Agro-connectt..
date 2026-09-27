import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar.jsx";
import Topbar from "../components/Topbar.jsx";
import BottomNav from "../components/BottomNav.jsx";
import SkipLink from "../components/SkipLink.jsx";
import { findConsoleRoute } from "../routes/manifest.js";
import { APP_CONFIG } from "../legacy/js/config.js";

/**
 * Console shell for the farmer, buyer, expert and admin areas — the same
 * .app-shell / .app-sidebar / .app-main / .app-topbar structure the original
 * boot-app.js assembled.
 *
 * The title and active sidebar key are read from the route manifest, which is
 * also what builds the route table, so the two can never drift apart.
 */
export default function ConsoleLayout({ role }) {
  const { pathname } = useLocation();
  const meta = findConsoleRoute(pathname);

  useEffect(() => {
    document.title = meta?.title
      ? `${meta.title} — ${APP_CONFIG.NAME}`
      : APP_CONFIG.NAME;
  }, [meta?.title]);

  return (
    <>
      <SkipLink />
      <div className="app-shell">
        <Sidebar role={role} activeKey={meta?.navKey} />
        <div className="app-main">
          <Topbar title={meta?.title || ""} role={role} />
          <Outlet />
        </div>
      </div>
      {(role === "farmer" || role === "buyer") && <BottomNav variant={role} />}
    </>
  );
}
