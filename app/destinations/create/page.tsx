'use client';
import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Sparkles, Upload, Save, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreateDestinationPage() {
  const router = useRouter();
  const [dest, setDest] = useState({ name: '', category: '', region: 'Yogyakarta', description: '', latitude: '', longitude: '' });
  const [saving, setSaving] = useState(false);

  const generateDescription = async () => {
    const res = await fetch('/api/ai/generate-description', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destinationName: dest.name, category: dest.category, region: dest.region }),
    });
    const data = await res.json();
    setDest(prev => ({ ...prev, description: data.description || prev.description }));
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeId="destinations" user={{ name: "Admin Jogjagem", role: "Super Admin", email: "admin@explorejogja.com", avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com" }} currentDate={new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center gap-4 mb-6">
            <a href="/destinations" className="p-2 rounded-lg border border-border hover:bg-bg transition"><ArrowLeft className="w-4 h-4" /></a>
            <h2 className="text-2xl font-extrabold text-gray-900">Register New Destination</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl">
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <h3 className="text-sm font-bold text-gray-800">Basic Information</h3>
              <div>
                <label className="text-[11px] font-bold text-gray-400 uppercase">Destination Name</label>
                <input type="text" value={dest.name} onChange={e => setDest({ ...dest, name: e.target.value })} className="w-full mt-1 p-2.5 text-xs bg-bg rounded-xl border border-border outline-none" placeholder="e.g. Borobudur Temple" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Category</label>
                  <input type="text" value={dest.category} onChange={e => setDest({ ...dest, category: e.target.value })} className="w-full mt-1 p-2.5 text-xs bg-bg rounded-xl border border-border outline-none" placeholder="e.g. Temple" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Region</label>
                  <input type="text" value={dest.region} onChange={e => setDest({ ...dest, region: e.target.value })} className="w-full mt-1 p-2.5 text-xs bg-bg rounded-xl border border-border outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Latitude</label>
                  <input type="text" value={dest.latitude} onChange={e => setDest({ ...dest, latitude: e.target.value })} className="w-full mt-1 p-2.5 text-xs bg-bg rounded-xl border border-border outline-none" placeholder="-7.6079" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase">Longitude</label>
                  <input type="text" value={dest.longitude} onChange={e => setDest({ ...dest, longitude: e.target.value })} className="w-full mt-1 p-2.5 text-xs bg-bg rounded-xl border border-border outline-none" placeholder="110.2038" />
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
              <textarea value={dest.description} onChange={e => setDest({ ...dest, description: e.target.value })} rows={6} className="w-full p-3 text-xs bg-bg rounded-xl border border-border outline-none" placeholder="Enter or generate a description..." />

              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center">
                <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs text-gray-500">Drag & drop media files here</p>
                <p className="text-[10px] text-gray-400 mt-1">PNG, JPG, WEBP up to 10MB</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3 max-w-4xl">
            <a href="/destinations" className="px-6 py-2.5 rounded-xl text-xs font-bold border border-border hover:bg-bg transition">Cancel</a>
            <button onClick={() => { setSaving(true); router.push('/destinations'); }} disabled={saving} className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition">
              <Save className="w-3.5 h-3.5" /> {saving ? 'Creating...' : 'Create Destination'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
