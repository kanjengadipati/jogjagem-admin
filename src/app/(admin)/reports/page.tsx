import Header from "@/components/Header";
import { FileText, Download } from "lucide-react";

const REPORTS = [
  { name:"Monthly Tourism Summary — June 2026",    type:"Monthly", size:"2.4 MB", date:"Jul 1, 2026",  status:"Ready" },
  { name:"Q2 2026 Destination Performance Report", type:"Quarterly","size":"5.1 MB", date:"Jun 30, 2026", status:"Ready" },
  { name:"AI Recommendation Audit — Week 28",      type:"Weekly",  size:"892 KB", date:"Jul 13, 2026", status:"Ready" },
  { name:"User Growth Analytics — July 2026",      type:"Monthly", size:"1.8 MB", date:"Jul 15, 2026", status:"Generating" },
  { name:"Partner Revenue Report — H1 2026",       type:"Biannual","size":"8.3 MB", date:"Jun 30, 2026", status:"Ready" },
  { name:"Review Moderation Summary — Week 28",    type:"Weekly",  size:"340 KB", date:"Jul 13, 2026", status:"Ready" },
];

export default function ReportsPage() {
  return (
    <>
      <Header activeId="reports" />
      <main className="flex-1 overflow-y-auto p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold font-display text-gray-900 tracking-tight">Reports & Exports</h2>
            <p className="text-xs text-gray-500 mt-1">Access generated performance reports, analytics exports, and audit logs.</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2.5 rounded-xl text-xs font-semibold shadow-premium transition cursor-pointer">
            <FileText className="w-4 h-4" /><span>Generate Report</span>
          </button>
        </div>
        <div className="bg-white rounded-card border border-border shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-bg/40 text-[10px] font-bold text-gray-400 uppercase tracking-widest font-display">
                  <th className="py-4 px-6">Report</th>
                  <th className="py-4 px-6">Type</th>
                  <th className="py-4 px-6">Size</th>
                  <th className="py-4 px-6">Generated</th>
                  <th className="py-4 px-6 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs text-gray-700 font-medium">
                {REPORTS.map(r => (
                  <tr key={r.name} className="hover:bg-bg/40 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary"><FileText className="w-4 h-4" /></div>
                        <span className="text-xs font-bold text-gray-900 font-display">{r.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6"><span className="bg-bg text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded">{r.type}</span></td>
                    <td className="py-4 px-6 font-mono text-gray-500">{r.size}</td>
                    <td className="py-4 px-6 text-gray-500">{r.date}</td>
                    <td className="py-4 px-6 text-center">
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${r.status === "Ready" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>{r.status}</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      {r.status === "Ready" && (
                        <button className="flex items-center gap-1.5 text-primary text-[11px] font-bold hover:bg-primary/5 px-3 py-1.5 rounded-lg transition cursor-pointer border border-primary/20 ml-auto">
                          <Download className="w-3.5 h-3.5" /> Download
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
