"use client";

import { useEffect, useState } from "react";
import PartnerHeader from "@/components/PartnerHeader";
import { useToast } from "@/components/Toast";
import { User, Lock, Loader2, Save, Eye, EyeOff } from "lucide-react";

interface Profile {
  name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
}

export default function PartnerSettingsPage() {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);

  // Form — nama & telepon
  const [name, setName]     = useState("");
  const [phone, setPhone]   = useState("");

  // Form — password
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew]         = useState(false);
  const [pwSaving, setPwSaving]       = useState(false);

  // Load profil
  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((res: { status?: string; data?: Profile }) => {
        if (res.status !== "success" || !res.data) return;
        setProfile(res.data);
        setName(res.data.name || "");
        setPhone(res.data.phone_number || "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const res = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), phone_number: phone.trim() }),
    });
    const json = await res.json();
    if (res.ok && json.status === "success") {
      showToast("Tersimpan", "Profil berhasil diperbarui", "success");
      setProfile((prev) => prev ? { ...prev, name: name.trim(), phone_number: phone.trim() } : prev);
    } else {
      showToast("Gagal", json.message || "Terjadi kesalahan", "error");
    }
    setSaving(false);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!currentPw || !newPw) return;
    if (newPw !== confirmPw) {
      showToast("Tidak cocok", "Password baru dan konfirmasi tidak sama", "error");
      return;
    }
    if (newPw.length < 8) {
      showToast("Terlalu pendek", "Password minimal 8 karakter", "error");
      return;
    }
    setPwSaving(true);
    const res = await fetch("/api/me/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password: currentPw, new_password: newPw }),
    });
    const json = await res.json();
    if (res.ok && json.status === "success") {
      showToast("Password diperbarui", "Silakan login ulang jika diminta", "success");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } else {
      showToast("Gagal", json.message || "Password saat ini salah", "error");
    }
    setPwSaving(false);
  }

  return (
    <>
      <PartnerHeader />
      <main className="flex-1 overflow-y-auto p-8 space-y-8 max-w-2xl">

        <div>
          <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
            Account Settings
          </h2>
          <p className="text-xs text-gray-500 mt-1">Kelola profil dan keamanan akun Anda.</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-16 text-gray-400 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Memuat profil…</span>
          </div>
        ) : (
          <div className="space-y-6">

            {/* ── Profil ── */}
            <div className="bg-white rounded-card border border-border shadow-soft p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-primary/10">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 font-display">Informasi Profil</h3>
              </div>

              {/* Email — read only */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email</label>
                <input
                  type="email"
                  value={profile?.email || ""}
                  disabled
                  className="w-full bg-bg text-xs px-3.5 py-2.5 rounded-xl border border-transparent text-gray-400 font-medium cursor-not-allowed"
                />
                <p className="text-[10px] text-gray-400 mt-1">Email tidak dapat diubah.</p>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Nama Lengkap <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition font-medium"
                    placeholder="Nama Anda"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nomor Telepon</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition font-medium"
                    placeholder="08xxx"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Simpan Perubahan
                </button>
              </form>
            </div>

            {/* ── Password ── */}
            <div className="bg-white rounded-card border border-border shadow-soft p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-warning/10">
                  <Lock className="w-4 h-4 text-warning" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 font-display">Ubah Password</h3>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                {[
                  { label: "Password Saat Ini", value: currentPw, set: setCurrentPw, show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                  { label: "Password Baru", value: newPw, set: setNewPw, show: showNew, toggle: () => setShowNew(!showNew) },
                  { label: "Konfirmasi Password Baru", value: confirmPw, set: setConfirmPw, show: false, toggle: undefined },
                ].map(({ label, value, set, show, toggle }) => (
                  <div key={label}>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
                    <div className="relative">
                      <input
                        type={show ? "text" : "password"}
                        value={value}
                        onChange={(e) => set(e.target.value)}
                        className="w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 pr-10 rounded-xl border border-transparent focus:border-border outline-none transition font-medium"
                        placeholder="••••••••"
                      />
                      {toggle && (
                        <button
                          type="button"
                          onClick={toggle}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        >
                          {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={pwSaving}
                  className="flex items-center gap-2 border border-warning/30 bg-warning/10 text-warning hover:bg-warning/15 px-4 py-2.5 rounded-xl text-xs font-semibold transition disabled:opacity-50 cursor-pointer"
                >
                  {pwSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  Ubah Password
                </button>
              </form>
            </div>

          </div>
        )}
      </main>
    </>
  );
}
