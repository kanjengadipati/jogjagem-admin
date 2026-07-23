"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import {
  Flag,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";

interface ImageReport {
  ID: number;
  created_at: string;
  destination_id: string;
  destination_name: string;
  destination_location: string;
  image_url: string;
  user_id: number;
  user_name: string;
  reason: string;
  details: string;
  status: string;
}

interface ReportStats {
  pending: number;
  resolved: number;
  dismissed: number;
}

export default function ImageReportsPage() {
  const { showToast } = useToast();
  const [reports, setReports] = useState<ImageReport[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("");

  async function loadData() {
    setLoading(true);
    try {
      const query = filter ? `?status=${filter}` : "";
      const [reportsRes, statsRes] = await Promise.all([
        fetch(`${BACKEND_URL}/admin/image-reports${query}`).then((r) => r.json()),
        fetch(`${BACKEND_URL}/admin/image-reports/stats`).then((r) => r.json()),
      ]);
      setReports(reportsRes?.data ?? []);
      setStats(statsRes?.data ?? null);
    } catch {
      showToast("Error", "Failed to load reports", "error");
    }
    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, [filter]);

  async function handleAction(id: number, action: "resolve" | "dismiss") {
    try {
      const res = await fetch(`${BACKEND_URL}/admin/image-reports/${id}/${action}`, { method: "POST" });
      const body = await res.json();
      if (body?.status === "success") {
        showToast("Done", `Report ${action === "resolve" ? "resolved" : "dismissed"}`, "success");
        loadData();
      } else {
        showToast("Error", body?.message || "Action failed", "error");
      }
    } catch {
      showToast("Error", "Network error", "error");
    }
  }

  function getStatusBadge(status: string) {
    const base = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "pending":
        return <span className={`${base} bg-yellow-100 text-yellow-800`}><Clock className="w-3 h-3" />Pending</span>;
      case "resolved":
        return <span className={`${base} bg-green-100 text-green-800`}><CheckCircle className="w-3 h-3" />Resolved</span>;
      case "dismissed":
        return <span className={`${base} bg-slate-100 text-slate-600`}><XCircle className="w-3 h-3" />Dismissed</span>;
      default:
        return <span className={base}>{status}</span>;
    }
  }

  function getReasonIcon(reason: string) {
    switch (reason) {
      case "inappropriate":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "wrong_location":
        return <Flag className="w-4 h-4 text-orange-500" />;
      case "outdated":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <Flag className="w-4 h-4 text-slate-500" />;
    }
  }

  return (
    <>
      <Header activeId="image-reports" />
      <main className="flex-1 overflow-y-auto p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Image Reports</h1>
            <p className="text-sm text-slate-500 mt-1">Manage reported images from the mobile app</p>
          </div>
          <button onClick={loadData} className="p-2 hover:bg-slate-100 rounded-lg" title="Refresh">
            <RefreshCw className={`w-5 h-5 text-slate-500 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-sm font-medium text-slate-500">Pending</div>
              <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-sm font-medium text-slate-500">Resolved</div>
              <div className="text-2xl font-bold text-green-600 mt-1">{stats.resolved}</div>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 p-4">
              <div className="text-sm font-medium text-slate-500">Dismissed</div>
              <div className="text-2xl font-bold text-slate-600 mt-1">{stats.dismissed}</div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {["", "pending", "resolved", "dismissed"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {f === "" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left p-4 text-sm font-medium text-slate-500">ID</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">Image</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">Destination</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">Reporter</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">Reason</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">Details</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">Status</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">Date</th>
                  <th className="text-left p-4 text-sm font-medium text-slate-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
                      Loading...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-500">
                      No reports found
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.ID} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-sm font-mono text-slate-600">#{report.ID}</td>
                      <td className="p-4">
                        {report.image_url ? (
                          <a href={report.image_url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={report.image_url}
                              alt="Reported"
                              className="w-16 h-16 object-cover rounded-lg border border-slate-200 hover:border-primary transition-colors"
                            />
                          </a>
                        ) : (
                          <span className="text-slate-400 text-sm">No image</span>
                        )}
                      </td>
                      <td className="p-4">
                        {report.destination_name ? (
                          <div>
                            <a
                              href={`/destinations/${report.destination_id}`}
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              {report.destination_name}
                            </a>
                            {report.destination_location && (
                              <div className="text-xs text-slate-500 mt-0.5">{report.destination_location}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm font-mono text-slate-500">{report.destination_id}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-900">{report.user_name || "Anonymous"}</div>
                        <div className="text-xs text-slate-500">ID: {report.user_id}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {getReasonIcon(report.reason)}
                          <span className="text-sm capitalize">{report.reason.replace("_", " ")}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-slate-600 max-w-[200px] truncate">{report.details || "-"}</div>
                      </td>
                      <td className="p-4">{getStatusBadge(report.status)}</td>
                      <td className="p-4 text-sm text-slate-500">
                        {new Date(report.created_at).toLocaleDateString("id-ID")}
                      </td>
                      <td className="p-4">
                        {report.status === "pending" && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(report.ID, "resolve")}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Resolve
                            </button>
                            <button
                              onClick={() => handleAction(report.ID, "dismiss")}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              Dismiss
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
