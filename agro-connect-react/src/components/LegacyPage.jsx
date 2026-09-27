import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toRoutePath, bindLegacyNavigate } from "../utils/legacyHref.js";
import { APP_CONFIG } from "../legacy/js/config.js";

/**
 * AGRO CONNECT — adapter for the ported screen modules.
 *
 * The original screens are framework-agnostic `render(main)` functions that
 * build DOM and talk to the service layer. Rather than risk changing their
 * behaviour during the migration, this component owns a <main> element, hands
 * it to the module, and manages the React side of the lifecycle:
 *
 *   • loads the module for this route (code-split by Vite),
 *   • re-runs render() when the route or query string changes,
 *   • intercepts clicks on internal anchors and navigates through React Router
 *     instead, so there are no full page reloads,
 *   • tears the DOM down on unmount.
 *
 * Every one of these screens sits behind <ProtectedRoute> in the route table,
 * so the adapter has no bearing on access control.
 *
 * @param {string} moduleId  e.g. "farmer-dashboard" -> src/legacy/js/pages/farmer-dashboard.js
 */
export default function LegacyPage({ moduleId, isConsole = false }) {
  const hostRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState(null);

  // Keep the legacy->router bridge pointed at the live navigate function.
  // useNavigate()'s return value is stable across renders, but re-binding on
  // every render is cheap and avoids any ordering assumptions between
  // multiple LegacyPage instances or route changes.
  bindLegacyNavigate(navigate);

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host) return undefined;

    host.innerHTML = "";
    setError(null);

    (async () => {
      let mod;
      try {
        mod = await import(`../legacy/js/pages/${moduleId}.js`);
      } catch (err) {
        console.error("Screen module failed to load:", moduleId, err);
        if (!cancelled) setError("load");
        return;
      }
      if (cancelled) return;

      try {
        await mod.render(host);
      } catch (err) {
        console.error("Screen render failed:", moduleId, err);
        if (!cancelled) setError("render");
      }
    })();

    return () => {
      cancelled = true;
      if (host) host.innerHTML = "";
    };
    // location.search is a dependency because several screens read ?id= directly.
  }, [moduleId, location.pathname, location.search]);

  /** Keep legacy anchors inside the router. */
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const anchor = event.target.closest?.("a[href]");
      if (!anchor || !host.contains(anchor)) return;
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      const to = toRoutePath(anchor.getAttribute("href"));
      if (!to) return; // external link, mailto:, in-page anchor — leave it alone

      event.preventDefault();
      navigate(to);
    };

    host.addEventListener("click", onClick);
    return () => host.removeEventListener("click", onClick);
  }, [navigate]);

  if (error) {
    return (
      <main id="main" className={isConsole ? "app-content" : ""}>
        <div className="container section">
          <div className="state error">
            <h3>{error === "load" ? "This page could not be loaded" : "This page didn't finish loading"}</h3>
            <p>
              Please refresh. If the problem continues, contact {APP_CONFIG.SUPPORT_EMAIL}.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return <main id="main" className={isConsole ? "app-content" : ""} ref={hostRef} />;
}
