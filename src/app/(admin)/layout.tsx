import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/constants";
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

  return (
    <ToastProvider>
      <SidebarProvider>
        <div className="flex min-h-screen relative">
          <Sidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </ToastProvider>
  );
}
