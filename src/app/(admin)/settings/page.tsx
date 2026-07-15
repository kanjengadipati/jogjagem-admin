"use client";

import { useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { Save, Bell, Shield, Globe, Database, Sparkles } from "lucide-react";

export default function SettingsPage() {
  const { showToast } = useToast();
  const [backendUrl, setBackendUrl] = useState("http://localhost:8081");
  const [appName, setAppName] = useState("Explore Jogja Admin");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifFlag, setNotifFlag] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);

  return (
    <>
      <Header activeId="settings" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">System Settings</h2>
          <p className="text-xs text-gray-500 mt-1">Configure platform settings, integrations, and notification preferences.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">

            {/* General */}
            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-gray-800 font-display">General Configuration</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Application Name</label>
                  <input value={appName} onChange={e => setAppName(e.target.value)} className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Backend API URL</label>
                  <input value={backendUrl} onChange={e => setBackendUrl(e.target.value)} className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-mono" />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-gray-800 font-display">Notification Preferences</h4>
              </div>
              <div className="space-y-3">
                {[
                  { label:"Email notifications for new reviews", desc:"Receive email when new reviews are submitted", value: notifEmail, setter: setNotifEmail },
                  { label:"Flag alerts for spam detection",       desc:"Get alerted when AI flags suspicious content", value: notifFlag, setter: setNotifFlag },
                ].map(n => (
                  <div key={n.label} className="flex items-center justify-between p-4 rounded-2xl bg-bg border border-border">
                    <div>
                      <p className="text-xs font-bold text-gray-800">{n.label}</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">{n.desc}</p>
                    </div>
                    <button onClick={() => n.setter(!n.value)} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${n.value ? "bg-primary" : "bg-gray-200"}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${n.value ? "translate-x-5" : ""}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AI */}
            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-gray-800 font-display">AI Engine Configuration</h4>
              </div>
              <div className="flex items-center justify-between p-4 rounded-2xl bg-bg border border-border">
                <div>
                  <p className="text-xs font-bold text-gray-800">Enable Gemini AI Integration</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Powers description generation, SEO, and review summarization</p>
                </div>
                <button onClick={() => setAiEnabled(!aiEnabled)} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${aiEnabled ? "bg-primary" : "bg-gray-200"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${aiEnabled ? "translate-x-5" : ""}`} />
                </button>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Gemini API Key</label>
                <input type="password" defaultValue="••••••••••••••••••••••••" className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-mono" />
                <p className="text-[10px] text-gray-400">Set via GEMINI_API_KEY environment variable.</p>
              </div>
            </div>

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold text-gray-800 font-display">Security</h4>
              </div>
              <div className="space-y-2 text-xs text-gray-600">
                {["Session timeout: 24 hours","Cookie: HttpOnly + SameSite=Lax","HTTPS enforced in production","Admin token rotation: Daily"].map(s => (
                  <div key={s} className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-success flex-shrink-0" />{s}</div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-4">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-primary" />
                <h4 className="text-xs font-bold text-gray-800 font-display">System Info</h4>
              </div>
              <div className="space-y-2 text-[10px] text-gray-500">
                {[["Platform","Next.js 15"],["Runtime","Node.js 22"],["Version","v3.5.0-next"],["API","localhost:8081"]].map(([k,v]) => (
                  <div key={k} className="flex justify-between"><span>{k}</span><span className="font-bold text-gray-700">{v}</span></div>
                ))}
              </div>
            </div>

            <button onClick={() => showToast("Saved","Settings updated successfully","success")} className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
              <Save className="w-4 h-4" /><span>Save Settings</span>
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
