'use client';
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Sparkles, Play, Settings2 } from 'lucide-react';

export default function AiRecommendationsPage() {
  const [persona, setPersona] = useState('Family Traveler');
  const [weather, setWeather] = useState('Sunny');
  const [timeOfDay, setTimeOfDay] = useState('Evening');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const simulate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/simulate-recommendation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ persona, weather, timeOfDay }),
      });
      const data = await res.json();
      setResults(data.recommendations || []);
    } catch { /* ignore */ }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeId="ai-recommendations" user={{ name: "Admin Jogjagem", role: "Super Admin", email: "admin@explorejogja.com", avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com" }} currentDate={new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} />
        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">AI Recommendation Engine</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings2 className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-gray-800">System Configuration</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">System Prompt</label>
                  <textarea className="w-full mt-1 p-3 text-xs bg-bg rounded-xl border border-border focus:border-primary outline-none" rows={4} defaultValue="You are a tourism recommendation engine specialized in Yogyakarta destinations." />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Temperature</label>
                    <input type="range" min="0" max="1" step="0.1" defaultValue="0.7" className="w-full mt-1" />
                    <span className="text-[10px] text-gray-500">0.7</span>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Top-P</label>
                    <input type="range" min="0" max="1" step="0.1" defaultValue="0.9" className="w-full mt-1" />
                    <span className="text-[10px] text-gray-500">0.9</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-gray-800">Recommendation Simulator</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">User Persona</label>
                  <select value={persona} onChange={e => setPersona(e.target.value)} className="w-full mt-1 p-2.5 text-xs bg-bg rounded-xl border border-border outline-none">
                    <option>Family Traveler</option>
                    <option>Solo Backpacker</option>
                    <option>Couple Retreat</option>
                    <option>Cultural Explorer</option>
                    <option>Adventure Seeker</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Weather</label>
                    <select value={weather} onChange={e => setWeather(e.target.value)} className="w-full mt-1 p-2.5 text-xs bg-bg rounded-xl border border-border outline-none">
                      <option>Sunny</option><option>Cloudy</option><option>Rainy</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Time of Day</label>
                    <select value={timeOfDay} onChange={e => setTimeOfDay(e.target.value)} className="w-full mt-1 p-2.5 text-xs bg-bg rounded-xl border border-border outline-none">
                      <option>Morning</option><option>Afternoon</option><option>Evening</option><option>Night</option>
                    </select>
                  </div>
                </div>
                <button onClick={simulate} disabled={loading} className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition">
                  <Play className="w-3.5 h-3.5" />
                  {loading ? 'Simulating...' : 'Run Simulation'}
                </button>
              </div>
            </div>
          </div>

          {results.length > 0 && (
            <div className="mt-8 bg-white rounded-xl shadow p-6">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Simulation Results</h3>
              <div className="space-y-3">
                {results.map((r: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-bg border border-border">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{r.match}</div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-800">{r.name}</p>
                      <p className="text-xs text-gray-500">{r.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
