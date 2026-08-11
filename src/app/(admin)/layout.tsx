import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME, FRONTEND_URL } from "@/lib/constants";
import { decodeJwtPayload } from "@/lib/jwt";
import type { AdminRole } from "@/types";
import { SidebarProvider } from "@/contexts/SidebarContext";
import { RoleProvider } from "@/contexts/RoleContext";
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
  // Business owners use the business portal on the public site, not this admin app
  if (userRole === "partner" || userRole === "business_owner") {
    redirect(FRONTEND_URL);
  }

  // If user is a regular user (not admin/superadmin/sales), kick them out to login
  if (userRole !== "admin" && userRole !== "superadmin" && userRole !== "sales") {
    redirect("/login");
  }

  const role: AdminRole =
    userRole === "superadmin" ? "superadmin" : userRole === "sales" ? "sales" : "admin";

  return (
    <ToastProvider>
      <SidebarProvider>
        <RoleProvider role={role}>
          <div className="flex min-h-screen relative">
            <Sidebar role={role} />
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {children}
            </div>
          </div>
        </RoleProvider>
      </SidebarProvider>
    </ToastProvider>
  );
}
