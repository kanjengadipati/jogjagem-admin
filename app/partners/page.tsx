'use client';
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Briefcase, Grid, List, Search, Plus, Eye, Check, X, ExternalLink } from 'lucide-react';

const mockPartners = [
  { id: 1, name: 'Heha Ocean View', category: 'Attraction', status: 'Verified', contact: 'heha@oceanview.com', visitors: 12400, rating: 4.5 },
  { id: 2, name: 'Jogja Transport Express', category: 'Transport', status: 'Pending', contact: 'info@jogjatransport.com', visitors: 8200, rating: 4.2 },
  { id: 3, name: 'Batik Winotosastro', category: 'Retail', status: 'Verified', contact: 'batik@winotosastro.com', visitors: 5600, rating: 4.8 },
  { id: 4, name: 'Omah Sinten', category: 'Restaurant', status: 'Verified', contact: 'info@omahsinten.com', visitors: 9100, rating: 4.6 },
];

export default function PartnersPage() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);

  const filtered = mockPartners.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeId="partners" user={{ name: "Admin Jogjagem", role: "Super Admin", email: "admin@explorejogja.com", avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com" }} currentDate={new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-gray-900">Tourism Partners</h2>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search partners..." className="pl-9 pr-4 py-2 text-xs bg-white border border-border rounded-xl outline-none w-64" />
              </div>
              <div className="flex bg-white border border-border rounded-xl overflow-hidden">
                <button onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-primary text-white' : 'text-gray-500'}`}><Grid className="w-4 h-4" /></button>
                <button onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-primary text-white' : 'text-gray-500'}`}><List className="w-4 h-4" /></button>
              </div>
              <button className="flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold"><Plus className="w-3.5 h-3.5" /> Add Partner</button>
            </div>
          </div>

          {view === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(partner => (
                <div key={partner.id} onClick={() => setSelected(partner)} className="bg-white rounded-xl shadow p-6 cursor-pointer hover:border-primary/20 border border-border transition-premium">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">{partner.name.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{partner.name}</p>
                      <p className="text-[10px] text-gray-500">{partner.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${partner.status === 'Verified' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{partner.status}</span>
                    <span className="text-xs text-gray-500">{partner.visitors.toLocaleString()} visitors</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow">
              <table className="w-full">
                <thead><tr className="text-left text-xs text-gray-500 uppercase border-b"><th className="p-4">Name</th><th>Category</th><th>Status</th><th>Visitors</th><th>Rating</th></tr></thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map(p => (
                    <tr key={p.id} onClick={() => setSelected(p)} className="cursor-pointer hover:bg-bg transition">
                      <td className="p-4 text-sm font-semibold">{p.name}</td>
                      <td className="text-xs text-gray-500">{p.category}</td>
                      <td><span className={`px-2 py-1 rounded-full text-[10px] font-bold ${p.status === 'Verified' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{p.status}</span></td>
                      <td className="text-xs">{p.visitors.toLocaleString()}</td>
                      <td className="text-xs text-yellow-500">{'★'.repeat(Math.floor(p.rating))}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {selected && (
            <div className="fixed inset-0 bg-black/30 flex items-center justify-end z-50" onClick={() => setSelected(null)}>
              <div className="w-96 h-full bg-white shadow-2xl p-6 overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
                  <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-bg"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-bg border border-border">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Category</p>
                    <p className="text-xs font-semibold">{selected.category}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-bg border border-border">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Status</p>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${selected.status === 'Verified' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{selected.status}</span>
                  </div>
                  <div className="p-4 rounded-xl bg-bg border border-border">
                    <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Contact</p>
                    <p className="text-xs font-semibold">{selected.contact}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 flex items-center justify-center gap-1 p-2.5 rounded-xl bg-success/10 text-success text-xs font-bold"><Check className="w-3 h-3" /> Approve</button>
                    <button className="flex-1 flex items-center justify-center gap-1 p-2.5 rounded-xl bg-danger/10 text-danger text-xs font-bold"><X className="w-3 h-3" /> Reject</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
