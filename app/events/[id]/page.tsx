'use client';
import React from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Header } from '../../components/Header';
import { Calendar, MapPin, Users, Ticket, ArrowLeft } from 'lucide-react';

export default function EventDetailPage() {
  const event = {
    name: 'Prambanan Jazz Festival 2026',
    date: 'August 15-17, 2026',
    venue: 'Prambanan Temple Complex',
    description: 'Annual jazz music festival held against the stunning backdrop of Prambanan Temple. Featuring international and local artists across 3 stages.',
    tickets: { sold: 4200, total: 6000, revenue: 'Rp 2.1B' },
    performers: ['Raisa', 'Tulus', 'Kahitna', 'Kahitna', 'Tohpati', 'Gangga'],
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeId="events" user={{ name: "Admin Jogjagem", role: "Super Admin", email: "admin@explorejogja.com", avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com" }} currentDate={new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="flex items-center gap-4 mb-6">
            <a href="/events" className="p-2 rounded-lg border border-border hover:bg-bg transition"><ArrowLeft className="w-4 h-4" /></a>
            <h2 className="text-2xl font-extrabold text-gray-900">{event.name}</h2>
          </div>

          <div className="bg-gradient-to-r from-primary to-secondary rounded-2xl p-8 text-white mb-6">
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> {event.date}</div>
              <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {event.venue}</div>
            </div>
            <p className="text-sm mt-4 text-white/80">{event.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <Ticket className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-gray-900">{event.tickets.sold.toLocaleString()}</p>
              <p className="text-xs text-gray-500">of {event.tickets.total.toLocaleString()} sold</p>
              <div className="w-full h-2 bg-bg rounded-full mt-2 overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${(event.tickets.sold / event.tickets.total) * 100}%` }} /></div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <Users className="w-6 h-6 text-success mx-auto mb-2" />
              <p className="text-2xl font-extrabold text-gray-900">{event.tickets.revenue}</p>
              <p className="text-xs text-gray-500">Total Revenue</p>
            </div>
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-sm font-bold text-gray-800 mb-3">Performers</h3>
              <div className="flex flex-wrap gap-2">
                {event.performers.map(p => (
                  <span key={p} className="px-2 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary">{p}</span>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
