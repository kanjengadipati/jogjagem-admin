import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { COOKIE_NAME } from "@/lib/constants";
import { SidebarProvider } from "@/contexts/SidebarContext";
import BusinessSidebar from "@/components/BusinessSidebar";
import { ToastProvider } from "@/components/Toast";

/**
 * Root layout for all /business/* routes.
 * Renders the sidebar exactly once here.
 * Child layouts (e.g. /business/[externalId]/layout.tsx) must be
 * pass-through — they must NOT render the sidebar again.
 */
export default async function BusinessLayout({
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
          <BusinessSidebar />
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {children}
          </div>
        </div>
      </SidebarProvider>
    </ToastProvider>
  );
}
