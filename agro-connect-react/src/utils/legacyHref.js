/**
 * Translates a legacy `.html` href into its React Router path.
 *
 *   /index.html                      -> /
 *   /pages/login.html                -> /login
 *   /pages/crop-details.html?id=7    -> /crop-details?id=7
 *   /farmer/orders.html              -> /farmer/orders
 *
 * This lets the ported page modules keep emitting the anchors they always did
 * while navigation still happens inside the router, with no page reload.
 */
export function toRoutePath(href) {
  if (!href) return null;

  let path = href;

  // Absolute URLs: only rewrite our own origin; leave external links alone.
  if (/^https?:\/\//i.test(href)) {
    try {
      const url = new URL(href);
      if (url.origin !== window.location.origin) return null;
      path = url.pathname + url.search + url.hash;
    } catch {
      return null;
    }
  }

  if (path.startsWith("#") || path.startsWith("mailto:") || path.startsWith("tel:")) return null;
  if (!path.startsWith("/")) path = `/${path}`;

  const splitAt = path.search(/[?#]/);
  const pathname = splitAt === -1 ? path : path.slice(0, splitAt);
  const suffix = splitAt === -1 ? "" : path.slice(splitAt);

  let clean = pathname
    .replace(/^\/agro/, "")        // old deploy prefix
    .replace(/\.html$/, "")        // /farmer/orders.html -> /farmer/orders
    .replace(/^\/pages\//, "/");   // /pages/login        -> /login

  if (clean === "" || clean === "/index") clean = "/";

  return `${clean}${suffix}`;
}

/** True when the href points somewhere inside this application. */
export function isInternalHref(href) {
  return toRoutePath(href) !== null;
}

/**
 * Bridge from the ported vanilla-JS screen modules (which are plain
 * `render(main)` functions with no hook access) into React Router.
 *
 * A handful of pages used to finish an action with `window.location.href =
 * "...html"` — that always full-reloads the app, and because the target was
 * still an old-style `.html` path with no matching route, the reload landed
 * on the 404 page instead of the screen the user was sent to. <LegacyPage>
 * registers the real `navigate` here once, and page modules call
 * `legacyNavigate(href)` wherever they used to assign `window.location.href`.
 */
let boundNavigate = null;

export function bindLegacyNavigate(navigate) {
  boundNavigate = navigate;
}

export function legacyNavigate(href, options) {
  const to = toRoutePath(href);
  if (to && boundNavigate) {
    boundNavigate(to, options);
    return;
  }
  // No router bound yet, or the href points outside the app — fall back to
  // a real navigation rather than silently doing nothing.
  window.location.href = to ?? href;
}
