import Header from "@/components/Header";
import { TrendingUp, Users, MapPin, Star } from "lucide-react";

const STATS = [
  { label:"Total Visitors", value:"284,721", change:"+12.4%", up:true, icon: TrendingUp },
  { label:"Active Users", value:"18,432",   change:"+8.1%",  up:true, icon: Users },
  { label:"Destinations",  value:"142",      change:"+3",     up:true, icon: MapPin },
  { label:"Avg Rating",    value:"4.7",      change:"+0.2",  up:true, icon: Star },
];

const TOP_DESTS = [
  { name:"Prambanan Temple", visits:42183, category:"Temple",  change:"+15%" },
  { name:"Mount Merapi",     visits:38921, category:"Nature",  change:"+22%" },
  { name:"Borobudur",        visits:35674, category:"Heritage",change:"+8%"  },
  { name:"Malioboro Street", visits:31209, category:"Shopping",change:"+5%"  },
  { name:"Parangtritis Beach",visits:27841,category:"Beach",   change:"+11%" },
];

export default function AnalyticsPage() {
  return (
    <>
      <Header activeId="analytics" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Analytics Overview</h2>
          <p className="text-xs text-gray-500 mt-1">Platform-wide visitor insights, destination performance, and engagement metrics.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STATS.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white p-6 rounded-card border border-border shadow-soft hover-scale relative overflow-hidden">
                <div className="absolute right-0 top-0 w-16 h-16 bg-primary/5 rounded-bl-full flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-[11px] font-bold text-gray-400 tracking-wider uppercase font-display">{s.label}</p>
                <h3 className="text-3xl font-extrabold text-gray-900 font-display mt-2 leading-none">{s.value}</h3>
                <span className={`inline-flex items-center gap-1 text-[11px] font-semibold mt-3.5 px-2 py-0.5 rounded-full ${s.up ? "text-success bg-success/5" : "text-danger bg-danger/5"}`}>
                  {s.change} this month
                </span>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
            <h4 className="text-sm font-bold text-gray-800 font-display">Top Destinations by Visitors</h4>
            <div className="space-y-4">
              {TOP_DESTS.map((d, i) => (
                <div key={d.name} className="flex items-center gap-4">
                  <span className="w-6 text-[11px] font-bold text-gray-400 flex-shrink-0">#{i+1}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-800 font-display">{d.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-success text-[10px] font-bold">{d.change}</span>
                        <span className="text-[10px] font-mono text-gray-500">{d.visits.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-bg rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(d.visits / TOP_DESTS[0].visits) * 100}%` }} />
                    </div>
                  </div>
                  <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded-full flex-shrink-0">{d.category}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
            <h4 className="text-sm font-bold text-gray-800 font-display">Visitor Demographics</h4>
            <div className="space-y-4">
              {[
                { label:"Domestic Travelers",   pct:62, color:"primary" },
                { label:"International Tourists",pct:28, color:"secondary" },
                { label:"Corporate Groups",       pct:7,  color:"info" },
                { label:"School / Education",     pct:3,  color:"success" },
              ].map(d => (
                <div key={d.label}>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
                    <span>{d.label}</span><span className={`text-${d.color}`}>{d.pct}%</span>
                  </div>
                  <div className="h-2 bg-bg rounded-full overflow-hidden">
                    <div className={`h-full bg-${d.color} rounded-full`} style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-border grid grid-cols-3 gap-3 text-center">
              {[{ label:"Avg Stay",value:"3.2 days"},{label:"Repeat Visitors",value:"34%"},{label:"NPS Score",value:"72"}].map(m => (
                <div key={m.label} className="p-3 rounded-2xl bg-bg">
                  <span className="text-sm font-extrabold text-gray-900 font-display block">{m.value}</span>
                  <span className="text-[9px] text-gray-400 font-semibold">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
