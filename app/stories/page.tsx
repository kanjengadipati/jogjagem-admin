'use client';
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { BookOpen, ShieldCheck, Check, X } from 'lucide-react';

const mockStories = [
  { id: 1, author: 'Rina Wijaya', title: 'Hidden Waterfall Adventure in Gunung Kidul', excerpt: 'We discovered a secret waterfall deep in the karst landscape...', safety: 'Safe', date: '2 hours ago' },
  { id: 2, author: 'David Park', title: 'Solo Backpacking Through Borobudur', excerpt: 'Waking up at 4am to see the sunrise was worth every minute...', safety: 'Safe', date: '5 hours ago' },
  { id: 3, author: 'Lisa Chen', title: 'Night Market Food Trail on Malioboro', excerpt: 'The gudeg at 2am was surprisingly the best I ever had...', safety: 'Pending', date: '1 day ago' },
];

export default function StoriesPage() {
  const [stories, setStories] = useState(mockStories);

  const handleAction = (id: number, action: 'approve' | 'reject') => {
    setStories(prev => prev.map(s => s.id === id ? { ...s, safety: action === 'approve' ? 'Safe' : 'Rejected' } : s));
  };

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header activeId="stories" user={{ name: "Admin Jogjagem", role: "Super Admin", email: "admin@explorejogja.com", avatar: "https://unavatar.io/gravatar/elbhrecat@gmail.com" }} currentDate={new Date().toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" })} />
        <main className="flex-1 overflow-y-auto p-8">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Travel Stories Moderation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map(story => (
              <div key={story.id} className="bg-white rounded-xl shadow p-6 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{story.author}</p>
                    <p className="text-[10px] text-gray-400">{story.date}</p>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">{story.title}</h3>
                <p className="text-xs text-gray-600 flex-1">{story.excerpt}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-1">
                    <ShieldCheck className={`w-3 h-3 ${story.safety === 'Safe' ? 'text-success' : story.safety === 'Rejected' ? 'text-danger' : 'text-warning'}`} />
                    <span className={`text-[10px] font-bold ${story.safety === 'Safe' ? 'text-success' : story.safety === 'Rejected' ? 'text-danger' : 'text-warning'}`}>{story.safety}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleAction(story.id, 'approve')} className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition"><Check className="w-3 h-3" /></button>
                    <button onClick={() => handleAction(story.id, 'reject')} className="p-1.5 rounded-lg bg-danger/10 text-danger hover:bg-danger/20 transition"><X className="w-3 h-3" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
