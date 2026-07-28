"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { 
  Briefcase, 
  CheckCircle, 
  Clock, 
  Search, 
  Loader2, 
  MapPin, 
  Phone, 
  Globe,
  XCircle,
  AlertTriangle
} from "lucide-react";
import type { Partner } from "@/types";

export default function PartnerApplicationsPage() {
  const { showToast } = useToast();
  const [applications, setApplications] = useState<Partner[]>([]);
  const [filtered, setFiltered] = useState<Partner[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadApplications() {
      setLoading(true);
      setLoadError(null);

      try {
        const res = await fetch("/api/partners/pending");
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const message = data?.message || data?.error || `Failed to load partner applications (${res.status})`;
          setLoadError(message);
          setApplications([]);
          setFiltered([]);
          showToast("Error", message, "error");
          return;
        }

        const list: Partner[] = Array.isArray(data?.data) ? data.data : [];
        setApplications(list);
        setFiltered(list);
      } catch {
        const message = "Failed to load partner applications";
        setLoadError(message);
        showToast("Error", message, "error");
      } finally {
        setLoading(false);
      }
    }

    loadApplications();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let list = applications;
    if (search)
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.location ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (p.description ?? "").toLowerCase().includes(search.toLowerCase())
      );
    setFiltered(list);
  }, [applications, search]);

  async function approvePartner(id: string) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/partners/${id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        setApplications(prev => prev.filter(p => p.id !== id));
        showToast("Approved", "Partner application approved", "success");
      } else {
        const data = await res.json();
        showToast("Error", data?.message || "Failed to approve partner", "error");
      }
    } catch {
      showToast("Error", "Failed to approve partner", "error");
    } finally {
      setProcessingId(null);
    }
  }

  async function rejectPartner(id: string) {
    const reason = prompt("Please provide a reason for rejection:");
    if (reason === null || reason.trim() === "") {
      showToast("Error", "Rejection reason is required", "error");
      return;
    }
    
    setProcessingId(id);
    try {
      const res = await fetch(`/api/partners/${id}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        setApplications(prev => prev.filter(p => p.id !== id));
        showToast("Rejected", "Partner application rejected", "success");
      } else {
        const data = await res.json();
        showToast("Error", data?.message || "Failed to reject partner", "error");
      }
    } catch {
      showToast("Error", "Failed to reject partner", "error");
    } finally {
      setProcessingId(null);
    }
  }

  async function suspendPartner(id: string) {
    const reason = prompt("Please provide a reason for suspension (optional):");
    if (reason === null) return; // User cancelled
    
    setProcessingId(id);
    try {
      const res = await fetch(`/api/partners/${id}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });
      if (res.ok) {
        setApplications(prev => prev.filter(p => p.id !== id));
        showToast("Suspended", "Partner suspended", "success");
      } else {
        const data = await res.json();
        showToast("Error", data?.message || "Failed to suspend partner", "error");
      }
    } catch {
      showToast("Error", "Failed to suspend partner", "error");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <>
      <Header activeId="partner-approval" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Partner Applications</h2>
            <p className="text-xs text-gray-500 mt-1">Review and manage pending partner applications.</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-5 rounded-card border border-border shadow-soft">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, location, or description..."
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition duration-200 font-medium"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Loading applications...</span>
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center justify-center py-24 text-danger gap-3">
            <AlertTriangle className="w-10 h-10" />
            <span className="text-sm font-semibold">{loadError}</span>
            <span className="max-w-md text-center text-xs text-gray-400">
              Check that the backend is running, the admin token is valid, and this role has the partner approval permissions.
            </span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <CheckCircle className="w-10 h-10" />
            <span className="text-sm font-semibold">No pending applications</span>
            <span className="max-w-md text-center text-xs text-gray-400">
              Only partner listings with status "pending" appear here.
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-card border border-border shadow-soft overflow-hidden hover:border-primary/20 hover:shadow-premium transition-premium flex flex-col"
              >
                {/* Hero image */}
                <div className="relative h-44 bg-gray-100 flex-shrink-0">
                  {p.image ? (
                    <Image
                      src={p.image}
                      alt={p.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Briefcase className="w-10 h-10" />
                    </div>
                  )}
                  {/* Status badge */}
                  <span className="absolute top-3 right-3 flex items-center gap-1 bg-warning/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                    <Clock className="w-3 h-3" /> Pending Review
                  </span>
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex justify-between items-start">
                    {/* Name */}
                    <h4 className="text-sm font-bold text-gray-900 font-display leading-snug">{p.name}</h4>
                  </div>

                  {/* Description */}
                  {p.description && (
                    <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{p.description}</p>
                  )}

                  {/* Details */}
                  <div className="text-[10px] text-gray-400 space-y-1.5 border-t border-border pt-3 mt-auto">
                    {p.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="text-gray-600 font-medium truncate">{p.location}</span>
                      </div>
                    )}
                    {p.phone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3 h-3 flex-shrink-0" />
                        <span className="text-gray-600 font-medium">{p.phone}</span>
                      </div>
                    )}
                    {p.website && (
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3 h-3 flex-shrink-0" />
                        <a
                          href={p.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary font-medium hover:underline truncate"
                        >
                          {p.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                    {p.submitted_at && (
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 flex-shrink-0" />
                        <span className="text-gray-600 font-medium">
                          Applied: {new Date(p.submitted_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between gap-2 pt-2">
                    <button
                      onClick={() => approvePartner(p.id)}
                      disabled={processingId === p.id}
                      className="flex items-center gap-1 bg-success hover:bg-success/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === p.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <CheckCircle className="w-3 h-3" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => rejectPartner(p.id)}
                      disabled={processingId === p.id}
                      className="flex items-center gap-1 bg-danger hover:bg-danger/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === p.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <XCircle className="w-3 h-3" />
                      )}
                      Reject
                    </button>
                    <button
                      onClick={() => suspendPartner(p.id)}
                      disabled={processingId === p.id}
                      className="flex items-center gap-1 bg-warning hover:bg-warning/90 text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === p.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <AlertTriangle className="w-3 h-3" />
                      )}
                      Suspend
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer count */}
        {!loading && (
          <div className="text-xs text-gray-400 font-semibold">
            Showing {filtered.length} pending application{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </main>
    </>
  );
}
