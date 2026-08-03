"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  Search, 
  Loader2, 
  XCircle,
  AlertTriangle,
  Building2,
  Tag
} from "lucide-react";

interface ListingClaim {
  id: string | number;
  external_id?: string;
  business_id: number;
  business_name?: string;
  listing_type: string;
  listing_external_id: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
  submitted_at: string;
}

function getClaimId(claim: ListingClaim): string {
  return String(claim.id || claim.external_id || "");
}

export default function BusinessClaimsPage() {
  const { showToast } = useToast();
  const [claims, setClaims] = useState<ListingClaim[]>([]);
  const [filtered, setFiltered] = useState<ListingClaim[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadClaims();
  }, []);

  useEffect(() => {
    let result = claims;
    if (typeFilter !== "all") {
      result = result.filter(c => c.listing_type.toLowerCase() === typeFilter.toLowerCase());
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => 
        getClaimId(c).toLowerCase().includes(q) ||
        c.listing_external_id.toLowerCase().includes(q) ||
        c.listing_type.toLowerCase().includes(q) ||
        String(c.business_id).includes(q) ||
        (c.business_name && c.business_name.toLowerCase().includes(q))
      );
    }
    setFiltered(result);
  }, [search, typeFilter, claims]);

  async function loadClaims() {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await fetch("/api/business-claims");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message = data?.message || data?.error || `Failed to load listing claims (${res.status})`;
        setLoadError(message);
        setClaims([]);
        setFiltered([]);
        showToast("Error", message, "error");
        return;
      }
      const list: ListingClaim[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setClaims(list);
      setFiltered(list);
    } catch {
      const message = "Failed to load listing claims";
      setLoadError(message);
      showToast("Error", message, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(claim: ListingClaim) {
    const claimId = getClaimId(claim);
    if (!confirm(`Approve claim #${claimId} for business ID ${claim.business_id}?`)) return;
    setProcessingId(claimId);
    try {
      const res = await fetch(`/api/business-claims/${claimId}/approve`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast("Error", data?.message || "Failed to approve claim", "error");
      } else {
        showToast("Success", "Listing claim approved & business_id linked successfully!", "success");
        loadClaims();
      }
    } catch {
      showToast("Error", "Failed to approve claim", "error");
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(claim: ListingClaim) {
    const claimId = getClaimId(claim);
    const reason = prompt("Enter rejection reason:");
    if (reason === null) return;
    setProcessingId(claimId);
    try {
      const res = await fetch(`/api/business-claims/${claimId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejection_reason: reason })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast("Error", data?.message || "Failed to reject claim", "error");
      } else {
        showToast("Success", "Listing claim rejected", "success");
        loadClaims();
      }
    } catch {
      showToast("Error", "Failed to reject claim", "error");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header activeId="business-claims" />

      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-gold-600" />
              <span>Business Listing Claims Review</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">Review and approve ownership claims for public ecosystem listings.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search claim, business, or listing ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white w-64"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="py-2 px-3 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="all">All Listing Types</option>
              <option value="destination">Destination</option>
              <option value="hotel">Hotel</option>
              <option value="restaurant">Restaurant</option>
              <option value="souvenir">Souvenir</option>
              <option value="rental">Rental</option>
              <option value="guide">Guide</option>
              <option value="event">Event</option>
            </select>
          </div>
        </div>

        {loadError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              <span>Loading listing claims queue...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs space-y-2">
              <Clock className="w-8 h-8 text-gray-300 mx-auto" />
              <p className="font-semibold text-gray-600">No pending listing claims found.</p>
              <p className="text-gray-400">All claims have been actioned or none match your search filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-4 py-3">Claim ID</th>
                    <th className="px-4 py-3">Business ID</th>
                    <th className="px-4 py-3">Listing Type</th>
                    <th className="px-4 py-3">Listing ID</th>
                    <th className="px-4 py-3">Submitted At</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filtered.map((claim) => {
                    const cId = getClaimId(claim);
                    return (
                      <tr key={cId} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-gray-900">{cId}</td>
                        <td className="px-4 py-3 font-mono">
                          <div className="flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-gray-400" />
                            <span>#{claim.business_id}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-semibold capitalize border border-amber-200 text-[10px]">
                            <Tag className="w-3 h-3" />
                            {claim.listing_type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-gray-800">{claim.listing_external_id}</td>
                        <td className="px-4 py-3 text-gray-500">
                          {claim.submitted_at ? new Date(claim.submitted_at).toLocaleString() : "-"}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button
                            onClick={() => handleApprove(claim)}
                            disabled={processingId === cId}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => handleReject(claim)}
                            disabled={processingId === cId}
                            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
