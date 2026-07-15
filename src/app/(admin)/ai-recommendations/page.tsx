"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { Sparkles, Save } from "lucide-react";

interface RecommendationItem { name: string; reason: string; }

export default function AIRecommendationsPage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState("cultural");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<RecommendationItem[] | null>(null);

  async function simulate() {
    setLoading(true); setResults(null);
    try {
      const res = await fetch("/api/ai/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preference: profile }),
      });
      const data = await res.json();
      setResults(data.items ?? []);
      showToast("Recommendation Ready", "Engine output calculated.", "success");
    } catch { showToast("Error", "Simulation failed to compile.", "error"); }
    finally { setLoading(false); }
  }

  return (
    <>
      <Header activeId="ai-recommendations" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">AI Recommendation Engine</h2>
            <p className="text-xs text-gray-500 mt-1">Configure systemic prompts, manage tourism category weighting, and audit AI recommendation APIs.</p>
          </div>
          <button onClick={() => showToast("Prompt Saved","Systemic prompt saved successfully.","success")} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <Save className="w-4 h-4" /><span>Save Prompt Engine</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-800 font-display">System Prompt Template</h4>
                <span className="text-[9px] font-mono text-gray-400 font-bold">BACKEND AI ENGINE</span>
              </div>
              <textarea defaultValue={`You are the expert tourism advisor for Yogyakarta. Based on the user's personality (Adventurous, Relaxed, Cultural, Culinary, Historic), recommend exactly 3 verified destinations with short description summaries, approximate budgets, and Javanese cultural fun facts.`} rows={8} className="w-full bg-bg focus:bg-white text-xs p-4 rounded-xl border border-transparent focus:border-border outline-none font-mono leading-relaxed text-gray-700" />
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-display block">Temperature (Creativity)</label>
                  <input type="range" min="0" max="100" defaultValue="70" className="w-full accent-primary" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-display block">Top P Selection</label>
                  <input type="range" min="0" max="100" defaultValue="90" className="w-full accent-primary" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
              <h4 className="text-sm font-bold text-gray-800 font-display">Category Weight Configuration</h4>
              <div className="space-y-4">
                {[
                  { label:"Cultural & Heritage",   weight:85 },
                  { label:"Nature & Adventure",    weight:72 },
                  { label:"Culinary Experiences",  weight:68 },
                  { label:"Shopping & Souvenirs",  weight:54 },
                  { label:"Nightlife & Events",    weight:41 },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-4">
                    <span className="text-xs font-semibold text-gray-700 w-44 flex-shrink-0">{c.label}</span>
                    <div className="flex-1 bg-bg rounded-full h-2">
                      <div className="h-2 bg-primary rounded-full" style={{ width: `${c.weight}%` }} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 w-8 text-right">{c.weight}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Recommendation Simulator</h4>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block">Traveler Profile</label>
                  <select value={profile} onChange={e => setProfile(e.target.value)} className="w-full bg-bg focus:bg-white text-xs px-3.5 py-3 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
                    <option value="cultural">Heritage &amp; Cultural Explorer</option>
                    <option value="nature">Nature &amp; Adventure Seeker</option>
                    <option value="culinary">Traditional Culinary Foodie</option>
                  </select>
                </div>
                <button onClick={simulate} disabled={loading} className="w-full bg-primary hover:bg-primary-dark disabled:opacity-60 text-white py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />{loading ? "Generating…" : "Simulate Recommendation"}
                </button>
              </div>
              <div className="p-4 rounded-2xl bg-bg border border-border min-h-24">
                {loading ? (
                  <div className="flex items-center justify-center gap-2 py-6">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                    <span className="text-[10px] font-semibold">Generating via AI engine…</span>
                  </div>
                ) : results ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold text-primary">RECOMMENDED TRACKS</span>
                      <span className="text-[9px] text-gray-400 font-bold">{results.length} Options</span>
                    </div>
                    <div className="space-y-2">
                      {results.map(item => (
                        <div key={item.name} className="bg-white p-2.5 rounded-lg border border-border">
                          <span className="text-xs font-bold text-gray-900 block font-display">{item.name}</span>
                          <p className="text-[10px] text-gray-500 mt-0.5">{item.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-400 text-center font-semibold pt-4">Simulation results will be populated here…</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
