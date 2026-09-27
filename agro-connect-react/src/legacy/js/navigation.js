/** AGRO CONNECT — header, footer, console sidebar and mobile bottom navigation. */
import { APP_CONFIG } from "./config.js";
import { el, els, node } from "./ui.js";
import { getProfile, clearSession } from "./auth.js";
import { initials, escapeHtml } from "./utils.js";

const B = APP_CONFIG.BASE_PATH;

export const icon = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  shop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 8h16l-1 11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 20c0-8 6-14 16-14 0 10-6 15-14 14"/><path d="M4 20c4-3 7-6 10-10"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 8 12 3l9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.5A8 8 0 1 1 21 12z"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M18 15V10a6 6 0 1 0-12 0v5l-2 3h16z"/><path d="M10 21h4"/></svg>',
  robot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M9 13h.01M15 13h.01"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 20s-7-4.4-7-9.2A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.8C19 15.6 12 20 12 20z"/></svg>',
  cloud: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M7 18a4 4 0 0 1 .6-8 5.5 5.5 0 0 1 10.6 1.4A3.5 3.5 0 0 1 17.5 18z"/></svg>',
  tag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 12V4h8l9 9-8 8z"/><circle cx="7.5" cy="7.5" r="1.4"/></svg>',
  gear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="3.2"/><path d="M4 12h2m12 0h2M12 4v2m0 12v2M6.3 6.3l1.4 1.4m8.6 8.6 1.4 1.4m0-11.4-1.4 1.4M7.7 16.3l-1.4 1.4"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 4h9a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4z"/><path d="M20 4h-1a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h1z"/></svg>',
  list: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01"/></svg>',
  cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="7" y="7" width="10" height="10" rx="2"/><path d="M4 10h3M4 14h3m10-4h3m-3 4h3M10 4v3m4-3v3m-4 10v3m4-3v3"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="m12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4L4.2 9.7l5.4-.8z"/></svg>',
  trendingUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
  mapPin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  logo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 21c0-6 3.5-10 9-11-1 6-4.5 9.5-9 10z"/><path d="M12 21C12 15 8.5 11 3 10c1 6 4.5 9.5 9 10z"/><circle cx="12" cy="5" r="2.2"/><path d="M12 7.2V12"/></svg>',
};

export function brandMarkup({ compact = false, href = `${B}/index.html` } = {}) {
  return `<a class="brand" href="${href}" aria-label="Agro Connect home">
    <span class="brand-mark" aria-hidden="true">${icon.logo}</span>
    <span><span class="brand-name">AGRO <span>CONNECT</span></span>
    ${compact ? "" : `<span class="brand-tag">${APP_CONFIG.TAGLINE}</span>`}</span></a>`;
}

const PUBLIC_LINKS = [
  { label: "Marketplace", href: `${B}/pages/marketplace.html`, key: "marketplace" },
  { label: "Farmers", href: `${B}/pages/farmers.html`, key: "farmers" },
  { label: "AI Crop Doctor", href: `${B}/pages/ai-crop-doctor.html`, key: "ai-crop-doctor" },
  { label: "Demand Forecasting", href: `${B}/farmer/demand-forecasting.html`, key: "demand-forecasting" },
  { label: "Route Optimization", href: `${B}/buyer/route-optimization.html`, key: "route-optimization" },
  { label: "About", href: `${B}/pages/about.html`, key: "about" },
  { label: "FAQ", href: `${B}/pages/faq.html`, key: "faq" },
  { label: "Contact", href: `${B}/pages/contact.html`, key: "contact" },
];

export function renderPublicHeader(activeKey) {
  const header = node("header", { class: "site-header" });
  header.innerHTML = `<div class="container">
    ${brandMarkup({ compact: true })}
    <nav class="site-nav" id="site-nav" aria-label="Main">
      ${PUBLIC_LINKS.map((l) => `<a href="${l.href}"${l.key === activeKey ? ' aria-current="page"' : ""}>${l.label}</a>`).join("")}
    </nav>
    <div class="header-actions">
      <a class="btn btn-outline btn-sm" href="${B}/pages/login.html">Sign in</a>
      <a class="btn btn-primary btn-sm" href="${B}/pages/register.html">Get started</a>
    </div></div>`;
  return header;
}

export function renderPublicFooter() {
  const footer = node("footer", { class: "site-footer" });
  footer.innerHTML = `<div class="container">
    <div class="footer-grid">
      <div>${brandMarkup()}
        <p class="text-muted" style="margin-top:12px;max-width:38ch;font-size:var(--fs-sm);color:rgba(242,247,243,.7)">
          A direct farmer-to-buyer agricultural marketplace with AI-assisted crop health support for Indian growers.</p></div>
      <div><h5>Marketplace</h5><ul>
        <li><a href="${B}/pages/marketplace.html">Browse crops</a></li>
        <li><a href="${B}/pages/farmers.html">Find farmers</a></li>
        <li><a href="${B}/buyer/find-crops.html">Buyer console</a></li>
        <li><a href="${B}/farmer/add-crop.html">List a crop</a></li></ul></div>
      <div><h5>Intelligence</h5><ul>
        <li><a href="${B}/pages/ai-crop-doctor.html">AI Crop Doctor</a></li>
        <li><a href="${B}/farmer/demand-forecasting.html">Demand forecasting</a></li>
        <li><a href="${B}/farmer/crop-health.html">Crop health</a></li>
        <li><a href="${B}/farmer/price-intelligence.html">Price intelligence</a></li>
        <li><a href="${B}/farmer/weather.html">Weather</a></li></ul></div>
      <div><h5>Company</h5><ul>
        <li><a href="${B}/pages/about.html">About</a></li>
        <li><a href="${B}/pages/faq.html">FAQ</a></li>
        <li><a href="${B}/pages/contact.html">Contact</a></li>
        <li><a href="${B}/expert/dashboard.html">Expert console</a></li>
        <li><a href="${B}/admin/dashboard.html">Admin console</a></li></ul></div>
    </div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} Agro Connect. ${APP_CONFIG.TAGLINE}</span>
      <span>Frontend build — connects to the Agro Connect API.</span></div></div>`;
  return footer;
}

/* ---------------- Console navigation ---------------- */

export const CONSOLE_NAV = {
  farmer: {
    label: "Farmer console",
    items: [
      { key: "dashboard", label: "Dashboard", href: `${B}/farmer/dashboard.html`, icon: "chart" },
      { key: "profile", label: "My Farm", href: `${B}/farmer/profile.html`, icon: "user" },
      { key: "my-crops", label: "My Crops", href: `${B}/farmer/my-crops.html`, icon: "leaf" },
      { key: "add-crop", label: "Add Crop", href: `${B}/farmer/add-crop.html`, icon: "box" },
      { key: "orders", label: "Orders", href: `${B}/farmer/orders.html`, icon: "shop" },
      { key: "messages", label: "Messages", href: `${B}/farmer/messages.html`, icon: "chat" },
      { key: "notifications", label: "Notifications", href: `${B}/farmer/notifications.html`, icon: "bell" },
      {
        key: "ai-group",
        isGroup: true,
        label: "AI Intelligence",
        children: [
          { key: "ai", label: "AI Crop Doctor", href: `${B}/pages/ai-crop-doctor.html`, icon: "robot" },
          { key: "demand-forecasting", label: "Demand Forecasting", href: `${B}/farmer/demand-forecasting.html`, icon: "trendingUp" },
          { key: "route-optimization", label: "Route Optimization", href: `${B}/farmer/route-optimization.html`, icon: "mapPin" },
        ],
      },
      { key: "crop-health", label: "Crop Health", href: `${B}/farmer/crop-health.html`, icon: "shield" },
      { key: "weather", label: "Weather", href: `${B}/farmer/weather.html`, icon: "cloud" },
      { key: "price-intelligence", label: "Price Intelligence", href: `${B}/farmer/price-intelligence.html`, icon: "tag" },
      { key: "settings", label: "Settings", href: `${B}/farmer/settings.html`, icon: "gear" },
    ],
  },
  buyer: {
    label: "Buyer console",
    items: [
      { key: "dashboard", label: "Dashboard", href: `${B}/buyer/dashboard.html`, icon: "chart" },
      { key: "find-crops", label: "Find Crops", href: `${B}/buyer/find-crops.html`, icon: "shop" },
      { key: "orders", label: "Orders", href: `${B}/buyer/orders.html`, icon: "box" },
      { key: "route-optimization", label: "Route Optimization", href: `${B}/buyer/route-optimization.html`, icon: "mapPin" },
      { key: "saved-crops", label: "Saved Crops", href: `${B}/buyer/saved-crops.html`, icon: "heart" },
      { key: "messages", label: "Messages", href: `${B}/buyer/messages.html`, icon: "chat" },
      { key: "notifications", label: "Notifications", href: `${B}/buyer/notifications.html`, icon: "bell" },
      { key: "payments", label: "Payments", href: `${B}/buyer/payments.html`, icon: "tag" },
      { key: "reviews", label: "Reviews", href: `${B}/buyer/reviews.html`, icon: "star" },
      { key: "settings", label: "Settings", href: `${B}/buyer/settings.html`, icon: "gear" },
    ],
  },
  expert: {
    label: "Expert console",
    items: [
      { key: "dashboard", label: "Dashboard", href: `${B}/expert/dashboard.html`, icon: "chart" },
      { key: "pending-reviews", label: "Pending Reviews", href: `${B}/expert/pending-reviews.html`, icon: "list" },
      { key: "review-case", label: "Review Case", href: `${B}/expert/review-case.html`, icon: "robot" },
      { key: "profile", label: "Profile", href: `${B}/expert/profile.html`, icon: "user" },
    ],
  },
  admin: {
    label: "Admin console",
    items: [
      { key: "dashboard", label: "Dashboard", href: `${B}/admin/dashboard.html`, icon: "chart" },
      { key: "users", label: "Users", href: `${B}/admin/users.html`, icon: "user" },
      { key: "farmers", label: "Farmers", href: `${B}/admin/farmers.html`, icon: "leaf" },
      { key: "buyers", label: "Buyers", href: `${B}/admin/buyers.html`, icon: "shop" },
      { key: "experts", label: "Experts", href: `${B}/admin/experts.html`, icon: "shield" },
      { key: "crops", label: "Crops", href: `${B}/admin/crops.html`, icon: "box" },
      { key: "listings", label: "Listings", href: `${B}/admin/listings.html`, icon: "list" },
      { key: "orders", label: "Orders", href: `${B}/admin/orders.html`, icon: "tag" },
      { key: "ai-analytics", label: "AI Analytics", href: `${B}/admin/ai-analytics.html`, icon: "robot" },
      { key: "knowledge-base", label: "Knowledge Base", href: `${B}/admin/knowledge-base.html`, icon: "book" },
      { key: "model-management", label: "Model Management", href: `${B}/admin/model-management.html`, icon: "cpu" },
      { key: "reports", label: "Reports", href: `${B}/admin/reports.html`, icon: "file" },
      { key: "audit-logs", label: "Audit Logs", href: `${B}/admin/audit-logs.html`, icon: "list" },
      { key: "settings", label: "Settings", href: `${B}/admin/settings.html`, icon: "gear" },
    ],
  },
};

export function renderSidebar(role, activeKey) {
  const nav = CONSOLE_NAV[role];
  const aside = node("aside", { class: "app-sidebar", id: "app-sidebar" });
  const itemsHtml = nav.items.map((i) => {
    if (i.isGroup) {
      return `<div class="side-nav-group side-ai-group" role="group" aria-label="${i.label}">
        <div class="side-group-label">${i.label}</div>
        ${i.children.map((c) => `<a href="${c.href}" title="${escapeHtml(c.label)}"${c.key === activeKey || (c.key === "ai" && activeKey === "ai-crop-doctor") ? ' aria-current="page"' : ""}>${icon[c.icon] || ""}<span>${c.label}</span></a>`).join("")}
      </div>`;
    }
    return `<a href="${i.href}" title="${escapeHtml(i.label)}"${i.key === activeKey ? ' aria-current="page"' : ""}>${icon[i.icon] || ""}<span>${i.label}</span></a>`;
  }).join("");

  aside.innerHTML = `${brandMarkup({ compact: true })}
    <p class="side-role">${nav.label}</p>
    <nav class="side-nav" aria-label="${nav.label}">
      ${itemsHtml}
    </nav>
    <div class="side-foot">
      <a href="${B}/index.html" style="color:inherit">← Back to public site</a>
      <button class="btn btn-sm btn-outline" type="button" data-signout>Sign out</button>
    </div>`;
  el("[data-signout]", aside).addEventListener("click", () => {
    clearSession();
    window.location.href = `${B}/pages/login.html`;
  });
  return aside;
}

export function renderTopbar(title, role) {
  const profile = getProfile();
  const bar = node("header", { class: "app-topbar" });
  bar.innerHTML = `
    <h1>${title}</h1>
    <div class="topbar-spacer"></div>
    <a class="icon-btn" href="${B}/${role}/notifications.html" aria-label="Notifications">${icon.bell}<span class="dot"></span></a>
    <a class="icon-btn" href="${B}/${role}/messages.html" aria-label="Messages">${icon.chat}</a>
    <span class="avatar" title="${profile?.name || "Signed-out preview"}">${initials(profile?.name || "AC")}</span>`;
  return bar;
}

/** Mobile bottom navigation — the primary way farmers move around on a phone. */
export function renderBottomNav(role, activeKey) {
  const map = {
    farmer: [
      { label: "Home", href: `${B}/farmer/dashboard.html`, icon: "home", key: "dashboard" },
      { label: "Market", href: `${B}/pages/marketplace.html`, icon: "shop", key: "marketplace" },
      { label: "AI Doctor", href: `${B}/pages/ai-crop-doctor.html`, icon: "robot", key: "ai" },
      { label: "Orders", href: `${B}/farmer/orders.html`, icon: "box", key: "orders" },
      { label: "Profile", href: `${B}/farmer/profile.html`, icon: "user", key: "profile" },
    ],
    buyer: [
      { label: "Home", href: `${B}/buyer/dashboard.html`, icon: "home", key: "dashboard" },
      { label: "Find", href: `${B}/buyer/find-crops.html`, icon: "shop", key: "find-crops" },
      { label: "Saved", href: `${B}/buyer/saved-crops.html`, icon: "heart", key: "saved-crops" },
      { label: "Orders", href: `${B}/buyer/orders.html`, icon: "box", key: "orders" },
      { label: "Profile", href: `${B}/buyer/settings.html`, icon: "user", key: "settings" },
    ],
    public: [
      { label: "Home", href: `${B}/index.html`, icon: "home", key: "home" },
      { label: "Market", href: `${B}/pages/marketplace.html`, icon: "shop", key: "marketplace" },
      { label: "AI Doctor", href: `${B}/pages/ai-crop-doctor.html`, icon: "robot", key: "ai-crop-doctor" },
      { label: "Farmers", href: `${B}/pages/farmers.html`, icon: "leaf", key: "farmers" },
      { label: "Sign in", href: `${B}/pages/login.html`, icon: "user", key: "login" },
    ],
  };
  const items = map[role] || map.public;
  const nav = node("nav", { class: "bottom-nav", "aria-label": "Quick navigation" });
  nav.innerHTML = items.map((i) => `<a href="${i.href}"${i.key === activeKey ? ' aria-current="page"' : ""}>${icon[i.icon]}<span>${i.label}</span></a>`).join("");
  document.body.classList.add("has-bottom-nav");
  return nav;
}
