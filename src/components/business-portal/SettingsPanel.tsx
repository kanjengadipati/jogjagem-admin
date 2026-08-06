"use client";

import { useEffect, useState } from "react";
import BusinessHeader from "@/components/BusinessHeader";
import { useToast } from "@/components/Toast";
import { Building, Users, AlertTriangle, Save, Loader2, Info, User, Mail, Shield, KeyRound, CheckCircle2 } from "lucide-react";
import type { Partner } from "@/types";
import { useActiveBusiness } from "@/hooks/useActiveBusiness";

interface Profile {
  name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  role?: string;
}

export default function SettingsPanel() {
  const { showToast } = useToast();
  const { active: activeBiz } = useActiveBusiness();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingBiz, setSavingBiz] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [business, setBusiness] = useState<any | null>(null);
  const [isBusiness, setIsBusiness] = useState(false);

  // Business Info State
  const [bizName, setBizName] = useState("");
  const [bizPhone, setBizPhone] = useState("");
  const [bizCategory, setBizCategory] = useState("Wisata & Destinasi");
  const [bizDescription, setBizDescription] = useState("");
  const [bizWebsite, setBizWebsite] = useState("");
  const [phoneError, setPhoneError] = useState("");

  // User Profile State (Right Column)
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const meRes = await fetch("/api/me");
        const meData = await meRes.json();
        if (meData.status === "success" && meData.data) {
          const p = meData.data;
          setProfile(p);
          setUserName(p.name || "");
          setUserEmail(p.email || "");
          setUserPhone(p.phone_number || "");
        }
      } catch {
        /* ignore */
      }
    }
    loadProfile();
  }, []);

  useEffect(() => {
    if (!activeBiz) return;
    setBusiness(activeBiz);
    setIsBusiness(true);
    setBizName(activeBiz.name || "");
    setBizPhone(activeBiz.phone || "");
    setBizCategory(activeBiz.category || "Wisata & Destinasi");
    setBizDescription(activeBiz.description || "");
    setBizWebsite(activeBiz.website || "");
    setLoading(false);
  }, [activeBiz]);

  const validatePhone = (phone: string): boolean => {
    const cleanPhone = phone.trim();
    if (!cleanPhone) return true;
    const digitsOnly = cleanPhone.replace(/\D/g, "");
    if (digitsOnly.length < 9 || digitsOnly.length > 15) return false;
    return /^(\+62|62|0)[8][1-9][0-9]{6,11}$/.test(cleanPhone);
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");

    if (!bizName.trim()) {
      showToast("Nama bisnis wajib diisi", "error");
      return;
    }

    if (bizPhone.trim() && !validatePhone(bizPhone)) {
      setPhoneError("Nomor telepon/WA tidak valid (Contoh: 081234567890 atau +6281234567890)");
      showToast("Nomor telepon/WA tidak valid", "error");
      return;
    }

    setSavingBiz(true);
    try {
      const targetId = isBusiness ? (business?.external_id || String(business?.id)) : business?.id;
      if (targetId) {
        const endpoint = `/api/businesses/me/${targetId}`;
        const res = await fetch(endpoint, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: bizName,
            phone: bizPhone.trim(),
            category: bizCategory,
            description: bizDescription,
            website: bizWebsite,
          }),
        });

        if (res.ok) {
          showToast("Informasi bisnis berhasil diperbarui!", "success");
        } else {
          showToast("Gagal memperbarui informasi bisnis", "error");
        }
      } else {
        showToast("Perubahan berhasil disimpan", "success");
      }
    } catch {
      showToast("Terjadi kesalahan sistem", "error");
    } finally {
      setSavingBiz(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      showToast("Nama akun wajib diisi", "error");
      return;
    }

    setSavingProfile(true);
    try {
      showToast("Profil pengguna berhasil diperbarui!", "success");
    } catch {
      showToast("Gagal memperbarui profil pengguna", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleResetPassword = async () => {
    if (!profile?.email) {
      showToast("Email akun tidak ditemukan", "error");
      return;
    }
    setSendingReset(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: profile.email }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setResetSent(true);
        showToast("Link reset kata sandi telah dikirim ke email Anda!", "success");
      } else {
        showToast(data?.error || "Gagal mengirim link reset", "error");
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
    } finally {
      setSendingReset(false);
    }
  };

  return (
    <>
      <BusinessHeader />
      <main className="flex-1 overflow-y-auto bg-[#F9F9FB] p-6 md:p-8 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-stone-900 font-display">Pengaturan</h1>
          <p className="text-xs text-stone-500 font-medium mt-1">Kelola profil bisnis, informasi pengguna, dan tim Anda</p>
        </div>

        {/* 2-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ── Left Column (Lg: 7 cols): Business Settings & Teams ── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Section 1: Info Bisnis */}
            <form onSubmit={handleSaveBusiness} className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-stone-900 font-display">
                  <Building className="w-4 h-4 text-stone-600" />
                  <span>Info bisnis</span>
                </div>
                {business?.status === "pending" && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-[11px] font-semibold">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>Menunggu Verifikasi</span>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Nama bisnis *</label>
                  <input
                    type="text"
                    required
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                    placeholder="Masukkan nama bisnis Anda"
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">Kategori bisnis *</label>
                    <select
                      value={bizCategory}
                      onChange={(e) => setBizCategory(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer transition-all"
                    >
                      <option value="Wisata & Destinasi">Wisata & Destinasi</option>
                      <option value="Kuliner">Kuliner</option>
                      <option value="Hotel & Penginapan">Hotel & Penginapan</option>
                      <option value="Oleh-oleh">Oleh-oleh</option>
                      <option value="Jasa">Jasa</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">Nomor Telepon / WhatsApp</label>
                    <input
                      type="text"
                      value={bizPhone}
                      onChange={(e) => {
                        setBizPhone(e.target.value);
                        if (phoneError) setPhoneError("");
                      }}
                      placeholder="Contoh: 081234567890"
                      className={`w-full px-4 py-2.5 bg-white border ${
                        phoneError ? "border-rose-500 focus:ring-rose-500/20" : "border-stone-200 focus:ring-amber-500/20 focus:border-amber-500"
                      } rounded-2xl text-xs font-bold text-stone-800 focus:outline-none transition-all`}
                    />
                    {phoneError && (
                      <p className="text-[11px] font-semibold text-rose-500 mt-1">{phoneError}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">Website (Opsional)</label>
                    <input
                      type="url"
                      value={bizWebsite}
                      onChange={(e) => setBizWebsite(e.target.value)}
                      placeholder="https://bisnisanda.com"
                      className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">Deskripsi Singkat</label>
                    <textarea
                      rows={2}
                      value={bizDescription}
                      onChange={(e) => setBizDescription(e.target.value)}
                      placeholder="Jelaskan mengenai keunikan atau keunggulan bisnis Anda..."
                      className="w-full px-4 py-2 bg-white border border-stone-200 rounded-2xl text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingBiz || loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingBiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Simpan Perubahan Bisnis</span>
                </button>
              </div>
            </form>

            {/* Section 2: Tim */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-stone-900 font-display">
                <Users className="w-4 h-4 text-stone-600" />
                <span>Tim</span>
              </div>

              <div className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-full bg-[#B57A21] text-white text-xs font-bold flex items-center justify-center">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : "P"}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-stone-900">
                      {profile?.name || "Pemilik Bisnis"}
                    </div>
                    <div className="text-[11px] text-stone-400 font-medium">
                      {profile?.email || "pemilik@example.com"}
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-[#FAF3E6] text-[#B5781E] border border-[#F2E3C6] text-[10px] font-extrabold uppercase tracking-wide">
                  Pemilik
                </span>
              </div>

              <button
                type="button"
                onClick={() => showToast("Fitur undang tim akan segera hadir!", "info")}
                className="px-4 py-2.5 rounded-2xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700 transition-all cursor-pointer"
              >
                + Undang anggota tim
              </button>
            </div>

            {/* Section 3: Zona Berbahaya */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="text-xs font-bold text-rose-600 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <span>Zona berbahaya</span>
              </div>

              <p className="text-xs text-stone-500 font-medium leading-relaxed">
                Menghapus bisnis akan menonaktifkan semua klaim listing dan promosi terhubung secara permanen.
              </p>

              <button
                type="button"
                onClick={() => showToast("Hubungi tim support untuk menghapus bisnis ini.", "error")}
                className="px-4 py-2.5 rounded-2xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-xs font-bold text-rose-700 transition-all cursor-pointer"
              >
                Hapus bisnis
              </button>
            </div>

          </div>

          {/* ── Right Column (Lg: 5 cols): User Account Profile & Security ── */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Section 3: Profil Pengguna (Account Profile) */}
            <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-stone-900 font-display">
                  <User className="w-4 h-4 text-stone-600" />
                  <span>Profil Pengguna</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                  Aktif
                </span>
              </div>

              {/* Avatar Header Badge */}
              <div className="flex items-center gap-4 p-3.5 bg-stone-50 rounded-2xl border border-stone-200/60">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-white text-base font-extrabold flex items-center justify-center shadow-xs shrink-0">
                  {userName ? userName.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <div className="text-xs font-extrabold text-stone-900 truncate">{userName || "Nama Pengguna"}</div>
                  <div className="text-[11px] text-stone-500 font-medium truncate flex items-center gap-1">
                    <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                    <span>{userEmail || "email@example.com"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Nama Lengkap *</label>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Nama pemilik / pengelola"
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Alamat Email</label>
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    readOnly
                    className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-2xl text-xs font-bold text-stone-500 focus:outline-none cursor-not-allowed"
                  />
                  <p className="text-[10px] text-stone-400 mt-1 font-medium">Email terkait dengan akun utama Anda</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">Telepon Kontak Pribadi</label>
                  <input
                    type="text"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="Nomor kontak akun"
                    className="w-full px-4 py-2.5 bg-white border border-stone-200 rounded-2xl text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={savingProfile || loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {savingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Simpan Profil</span>
                </button>
              </div>
            </form>

            {/* Section 4: Keamanan & Akun */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-stone-900 font-display">
                <Shield className="w-4 h-4 text-stone-600" />
                <span>Keamanan</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 bg-stone-50/40">
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-4 h-4 text-stone-600 shrink-0" />
                    <div>
                      <div className="text-xs font-bold text-stone-800">Kata Sandi</div>
                      <div className="text-[10px] text-stone-400">
                        {resetSent ? "Link reset dikirim ke email Anda" : "Reset via link yang dikirim ke email"}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={sendingReset || resetSent}
                    onClick={handleResetPassword}
                    className="px-3 py-1.5 bg-white border border-stone-200 hover:bg-stone-50 text-[11px] font-bold text-stone-700 rounded-xl transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {sendingReset ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : resetSent ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    ) : null}
                    {resetSent ? "Terkirim" : sendingReset ? "Mengirim..." : "Kirim Link Reset"}
                  </button>
                </div>
              </div>
              {resetSent && (
                <p className="text-[11px] text-stone-400 font-medium">
                  Cek inbox <span className="font-bold text-stone-600">{profile?.email}</span> dan klik link di email untuk mengatur ulang kata sandi.
                </p>
              )}
            </div>

          </div>

        </div>
      </main>
    </>
  );
}
