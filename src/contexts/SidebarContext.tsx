"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type SidebarContextType = {
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);

  return (
    <SidebarContext.Provider value={{ isMobileOpen, toggleMobileSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    return { isMobileOpen: false, toggleMobileSidebar: () => {} };
  }
  return context;
}
