"use client";

import { useCallback, useEffect, useState } from "react";
import BusinessHeader from "@/components/BusinessHeader";
import { useToast } from "@/components/Toast";
import { Users, UserPlus, Loader2, Trash2, Crown, ShieldCheck, Mail, X } from "lucide-react";
import { useActiveBusiness } from "@/hooks/useActiveBusiness";

interface TeamMember {
  user_id: number;
  name: string;
  email: string;
  avatar_url?: string;
  role: string;
  invited_by?: number;
  is_current_user: boolean;
}

interface PendingInvite {
  id: number;
  email: string;
  role: string;
  status: string;
  expires_at: string;
  invited_by_name?: string;
  created_at: string;
}

interface InviteResult {
  type: "existing" | "invite";
  token?: string;
  invite_url?: string;
  email?: string;
  role?: string;
}

const ROLE_META: Record<string, { label: string; badge: string; icon: typeof Crown }> = {
  owner: {
    label: "Pemilik",
    badge: "bg-amber-100 text-[#B5781E]",
    icon: Crown,
  },
  admin: {
    label: "Admin",
    badge: "bg-violet-100 text-violet-700",
    icon: ShieldCheck,
  },
};

export default function TeamPanel() {
  const { showToast } = useToast();
  const { active: business, externalId } = useActiveBusiness();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [submitting, setSubmitting] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [inviteResult, setInviteResult] = useState<InviteResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [revokingId, setRevokingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!business) {
      setLoading(false);
      setLoadingInvites(false);
      return;
    }
    const id = externalId || business.id;
    setLoading(true);
    setLoadingInvites(true);
    try {
      const [membersRes, invitesRes] = await Promise.all([
        fetch(`/api/businesses/me/${id}/members`),
        fetch(`/api/businesses/me/${id}/members/invites`),
      ]);
      const membersJson = await membersRes.json();
      const invitesJson = await invitesRes.json();
      const memberList: TeamMember[] = membersJson?.data ?? [];
      const inviteList: PendingInvite[] = invitesJson?.data ?? [];
      setMembers(Array.isArray(memberList) ? memberList : []);
      setPendingInvites(Array.isArray(inviteList) ? inviteList : []);
    } catch {
      showToast("Error", "Gagal memuat anggota tim", "error");
    } finally {
      setLoading(false);
      setLoadingInvites(false);
    }
  }, [business, externalId, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const canManage = members.some(
    (m) => m.is_current_user && m.role === "owner"
  );

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!business) return;
    const id = externalId || business.id;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/businesses/me/${id}/members/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role }),
      });
      const json = await res.json();
      if (res.ok && json?.status === "success") {
        const data: InviteResult | undefined = json?.data;
        if (data?.type === "invite" && data.invite_url) {
          setInviteResult(data);
          setCopied(false);
        } else {
          showToast("Berhasil", json?.message || "Anggota berhasil ditambahkan", "success");
        }
        setEmail("");
        setShowInvite(false);
        await load();
      } else {
        const msg = json?.message || "Gagal menambahkan anggota";
        showToast("Error", msg, "error");
      }
    } catch {
      showToast("Error", "Gagal menambahkan anggota", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const copyInviteLink = async () => {
    if (!inviteResult?.invite_url) return;
    try {
      await navigator.clipboard.writeText(inviteResult.invite_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Error", "Gagal menyalin link", "error");
    }
  };

  async function revokeInvite(inviteId: number) {
    if (!business) return;
    if (!window.confirm("Batalkan undangan ini?")) return;
    const id = externalId || business.id;
    setRevokingId(inviteId);
    try {
      const res = await fetch(
        `/api/businesses/me/${id}/members/invites/${inviteId}`,
        { method: "DELETE" }
      );
      const json = await res.json();
      if (res.ok && json?.status === "success") {
        showToast("Berhasil", "Undangan dibatalkan", "success");
        await load();
      } else {
        const msg = json?.message || "Gagal membatalkan undangan";
        showToast("Error", msg, "error");
      }
    } catch {
      showToast("Error", "Gagal membatalkan undangan", "error");
    } finally {
      setRevokingId(null);
    }
  }

  async function handleRemove(member: TeamMember) {
    if (!business) return;
    if (!window.confirm(`Hapus ${member.name} dari tim bisnis ini?`)) return;
    const id = externalId || business.id;
    setRemovingId(member.user_id);
    try {
      const res = await fetch(`/api/businesses/me/${id}/members/${member.user_id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (res.ok && json?.status === "success") {
        showToast("Berhasil", "Anggota dihapus", "success");
        await load();
      } else {
        const msg = json?.message || "Gagal menghapus anggota";
        showToast("Error", msg, "error");
      }
    } catch {
      showToast("Error", "Gagal menghapus anggota", "error");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <>
      <BusinessHeader />
      <main className="flex-1 overflow-y-auto bg-[#F9F9FB] p-6 md:p-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-stone-900 font-display">Tim Bisnis</h1>
            <p className="text-xs text-stone-500 font-medium mt-1">
              Kelola anggota yang memiliki akses ke {business?.name ?? "bisnis Anda"}
            </p>
          </div>
          {canManage && (
            <button
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#B57A21] hover:bg-[#9B671A] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Tambah Anggota
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-stone-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-semibold">Memuat anggota...</span>
          </div>
        ) : members.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-stone-200/80 shadow-xs text-center">
            <Users className="w-10 h-10 text-stone-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-stone-700">Belum ada anggota</p>
            <p className="text-xs text-stone-400 mt-1">
              Tambahkan anggota untuk berbagi akses kelola bisnis.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs divide-y divide-stone-100">
            {members.map((member) => {
              const meta = ROLE_META[member.role] ?? ROLE_META.admin;
              const Icon = meta.icon;
              return (
                <div
                  key={member.user_id}
                  className="flex items-center justify-between gap-4 p-5"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-2xl bg-stone-100 text-stone-600 flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden">
                      {member.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={member.avatar_url}
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (member.name || "?").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-stone-900 truncate">
                          {member.name}
                        </span>
                        {member.is_current_user && (
                          <span className="px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-500 text-[9px] font-bold uppercase">
                            Anda
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-stone-400 font-medium mt-0.5">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${meta.badge}`}
                    >
                      <Icon className="w-3 h-3" />
                      {meta.label}
                    </span>
                    {canManage && !member.is_current_user && (
                      <button
                        onClick={() => handleRemove(member)}
                        disabled={removingId === member.user_id}
                        className="w-8 h-8 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
                        title="Hapus anggota"
                      >
                        {removingId === member.user_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pendingInvites.length > 0 && (
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-stone-900 font-display">
                Undangan Tertunda
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-[#B5781E] text-[10px] font-extrabold">
                {pendingInvites.length}
              </span>
            </div>
            <div className="divide-y divide-stone-100">
              {pendingInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-[#B5781E] flex items-center justify-center shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-stone-900 truncate">
                        {invite.email}
                      </p>
                      <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                        {ROLE_META[invite.role]?.label ?? invite.role} ·{" "}
                        {invite.expires_at
                          ? `Berlaku hingga ${new Date(
                              invite.expires_at
                            ).toLocaleDateString("id-ID")}`
                          : "Belum kedaluwarsa"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => revokeInvite(invite.id)}
                    disabled={revokingId === invite.id}
                    className="text-[11px] font-bold text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {revokingId === invite.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <X className="w-3.5 h-3.5" />
                    )}
                    Batalkan
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!canManage && !loading && members.length > 0 && (
          <div className="text-[11px] text-stone-500 bg-white border border-stone-200/80 rounded-2xl px-4 py-3">
            Hanya pemilik bisnis yang dapat menambah atau menghapus anggota.
          </div>
        )}

        {showInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-stone-900/50 backdrop-blur-xs"
              onClick={() => setShowInvite(false)}
            />
            <form
              onSubmit={handleInvite}
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-stone-900 font-display">
                  Tambah Anggota
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    onClick={() => setRole("admin")}
                    className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      role === "admin"
                        ? "border-violet-300 bg-violet-50 text-violet-700"
                        : "border-stone-200 text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    <ShieldCheck className="w-4 h-4 mx-auto mb-1" />
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("owner")}
                    className={`px-4 py-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      role === "owner"
                        ? "border-amber-300 bg-amber-50 text-[#B5781E]"
                        : "border-stone-200 text-stone-500 hover:bg-stone-50"
                    }`}
                  >
                    <Crown className="w-4 h-4 mx-auto mb-1" />
                    Pemilik
                  </button>
                </div>
                <p className="text-[10px] text-stone-400 mt-1.5">
                  Pemilik dapat mengelola anggota; admin hanya dapat mengelola
                  konten bisnis.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 rounded-2xl bg-[#B57A21] hover:bg-[#9B671A] text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Menambah...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Tambah Anggota
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
                <b>{ROLE_META[inviteResult.role ?? ""]?.label ?? inviteResult.role}</b>{" "}
                belum diterima. Kirimkan link ini kepada mereka. Link berlaku
                selama 7 hari.
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
                  {copied ? "Tersalin!" : "Salin"}
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
