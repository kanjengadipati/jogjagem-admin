"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { FileSpreadsheet, UserPlus, Eye, Trash2, Users, X, Shield } from "lucide-react";
import type { User, Role } from "@/types";

export default function UsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [addForm, setAddForm] = useState({ name: "", email: "", password: "", role: "user", phone: "" });
  const [editForm, setEditForm] = useState({ name: "", email: "", role: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then(r => r.json()),
      fetch("/api/roles").then(r => r.json()),
    ]).then(([u, r]) => {
      setUsers(Array.isArray(u?.data) ? u.data : []);
      setRoles(Array.isArray(r?.data) ? r.data : []);
    }).catch(() => showToast("Error", "Failed to load users", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exportCSV() {
    const rows = [["Name","Email","Role","Verified"]];
    users.forEach(u => rows.push([u.name, u.email, u.role ?? "user", String(!!u.email_verified)]));
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(rows.map(r => r.join(",")).join("\n"));
    a.download = "users.csv";
    a.click();
    showToast("Export", "CSV downloaded", "success");
  }

  async function submitAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError(""); setSubmitting(true);
    try {
      const res = await fetch("/api/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(addForm) });
      const d = await res.json();
      if (res.ok) {
        setUsers(prev => [...prev, d.data]);
        setShowAdd(false);
        setAddForm({ name: "", email: "", password: "", role: "user", phone: "" });
        showToast("Success", "User created", "success");
      } else setAddError(d?.message ?? "Failed to create user");
    } catch { setAddError("Network error"); }
    finally { setSubmitting(false); }
  }

  async function submitEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editUser) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/users/${editUser.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(editForm) });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...editForm } : u));
        setEditUser(null);
        showToast("Updated", "User updated", "success");
      } else showToast("Error", "Update failed", "error");
    } catch { showToast("Error", "Network error", "error"); }
    finally { setSubmitting(false); }
  }

  async function deleteUser(u: User) {
    if (!confirm(`Delete user ${u.name}?`)) return;
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
      if (res.ok) { setUsers(prev => prev.filter(x => x.id !== u.id)); showToast("Deleted", `${u.name} removed`, "success"); }
      else showToast("Error", "Delete failed", "error");
    } catch { showToast("Error", "Network error", "error"); }
  }

  return (
    <>
      <Header activeId="users" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">

        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">User Management</h2>
            <p className="text-xs text-gray-500 mt-1">Manage platform users, roles, and access permissions.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={exportCSV} className="flex items-center gap-2 bg-white hover:bg-bg border border-border text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-apple transition-premium cursor-pointer">
              <FileSpreadsheet className="w-4 h-4 text-gray-500" /><span>Export CSV</span>
            </button>
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
              <UserPlus className="w-4 h-4" /><span>Add User</span>
            </button>
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="p-6 border-b border-border bg-bg/20 flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Platform Users & Operators</h4>
            <span className="text-xs font-bold text-primary">{users.length} users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">User</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Email Verified</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-center">Last Login</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {loading ? (
                  <tr><td colSpan={6} className="py-16 text-center text-gray-400">Loading users…</td></tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-3">
                        <Users className="w-10 h-10" />
                        <span className="text-sm font-semibold">No users found</span>
                        <span className="text-xs text-gray-400">Backend may be unreachable or unauthorized.</span>
                      </div>
                    </td>
                  </tr>
                ) : users.map(u => (
                  <tr key={u.id} className="hover:bg-bg/40 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                          {u.name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <span className="text-xs font-bold text-gray-900 font-display block">{u.name}</span>
                          <span className="text-[9px] text-gray-400">{u.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded uppercase">{u.role || "user"}</span>
                    </td>
                    <td className="py-4 px-6">
                      {u.email_verified
                        ? <span className="text-success font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success inline-block" /> Verified</span>
                        : <span className="text-warning font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning inline-block" /> Pending</span>
                      }
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="bg-success/10 text-success text-[10px] font-bold px-2.5 py-0.5 rounded-full">Active</span>
                    </td>
                    <td className="py-4 px-6 text-center font-mono text-gray-500">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Never"}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setEditUser(u); setEditForm({ name: u.name, email: u.email, role: u.role ?? "user", phone: u.phone ?? "" }); }} className="p-1.5 rounded-lg border border-border hover:bg-bg text-gray-500 cursor-pointer transition">
                          <Eye className="w-4 h-4" />
                        </button>
                        {u.role !== "superadmin" && (
                          <button onClick={() => deleteUser(u)} className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-gray-500 hover:text-red-600 cursor-pointer transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-5 border-t border-border">
            <span className="text-xs text-gray-500 font-semibold">Showing {users.length} users</span>
          </div>
        </div>

        {/* Roles section */}
        {roles.length > 0 && (
          <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
            <div className="p-6 border-b border-border bg-bg/20">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Available Roles</h4>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map(role => {
                const perms = Array.isArray(role.permissions) ? role.permissions : JSON.parse((role.permissions as string) || "[]");
                return (
                  <div key={role.id} className="p-4 rounded-2xl border border-border hover:border-primary/20 hover:bg-primary/5 transition-premium">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Shield className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-gray-800 font-display">{role.name}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {perms.slice(0, 4).map((p: string) => (
                        <span key={p} className="bg-bg text-gray-500 text-[8px] font-bold px-1.5 py-0.5 rounded">{p}</span>
                      ))}
                      {perms.length > 4 && <span className="bg-bg text-gray-400 text-[8px] font-bold px-1.5 py-0.5 rounded">+{perms.length - 4}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Add User Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold font-display text-gray-900">Add New User</h3>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-bg text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            {addError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">{addError}</div>}
            <form onSubmit={submitAdd} className="space-y-4">
              {[["Full Name","name","text",true],["Email Address","email","email",true],["Password","password","password",true],["Phone","phone","text",false]].map(([label,key,type,req]) => (
                <div key={key as string}>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">{label as string}</label>
                  <input type={type as string} required={req as boolean} value={addForm[key as keyof typeof addForm]} onChange={e => setAddForm(f => ({...f, [key as string]: e.target.value}))} className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Role</label>
                <select value={addForm.role} onChange={e => setAddForm(f => ({...f, role: e.target.value}))} className="w-full bg-bg text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
                  <option value="user">User</option>
                  {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 border border-border text-gray-600 py-3 rounded-xl text-xs font-semibold hover:bg-bg transition">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white py-3 rounded-xl text-xs font-semibold shadow-premium transition">
                  {submitting ? "Creating…" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold font-display text-gray-900">Edit User</h3>
              <button onClick={() => setEditUser(null)} className="p-1.5 rounded-lg hover:bg-bg text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={submitEdit} className="space-y-4">
              {[["Full Name","name"],["Email","email"],["Phone","phone"]].map(([label,key]) => (
                <div key={key}>
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">{label}</label>
                  <input value={editForm[key as keyof typeof editForm]} onChange={e => setEditForm(f => ({...f, [key]: e.target.value}))} className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium" />
                </div>
              ))}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Role</label>
                <select value={editForm.role} onChange={e => setEditForm(f => ({...f, role: e.target.value}))} className="w-full bg-bg text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-semibold text-gray-700 cursor-pointer">
                  <option value="user">User</option>
                  {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditUser(null)} className="flex-1 border border-border text-gray-600 py-3 rounded-xl text-xs font-semibold hover:bg-bg transition">Cancel</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white py-3 rounded-xl text-xs font-semibold shadow-premium transition">
                  {submitting ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
