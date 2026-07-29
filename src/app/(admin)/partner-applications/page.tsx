"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/components/Toast";

interface PartnerApplication {
  id: string;
  business_name: string;
  category: string;
  location?: string;
  phone?: string;
  status: string;
  created_at: string;
}

export default function PartnerApplicationsPage() {
  const { showToast } = useToast();
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetch("/api/partner-applications")
      .then((r) => r.json())
      .then((d) => setApplications(d?.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  async function approve(id: string) {
    const res = await fetch(`/api/partner-applications/${id}/approve`, { method: "POST" });
    if (res.ok) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
      showToast("Disetujui", "Partner draft otomatis dibuat, akun di-upgrade ke role partner", "success");
    } else {
      showToast("Error", "Gagal menyetujui aplikasi", "error");
    }
  }

  async function reject(id: string) {
    const res = await fetch(`/api/partner-applications/${id}/reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: rejectReason }),
    });
    if (res.ok) {
      setApplications((prev) => prev.filter((a) => a.id !== id));
      setRejectingId(null);
      setRejectReason("");
      showToast("Ditolak", "Aplikasi ditolak", "success");
    } else {
      showToast("Error", "Gagal menolak aplikasi", "error");
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24 text-gray-400 gap-3">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span className="text-sm font-semibold">Memuat aplikasi...</span>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-stone-900">Partner Applications</h1>
        <p className="text-sm text-stone-500">
          Review kelayakan bisnis sebelum akun partner dibuat. Setelah disetujui, partner melengkapi listing-nya sendiri sebelum masuk antrian review utama.
        </p>
      </div>

      {applications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
          <Clock className="w-10 h-10" />
          <span className="text-sm font-semibold">Tidak ada aplikasi menunggu review</span>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 divide-y divide-stone-100">
          {applications.map((app) => (
            <div key={app.id} className="p-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-stone-800">{app.business_name}</p>
                <p className="text-xs text-stone-500">{app.category} · {app.location || "-"} · {app.phone || "-"}</p>
              </div>
              <div className="flex items-center gap-2">
                {rejectingId === app.id ? (
                  <>
                    <input
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Alasan penolakan..."
                      className="px-2 py-1.5 border border-stone-200 rounded-lg text-xs w-48"
                    />
                    <button onClick={() => reject(app.id)} disabled={!rejectReason.trim()}
                      className="px-3 py-1.5 bg-red-500 text-white text-xs font-medium rounded-lg disabled:opacity-50 cursor-pointer">
                      Kirim
                    </button>
                    <button onClick={() => setRejectingId(null)} className="px-2 py-1.5 text-xs text-stone-400 cursor-pointer">
                      Batal
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => approve(app.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg hover:bg-emerald-600 cursor-pointer">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button onClick={() => setRejectingId(app.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-stone-200 text-stone-600 text-xs font-medium rounded-lg hover:bg-stone-50 cursor-pointer">
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
