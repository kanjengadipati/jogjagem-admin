"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { BookOpen, Eye, Trash2, Search, Loader2 } from "lucide-react";
import type { Story } from "@/types";

export default function StoriesPage() {
  const { showToast } = useToast();
  const [all, setAll] = useState<Story[]>([]);
  const [filtered, setFiltered] = useState<Story[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stories")
      .then(r => r.json())
      .then(d => { const list = d?.data ?? []; setAll(list); setFiltered(list); })
      .catch(() => showToast("Error", "Failed to load stories", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let list = all;
    if (search) list = list.filter(s => s.title.toLowerCase().includes(search.toLowerCase()));
    if (statusFilter) list = list.filter(s => s.status === statusFilter);
    setFiltered(list);
  }, [search, statusFilter, all]);

  async function deleteStory(id: string, title: string) {
    if (!confirm(`Delete story "${title}"?`)) return;
    const res = await fetch(`/api/stories/${id}`, { method: "DELETE" });
    if (res.ok) { setAll(prev => prev.filter(s => s.id !== id)); showToast("Deleted", "Story removed", "success"); }
    else showToast("Error", "Delete failed", "error");
  }

  const pending = all.filter(s => s.status === "pending").length;
  const statusColor = (s?: string) => s === "published" ? "bg-success/10 text-success" : s === "draft" ? "bg-gray-100 text-gray-500" : "bg-warning/10 text-warning";

  return (
    <>
      <Header activeId="stories" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Travel Stories</h2>
            <p className="text-xs text-gray-500 mt-1">Moderate traveler-submitted stories, editorial content, and featured narratives.</p>
          </div>
          {pending > 0 && <span className="bg-warning/10 text-warning font-bold px-3 py-1.5 rounded-xl text-xs">{pending} Pending Review</span>}
        </div>

        <div className="bg-white p-4 rounded-card border border-border shadow-soft grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stories…"
              className="w-full bg-bg focus:bg-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            className="w-full bg-bg text-xs px-3.5 py-2.5 rounded-xl border border-transparent outline-none font-semibold text-gray-700 cursor-pointer">
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="pending">Pending</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Story</th>
                  <th className="py-4 px-6 text-center">Likes</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {loading ? (
                  <tr><td colSpan={4} className="py-16 text-center text-gray-400"><div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span>Loading…</span></div></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={4} className="py-16 text-center text-gray-400"><div className="flex flex-col items-center gap-2"><BookOpen className="w-8 h-8" /><span>No stories found</span></div></td></tr>
                ) : filtered.map(s => (
                  <tr key={s.id} className="hover:bg-bg/40 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><BookOpen className="w-4 h-4" /></div>
                        <div>
                          <span className="text-xs font-bold text-gray-900 font-display block max-w-xs truncate">{s.title}</span>
                          <span className="text-[10px] text-gray-400">by {s.user_id || "Anonymous"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center font-bold text-gray-800">{s.likes ?? 0}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${statusColor(s.status)}`}>{s.status || "draft"}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 rounded-lg border border-border hover:bg-bg text-gray-500 cursor-pointer transition"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => deleteStory(s.id, s.title)} className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-gray-500 hover:text-red-600 cursor-pointer transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {!loading && <div className="p-4 border-t border-border text-xs text-gray-400 font-semibold">Showing {filtered.length} stories</div>}
        </div>
      </main>
    </>
  );
}
