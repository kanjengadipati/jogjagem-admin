"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { ShieldPlus, Shield, Pencil, Trash2, X } from "lucide-react";
import type { Role } from "@/types";

const ALL_PERMISSIONS = [
  "destinations.read","destinations.write",
  "users.read","users.write",
  "reviews.moderate","reports.view","settings.manage",
];

export default function RolesPage() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState("");
  const [perms, setPerms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [addError, setAddError] = useState("");

  useEffect(() => {
    fetch("/api/roles").then(r => r.json())
      .then(d => setRoles(Array.isArray(d?.data) ? d.data : []))
      .catch(() => showToast("Error", "Failed to load roles", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openEdit(role: Role) {
    setEditRole(role);
    setRoleName(role.name);
    setPerms(Array.isArray(role.permissions) ? role.permissions : JSON.parse((role.permissions as string) || "[]"));
    setAddError("");
  }

  function openAdd() {
    setEditRole(null); setRoleName(""); setPerms([]); setAddError(""); setShowAdd(true);
  }

  function togglePerm(p: string) {
    setPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setAddError(""); setSubmitting(true);
    const body = JSON.stringify({ name: roleName, permissions: perms });
    try {
      let res: Response;
      if (editRole) {
        res = await fetch(`/api/roles/${editRole.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body });
      } else {
        res = await fetch("/api/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body });
      }
      const d = await res.json();
      if (res.ok) {
        if (editRole) {
          setRoles(prev => prev.map(r => r.id === editRole.id ? { ...r, name: roleName, permissions: perms } : r));
          setEditRole(null);
          showToast("Updated", "Role updated", "success");
        } else {
          setRoles(prev => [...prev, d.data]);
          setShowAdd(false);
          showToast("Created", "Role created", "success");
        }
      } else setAddError(d?.message ?? "Operation failed");
    } catch { setAddError("Network error"); }
    finally { setSubmitting(false); }
  }

  async function deleteRole(role: Role) {
    if (!confirm(`Delete role "${role.name}"?`)) return;
    try {
      const res = await fetch(`/api/roles/${role.id}`, { method: "DELETE" });
      if (res.ok) { setRoles(prev => prev.filter(r => r.id !== role.id)); showToast("Deleted", `Role "${role.name}" removed`, "success"); }
      else showToast("Error", "Delete failed", "error");
    } catch { showToast("Error", "Network error", "error"); }
  }

  const PermForm = () => (
    <form onSubmit={submit} className="space-y-4">
      {addError && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">{addError}</div>}
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Role Name</label>
        <input value={roleName} onChange={e => setRoleName(e.target.value)} required minLength={3} className="w-full bg-bg focus:bg-white text-xs px-4 py-3 rounded-xl border border-transparent focus:border-border outline-none font-medium" placeholder="e.g. Editor" />
      </div>
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1.5">Permissions</label>
        <div className="grid grid-cols-2 gap-2">
          {ALL_PERMISSIONS.map(p => (
            <label key={p} className="flex items-center gap-2 p-2 rounded-lg hover:bg-bg transition cursor-pointer">
              <input type="checkbox" checked={perms.includes(p)} onChange={() => togglePerm(p)} className="rounded text-primary focus:ring-primary w-4 h-4" />
              <span className="text-xs font-semibold text-gray-700">{p}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => { setShowAdd(false); setEditRole(null); }} className="flex-1 border border-border text-gray-600 py-3 rounded-xl text-xs font-semibold hover:bg-bg transition">Cancel</button>
        <button type="submit" disabled={submitting} className="flex-1 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white py-3 rounded-xl text-xs font-semibold shadow-premium transition">
          {submitting ? "Saving…" : editRole ? "Save Changes" : "Create Role"}
        </button>
      </div>
    </form>
  );

  return (
    <>
      <Header activeId="roles" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Role Management</h2>
            <p className="text-xs text-gray-500 mt-1">Define roles and manage granular permissions for platform access.</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <ShieldPlus className="w-4 h-4" /><span>Add Role</span>
          </button>
        </div>

        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="p-6 border-b border-border bg-bg/20 flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Platform Roles & Permissions</h4>
            <span className="text-xs font-bold text-primary">{roles.length} roles</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Role Name</th>
                  <th className="py-4 px-6">Permissions</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {loading ? (
                  <tr><td colSpan={3} className="py-16 text-center text-gray-400">Loading roles…</td></tr>
                ) : roles.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-16 text-center text-gray-400">
                      <div className="flex flex-col items-center gap-3">
                        <Shield className="w-10 h-10" />
                        <span className="text-sm font-semibold">No roles found</span>
                        <span className="text-xs">Create a role to get started.</span>
                      </div>
                    </td>
                  </tr>
                ) : roles.map(role => {
                  const rperms = Array.isArray(role.permissions) ? role.permissions : JSON.parse((role.permissions as string) || "[]");
                  return (
                    <tr key={role.id} className="hover:bg-bg/40 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Shield className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-gray-900 font-display">{role.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1">
                          {rperms.length > 0
                            ? rperms.map((p: string) => <span key={p} className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded uppercase">{p}</span>)
                            : <span className="text-gray-400 text-[10px]">No permissions</span>
                          }
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => openEdit(role)} className="p-1.5 rounded-lg border border-border hover:bg-bg text-gray-500 cursor-pointer transition">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => deleteRole(role)} className="p-1.5 rounded-lg border border-border hover:bg-red-50 text-gray-500 hover:text-red-600 cursor-pointer transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add / Edit Modal */}
      {(showAdd || editRole) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-md mx-4 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-extrabold font-display text-gray-900">{editRole ? "Edit Role" : "Add New Role"}</h3>
              <button onClick={() => { setShowAdd(false); setEditRole(null); }} className="p-1.5 rounded-lg hover:bg-bg text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>
            <PermForm />
          </div>
        </div>
      )}
    </>
  );
}
