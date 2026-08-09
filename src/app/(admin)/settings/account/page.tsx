"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { useRole } from "@/contexts/RoleContext";
import { User, Lock, Coins, Mail, Phone, Save, Loader2 } from "lucide-react";

export default function AccountSettingsPage() {
  const role = useRole();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/profile")
      .then((r) => r.json())
      .then((res: { status?: string; data?: { name?: string; email?: string; role?: string; phone_number?: string; avatar_url?: string } }) => {
        if (res.status !== "success" || !res.data) return;
        setEmail(res.data.email || "");
        setPhone(res.data.phone_number || "");
        setAvatar(res.data.avatar_url || "");
        setName(res.data.name || "");
      })
      .catch(() => showToast("Error", "Gagal memuat profil", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveProfile = () => {
    if (name.trim().length < 3) {
      showToast("Error", "Nama minimal 3 karakter", "error");
      return;
    }
    setProfileSaving(true);
    fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), phone_number: phone.trim() }),
    })
      .then((r) => r.json())
      .then((res: { status?: string; message?: string }) => {
        if (res.status === "success") {
          showToast("Success", "Profil berhasil diperbarui");
        } else {
          showToast("Error", res?.message ?? "Gagal memperbarui profil", "error");
        }
      })
      .catch(() => showToast("Error", "Gagal memperbarui profil", "error"))
      .finally(() => setProfileSaving(false));
  };

  const savePassword = () => {
    if (!currentPassword || newPassword.length < 8) {
      showToast("Error", "Password baru minimal 8 karakter", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Error", "Konfirmasi password tidak cocok", "error");
      return;
    }
    setPasswordSaving(true);
    fetch("/api/auth/change-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
      }),
    })
      .then((r) => r.json())
      .then((res: { status?: string; message?: string }) => {
        if (res.status === "success") {
          showToast("Success", "Password berhasil diubah");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        } else {
          showToast("Error", res?.message ?? "Gagal mengubah password", "error");
        }
      })
      .catch(() => showToast("Error", "Gagal mengubah password", "error"))
      .finally(() => setPasswordSaving(false));
  };

  return (
    <>
      <Header activeId="settings" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div>
          <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Account Settings</h2>
          <p className="text-xs text-gray-500 mt-1">Update your profile information and change your password.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-gray-800 font-display">Profile Information</h4>
              </div>

              <div className="flex items-center gap-4">
                {role === "sales" && !avatar ? (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center text-primary shrink-0">
                    <Coins className="w-8 h-8" />
                  </div>
                ) : avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="Profile" className="w-16 h-16 rounded-xl object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-bg flex items-center justify-center text-gray-400 shrink-0">
                    <User className="w-8 h-8" />
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-800 font-display capitalize">{role || "Admin"}</span>
                  <span className="text-[11px] text-gray-500">{email}</span>
                </div>
              </div>

              {loading ? (
                <p className="text-xs text-gray-400">Loading...</p>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Full Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Email</label>
                    <div className="flex items-center gap-2 bg-bg text-xs px-4 py-3 rounded-xl border border-transparent font-medium text-gray-500">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>{email}</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Email tidak dapat diubah.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Phone Number</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+62..."
                      className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={saveProfile}
                  disabled={profileSaving || loading}
                  className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer hover:opacity-90 transition-premium disabled:opacity-60"
                >
                  {profileSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  {profileSaving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-card border border-border shadow-soft space-y-5">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-bold text-gray-800 font-display">Change Password</h4>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={savePassword}
                  disabled={passwordSaving}
                  className="flex items-center gap-1.5 bg-primary text-white text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer hover:opacity-90 transition-premium disabled:opacity-60"
                >
                  {passwordSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                  {passwordSaving ? "Saving..." : "Change Password"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
