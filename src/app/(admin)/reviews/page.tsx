import Header from "@/components/Header";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";

const REVIEWS = [
  { author:"Sarah Johnson", dest:"Prambanan Temple", rating:5, text:"Absolutely breathtaking at sunrise! The temple complex is massive and the detail in every stone is incredible.", status:"Flagged", flag:"Spam (82%)", date:"Jul 13, 2026" },
  { author:"Michael Chen",  dest:"Mount Merapi",     rating:4, text:"Incredible volcanic landscape. The jeep tour was thrilling. Guide was excellent and very knowledgeable.",   status:"Approved", flag:"", date:"Jul 12, 2026" },
  { author:"Anita Wijaya",  dest:"Borobudur",        rating:5, text:"A UNESCO masterpiece. The sunrise view from the top tier is life-changing. Highly recommend the 4AM tour.",  status:"Approved", flag:"", date:"Jul 11, 2026" },
  { author:"Thomas Müller", dest:"Parangtritis Beach", rating:3, text:"Beautiful beach but very crowded on weekends. Watch out for strong currents at the southern end.",         status:"Pending", flag:"", date:"Jul 10, 2026" },
  { author:"Lisa Park",     dest:"Malioboro Street",  rating:2, text:"Too many vendors pushing products. The street needs better management for tourists.",                        status:"Flagged", flag:"Negative (91%)", date:"Jul 9, 2026" },
];

const STATUS_STYLES: Record<string,string> = {
  Approved: "bg-success/10 text-success",
  Pending:  "bg-warning/10 text-warning",
  Flagged:  "bg-danger/10 text-danger",
};

export default function ReviewsPage() {
  return (
    <>
      <Header activeId="reviews" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Review Moderation</h2>
            <p className="text-xs text-gray-500 mt-1">Review flagged submissions, approve legitimate content, and remove violations.</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            {[{ label:"18 Flagged", color:"danger" },{ label:"7 Pending", color:"warning" }].map(b => (
              <span key={b.label} className={`bg-${b.color}/10 text-${b.color} font-bold px-3 py-1.5 rounded-xl`}>{b.label}</span>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {REVIEWS.map(r => (
            <div key={r.author+r.date} className="bg-white p-6 rounded-card border border-border shadow-soft space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {r.author.charAt(0)}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 font-display block">{r.author}</span>
                    <span className="text-[10px] text-gray-500">{r.dest} · {r.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-warning font-bold text-xs">{"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}</span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                  {r.flag && <span className="bg-danger/5 text-danger text-[9px] font-bold px-2 py-0.5 rounded-full border border-danger/20">{r.flag}</span>}
                </div>
              </div>
              <p className="text-xs text-gray-700 leading-relaxed pl-13 ml-[52px]">{r.text}</p>
              <div className="flex items-center gap-2 pt-1 ml-[52px]">
                <button className="flex items-center gap-1.5 text-success text-[11px] font-bold hover:bg-success/5 px-3 py-1.5 rounded-lg transition cursor-pointer border border-success/20">
                  <CheckCircle className="w-3.5 h-3.5" /> Approve
                </button>
                <button className="flex items-center gap-1.5 text-danger text-[11px] font-bold hover:bg-danger/5 px-3 py-1.5 rounded-lg transition cursor-pointer border border-danger/20">
                  <XCircle className="w-3.5 h-3.5" /> Remove
                </button>
                <button className="flex items-center gap-1.5 text-warning text-[11px] font-bold hover:bg-warning/5 px-3 py-1.5 rounded-lg transition cursor-pointer border border-warning/20">
                  <AlertCircle className="w-3.5 h-3.5" /> Flag
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
