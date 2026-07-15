import Header from "@/components/Header";
import { Utensils } from "lucide-react";

const RESTAURANTS = [
  { name:"Bale Raos", cuisine:"Javanese Royal", region:"Yogyakarta City", rating:4.8, status:"Active" },
  { name:"Jejamuran", cuisine:"Mushroom Specialties", region:"Sleman", rating:4.6, status:"Active" },
  { name:"Pringsewu", cuisine:"Traditional Javanese", region:"Bantul", rating:4.5, status:"Active" },
  { name:"Omah Dhuwur", cuisine:"Fusion Javanese", region:"Gunungkidul", rating:4.7, status:"Active" },
  { name:"House of Raminten", cuisine:"Javanese Heritage", region:"Yogyakarta City", rating:4.4, status:"Pending Review" },
];

export default function RestaurantsPage() {
  return (
    <>
      <Header activeId="restaurants" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Restaurant Directory</h2>
            <p className="text-xs text-gray-500 mt-1">Manage culinary listings, cuisine categories, and partner statuses.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <Utensils className="w-4 h-4" /><span>Add Restaurant</span>
          </button>
        </div>
        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="p-6 border-b border-border bg-bg/20 flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Culinary Partners</h4>
            <span className="text-xs font-bold text-primary">{RESTAURANTS.length} restaurants</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Restaurant</th>
                  <th className="py-4 px-6">Cuisine</th>
                  <th className="py-4 px-6">Region</th>
                  <th className="py-4 px-6 text-center">Rating</th>
                  <th className="py-4 px-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {RESTAURANTS.map(r => (
                  <tr key={r.name} className="hover:bg-bg/40 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><Utensils className="w-4 h-4" /></div>
                        <span className="text-xs font-bold text-gray-900 font-display">{r.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6"><span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2.5 py-0.5 rounded-full">{r.cuisine}</span></td>
                    <td className="py-4 px-6 font-semibold text-gray-600">{r.region}</td>
                    <td className="py-4 px-6 text-center font-bold text-warning">★ {r.rating}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${r.status === "Active" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{r.status}</span>
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
