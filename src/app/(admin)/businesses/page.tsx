"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { 
  Building2, 
  CheckCircle, 
  XCircle, 
  Search, 
  Loader2, 
  AlertTriangle,
  Store
} from "lucide-react";

interface Business {
  id: string;
  name: string;
  category: string;
  status: string;
  submitted_at: string;
}

export default function AdminBusinessesPage() {
  const { showToast } = useToast();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filtered, setFiltered] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    loadBusinesses();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      businesses.filter(b => 
        b.name.toLowerCase().includes(q) || 
        b.category.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q)
      )
    );
  }, [search, businesses]);

  async function loadBusinesses() {
    setLoading(true);
    try {
      const res = await fetch("/api/businesses/pending");
      const data = await res.json().catch(() => ({}));
      const list: Business[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setBusinesses(list);
    } catch {
      showToast("Error", "Failed to load pending businesses", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: string, action: "approve" | "reject", reason?: string) {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/businesses/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: reason ? JSON.stringify({ reason }) : undefined
      });
      if (res.ok) {
        showToast("Success", `Business ${action}d successfully`, "success");
        loadBusinesses();
      } else {
        const d = await res.json().catch(() => ({}));
        showToast("Error", d?.message || `Failed to ${action} business`, "error");
      }
    } catch {
      showToast("Error", `Failed to ${action} business`, "error");
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header activeId="businesses" />
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Store className="w-6 h-6 text-gold-600" />
              <span>Pending Business Approvals</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">Manage new business registrations.</p>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search business..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white w-64"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              <span>Loading pending businesses...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-xs">No pending businesses found.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-4 py-3">Business</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Submitted</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-gray-900">{b.name}</td>
                    <td className="px-4 py-3 text-gray-600">{b.category}</td>
                    <td className="px-4 py-3 text-gray-500">{new Date(b.submitted_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleAction(b.id, "approve")}
                        disabled={processingId === b.id}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt("Rejection reason:");
                          if (reason) handleAction(b.id, "reject", reason);
                        }}
                        disabled={processingId === b.id}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg text-xs disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
