import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/constants";
import { decodeJwtPayload } from "@/lib/jwt";
import type { AdminRole } from "@/types";
import { SidebarProvider } from "@/contexts/SidebarContext";
import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) redirect("/login");

  const payload = decodeJwtPayload(token);
  const userRole = payload?.role;

  // Strict Role Guard:
  // If user is a partner, redirect them to Business Portal /partner
  if (userRole === "partner" || userRole === "business_owner") {
    redirect("/business");
  }

  // If user is a regular user (not admin/superadmin), kick them out to login
  if (userRole !== "admin" && userRole !== "superadmin") {
    redirect("/login");
  }

  const role: AdminRole = userRole === "superadmin" ? "superadmin" : "admin";

  return (
    <ToastProvider>
      <SidebarProvider>
        <div className="flex min-h-screen relative">
          <Sidebar role={role} />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </ToastProvider>
  );
}
