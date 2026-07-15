import Header from "@/components/Header";
import { ShoppingBag } from "lucide-react";

const SOUVENIRS = [
  { name:"Batik Tulis Handmade", category:"Textile", price:"Rp 150,000 – 500,000", stock:"In Stock", seller:"Batik Plentong" },
  { name:"Wayang Kulit Puppet", category:"Crafts", price:"Rp 200,000 – 2,000,000", stock:"Limited", seller:"Dalang Craft Studio" },
  { name:"Bakpia Pathok 25", category:"Culinary", price:"Rp 35,000 – 80,000", stock:"In Stock", seller:"Toko Bakpia 25" },
  { name:"Silver Jewelry Kotagede", category:"Jewelry", price:"Rp 75,000 – 800,000", stock:"In Stock", seller:"UD Kotagede Silver" },
  { name:"Gudeg Kaleng", category:"Culinary", price:"Rp 45,000 – 65,000", stock:"Out of Stock", seller:"Gudeg Yu Djum" },
];

export default function SouvenirsPage() {
  return (
    <>
      <Header activeId="souvenirs" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Souvenir Marketplace</h2>
            <p className="text-xs text-gray-500 mt-1">Manage local handicrafts, culinary souvenirs, and artisan listings.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <ShoppingBag className="w-4 h-4" /><span>Add Product</span>
          </button>
        </div>
        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Product</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Price Range</th>
                  <th className="py-4 px-6">Seller</th>
                  <th className="py-4 px-6 text-center">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {SOUVENIRS.map(s => (
                  <tr key={s.name} className="hover:bg-bg/40 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary"><ShoppingBag className="w-4 h-4" /></div>
                        <span className="text-xs font-bold text-gray-900 font-display">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6"><span className="bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5 rounded-full">{s.category}</span></td>
                    <td className="py-4 px-6 font-semibold text-gray-700">{s.price}</td>
                    <td className="py-4 px-6 text-gray-500">{s.seller}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${s.stock === "In Stock" ? "bg-success/10 text-success" : s.stock === "Limited" ? "bg-warning/10 text-warning" : "bg-danger/10 text-danger"}`}>{s.stock}</span>
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
