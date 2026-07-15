'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, BarChart3, FileText, MapPin, Calendar, Hotel, 
  Utensils, Briefcase, Users, ShoppingBag, Car, MessageSquareDashed,
  BookOpen, Sparkles, Tag, UserCog, Shield, Settings, ChevronLeft,
  ChevronRight, ExternalLink, Compass
} from 'lucide-react';

const menuGroups = [
  {
    title: "Overview",
    items: [
      { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", activeId: "dashboard" },
      { name: "Analytics", icon: BarChart3, path: "/analytics", activeId: "analytics" },
      { name: "Reports", icon: FileText, path: "/reports", activeId: "reports" },
    ],
  },
  {
    title: "Tourism Ecosystem",
    items: [
      { name: "Destinations", icon: MapPin, path: "/destinations", activeId: "destinations" },
      { name: "Events", icon: Calendar, path: "/events", activeId: "events" },
      { name: "Hotels", icon: Hotel, path: "/hotels", activeId: "hotels" },
      { name: "Restaurants", icon: Utensils, path: "/restaurants", activeId: "restaurants" },
      { name: "Partners", icon: Briefcase, path: "/partners", activeId: "partners", badge: "New", badgeColor: "bg-primary/10 text-primary" },
      { name: "Guides", icon: Users, path: "/guides", activeId: "guides" },
      { name: "Souvenirs", icon: ShoppingBag, path: "/souvenirs", activeId: "souvenirs" },
      { name: "Rentals", icon: Car, path: "/rentals", activeId: "rentals" },
    ],
  },
  {
    title: "Operations & Moderation",
    items: [
      { name: "Review Moderation", icon: MessageSquareDashed, path: "/reviews", activeId: "reviews", badge: "18", badgeColor: "bg-danger/10 text-danger" },
      { name: "Travel Stories", icon: BookOpen, path: "/stories", activeId: "stories", badge: "7", badgeColor: "bg-warning/10 text-warning" },
      { name: "AI Recommendations", icon: Sparkles, path: "/ai-recommendations", activeId: "ai-recommendations" },
      { name: "Promotions", icon: Tag, path: "/promotions", activeId: "promotions" },
    ],
  },
  {
    title: "Administration",
    items: [
      { name: "User Management", icon: UserCog, path: "/users", activeId: "users" },
      { name: "Role Management", icon: Shield, path: "/roles", activeId: "roles" },
      { name: "Settings", icon: Settings, path: "/settings", activeId: "settings" },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      id="app-sidebar"
      className={`${collapsed ? 'w-20' : 'w-72'} flex-shrink-0 border-r border-border bg-white min-h-screen flex flex-col transition-premium duration-300 z-30`}
    >
      <div className="h-20 flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center shadow-premium">
            <img src="/logo-gold.png" alt="Logo" className="w-10 h-10 object-contain" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="font-display font-extrabold text-base tracking-tight text-primary leading-none">EXPLORE JOGJA</h1>
              <span className="text-[10px] font-semibold text-secondary tracking-widest uppercase">Ecosystem Admin</span>
            </div>
          )}
        </div>
        <button 
          onClick={() => setCollapsed(!collapsed)} 
          className="p-1.5 rounded-lg border border-border hover:bg-bg text-gray-500 hover:text-text cursor-pointer transition-premium"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
        {menuGroups.map((group) => (
          <div key={group.title} className="sidebar-group">
            <h3 className={`sidebar-group-title text-[11px] font-bold tracking-wider text-gray-400 uppercase px-3 mb-2.5 flex items-center justify-between ${collapsed ? 'justify-center' : ''}`}>
              {!collapsed && <span>{group.title}</span>}
            </h3>
            <ul className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path || 
                  (item.activeId === 'dashboard' && pathname === '/');
                
                return (
                  <li key={item.path}>
                    <Link 
                      href={item.path} 
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-premium group hover:bg-bg text-gray-600 hover:text-text ${isActive ? 'active-nav-link shadow-premium' : ''}`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5 transition-transform group-hover:scale-105" />
                        {!collapsed && <span className="sidebar-text font-display">{item.name}</span>}
                      </div>
                      {!collapsed && item.badge && (
                        <span className={`sidebar-badge text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {!collapsed && (
        <div className="p-4 border-t border-border mt-auto sidebar-profile-box">
          <div className="space-y-2">
            <a href={process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'} target="_blank" className="flex items-center gap-2.5 p-3 rounded-xl border border-border hover:border-primary/20 hover:bg-primary/5 transition-premium text-xs font-semibold text-gray-700">
              <ExternalLink className="w-4 h-4 text-primary" />
              <span>Visit Main Portal</span>
            </a>
            <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 flex flex-col gap-3 relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-primary/5"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">AI</div>
                <div>
                  <h4 className="text-xs font-bold text-primary font-display">Gemini Assistant</h4>
                  <p className="text-[10px] text-gray-500">System Ready</p>
                </div>
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">Dynamic descriptions, SEO and summaries generated server-side.</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
