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

  let role: AdminRole = "admin";
  const payload = decodeJwtPayload(token);
  if (payload?.role === "superadmin") {
    role = "superadmin";
  }

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
