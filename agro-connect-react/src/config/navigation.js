/**
 * Navigation data, ported from legacy/js/navigation.js.
 * The only change is that every `href` is now a React Router path (no .html).
 * Labels, order, grouping and icons are untouched.
 */

export const PUBLIC_LINKS = [
  { label: "Marketplace", to: "/marketplace", key: "marketplace" },
  { label: "Farmers", to: "/farmers", key: "farmers" },
  { label: "AI Crop Doctor", to: "/ai-crop-doctor", key: "ai-crop-doctor" },
  { label: "Demand Forecasting", to: "/farmer/demand-forecasting", key: "demand-forecasting" },
  { label: "Route Optimization", to: "/buyer/route-optimization", key: "route-optimization" },
  { label: "About", to: "/about", key: "about" },
  { label: "FAQ", to: "/faq", key: "faq" },
  { label: "Contact", to: "/contact", key: "contact" },
];

export const CONSOLE_NAV = {
  farmer: {
    label: "Farmer console",
    items: [
      { key: "dashboard", label: "Dashboard", to: "/farmer/dashboard", icon: "chart" },
      { key: "profile", label: "My Farm", to: "/farmer/profile", icon: "user" },
      { key: "my-crops", label: "My Crops", to: "/farmer/my-crops", icon: "leaf" },
      { key: "add-crop", label: "Add Crop", to: "/farmer/add-crop", icon: "box" },
      { key: "orders", label: "Orders", to: "/farmer/orders", icon: "shop" },
      { key: "messages", label: "Messages", to: "/farmer/messages", icon: "chat" },
      { key: "notifications", label: "Notifications", to: "/farmer/notifications", icon: "bell" },
      {
        key: "ai-group",
        isGroup: true,
        label: "AI Intelligence",
        children: [
          { key: "ai", label: "AI Crop Doctor", to: "/ai-crop-doctor", icon: "robot" },
          { key: "demand-forecasting", label: "Demand Forecasting", to: "/farmer/demand-forecasting", icon: "trendingUp" },
          { key: "route-optimization", label: "Route Optimization", to: "/farmer/route-optimization", icon: "mapPin" },
        ],
      },
      { key: "crop-health", label: "Crop Health", to: "/farmer/crop-health", icon: "shield" },
      { key: "weather", label: "Weather", to: "/farmer/weather", icon: "cloud" },
      { key: "price-intelligence", label: "Price Intelligence", to: "/farmer/price-intelligence", icon: "tag" },
      { key: "settings", label: "Settings", to: "/farmer/settings", icon: "gear" },
    ],
  },
  buyer: {
    label: "Buyer console",
    items: [
      { key: "dashboard", label: "Dashboard", to: "/buyer/dashboard", icon: "chart" },
      { key: "find-crops", label: "Find Crops", to: "/buyer/find-crops", icon: "shop" },
      { key: "orders", label: "Orders", to: "/buyer/orders", icon: "box" },
      { key: "route-optimization", label: "Route Optimization", to: "/buyer/route-optimization", icon: "mapPin" },
      { key: "saved-crops", label: "Saved Crops", to: "/buyer/saved-crops", icon: "heart" },
      { key: "messages", label: "Messages", to: "/buyer/messages", icon: "chat" },
      { key: "notifications", label: "Notifications", to: "/buyer/notifications", icon: "bell" },
      { key: "payments", label: "Payments", to: "/buyer/payments", icon: "tag" },
      { key: "reviews", label: "Reviews", to: "/buyer/reviews", icon: "star" },
      { key: "settings", label: "Settings", to: "/buyer/settings", icon: "gear" },
    ],
  },
  expert: {
    label: "Expert console",
    items: [
      { key: "dashboard", label: "Dashboard", to: "/expert/dashboard", icon: "chart" },
      { key: "pending-reviews", label: "Pending Reviews", to: "/expert/pending-reviews", icon: "list" },
      { key: "review-case", label: "Review Case", to: "/expert/review-case", icon: "robot" },
      { key: "profile", label: "Profile", to: "/expert/profile", icon: "user" },
    ],
  },
  admin: {
    label: "Admin console",
    items: [
      { key: "dashboard", label: "Dashboard", to: "/admin/dashboard", icon: "chart" },
      { key: "users", label: "Users", to: "/admin/users", icon: "user" },
      { key: "farmers", label: "Farmers", to: "/admin/farmers", icon: "leaf" },
      { key: "buyers", label: "Buyers", to: "/admin/buyers", icon: "shop" },
      { key: "experts", label: "Experts", to: "/admin/experts", icon: "shield" },
      { key: "crops", label: "Crops", to: "/admin/crops", icon: "box" },
      { key: "listings", label: "Listings", to: "/admin/listings", icon: "list" },
      { key: "orders", label: "Orders", to: "/admin/orders", icon: "tag" },
      { key: "ai-analytics", label: "AI Analytics", to: "/admin/ai-analytics", icon: "robot" },
      { key: "knowledge-base", label: "Knowledge Base", to: "/admin/knowledge-base", icon: "book" },
      { key: "model-management", label: "Model Management", to: "/admin/model-management", icon: "cpu" },
      { key: "reports", label: "Reports", to: "/admin/reports", icon: "file" },
      { key: "audit-logs", label: "Audit Logs", to: "/admin/audit-logs", icon: "list" },
      { key: "settings", label: "Settings", to: "/admin/settings", icon: "gear" },
    ],
  },
};

export const BOTTOM_NAV = {
  farmer: [
    { label: "Home", to: "/farmer/dashboard", icon: "home", key: "dashboard" },
    { label: "Market", to: "/marketplace", icon: "shop", key: "marketplace" },
    { label: "AI Doctor", to: "/ai-crop-doctor", icon: "robot", key: "ai" },
    { label: "Orders", to: "/farmer/orders", icon: "box", key: "orders" },
    { label: "Profile", to: "/farmer/profile", icon: "user", key: "profile" },
  ],
  buyer: [
    { label: "Home", to: "/buyer/dashboard", icon: "home", key: "dashboard" },
    { label: "Find", to: "/buyer/find-crops", icon: "shop", key: "find-crops" },
    { label: "Saved", to: "/buyer/saved-crops", icon: "heart", key: "saved-crops" },
    { label: "Orders", to: "/buyer/orders", icon: "box", key: "orders" },
    { label: "Profile", to: "/buyer/settings", icon: "user", key: "settings" },
  ],
  public: [
    { label: "Home", to: "/", icon: "home", key: "home" },
    { label: "Market", to: "/marketplace", icon: "shop", key: "marketplace" },
    { label: "AI Doctor", to: "/ai-crop-doctor", icon: "robot", key: "ai-crop-doctor" },
    { label: "Farmers", to: "/farmers", icon: "leaf", key: "farmers" },
    { label: "Sign in", to: "/login", icon: "user", key: "login" },
  ],
};
