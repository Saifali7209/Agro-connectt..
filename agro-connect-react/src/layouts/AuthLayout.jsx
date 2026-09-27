import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import SkipLink from "../components/SkipLink.jsx";
import { APP_CONFIG } from "../legacy/js/config.js";

/**
 * Bare chrome for the sign-in / sign-up / password screens. These pages ship
 * their own full-bleed .auth-wrap layout, exactly as they did before, so no
 * header or footer is rendered around them.
 */
export default function AuthLayout() {
  useEffect(() => { document.title = `Sign in — ${APP_CONFIG.NAME}`; }, []);
  return (
    <>
      <SkipLink />
      <Outlet />
    </>
  );
}
