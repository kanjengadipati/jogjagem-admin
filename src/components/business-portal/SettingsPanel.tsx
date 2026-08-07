"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BusinessHeader from "@/components/BusinessHeader";
import { useToast } from "@/components/Toast";
import { Building, Users, AlertTriangle, Save, Loader2, Info, User, Mail, Shield, ShieldCheck, KeyRound, CheckCircle2, UserPlus, Crown, X } from "lucide-react";
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
  const { active: activeBiz, externalId } = useActiveBusiness();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingBiz, setSavingBiz] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [business, setBusiness] = useState<any | null>(null);
  const [isBusiness, setIsBusiness] = useState(false);

  // Team Member State
  const [members, setMembers] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("admin");
  const [submittingInvite, setSubmittingInvite] = useState(false);
  const [inviteResult, setInviteResult] = useState<any | null>(null);
  const [copiedInvite, setCopiedInvite] = useState(false);

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

  const applyBusiness = (biz: any) => {
    setBusiness(biz);
    setIsBusiness(true);
    setBizName(biz.name || "");
    setBizPhone(biz.phone || "");
    setBizCategory(biz.category || "Wisata & Destinasi");
    setBizDescription(biz.description || "");
    setBizWebsite(biz.website || "");
  };

  useEffect(() => {
    if (!activeBiz) return;
    applyBusiness(activeBiz);
    setLoading(false);
  }, [activeBiz]);

  const bizId = externalId || activeBiz?.id;

  const loadMembers = async () => {
    if (!bizId) {
      setLoadingMembers(false);
      return;
    }
    setLoadingMembers(true);
    try {
      const res = await fetch(`/api/businesses/me/${bizId}/members`);
      const json = await res.json();
      const list = json?.data ?? [];
      setMembers(Array.isArray(list) ? list : []);
    } catch {
      showToast("Error", "Gagal memuat anggota tim", "error");
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, [bizId]);

  const canManageMembers = members.some(
    (m) => m.is_current_user && m.role === "owner"
  );

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizId) return;
    const email = inviteEmail.trim();
    if (!email) {
      showToast("Error", "Email wajib diisi", "error");
      return;
    }
    setSubmittingInvite(true);
    try {
      const res = await fetch(`/api/businesses/me/${bizId}/members/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: inviteRole }),
      });
      const json = await res.json();
      if (res.ok && json?.status === "success") {
        const data = json?.data;
        if (data?.type === "invite" && data?.invite_url) {
          setInviteResult(data);
          setCopiedInvite(false);
        } else {
          showToast("Berhasil", json?.message || "Anggota berhasil ditambahkan", "success");
        }
        setInviteEmail("");
        setShowInvite(false);
        await loadMembers();
      } else {
        const msg = json?.message || json?.error || "Gagal menambahkan anggota";
        showToast("Error", msg, "error");
      }
    } catch {
      showToast("Error", "Gagal menambahkan anggota", "error");
    } finally {
      setSubmittingInvite(false);
    }
  };

  const copyInviteLink = async () => {
    if (!inviteResult?.invite_url) return;
    try {
      await navigator.clipboard.writeText(inviteResult.invite_url);
      setCopiedInvite(true);
      setTimeout(() => setCopiedInvite(false), 2000);
    } catch {
      showToast("Error", "Gagal menyalin link", "error");
    }
  };

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
          setBusiness(business ? { ...business, status: "pending" } : business);
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
    if (userName.trim().length < 3) {
      showToast("Nama akun minimal 3 karakter", "error");
      return;
    }

    setSavingProfile(true);
    try {
      let phone = userPhone.trim();
      if (phone && !phone.startsWith("+")) {
        if (phone.startsWith("62")) phone = `+${phone}`;
        else if (phone.startsWith("0")) phone = `+62${phone.slice(1)}`;
      }
      const res = await fetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: userName.trim(),
          ...(phone ? { phone_number: phone } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setProfile((prev) =>
          prev ? { ...prev, name: userName.trim(), phone_number: phone } : prev
        );
        showToast("Profil pengguna berhasil diperbarui!", "success");
      } else {
        showToast(
          data?.error || data?.message || "Gagal memperbarui profil pengguna",
          "error"
        );
      }
    } catch {
      showToast("Terjadi kesalahan jaringan", "error");
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
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-bold text-stone-900 font-display">
                  <Users className="w-4 h-4 text-stone-600" />
                  <span>Tim</span>
                </div>
                {bizId && (
                  <Link
                    href={`/business/${bizId}/team`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100/80 hover:bg-amber-50 border border-stone-200 hover:border-amber-300 text-[11px] font-bold text-stone-600 hover:text-[#B5781E] transition-all"
                  >
                    <Users className="w-3.5 h-3.5" />
                    Kelola tim
                  </Link>
                )}
              </div>

              {loadingMembers ? (
                <div className="flex items-center gap-2 py-5 text-xs font-semibold text-stone-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Memuat anggota...
                </div>
              ) : members.length === 0 ? (
                <p className="text-xs text-stone-400 font-medium py-3">
                  Belum ada anggota tim.
                </p>
              ) : (
                <div className="space-y-2">
                  {members.map((m) => {
                    const isOwner = m.role === "owner";
                    return (
                      <div
                        key={m.user_id}
                        className="p-4 rounded-2xl border border-stone-200/80 bg-stone-50/50 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                              isOwner ? "bg-[#B57A21]" : "bg-stone-400"
                            }`}
                          >
                            {(m.name || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-stone-900 truncate">
                              {m.name}
                              {m.is_current_user && (
                                <span className="ml-1.5 text-[9px] font-bold uppercase text-stone-400">
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-400 font-medium truncate">
                              {m.email}
                            </div>
                          </div>
                        </div>
                        <span
                          className={`flex items-center gap-1 px-3 py-1 rounded-full border text-[10px] font-extrabold uppercase tracking-wide shrink-0 ${
                            isOwner
                              ? "bg-[#FAF3E6] text-[#B5781E] border-[#F2E3C6]"
                              : "bg-violet-50 text-violet-700 border-violet-200"
                          }`}
                        >
                          {isOwner ? (
                            <Crown className="w-3 h-3" />
                          ) : (
                            <ShieldCheck className="w-3 h-3" />
                          )}
                          {isOwner ? "Pemilik" : "Admin"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {canManageMembers && (
                <button
                  type="button"
                  onClick={() => setShowInvite(true)}
                  className="px-4 py-2.5 rounded-2xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-700 transition-all cursor-pointer flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Undang anggota tim
                </button>
              )}
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

        {showInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs"
              onClick={() => setShowInvite(false)}
            />
            <form
              onSubmit={handleInviteMember}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-stone-900 font-display">
                  Undang Anggota Tim
                </h2>
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="w-8 h-8 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1.5">
                  Email terdaftar
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-4 py-3 rounded-2xl border border-stone-200 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-400"
                />
                <p className="text-[10px] text-stone-400 mt-1.5">
                  Anggota yang sudah terdaftar langsung ditambahkan. Jika belum
                  terdaftar, mereka akan menerima link undangan.
                </p>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-stone-400 uppercase tracking-wider mb-1.5">
                  Peran
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteRole("admin")}
                    className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      inviteRole === "admin"
                        ? "border-violet-300 bg-violet-50 text-violet-700"
                        : "border-stone-200 text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mx-auto mb-1" />
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setInviteRole("owner")}
                    className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      inviteRole === "owner"
                        ? "border-amber-300 bg-amber-50 text-[#B5781E]"
                        : "border-stone-200 text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    <Crown className="w-4 h-4 mx-auto mb-1" />
                    Pemilik
                  </button>
                </div>
                <p className="text-[10px] text-stone-400 mt-1.5">
                  Pemilik dapat mengelola anggota; admin hanya dapat mengelola konten bisnis.
                </p>
              </div>

              <button
                type="submit"
                disabled={submittingInvite}
                className="w-full py-3 rounded-2xl bg-[#B57A21] hover:bg-[#9B671A] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submittingInvite ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menambah...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Undang Anggota
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {inviteResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs"
              onClick={() => setInviteResult(null)}
            />
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-stone-900 font-display">
                  Bagikan Link Undangan
                </h2>
                <button
                  onClick={() => setInviteResult(null)}
                  className="w-8 h-8 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-stone-500 font-medium leading-relaxed">
                Undangan untuk <b>{inviteResult.email}</b> sebagai{" "}
                <b>{inviteResult.role}</b> belum diterima. Kirimkan link ini
                kepada mereka. Link berlaku selama 7 hari.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                <input
                  readOnly
                  value={inviteResult.invite_url}
                  onFocus={(e) => e.currentTarget.select()}
                  className="flex-1 min-w-0 bg-transparent text-[11px] font-semibold text-stone-600 focus:outline-none truncate"
                />
                <button
                  onClick={copyInviteLink}
                  className="shrink-0 px-3 py-2 rounded-xl bg-[#B57A21] hover:bg-[#9B671A] text-white text-[11px] font-bold transition-all cursor-pointer"
                >
                  {copiedInvite ? "Tersalin!" : "Salin"}
                </button>
              </div>
              <button
                onClick={() => setInviteResult(null)}
                className="w-full py-3 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all cursor-pointer"
              >
                Selesai
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
