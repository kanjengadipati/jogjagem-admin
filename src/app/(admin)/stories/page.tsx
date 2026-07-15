import Header from "@/components/Header";
import { BookOpen, Eye, Trash2 } from "lucide-react";

const STORIES = [
  { author:"Budi W.",      title:"Sunrise at Prambanan — A Spiritual Awakening",    dest:"Prambanan Temple", reads:2847, status:"Published", date:"Jul 12" },
  { author:"Maria S.",     title:"Cycling Through Kotagede Silver District",         dest:"Kotagede",         reads:1203, status:"Published", date:"Jul 10" },
  { author:"Anwar K.",     title:"My Solo Hike to Merapi Summit",                   dest:"Mount Merapi",     reads:892,  status:"Draft",     date:"Jul 9" },
  { author:"Grace T.",     title:"5 Days in Jogja: Complete Itinerary",             dest:"Multiple",         reads:4512, status:"Published", date:"Jul 8" },
  { author:"Hendra P.",    title:"Hidden Gems of Gunungkidul Beach Stretch",         dest:"Gunungkidul",      reads:321,  status:"Pending",   date:"Jul 7" },
  { author:"Priya M.",     title:"Batik Workshop Experience in Imogiri",            dest:"Bantul",           reads:677,  status:"Published", date:"Jul 6" },
  { author:"Johan L.",     title:"Photography Guide: Best Spots in Malioboro",       dest:"Malioboro",        reads:1889, status:"Pending",   date:"Jul 5" },
];

export default function StoriesPage() {
  return (
    <>
      <Header activeId="stories" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Travel Stories</h2>
            <p className="text-xs text-gray-500 mt-1">Moderate traveler-submitted stories, editorial content, and featured narratives.</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-warning/10 text-warning font-bold px-3 py-1.5 rounded-xl">7 Pending Review</span>
          </div>
        </div>
        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Story</th>
                  <th className="py-4 px-6">Author</th>
                  <th className="py-4 px-6">Destination</th>
                  <th className="py-4 px-6 text-center">Reads</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {STORIES.map(s => (
                  <tr key={s.title} className="hover:bg-bg/40 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><BookOpen className="w-4 h-4" /></div>
                        <div>
                          <span className="text-xs font-bold text-gray-900 font-display block max-w-xs truncate">{s.title}</span>
                          <span className="text-[9px] text-gray-400">{s.date}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold">{s.author}</td>
                    <td className="py-4 px-6"><span className="bg-bg text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">{s.dest}</span></td>
                    <td className="py-4 px-6 text-center font-bold text-gray-800">{s.reads.toLocaleString()}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${s.status === "Published" ? "bg-success/10 text-success" : s.status === "Draft" ? "bg-gray-100 text-gray-500" : "bg-warning/10 text-warning"}`}>{s.status}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 rounded-lg border border-border hover:bg-bg text-gray-500 cursor-pointer transition"><Eye className="w-4 h-4" /></button>
                        <button className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-gray-500 hover:text-red-600 cursor-pointer transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
