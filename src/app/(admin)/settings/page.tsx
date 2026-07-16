"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { Save, Bell, Shield, Globe, Database, Sparkles, Search } from "lucide-react";
import type { SiteSeoConfig } from "@/types";

const DEFAULT_SEO: SiteSeoConfig = {
  site_title: "",
  site_description: "",
  site_keywords: "",
  og_default_image: "",
  twitter_handle: "",
  landing_hero_title: "",
  landing_hero_subtitle: "",
  landing_cta_text: "",
};

export default function SettingsPage() {
  const { showToast } = useToast();
  const [backendUrl, setBackendUrl] = useState("http://localhost:8081");
  const [appName, setAppName] = useState("Jogjagem Admin");
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifFlag, setNotifFlag] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [seoConfig, setSeoConfig] = useState<SiteSeoConfig>(DEFAULT_SEO);
  const [seoLoading, setSeoLoading] = useState(true);
  const [seoSaving, setSeoSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings/seo")
      .then(r => r.json())
      .then(data => {
        if (data?.data) setSeoConfig(data.data);
      })
      .catch(() => {})
      .finally(() => setSeoLoading(false));
  }, []);

  function setSeoField(key: keyof SiteSeoConfig, value: string) {
    setSeoConfig(prev => ({ ...prev, [key]: value }));
  }

  async function saveSeoConfig() {
    setSeoSaving(true);
    try {
      const configs = Object.entries(seoConfig).map(([key, value]) => ({ key, value, category: key.startsWith("landing_") ? "landing" : "seo" }));
      const res = await fetch("/api/settings/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ configs }),
      });
      if (res.ok) {
        showToast("Saved", "SEO & Landing Page settings updated", "success");
      } else {
        showToast("Error", "Failed to save SEO settings", "error");
      }
    } catch {
      showToast("Error", "Network error", "error");
    } finally {
      setSeoSaving(false);
    }
  }

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

            {/* SEO & Landing Page */}
            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-primary" />
                  <h4 className="text-sm font-bold text-gray-800 font-display">SEO & Landing Page</h4>
                </div>
                <button onClick={saveSeoConfig} disabled={seoSaving}
                  className="flex items-center gap-1.5 text-primary text-xs font-bold cursor-pointer disabled:opacity-60">
                  <Save className="w-3.5 h-3.5" />{seoSaving ? "Saving..." : "Save SEO"}
                </button>
              </div>

              {seoLoading ? (
                <p className="text-xs text-gray-400">Loading...</p>
              ) : (
                <>
                  {/* Site SEO */}
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Site-Wide SEO</span>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Site Title</label>
                      <input value={seoConfig.site_title} onChange={e => setSeoField("site_title", e.target.value)}
                        className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Site Description</label>
                      <textarea value={seoConfig.site_description} onChange={e => setSeoField("site_description", e.target.value)} rows={3}
                        className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Default Keywords</label>
                        <input value={seoConfig.site_keywords} onChange={e => setSeoField("site_keywords", e.target.value)}
                          className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Twitter Handle</label>
                        <input value={seoConfig.twitter_handle} onChange={e => setSeoField("twitter_handle", e.target.value)}
                          placeholder="@jogjagem"
                          className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Default OG Image URL</label>
                      <input value={seoConfig.og_default_image} onChange={e => setSeoField("og_default_image", e.target.value)}
                        placeholder="/og-default.png"
                        className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                      {seoConfig.og_default_image && (
                        <div className="relative rounded-xl overflow-hidden aspect-video border border-border mt-2">
                          <img src={seoConfig.og_default_image} alt="OG Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-[10px] text-gray-400">Used when no destination-specific OG image is set.</p>
                    </div>
                  </div>

                  {/* Landing Page */}
                  <div className="space-y-4 pt-4 border-t border-border">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Landing Page Content</span>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Hero Title</label>
                      <input value={seoConfig.landing_hero_title} onChange={e => setSeoField("landing_hero_title", e.target.value)}
                        className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Hero Subtitle</label>
                      <textarea value={seoConfig.landing_hero_subtitle} onChange={e => setSeoField("landing_hero_subtitle", e.target.value)} rows={2}
                        className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">CTA Button Text</label>
                      <input value={seoConfig.landing_cta_text} onChange={e => setSeoField("landing_cta_text", e.target.value)}
                        className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                    </div>
                  </div>
                </>
              )}
            </div>

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
                  <p className="text-xs font-bold text-gray-800">Enable AI Integration</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">Powers description generation, SEO, and review summarization via the backend AI engine</p>
                </div>
                <button onClick={() => setAiEnabled(!aiEnabled)} className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${aiEnabled ? "bg-primary" : "bg-gray-200"}`}>
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${aiEnabled ? "translate-x-5" : ""}`} />
                </button>
              </div>
              <p className="text-[10px] text-gray-400">AI is powered by the backend engine. Configure the provider via <code className="font-mono bg-bg px-1 py-0.5 rounded">AI_PROVIDER</code> in the API environment.</p>
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
