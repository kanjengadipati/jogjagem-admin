import type { MenuGroup, AdminUser } from "@/types";

export const BACKEND_URL =
  process.env.BACKEND_URL || "http://localhost:8081";

export const COOKIE_NAME = "admin_token";

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
      { name: "Partners",     icon: "briefcase",     path: "/partners",        activeId: "partners", badge: "New", badgeColor: "primary" },
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
      { name: "AI Recommendations",   icon: "sparkles",              path: "/ai-recommendations", activeId: "ai-recommendations" },
      { name: "Promotions",           icon: "tag",                   path: "/promotions",       activeId: "promotions"       },
    ],
  },
  {
    title: "Administration",
    items: [
      { name: "User Management", icon: "user-cog", path: "/users",    activeId: "users"    },
      { name: "Role Management", icon: "shield",   path: "/roles",    activeId: "roles"    },
      { name: "Settings",        icon: "settings", path: "/settings", activeId: "settings" },
    ],
  },
];
