import Header from "@/components/Header";
import { Briefcase, CheckCircle, Clock } from "lucide-react";

const PARTNERS = [
  { name:"Heha Ocean View", type:"Attraction", contact:"heha@oceanview.id", status:"Pending Verification", since:"2026-07-01" },
  { name:"Jogja Bay Waterpark", type:"Entertainment", contact:"info@jogjakbay.com", status:"Active Partner", since:"2025-03-15" },
  { name:"Prambanan Temple Tours", type:"Heritage", contact:"tour@prambanan.id", status:"Active Partner", since:"2024-11-20" },
  { name:"Merapi Lava Tour", type:"Adventure", contact:"admin@lava-tour.id", status:"Active Partner", since:"2025-01-10" },
  { name:"Jogja Batik Cooperative", type:"Shopping", contact:"coop@batikjogja.id", status:"Pending Verification", since:"2026-06-28" },
];

export default function PartnersPage() {
  return (
    <>
      <Header activeId="partners" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Tourism Partners</h2>
            <p className="text-xs text-gray-500 mt-1">Manage business partnerships, verification statuses, and listing agreements.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <Briefcase className="w-4 h-4" /><span>Add Partner</span>
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PARTNERS.map(p => (
            <div key={p.name} className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4 hover:border-primary/20 hover:shadow-premium transition-premium">
              <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <Briefcase className="w-5 h-5" />
                </div>
                {p.status === "Active Partner"
                  ? <span className="flex items-center gap-1 bg-success/10 text-success text-[10px] font-bold px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3" /> Active</span>
                  : <span className="flex items-center gap-1 bg-warning/10 text-warning text-[10px] font-bold px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> Pending</span>
                }
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900 font-display">{p.name}</h4>
                <span className="text-[10px] text-gray-500">{p.type}</span>
              </div>
              <div className="text-[10px] text-gray-400 space-y-1 border-t border-border pt-3">
                <div className="flex justify-between"><span>Contact</span><span className="text-gray-600 font-medium">{p.contact}</span></div>
                <div className="flex justify-between"><span>Since</span><span className="text-gray-600 font-medium">{p.since}</span></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
