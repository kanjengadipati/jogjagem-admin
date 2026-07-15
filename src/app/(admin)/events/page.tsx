"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";

type EventView = "calendar" | "list" | "kanban" | "timeline";

const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function EventsPage() {
  const { showToast } = useToast();
  const [view, setView] = useState<EventView>("calendar");

  return (
    <>
      <Header activeId="events" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Cultural Events &amp; Festival Calendar</h2>
            <p className="text-xs text-gray-500 mt-1">Manage ticketing states, event categories, calendar agendas, and promotional schedules.</p>
          </div>
          <div className="flex items-center gap-2 bg-white border border-border p-1 rounded-2xl shadow-apple">
            {(["calendar","list","kanban","timeline"] as EventView[]).map(v => (
              <button key={v} onClick={() => { setView(v); showToast("View Toggled", `Switched to ${v} layout`, "info"); }}
                className={`text-xs font-bold font-display px-4 py-2 rounded-xl transition duration-200 cursor-pointer ${view === v ? "bg-primary text-white" : "text-gray-400 hover:text-text"}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Calendar view */}
        {view === "calendar" && (
          <div className="bg-white p-6 rounded-card border border-border shadow-soft">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h3 className="text-base font-bold text-gray-800 font-display">July 2026</h3>
                <span className="text-xs text-gray-400 font-semibold font-mono">ID: TZ-WIB</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-1.5 rounded-lg border border-border hover:bg-bg cursor-pointer text-xs font-bold px-2">&#8592;</button>
                <button className="text-xs font-bold px-3 py-1.5 rounded-lg border border-border hover:bg-bg cursor-pointer">Today</button>
                <button className="p-1.5 rounded-lg border border-border hover:bg-bg cursor-pointer text-xs font-bold px-2">&#8594;</button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-px bg-border rounded-2xl overflow-hidden border border-border">
              {DAYS.map(d => <div key={d} className="bg-bg py-3 text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider font-display">{d}</div>)}
              {/* Prev month overflow */}
              {[28,29,30].map(n => <div key={`p${n}`} className="bg-white p-3 min-h-20"><span className="text-gray-300 text-sm font-semibold">{n}</span></div>)}
              {Array.from({length:31},(_,i) => i+1).map(day => (
                <div key={day} className="bg-white p-3 min-h-20 relative">
                  <span className="text-gray-800 text-sm font-bold">{day}</span>
                  {day === 10 && <div className="absolute bottom-2 left-1 right-1 bg-primary/10 border-l-2 border-primary p-1 rounded text-[9px] text-primary font-bold truncate">Jogja Art Festival</div>}
                  {day === 18 && <div className="absolute bottom-2 left-1 right-1 bg-secondary/10 border-l-2 border-secondary p-1 rounded text-[9px] text-secondary font-bold truncate">Prambanan Jazz</div>}
                </div>
              ))}
              {[1].map(n => <div key={`n${n}`} className="bg-white p-3 min-h-20"><span className="text-gray-300 text-sm font-semibold">{n}</span></div>)}
            </div>
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
            <h4 className="text-sm font-bold text-gray-800 font-display">Active Festivals &amp; Tickets</h4>
            <div className="divide-y divide-border">
              {[
                { code:"PJ", name:"Prambanan Jazz Festival 2026", date:"18-20 July 2026 · Prambanan Temple grounds", badge:"Tickets Available", badgeColor:"success", price:"Rp 250,000+" },
                { code:"RB", name:"Ramayana Ballet Cultural Dance", date:"Weekly Event · Open Theatre", badge:"Limited Tickets", badgeColor:"warning", price:"Rp 150,000+" },
              ].map(ev => (
                <div key={ev.code} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">{ev.code}</div>
                    <div>
                      <span className="text-sm font-bold text-gray-900 font-display hover:text-primary transition cursor-pointer block">{ev.name}</span>
                      <p className="text-[10px] text-gray-500 mt-0.5">{ev.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-${ev.badgeColor}/15 text-${ev.badgeColor}`}>{ev.badge}</span>
                    <span className="text-xs font-bold text-gray-800">{ev.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Kanban view */}
        {view === "kanban" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label:"Staged Planning",   labelColor:"text-gray-400", events:[{ tag:"Workshop", name:"Silver Crafting Workshop Kotagede", desc:"Interactive crafting schedule for private international tour groups." }] },
              { label:"Approved / Tickets Open", labelColor:"text-gray-400", events:[{ tag:"Cultural", name:"Jogja Kesenian Festival", desc:"Annual heritage and performance art exhibit in City Center square." }] },
              { label:"Live Promotion",    labelColor:"text-success",  events:[{ tag:"Festival", name:"Prambanan Jazz Festival", desc:"Active advertising and campaign codes running through hotel suites." }] },
            ].map(col => (
              <div key={col.label} className="bg-bg/40 p-5 rounded-2xl border border-border space-y-4">
                <span className={`text-[10px] font-extrabold uppercase tracking-widest block font-display ${col.labelColor}`}>{col.label}</span>
                {col.events.map(ev => (
                  <div key={ev.name} className="bg-white p-4 rounded-xl border border-border shadow-apple space-y-2 hover-scale cursor-pointer">
                    <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-md uppercase">{ev.tag}</span>
                    <h5 className="text-xs font-bold text-gray-900 font-display">{ev.name}</h5>
                    <p className="text-[10px] text-gray-500 leading-normal">{ev.desc}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Timeline view */}
        {view === "timeline" && (
          <div className="bg-white p-6 rounded-card border border-border shadow-soft">
            <h4 className="text-sm font-bold text-gray-800 font-display mb-6">Chronological Ecosystem Agenda</h4>
            <div className="relative pl-8 border-l border-border space-y-8">
              {[
                { color:"primary",   date:"JULY 10 — 12", name:"Jogja Art Festival (Cultural Exhibition)", desc:"Focusing on modern sculpture and regional paintings inside Taman Budaya Yogyakarta." },
                { color:"secondary", date:"JULY 18 — 20", name:"Prambanan Jazz (International Music Concert)", desc:"World-class jazz artists performing live on the legendary Hindu temple backdrop." },
              ].map(ev => (
                <div key={ev.name} className="relative">
                  <span className={`absolute -left-[37px] top-0.5 w-4 h-4 rounded-full bg-white border-4 border-${ev.color}`} />
                  <span className={`text-[10px] font-bold text-${ev.color} font-mono block`}>{ev.date}</span>
                  <h5 className="text-xs font-bold text-gray-900 font-display mt-0.5">{ev.name}</h5>
                  <p className="text-[11px] text-gray-500 mt-1 max-w-xl">{ev.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </>
  );
}
