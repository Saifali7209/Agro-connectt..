import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/** Router navigation should start at the top of the page, like a page load did. */
export default function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
