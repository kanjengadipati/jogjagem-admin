"use client";

import { useEffect, useState } from "react";
import BusinessHeader from "@/components/BusinessHeader";
import { useToast } from "@/components/Toast";
import { Star, MessageSquare, CornerDownRight, Send, Loader2 } from "lucide-react";
import { useActiveBusiness } from "@/hooks/useActiveBusiness";

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at?: string;
  reply?: string;
}

export default function BusinessReviewsPage() {
  const { showToast } = useToast();
  const { active: business, externalId } = useActiveBusiness();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [bizId, setBizId] = useState("");

  useEffect(() => {
    if (!business) {
      setLoading(false);
      return;
    }
    const id = externalId || business.id;
    setBizId(id);

    async function loadReviews() {
      try {
        const reviewRes = await fetch(`/api/businesses/me/${id}/reviews`);
        const reviewJson = await reviewRes.json();
        const list: Review[] = reviewJson?.data ?? [];
        setReviews(Array.isArray(list) ? list : []);
      } catch {
        showToast("Error", "Failed to load reviews", "error");
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, [business, externalId]);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <>
      <BusinessHeader />
      <main className="flex-1 overflow-y-auto bg-[#F9F9FB] p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900 font-display">Reviews</h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Ulasan pelanggan untuk bisnis Anda
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-stone-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-semibold">Memuat ulasan...</span>
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs text-center">
            <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-stone-700">Belum ada ulasan</p>
            <p className="text-xs text-stone-400 mt-1">Ulasan pelanggan akan muncul di sini setelah mereka mengisi review.</p>
          </div>
        ) : (
          <>
            {/* Rating Summary Card */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center gap-8">
              <div className="text-center md:text-left shrink-0">
                <div className="text-4xl font-extrabold text-stone-900 font-display">
                  {avgRating.toFixed(1)}
                </div>
                <div className="text-xs font-bold text-amber-500 flex items-center gap-1 justify-center md:justify-start mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < Math.round(avgRating) ? "fill-amber-500" : "text-stone-300"}`}
                    />
                  ))}
                </div>
                <div className="text-xs text-stone-400 font-medium mt-1">{reviews.length} ulasan</div>
              </div>

              <div className="flex-1 w-full space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = reviews.filter((r) => r.rating === star).length;
                  const pct = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-xs text-stone-500 font-semibold">
                      <span className="w-3">{star}</span>
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-stone-900">{rev.user_name}</span>
                      <div className="flex items-center text-amber-500 gap-0.5">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <span className="text-[11px] text-stone-400 font-medium">
                      {rev.created_at ? new Date(rev.created_at).toLocaleDateString("id-ID") : ""}
                    </span>
                  </div>

                  <p className="text-xs text-stone-700 font-medium leading-relaxed">{rev.comment}</p>

                  {rev.reply ? (
                    <div className="p-3.5 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs font-medium text-blue-900 flex items-start gap-2.5">
                      <CornerDownRight className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Balasan Anda:</span> {rev.reply}
                      </div>
                    </div>
                  ) : replyingId === rev.id ? (
                    <div className="space-y-2 pt-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Tulis balasan ulasan..."
                        className="w-full p-3 rounded-2xl border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                        rows={2}
                      />
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => {
                            setReplyingId(null);
                            setReplyText("");
                          }}
                          className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                        >
                          Batal
                        </button>
                        <button
                          onClick={async () => {
                            if (!replyText.trim()) return;
                            try {
                              const res = await fetch(`/api/businesses/me/${bizId}/reviews/${rev.id}/reply`, {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ reply: replyText }),
                              });
                              if (res.ok) {
                                showToast("Terkirim", "Balasan berhasil dikirim", "success");
                                setReviews((prev) =>
                                  prev.map((r) => (r.id === rev.id ? { ...r, reply: replyText } : r))
                                );
                                setReplyingId(null);
                                setReplyText("");
                              } else {
                                showToast("Gagal", "Gagal mengirim balasan", "error");
                              }
                            } catch {
                              showToast("Gagal", "Gagal mengirim balasan", "error");
                            }
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-[#B57A21] text-white text-xs font-bold flex items-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Kirim
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyingId(rev.id)}
                      className="px-3.5 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700 transition-all cursor-pointer"
                    >
                      Balas ulasan
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </>
  );
}
