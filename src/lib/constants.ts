import type { MenuGroup, AdminUser, AdminRole } from "@/types";

export const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8081";

export const COOKIE_NAME = "jogjagem_session";

export const ADMIN_USER: AdminUser = {
  name: "Admin Jogjagem",
  role: "Super Admin",
  email: "admin@explorejogja.com",
  avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com",
};

export const menuGroups: MenuGroup[] = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard",  icon: "layout-dashboard", path: "/dashboard",  activeId: "dashboard"  },
      { name: "Analytics",  icon: "bar-chart-3",      path: "/analytics",  activeId: "analytics"  },
      { name: "Reports",    icon: "file-text",         path: "/reports",    activeId: "reports"    },
    ],
  },
  {
    title: "Tourism Ecosystem",
    items: [
      { name: "Destinations", icon: "map-pin",       path: "/destinations",    activeId: "destinations"    },
      { name: "Events",       icon: "calendar",      path: "/events",          activeId: "events"          },
      { name: "Hotels",       icon: "hotel",         path: "/hotels",          activeId: "hotels"          },
      { name: "Restaurants",  icon: "utensils",      path: "/restaurants",     activeId: "restaurants"     },
      { name: "Partner Applications", icon: "inbox",     path: "/partner-applications", activeId: "partner-applications" },
      { name: "Partners",             icon: "briefcase", path: "/partners",            activeId: "partners" },
      { name: "Partner Approval", icon: "clipboard-list", path: "/partner-approval", activeId: "partner-approval", badge: "New", badgeColor: "warning" },
      { name: "Guides",       icon: "users",         path: "/guides",          activeId: "guides"          },
      { name: "Souvenirs",    icon: "shopping-bag",  path: "/souvenirs",       activeId: "souvenirs"       },
      { name: "Rentals",      icon: "car",           path: "/rentals",         activeId: "rentals"         },
    ],
  },
  {
    title: "Operations & Moderation",
    items: [
      { name: "Review Moderation",    icon: "message-square-dashed", path: "/reviews",          activeId: "reviews",         badge: "18", badgeColor: "danger"  },
      { name: "Travel Stories",       icon: "book-open",             path: "/stories",          activeId: "stories",         badge: "7",  badgeColor: "warning" },
      { name: "Blog Articles",        icon: "file-text",             path: "/articles",         activeId: "articles"         },
      { name: "AI Recommendations",   icon: "sparkles",              path: "/ai-recommendations", activeId: "ai-recommendations" },
      { name: "Promotions",           icon: "tag",                   path: "/promotions",       activeId: "promotions"       },
      { name: "Ad Campaigns",         icon: "megaphone",             path: "/ad-campaigns",     activeId: "ad-campaigns", badge: "New", badgeColor: "primary" },
      { name: "Payments",             icon: "receipt",               path: "/payments",         activeId: "payments" },
      { name: "House Ads",            icon: "panel-top",             path: "/house-ads",        activeId: "house-ads" },
      { name: "Scraper",         icon: "scan",           path: "/scraper",        activeId: "scraper"          },
      { name: "Scraper Review",  icon: "clipboard-list", path: "/scraper/review", activeId: "scraper-review", badge: "New", badgeColor: "primary" },
      { name: "Image Reports",        icon: "flag",                   path: "/image-reports",    activeId: "image-reports"    },
    ],
  },
  {
    title: "Administration",
    items: [
      { name: "User Management", icon: "user-cog", path: "/users",    activeId: "users",    roles: ["superadmin"] },
      { name: "Role Management", icon: "shield",   path: "/roles",    activeId: "roles",    roles: ["superadmin"] },
      { name: "Settings",        icon: "settings", path: "/settings", activeId: "settings" },
    ],
  },
];

export const partnerMenuGroups: MenuGroup[] = [
  {
    title: "Partner Portal",
    items: [
      { name: "Dashboard", icon: "layout-dashboard", path: "/partner", activeId: "dashboard" },
      { name: "My Listings", icon: "briefcase", path: "/partner/listings", activeId: "listings" },
      { name: "Promotions", icon: "tag", path: "/partner/promotions", activeId: "promotions" },
      { name: "Reviews", icon: "message-square", path: "/partner/reviews", activeId: "reviews" },
    ],
  },
];

export function getMenuGroupsForRole(role: AdminRole): MenuGroup[] {
  return menuGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !item.roles || item.roles.includes(role)
      ),
    }))
    .filter((group) => group.items.length > 0);
}

const ROLE_LABELS: Record<AdminRole, string> = {
  admin: "Admin",
  superadmin: "Super Admin",
};

export function getAdminUser(role: AdminRole): AdminUser {
  return {
    name: "Admin Jogjagem",
    role: ROLE_LABELS[role],
    email: "admin@explorejogja.com",
    avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com",
  };
}
