"use client";

import { useEffect, useState } from "react";
import PartnerHeader from "@/components/PartnerHeader";
import { useToast } from "@/components/Toast";
import { Star, MessageSquare, CornerDownRight, Send } from "lucide-react";

interface Review {
  id: string;
  user_name: string;
  rating: number;
  comment: string;
  created_at?: string;
  reply?: string;
}

export default function PartnerReviewsPage() {
  const { showToast } = useToast();
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const reviewsList: Review[] = [
    {
      id: "1",
      user_name: "Rina W.",
      rating: 5,
      comment: "Museumnya rapi, koleksinya lengkap. Pemandu ramah.",
      created_at: "3 hari lalu",
    },
    {
      id: "2",
      user_name: "Andi P.",
      rating: 4,
      comment: "Antrian tiket agak lama pas weekend.",
      created_at: "1 minggu lalu",
      reply: "Terima kasih masukannya, kami tambah loket weekend ini.",
    },
  ];

  return (
    <>
      <PartnerHeader />
      <main className="flex-1 overflow-y-auto bg-[#F9F9FB] p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900 font-display">Reviews</h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Ulasan pelanggan untuk bisnis Anda
          </p>
        </div>

        {/* Rating Summary Card */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center gap-8">
          <div className="text-center md:text-left shrink-0">
            <div className="text-4xl font-extrabold text-stone-900 font-display">4.6</div>
            <div className="text-xs font-bold text-amber-500 flex items-center gap-1 justify-center md:justify-start mt-1">
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 fill-amber-500" />
              <Star className="w-4 h-4 text-stone-300" />
            </div>
            <div className="text-xs text-stone-400 font-medium mt-1">128 ulasan</div>
          </div>

          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center gap-3 text-xs text-stone-500 font-semibold">
              <span className="w-3">5</span>
              <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[70%]" />
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-500 font-semibold">
              <span className="w-3">4</span>
              <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[20%]" />
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-stone-500 font-semibold">
              <span className="w-3">3</span>
              <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full w-[6%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviewsList.map((rev) => (
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
                <span className="text-[11px] text-stone-400 font-medium">{rev.created_at}</span>
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
                      onClick={() => setReplyingId(null)}
                      className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                    >
                      Batal
                    </button>
                    <button
                      onClick={() => {
                        showToast("Terkirim", "Balasan berhasil dikirim", "success");
                        setReplyingId(null);
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
      </main>
    </>
  );
}