"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function BusinessHomeRedirect() {
  const router = useRouter();

  useEffect(() => {
    async function redirectToDashboard() {
      try {
        const res = await fetch("/api/businesses/me");
        const json = await res.json();
        const list = json?.data ?? [];
        if (Array.isArray(list) && list.length > 0) {
          router.replace(`/business/${list[0].external_id || list[0].id}/dashboard`);
        } else {
          router.replace("/business/settings");
        }
      } catch {
        router.replace("/business/settings");
      }
    }

    redirectToDashboard();
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-xs text-stone-400">Mengalihkan ke dashboard...</div>
    </div>
  );
}
