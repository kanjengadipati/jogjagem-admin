"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { MessageSquare, Search, Loader2, Star, User, Calendar, Reply } from "lucide-react";
import type { Partner } from "@/types";

interface Review {
  id: string;
  user_id: string;
  destination_id: string;
  user_name: string;
  traveler_type?: string;
  rating: number;
  comment: string;
  images?: unknown[];
  status: string;
  partner_id?: string;
  reply?: string;
  replied_at?: string;
  replied_by?: number;
  CreatedAt?: string;
}

export default function PartnerReviewsPage() {
  const { showToast } = useToast();
  const [listings, setListings] = useState<Partner[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filtered, setFiltered] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetch("/api/partners/me")
      .then((r) => r.json())
      .then((d) => {
        const list: Partner[] = d?.data ?? [];
        setListings(list);
        if (list.length > 0) setSelectedPartnerId(list[0].id);
      })
      .catch(() => showToast("Error", "Failed to load your listings", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedPartnerId) return;
    setLoadingReviews(true);
    fetch(`/api/partners/me/${selectedPartnerId}/reviews`)
      .then((r) => r.json())
      .then((d) => { setReviews(d?.data ?? []); setFiltered(d?.data ?? []); })
      .catch(() => showToast("Error", "Failed to load reviews", "error"))
      .finally(() => setLoadingReviews(false));
  }, [selectedPartnerId, showToast]);

  useEffect(() => {
    let list = reviews;
    if (search) list = list.filter((r) =>
      r.user_name.toLowerCase().includes(search.toLowerCase()) ||
      r.comment.toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [reviews, search]);

  async function submitReply(reviewId: string) {
    if (!replyText.trim()) { showToast("Error", "Reply cannot be empty", "error"); return; }
    try {
      const res = await fetch(`/api/partners/me/${selectedPartnerId}/reviews/${reviewId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText }),
      });
      if (res.ok) {
        setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, reply: replyText, replied_at: new Date().toISOString() } : r));
        setReplyingTo(null); setReplyText("");
        showToast("Success", "Reply submitted", "success");
      } else {
        const data = await res.json();
        showToast("Error", data?.message || "Failed to submit reply", "error");
      }
    } catch { showToast("Error", "Failed to submit reply", "error"); }
  }

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < rating ? "fill-warning text-warning" : "text-gray-300"}`} />
    ));

  return (
    <>
      <Header activeId="reviews" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">My Reviews</h2>
            <p className="text-xs text-gray-500 mt-1">View and respond to customer reviews.</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-card border border-border shadow-soft">
          <label className="block text-xs font-bold text-gray-700 mb-2">Select Listing</label>
          <select value={selectedPartnerId} onChange={(e) => setSelectedPartnerId(e.target.value)}
            className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer" disabled={loading}>
            {listings.length === 0 ? <option value="">No listings available</option> :
              listings.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div className="bg-white p-5 rounded-card border border-border shadow-soft">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 pointer-events-none"><Search className="w-4 h-4" /></span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by reviewer name or comment..."
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition duration-200 font-medium"
              disabled={!selectedPartnerId} />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm font-semibold">Loading your listings...</span>
          </div>
        ) : !selectedPartnerId ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <MessageSquare className="w-10 h-10" /><span className="text-sm font-semibold">Select a listing to view reviews</span>
          </div>
        ) : loadingReviews ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm font-semibold">Loading reviews...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <MessageSquare className="w-10 h-10" /><span className="text-sm font-semibold">No reviews found</span>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((review) => (
              <div key={review.id} className="bg-white rounded-card border border-border shadow-soft p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 font-display">{review.user_name}</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">{renderStars(review.rating)}</div>
                        {review.traveler_type && (
                          <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{review.traveler_type}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Calendar className="w-3 h-3" />
                    {review.CreatedAt ? new Date(review.CreatedAt).toLocaleDateString() : "Unknown date"}
                  </div>
                </div>

                <p className="text-xs text-gray-600 mt-4 leading-relaxed">{review.comment}</p>

                <div className="mt-4 pt-4 border-t border-border">
                  {review.reply ? (
                    <div className="bg-bg rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Reply className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-gray-700">Your Reply</span>
                        {review.replied_at && (
                          <span className="text-[10px] text-gray-400">{new Date(review.replied_at).toLocaleDateString()}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{review.reply}</p>
                    </div>
                  ) : replyingTo === review.id ? (
                    <div className="space-y-3">
                      <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write your reply..."
                        className="w-full bg-bg focus:bg-white text-xs p-3 rounded-xl border border-transparent focus:border-border outline-none transition duration-200 font-medium min-h-[80px]" />
                      <div className="flex items-center gap-2">
                        <button onClick={() => submitReply(review.id)}
                          className="flex items-center gap-1 bg-primary hover:bg-primary-dark text-white text-[10px] font-bold px-3 py-1.5 rounded-full transition cursor-pointer">
                          <Reply className="w-3 h-3" /> Submit Reply
                        </button>
                        <button onClick={() => { setReplyingTo(null); setReplyText(""); }}
                          className="text-[10px] font-bold text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-full transition cursor-pointer">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => { setReplyingTo(review.id); setReplyText(""); }}
                      className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-primary-dark transition cursor-pointer">
                      <Reply className="w-3 h-3" /> Reply to Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && selectedPartnerId && !loadingReviews && (
          <div className="text-xs text-gray-400 font-semibold">
            Showing {filtered.length} review{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </main>
    </>
  );
}