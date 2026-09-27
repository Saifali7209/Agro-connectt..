import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import BottomNav from "../components/BottomNav.jsx";
import SkipLink from "../components/SkipLink.jsx";
import { PUBLIC_ROUTES } from "../routes/manifest.js";
import { APP_CONFIG } from "../legacy/js/config.js";

/** Public site chrome: skip link, header, page, footer, mobile bottom nav. */
export default function PublicLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    const meta = PUBLIC_ROUTES.find((r) => r.path === pathname);
    document.title = meta && meta.path !== "/"
      ? `${meta.title} — ${APP_CONFIG.NAME}`
      : `${APP_CONFIG.NAME} — ${APP_CONFIG.TAGLINE}`;
  }, [pathname]);

  return (
    <>
      <SkipLink />
      <Navbar />
      <Outlet />
      <Footer />
      <BottomNav variant="public" />
    </>
  );
}
