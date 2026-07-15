import Header from "@/components/Header";
import { Hotel } from "lucide-react";

const HOTELS = [
  { name:"Hyatt Regency Yogyakarta", stars:5, region:"Sleman", rooms:269, status:"Active" },
  { name:"The Phoenix Hotel Yogyakarta", stars:5, region:"Yogyakarta City", rooms:143, status:"Active" },
  { name:"Tentrem Hotel Yogyakarta", stars:5, region:"Yogyakarta City", rooms:294, status:"Active" },
  { name:"Hotel Tentrem", stars:4, region:"Sleman", rooms:110, status:"Active" },
  { name:"Grand Aston Yogyakarta", stars:4, region:"Bantul", rooms:87, status:"Pending Review" },
];

export default function HotelsPage() {
  return (
    <>
      <Header activeId="hotels" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Hotel Directory</h2>
            <p className="text-xs text-gray-500 mt-1">Manage hotel listings, star ratings, and partnership statuses.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <Hotel className="w-4 h-4" /><span>Add Hotel</span>
          </button>
        </div>

        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="p-6 border-b border-border bg-bg/20 flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Registered Hotels</h4>
            <span className="text-xs font-bold text-primary">{HOTELS.length} hotels</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Hotel</th>
                  <th className="py-4 px-6">Region</th>
                  <th className="py-4 px-6 text-center">Stars</th>
                  <th className="py-4 px-6 text-center">Rooms</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {HOTELS.map(h => (
                  <tr key={h.name} className="hover:bg-bg/40 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <Hotel className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-gray-900 font-display">{h.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-gray-600">{h.region}</td>
                    <td className="py-4 px-6 text-center font-bold text-warning">{"★".repeat(h.stars)}</td>
                    <td className="py-4 px-6 text-center font-bold text-gray-800">{h.rooms}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${h.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                        {h.status}
                      </span>
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
