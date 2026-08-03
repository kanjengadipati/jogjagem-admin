"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export interface ActiveBusiness {
  id: string;
  name: string;
  category: string;
  status: string;
  description?: string;
  phone?: string;
  website?: string;
}

interface UseActiveBusinessResult {
  businesses: ActiveBusiness[];
  active: ActiveBusiness | null;
  loading: boolean;
  externalId?: string;
}

function mapBusiness(b: any): ActiveBusiness {
  return {
    id: b.external_id || String(b.id || ""),
    name: b.name || "Bisnis Saya",
    category: b.category || "Wisata & Destinasi",
    status: b.status || "pending",
    description: b.description || "",
    phone: b.phone || "",
    website: b.website || "",
  };
}

/**
 * Resolves the active business for the current route.
 * When the route carries an [externalId] segment (e.g. /business/xyz/listings)
 * the matching business is selected from /api/businesses/me. Otherwise the
 * first business is used as a fallback.
 */
export function useActiveBusiness(): UseActiveBusinessResult {
  const params = useParams();
  const externalId = typeof params?.externalId === "string" ? params.externalId : undefined;

  const [businesses, setBusinesses] = useState<ActiveBusiness[]>([]);
  const [active, setActive] = useState<ActiveBusiness | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/businesses/me");
        const json = await res.json();
        const list: any[] = json?.data ?? (Array.isArray(json) ? json : []);
        if (cancelled) return;
        const mapped = (Array.isArray(list) ? list : []).map(mapBusiness);
        setBusinesses(mapped);
        const chosen = externalId
          ? mapped.find((b) => b.id === externalId) ?? mapped[0] ?? null
          : mapped[0] ?? null;
        setActive(chosen);
      } catch {
        if (cancelled) return;
        setBusinesses([]);
        setActive(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    setLoading(true);
    load();
    return () => {
      cancelled = true;
    };
  }, [externalId]);

  return { businesses, active, loading, externalId };
}
