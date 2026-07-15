'use client';
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { Settings, Database, Activity, ExternalLink, Save } from 'lucide-react';

export default function SettingsPage() {
  const [backendUrl, setBackendUrl] = useState(process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8081');
  const [aiEnabled, setAiEnabled] = useState(true);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeId="settings" user={{ name: "Admin Jogjagem", role: "Super Admin", email: "admin@explorejogja.com", avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com" }} currentDate={new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} />
        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">System Settings</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-gray-800">Platform Configuration</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Site Name</label>
                  <input type="text" defaultValue="Jogjagem Admin Portal" className="w-full mt-1 p-2.5 text-xs bg-bg rounded-xl border border-border outline-none" />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Support Email</label>
                  <input type="email" defaultValue="admin@explorejogja.com" className="w-full mt-1 p-2.5 text-xs bg-bg rounded-xl border border-border outline-none" />
                </div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700">AI Features Enabled</label>
                  <button onClick={() => setAiEnabled(!aiEnabled)} className={`w-10 h-5 rounded-full transition-colors ${aiEnabled ? 'bg-success' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${aiEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-primary" />
                <h3 className="text-sm font-bold text-gray-800">Backend Connection</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Backend API URL</label>
                  <input type="text" value={backendUrl} onChange={e => setBackendUrl(e.target.value)} className="w-full mt-1 p-2.5 text-xs bg-bg rounded-xl border border-border outline-none" />
                </div>
                <div className="p-3 rounded-xl bg-bg border border-border">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-3.5 h-3.5 text-success" />
                    <span className="text-xs font-bold text-gray-800">System Health</span>
                  </div>
                  <p className="text-[10px] text-gray-500">All services operational. Last check: {new Date().toLocaleTimeString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow p-6 lg:col-span-2">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Quick Links</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Main Portal', href: process.env.NEXT_PUBLIC_APP_URL || '/' },
                  { label: 'User Management', href: '/users' },
                  { label: 'Role Management', href: '/roles' },
                  { label: 'Analytics', href: '/analytics' },
                ].map(link => (
                  <a key={link.label} href={link.href} className="flex items-center gap-2 p-3 rounded-xl border border-border hover:border-primary/20 hover:bg-primary/5 transition-premium text-xs font-semibold text-gray-700">
                    <ExternalLink className="w-3.5 h-3.5 text-primary" /> {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition">
              <Save className="w-3.5 h-3.5" /> Save Settings
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
