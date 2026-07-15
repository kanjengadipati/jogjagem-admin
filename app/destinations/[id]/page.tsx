'use client';
import React, { useState, useEffect, use } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Save, Sparkles, ArrowLeft } from 'lucide-react';

export default function DestinationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [dest, setDest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetch(`/api/destinations/${encodeURIComponent(id)}`)
      .then(res => res.json())
      .then(data => { setDest(data.data || { name: id, category: 'Attraction', region: 'Yogyakarta', description: '' }); setLoading(false); })
      .catch(() => { setDest({ name: id, category: 'Attraction', region: 'Yogyakarta', description: '' }); setLoading(false); });
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    await fetch(`/api/destinations/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dest),
    });
    setSaving(false);
  };

  const generateDescription = async () => {
    const res = await fetch('/api/ai/generate-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinationName: dest.name, category: dest.category, region: dest.region, features: dest.features }),
    });
    const data = await res.json();
    setDest((prev: any) => ({ ...prev, description: data.description || prev.description }));
  };

  const generateSEO = async () => {
    const res = await fetch('/api/ai/seo-generator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: dest.name, description: dest.description }),
    });
    const data = await res.json();
    setDest((prev: any) => ({ ...prev, metaTitle: data.metaTitle, metaDescription: data.metaDescription }));
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-bg"><p>Loading...</p></div>;

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeId="destinations" user={{ name: "Admin Jogjagem", role: "Super Admin", email: "admin@explorejogja.com", avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com" }} currentDate={new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center gap-4 mb-6">
            <a href="/destinations" className="p-2 rounded-lg border border-border hover:bg-bg transition"><ArrowLeft className="w-4 h-4" /></a>
            <h2 className="text-2xl font-extrabold text-gray-900">Edit Destination</h2>
          </div>

          <div className="flex gap-2 mb-6 border-b border-border pb-2">
            {['overview', 'gallery', 'facilities', 'seo'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 rounded-t-xl text-xs font-bold transition ${activeTab === tab ? 'bg-primary text-white' : 'text-gray-500 hover:bg-bg'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow p-6 space-y-4">
                <h3 className="text-sm font-bold text-gray-800">Basic Information</h3>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Name</label>
                  <input type="text" value={dest.name || ''} onChange={e => setDest({ ...dest, name: e.target.value })} className="w-full mt-1 p-2.5 text-xs bg-bg rounded-xl border border-border outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase">Category</label>
                    <input type="text" value={dest.category || ''} onChange={e => setDest({ ...dest, category: e.target.value })} className="w-full mt-1 p-2.5 text-xs bg-bg rounded-xl border border-border outline-none" />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase">Region</label>
                    <input type="text" value={dest.region || ''} onChange={e => setDest({ ...dest, region: e.target.value })} className="w-full mt-1 p-2.5 text-xs bg-bg rounded-xl border border-border outline-none" />
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-800">Description</h3>
                  <button onClick={generateDescription} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition">
                    <Sparkles className="w-3 h-3" /> AI Generate
                  </button>
                </div>
                <textarea value={dest.description || ''} onChange={e => setDest({ ...dest, description: e.target.value })} rows={6} className="w-full p-3 text-xs bg-bg rounded-xl border border-border outline-none" />
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="bg-white rounded-xl shadow p-6 space-y-4 max-w-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">SEO Meta Tags</h3>
                <button onClick={generateSEO} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20 transition">
                  <Sparkles className="w-3 h-3" /> AI Generate
                </button>
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Meta Title</label>
                <input type="text" value={dest.metaTitle || ''} onChange={e => setDest({ ...dest, metaTitle: e.target.value })} className="w-full mt-1 p-2.5 text-xs bg-bg rounded-xl border border-border outline-none" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Meta Description</label>
                <textarea value={dest.metaDescription || ''} onChange={e => setDest({ ...dest, metaDescription: e.target.value })} rows={3} className="w-full mt-1 p-3 text-xs bg-bg rounded-xl border border-border outline-none" />
              </div>
            </div>
          )}

          {(activeTab === 'gallery' || activeTab === 'facilities') && (
            <div className="bg-white rounded-xl shadow p-6 text-center text-xs text-gray-500">
              <p>Media and facilities management coming soon.</p>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
