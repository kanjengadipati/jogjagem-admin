"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { CheckCircle, XCircle, AlertCircle, Search, Loader2, Trash2, Star, MessageSquare } from "lucide-react";

interface Review {
  id: string;
  user_name: string;
  destination_id: string;
  rating: number;
  comment: string;
  status: string;
  traveler_type?: string;
  CreatedAt?: string;
}

const STATUS_STYLES: Record<string, string> = {
  published: "bg-success/10 text-success",
  pending:   "bg-warning/10 text-warning",
  flagged:   "bg-danger/10 text-danger",
};

export default function ReviewsPage() {
  const { showToast } = useToast();
  const [all, setAll] = useState<Review[]>([]);
  const [filtered, setFiltered] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then(r => r.json())
      .then(d => {
        const list: Review[] = d?.data ?? [];
        setAll(list);
        setFiltered(list);
      })
      .catch(() => showToast("Error", "Failed to load reviews", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let list = all;
    if (search) list = list.filter(r =>
      r.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      r.destination_id?.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter) list = list.filter(r => r.status === statusFilter);
    setFiltered(list);
  }, [search, statusFilter, all]);

  async function updateStatus(id: string, status: string) {
    const res = await fetch(`/api/reviews/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setAll(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      showToast("Updated", `Review marked as ${status}`, "success");
    } else {
      showToast("Error", "Update failed", "error");
    }
  }

  async function deleteReview(id: string) {
    if (!confirm("Delete this review?")) return;
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    if (res.ok) {
      setAll(prev => prev.filter(r => r.id !== id));
      showToast("Deleted", "Review removed", "success");
    } else {
      showToast("Error", "Delete failed", "error");
    }
  }

  const pending  = all.filter(r => r.status === "pending").length;
  const flagged  = all.filter(r => r.status === "flagged").length;

  return (
    <>
      <Header activeId="reviews" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Review Moderation</h2>
            <p className="text-xs text-gray-500 mt-1">Review flagged submissions, approve legitimate content, and remove violations.</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {flagged > 0 && <span className="bg-danger/10 text-danger font-bold px-3 py-1.5 rounded-xl">{flagged} Flagged</span>}
            {pending > 0 && <span className="bg-warning/10 text-warning font-bold px-3 py-1.5 rounded-xl">{pending} Pending</span>}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-card border border-border shadow-soft grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by author, destination, or content…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-bg text-xs px-3.5 py-2.5 rounded-xl border border-transparent outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="flagged">Flagged</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">All Reviews</h4>
            <span className="text-xs font-bold text-primary">{filtered.length} reviews</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Author</th>
                  <th className="py-4 px-6">Destination</th>
                  <th className="py-4 px-4 text-center">Rating</th>
                  <th className="py-4 px-6">Review</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {loading ? (
                  <tr><td colSpan={6} className="py-16 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span>Loading reviews…</span></div>
                  </td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2"><MessageSquare className="w-8 h-8" /><span>No reviews found</span></div>
                  </td></tr>
                ) : filtered.map(r => (
                  <tr key={r.id} className="hover:bg-bg/40 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {r.user_name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block">{r.user_name || "Anonymous"}</span>
                          {r.traveler_type && <span className="text-[9px] text-gray-400">{r.traveler_type}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-600 capitalize">{r.destination_id || "—"}</td>
                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-warning">
                        <Star className="w-3.5 h-3.5 fill-warning text-warning" />{r.rating}
                      </span>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <p className="line-clamp-2 text-gray-600">{r.comment}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${STATUS_STYLES[r.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {r.status || "unknown"}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.status !== "published" && (
                          <button onClick={() => updateStatus(r.id, "published")} title="Approve"
                            className="p-1.5 rounded-lg border border-border hover:bg-success/10 text-gray-500 hover:text-success cursor-pointer transition">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {r.status !== "flagged" && (
                          <button onClick={() => updateStatus(r.id, "flagged")} title="Flag"
                            className="p-1.5 rounded-lg border border-border hover:bg-warning/10 text-gray-500 hover:text-warning cursor-pointer transition">
                            <AlertCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button onClick={() => deleteReview(r.id)} title="Delete"
                          className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-gray-500 hover:text-red-600 cursor-pointer transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && (
            <div className="p-5 border-t border-border text-xs text-gray-500 font-semibold">
              Showing {filtered.length} of {all.length} reviews
            </div>
          )}
        </div>
      </main>
    </>
  );
}
