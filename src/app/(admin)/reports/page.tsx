"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { useToast } from "@/components/Toast";
import { FileText, Download, RefreshCw } from "lucide-react";
import { BACKEND_URL } from "@/lib/constants";

interface ReportItem {
  name: string;
  type: string;
  description: string;
  value: number;
  unit: string;
}

const TYPE_BADGE: Record<string, string> = {
  Count: "bg-blue-100 text-blue-700",
  Average: "bg-yellow-100 text-yellow-700",
  Category: "bg-purple-100 text-purple-700",
};

function formatValue(item: ReportItem): string {
  if (item.unit === "rating_x100") return (item.value / 100).toFixed(1);
  return item.value.toLocaleString();
}

function formatUnit(item: ReportItem): string {
  if (item.unit === "rating_x100") return "avg";
  return item.unit;
}

function generateCSV(reports: ReportItem[]): string {
  const header = "Name,Type,Description,Value,Unit\n";
  const rows = reports.map(r =>
    `"${r.name}","${r.type}","${r.description}",${r.value},"${r.unit}"`
  ).join("\n");
  return header + rows;
}

export default function ReportsPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ReportItem[]>([]);

  async function loadData() {
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/admin/analytics/reports`).then(r => r.json());
      setReports(res?.data ?? []);
    } catch {
      showToast("Error", "Failed to load reports", "error");
    }
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  function handleDownload() {
    if (reports.length === 0) return;
    const csv = generateCSV(reports);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jogjagem-report-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Downloaded", "Report CSV exported", "success");
  }

  return (
    <>
      <Header activeId="reports" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Reports & Exports</h2>
            <p className="text-xs text-gray-500 mt-1">Platform data summary exported from the database in real-time.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadData} className="p-2 hover:bg-gray-100 rounded-lg transition" title="Refresh">
              <RefreshCw className={`w-5 h-5 text-gray-500 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={handleDownload}
              disabled={reports.length === 0}
              className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" /><span>Export CSV</span>
            </button>
          </div>
        </div>

        {loading && reports.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading reports...
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-border shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-gray-50/80 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                    <th className="py-4 px-6">Report</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Value</th>
                    <th className="py-4 px-6">Unit</th>
                    <th className="py-4 px-6">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                  {reports.map((r, i) => (
                    <tr key={`${r.name}-${i}`} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <FileText className="w-4 h-4" />
                          </div>
                          <span className="text-xs font-bold text-gray-900 font-display">{r.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${TYPE_BADGE[r.type] || "bg-gray-100 text-gray-600"}`}>
                          {r.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono text-gray-900 font-bold">{formatValue(r)}</td>
                      <td className="py-4 px-6 font-mono text-gray-500">{formatUnit(r)}</td>
                      <td className="py-4 px-6 text-gray-500 max-w-xs">{r.description}</td>
                    </tr>
                  ))}
                  {reports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-400">No report data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
