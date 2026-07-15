'use client';
import React, { useState, useEffect } from 'react';
import { Menu, Search, Bell, ChevronRight, ChevronDown, Settings, Users, LogOut, ExternalLink } from 'lucide-react';

interface HeaderProps {
  activeId: string;
  user: { name: string; role: string; email: string; avatar: string };
  currentDate: string;
}

export const Header: React.FC<HeaderProps> = ({ activeId, user, currentDate }) => {
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [liveTime, setLiveTime] = useState('');

  useEffect(() => {
    const update = () => {
      setLiveTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  const closeAll = () => { setNotificationOpen(false); setProfileOpen(false); };

  return (
    <header className="h-20 border-b border-border bg-white px-8 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button className="md:hidden p-2 rounded-lg border border-border hover:bg-bg text-gray-500 hover:text-text cursor-pointer">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 font-medium font-display">
          <span>Jogjagem</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-600 capitalize">{activeId}</span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative hidden lg:block w-72">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
          <input type="text" placeholder="Search operations..." className="w-full bg-bg hover:bg-bg/80 focus:bg-white text-xs pl-9 pr-12 py-2.5 rounded-xl border border-transparent focus:border-border outline-none transition-premium font-medium" />
          <span className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <kbd className="text-[9px] font-sans font-bold bg-white border border-border text-gray-400 px-1.5 py-0.5 rounded-md leading-none shadow-apple">⌘K</kbd>
          </span>
        </div>

        <div className="hidden xl:flex flex-col text-right">
          <span className="text-xs font-semibold text-gray-800">{currentDate}</span>
          <span className="text-[10px] text-gray-500 font-mono">{liveTime}</span>
        </div>

        <div className="relative">
          <button onClick={() => { setNotificationOpen(!notificationOpen); setProfileOpen(false); }} className="p-2.5 rounded-xl border border-border hover:bg-bg text-gray-500 hover:text-text cursor-pointer transition-premium relative">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-danger border-2 border-white"></span>
          </button>
          {notificationOpen && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white border border-border shadow-soft p-4 flex flex-col gap-3 z-50">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h4 className="text-xs font-bold text-gray-800 font-display">System Notifications</h4>
                <span className="bg-danger/10 text-danger text-[9px] font-bold px-1.5 py-0.5 rounded-full">3 New</span>
              </div>
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                <div className="flex gap-3 items-start hover:bg-bg p-1.5 rounded-xl transition-premium cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-danger mt-1.5 flex-shrink-0"></span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 leading-tight">Review pending moderation</p>
                    <p className="text-[10px] text-gray-500">Sarah Johnson flagged for spam (Score: 82%)</p>
                    <span className="text-[9px] text-gray-400">2 mins ago</span>
                  </div>
                </div>
                <div className="flex gap-3 items-start hover:bg-bg p-1.5 rounded-xl transition-premium cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-warning mt-1.5 flex-shrink-0"></span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 leading-tight">New Tourism Partner Registration</p>
                    <p className="text-[10px] text-gray-500">Heha Ocean View requests listing verification</p>
                    <span className="text-[9px] text-gray-400">1 hour ago</span>
                  </div>
                </div>
                <div className="flex gap-3 items-start hover:bg-bg p-1.5 rounded-xl transition-premium cursor-pointer">
                  <span className="w-2.5 h-2.5 rounded-full bg-success mt-1.5 flex-shrink-0"></span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 leading-tight">AI Insights Compiled</p>
                    <p className="text-[10px] text-gray-500">Weekly tourism reports ready for review</p>
                    <span className="text-[9px] text-gray-400">Yesterday</span>
                  </div>
                </div>
              </div>
              <a href="/reviews" className="text-center text-xs font-bold text-primary hover:text-primary-dark mt-2 pt-2 border-t border-border block">View All Operations</a>
            </div>
          )}
        </div>

        <div className="relative">
          <button onClick={() => { setProfileOpen(!profileOpen); setNotificationOpen(false); }} className="flex items-center gap-3 p-1.5 pr-3 rounded-xl border border-border hover:bg-bg cursor-pointer transition-premium">
            <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-lg object-cover" referrerPolicy="no-referrer" />
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-gray-800 font-display leading-none mb-0.5">{user.name}</span>
              <span className="text-[10px] text-gray-500">{user.role}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 hidden sm:block" />
          </button>
          
          {profileOpen && (
            <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-white border border-border shadow-soft p-2 flex flex-col z-50">
              <div className="p-3 border-b border-border">
                <p className="text-xs font-bold text-gray-800">{user.name}</p>
                <p className="text-[10px] text-gray-500">{user.email}</p>
              </div>
              <a href="/settings" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-600 hover:bg-bg hover:text-text transition-premium mt-1">
                <Settings className="w-4 h-4" />
                <span>Account Settings</span>
              </a>
              <a href="/users" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-gray-600 hover:bg-bg hover:text-text transition-premium">
                <Users className="w-4 h-4" />
                <span>Team Directory</span>
              </a>
              <a href="/logout" className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-danger hover:bg-danger/10 transition-premium mt-1">
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
