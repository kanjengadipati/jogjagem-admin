"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  Trophy,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";
import type { BonusRule } from "@/types";

const TYPE_LABELS: Record<string, string> = {
  onboarding: "Onboarding",
  milestone: "Milestone",
};

const METRIC_LABELS: Record<string, string> = {
  tenant: "Tenant Aktif",
  transaction: "Transaksi",
};

function formatIDR(amount: number) {
  return `Rp ${Math.round(amount).toLocaleString("id-ID")}`;
}

interface FormState {
  type: "onboarding" | "milestone";
  metric: "tenant" | "transaction";
  tier: string;
  threshold: string;
  amount: string;
  is_active: boolean;
  effective_from: string;
  effective_until: string;
}

const EMPTY_FORM: FormState = {
  type: "onboarding",
  metric: "tenant",
  tier: "",
  threshold: "",
  amount: "",
  is_active: true,
  effective_from: "",
  effective_until: "",
};

function buildPayload(f: FormState): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    type: f.type,
    metric: f.metric,
    amount: Number(f.amount),
    is_active: f.is_active,
  };
  if (f.type === "milestone") {
    payload.tier = Number(f.tier);
    payload.threshold = Number(f.threshold);
  }
  if (f.effective_from) payload.effective_from = f.effective_from;
  if (f.effective_until) payload.effective_until = f.effective_until;
  return payload;
}

function validate(f: FormState): string | null {
  const amount = Number(f.amount);
  if (!f.amount || Number.isNaN(amount) || amount <= 0) {
    return "Jumlah bonus harus lebih besar dari 0";
  }
  if (f.type === "milestone") {
    const tier = Number(f.tier);
    const threshold = Number(f.threshold);
    if (!f.tier || Number.isNaN(tier) || tier <= 0) {
      return "Milestone rules memerlukan tier > 0";
    }
    if (!f.threshold || Number.isNaN(threshold) || threshold <= 0) {
      return "Milestone rules memerlukan threshold > 0";
    }
  }
  if (f.effective_from && f.effective_until && f.effective_from > f.effective_until) {
    return "effective_from tidak boleh setelah effective_until";
  }
  return null;
}

export default function BonusRulesPage() {
  const { showToast } = useToast();
  const [rules, setRules] = useState<BonusRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<BonusRule | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch("/api/sales/bonus-rules")
      .then((r) => r.json())
      .then((d) => setRules(d?.data ?? []))
      .catch(() => showToast("Error", "Gagal memuat bonus rules", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (rule: BonusRule) => {
    setEditing(rule);
    setForm({
      type: rule.type,
      metric: rule.metric,
      tier: rule.tier != null ? String(rule.tier) : "",
      threshold: rule.threshold != null ? String(rule.threshold) : "",
      amount: String(rule.amount),
      is_active: rule.is_active,
      effective_from: rule.effective_from ?? "",
      effective_until: rule.effective_until ?? "",
    });
    setModalOpen(true);
  };

  const submit = () => {
    const err = validate(form);
    if (err) {
      showToast("Invalid", err, "error");
      return;
    }
    setSaving(true);
    const url = editing ? `/api/sales/bonus-rules/${editing.id}` : "/api/sales/bonus-rules";
    const method = editing ? "PUT" : "POST";
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(buildPayload(form)),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d?.status === "success") {
          showToast("Success", editing ? "Bonus rule diperbarui" : "Bonus rule dibuat");
          setModalOpen(false);
          load();
        } else {
          showToast("Error", d?.message ?? "Gagal menyimpan bonus rule", "error");
        }
      })
      .catch(() => showToast("Error", "Gagal menyimpan bonus rule", "error"))
      .finally(() => setSaving(false));
  };

  const remove = (rule: BonusRule) => {
    if (!window.confirm(`Hapus rule "${TYPE_LABELS[rule.type]} ${rule.metric}" sebesar ${formatIDR(rule.amount)}?`)) {
      return;
    }
    fetch(`/api/sales/bonus-rules/${rule.id}`, { method: "DELETE" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.status === "success") {
          showToast("Success", "Bonus rule dihapus");
          load();
        } else {
          showToast("Error", d?.message ?? "Gagal menghapus rule", "error");
        }
      })
      .catch(() => showToast("Error", "Gagal menghapus rule", "error"));
  };

  const inputCls =
    "w-full bg-bg focus:bg-white text-xs px-3.5 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition duration-200 font-medium";
  const labelCls =
    "block text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1.5";

  return (
    <>
      <Header activeId="bonus-rules" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">
              Bonus Rules
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Aturan bonus sales — onboarding (flat) &amp; milestone (tiered, tier hanya dibayar saat threshold tercapai).
            </p>
          </div>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Tambah Rule
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-semibold">Memuat rules…</span>
          </div>
        ) : rules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <Trophy className="w-10 h-10" />
            <span className="text-sm font-semibold">Belum ada bonus rule</span>
          </div>
        ) : (
          <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-bg">
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Tipe</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Metrik</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Tier / Threshold</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Bonus</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Periode Efektif</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Aktif</th>
                    <th className="text-left px-4 py-3 font-bold text-gray-500 uppercase tracking-wide text-[10px]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rules.map((r) => (
                    <tr key={r.id} className="hover:bg-bg/60 transition-colors">
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            r.type === "milestone"
                              ? "bg-info/10 text-info"
                              : "bg-primary/10 text-primary"
                          }`}
                        >
                          {TYPE_LABELS[r.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-semibold">
                        {METRIC_LABELS[r.metric] ?? r.metric}
                      </td>
                      <td className="px-4 py-3 text-gray-700 font-mono">
                        {r.type === "milestone"
                          ? `≥ ${r.threshold} → tier ${r.tier}`
                          : "—"}
                      </td>
                      <td className="px-4 py-3 font-bold text-gray-800">{formatIDR(r.amount)}</td>
                      <td className="px-4 py-3 text-gray-500 font-mono">
                        {r.effective_from || r.effective_until
                          ? `${r.effective_from ?? "…"} → ${r.effective_until ?? "…"}`
                          : "Selalu"}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() =>
                            fetch(`/api/sales/bonus-rules/${r.id}`, {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                type: r.type,
                                metric: r.metric,
                                tier: r.tier ?? undefined,
                                threshold: r.threshold ?? undefined,
                                amount: r.amount,
                                is_active: !r.is_active,
                                effective_from: r.effective_from ?? undefined,
                                effective_until: r.effective_until ?? undefined,
                              }),
                            })
                              .then((res) => res.json())
                              .then((d) => {
                                if (d?.status === "success") load();
                                else showToast("Error", d?.message ?? "Gagal toggle", "error");
                              })
                              .catch(() => showToast("Error", "Gagal toggle", "error"))
                          }
                          className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors cursor-pointer ${
                            r.is_active ? "bg-success" : "bg-gray-300"
                          }`}
                          title={r.is_active ? "Aktif" : "Nonaktif"}
                        >
                          <span
                            className={`inline-block w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${
                              r.is_active ? "translate-x-5" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(r)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition cursor-pointer"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => remove(r)}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-danger hover:bg-danger/10 transition cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!loading && (
          <p className="text-xs text-gray-400 font-semibold">
            {rules.length} rule · Rules aktif dalam periode efektifnya yang dipakai saat settlement
          </p>
        )}
      </main>

      {/* Create / Edit modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-border w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h3 className="text-sm font-bold text-gray-900 font-display">
                {editing ? "Edit Bonus Rule" : "Tambah Bonus Rule"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Tipe Rule</label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm({ ...form, type: e.target.value as FormState["type"] })
                    }
                    className={inputCls + " cursor-pointer"}
                  >
                    <option value="onboarding">Onboarding (flat)</option>
                    <option value="milestone">Milestone (tiered)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Jumlah Bonus (Rp)</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    placeholder="50000"
                    className={inputCls}
                  />
                </div>
              </div>

              {form.type === "milestone" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>Metrik</label>
                    <select
                      value={form.metric}
                      onChange={(e) =>
                        setForm({ ...form, metric: e.target.value as FormState["metric"] })
                      }
                      className={inputCls + " cursor-pointer"}
                    >
                      <option value="tenant">Tenant Aktif</option>
                      <option value="transaction">Transaksi</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Tier</label>
                    <input
                      type="number"
                      value={form.tier}
                      onChange={(e) => setForm({ ...form, tier: e.target.value })}
                      placeholder="1"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Threshold</label>
                    <input
                      type="number"
                      value={form.threshold}
                      onChange={(e) => setForm({ ...form, threshold: e.target.value })}
                      placeholder="3"
                      className={inputCls}
                    />
                  </div>
                  <div className="flex items-end">
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      Bonus tier {form.tier || "n"} dibayar saat {form.metric === "tenant" ? "tenant aktif" : "transaksi"} mencapai {form.threshold || "n"}.
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Efektif Dari (opsional)</label>
                  <input
                    type="date"
                    value={form.effective_from}
                    onChange={(e) => setForm({ ...form, effective_from: e.target.value })}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Efektif Sampai (opsional)</label>
                  <input
                    type="date"
                    value={form.effective_until}
                    onChange={(e) => setForm({ ...form, effective_until: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 accent-primary"
                />
                <span className="text-xs font-semibold text-gray-700">Rule aktif</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border bg-bg/50">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-gray-600 hover:bg-white transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={submit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition disabled:opacity-60 cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editing ? "Simpan Perubahan" : "Buat Rule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
