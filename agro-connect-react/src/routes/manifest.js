/**
 * AGRO CONNECT — the single route manifest.
 *
 * Every screen in the application is declared here exactly once. The route
 * table, the console topbar title and the sidebar active state are all derived
 * from this file, so a route can never be registered without also declaring who
 * is allowed to open it.
 *
 * `title` and `navKey` are the values the original page modules exported, so
 * headings and sidebar highlighting are unchanged.
 */

/** Public screens — no session required. */
export const PUBLIC_ROUTES = [
  { path: "/",               moduleId: "pages-home",           title: "Agro Connect",   navKey: "home" },
  { path: "/marketplace",    moduleId: "pages-marketplace",    title: "Marketplace",    navKey: "marketplace" },
  { path: "/crop-details",   moduleId: "pages-crop-details",   title: "Crop details",   navKey: "marketplace" },
  { path: "/farmers",        moduleId: "pages-farmers",        title: "Farmers",        navKey: "farmers" },
  { path: "/farmer-profile", moduleId: "pages-farmer-profile", title: "Farmer profile", navKey: "farmers" },
  { path: "/ai-crop-doctor", moduleId: "pages-ai-crop-doctor", title: "AI Crop Doctor", navKey: "ai-crop-doctor" },
  { path: "/about",          moduleId: "pages-about",          title: "About",          navKey: "about" },
  { path: "/faq",            moduleId: "pages-faq",            title: "FAQ",            navKey: "faq" },
  { path: "/contact",        moduleId: "pages-contact",        title: "Contact",        navKey: "contact" },
];

/** Role consoles — every entry is mounted behind <ProtectedRoute>. */
export const CONSOLE_ROUTES = {
  farmer: [
    { path: "dashboard",           moduleId: "farmer-dashboard",           title: "Farmer Dashboard",   navKey: "dashboard" },
    { path: "profile",             moduleId: "farmer-profile",             title: "My Farm",            navKey: "profile" },
    { path: "my-crops",            moduleId: "farmer-my-crops",            title: "My Crops",           navKey: "my-crops" },
    { path: "add-crop",            moduleId: "farmer-add-crop",            title: "Add Crop",           navKey: "add-crop" },
    { path: "orders",              moduleId: "farmer-orders",              title: "Orders",             navKey: "orders" },
    { path: "order-details",       moduleId: "farmer-order-details",       title: "Order details",      navKey: "orders" },
    { path: "messages",            moduleId: "farmer-messages",            title: "Messages",           navKey: "messages" },
    { path: "notifications",       moduleId: "farmer-notifications",       title: "Notifications",      navKey: "notifications" },
    { path: "crop-health",         moduleId: "farmer-crop-health",         title: "Crop Health",        navKey: "crop-health" },
    { path: "weather",             moduleId: "farmer-weather",             title: "Weather",            navKey: "weather" },
    { path: "price-intelligence",  moduleId: "farmer-price-intelligence",  title: "Price Intelligence", navKey: "price-intelligence" },
    { path: "demand-forecasting",  moduleId: "farmer-demand-forecasting",  title: "Demand Forecasting", navKey: "demand-forecasting" },
    { path: "route-optimization",  moduleId: "farmer-route-optimization",  title: "Route Optimization", navKey: "route-optimization" },
    { path: "settings",            moduleId: "farmer-settings",            title: "Settings",           navKey: "settings" },
  ],
  buyer: [
    { path: "dashboard",          moduleId: "buyer-dashboard",          title: "Buyer Dashboard",    navKey: "dashboard" },
    { path: "find-crops",         moduleId: "buyer-find-crops",         title: "Find Crops",         navKey: "find-crops" },
    { path: "crop-details",       moduleId: "buyer-crop-details",       title: "Crop details",       navKey: "find-crops" },
    { path: "checkout",           moduleId: "buyer-checkout",           title: "Checkout",           navKey: "find-crops" },
    { path: "orders",             moduleId: "buyer-orders",             title: "Orders",             navKey: "orders" },
    { path: "order-details",      moduleId: "buyer-order-details",      title: "Order details",      navKey: "orders" },
    { path: "route-optimization", moduleId: "buyer-route-optimization", title: "Route Optimization", navKey: "route-optimization" },
    { path: "saved-crops",        moduleId: "buyer-saved-crops",        title: "Saved Crops",        navKey: "saved-crops" },
    { path: "messages",           moduleId: "buyer-messages",           title: "Messages",           navKey: "messages" },
    { path: "notifications",      moduleId: "buyer-notifications",      title: "Notifications",      navKey: "notifications" },
    { path: "payments",           moduleId: "buyer-payments",           title: "Payments",           navKey: "payments" },
    { path: "reviews",            moduleId: "buyer-reviews",            title: "Reviews",            navKey: "reviews" },
    { path: "settings",           moduleId: "buyer-settings",           title: "Settings",           navKey: "settings" },
  ],
  expert: [
    { path: "dashboard",       moduleId: "expert-dashboard",       title: "Expert Dashboard", navKey: "dashboard" },
    { path: "pending-reviews", moduleId: "expert-pending-reviews", title: "Pending Reviews",  navKey: "pending-reviews" },
    { path: "review-case",     moduleId: "expert-review-case",     title: "Review Case",      navKey: "review-case" },
    { path: "profile",         moduleId: "expert-profile",         title: "Profile",          navKey: "profile" },
  ],
  admin: [
    { path: "dashboard",        moduleId: "admin-dashboard",        title: "Admin Dashboard",  navKey: "dashboard" },
    { path: "users",            moduleId: "admin-users",            title: "Users",            navKey: "users" },
    { path: "farmers",          moduleId: "admin-farmers",          title: "Farmers",          navKey: "farmers" },
    { path: "buyers",           moduleId: "admin-buyers",           title: "Buyers",           navKey: "buyers" },
    { path: "experts",          moduleId: "admin-experts",          title: "Experts",          navKey: "experts" },
    { path: "crops",            moduleId: "admin-crops",            title: "Crops",            navKey: "crops" },
    { path: "listings",         moduleId: "admin-listings",         title: "Listings",         navKey: "listings" },
    { path: "orders",           moduleId: "admin-orders",           title: "Orders",           navKey: "orders" },
    { path: "ai-analytics",     moduleId: "admin-ai-analytics",     title: "AI Analytics",     navKey: "ai-analytics" },
    { path: "knowledge-base",   moduleId: "admin-knowledge-base",   title: "Knowledge Base",   navKey: "knowledge-base" },
    { path: "model-management", moduleId: "admin-model-management", title: "Model Management", navKey: "model-management" },
    { path: "reports",          moduleId: "admin-reports",          title: "Reports",          navKey: "reports" },
    { path: "audit-logs",       moduleId: "admin-audit-logs",       title: "Audit Logs",       navKey: "audit-logs" },
    { path: "settings",         moduleId: "admin-settings",         title: "Settings",         navKey: "settings" },
  ],
};

export const CONSOLE_ROLES = Object.keys(CONSOLE_ROUTES);

/** Look up the console screen that owns a pathname, for the topbar and sidebar. */
export function findConsoleRoute(pathname) {
  const [, role, slug] = pathname.split("/");
  const routes = CONSOLE_ROUTES[role];
  if (!routes) return null;
  const match = routes.find((r) => r.path === slug);
  return match ? { ...match, role } : null;
}
