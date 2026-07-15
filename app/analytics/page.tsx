'use client';
import React from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { BarChart3, TrendingUp, Users, MapPin } from 'lucide-react';

export default function AnalyticsPage() {
  const stats = [
    { label: 'Monthly Visitors', value: '124,582', change: '+12.3%', icon: Users, color: 'text-primary' },
    { label: 'Revenue Growth', value: 'Rp 2.4B', change: '+8.7%', icon: TrendingUp, color: 'text-success' },
    { label: 'Active Destinations', value: '847', change: '+24', icon: MapPin, color: 'text-info' },
    { label: 'AI Recommendations', value: '56,291', change: '+34.1%', icon: BarChart3, color: 'text-secondary' },
  ];

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeId="analytics" user={{ name: "Admin Jogjagem", role: "Super Admin", email: "admin@explorejogja.com", avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com" }} currentDate={new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} />
        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Ecosystem Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map(stat => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="bg-white rounded-xl shadow p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                    <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full">{stat.change}</span>
                  </div>
                  <p className="text-2xl font-extrabold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Visitor Growth Trend</h3>
              <svg viewBox="0 0 400 150" className="w-full">
                <defs>
                  <linearGradient id="chartGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#8B5E3C" stopOpacity="0.2"/>
                    <stop offset="100%" stopColor="#8B5E3C" stopOpacity="0"/>
                  </linearGradient>
                </defs>
                <path d="M0,120 Q50,100 100,90 T200,60 T300,40 T400,20 V150 H0 Z" fill="url(#chartGrad)" />
                <path d="M0,120 Q50,100 100,90 T200,60 T300,40 T400,20" fill="none" stroke="#8B5E3C" strokeWidth="2" />
                {[0,1,2,3,4,5,6].map(i => (
                  <circle key={i} cx={i * 66.6} cy={120 - i * 16} r="3" fill="#8B5E3C" />
                ))}
              </svg>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-sm font-bold text-gray-800 mb-4">Top Destinations by Views</h3>
              {[
                { name: 'Borobudur Temple', views: 45200, pct: 92 },
                { name: 'Prambanan Temple', views: 38100, pct: 78 },
                { name: 'Malioboro Street', views: 31400, pct: 64 },
                { name: 'Taman Sari Castle', views: 22800, pct: 47 },
                { name: 'Jomblang Cave', views: 18200, pct: 37 },
              ].map(d => (
                <div key={d.name} className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700">{d.name}</span>
                    <span className="text-[10px] text-gray-500">{d.views.toLocaleString()} views</span>
                  </div>
                  <div className="w-full h-2 bg-bg rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${d.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
