"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { Shield, Pencil, X, Loader2, Lock } from "lucide-react";

interface RolePermission {
  id: number;
  permission: string;
}

interface Role {
  id: number;
  name: string;
  role_permissions?: RolePermission[];
}

interface Permission {
  id: number;
  name: string;
}

function rolePerms(role: Role): string[] {
  return (role.role_permissions ?? []).map(rp => rp.permission);
}

export default function RolesPage() {
  const { showToast } = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [allPermissions, setAllPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [perms, setPerms] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/roles").then(r => r.json()),
      fetch("/api/permissions").then(r => r.json()),
    ]).then(([rolesData, permsData]) => {
      setRoles(Array.isArray(rolesData?.data) ? rolesData.data : []);
      const pList = Array.isArray(permsData?.data)
        ? permsData.data.map((p: Permission) => p.name)
        : [];
      setAllPermissions(pList);
    }).catch(() => showToast("Error", "Failed to load roles", "error"))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openEdit(role: Role) {
    setEditRole(role);
    setPerms(rolePerms(role));
  }

  function togglePerm(p: string) {
    setPerms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  async function savePermissions(e: React.FormEvent) {
    e.preventDefault();
    if (!editRole) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/roles/${editRole.id}/permissions`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissions: perms }),
      });
      const d = await res.json();
      if (res.ok) {
        // Update local state with new permissions
        setRoles(prev => prev.map(r => r.id === editRole.id ? {
          ...r,
          role_permissions: perms.map((p, i) => ({ id: i, permission: p })),
        } : r));
        setEditRole(null);
        showToast("Updated", `Permissions for "${editRole.name}" saved`, "success");
      } else {
        showToast("Error", d?.message ?? "Update failed", "error");
      }
    } catch {
      showToast("Error", "Network error", "error");
    } finally {
      setSubmitting(false);
    }
  }

  // Group permissions by resource prefix for better UX
  const grouped = allPermissions.filter((p): p is string => typeof p === 'string' && p.length > 0).reduce<Record<string, string[]>>((acc, p) => {
    const prefix = p.split(".")[0];
    if (!acc[prefix]) acc[prefix] = [];
    acc[prefix].push(p);
    return acc;
  }, {});

  return (
    <>
      <Header activeId="roles" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Role Management</h2>
            <p className="text-xs text-gray-500 mt-1">View platform roles and manage their granular permission sets.</p>
          </div>
          <div className="flex items-center gap-2 bg-bg border border-border text-gray-500 px-3 py-2 rounded-xl text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Roles are system-managed. Edit permissions only.</span>
          </div>
        </div>

        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border bg-bg/20 flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest font-display">Platform Roles & Permissions</h4>
            <span className="text-xs font-bold text-primary">{roles.length} roles</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Permissions</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {loading ? (
                  <tr><td colSpan={3} className="py-16 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span>Loading roles…</span></div>
                  </td></tr>
                ) : roles.length === 0 ? (
                  <tr><td colSpan={3} className="py-16 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-3"><Shield className="w-10 h-10" /><span className="text-sm font-semibold">No roles found</span></div>
                  </td></tr>
                ) : roles.map(role => {
                  const rperms = rolePerms(role);
                  return (
                    <tr key={role.id} className="hover:bg-bg/40 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Shield className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-gray-900 font-display block capitalize">{role.name}</span>
                            <span className="text-[10px] text-gray-400">{rperms.length} permission{rperms.length !== 1 ? "s" : ""}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex flex-wrap gap-1 max-w-lg">
                          {rperms.length > 0
                            ? rperms.map(p => (
                                <span key={p} className="bg-primary/10 text-primary text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">{p}</span>
                              ))
                            : <span className="text-gray-400 text-[10px]">No permissions assigned</span>
                          }
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => openEdit(role)}
                          className="p-1.5 rounded-lg border border-border hover:bg-bg text-gray-500 cursor-pointer transition">
                          <Pencil className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Edit Permissions Modal */}
      {editRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-border shadow-2xl w-full max-w-lg mx-4 p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold font-display text-gray-900">Edit Permissions</h3>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">Role: <span className="font-bold text-gray-700">{editRole.name}</span></p>
              </div>
              <button onClick={() => setEditRole(null)} className="p-1.5 rounded-lg hover:bg-bg text-gray-400 hover:text-gray-600 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={savePermissions} className="space-y-5">
              {allPermissions.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-400 text-xs py-4"><Loader2 className="w-4 h-4 animate-spin" /><span>Loading permissions…</span></div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(grouped).map(([prefix, pList]) => (
                    <div key={prefix}>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">{prefix}</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {pList.map(p => (
                          <label key={p} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-premium ${perms.includes(p) ? "border-primary/30 bg-primary/5" : "border-border hover:bg-bg"}`}>
                            <input type="checkbox" checked={perms.includes(p)} onChange={() => togglePerm(p)}
                              className="rounded text-primary focus:ring-primary w-4 h-4 flex-shrink-0" />
                            <span className="text-xs font-semibold text-gray-700 truncate">{p}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[10px] text-gray-400 font-semibold">{perms.length} permission{perms.length !== 1 ? "s" : ""} selected</span>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setEditRole(null)}
                    className="px-4 py-2.5 border border-border text-gray-600 rounded-xl text-xs font-semibold hover:bg-bg transition">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="px-5 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-60 text-white rounded-xl text-xs font-semibold shadow-premium transition flex items-center gap-2">
                    {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {submitting ? "Saving…" : "Save Permissions"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
