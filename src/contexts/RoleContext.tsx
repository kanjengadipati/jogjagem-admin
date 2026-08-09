"use client";

import { createContext, useContext } from "react";

const RoleContext = createContext<string>("");

export function RoleProvider({
  role,
  children,
}: {
  role: string;
  children: React.ReactNode;
}) {
  return <RoleContext.Provider value={role}>{children}</RoleContext.Provider>;
}

export function useRole(): string {
  return useContext(RoleContext);
}
