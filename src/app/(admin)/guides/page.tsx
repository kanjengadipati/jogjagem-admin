import Header from "@/components/Header";
import { Users } from "lucide-react";

const GUIDES = [
  { name:"Budi Santoso", lang:"EN, ID, JP", rating:4.9, tours:142, status:"Available" },
  { name:"Siti Rahayu", lang:"EN, ID, FR", rating:4.8, tours:98, status:"On Tour" },
  { name:"Ahmad Fauzi", lang:"EN, ID",     rating:4.7, tours:203, status:"Available" },
  { name:"Dewi Kusuma", lang:"EN, ID, KO", rating:4.9, tours:77,  status:"Available" },
  { name:"Rizky Pratama",lang:"EN, ID",    rating:4.6, tours:54,  status:"Off Duty" },
];

export default function GuidesPage() {
  return (
    <>
      <Header activeId="guides" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Tour Guides Directory</h2>
            <p className="text-xs text-gray-500 mt-1">Manage certified local guides, languages, and availability status.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <Users className="w-4 h-4" /><span>Add Guide</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GUIDES.map(g => (
            <div key={g.name} className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4 hover:border-primary/20 transition-premium">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {g.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 font-display">{g.name}</h4>
                  <span className="text-[10px] text-gray-500">{g.lang}</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-xl bg-bg">
                  <span className="text-sm font-extrabold text-warning block">★ {g.rating}</span>
                  <span className="text-[9px] text-gray-400">Rating</span>
                </div>
                <div className="p-2 rounded-xl bg-bg">
                  <span className="text-sm font-extrabold text-gray-900 block">{g.tours}</span>
                  <span className="text-[9px] text-gray-400">Tours</span>
                </div>
                <div className="p-2 rounded-xl bg-bg flex flex-col items-center justify-center">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${g.status === "Available" ? "bg-success/10 text-success" : g.status === "On Tour" ? "bg-info/10 text-info" : "bg-gray-100 text-gray-500"}`}>{g.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
