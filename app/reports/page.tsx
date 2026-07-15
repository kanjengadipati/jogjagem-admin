'use client';
import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { FileText, Download, Calendar } from 'lucide-react';

export default function ReportsPage() {
  const reports = [
    { id: 1, title: 'Q2 2026 Tourism Analytics Report', type: 'Analytics', date: 'June 30, 2026', status: 'Ready' },
    { id: 2, title: 'FY2026 Revenue Ledger', type: 'Finance', date: 'June 15, 2026', status: 'Ready' },
    { id: 3, title: 'Monthly Partner Performance', type: 'Partners', date: 'June 1, 2026', status: 'Ready' },
    { id: 4, title: 'AI Recommendation Effectiveness', type: 'AI Insights', date: 'May 28, 2026', status: 'Ready' },
  ];

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeId="reports" user={{ name: "Admin Jogjagem", role: "Super Admin", email: "admin@explorejogja.com", avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com" }} currentDate={new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} />
        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Ecosystem Reports</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reports.map(report => (
              <div key={report.id} className="bg-white rounded-xl shadow p-6 border border-border hover:border-primary/20 transition-premium">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{report.title}</p>
                      <p className="text-[10px] text-gray-500">{report.type}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-success/10 text-success">{report.status}</span>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1 text-[10px] text-gray-400">
                    <Calendar className="w-3 h-3" /> {report.date}
                  </div>
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition">
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
