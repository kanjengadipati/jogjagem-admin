import Header from "@/components/Header";
import { Tag, Edit3, Trash2 } from "lucide-react";

const PROMOTIONS = [
  { code:"JOGJA25", discount:"25% OFF", type:"Destination Bundle", expiry:"Jul 31, 2026", uses:142, maxUses:500, status:"Active" },
  { code:"SUMMER10", discount:"10% OFF", type:"Hotel Package", expiry:"Aug 15, 2026", uses:89, maxUses:200, status:"Active" },
  { code:"EARLYBIRD", discount:"30% OFF", type:"Jazz Festival Ticket", expiry:"Jul 17, 2026", uses:198, maxUses:200, status:"Almost Full" },
  { code:"HERITAGE50", discount:"Rp 50,000 OFF", type:"Heritage Trail", expiry:"Aug 1, 2026", uses:23, maxUses:100, status:"Active" },
  { code:"FLASHSALE", discount:"40% OFF", type:"All Categories", expiry:"Jul 15, 2026", uses:500, maxUses:500, status:"Expired" },
];

export default function PromotionsPage() {
  return (
    <>
      <Header activeId="promotions" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Promotions & Promo Codes</h2>
            <p className="text-xs text-gray-500 mt-1">Manage discount campaigns, promo codes, and bundle deal configurations.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <Tag className="w-4 h-4" /><span>Create Promotion</span>
          </button>
        </div>
        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Promo Code</th>
                  <th className="py-4 px-6">Discount</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Expiry</th>
                  <th className="py-4 px-6">Usage</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {PROMOTIONS.map(p => (
                  <tr key={p.code} className="hover:bg-bg/40 transition">
                    <td className="py-4 px-6"><code className="bg-bg text-primary font-bold text-xs px-2 py-1 rounded-lg">{p.code}</code></td>
                    <td className="py-4 px-6 font-bold text-gray-900">{p.discount}</td>
                    <td className="py-4 px-6"><span className="bg-secondary/10 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full">{p.type}</span></td>
                    <td className="py-4 px-6 text-gray-500">{p.expiry}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-bg rounded-full h-1.5"><div className="h-1.5 rounded-full bg-primary" style={{ width: `${(p.uses/p.maxUses)*100}%` }} /></div>
                        <span className="text-[10px] text-gray-400 font-mono">{p.uses}/{p.maxUses}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${p.status === "Active" ? "bg-success/10 text-success" : p.status === "Almost Full" ? "bg-warning/10 text-warning" : "bg-gray-100 text-gray-400"}`}>{p.status}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-1.5 rounded-lg border border-border hover:bg-bg text-gray-500 cursor-pointer transition"><Edit3 className="w-4 h-4" /></button>
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
